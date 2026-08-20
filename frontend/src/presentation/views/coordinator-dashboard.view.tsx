'use client';

import React, { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRecursosVE } from '../../application/context/recursosve-context';
import { UserRole } from '../../domain/entities/user.entity';
import { StatusBadge } from '../components/status-badge';
import { RegisterInfrastructureModal } from '../components/register-infrastructure-modal';
import { ManageInfrastructureListModal } from '../components/manage-infrastructure-list-modal';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Truck,
  PhoneCall,
  Radio,
  MapPin,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  PlusCircle,
  Settings2,
  Layers,
  X,
  Calendar,
  Clock,
  Navigation,
} from 'lucide-react';
import { ActionPlanType, GapAnalysisResult } from '../../domain/entities/gap-analysis.entity';
import { ReportStatus } from '../../domain/entities/report.entity';
import { FALLBACK_VENEZUELA_STATES } from '../../domain/entities/venezuela-states.data';

// Dynamically import Leaflet OpenStreetMap component for SSR safety in Next.js
const RealMap = dynamic(
  () => import('../components/real-map').then((mod) => mod.RealMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[450px] sm:h-[550px] md:h-[620px] lg:h-[680px] rounded-3xl border border-slate-300 bg-white flex items-center justify-center text-xs text-slate-500 font-semibold shadow-inner">
        Cargando Mapa de OpenStreetMap...
      </div>
    ),
  },
);

const RouteMapModal = dynamic(
  () => import('../components/route-map-modal.component').then((mod) => mod.RouteMapModal),
  { ssr: false }
);

const ITEMS_PER_PAGE = 8;

interface InfrastructureRowItem {
  id: string;
  nombre: string;
  tipo: 'CAMPAMENTO' | 'ACOPIO' | 'EMERGENCIA';
  detalles: string;
  coordinador: string;
  gaps: GapAnalysisResult[];
  maxCriticality: number;
  hasCritical: boolean;
}

interface CoordinatorDashboardViewProps {
  stateCodeParam?: string;
}

export const CoordinatorDashboardView: React.FC<CoordinatorDashboardViewProps> = ({ stateCodeParam }) => {
  const { gaps, customCampamentos, customAcopios, updateReportStatus, venezuelaStates, selectedStateId, setSelectedStateId, currentUser } = useRecursosVE();
  const router = useRouter();

  // RBAC Guard: Only COORDINADOR can view this dashboard
  React.useEffect(() => {
    if (currentUser) {
      if (currentUser.rol === UserRole.DONANTE) {
        router.push(stateCodeParam ? `/estado/${stateCodeParam}/donar` : '/donar');
      } else if (currentUser.rol === UserRole.BRIGADISTA) {
        router.push(stateCodeParam ? `/estado/${stateCodeParam}/reportar` : '/reportar');
      }
    }
  }, [currentUser, router, stateCodeParam]);

  if (currentUser && currentUser.rol !== UserRole.COORDINADOR) {
    return null;
  }

  const allStates = useMemo(() => {
    return venezuelaStates.length > 0 ? venezuelaStates : FALLBACK_VENEZUELA_STATES;
  }, [venezuelaStates]);

  // Sync stateCodeParam from URL to context state
  React.useEffect(() => {
    if (stateCodeParam) {
      const match = allStates.find(
        (st) => st.codigo.toLowerCase() === stateCodeParam.toLowerCase() || String(st.id) === stateCodeParam
      );
      if (match && match.id !== selectedStateId) {
        setSelectedStateId(match.id);
      }
    }
  }, [stateCodeParam, allStates, selectedStateId, setSelectedStateId]);

  const stateCenter = useMemo(() => {
    if (!selectedStateId) return null;
    const s = allStates.find((st) => st.id === selectedStateId);
    return s ? { lat: s.lat, lng: s.lng, zoom: s.zoom } : null;
  }, [selectedStateId, allStates]);

  const selectedStateName = useMemo(() => {
    if (!selectedStateId) return null;
    return allStates.find((st) => st.id === selectedStateId)?.nombre ?? null;
  }, [selectedStateId, allStates]);
  const [tableFilter, setTableFilter] = useState<'TODAS' | 'ACTIVAS' | 'RESUELTAS'>('TODAS');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedInfraModalItem, setSelectedInfraModalItem] = useState<InfrastructureRowItem | null>(null);

  // Modal & Map Location Picker State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [isRouteModalOpen, setIsRouteModalOpen] = useState(false);
  const [isSelectingLocation, setIsSelectingLocation] = useState(false);
  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number } | null>(null);

  const handleFilterChange = (filter: 'TODAS' | 'ACTIVAS' | 'RESUELTAS') => {
    setTableFilter(filter);
    setCurrentPage(1);
  };

  const handleEnableMapPicker = () => {
    setIsModalOpen(false);
    setIsSelectingLocation(true);
  };

  const handleSelectLocationOnMap = (lat: number, lng: number) => {
    setSelectedCoords({ lat, lng });
    setIsSelectingLocation(false);
    setIsModalOpen(true);
  };

  // Filter infrastructure and gaps by selectedStateId
  const stateCampamentos = useMemo(() => {
    if (!selectedStateId) return customCampamentos;
    return customCampamentos.filter((c) => c.estadoId === selectedStateId || (!c.estadoId && selectedStateId === 22));
  }, [customCampamentos, selectedStateId]);

  const stateAcopios = useMemo(() => {
    if (!selectedStateId) return customAcopios;
    return customAcopios.filter((a) => a.estadoId === selectedStateId || (!a.estadoId && selectedStateId === 22));
  }, [customAcopios, selectedStateId]);

  // Group Gaps by Infrastructure
  const infrastructureItems = useMemo<InfrastructureRowItem[]>(() => {
    const items: InfrastructureRowItem[] = [];

    // 1. Campamentos Registrados en el Estado
    stateCampamentos.forEach((cc) => {
      const campGaps = gaps.filter(
        (g) =>
          g.report.zona.infrastructureId === cc.id ||
          g.report.zona.campamento.toLowerCase().includes(cc.nombre.toLowerCase()) ||
          cc.nombre.toLowerCase().includes(g.report.zona.campamento.toLowerCase()),
      );
      const maxCriticality = campGaps.reduce((max, g) => Math.max(max, g.criticalityScore), 0);
      const hasCritical = campGaps.some((g) => g.report.status === ReportStatus.SIN_COBERTURA);

      items.push({
        id: `camp_${cc.id}`,
        nombre: cc.nombre,
        tipo: 'CAMPAMENTO',
        detalles: `👥 ${cc.poblacion} hab (${cc.familias} familias)`,
        coordinador: cc.coordinador,
        gaps: campGaps,
        maxCriticality,
        hasCritical,
      });
    });

    // 2. Centros de Acopio Registrados en el Estado
    stateAcopios.forEach((ca) => {
      const acopioGaps = gaps.filter(
        (g) =>
          g.report.zona.infrastructureId === ca.id ||
          g.report.zona.campamento.toLowerCase().includes(ca.nombre.toLowerCase()) ||
          ca.nombre.toLowerCase().includes(g.report.zona.campamento.toLowerCase()),
      );
      const maxCriticality = acopioGaps.reduce((max, g) => Math.max(max, g.criticalityScore), 0);
      const hasCritical = acopioGaps.some((g) => g.report.status === ReportStatus.SIN_COBERTURA);

      items.push({
        id: `acopio_${ca.id}`,
        nombre: `Centro de Acopio ${ca.nombre}`,
        tipo: 'ACOPIO',
        detalles: `📦 Stock: ${ca.stockInfo}`,
        coordinador: ca.contacto,
        gaps: acopioGaps,
        maxCriticality,
        hasCritical,
      });
    });

    return items.sort((a, b) => b.maxCriticality - a.maxCriticality);
  }, [stateCampamentos, stateAcopios, gaps]);

  // Filter Infrastructure items based on tab filter
  const filteredInfraItems = useMemo(() => {
    return infrastructureItems.filter((item) => {
      if (tableFilter === 'TODAS') return true;
      if (tableFilter === 'ACTIVAS') return item.gaps.some((g) => g.report.status !== ReportStatus.CUBIERTA && (g.report.status as string) !== 'CUBIERTO');
      if (tableFilter === 'RESUELTAS') return item.gaps.length > 0 && item.gaps.every((g) => g.report.status === ReportStatus.CUBIERTA || (g.report.status as string) === 'CUBIERTO');
      return true;
    });
  }, [infrastructureItems, tableFilter]);

  const totalPages = Math.ceil(filteredInfraItems.length / ITEMS_PER_PAGE) || 1;
  const paginatedInfraItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredInfraItems.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredInfraItems, currentPage]);

  const stateGaps = useMemo(() => {
    return infrastructureItems.flatMap((item) => item.gaps);
  }, [infrastructureItems]);

  const activasCount = useMemo(() => stateGaps.filter((g) => g.report.status === ReportStatus.SIN_COBERTURA).length, [stateGaps]);
  const enTransitoCount = useMemo(() => stateGaps.filter((g) => g.report.status === ReportStatus.EN_TRANSITO || g.report.status === ReportStatus.PARCIAL).length, [stateGaps]);
  const resueltasCount = useMemo(() => stateGaps.filter((g) => g.report.status === ReportStatus.CUBIERTA || (g.report.status as string) === 'CUBIERTO').length, [stateGaps]);

  return (
    <div className="space-y-6 w-full">
      {/* Infrastructure Registration Modal */}
      <RegisterInfrastructureModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedCoords(null);
        }}
        selectedCoords={selectedCoords}
        onEnableMapPicker={handleEnableMapPicker}
      />

      {/* Route Map Modal for Agente 3 */}
      <RouteMapModal
        isOpen={isRouteModalOpen}
        onClose={() => setIsRouteModalOpen(false)}
      />

      {/* Infrastructure Management (Edit/Delete) Modal */}
      <ManageInfrastructureListModal
        isOpen={isManageModalOpen}
        onClose={() => setIsManageModalOpen(false)}
      />

      {/* 1. Map & Filters Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        {/* Top Command Header Banner */}
        <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-3xl p-6 md:p-7 shadow-xl relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Top Gradient Accent Line */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-600 via-red-500 to-amber-500 rounded-t-3xl" />
          
          {/* Ambient Glow Effects */}
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Left Column: Status Badge, Title & State Selector */}
          <div className="relative z-10 space-y-2.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-700 font-extrabold text-[11px] uppercase tracking-wider shadow-xs">
                <Radio className="w-3.5 h-3.5 text-red-600 animate-pulse" />
                Centro de Mando Logístico (Zona Cero)
              </span>

              <Link
                href="/"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 font-extrabold text-[11px] transition-colors shadow-xs"
              >
                <MapPin className="w-3.5 h-3.5 text-red-600" />
                <span>Estado: <strong>{selectedStateName || 'La Guaira'}</strong> (Cambiar)</span>
              </Link>
            </div>

            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              {selectedStateName ? `Estado ${selectedStateName}` : 'Centro de Mando Regional'}
            </h2>

            <div className="flex items-center gap-3 text-xs md:text-sm text-slate-600 font-medium flex-wrap">
              <span>Gestión Territorial de Emergencias</span>
              <span className="text-slate-300">•</span>
              <span className="inline-flex items-center gap-1 font-bold text-red-700 bg-red-50 px-2.5 py-0.5 rounded-lg border border-red-100">
                ⛺ {stateCampamentos.length} refugios
              </span>
              <span className="inline-flex items-center gap-1 font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-200">
                📦 {stateAcopios.length} acopios
              </span>
            </div>
          </div>

          {/* Right Column: Action Buttons */}
          <div className="relative z-10 flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => setIsRouteModalOpen(true)}
              className="flex items-center gap-2 px-4 py-3 bg-cyan-950/80 hover:bg-cyan-900 text-cyan-200 rounded-2xl font-black text-xs shadow-md transition-all border border-cyan-700/50 cursor-pointer"
            >
              <Navigation className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span>🛣️ Agente 3: Ruteo Logístico</span>
            </button>

            <button
              onClick={() => setIsManageModalOpen(true)}
              className="flex items-center gap-2 px-4 py-3 bg-white hover:bg-slate-50 text-slate-800 rounded-2xl font-black text-xs shadow-sm hover:shadow-md transition-all border-2 border-slate-200 hover:border-slate-300 cursor-pointer"
            >
              <Settings2 className="w-4 h-4 text-amber-600" />
              <span>Gestionar Registrados</span>
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2.5 px-5 py-3 bg-gradient-to-r from-red-600 via-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white rounded-2xl font-black text-xs shadow-lg shadow-red-600/25 hover:shadow-xl transition-all border border-red-500/30 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-amber-200" />
              <span>+ Registrar Infraestructura</span>
            </button>
          </div>
        </div>

        {/* Map Filters & RealMap */}
        <RealMap
          isSelectingLocation={isSelectingLocation}
          onSelectLocation={handleSelectLocationOnMap}
          selectedCoords={selectedCoords}
          stateCenter={stateCenter}
        />
      </div>

      {/* 2. Stats & Gap Table Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Stats Summary Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Card 1: Sin Cobertura */}
          <div className="bg-gradient-to-br from-red-50/80 via-white to-red-50/30 border border-red-200 p-5 rounded-3xl shadow-lg shadow-red-500/5 flex items-center justify-between gap-4 hover:border-red-300 transition-all">
            <div>
              <span className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight block">
                {activasCount}
              </span>
              <span className="text-xs font-black text-red-700 uppercase tracking-wider block mt-0.5">
                Sin Cobertura
              </span>
              <span className="text-[11px] font-medium text-slate-500 block mt-1">
                Requieren atención urgente
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-red-100/80 border border-red-200 flex items-center justify-center text-red-600 shrink-0">
              <AlertCircle className="w-6 h-6" />
            </div>
          </div>

          {/* Card 2: En Tránsito / Parcial */}
          <div className="bg-gradient-to-br from-amber-50/80 via-white to-amber-50/30 border border-amber-200 p-5 rounded-3xl shadow-lg shadow-amber-500/5 flex items-center justify-between gap-4 hover:border-amber-300 transition-all">
            <div>
              <span className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight block">
                {enTransitoCount}
              </span>
              <span className="text-xs font-black text-amber-700 uppercase tracking-wider block mt-0.5">
                En Tránsito / Parcial
              </span>
              <span className="text-[11px] font-medium text-slate-500 block mt-1">
                Respuestas en proceso
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-100/80 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
              <Truck className="w-6 h-6" />
            </div>
          </div>

          {/* Card 3: Resueltas Hoy */}
          <div className="bg-gradient-to-br from-emerald-50/80 via-white to-emerald-50/30 border border-emerald-200 p-5 rounded-3xl shadow-lg shadow-emerald-500/5 flex items-center justify-between gap-4 hover:border-emerald-300 transition-all">
            <div>
              <span className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight block">
                {resueltasCount}
              </span>
              <span className="text-xs font-black text-emerald-700 uppercase tracking-wider block mt-0.5">
                Resueltas Hoy
              </span>
              <span className="text-[11px] font-medium text-slate-500 block mt-1">
                Brechas 100% cubiertas
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-100/80 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Infrastructure Centric Table */}
        <div className="bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden">
          {/* Table Header / Tab Filter Bar */}
          <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Layers className="w-4 h-4 text-red-600" />
                Infraestructuras Logísticas & Brechas Asociadas
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Campamentos y Centros de Acopio con brechas agrupadas (haz clic en una fila para expandir)
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-slate-200/80 p-1 rounded-2xl border border-slate-300/60 self-start sm:self-auto">
              <button
                onClick={() => handleFilterChange('TODAS')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  tableFilter === 'TODAS'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-300/50'
                }`}
              >
                Todas ({infrastructureItems.length})
              </button>
              <button
                onClick={() => handleFilterChange('ACTIVAS')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  tableFilter === 'ACTIVAS'
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'text-red-700 hover:text-red-900 hover:bg-red-100/50'
                }`}
              >
                Con Brechas
              </button>
              <button
                onClick={() => handleFilterChange('RESUELTAS')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  tableFilter === 'RESUELTAS'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-emerald-700 hover:text-emerald-900 hover:bg-emerald-100/50'
                }`}
              >
                Atendidas / Sin Brechas
              </button>
            </div>
          </div>

          {/* Infrastructure Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/80 border-b border-slate-200 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Infraestructura / Refugio</th>
                  <th className="py-3 px-4">Tipo</th>
                  <th className="py-3 px-4">Detalles / Capacidad</th>
                  <th className="py-3 px-4 text-center">Brechas Activas</th>
                  <th className="py-3 px-4 text-center">Score Máx.</th>
                  <th className="py-3 px-4">Estado General</th>
                  <th className="py-3 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {paginatedInfraItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500 font-medium">
                      No hay infraestructuras para mostrar con este filtro.
                    </td>
                  </tr>
                ) : (
                  paginatedInfraItems.map((item) => {
                    const activeGapsCount = item.gaps.filter(
                      (g) => g.report.status !== ReportStatus.CUBIERTA && (g.report.status as string) !== 'CUBIERTO',
                    ).length;

                    return (
                      <tr
                        key={item.id}
                        onClick={() => setSelectedInfraModalItem(item)}
                        className={`hover:bg-slate-50 transition-colors cursor-pointer ${
                          item.hasCritical ? 'bg-red-50/30' : ''
                        }`}
                      >
                        {/* 1. Nombre */}
                        <td className="py-3.5 px-4 font-black text-slate-900">
                          <div className="flex items-center gap-2">
                            <span>
                              {item.tipo === 'CAMPAMENTO' && '⛺ '}
                              {item.tipo === 'ACOPIO' && '📦 '}
                              {item.tipo === 'EMERGENCIA' && '📍 '}
                              {item.nombre}
                            </span>
                          </div>
                        </td>

                        {/* 2. Tipo Badge */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={`px-2.5 py-1 rounded-lg font-black text-[10px] uppercase tracking-wider ${
                              item.tipo === 'CAMPAMENTO'
                                ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                : item.tipo === 'ACOPIO'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : 'bg-amber-100 text-amber-800 border border-amber-200'
                            }`}
                          >
                            {item.tipo}
                          </span>
                        </td>

                        {/* 3. Detalles */}
                        <td className="py-3.5 px-4 text-slate-600 font-medium whitespace-nowrap">
                          {item.detalles}
                        </td>

                        {/* 4. Brechas Activas Count */}
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          {activeGapsCount > 0 ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-100 text-red-800 font-black text-[11px] border border-red-200">
                              ⚠️ {activeGapsCount} brechas
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                              🟢 Sin brechas
                            </span>
                          )}
                        </td>

                        {/* 5. Score Máximo */}
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          {item.maxCriticality > 0 ? (
                            <span
                              className={`inline-flex items-center justify-center px-2 py-0.5 rounded-md font-black text-[11px] ${
                                item.maxCriticality >= 50
                                  ? 'bg-red-100 text-red-800 border border-red-200'
                                  : 'bg-amber-100 text-amber-800 border border-amber-200'
                              }`}
                            >
                              {item.maxCriticality} pts
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">—</span>
                          )}
                        </td>

                        {/* 6. Estado General */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {item.hasCritical ? (
                            <span className="px-2.5 py-1 rounded-lg bg-red-600 text-white font-black text-[10px] uppercase">
                              🔴 CRÍTICO
                            </span>
                          ) : activeGapsCount > 0 ? (
                            <span className="px-2.5 py-1 rounded-lg bg-amber-500 text-white font-black text-[10px] uppercase">
                              🟡 ATENCIÓN PARCIAL
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-black text-[10px] uppercase">
                              🟢 ATENDIDO
                            </span>
                          )}
                        </td>

                        {/* 7. Action Button */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedInfraModalItem(item);
                            }}
                            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-xl shadow-sm transition-all cursor-pointer"
                          >
                            Ver Brechas ({item.gaps.length})
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Client Side Pagination Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-slate-500 font-medium">
              Mostrando <strong className="text-slate-800">{paginatedInfraItems.length}</strong> de{' '}
              <strong className="text-slate-800">{filteredInfraItems.length}</strong> infraestructuras
            </span>

            {/* Page Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className="p-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="px-3 py-1 font-bold text-slate-800">
                Página {currentPage} de {totalPages}
              </span>

              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                className="p-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Gaps & Needs Modal */}
      {selectedInfraModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
                  <span>{selectedInfraModalItem.tipo}</span>
                  <span>•</span>
                  <span>Contacto: {selectedInfraModalItem.coordinador}</span>
                </div>
                <h3 className="text-lg font-black tracking-tight text-white">
                  📋 Brechas en {selectedInfraModalItem.nombre}
                </h3>
              </div>

              <button
                onClick={() => setSelectedInfraModalItem(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content - List of Gaps */}
            <div className="p-5 overflow-y-auto space-y-4 divide-y divide-slate-100 flex-1">
              {selectedInfraModalItem.gaps.length === 0 ? (
                <div className="py-12 text-center text-slate-500 font-medium space-y-2">
                  <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <p className="text-sm">No hay brechas o necesidades pendientes para esta infraestructura.</p>
                </div>
              ) : (
                selectedInfraModalItem.gaps.map((gap) => {
                  const isCovered =
                    gap.report.status === ReportStatus.CUBIERTA ||
                    (gap.report.status as string) === 'CUBIERTO';

                  const createdAtFormatted = gap.report.createdAt
                    ? new Date(gap.report.createdAt).toLocaleString('es-VE', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })
                    : 'N/A';

                  const resolvedAtFormatted = gap.report.resolvedAt
                    ? new Date(gap.report.resolvedAt).toLocaleString('es-VE', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })
                    : null;

                  return (
                    <div key={gap.report.id} className="pt-4 first:pt-0 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-black text-slate-900 text-base">
                              {gap.report.recurso.item}
                            </span>
                            <span className="font-bold text-slate-600 text-xs bg-slate-100 px-2 py-0.5 rounded-md">
                              {gap.report.recurso.cantidadRequerida} {gap.report.recurso.unidad}
                            </span>
                            <span className="px-2 py-0.5 bg-red-50 text-red-700 font-black text-[10px] rounded-md border border-red-200">
                              Score: {gap.criticalityScore} pts
                            </span>
                          </div>

                          <p className="text-xs text-slate-600">
                            <strong>Plan Sugerido:</strong> {gap.accionRecomendada.instruccionDetallada}
                          </p>

                          {/* Timestamps Section */}
                          <div className="flex items-center gap-4 text-[11px] text-slate-500 font-medium pt-1">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              <strong>Reportado:</strong> {createdAtFormatted}
                            </span>

                            {resolvedAtFormatted && (
                              <span className="flex items-center gap-1 text-emerald-700 font-bold">
                                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                                <strong>Cubierto:</strong> {resolvedAtFormatted}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <StatusBadge status={gap.report.status} />

                          {isCovered ? (
                            <span className="text-emerald-700 font-bold text-xs bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                              ✓ Cubierta
                            </span>
                          ) : (
                            <button
                              onClick={() => {
                                updateReportStatus(gap.report.id, ReportStatus.CUBIERTA);
                                // Refresh modal state dynamically
                                setSelectedInfraModalItem((prev) => {
                                  if (!prev) return null;
                                  return {
                                    ...prev,
                                    gaps: prev.gaps.map((g) =>
                                      g.report.id === gap.report.id
                                        ? {
                                            ...g,
                                            report: {
                                              ...g.report,
                                              status: ReportStatus.CUBIERTA,
                                              resolvedAt: new Date().toISOString(),
                                            },
                                          }
                                        : g,
                                    ),
                                  };
                                });
                              }}
                              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-sm transition-all cursor-pointer"
                            >
                              Marcar Cubierta
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedInfraModalItem(null)}
                className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
