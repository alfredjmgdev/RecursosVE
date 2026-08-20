import { Inject, Injectable } from '@nestjs/common';
import {
  CalculateOptimalRouteCommand,
  CalculateOptimalRouteUseCase,
  RouteCalculationResult,
  RoutePoint,
  VehicleType,
  Waypoint,
} from '../../domain/ports/in/calculate-optimal-route.use-case';
import { REPORT_REPOSITORY_PORT } from '../../domain/ports/out/report-repository.port';
import type { ReportRepositoryPort } from '../../domain/ports/out/report-repository.port';

@Injectable()
export class CalculateOptimalRouteService implements CalculateOptimalRouteUseCase {
  constructor(
    @Inject(REPORT_REPOSITORY_PORT)
    private readonly reportRepository: ReportRepositoryPort,
  ) {}

  async execute(command: CalculateOptimalRouteCommand): Promise<RouteCalculationResult> {
    const { origen, destino, tipoVehiculo = VehicleType.CAMION_350, evitarZonasPeligro = true } = command;

    // 1. Calculate Geodesic distance (Haversine formula)
    const directKm = this.calculateHaversineDistance(origen.lat, origen.lng, destino.lat, destino.lng);
    // Tortuosity / road factor in mountainous Venezuelan terrain (~1.35x direct distance)
    const totalKm = Math.round(directKm * 1.35 * 10) / 10;

    // 2. Query active emergency reports / hazards near the route
    const activeReports = await this.reportRepository.findAllActive();
    const alertasViales: string[] = [];
    let hazardCount = 0;

    activeReports.forEach((report) => {
      const distToOrigin = this.calculateHaversineDistance(report.zona.lat, report.zona.lng, origen.lat, origen.lng);
      const distToDest = this.calculateHaversineDistance(report.zona.lat, report.zona.lng, destino.lat, destino.lng);
      
      if (distToDest < 15 || distToOrigin < 15) {
        hazardCount++;
        alertasViales.push(`Alerta de Emergencia cerca de ${report.zona.campamento}: ${report.recurso.item} (${report.recurso.categoria})`);
      }
    });

    // 3. Determine Nivel de Riesgo
    let nivelRiesgo: 'BAJO' | 'MEDIO' | 'ALTO' | 'CRITICO' = 'BAJO';
    if (hazardCount >= 3) {
      nivelRiesgo = 'CRITICO';
      alertasViales.push('Ruta con múltiples emergencias activas. Se recomienda vehículo 4x4 o escolta humanitaria.');
    } else if (hazardCount >= 1) {
      nivelRiesgo = 'MEDIO';
      alertasViales.push('Precaución por derrumbes o fallas estructurales en el sector.');
    }

    // 4. Calculate ETA according to Vehicle Type & Road Risk
    const speeds: Record<VehicleType, number> = {
      [VehicleType.CAMION_350]: 55,
      [VehicleType.PICKUP_4X4]: 65,
      [VehicleType.FURGON_PEQUEÑO]: 60,
      [VehicleType.AMBULANCIA]: 75,
    };

    const baseSpeed = speeds[tipoVehiculo] || 60;
    const speedPenalty = nivelRiesgo === 'CRITICO' ? 0.6 : nivelRiesgo === 'MEDIO' ? 0.8 : 1.0;
    const effectiveSpeed = baseSpeed * speedPenalty;

    const horasViaje = totalKm / effectiveSpeed;
    const tiempoEstimadoMinutos = Math.round(horasViaje * 60);

    // 5. Generate Waypoints (Path geometry curve for Map rendering)
    const waypoints = this.generateRouteWaypoints(origen, destino, totalKm);

    return {
      distanciaKm: totalKm,
      tiempoEstimadoMinutos,
      nivelRiesgo,
      tipoVehiculoRecomendado: hazardCount > 1 ? VehicleType.PICKUP_4X4 : tipoVehiculo,
      alertasViales,
      waypoints,
      origen,
      destino,
      calculadoEn: new Date(),
    };
  }

  private calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth radius in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  private generateRouteWaypoints(origen: RoutePoint, destino: RoutePoint, totalKm: number): Waypoint[] {
    const waypoints: Waypoint[] = [];
    const steps = 8;

    // Perpendicular offset to simulate natural road curvature
    const midLat = (origen.lat + destino.lat) / 2;
    const midLng = (origen.lng + destino.lng) / 2;
    const curveOffset = (destino.lng - origen.lng) * 0.15;

    waypoints.push({
      lat: origen.lat,
      lng: origen.lng,
      instruccion: `Punto de partida: ${origen.nombre || 'Centro de Acopio Logístico'}`,
    });

    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      // Quadratic Bezier interpolation for realistic road curve
      const lat = (1 - t) * (1 - t) * origen.lat + 2 * (1 - t) * t * (midLat + curveOffset * 0.5) + t * t * destino.lat;
      const lng = (1 - t) * (1 - t) * origen.lng + 2 * (1 - t) * t * (midLng - curveOffset * 0.5) + t * t * destino.lng;

      let instruccion = `Tramo ${i}: Avance por arteria vial principal (${Math.round((totalKm / steps) * i)} km acumulados)`;
      if (i === Math.floor(steps / 2)) {
        instruccion = `Punto Intermedio: Verificación de puesto de control de la PNBD / Protección Civil`;
      }

      waypoints.push({ lat, lng, instruccion });
    }

    waypoints.push({
      lat: destino.lat,
      lng: destino.lng,
      instruccion: `Llegada a destino: ${destino.nombre || 'Campamento de Refugio de Emergencia'}`,
    });

    return waypoints;
  }
}
