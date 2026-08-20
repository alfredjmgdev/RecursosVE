import { NeedReport } from '../../entities/report.entity';

export const REPORT_REPOSITORY_PORT = 'REPORT_REPOSITORY_PORT';

export interface ReportRepositoryPort {
  save(report: NeedReport): Promise<NeedReport>;
  findById(id: string): Promise<NeedReport | null>;
  findAllActive(): Promise<NeedReport[]>;
  updateStatus(id: string, status: NeedReport['status']): Promise<NeedReport>;
}
