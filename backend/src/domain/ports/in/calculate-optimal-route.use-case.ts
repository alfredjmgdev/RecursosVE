export enum VehicleType {
  CAMION_350 = 'CAMION_350', // 60 km/h avg
  PICKUP_4X4 = 'PICKUP_4X4', // 70 km/h avg, ideal para terrenos difíciles
  FURGON_PEQUEÑO = 'FURGON_PEQUEÑO', // 65 km/h avg
  AMBULANCIA = 'AMBULANCIA', // 80 km/h avg
}

export interface RoutePoint {
  lat: number;
  lng: number;
  nombre?: string;
}

export interface CalculateOptimalRouteCommand {
  origen: RoutePoint;
  destino: RoutePoint;
  tipoVehiculo?: VehicleType;
  evitarZonasPeligro?: boolean;
}

export interface Waypoint {
  lat: number;
  lng: number;
  instruccion?: string;
}

export interface RouteCalculationResult {
  distanciaKm: number;
  tiempoEstimadoMinutos: number;
  nivelRiesgo: 'BAJO' | 'MEDIO' | 'ALTO' | 'CRITICO';
  tipoVehiculoRecomendado: VehicleType;
  alertasViales: string[];
  waypoints: Waypoint[];
  origen: RoutePoint;
  destino: RoutePoint;
  calculadoEn: Date;
}

export const CALCULATE_OPTIMAL_ROUTE_USE_CASE = 'CALCULATE_OPTIMAL_ROUTE_USE_CASE';

export interface CalculateOptimalRouteUseCase {
  execute(command: CalculateOptimalRouteCommand): Promise<RouteCalculationResult>;
}
