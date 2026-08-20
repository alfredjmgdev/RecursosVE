import { Inject, Injectable } from '@nestjs/common';
import { GetActiveReportsUseCase, ReportWithScore } from '../../domain/ports/in/get-active-reports.use-case';
import { REPORT_REPOSITORY_PORT } from '../../domain/ports/out/report-repository.port';
import type { ReportRepositoryPort } from '../../domain/ports/out/report-repository.port';

@Injectable()
export class GetActiveReportsService implements GetActiveReportsUseCase {
  constructor(
    @Inject(REPORT_REPOSITORY_PORT)
    private readonly reportRepository: ReportRepositoryPort,
  ) {}

  async execute(): Promise<ReportWithScore[]> {
    const reports = await this.reportRepository.findAllActive();

    const reportsWithScores = reports.map((report) => ({
      report,
      criticalityScore: report.calculateCriticalityScore(),
    }));

    return reportsWithScores.sort((a, b) => b.criticalityScore - a.criticalityScore);
  }
}
