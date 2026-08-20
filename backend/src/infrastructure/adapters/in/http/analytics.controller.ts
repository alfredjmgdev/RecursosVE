import { Controller, Get, Inject } from '@nestjs/common';
import { ANALYZE_GAPS_USE_CASE } from '../../../../domain/ports/in/analyze-gaps.use-case';
import type { AnalyzeGapsUseCase } from '../../../../domain/ports/in/analyze-gaps.use-case';
import { GET_LEARNING_METRICS_USE_CASE } from '../../../../domain/ports/in/get-learning-metrics.use-case';
import type { GetLearningMetricsUseCase } from '../../../../domain/ports/in/get-learning-metrics.use-case';

@Controller('analytics')
export class AnalyticsController {
  constructor(
    @Inject(ANALYZE_GAPS_USE_CASE)
    private readonly analyzeGapsUseCase: AnalyzeGapsUseCase,
    @Inject(GET_LEARNING_METRICS_USE_CASE)
    private readonly getLearningMetricsUseCase: GetLearningMetricsUseCase,
  ) {}

  @Get('gaps')
  async getGapAnalysis() {
    return this.analyzeGapsUseCase.execute();
  }

  @Get('learning-metrics')
  async getLearningMetrics() {
    return this.getLearningMetricsUseCase.execute();
  }
}
