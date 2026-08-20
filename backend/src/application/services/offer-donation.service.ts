import { Inject, Injectable } from '@nestjs/common';
import { MatchResult, OfferDonationCommand, OfferDonationUseCase } from '../../domain/ports/in/offer-donation.use-case';
import { DonationOffer, DonationStatus } from '../../domain/entities/donation.entity';
import { NeedReport, ReportStatus } from '../../domain/entities/report.entity';
import { DONATION_REPOSITORY_PORT } from '../../domain/ports/out/donation-repository.port';
import type { DonationRepositoryPort } from '../../domain/ports/out/donation-repository.port';
import { REPORT_REPOSITORY_PORT } from '../../domain/ports/out/report-repository.port';
import type { ReportRepositoryPort } from '../../domain/ports/out/report-repository.port';

@Injectable()
export class OfferDonationService implements OfferDonationUseCase {
  constructor(
    @Inject(DONATION_REPOSITORY_PORT)
    private readonly donationRepository: DonationRepositoryPort,
    @Inject(REPORT_REPOSITORY_PORT)
    private readonly reportRepository: ReportRepositoryPort,
  ) {}

  async execute(command: OfferDonationCommand): Promise<MatchResult> {
    const activeReports = await this.reportRepository.findAllActive();

    // Filter reports matching resource category and sort by Criticality Score
    const matchingReports = activeReports
      .filter((r) => r.recurso.categoria === command.categoria)
      .sort((a, b) => b.calculateCriticalityScore() - a.calculateCriticalityScore());

    let assignedReport: NeedReport | null = null;

    if (matchingReports.length > 0) {
      assignedReport = matchingReports[0];
    }

    const donation = new DonationOffer(
      `don_${Date.now()}`,
      command.donanteNombre,
      command.categoria,
      command.item,
      command.cantidad,
      command.unidad,
      command.origenUbicacion,
      command.fechaDisponible,
      assignedReport ? DonationStatus.ASIGNADA : DonationStatus.OFERTADA,
      assignedReport?.id,
    );

    const savedDonation = await this.donationRepository.save(donation);

    if (assignedReport) {
      // Update report status to EN_TRANSITO or PARCIAL
      assignedReport.metadataUrgencia.donacionesEnTransito =
        (assignedReport.metadataUrgencia.donacionesEnTransito || 0) + command.cantidad;
      
      if (assignedReport.metadataUrgencia.donacionesEnTransito >= assignedReport.recurso.cantidadRequerida) {
        assignedReport.status = ReportStatus.EN_TRANSITO;
      } else {
        assignedReport.status = ReportStatus.PARCIAL;
      }

      await this.reportRepository.save(assignedReport);
    }

    return {
      donation: savedDonation,
      reporteAsignado: assignedReport
        ? {
            id: assignedReport.id,
            campamento: assignedReport.zona.campamento,
            necesidadCritica: `${assignedReport.recurso.cantidadRequerida} ${assignedReport.recurso.unidad} de ${assignedReport.recurso.item}`,
            distanciaEstimadaKm: 142, // Simulated transport distance (e.g. Caracas -> La Guaira)
            contacto: 'Eduardo Medina (04142246958)',
            instruccionesEntrega: 'Entregar en el Centro de Recepción del Campamento o Punto de Acopio de Emergencia.',
          }
        : undefined,
    };
  }
}
