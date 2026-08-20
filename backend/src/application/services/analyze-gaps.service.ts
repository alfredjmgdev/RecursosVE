import { Inject, Injectable } from '@nestjs/common';
import { AnalyzeGapsUseCase, GapAnalysisResult } from '../../domain/ports/in/analyze-gaps.use-case';
import { REPORT_REPOSITORY_PORT } from '../../domain/ports/out/report-repository.port';
import type { ReportRepositoryPort } from '../../domain/ports/out/report-repository.port';
import { INVENTORY_REPOSITORY_PORT } from '../../domain/ports/out/inventory-repository.port';
import type { InventoryRepositoryPort } from '../../domain/ports/out/inventory-repository.port';
import { DONATION_REPOSITORY_PORT } from '../../domain/ports/out/donation-repository.port';
import type { DonationRepositoryPort } from '../../domain/ports/out/donation-repository.port';
import { ActionPlan, ActionPlanType } from '../../domain/entities/action-plan.entity';
import { CommunityInventory } from '../../domain/entities/inventory.entity';
import { ReportStatus } from '../../domain/entities/report.entity';
import { HaversineDistance } from '../../domain/services/haversine-distance.service';

@Injectable()
export class AnalyzeGapsService implements AnalyzeGapsUseCase {
  constructor(
    @Inject(REPORT_REPOSITORY_PORT)
    private readonly reportRepository: ReportRepositoryPort,
    @Inject(INVENTORY_REPOSITORY_PORT)
    private readonly inventoryRepository: InventoryRepositoryPort,
    @Inject(DONATION_REPOSITORY_PORT)
    private readonly donationRepository: DonationRepositoryPort,
  ) {}

  async execute(): Promise<GapAnalysisResult[]> {
    const activeReports = await this.reportRepository.findAllActive();
    const results: GapAnalysisResult[] = [];

    for (const report of activeReports) {
      const criticalityScore = report.calculateCriticalityScore();
      const localInventories = await this.inventoryRepository.findAvailableByCategory(report.recurso.categoria);

      // Find closest local inventory <= 2.0 km radius
      let closestInventory: CommunityInventory | null = null;
      let minDistanceKm = Infinity;

      for (const inv of localInventories) {
        if (inv.isExpired()) continue;
        const dist = HaversineDistance.calculateKm(
          report.zona.lat,
          report.zona.lng,
          inv.ubicacion.lat,
          inv.ubicacion.lng,
        );

        if (dist <= 2.0 && dist < minDistanceKm) {
          minDistanceKm = dist;
          closestInventory = inv;
        }
      }

      let brechaReal = report.recurso.cantidadRequerida;
      let actionPlan: ActionPlan;

      if (report.status === ReportStatus.CUBIERTA || (report.status as string) === 'CUBIERTO') {
        brechaReal = 0;
        actionPlan = new ActionPlan(
          `act_${Date.now()}_${report.id}`,
          report.id,
          ActionPlanType.SOLICITAR_DONACION_EXTERNA,
          'Requerimiento Cubierto',
          `Requerimiento resuelto con éxito. Insumos entregados y verificados en ${report.zona.campamento}.`,
        );
      } else if (closestInventory) {
        // Priority 1: Local Redistribution (<= 2 km)
        const covered = Math.min(brechaReal, closestInventory.cantidadDisponible);
        brechaReal = Math.max(0, brechaReal - covered);

        actionPlan = new ActionPlan(
          `act_${Date.now()}_${report.id}`,
          report.id,
          ActionPlanType.REDISTRIBUCION_LOCAL,
          'Redistribución Local Activada',
          `Llevá ${covered} ${report.recurso.unidad} de ${report.recurso.item} al ${report.zona.campamento}. Disponible en ${closestInventory.ubicacion.campamento} (${minDistanceKm} km).`,
          minDistanceKm,
          closestInventory.id,
          closestInventory.contacto,
        );
      } else if (report.metadataUrgencia.donacionesEnTransito && report.metadataUrgencia.donacionesEnTransito > 0) {
        // Priority 2: In-Transit Donation
        const inTransit = report.metadataUrgencia.donacionesEnTransito;
        brechaReal = Math.max(0, brechaReal - inTransit);

        actionPlan = new ActionPlan(
          `act_${Date.now()}_${report.id}`,
          report.id,
          ActionPlanType.ESPERAR_DONACION_EN_TRANSITO,
          'Donación en Tránsito',
          `No enviés más ${report.recurso.item}; ya hay ${inTransit} ${report.recurso.unidad} en camino hacia ${report.zona.campamento}.`,
        );
      } else {
        // Priority 3: External Donation Needed
        actionPlan = new ActionPlan(
          `act_${Date.now()}_${report.id}`,
          report.id,
          ActionPlanType.SOLICITAR_DONACION_EXTERNA,
          'Necesidad Crítica Publicada',
          `${report.zona.campamento} necesita ${brechaReal} ${report.recurso.unidad} de ${report.recurso.item}. Publicada para donación externa.`,
        );
      }

      results.push({
        report,
        criticalityScore,
        brechaReal,
        inventarioLocalDisponibleKm: closestInventory ? minDistanceKm : undefined,
        accionRecomendada: actionPlan,
      });
    }

    // Return ordered by Criticality Score descending
    return results.sort((a, b) => b.criticalityScore - a.criticalityScore);
  }
}
