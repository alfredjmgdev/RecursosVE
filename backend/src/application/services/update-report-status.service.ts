import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UpdateReportStatusUseCase } from '../../domain/ports/in/update-report-status.use-case';
import { NeedReport, ReportStatus } from '../../domain/entities/report.entity';
import { REPORT_REPOSITORY_PORT } from '../../domain/ports/out/report-repository.port';
import type { ReportRepositoryPort } from '../../domain/ports/out/report-repository.port';

@Injectable()
export class UpdateReportStatusService implements UpdateReportStatusUseCase {
  constructor(
    @Inject(REPORT_REPOSITORY_PORT)
    private readonly reportRepository: ReportRepositoryPort,
  ) {}

  async execute(id: string, status: ReportStatus): Promise<NeedReport> {
    const report = await this.reportRepository.findById(id);
    if (!report) {
      throw new NotFoundException(`Reporte con ID ${id} no encontrado`);
    }

    return this.reportRepository.updateStatus(id, status);
  }
}
