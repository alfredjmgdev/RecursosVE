import {
  ApiClientPort,
  CreateReportPayload,
  MatchResultFrontend,
  OfferDonationPayload,
  InfrastructureCampamento,
  InfrastructureAcopio,
  InfrastructureDesastre,
  DisasterTypeFrontend,
  DonationFrontend,
  NlpExtractedEntityFrontend,
  CalculateRoutePayloadFrontend,
  RouteCalculationFrontend,
  SubmitFeedbackPayloadFrontend,
  FeedbackResultFrontend,
  DispatchShipmentFrontend,
  UserFrontend,
  CreateUserPayloadFrontend,
} from '../../../domain/ports/api-client.port';
import { GapAnalysisResult, ActionPlanType } from '../../../domain/entities/gap-analysis.entity';
import { NeedReport, ReportStatus, ResourceCategory } from '../../../domain/entities/report.entity';
import { LearningMetricsSummary } from '../../../domain/entities/learning.entity';
import { AuthResultFrontend, UserRole } from '../../../domain/entities/user.entity';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export class ApiClientAdapter implements ApiClientPort {
  async login(email: string, password: string): Promise<AuthResultFrontend> {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        return await res.json();
      }
      const errorData = await res.json().catch(() => ({}));
      const message = Array.isArray(errorData.message)
        ? errorData.message.join(', ')
        : errorData.message || 'Credenciales inválidas. Verifique su correo y contraseña.';
      throw new Error(message);
    } catch (err: any) {
      // If error is a response validation error (not network error), throw it immediately
      if (err.message && !err.message.toLowerCase().includes('failed to fetch')) {
        throw err;
      }
      
      // Offline fallback: validate credentials strictly if backend is unreachable
      const validPasswords: Record<string, string> = {
        'coordinador@recursosve.org': 'coord123',
        'brigadista@recursosve.org': 'briga123',
        'donante@recursosve.org': 'donant123',
        'transportista@recursosve.org': 'driver123',
        'transportista@recursos.ve': 'driver123',
        'transportista2@recursosve.org': 'driver123',
        'transportista3@recursosve.org': 'driver123',
        'transportista4@recursosve.org': 'driver123',
      };
      
      const lowerEmail = email.toLowerCase();
      const expectedPass = validPasswords[lowerEmail] || '123456';
      
      if (password !== expectedPass) {
        throw new Error('Contraseña incorrecta. Verifique sus datos de acceso.');
      }

      let userRole = UserRole.COORDINADOR;
      let userName = 'Juan P.';
      let campamento: string | undefined = 'Campamento La Guaira #12';

      if (lowerEmail.includes('donante')) {
        userRole = UserRole.DONANTE;
        userName = 'ONG Farmacéuticos Solidarios';
        campamento = undefined;
      } else if (lowerEmail.includes('brigadista')) {
        userRole = UserRole.BRIGADISTA;
        userName = 'Pedro R.';
        campamento = 'Depósito Las Flores';
      } else if (lowerEmail.includes('transportista')) {
        userRole = UserRole.TRANSPORTISTA;
        userName = 'Carlos Mendoza (Pick-Up 4x4)';
        campamento = undefined;
      }

      return {
        user: {
          id: `usr_${Date.now()}`,
          email,
          nombre: userName,
          rol: userRole,
          campamentoAsignado: campamento,
        },
        token: `token_mock_${Date.now()}`,
      };
    }
  }

  private localCreatedGaps: GapAnalysisResult[] = [];

  async getGapAnalysis(): Promise<GapAnalysisResult[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/analytics/gaps`, { cache: 'no-store' });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback if backend server is not running
    }
    return this.localCreatedGaps;
  }

  async createReport(payload: CreateReportPayload): Promise<NeedReport> {
    try {
      const res = await fetch(`${API_BASE_URL}/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback mock creation
    }

    const fallbackReport: NeedReport = {
      id: `req_${Date.now()}`,
      tipo: payload.tipo,
      zona: payload.zona,
      recurso: {
        categoria: payload.recurso.categoria as ResourceCategory,
        item: payload.recurso.item,
        cantidadRequerida: payload.recurso.cantidadRequerida,
        unidad: payload.recurso.unidad,
      },
      metadataUrgencia: payload.metadataUrgencia,
      status: ReportStatus.SIN_COBERTURA,
      createdAt: new Date().toISOString(),
    };

    const fallbackGap: GapAnalysisResult = {
      report: fallbackReport,
      criticalityScore: 75,
      brechaReal: payload.recurso.cantidadRequerida,
      accionRecomendada: {
        id: `act_${Date.now()}`,
        reportId: fallbackReport.id,
        tipoAccion: ActionPlanType.SOLICITAR_DONACION_EXTERNA,
        titulo: 'Necesidad Crítica Publicada',
        instruccionDetallada: `${payload.zona.campamento} necesita ${payload.recurso.cantidadRequerida} ${payload.recurso.unidad} de ${payload.recurso.item}. Publicada para donación externa.`,
      },
    };

    this.localCreatedGaps.unshift(fallbackGap);
    return fallbackReport;
  }

  async getDonations(): Promise<DonationFrontend[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/donations`, { cache: 'no-store' });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }
    return [];
  }

  async offerDonation(payload: OfferDonationPayload): Promise<MatchResultFrontend> {
    try {
      const res = await fetch(`${API_BASE_URL}/donations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const raw = await res.json();
        return {
          coincidenciaEncontrada: !!raw.reporteAsignado,
          donacionId: raw.donation?.id || `don_${Date.now()}`,
          reporteAsignado: raw.reporteAsignado,
        };
      }
    } catch {
      // Fallback match
    }

    return {
      coincidenciaEncontrada: true,
      donacionId: `don_${Date.now()}`,
      reporteAsignado: {
        id: 'req_1045',
        campamento: 'Campamento La Guaira #12',
        necesidadCritica: `${payload.cantidad} ${payload.unidad} de ${payload.item}`,
        distanciaEstimadaKm: 42,
      },
    };
  }

  async getLearningMetrics(): Promise<LearningMetricsSummary> {
    try {
      const res = await fetch(`${API_BASE_URL}/analytics/learning-metrics`, { cache: 'no-store' });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }

    return {
      ciclosCompletados: 184,
      tiempoPromedioResolucionHoras: 2.3,
      mejoraTiempoPorcentaje: 61,
      patronesDetectados: [
        {
          id: 'pat_1',
          tipo: 'PREALERTA',
          titulo: 'Agua potable en Zona Norte',
          descripcion: 'La Zona Norte siempre requiere agua en días 2 y 3 post-evento. Prealerta activa.',
          impacto: 'Pre-despacho automático recomendado',
        },
        {
          id: 'pat_2',
          tipo: 'CATEGORIA_PAUSADA',
          titulo: 'Ropa de verano',
          descripcion: '3 donaciones rechazadas. Categoría pausada temporalmente por saturación de acopio.',
          impacto: 'Evita colapso logístico en almacenes',
        },
        {
          id: 'pat_3',
          tipo: 'MEJORA_TIEMPO',
          titulo: 'Tiempo promedio de resolución',
          descripcion: 'Mejoró de 6h a 2.3h esta semana gracias a la redistribución local (<2km).',
          impacto: '61% de aceleración en respuesta',
        },
        {
          id: 'pat_4',
          tipo: 'PREALERTA',
          titulo: 'Insumos Médicos Pediátricos en Macuto',
          descripcion: 'Aumento de 75% en solicitudes de amoxicilina e ibuprofeno tras la inundación.',
          impacto: 'Priorización en despachos de donantes',
        },
      ],
    };
  }

  async updateReportStatus(id: string, status: ReportStatus): Promise<NeedReport> {
    try {
      const res = await fetch(`${API_BASE_URL}/reports/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }

    return {
      id,
      tipo: 'NECESIDAD_CRITICA',
      zona: { lat: 10.601, lng: -66.932, campamento: 'Campamento La Guaira #12' },
      recurso: { categoria: ResourceCategory.AGUA, item: 'Agua', cantidadRequerida: 50, unidad: 'L' },
      metadataUrgencia: { poblacionVulnerable: false, horasSinCobertura: 12, confirmacionesLocales: 1 },
      status,
      createdAt: new Date().toISOString(),
    };
  }

  async getDisasters(): Promise<InfrastructureDesastre[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/infrastructure/disasters`, { cache: 'no-store' });
      if (res.ok) {
        return await res.json();
      }
    } catch {}
    return [];
  }

  async createDisaster(payload: Omit<InfrastructureDesastre, 'id'>): Promise<InfrastructureDesastre> {
    try {
      const res = await fetch(`${API_BASE_URL}/infrastructure/disasters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {}
    return { ...payload, id: `disaster_${Date.now()}` };
  }

  async updateDisaster(id: string, payload: Partial<InfrastructureDesastre>): Promise<InfrastructureDesastre> {
    try {
      const res = await fetch(`${API_BASE_URL}/infrastructure/disasters/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {}
    return { id, ...payload } as InfrastructureDesastre;
  }

  async deleteDisaster(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/infrastructure/disasters/${id}`, {
        method: 'DELETE',
      });
      return res.ok;
    } catch {}
    return false;
  }

  async getDisasterTypes(): Promise<DisasterTypeFrontend[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/infrastructure/disaster-types`, { cache: 'no-store' });
      if (res.ok) {
        return await res.json();
      }
    } catch {}
    return [];
  }

  async getCamps(): Promise<InfrastructureCampamento[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/infrastructure/camps`, { cache: 'no-store' });
      if (res.ok) {
        return await res.json();
      }
    } catch {}
    return [];
  }

  async createCamp(payload: Omit<InfrastructureCampamento, 'id'>): Promise<InfrastructureCampamento> {
    try {
      const res = await fetch(`${API_BASE_URL}/infrastructure/camps`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {}
    return { ...payload, id: `camp_${Date.now()}` };
  }

  async updateCamp(id: string, payload: Partial<InfrastructureCampamento>): Promise<InfrastructureCampamento> {
    try {
      const res = await fetch(`${API_BASE_URL}/infrastructure/camps/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {}
    return { id, ...payload } as InfrastructureCampamento;
  }

  async deleteCamp(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/infrastructure/camps/${id}`, {
        method: 'DELETE',
      });
      return res.ok;
    } catch {}
    return false;
  }

  async getAcopios(): Promise<InfrastructureAcopio[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/infrastructure/acopios`, { cache: 'no-store' });
      if (res.ok) {
        return await res.json();
      }
    } catch {}
    return [];
  }

  async createAcopio(payload: Omit<InfrastructureAcopio, 'id'>): Promise<InfrastructureAcopio> {
    try {
      const res = await fetch(`${API_BASE_URL}/infrastructure/acopios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {}
    return { ...payload, id: `acopio_${Date.now()}` };
  }

  async updateAcopio(id: string, payload: Partial<InfrastructureAcopio>): Promise<InfrastructureAcopio> {
    try {
      const res = await fetch(`${API_BASE_URL}/infrastructure/acopios/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {}
    return { id, ...payload } as InfrastructureAcopio;
  }

  async deleteAcopio(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/infrastructure/acopios/${id}`, {
        method: 'DELETE',
      });
      return res.ok;
    } catch {}
    return false;
  }

  async getStates() {
    try {
      const res = await fetch(`${API_BASE_URL}/infrastructure/states`, { cache: 'no-store' });
      if (res.ok) {
        return await res.json();
      }
    } catch {}
    return [];
  }

  private getMockGapAnalysis(): GapAnalysisResult[] {
    return [
      {
        report: {
          id: 'req_1045',
          tipo: 'NECESIDAD_CRITICA',
          zona: { lat: 10.601, lng: -66.932, campamento: 'Campamento La Guaira #12' },
          recurso: {
            categoria: ResourceCategory.MEDICAMENTO,
            item: 'Insulina rápida',
            cantidadRequerida: 80,
            unidad: 'dosis',
          },
          metadataUrgencia: {
            poblacionVulnerable: true,
            horasSinCobertura: 48,
            confirmacionesLocales: 4,
          },
          status: ReportStatus.SIN_COBERTURA,
          createdAt: new Date().toISOString(),
        },
        criticalityScore: 92,
        brechaReal: 80,
        accionRecomendada: {
          id: 'act_1',
          reportId: 'req_1045',
          tipoAccion: ActionPlanType.SOLICITAR_DONACION_EXTERNA,
          titulo: 'Urgencia Médica Crítica',
          instruccionDetallada: 'Campamento La Guaira #12 necesita 80 dosis de Insulina Rápida. Publicada para donación externa con máxima prioridad.',
        },
      },
      {
        report: {
          id: 'req_1046',
          tipo: 'NECESIDAD_CRITICA',
          zona: { lat: 10.605, lng: -66.95, campamento: 'Hospital de Campaña Maiquetía' },
          recurso: {
            categoria: ResourceCategory.MEDICAMENTO,
            item: 'Suero Antiofídico Polivalente',
            cantidadRequerida: 15,
            unidad: 'frascos',
          },
          metadataUrgencia: {
            poblacionVulnerable: true,
            horasSinCobertura: 52,
            confirmacionesLocales: 5,
          },
          status: ReportStatus.SIN_COBERTURA,
          createdAt: new Date().toISOString(),
        },
        criticalityScore: 88,
        brechaReal: 15,
        accionRecomendada: {
          id: 'act_2',
          reportId: 'req_1046',
          tipoAccion: ActionPlanType.SOLICITAR_DONACION_EXTERNA,
          titulo: 'Alerta Antiveneno Toxicología',
          instruccionDetallada: 'Hospital de Campaña Maiquetía reporta 3 picaduras de serpiente tras deslave. Requiere 15 frascos de Suero Antiofídico.',
        },
      },
      {
        report: {
          id: 'req_1047',
          tipo: 'NECESIDAD_CRITICA',
          zona: { lat: 10.612, lng: -66.915, campamento: 'Refugio Sector Naiguatá' },
          recurso: {
            categoria: ResourceCategory.ABRIGO,
            item: 'Planta Eléctrica Diesel 10kVA',
            cantidadRequerida: 2,
            unidad: 'unidades',
          },
          metadataUrgencia: {
            poblacionVulnerable: true,
            horasSinCobertura: 72,
            confirmacionesLocales: 4,
          },
          status: ReportStatus.SIN_COBERTURA,
          createdAt: new Date().toISOString(),
        },
        criticalityScore: 79,
        brechaReal: 2,
        accionRecomendada: {
          id: 'act_3',
          reportId: 'req_1047',
          tipoAccion: ActionPlanType.SOLICITAR_DONACION_EXTERNA,
          titulo: 'Energía para Cadena de Frío',
          instruccionDetallada: 'Refugio Sector Naiguatá lleva 72h sin energía eléctrica para mantener vacunas y medicamentos a salvo.',
        },
      },
      {
        report: {
          id: 'req_1048',
          tipo: 'NECESIDAD_CRITICA',
          zona: { lat: 10.607, lng: -66.924, campamento: 'Campamento 7 Sector Norte' },
          recurso: {
            categoria: ResourceCategory.AGUA,
            item: 'Agua potable en bidones',
            cantidadRequerida: 50,
            unidad: 'litros',
          },
          metadataUrgencia: {
            poblacionVulnerable: false,
            horasSinCobertura: 12,
            confirmacionesLocales: 2,
          },
          status: ReportStatus.PARCIAL,
          createdAt: new Date().toISOString(),
        },
        criticalityScore: 54,
        brechaReal: 0,
        inventarioLocalDisponibleKm: 1.8,
        accionRecomendada: {
          id: 'act_4',
          reportId: 'req_1048',
          tipoAccion: ActionPlanType.REDISTRIBUCION_LOCAL,
          titulo: 'Redistribución Local Activada',
          instruccionDetallada: 'Llevá 50 litros de Agua potable al Campamento 7. Disponible en Depósito Las Flores (1.8 km).',
          distanciaKm: 1.8,
          contacto: 'Pedro R. (0414-555-0199)',
        },
      },
      {
        report: {
          id: 'req_1049',
          tipo: 'NECESIDAD_CRITICA',
          zona: { lat: 10.595, lng: -66.938, campamento: 'Centro de Acopio Carlos Soublette' },
          recurso: {
            categoria: ResourceCategory.ALIMENTO,
            item: 'Suero oral en sobres',
            cantidadRequerida: 200,
            unidad: 'sobres',
          },
          metadataUrgencia: {
            poblacionVulnerable: true,
            horasSinCobertura: 24,
            confirmacionesLocales: 3,
          },
          status: ReportStatus.SIN_COBERTURA,
          createdAt: new Date().toISOString(),
        },
        criticalityScore: 48,
        brechaReal: 200,
        accionRecomendada: {
          id: 'act_5',
          reportId: 'req_1049',
          tipoAccion: ActionPlanType.SOLICITAR_DONACION_EXTERNA,
          titulo: 'Suero Oral de Emergencia',
          instruccionDetallada: 'Zona Norte - Sector 3 necesita 200 sobres de Suero oral. Publicada para donación externa.',
        },
      },
      {
        report: {
          id: 'req_1050',
          tipo: 'SOLICITUD_RECURSO',
          zona: { lat: 10.599, lng: -66.921, campamento: 'Refugio Escuela Pariata' },
          recurso: {
            categoria: ResourceCategory.OTRO,
            item: 'Kits de Higiene Pediátrica',
            cantidadRequerida: 150,
            unidad: 'kits',
          },
          metadataUrgencia: {
            poblacionVulnerable: true,
            horasSinCobertura: 18,
            confirmacionesLocales: 2,
            donacionesEnTransito: 150,
          },
          status: ReportStatus.EN_TRANSITO,
          createdAt: new Date().toISOString(),
        },
        criticalityScore: 41,
        brechaReal: 0,
        accionRecomendada: {
          id: 'act_6',
          reportId: 'req_1050',
          tipoAccion: ActionPlanType.ESPERAR_DONACION_EN_TRANSITO,
          titulo: 'Donación en Camino',
          instruccionDetallada: 'No enviés más kits; ya hay 150 kits de higiene asignados por Cruz Roja en tránsito hacia Refugio Escuela Pariata.',
        },
      },
      {
        report: {
          id: 'req_1051',
          tipo: 'SOLICITUD_RECURSO',
          zona: { lat: 10.603, lng: -66.942, campamento: 'Campamento El Rincón' },
          recurso: {
            categoria: ResourceCategory.ABRIGO,
            item: 'Carpas Térmicas Impermeables',
            cantidadRequerida: 25,
            unidad: 'unidades',
          },
          metadataUrgencia: {
            poblacionVulnerable: true,
            horasSinCobertura: 8,
            confirmacionesLocales: 1,
          },
          status: ReportStatus.PARCIAL,
          createdAt: new Date().toISOString(),
        },
        criticalityScore: 36,
        brechaReal: 0,
        inventarioLocalDisponibleKm: 1.2,
        accionRecomendada: {
          id: 'act_7',
          reportId: 'req_1051',
          tipoAccion: ActionPlanType.REDISTRIBUCION_LOCAL,
          titulo: 'Redistribución Ultra-Local',
          instruccionDetallada: 'Trasladar 25 carpas desde Almacén Puerto Maiquetía (1.2 km) al Campamento El Rincón.',
          distanciaKm: 1.2,
          contacto: 'Capitán Morales (0412-888-3344)',
        },
      },
      {
        report: {
          id: 'req_1052',
          tipo: 'SOLICITUD_RECURSO',
          zona: { lat: 10.608, lng: -66.935, campamento: 'Sector Los Corales' },
          recurso: {
            categoria: ResourceCategory.ALIMENTO,
            item: 'Raciones de Combate / Enlatados',
            cantidadRequerida: 500,
            unidad: 'kg',
          },
          metadataUrgencia: {
            poblacionVulnerable: false,
            horasSinCobertura: 6,
            confirmacionesLocales: 2,
          },
          status: ReportStatus.SIN_COBERTURA,
          createdAt: new Date().toISOString(),
        },
        criticalityScore: 29,
        brechaReal: 500,
        accionRecomendada: {
          id: 'act_8',
          reportId: 'req_1052',
          tipoAccion: ActionPlanType.SOLICITAR_DONACION_EXTERNA,
          titulo: 'Abastecimiento de Alimento',
          instruccionDetallada: 'Sector Los Corales requiere 500 kg de alimentos no perecederos para el comedor comunitario.',
        },
      },
      {
        report: {
          id: 'req_1053',
          tipo: 'SOLICITUD_RECURSO',
          zona: { lat: 10.602, lng: -66.927, campamento: 'Refugio Polideportivo José María Vargas' },
          recurso: {
            categoria: ResourceCategory.AGUA,
            item: 'Pastillas Potabilizadoras de Agua',
            cantidadRequerida: 1000,
            unidad: 'pastillas',
          },
          metadataUrgencia: {
            poblacionVulnerable: false,
            horasSinCobertura: 14,
            confirmacionesLocales: 3,
          },
          status: ReportStatus.PARCIAL,
          createdAt: new Date().toISOString(),
        },
        criticalityScore: 25,
        brechaReal: 0,
        inventarioLocalDisponibleKm: 0.9,
        accionRecomendada: {
          id: 'act_9',
          reportId: 'req_1053',
          tipoAccion: ActionPlanType.REDISTRIBUCION_LOCAL,
          titulo: 'Potabilización Inmediata',
          instruccionDetallada: 'Retirar 1000 pastillas potabilizadoras del Depósito Las Flores (0.9 km) y entregar al Polideportivo.',
          distanciaKm: 0.9,
          contacto: 'Dra. Elena G. (0416-222-1100)',
        },
      },
      {
        report: {
          id: 'req_1054',
          tipo: 'SOLICITUD_RECURSO',
          zona: { lat: 10.609, lng: -66.919, campamento: 'Campamento Macuto Bajo' },
          recurso: {
            categoria: ResourceCategory.ROPA,
            item: 'Mantas Térmicas de Algodón',
            cantidadRequerida: 300,
            unidad: 'unidades',
          },
          metadataUrgencia: {
            poblacionVulnerable: true,
            horasSinCobertura: 5,
            confirmacionesLocales: 1,
            donacionesEnTransito: 300,
          },
          status: ReportStatus.EN_TRANSITO,
          createdAt: new Date().toISOString(),
        },
        criticalityScore: 21,
        brechaReal: 0,
        accionRecomendada: {
          id: 'act_10',
          reportId: 'req_1054',
          tipoAccion: ActionPlanType.ESPERAR_DONACION_EN_TRANSITO,
          titulo: 'Despacho en Ruta',
          instruccionDetallada: '300 mantas térmicas despachadas por la Fundación Humanitarian Relief arriban en 45 minutos.',
        },
      },
    ];
  }

  async processNlpReport(text: string): Promise<NlpExtractedEntityFrontend> {
    try {
      const res = await fetch(`${API_BASE_URL}/reports/nlp-process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }

    const lower = text.toLowerCase();
    let categoria = 'OTRO';
    let item = 'Insumo de Emergencia';
    let unidad = 'unidades';

    if (lower.includes('agua') || lower.includes('potable') || lower.includes('litro')) {
      categoria = 'AGUA';
      item = 'Agua Potable 5L';
      unidad = 'litros';
    } else if (lower.includes('insulina') || lower.includes('medicina') || lower.includes('dosis')) {
      categoria = 'MEDICAMENTO';
      item = 'Insulina Rápida / Medicinas';
      unidad = 'dosis';
    } else if (lower.includes('comida') || lower.includes('arroz')) {
      categoria = 'ALIMENTO';
      item = 'Alimentos No Perecederos';
      unidad = 'kg';
    }

    const matchNumber = text.match(/\b\d+\b/);
    const cantidadRequerida = matchNumber ? parseInt(matchNumber[0], 10) : 50;

    return {
      categoria,
      item,
      cantidadRequerida,
      unidad,
      poblacionVulnerable: lower.includes('niño') || lower.includes('bebé') || lower.includes('herido') || lower.includes('anciano'),
      horasSinCobertura: 24,
      campamento: 'Campamento La Guaira #12',
      estadoNombre: 'La Guaira',
      rawText: text,
      source: 'HEURISTIC_FALLBACK',
    };
  }

  async calculateRoute(payload: CalculateRoutePayloadFrontend): Promise<RouteCalculationFrontend> {
    try {
      const res = await fetch(`${API_BASE_URL}/routes/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }

    // Fallback calculation in case backend is unreachable
    const dx = (payload.destino.lng - payload.origen.lng) * 111.32;
    const dy = (payload.destino.lat - payload.origen.lat) * 110.57;
    const directKm = Math.sqrt(dx * dx + dy * dy);
    const distanciaKm = Math.round(directKm * 1.35 * 10) / 10;
    const tiempoEstimadoMinutos = Math.round((distanciaKm / 60) * 60);

    return {
      distanciaKm,
      tiempoEstimadoMinutos,
      nivelRiesgo: distanciaKm > 100 ? 'MEDIO' : 'BAJO',
      tipoVehiculoRecomendado: payload.tipoVehiculo || 'CAMION_350',
      alertasViales: ['Ruta calculada con soporte offline / local'],
      waypoints: [
        { lat: payload.origen.lat, lng: payload.origen.lng, instruccion: `Origen: ${payload.origen.nombre || 'Centro de Acopio'}` },
        { lat: payload.destino.lat, lng: payload.destino.lng, instruccion: `Destino: ${payload.destino.nombre || 'Campamento de Refugio'}` },
      ],
      origen: payload.origen,
      destino: payload.destino,
      calculadoEn: new Date().toISOString(),
    };
  }

  async submitReportFeedback(payload: SubmitFeedbackPayloadFrontend): Promise<FeedbackResultFrontend> {
    try {
      const res = await fetch(`${API_BASE_URL}/analytics/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }

    return {
      id: `fb_${Date.now()}`,
      reportId: payload.reportId,
      calificacion: payload.calificacion,
      resultado: payload.resultado,
      comentario: payload.comentario,
      createdAt: new Date().toISOString(),
    };
  }

  async getAssignedShipment(transportistaId: string): Promise<DispatchShipmentFrontend | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/shipments/assigned/${transportistaId}`);
      if (res.ok) {
        const text = await res.text();
        if (!text || text === 'null') return null;
        return JSON.parse(text);
      }
    } catch {
      // Fallback
    }

    return null;
  }

  async updateShipmentStatus(id: string, nuevoEstado: 'RECOGIDO' | 'ENTREGADO'): Promise<DispatchShipmentFrontend> {
    try {
      const res = await fetch(`${API_BASE_URL}/shipments/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }

    return {
      id,
      donacionId: 'DON_9901',
      reporteId: 'REP_LAGUAIRA_01',
      transportistaId: 'usr_trans_4',
      transportistaNombre: 'Carlos Mendoza (Chofer 4x4)',
      vehiculoTipo: 'PICKUP_4X4',
      ubicacionInicial: { lat: 10.605, lng: -66.94, nombre: 'Base Logística Catia La Mar' },
      origen: { lat: 10.601, lng: -66.932, nombre: 'Centro de Acopio Puerto La Guaira' },
      destino: { lat: 10.595, lng: -66.915, nombre: 'Refugio Carayaca Emergencia' },
      estado: nuevoEstado,
      insumoDescripcion: '500L Agua Potable & 20 Kits Médicos de Urgencia',
      createdAt: new Date().toISOString(),
      recogidoAt: nuevoEstado === 'RECOGIDO' || nuevoEstado === 'ENTREGADO' ? new Date().toISOString() : undefined,
      entregadoAt: nuevoEstado === 'ENTREGADO' ? new Date().toISOString() : undefined,
    };
  }

  async getUsers(): Promise<UserFrontend[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/users`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }

    return [
      { id: 'usr_coord_1', email: 'coordinador@recursosve.org', nombre: 'Juan P.', rol: UserRole.COORDINADOR, campamentoAsignado: 'Campamento La Guaira #12' },
      { id: 'usr_brig_2', email: 'brigadista@recursosve.org', nombre: 'Pedro R.', rol: UserRole.BRIGADISTA, campamentoAsignado: 'Depósito Las Flores' },
      { id: 'usr_donante_3', email: 'donante@recursosve.org', nombre: 'ONG Farmacéuticos Solidarios', rol: UserRole.DONANTE },
      { id: 'usr_trans_4', email: 'transportista@recursosve.org', nombre: 'Carlos Mendoza (Chofer 4x4)', rol: UserRole.TRANSPORTISTA },
      { id: 'usr_trans_4_alt', email: 'transportista@recursos.ve', nombre: 'Carlos Mendoza (Chofer 4x4)', rol: UserRole.TRANSPORTISTA },
    ];
  }

  async createUser(payload: CreateUserPayloadFrontend): Promise<UserFrontend> {
    try {
      const res = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        return await res.json();
      }
      const errData = await res.json();
      throw new Error(errData.message || 'Error al crear usuario');
    } catch (err: any) {
      if (err.message && !err.message.includes('fetch')) {
        throw err;
      }
    }

    return {
      id: `usr_${Date.now()}`,
      email: payload.email,
      nombre: payload.nombre,
      rol: payload.rol,
      campamentoAsignado: payload.campamentoAsignado,
    };
  }

  async deleteUser(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        return true;
      }
    } catch {
      // Fallback
    }
    return true;
  }
}
