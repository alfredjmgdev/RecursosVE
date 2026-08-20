export const SUBMIT_FEEDBACK_USE_CASE = 'SUBMIT_FEEDBACK_USE_CASE';

export interface SubmitFeedbackCommand {
  reportId: string;
  calificacion: number;
  resultado: 'EXITOSO' | 'DEMANDA_SUBESTIMADA' | 'RETRASO_LOGISTICO' | 'RECURSO_EQUIVOCADO';
  comentario?: string;
  categoriaInsumo?: string;
  estadoNombre?: string;
}

export interface FeedbackResult {
  id: string;
  reportId: string;
  calificacion: number;
  resultado: string;
  comentario?: string;
  createdAt: Date;
}

export interface SubmitFeedbackUseCase {
  execute(command: SubmitFeedbackCommand): Promise<FeedbackResult>;
}
