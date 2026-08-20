import { NeedReport } from '../../entities/report.entity';

export interface ReportWithScore {
  report: NeedReport;
  criticalityScore: number;
}

export const GET_ACTIVE_REPORTS_USE_CASE = 'GET_ACTIVE_REPORTS_USE_CASE';

export interface GetActiveReportsUseCase {
  execute(): Promise<ReportWithScore[]>;
}
