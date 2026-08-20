'use client';

import React, { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRecursosVE } from '../../application/context/recursosve-context';
import { ResourceCategory } from '../../domain/entities/report.entity';
import { HeartHandshake, MapPin, CheckCircle2, Truck, PackageCheck, History, ChevronRight } from 'lucide-react';
import { MatchResultFrontend } from '../../domain/ports/api-client.port';
import { FALLBACK_VENEZUELA_STATES } from '../../domain/entities/venezuela-states.data';

const LocationPickerMap = dynamic(
  () => import('../components/location-picker-map').then((mod) => mod.LocationPickerMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-64 md:h-80 rounded-2xl border border-slate-300 bg-slate-50 flex items-center justify-center text-xs text-slate-500 font-semibold shadow-inner">
        Cargando Mapa de Selección de Origen...
      </div>
    ),
  },
);

export interface SavedDonationRecord {
  id: string;
  donanteNombre: string;
  item: string;
  cantidad: number;
  unidad: string;
  origenUbicacion: string;
  fecha: string;
  matchResult: MatchResultFrontend;
}

interface DonorPortalViewProps {
  stateCodeParam?: string;
}

export const DonorPortalView: React.FC<DonorPortalViewProps> = ({ stateCodeParam }) => {
  const { offerDonation, selectedStateId, setSelectedStateId, venezuelaStates, donations } = useRecursosVE();

  const allStates = venezuelaStates.length > 0 ? venezuelaStates : FALLBACK_VENEZUELA_STATES;

  // Persistent donation history from localStorage
  const [savedDonations, setSavedDonations] = useState<SavedDonationRecord[]>([]);

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem('recursosve_donations_history');
      if (stored) {
        setSavedDonations(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Error loading donations history from localStorage', e);
    }
  }, []);

  // Sync stateCodeParam from URL to selectedStateId if present
  React.useEffect(() => {
    if (stateCodeParam) {
      const match = allStates.find((s) => s.codigo.toLowerCase() === stateCodeParam.toLowerCase());
      if (match && match.id !== selectedStateId) {
        setSelectedStateId(match.id);
      }
    }
  }, [stateCodeParam, allStates, selectedStateId, setSelectedStateId]);

  const activeState = useMemo(() => {
    if (selectedStateId) {
      const found = allStates.find((s) => s.id === selectedStateId);
      if (found) return found;
    }
    return allStates.find((s) => s.id === 22) || allStates[0] || null;
  }, [selectedStateId, allStates]);

  const [donanteNombre, setDonanteNombre] = useState('ONG Farmacéuticos Solidarios');
  const [categoria, setCategoria] = useState<ResourceCategory>(ResourceCategory.MEDICAMENTO);
  const [item, setItem] = useState('Insulina rápida');
  const [cantidad, setCantidad] = useState(80);
  const [unidad, setUnidad] = useState('dosis');
  
  // Coordinates for donation origin default to active state center
  const [lat, setLat] = useState(10.601);
  const [lng, setLng] = useState(-66.932);

  React.useEffect(() => {
    if (activeState) {
      setLat(activeState.lat);
      setLng(activeState.lng);
    }
  }, [activeState]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [matchResult, setMatchResult] = useState<MatchResultFrontend | null>(null);

  const origenUbicacion = `Coordenadas (${lat.toFixed(4)}, ${lng.toFixed(4)})`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const originStr = `Punto de Origen ${activeState?.nombre || 'Regional'} (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
      const match = await offerDonation({
        donanteNombre,
        categoria,
        item,
        cantidad: Number(cantidad),
        unidad,
        origenUbicacion: originStr,
        fechaDisponible: new Date().toISOString(),
      });
      setMatchResult(match);

      const record: SavedDonationRecord = {
        id: match.donacionId || `don_${Date.now()}`,
        donanteNombre,
        item,
        cantidad: Number(cantidad),
        unidad,
        origenUbicacion: originStr,
        fecha: new Date().toLocaleString(),
        matchResult: match,
      };

      setSavedDonations((prev) => {
        const updated = [record, ...prev];
        try {
          localStorage.setItem('recursosve_donations_history', JSON.stringify(updated));
        } catch (err) {
          console.error('Failed to save to localStorage', err);
        }
        return updated;
      });

      setTimeout(() => {
        const resultElement = document.getElementById('match-result-card');
        if (resultElement) {
          resultElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 100);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-red-700 via-red-600 to-amber-600 border border-red-800 p-6 rounded-3xl shadow-xl text-white">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-2.5">
            <HeartHandshake className="w-6 h-6 text-amber-200" />
            Portal de Donantes Dirigidos
          </h2>
          {activeState && (
            <span className="text-xs font-black bg-white/20 text-white border border-white/30 px-3 py-1 rounded-full flex items-center gap-1.5 backdrop-blur-xs">
              <MapPin className="w-3.5 h-3.5 text-amber-300" />
              Estado: {activeState.nombre}
            </span>
          )}
        </div>
        <p className="text-xs md:text-sm text-red-100 leading-relaxed font-medium">
          "Doná a quien más lo necesita primero": el Agente de Coordinación conecta tu donación directamente con las necesidades críticas en <strong>{activeState?.nombre || 'el estado seleccionado'}</strong>.
        </p>
      </div>

      {/* Match Result Display */}
      {matchResult && (
        <div id="match-result-card" className="p-6 md:p-8 rounded-3xl bg-white border-2 border-emerald-500 shadow-2xl space-y-5 animate-fadeIn ring-4 ring-emerald-500/20 scroll-mt-24">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-emerald-700 font-black text-base md:text-lg">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              <span>¡Emparejamiento Inteligente Exitoso!</span>
            </div>
            <button
              onClick={() => setMatchResult(null)}
              className="text-xs font-bold text-slate-500 hover:text-red-600 underline cursor-pointer"
            >
              Registrar otra donación
            </button>
          </div>

          {matchResult.reporteAsignado ? (
            <div className="bg-amber-50/80 p-5 rounded-2xl border border-amber-300 space-y-3">
              <div className="text-xs text-amber-900 uppercase font-black tracking-wider">Destino Asignado (Mayor Score)</div>
              <div className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-red-600" />
                {matchResult.reporteAsignado.campamento}
              </div>
              <p className="text-xs md:text-sm text-slate-800 font-medium">
                Necesidad satisfecha: <span className="font-extrabold text-red-700">{matchResult.reporteAsignado.necesidadCritica}</span>
              </p>
              {matchResult.reporteAsignado.contacto && (
                <p className="text-xs md:text-sm text-slate-800 font-semibold flex items-center gap-1.5">
                  <span className="text-slate-500 font-normal">Encargado Receptor:</span> {matchResult.reporteAsignado.contacto}
                </p>
              )}
              {matchResult.reporteAsignado.instruccionesEntrega && (
                <p className="text-xs text-slate-700 font-medium bg-amber-100/70 p-2.5 rounded-xl border border-amber-200">
                  📍 <span className="font-bold">Punto de Entrega:</span> {matchResult.reporteAsignado.instruccionesEntrega}
                </p>
              )}
              <div className="text-xs text-slate-600 font-bold">
                Distancia logística estimada: {matchResult.reporteAsignado.distanciaEstimadaKm} km
              </div>
            </div>
          ) : (
            <p className="text-xs md:text-sm text-slate-700 font-medium">
              Donación registrada en catálogo. Será asignada en cuanto se reporte una necesidad compatible.
            </p>
          )}

          {/* Tracking Timeline */}
          <div className="pt-4 border-t border-slate-200">
            <h4 className="text-xs font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Truck className="w-4 h-4 text-red-600" />
              Seguimiento del Envío en Tiempo Real
            </h4>
            <div className="space-y-4 relative pl-5 border-l-2 border-red-600">
              <div className="relative">
                <span className="absolute -left-[23px] top-0 w-3 h-3 rounded-full bg-red-600 ring-4 ring-red-100" />
                <p className="text-xs md:text-sm font-black text-red-700">Donación Confirmada</p>
                <p className="text-xs text-slate-500 font-medium">Origen: {origenUbicacion}</p>
              </div>
              <div className="relative">
                <span className="absolute -left-[23px] top-0 w-3 h-3 rounded-full bg-slate-300" />
                <p className="text-xs md:text-sm font-semibold text-slate-500">En preparación para despacho</p>
              </div>
              <div className="relative">
                <span className="absolute -left-[23px] top-0 w-3 h-3 rounded-full bg-slate-300" />
                <p className="text-xs md:text-sm font-semibold text-slate-500">Recepción en campamento</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <div className="bg-white border border-slate-200 p-6 md:p-8 rounded-3xl shadow-xl">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-5">
          Registrar Nueva Oferta de Donación
        </h3>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Donante / Organización
              </label>
              <input
                type="text"
                value={donanteNombre}
                onChange={(e) => setDonanteNombre(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-xs md:text-sm text-slate-900 focus:outline-none focus:border-red-600 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Categoría
              </label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value as ResourceCategory)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-xs md:text-sm text-slate-900 focus:outline-none focus:border-red-600 font-medium"
              >
                <option value={ResourceCategory.MEDICAMENTO}>Medicamentos / Insumos médicos</option>
                <option value={ResourceCategory.AGUA}>Agua potable</option>
                <option value={ResourceCategory.ALIMENTO}>Alimento no perecedero</option>
                <option value={ResourceCategory.ABRIGO}>Abrigo / Carpas</option>
                <option value={ResourceCategory.ROPA}>Ropa</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Ítem
              </label>
              <input
                type="text"
                value={item}
                onChange={(e) => setItem(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-xs md:text-sm text-slate-900 focus:outline-none focus:border-red-600 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Cantidad & Unidad
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={cantidad}
                  onChange={(e) => setCantidad(Number(e.target.value))}
                  required
                  min="1"
                  className="w-1/2 bg-slate-50 border border-slate-300 rounded-xl px-3 py-3 text-xs md:text-sm text-slate-900 focus:outline-none focus:border-red-600 font-medium"
                />
                <input
                  type="text"
                  value={unidad}
                  onChange={(e) => setUnidad(e.target.value)}
                  required
                  className="w-1/2 bg-slate-50 border border-slate-300 rounded-xl px-3 py-3 text-xs md:text-sm text-slate-900 focus:outline-none focus:border-red-600 font-medium"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Ubicación de Origen del Despacho (Selección en Mapa)
            </label>
            <LocationPickerMap
              lat={lat}
              lng={lng}
              onSelectLocation={(selectedLat, selectedLng) => {
                setLat(selectedLat);
                setLng(selectedLng);
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 px-6 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-amber-500/25 transition-all cursor-pointer"
          >
            <PackageCheck className="w-5 h-5" />
            {isSubmitting ? 'Buscando Coincidencia...' : 'Ofrecer Donación y Emparejar'}
          </button>
        </form>
      </div>

      {/* Registered Donations Database Table */}
      <div className="bg-white border border-slate-200 p-6 md:p-8 rounded-3xl shadow-xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base md:text-lg font-black text-slate-900 flex items-center gap-2">
              <History className="w-5 h-5 text-red-600" />
              Tabla de Donaciones Registradas en el Sistema
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Persistido en Base de Datos Backend ({donations.length || savedDonations.length} registro/s)
            </p>
          </div>
          <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full border border-emerald-300">
            Sincronización en Vivo
          </span>
        </div>

        {donations.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 font-black uppercase tracking-wider">
                  <th className="py-3 px-4">ID Donación</th>
                  <th className="py-3 px-4">Donante</th>
                  <th className="py-3 px-4">Recurso / Categoría</th>
                  <th className="py-3 px-4">Cantidad</th>
                  <th className="py-3 px-4">Origen</th>
                  <th className="py-3 px-4">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {donations.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/80 transition-colors font-medium text-slate-800">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-600">{d.id}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{d.donanteNombre}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-extrabold text-red-700">{d.item}</span>
                      <span className="block text-[10px] text-slate-400 font-semibold uppercase">{d.categoria}</span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{d.cantidad} {d.unidad}</td>
                    <td className="py-3.5 px-4 text-slate-600 text-[11px]">{d.origenUbicacion}</td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                        d.status === 'EN_TRANSITO' || d.status === 'ASIGNADA'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : d.status === 'ENTREGADA'
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          : 'bg-blue-100 text-blue-900 border border-blue-300'
                      }`}>
                        <Truck className="w-3 h-3" />
                        {d.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : savedDonations.length > 0 ? (
          <div className="space-y-4">
            {savedDonations.map((rec) => (
              <div
                key={rec.id}
                className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-3 hover:border-slate-300 transition-all"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-2">
                  <span className="text-xs font-black text-red-700 uppercase tracking-wider">
                    {rec.cantidad} {rec.unidad} de {rec.item}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500">
                    {rec.fecha}
                  </span>
                </div>

                {rec.matchResult.reporteAsignado ? (
                  <div className="space-y-2 text-xs md:text-sm text-slate-800">
                    <div className="flex items-center gap-2 font-bold text-slate-900">
                      <MapPin className="w-4 h-4 text-red-600 shrink-0" />
                      <span>Destino: {rec.matchResult.reporteAsignado.campamento}</span>
                    </div>
                    {rec.matchResult.reporteAsignado.contacto && (
                      <p className="text-xs text-slate-700 font-medium pl-6">
                        📞 <span className="font-bold">Contacto Receptor:</span> {rec.matchResult.reporteAsignado.contacto}
                      </p>
                    )}
                    {rec.matchResult.reporteAsignado.instruccionesEntrega && (
                      <p className="text-xs text-slate-700 font-medium bg-amber-50 p-2.5 rounded-xl border border-amber-200/70">
                        📍 <span className="font-bold">Punto de Entrega:</span> {rec.matchResult.reporteAsignado.instruccionesEntrega}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-slate-600 font-medium italic">
                    Donación registrada en catálogo, pendiente de emparejamiento.
                  </p>
                )}

                <div className="pt-2 flex items-center justify-between text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200">
                  <span className="flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-emerald-600" />
                    Estado del Despacho: En camino / Asignado
                  </span>
                  <span className="text-[10px] text-emerald-800 uppercase font-black">Activo</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs md:text-sm text-slate-500 italic text-center py-6">
            Aún no hay donaciones registradas en el catálogo.
          </p>
        )}
      </div>
    </div>
  );
};
