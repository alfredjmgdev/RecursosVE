export enum ResourceCategory {
  MEDICAMENTO = 'MEDICAMENTO',
  AGUA = 'AGUA',
  ALIMENTO = 'ALIMENTO',
  ROPA = 'ROPA',
  ABRIGO = 'ABRIGO',
  OTRO = 'OTRO',
}

export enum ReportUrgency {
  CRITICA = 'CRITICA',
  IMPORTANTE = 'IMPORTANTE',
  DESEABLE = 'DESEABLE',
}

export enum ReportStatus {
  SIN_COBERTURA = 'SIN_COBERTURA',
  PARCIAL = 'PARCIAL',
  EN_TRANSITO = 'EN_TRANSITO',
  CUBIERTA = 'CUBIERTA',
}

export interface GeoLocation {
  lat: number;
  lng: number;
  campamento: string;
  infrastructureId?: string;
  infrastructureType?: 'CAMPAMENTO' | 'ACOPIO';
}

export interface ResourceDetail {
  categoria: ResourceCategory;
  item: string;
  cantidadRequerida: number;
  unidad: string;
}

export interface UrgencyMetadata {
  poblacionVulnerable: boolean;
  horasSinCobertura: number;
  confirmacionesLocales: number;
  donacionesEnTransito?: number; // Volume coming in transit
  volumenPoblacionNormalizado?: number; // V from 0 to 1
}

export class NeedReport {
  constructor(
    public readonly id: string,
    public readonly tipo: string,
    public readonly zona: GeoLocation,
    public readonly recurso: ResourceDetail,
    public readonly metadataUrgencia: UrgencyMetadata,
    public status: ReportStatus = ReportStatus.SIN_COBERTURA,
    public readonly createdAt: Date = new Date(),
    public resolvedAt?: Date,
  ) {}

  /**
   * Calculates Criticality Score based on RecursosVE mathematical formula:
   * Score = (W_recurso * V) + (T_espera * 1.5) + (P_vulnerable * 2) - (D_transito * 0.8)
   */
  public calculateCriticalityScore(): number {
    const W_recurso = this.getResourceCategoryWeight(this.recurso.categoria);
    const V = this.metadataUrgencia.volumenPoblacionNormalizado ?? 0.5;
    const T_espera = this.metadataUrgencia.horasSinCobertura;
    const P_vulnerable = this.metadataUrgencia.poblacionVulnerable ? 1 : 0;
    const D_transito = this.metadataUrgencia.donacionesEnTransito ?? 0;

    const score = (W_recurso * V) + (T_espera * 1.5) + (P_vulnerable * 2) - (D_transito * 0.8);
    return Math.max(0, Math.round(score * 100) / 100);
  }

  private getResourceCategoryWeight(category: ResourceCategory): number {
    switch (category) {
      case ResourceCategory.MEDICAMENTO:
        return 10;
      case ResourceCategory.AGUA:
        return 8;
      case ResourceCategory.ALIMENTO:
        return 5;
      case ResourceCategory.ABRIGO:
        return 4;
      case ResourceCategory.ROPA:
        return 2;
      default:
        return 3;
    }
  }
}
