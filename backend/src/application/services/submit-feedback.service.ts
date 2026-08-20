import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReportFeedbackOrmEntity } from '../../infrastructure/adapters/out/persistence/postgres/entities/report-feedback.orm-entity';
import { SubmitFeedbackCommand, SubmitFeedbackUseCase, FeedbackResult } from '../../domain/ports/in/submit-feedback.use-case';

@Injectable()
export class SubmitFeedbackService implements SubmitFeedbackUseCase {
  constructor(
    @InjectRepository(ReportFeedbackOrmEntity)
    private readonly feedbackRepository: Repository<ReportFeedbackOrmEntity>,
  ) {}

  async execute(command: SubmitFeedbackCommand): Promise<FeedbackResult> {
    const feedback = this.feedbackRepository.create({
      reportId: command.reportId,
      calificacion: command.calificacion,
      resultado: command.resultado,
      comentario: command.comentario,
      categoriaInsumo: command.categoriaInsumo,
      estadoNombre: command.estadoNombre,
    });

    const saved = await this.feedbackRepository.save(feedback);

    return {
      id: saved.id,
      reportId: saved.reportId,
      calificacion: saved.calificacion,
      resultado: saved.resultado,
      comentario: saved.comentario,
      createdAt: saved.createdAt,
    };
  }
}
