import { Body, Controller, Get, Inject, Post } from '@nestjs/common';
import { ANALYZE_GAPS_USE_CASE } from '../../../../domain/ports/in/analyze-gaps.use-case';
import type { AnalyzeGapsUseCase } from '../../../../domain/ports/in/analyze-gaps.use-case';
import { GET_LEARNING_METRICS_USE_CASE } from '../../../../domain/ports/in/get-learning-metrics.use-case';
import type { GetLearningMetricsUseCase } from '../../../../domain/ports/in/get-learning-metrics.use-case';
import { SUBMIT_FEEDBACK_USE_CASE } from '../../../../domain/ports/in/submit-feedback.use-case';
import type { SubmitFeedbackUseCase, SubmitFeedbackCommand } from '../../../../domain/ports/in/submit-feedback.use-case';

@Controller('analytics')
export class AnalyticsController {
  constructor(
    @Inject(ANALYZE_GAPS_USE_CASE)
    private readonly analyzeGapsUseCase: AnalyzeGapsUseCase,
    @Inject(GET_LEARNING_METRICS_USE_CASE)
    private readonly getLearningMetricsUseCase: GetLearningMetricsUseCase,
    @Inject(SUBMIT_FEEDBACK_USE_CASE)
    private readonly submitFeedbackUseCase: SubmitFeedbackUseCase,
  ) {}

  @Get('gaps')
  async getGapAnalysis() {
    return this.analyzeGapsUseCase.execute();
  }

  @Get('learning-metrics')
  async getLearningMetrics() {
    return this.getLearningMetricsUseCase.execute();
  }

  @Post('feedback')
  async submitFeedback(@Body() body: SubmitFeedbackCommand) {
    return this.submitFeedbackUseCase.execute(body);
  }
}
