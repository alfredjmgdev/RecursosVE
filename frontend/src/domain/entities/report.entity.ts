export enum ResourceCategory {
  MEDICAMENTO = 'MEDICAMENTO',
  AGUA = 'AGUA',
  ALIMENTO = 'ALIMENTO',
  ROPA = 'ROPA',
  ABRIGO = 'ABRIGO',
  OTRO = 'OTRO',
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
  donacionesEnTransito?: number;
  volumenPoblacionNormalizado?: number;
}

export interface NeedReport {
  id: string;
  tipo: string;
  zona: GeoLocation;
  recurso: ResourceDetail;
  metadataUrgencia: UrgencyMetadata;
  status: ReportStatus;
  createdAt: string;
  resolvedAt?: string;
}
