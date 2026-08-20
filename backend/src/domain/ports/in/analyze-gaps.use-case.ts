import { ActionPlan } from '../../entities/action-plan.entity';
import { NeedReport } from '../../entities/report.entity';

export interface GapAnalysisResult {
  report: NeedReport;
  criticalityScore: number;
  brechaReal: number; // Real Gap calculated
  inventarioLocalDisponibleKm?: number;
  accionRecomendada: ActionPlan;
}

export const ANALYZE_GAPS_USE_CASE = 'ANALYZE_GAPS_USE_CASE';

export interface AnalyzeGapsUseCase {
  execute(): Promise<GapAnalysisResult[]>;
}
