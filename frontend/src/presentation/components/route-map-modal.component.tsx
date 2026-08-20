'use client';

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { X, Truck, AlertTriangle, ShieldCheck, Clock, MapPin, Navigation, ArrowRight } from 'lucide-react';
import { useRecursosVE } from '../../application/context/recursosve-context';
import { RouteCalculationFrontend } from '../../domain/ports/api-client.port';

interface RouteMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  origen?: { lat: number; lng: number; nombre?: string };
  destino?: { lat: number; lng: number; nombre?: string };
  titulo?: string;
}

export const RouteMapModal: React.FC<RouteMapModalProps> = ({
  isOpen,
  onClose,
  origen = { lat: 10.601, lng: -66.932, nombre: 'Centro de Acopio La Guaira' },
  destino = { lat: 10.595, lng: -66.915, nombre: 'Refugio Carayaca Emergencia' },
  titulo = 'Agente 3: Ruteo Logístico Inteligente',
}) => {
  const { calculateRoute } = useRecursosVE();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  const [tipoVehiculo, setTipoVehiculo] = useState<string>('CAMION_350');
  const [routeResult, setRouteResult] = useState<RouteCalculationFrontend | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;

    const fetchRoute = async () => {
      setLoading(true);
      try {
        const res = await calculateRoute({
          origen,
          destino,
          tipoVehiculo,
          evitarZonasPeligro: true,
        });
        setRouteResult(res);
      } catch (err) {
        console.error('Error calculando ruta:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRoute();
  }, [isOpen, origen.lat, origen.lng, destino.lat, destino.lng, tipoVehiculo, calculateRoute]);

  // Leaflet map initialization and polyline rendering
  useEffect(() => {
    if (!isOpen || !mapContainerRef.current || !routeResult) return;

    // Destroy existing map if present
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
    }).setView([origen.lat, origen.lng], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap',
    }).addTo(map);

    mapInstanceRef.current = map;

    // Icons
    const greenIcon = L.divIcon({
      className: 'custom-map-pin',
      html: `<div style="background-color:#10B981; width:34px; height:34px; border-radius:50%; display:flex; align-items:center; justify-content:center; border:2px solid white; box-shadow:0 4px 6px rgba(0,0,0,0.3); color:white; font-weight:bold;">📦</div>`,
      iconSize: [34, 34],
      iconAnchor: [17, 17],
    });

    const redIcon = L.divIcon({
      className: 'custom-map-pin',
      html: `<div style="background-color:#EF4444; width:34px; height:34px; border-radius:50%; display:flex; align-items:center; justify-content:center; border:2px solid white; box-shadow:0 4px 6px rgba(0,0,0,0.3); color:white; font-weight:bold;">🏕️</div>`,
      iconSize: [34, 34],
      iconAnchor: [17, 17],
    });

    // Add Start & End Markers
    L.marker([origen.lat, origen.lng], { icon: greenIcon })
      .addTo(map)
      .bindPopup(`<b>Origen:</b> ${origen.nombre || 'Centro de Acopio'}`);

    L.marker([destino.lat, destino.lng], { icon: redIcon })
      .addTo(map)
      .bindPopup(`<b>Destino:</b> ${destino.nombre || 'Campamento de Refugio'}`);

    // Polyline color based on risk
    const polyColor =
      routeResult.nivelRiesgo === 'CRITICO'
        ? '#EF4444'
        : routeResult.nivelRiesgo === 'ALTO'
        ? '#F97316'
        : routeResult.nivelRiesgo === 'MEDIO'
        ? '#FBBF24'
        : '#06B6D4';

    const waypointsLatLngs: [number, number][] = routeResult.waypoints.map((w) => [w.lat, w.lng]);

    // Draw Route Polyline
    const polyline = L.polyline(waypointsLatLngs, {
      color: polyColor,
      weight: 6,
      opacity: 0.85,
      dashArray: routeResult.nivelRiesgo === 'CRITICO' ? '8, 8' : undefined,
    }).addTo(map);

    map.fitBounds(polyline.getBounds(), { padding: [40, 40] });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isOpen, routeResult, origen, destino]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Navigation className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-wide">{titulo}</h3>
              <p className="text-xs text-slate-400">Algoritmo de Ruteo Inteligente & Evaluación de Riesgo de Vías</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 overflow-hidden">
          
          {/* Left Panel - Route Details & Selector */}
          <div className="p-5 border-r border-slate-800 bg-slate-900/80 flex flex-col gap-4 overflow-y-auto max-h-[500px] md:max-h-none">
            
            {/* Vehicle Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Tipo de Vehículo Logístico
              </label>
              <select
                value={tipoVehiculo}
                onChange={(e) => setTipoVehiculo(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500"
              >
                <option value="CAMION_350">Camión 350 (Carga Pesada - 55 km/h)</option>
                <option value="PICKUP_4X4">Pick-up 4x4 (Todo Terreno - 65 km/h)</option>
                <option value="FURGON_PEQUEÑO">Furgón Pequeño (Insumos Médicos - 60 km/h)</option>
                <option value="AMBULANCIA">Ambulancia / Emergencia (75 km/h)</option>
              </select>
            </div>

            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-3">
                <Navigation className="w-8 h-8 animate-spin text-cyan-400" />
                <span className="text-sm">Calculando trayectoria óptima...</span>
              </div>
            ) : routeResult ? (
              <>
                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-800/80 border border-slate-700/60 p-3 rounded-xl">
                    <span className="text-xs text-slate-400 block mb-1">Distancia Total</span>
                    <span className="text-xl font-black text-cyan-400">{routeResult.distanciaKm} km</span>
                  </div>
                  <div className="bg-slate-800/80 border border-slate-700/60 p-3 rounded-xl">
                    <span className="text-xs text-slate-400 block mb-1">Tiempo Estimado (ETA)</span>
                    <span className="text-xl font-black text-amber-400">{routeResult.tiempoEstimadoMinutos} min</span>
                  </div>
                </div>

                {/* Risk Level Badge */}
                <div className="bg-slate-800/80 border border-slate-700/60 p-3 rounded-xl flex items-center justify-between">
                  <span className="text-xs text-slate-400">Nivel de Riesgo Vial</span>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      routeResult.nivelRiesgo === 'CRITICO'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                        : routeResult.nivelRiesgo === 'ALTO'
                        ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40'
                        : routeResult.nivelRiesgo === 'MEDIO'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    }`}
                  >
                    {routeResult.nivelRiesgo}
                  </span>
                </div>

                {/* Alerts */}
                {routeResult.alertasViales.length > 0 && (
                  <div className="bg-amber-950/40 border border-amber-800/50 p-3 rounded-xl space-y-1">
                    <div className="flex items-center gap-1.5 text-amber-400 font-semibold text-xs mb-1">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Alertas e Incidencias en la Ruta</span>
                    </div>
                    {routeResult.alertasViales.map((alerta, idx) => (
                      <p key={idx} className="text-xs text-amber-200/90 leading-tight">
                        • {alerta}
                      </p>
                    ))}
                  </div>
                )}

                {/* Waypoints timeline */}
                <div>
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Hoja de Ruta ({routeResult.waypoints.length} Tramos)
                  </h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {routeResult.waypoints.map((wp, i) => (
                      <div key={i} className="text-xs text-slate-300 bg-slate-800/40 p-2 rounded border border-slate-800 flex items-start gap-2">
                        <span className="text-cyan-400 font-mono font-bold">{i + 1}.</span>
                        <span>{wp.instruccion}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : null}
          </div>

          {/* Right Panel - Leaflet Interactive Map */}
          <div className="md:col-span-2 relative min-h-[350px] bg-slate-950">
            <div ref={mapContainerRef} className="w-full h-full min-h-[350px] z-10" />

            {/* Floating Origin-Destination Banner */}
            <div className="absolute top-3 left-3 right-3 z-[400] bg-slate-900/90 border border-slate-700/80 backdrop-blur-md p-3 rounded-xl flex items-center justify-between text-xs text-slate-200 shadow-xl">
              <div className="flex items-center gap-2 truncate">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                <span className="font-semibold truncate">{origen.nombre || 'Acopio'}</span>
              </div>
              <ArrowRight className="w-4 h-4 text-cyan-400 shrink-0 mx-2" />
              <div className="flex items-center gap-2 truncate">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" />
                <span className="font-semibold truncate">{destino.nombre || 'Refugio'}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm transition-colors"
          >
            Cerrar Visualizador
          </button>
        </div>

      </div>
    </div>
  );
};
