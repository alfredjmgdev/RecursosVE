import { ResourceCategory } from '../../entities/report.entity';

export interface NlpExtractedEntity {
  categoria: ResourceCategory;
  item: string;
  cantidadRequerida: number;
  unidad: string;
  poblacionVulnerable: boolean;
  horasSinCobertura: number;
  campamento: string;
  estadoNombre: string;
  estadoId?: number;
  lat?: number;
  lng?: number;
  rawText: string;
  rawNlpResponse?: string;
  source: 'OLLAMA_QWEN2.5' | 'HEURISTIC_FALLBACK';
}

export const PROCESS_NLP_REPORT_USE_CASE = 'PROCESS_NLP_REPORT_USE_CASE';

export interface ProcessNlpReportUseCase {
  execute(text: string): Promise<NlpExtractedEntity>;
}
