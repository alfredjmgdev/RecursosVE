export interface LearningPattern {
  id: string;
  tipo: 'PREALERTA' | 'CATEGORIA_PAUSADA' | 'MEJORA_TIEMPO';
  titulo: string;
  descripcion: string;
  impacto: string;
}

export class LearningMetricsSummary {
  constructor(
    public readonly ciclosCompletados: number,
    public readonly tiempoPromedioResolucionHoras: number,
    public readonly mejoraTiempoPorcentaje: number,
    public readonly patronesDetectados: LearningPattern[],
  ) {}
}
