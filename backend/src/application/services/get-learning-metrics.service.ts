import { Injectable } from '@nestjs/common';
import { GetLearningMetricsUseCase } from '../../domain/ports/in/get-learning-metrics.use-case';
import { LearningMetricsSummary, LearningPattern } from '../../domain/entities/learning-metric.entity';

@Injectable()
export class GetLearningMetricsService implements GetLearningMetricsUseCase {
  async execute(): Promise<LearningMetricsSummary> {
    const patrones: LearningPattern[] = [
      {
        id: 'pat_1',
        tipo: 'PREALERTA',
        titulo: 'Agua potable en Zona Norte',
        descripcion: 'La Zona Norte siempre requiere refuerzo de agua en días 2 y 3 post-evento. Prealerta activa.',
        impacto: 'Pre-despacho automático recomendado',
      },
      {
        id: 'pat_2',
        tipo: 'CATEGORIA_PAUSADA',
        titulo: 'Ropa de Verano',
        descripcion: '3 donaciones consecutivas rechazadas por excedente. Categoría pausada temporalmente.',
        impacto: 'Evita saturación de depósitos',
      },
      {
        id: 'pat_3',
        tipo: 'MEJORA_TIEMPO',
        titulo: 'Optimizaciones de Ruteo Local',
        descripcion: 'Tiempo promedio de resolución mejoró de 6h a 3.5h esta semana.',
        impacto: '41% de reducción en tiempo de espera',
      },
    ];

    return new LearningMetricsSummary(47, 3.5, 41, patrones);
  }
}
