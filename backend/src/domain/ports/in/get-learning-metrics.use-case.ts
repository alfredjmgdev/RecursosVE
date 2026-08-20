import { LearningMetricsSummary } from '../../entities/learning-metric.entity';

export const GET_LEARNING_METRICS_USE_CASE = 'GET_LEARNING_METRICS_USE_CASE';

export interface GetLearningMetricsUseCase {
  execute(): Promise<LearningMetricsSummary>;
}
