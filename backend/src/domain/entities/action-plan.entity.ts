export enum ActionPlanType {
  REDISTRIBUCION_LOCAL = 'REDISTRIBUCION_LOCAL',
  DONACION_DIRIGIDA = 'DONACION_DIRIGIDA',
  ESPERAR_DONACION_EN_TRANSITO = 'ESPERAR_DONACION_EN_TRANSITO',
  SOLICITAR_DONACION_EXTERNA = 'SOLICITAR_DONACION_EXTERNA',
}

export class ActionPlan {
  constructor(
    public readonly id: string,
    public readonly reportId: string,
    public readonly tipoAccion: ActionPlanType,
    public readonly titulo: string,
    public readonly instruccionDetallada: string,
    public readonly distanciaKm?: number,
    public readonly origenId?: string,
    public readonly contacto?: string,
    public readonly createdAt: Date = new Date(),
  ) {}
}
