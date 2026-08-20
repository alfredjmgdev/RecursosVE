import { Inject, Injectable } from '@nestjs/common';
import { CreateReportCommand, CreateReportUseCase } from '../../domain/ports/in/create-report.use-case';
import { NeedReport, ReportStatus } from '../../domain/entities/report.entity';
import { REPORT_REPOSITORY_PORT } from '../../domain/ports/out/report-repository.port';
import type { ReportRepositoryPort } from '../../domain/ports/out/report-repository.port';

@Injectable()
export class CreateReportService implements CreateReportUseCase {
  constructor(
    @Inject(REPORT_REPOSITORY_PORT)
    private readonly reportRepository: ReportRepositoryPort,
  ) {}

  async execute(command: CreateReportCommand): Promise<NeedReport> {
    const reportId = `req_${Date.now()}`;
    const report = new NeedReport(
      reportId,
      command.tipo,
      command.zona,
      command.recurso,
      command.metadataUrgencia,
      ReportStatus.SIN_COBERTURA,
      new Date(),
    );

    return this.reportRepository.save(report);
  }
}
