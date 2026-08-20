export interface LearningPattern {
  id: string;
  tipo: 'PREALERTA' | 'CATEGORIA_PAUSADA' | 'MEJORA_TIEMPO';
  titulo: string;
  descripcion: string;
  impacto: string;
}

export interface LearningMetricsSummary {
  ciclosCompletados: number;
  tiempoPromedioResolucionHoras: number;
  mejoraTiempoPorcentaje: number;
  patronesDetectados: LearningPattern[];
}
