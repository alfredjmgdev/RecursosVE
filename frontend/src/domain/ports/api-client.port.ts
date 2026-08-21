import { NeedReport, ReportStatus } from '../entities/report.entity';
import { GapAnalysisResult } from '../entities/gap-analysis.entity';
import { LearningMetricsSummary } from '../entities/learning.entity';
import { User, AuthResultFrontend } from '../entities/user.entity';

export interface CreateReportPayload {
  tipo: string;
  zona: {
    lat: number;
    lng: number;
    campamento: string;
    infrastructureId?: string;
    infrastructureType?: 'CAMPAMENTO' | 'ACOPIO';
  };
  recurso: {
    categoria: string;
    item: string;
    cantidadRequerida: number;
    unidad: string;
  };
  metadataUrgencia: {
    poblacionVulnerable: boolean;
    horasSinCobertura: number;
    confirmacionesLocales: number;
  };
}

export interface OfferDonationPayload {
  donanteNombre: string;
  categoria: string;
  item: string;
  cantidad: number;
  unidad: string;
  origenUbicacion: string;
  fechaDisponible: string;
}

export interface MatchResultFrontend {
  coincidenciaEncontrada: boolean;
  donacionId: string;
  reporteAsignado?: {
    id: string;
    campamento: string;
    necesidadCritica: string;
    distanciaEstimadaKm: number;
    contacto?: string;
    instruccionesEntrega?: string;
  };
}

export interface InfrastructureCampamento {
  id: string;
  nombre: string;
  lat: number;
  lng: number;
  poblacion: number;
  familias: number;
  capacidad: number;
  coordinador: string;
  estadoId?: number | null;
}

export interface InfrastructureAcopio {
  id: string;
  nombre: string;
  lat: number;
  lng: number;
  stockInfo: string;
  contacto: string;
  estadoId?: number | null;
}

export interface InfrastructureDesastre {
  id: string;
  nombre: string;
  tipo: string;
  lat: number;
  lng: number;
  radioMetros: number;
  estadoId?: number | null;
}

export interface DisasterTypeFrontend {
  code: string;
  nombre: string;
  color: string;
  fillColor: string;
  bgBadge: string;
  textBadge: string;
  icon: string;
}

export interface VenezuelaStateFrontend {
  id: number;
  nombre: string;
  codigo: string;
  lat: number;
  lng: number;
  zoom: number;
}

export interface DonationFrontend {
  id: string;
  donanteNombre: string;
  categoria: string;
  item: string;
  cantidad: number;
  unidad: string;
  origenUbicacion: string;
  fechaDisponible: string;
  status: string;
  reportIdAsignado?: string;
  createdAt: string;
}

export interface NlpExtractedEntityFrontend {
  categoria: string;
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

export interface RouteWaypointFrontend {
  lat: number;
  lng: number;
  instruccion?: string;
}

export interface RoutePointFrontend {
  lat: number;
  lng: number;
  nombre?: string;
}

export interface CalculateRoutePayloadFrontend {
  origen: RoutePointFrontend;
  destino: RoutePointFrontend;
  tipoVehiculo?: string;
  evitarZonasPeligro?: boolean;
}

export interface RouteCalculationFrontend {
  distanciaKm: number;
  tiempoEstimadoMinutos: number;
  nivelRiesgo: 'BAJO' | 'MEDIO' | 'ALTO' | 'CRITICO';
  tipoVehiculoRecomendado: string;
  alertasViales: string[];
  waypoints: RouteWaypointFrontend[];
  origen: RoutePointFrontend;
  destino: RoutePointFrontend;
  calculadoEn: string;
}

export interface SubmitFeedbackPayloadFrontend {
  reportId: string;
  calificacion: number;
  resultado: 'EXITOSO' | 'DEMANDA_SUBESTIMADA' | 'RETRASO_LOGISTICO' | 'RECURSO_EQUIVOCADO';
  comentario?: string;
  categoriaInsumo?: string;
  estadoNombre?: string;
}

export interface FeedbackResultFrontend {
  id: string;
  reportId: string;
  calificacion: number;
  resultado: string;
  comentario?: string;
  createdAt: string;
}

export interface DispatchShipmentFrontend {
  id: string;
  donacionId?: string;
  reporteId?: string;
  transportistaId: string;
  transportistaNombre: string;
  vehiculoTipo: string;
  ubicacionInicial: { lat: number; lng: number; nombre?: string };
  origen: { lat: number; lng: number; nombre: string };
  destino: { lat: number; lng: number; nombre: string };
  estado: 'ASIGNADO' | 'RECOGIDO' | 'ENTREGADO';
  insumoDescripcion?: string;
  createdAt: string;
  recogidoAt?: string;
  entregadoAt?: string;
}

export interface ApiClientPort {
  login(email: string, password: string): Promise<AuthResultFrontend>;
  getGapAnalysis(): Promise<GapAnalysisResult[]>;
  createReport(payload: CreateReportPayload): Promise<NeedReport>;
  updateReportStatus(id: string, status: ReportStatus): Promise<NeedReport>;
  getLearningMetrics(): Promise<LearningMetricsSummary>;
  offerDonation(payload: OfferDonationPayload): Promise<MatchResultFrontend>;
  getDonations(): Promise<DonationFrontend[]>;
  processNlpReport(text: string): Promise<NlpExtractedEntityFrontend>;
  calculateRoute(payload: CalculateRoutePayloadFrontend): Promise<RouteCalculationFrontend>;
  submitReportFeedback(payload: SubmitFeedbackPayloadFrontend): Promise<FeedbackResultFrontend>;

  getAssignedShipment(transportistaId: string): Promise<DispatchShipmentFrontend | null>;
  updateShipmentStatus(id: string, nuevoEstado: 'RECOGIDO' | 'ENTREGADO'): Promise<DispatchShipmentFrontend>;

  getDisasters(): Promise<InfrastructureDesastre[]>;
  createDisaster(payload: Omit<InfrastructureDesastre, 'id'>): Promise<InfrastructureDesastre>;
  updateDisaster(id: string, payload: Partial<InfrastructureDesastre>): Promise<InfrastructureDesastre>;
  deleteDisaster(id: string): Promise<boolean>;

  getDisasterTypes(): Promise<DisasterTypeFrontend[]>;

  getCamps(): Promise<InfrastructureCampamento[]>;
  createCamp(payload: Omit<InfrastructureCampamento, 'id'>): Promise<InfrastructureCampamento>;
  updateCamp(id: string, payload: Partial<InfrastructureCampamento>): Promise<InfrastructureCampamento>;
  deleteCamp(id: string): Promise<boolean>;

  getAcopios(): Promise<InfrastructureAcopio[]>;
  createAcopio(payload: Omit<InfrastructureAcopio, 'id'>): Promise<InfrastructureAcopio>;
  updateAcopio(id: string, payload: Partial<InfrastructureAcopio>): Promise<InfrastructureAcopio>;
  deleteAcopio(id: string): Promise<boolean>;

  getStates(): Promise<VenezuelaStateFrontend[]>;
}
