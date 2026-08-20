import { NeedReport, ReportStatus } from '../../entities/report.entity';

export const UPDATE_REPORT_STATUS_USE_CASE = 'UPDATE_REPORT_STATUS_USE_CASE';

export interface UpdateReportStatusUseCase {
  execute(id: string, status: ReportStatus): Promise<NeedReport>;
}
