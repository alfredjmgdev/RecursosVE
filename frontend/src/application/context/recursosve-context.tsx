'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { GapAnalysisResult } from '../../domain/entities/gap-analysis.entity';
import { LearningMetricsSummary } from '../../domain/entities/learning.entity';
import { NeedReport, ReportStatus } from '../../domain/entities/report.entity';
import { ApiClientPort, CreateReportPayload, MatchResultFrontend, OfferDonationPayload, DisasterTypeFrontend, VenezuelaStateFrontend, DonationFrontend } from '../../domain/ports/api-client.port';
import { ApiClientAdapter } from '../../infrastructure/adapters/http/api-client.adapter';
import { User } from '../../domain/entities/user.entity';
import { FALLBACK_VENEZUELA_STATES } from '../../domain/entities/venezuela-states.data';

export interface CustomAcopio {
  id: string;
  nombre: string;
  lat: number;
  lng: number;
  stockInfo: string;
  contacto: string;
  estadoId?: number | null;
}

export interface CustomCampamento {
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

export type DisasterEventType =
  | 'DESLAVE'
  | 'TERREMOTO'
  | 'INUNDACION'
  | 'HURACAN'
  | 'TORNADO'
  | 'INCENDIO'
  | 'VOLCAN'
  | 'TSUNAMI'
  | 'SEQUIA'
  | 'HELADA'
  | 'EPIDEMIA'
  | 'COLAPSO'
  | string;

export interface CustomDesastre {
  id: string;
  nombre: string;
  tipo: DisasterEventType;
  lat: number;
  lng: number;
  radioMetros: number;
  estadoId?: number | null;
}

interface RecursosVEContextType {
  currentUser: User | null;
  authChecked: boolean;
  login: (email: string, pass: string) => Promise<User>;
  logout: () => void;
  gaps: GapAnalysisResult[];
  donations: DonationFrontend[];
  learningMetrics: LearningMetricsSummary | null;
  isLoading: boolean;
  isLiveSyncing: boolean;
  refreshData: (silent?: boolean) => Promise<void>;
  createReport: (payload: CreateReportPayload) => Promise<NeedReport>;
  updateReportStatus: (id: string, status: ReportStatus) => Promise<void>;
  offerDonation: (payload: OfferDonationPayload) => Promise<MatchResultFrontend>;
  processNlpReport: (text: string) => Promise<import('../../domain/ports/api-client.port').NlpExtractedEntityFrontend>;
  calculateRoute: (payload: import('../../domain/ports/api-client.port').CalculateRoutePayloadFrontend) => Promise<import('../../domain/ports/api-client.port').RouteCalculationFrontend>;
  submitReportFeedback: (payload: import('../../domain/ports/api-client.port').SubmitFeedbackPayloadFrontend) => Promise<import('../../domain/ports/api-client.port').FeedbackResultFrontend>;
  getAssignedShipment: (transportistaId: string) => Promise<import('../../domain/ports/api-client.port').DispatchShipmentFrontend | null>;
  updateShipmentStatus: (id: string, nuevoEstado: 'RECOGIDO' | 'ENTREGADO') => Promise<import('../../domain/ports/api-client.port').DispatchShipmentFrontend>;

  // Custom Infrastructure & Disaster State
  customAcopios: CustomAcopio[];
  customCampamentos: CustomCampamento[];
  customDesastres: CustomDesastre[];
  disasterTypes: DisasterTypeFrontend[];
  addAcopio: (acopio: Omit<CustomAcopio, 'id'>) => Promise<void>;
  updateAcopio: (id: string, payload: Partial<CustomAcopio>) => Promise<void>;
  deleteAcopio: (id: string) => Promise<void>;

  addCampamento: (camp: Omit<CustomCampamento, 'id'>) => Promise<void>;
  updateCampamento: (id: string, payload: Partial<CustomCampamento>) => Promise<void>;
  deleteCampamento: (id: string) => Promise<void>;

  addDesastre: (desastre: Omit<CustomDesastre, 'id'>) => Promise<void>;
  updateDesastre: (id: string, payload: Partial<CustomDesastre>) => Promise<void>;
  deleteDesastre: (id: string) => Promise<void>;

  // Venezuela States
  venezuelaStates: VenezuelaStateFrontend[];
  selectedStateId: number | null;
  setSelectedStateId: (id: number | null) => void;

  // User Management
  users: import('../../domain/ports/api-client.port').UserFrontend[];
  fetchUsers: () => Promise<void>;
  createUser: (payload: import('../../domain/ports/api-client.port').CreateUserPayloadFrontend) => Promise<import('../../domain/ports/api-client.port').UserFrontend>;
  deleteUser: (id: string) => Promise<boolean>;
}

const RecursosVEContext = createContext<RecursosVEContextType | undefined>(undefined);

const apiClient: ApiClientPort = new ApiClientAdapter();

export const RecursosVEProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState<boolean>(false);
  const [gaps, setGaps] = useState<GapAnalysisResult[]>([]);
  const [donations, setDonations] = useState<DonationFrontend[]>([]);
  const [learningMetrics, setLearningMetrics] = useState<LearningMetricsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiveSyncing, setIsLiveSyncing] = useState(false);

  const [customAcopios, setCustomAcopios] = useState<CustomAcopio[]>([]);
  const [customCampamentos, setCustomCampamentos] = useState<CustomCampamento[]>([]);
  const [customDesastres, setCustomDesastres] = useState<CustomDesastre[]>([]);
  const [disasterTypes, setDisasterTypes] = useState<DisasterTypeFrontend[]>([]);
  const [venezuelaStates, setVenezuelaStates] = useState<VenezuelaStateFrontend[]>(FALLBACK_VENEZUELA_STATES);
  const [selectedStateId, setSelectedStateId] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('recursosve_user');
      if (stored) {
        try {
          setCurrentUser(JSON.parse(stored));
        } catch {}
      }
      setAuthChecked(true);
    }
  }, []);

  const refreshData = async (silent: boolean = false) => {
    if (!silent && gaps.length === 0) {
      setIsLoading(true);
    }
    setIsLiveSyncing(true);
    try {
      const [gapData, donationsData, metricsData, disastersData, campsData, acopiosData, disasterTypesData, statesData] = await Promise.all([
        apiClient.getGapAnalysis(),
        apiClient.getDonations(),
        apiClient.getLearningMetrics(),
        apiClient.getDisasters(),
        apiClient.getCamps(),
        apiClient.getAcopios(),
        apiClient.getDisasterTypes(),
        apiClient.getStates(),
      ]);

      setGaps(gapData || []);
      setDonations(donationsData || []);
      setLearningMetrics(metricsData);
      if (disasterTypesData && disasterTypesData.length > 0) {
        setDisasterTypes(disasterTypesData);
      }
      if (statesData && statesData.length > 0) {
        setVenezuelaStates(statesData);
      }
      setCustomDesastres((disastersData as CustomDesastre[]) || []);
      setCustomCampamentos((campsData as CustomCampamento[]) || []);
      setCustomAcopios((acopiosData as CustomAcopio[]) || []);
    } catch (err) {
      console.error('Error fetching data from API adapter:', err);
    } finally {
      setIsLoading(false);
      setTimeout(() => setIsLiveSyncing(false), 800);
    }
  };

  useEffect(() => {
    refreshData(false);

    const interval = setInterval(() => {
      refreshData(true);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const login = async (email: string, pass: string): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await apiClient.login(email, pass);
      setCurrentUser(res.user);
      if (typeof window !== 'undefined') {
        localStorage.setItem('recursosve_user', JSON.stringify(res.user));
      }
      return res.user;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('recursosve_user');
    }
  };

  const createReport = async (payload: CreateReportPayload): Promise<NeedReport> => {
    const newReport = await apiClient.createReport(payload);
    await refreshData(true);
    return newReport;
  };

  const updateReportStatus = async (id: string, status: ReportStatus): Promise<void> => {
    await apiClient.updateReportStatus(id, status);
    await refreshData(true);
  };

  const offerDonation = async (payload: OfferDonationPayload): Promise<MatchResultFrontend> => {
    const match = await apiClient.offerDonation(payload);
    await refreshData(true);
    return match;
  };

  const addAcopio = async (acopio: Omit<CustomAcopio, 'id'>) => {
    const created = await apiClient.createAcopio(acopio);
    setCustomAcopios((prev) => [...prev, created as CustomAcopio]);
  };

  const updateAcopio = async (id: string, payload: Partial<CustomAcopio>) => {
    const updated = await apiClient.updateAcopio(id, payload);
    setCustomAcopios((prev) => prev.map((a) => (a.id === id ? { ...a, ...updated } : a)));
  };

  const deleteAcopio = async (id: string) => {
    await apiClient.deleteAcopio(id);
    setCustomAcopios((prev) => prev.filter((a) => a.id !== id));
  };

  const addCampamento = async (camp: Omit<CustomCampamento, 'id'>) => {
    const created = await apiClient.createCamp(camp);
    setCustomCampamentos((prev) => [...prev, created as CustomCampamento]);
  };

  const updateCampamento = async (id: string, payload: Partial<CustomCampamento>) => {
    const updated = await apiClient.updateCamp(id, payload);
    setCustomCampamentos((prev) => prev.map((c) => (c.id === id ? { ...c, ...updated } : c)));
  };

  const deleteCampamento = async (id: string) => {
    await apiClient.deleteCamp(id);
    setCustomCampamentos((prev) => prev.filter((c) => c.id !== id));
  };

  const addDesastre = async (desastre: Omit<CustomDesastre, 'id'>) => {
    const created = await apiClient.createDisaster(desastre);
    setCustomDesastres((prev) => [...prev, created as CustomDesastre]);
  };

  const updateDesastre = async (id: string, payload: Partial<CustomDesastre>) => {
    const updated = await apiClient.updateDisaster(id, payload);
    setCustomDesastres((prev) => prev.map((d) => (d.id === id ? { ...d, ...updated } : d)));
  };

  const deleteDesastre = async (id: string) => {
    await apiClient.deleteDisaster(id);
    setCustomDesastres((prev) => prev.filter((d) => d.id !== id));
  };

  const [users, setUsers] = useState<import('../../domain/ports/api-client.port').UserFrontend[]>([]);

  const fetchUsers = async () => {
    try {
      const data = await apiClient.getUsers();
      setUsers(data || []);
    } catch (err) {
      console.error('Error cargando usuarios:', err);
    }
  };

  const handleCreateUser = async (payload: import('../../domain/ports/api-client.port').CreateUserPayloadFrontend) => {
    const newUser = await apiClient.createUser(payload);
    await fetchUsers();
    return newUser;
  };

  const handleDeleteUser = async (id: string) => {
    const res = await apiClient.deleteUser(id);
    await fetchUsers();
    return res;
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <RecursosVEContext.Provider
      value={{
        currentUser,
        authChecked,
        login,
        logout,
        gaps,
        donations,
        learningMetrics,
        isLoading,
        isLiveSyncing,
        refreshData,
        createReport,
        updateReportStatus,
        offerDonation,
        processNlpReport: (text: string) => apiClient.processNlpReport(text),
        calculateRoute: (payload) => apiClient.calculateRoute(payload),
        submitReportFeedback: async (payload) => {
          const res = await apiClient.submitReportFeedback(payload);
          await refreshData(true);
          return res;
        },
        getAssignedShipment: (transportistaId) => apiClient.getAssignedShipment(transportistaId),
        updateShipmentStatus: (id, nuevoEstado) => apiClient.updateShipmentStatus(id, nuevoEstado),
        customAcopios,
        customCampamentos,
        customDesastres,
        disasterTypes,
        addAcopio,
        updateAcopio,
        deleteAcopio,
        addCampamento,
        updateCampamento,
        deleteCampamento,
        addDesastre,
        updateDesastre,
        deleteDesastre,
        venezuelaStates,
        selectedStateId,
        setSelectedStateId,
        users,
        fetchUsers,
        createUser: handleCreateUser,
        deleteUser: handleDeleteUser,
      }}
    >
      {children}
    </RecursosVEContext.Provider>
  );
};

export const useRecursosVE = (): RecursosVEContextType => {
  const context = useContext(RecursosVEContext);
  if (!context) {
    throw new Error('useRecursosVE must be used within a RecursosVEProvider');
  }
  return context;
};
