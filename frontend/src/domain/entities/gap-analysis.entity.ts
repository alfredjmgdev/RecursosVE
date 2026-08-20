import { NeedReport } from './report.entity';

export enum ActionPlanType {
  REDISTRIBUCION_LOCAL = 'REDISTRIBUCION_LOCAL',
  DONACION_DIRIGIDA = 'DONACION_DIRIGIDA',
  ESPERAR_DONACION_EN_TRANSITO = 'ESPERAR_DONACION_EN_TRANSITO',
  SOLICITAR_DONACION_EXTERNA = 'SOLICITAR_DONACION_EXTERNA',
}

export interface ActionPlan {
  id: string;
  reportId: string;
  tipoAccion: ActionPlanType;
  titulo: string;
  instruccionDetallada: string;
  distanciaKm?: number;
  origenId?: string;
  contacto?: string;
}

export interface GapAnalysisResult {
  report: NeedReport;
  criticalityScore: number;
  brechaReal: number;
  inventarioLocalDisponibleKm?: number;
  accionRecomendada: ActionPlan;
}
