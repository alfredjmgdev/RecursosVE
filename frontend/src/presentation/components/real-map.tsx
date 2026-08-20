'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Filter, Layers, Package, Zap, Truck, ShieldAlert, Home, MapPin, CheckCircle2, LocateFixed } from 'lucide-react';
import { useRecursosVE } from '../../application/context/recursosve-context';
import { ReportStatus } from '../../domain/entities/report.entity';
import { getDisasterTheme } from '../../domain/entities/disaster-palette';
import { GapAnalysisResult } from '../../domain/entities/gap-analysis.entity';
import { FALLBACK_VENEZUELA_STATES } from '../../domain/entities/venezuela-states.data';

export type SiteFilterType = 'TODOS' | 'CAMPAMENTOS' | 'ACOPIOS';
export type DisasterFilterType = 'TODOS' | 'NINGUNO' | string;
export type StatusFilterType = 'TODAS' | 'CRITICOS' | 'REDISTRIBUCION' | 'TRANSITO';

interface RealMapProps {
  isSelectingLocation?: boolean;
  onSelectLocation?: (lat: number, lng: number) => void;
  selectedCoords?: { lat: number; lng: number } | null;
  stateCenter?: { lat: number; lng: number; zoom: number } | null;
}

export const RealMap: React.FC<RealMapProps> = ({
  isSelectingLocation = false,
  onSelectLocation,
  selectedCoords,
  stateCenter,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  const dynamicMarkersGroupRef = useRef<L.LayerGroup | null>(null);
  const acopiosGroupRef = useRef<L.LayerGroup | null>(null);
  const campamentosGroupRef = useRef<L.LayerGroup | null>(null);
  const customDesastresGroupRef = useRef<L.LayerGroup | null>(null);
  const selectionMarkerRef = useRef<L.Marker | null>(null);

  const [siteFilter, setSiteFilter] = useState<SiteFilterType>('TODOS');
  const [selectedDisasterTypes, setSelectedDisasterTypes] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilterType>('TODAS');
  const { gaps, customAcopios, customCampamentos, customDesastres, disasterTypes, selectedStateId, venezuelaStates } = useRecursosVE();

  const allStates = venezuelaStates.length > 0 ? venezuelaStates : FALLBACK_VENEZUELA_STATES;
  const activeState = useMemo(() => {
    if (selectedStateId) {
      const found = allStates.find((s) => s.id === selectedStateId);
      if (found) return found;
    }
    return allStates.find((s) => s.id === 22) || allStates[0] || null;
  }, [selectedStateId, allStates]);

  const handleRecenterState = () => {
    const targetLat = activeState?.lat ?? stateCenter?.lat ?? 10.601;
    const targetLng = activeState?.lng ?? stateCenter?.lng ?? -66.932;
    const targetZoom = activeState?.zoom ?? stateCenter?.zoom ?? 12;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([targetLat, targetLng], targetZoom);
    }
  };

  const stateAcopios = useMemo(() => {
    if (!selectedStateId) return customAcopios;
    return customAcopios.filter((a) => a.estadoId === selectedStateId || (!a.estadoId && selectedStateId === 22));
  }, [customAcopios, selectedStateId]);

  const stateCampamentos = useMemo(() => {
    if (!selectedStateId) return customCampamentos;
    return customCampamentos.filter((c) => c.estadoId === selectedStateId || (!c.estadoId && selectedStateId === 22));
  }, [customCampamentos, selectedStateId]);

  const stateDesastres = useMemo(() => {
    if (!selectedStateId) return customDesastres;
    return customDesastres.filter((d) => d.estadoId === selectedStateId || (!d.estadoId && selectedStateId === 22));
  }, [customDesastres, selectedStateId]);

  const availableDisasterTypes = useMemo(() => {
    return Array.from(new Set(stateDesastres.map((d) => d.tipo)));
  }, [stateDesastres]);

  // Auto-select all available disaster types on initial data load / state change
  useEffect(() => {
    if (availableDisasterTypes.length > 0) {
      setSelectedDisasterTypes(availableDisasterTypes);
    } else {
      setSelectedDisasterTypes([]);
    }
  }, [availableDisasterTypes]);

  const disasterCountsByType = useMemo(() => {
    const counts: Record<string, number> = {};
    stateDesastres.forEach((d) => {
      counts[d.tipo] = (counts[d.tipo] || 0) + 1;
    });
    return counts;
  }, [stateDesastres]);

  const toggleDisasterType = (tipo: string) => {
    setSelectedDisasterTypes((prev) =>
      prev.includes(tipo) ? prev.filter((t) => t !== tipo) : [...prev, tipo]
    );
  };

  const isAllDisastersSelected =
    availableDisasterTypes.length > 0 &&
    availableDisasterTypes.every((t) => selectedDisasterTypes.includes(t));
  const isNoDisasterSelected = selectedDisasterTypes.length === 0;

  // Helper function to create custom Leaflet markers
  const createCategoryIcon = (
    colorHex: string,
    label: string,
    typeLabel: string,
    symbol: string
  ) => {
    return L.divIcon({
      className: 'custom-humanitarian-marker',
      html: `
        <div style="display:inline-flex; align-items:center; gap:6px; background:rgba(255, 255, 255, 0.98); border:2px solid ${colorHex}; padding:5px 10px; border-radius:12px; box-shadow:0 8px 20px -4px rgba(0,0,0,0.25); white-space:nowrap; width:max-content; cursor:pointer;">
          <span style="font-size:13px; line-height:1;">${symbol}</span>
          <div style="display:flex; flex-direction:column;">
            <span style="color:${colorHex}; font-size:8px; font-weight:900; text-transform:uppercase; letter-spacing:0.04em; font-family:sans-serif;">${typeLabel}</span>
            <span style="color:#0f172a; font-size:10px; font-weight:800; font-family:sans-serif;">${label}</span>
          </div>
        </div>
      `,
      iconSize: [0, 0],
      iconAnchor: [60, 18],
    });
  };

  // Effect 1: Initialize Leaflet Map ONCE on mount
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const defaultCenter: [number, number] = stateCenter
      ? [stateCenter.lat, stateCenter.lng]
      : [10.601, -66.932];
    const defaultZoom = stateCenter ? stateCenter.zoom : 13;

    const map = L.map(mapContainerRef.current, {
      center: defaultCenter,
      zoom: defaultZoom,
      zoomControl: true,
    });

    // TileLayer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    // LayerGroup for Centros de Acopio
    const acopiosGroup = L.layerGroup().addTo(map);
    acopiosGroupRef.current = acopiosGroup;

    // LayerGroup for Active Refugee Camps
    const campamentosGroup = L.layerGroup().addTo(map);
    campamentosGroupRef.current = campamentosGroup;

    // LayerGroup for Custom User Registered Disaster Circles
    const customDesastresGroup = L.layerGroup().addTo(map);
    customDesastresGroupRef.current = customDesastresGroup;

    // LayerGroup for dynamic gap markers
    const dynamicGroup = L.layerGroup().addTo(map);
    dynamicMarkersGroupRef.current = dynamicGroup;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      dynamicMarkersGroupRef.current = null;
      acopiosGroupRef.current = null;
      campamentosGroupRef.current = null;
      customDesastresGroupRef.current = null;
    };
  }, []);

  const stateCenterKey = stateCenter ? `${stateCenter.lat}_${stateCenter.lng}_${stateCenter.zoom}` : '';
  const lastCenteredKeyRef = useRef<string>('');

  // Effect to re-center map ONLY when switching to a different state center
  useEffect(() => {
    if (!mapInstanceRef.current || !stateCenter || !stateCenterKey) return;
    if (lastCenteredKeyRef.current !== stateCenterKey) {
      lastCenteredKeyRef.current = stateCenterKey;
      mapInstanceRef.current.setView([stateCenter.lat, stateCenter.lng], stateCenter.zoom, {
        animate: true,
      });
    }
  }, [stateCenterKey, stateCenter]);

  // Effect for Map Click Event Handler (Point Selection Mode)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const handleMapClick = (e: L.LeafletMouseEvent) => {
      if (isSelectingLocation && onSelectLocation) {
        onSelectLocation(e.latlng.lat, e.latlng.lng);
      }
    };

    if (isSelectingLocation) {
      map.on('click', handleMapClick);
      map.getContainer().style.cursor = 'crosshair';
      map.getContainer().classList.add('selecting-location-active');
    } else {
      map.off('click', handleMapClick);
      map.getContainer().style.cursor = '';
      map.getContainer().classList.remove('selecting-location-active');
    }

    return () => {
      map.off('click', handleMapClick);
      map.getContainer().classList.remove('selecting-location-active');
    };
  }, [isSelectingLocation, onSelectLocation]);

  // Effect to render temporary pin marker for selectedCoords
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (selectionMarkerRef.current) {
      map.removeLayer(selectionMarkerRef.current);
      selectionMarkerRef.current = null;
    }

    if (selectedCoords) {
      const pinIcon = L.divIcon({
        className: 'custom-selection-pin',
        html: `
          <div style="background:#dc2626; color:white; border:3px solid #fef08a; padding:6px 12px; border-radius:14px; font-weight:900; font-size:11px; font-family:sans-serif; box-shadow:0 10px 25px rgba(220,38,38,0.5); white-space:nowrap; animation:pulse 1.5s infinite;">
            📍 Punto Seleccionado (${selectedCoords.lat.toFixed(4)}, ${selectedCoords.lng.toFixed(4)})
          </div>
        `,
        iconSize: [0, 0],
        iconAnchor: [70, 20],
      });

      const pinMarker = L.marker([selectedCoords.lat, selectedCoords.lng], { icon: pinIcon }).addTo(map);
      selectionMarkerRef.current = pinMarker;
    }
  }, [selectedCoords, onSelectLocation]);

  // Effect 2: Filter and render markers dynamically based on siteFilter, disasterFilter & statusFilter
  useEffect(() => {
    if (!dynamicMarkersGroupRef.current || !acopiosGroupRef.current || !campamentosGroupRef.current || !customDesastresGroupRef.current) return;

    // Helper to filter gaps for status
    const filterGapsByStatus = (rawGaps: GapAnalysisResult[]) => {
      if (statusFilter === 'TODAS') return rawGaps;
      if (statusFilter === 'CRITICOS') return rawGaps.filter((g) => g.report.status === ReportStatus.SIN_COBERTURA);
      if (statusFilter === 'REDISTRIBUCION')
        return rawGaps.filter((g) => g.report.status === ReportStatus.PARCIAL || g.inventarioLocalDisponibleKm !== undefined);
      if (statusFilter === 'TRANSITO') return rawGaps.filter((g) => g.report.status === ReportStatus.EN_TRANSITO);
      return rawGaps;
    };

    // Render Custom Acopios dynamically
    acopiosGroupRef.current.clearLayers();
    stateAcopios.forEach((ca) => {
      const allAcopioGaps = gaps.filter(
        (g) =>
          g.report.zona.infrastructureId === ca.id ||
          g.report.zona.campamento.toLowerCase().includes(ca.nombre.toLowerCase()) ||
          ca.nombre.toLowerCase().includes(g.report.zona.campamento.toLowerCase()),
      );
      const acopioGaps = filterGapsByStatus(allAcopioGaps);

      if (statusFilter !== 'TODAS' && acopioGaps.length === 0) return;

      const hasCritical = acopioGaps.some((g) => g.report.status === ReportStatus.SIN_COBERTURA);
      let badgeColor = hasCritical ? '#dc2626' : (acopioGaps.length > 0 ? '#d97706' : '#059669');
      let typeStr = hasCritical ? 'Acopio (CRÍTICO)' : (acopioGaps.length > 0 ? 'Acopio (CON BRECHAS)' : 'Acopio');

      const gapsHtml = acopioGaps.length > 0
          ? `<div style="margin-top:6px; border-top:1px solid #e2e8f0; padding-top:4px;">
              <strong style="color:#dc2626; font-size:10px;">⚠️ BRECHAS FILTRADAS (${acopioGaps.length}):</strong>
              <ul style="margin:4px 0 0 0; padding-left:14px; font-size:11px;">
                ${acopioGaps.map(g => `<li><strong>${g.report.recurso.item}</strong> (${g.report.recurso.cantidadRequerida} ${g.report.recurso.unidad})</li>`).join('')}
              </ul>
            </div>`
          : `<div style="margin-top:4px; font-size:10px; color:#059669; font-weight:bold;">🟢 Sin brechas activas</div>`;

      const caMarker: any = L.marker([ca.lat, ca.lng], { icon: createCategoryIcon(badgeColor, ca.nombre, typeStr, '📦') });
      if (isSelectingLocation && onSelectLocation) {
        caMarker.on('click', (e: L.LeafletMouseEvent) => {
          onSelectLocation(e.latlng.lat, e.latlng.lng);
        });
      } else {
        caMarker.bindPopup(`<div style="color:#0f172a; font-size:12px; font-family:sans-serif; padding:4px; min-width:210px;"><strong>${ca.nombre}</strong><br/>${gapsHtml}</div>`);
      }
      acopiosGroupRef.current?.addLayer(caMarker);
    });

    // Render Custom Campamentos dynamically
    campamentosGroupRef.current.clearLayers();
    stateCampamentos.forEach((cc) => {
      const allCampGaps = gaps.filter(
        (g) =>
          g.report.zona.infrastructureId === cc.id ||
          g.report.zona.campamento.toLowerCase().includes(cc.nombre.toLowerCase()) ||
          cc.nombre.toLowerCase().includes(g.report.zona.campamento.toLowerCase()),
      );
      const campGaps = filterGapsByStatus(allCampGaps);

      if (statusFilter !== 'TODAS' && campGaps.length === 0) return;

      const hasCritical = campGaps.some((g) => g.report.status === ReportStatus.SIN_COBERTURA);
      let badgeColor = hasCritical ? '#dc2626' : (campGaps.length > 0 ? '#d97706' : '#7c3aed');
      let typeStr = hasCritical ? 'REFUGIO (CRÍTICO)' : (campGaps.length > 0 ? 'REFUGIO (PARCIAL)' : 'REFUGIO');

      const gapsHtml = campGaps.length > 0
          ? `<div style="margin-top:6px; border-top:1px solid #e2e8f0; padding-top:4px;">
              <strong style="color:#dc2626; font-size:10px;">⚠️ NECESIDADES FILTRADAS (${campGaps.length}):</strong>
              <ul style="margin:4px 0 0 0; padding-left:14px; font-size:11px;">
                ${campGaps.map(g => `<li><strong>${g.report.recurso.item}</strong> (${g.report.recurso.cantidadRequerida} ${g.report.recurso.unidad})</li>`).join('')}
              </ul>
            </div>`
          : `<div style="margin-top:4px; font-size:10px; color:#059669; font-weight:bold;">🟢 Atendido</div>`;

      const ccMarker: any = L.marker([cc.lat, cc.lng], { icon: createCategoryIcon(badgeColor, cc.nombre, typeStr, '⛺') });
      if (isSelectingLocation && onSelectLocation) {
        ccMarker.on('click', (e: L.LeafletMouseEvent) => {
          onSelectLocation(e.latlng.lat, e.latlng.lng);
        });
      } else {
        ccMarker.bindPopup(`<div style="color:#0f172a; font-size:12px; font-family:sans-serif; padding:4px; min-width:230px;"><strong>${cc.nombre}</strong><br/>${gapsHtml}</div>`);
      }
      campamentosGroupRef.current?.addLayer(ccMarker);
    });

    // Render Custom Desastres based on selectedDisasterTypes multi-select
    customDesastresGroupRef.current.clearLayers();
    const desastresToRender = stateDesastres.filter((dz) =>
      selectedDisasterTypes.includes(dz.tipo)
    );

    desastresToRender.forEach((dz) => {
      const theme = getDisasterTheme(dz.tipo);

      // 1. Draw Impact Radius Circle
      const circle = L.circle([dz.lat, dz.lng], {
        radius: dz.radioMetros,
        color: theme.color,
        fillColor: theme.fillColor,
        fillOpacity: 0.18,
        weight: 2,
        dashArray: '6, 6',
        interactive: true,
      });

      if (isSelectingLocation && onSelectLocation) {
        circle.on('click', (e: L.LeafletMouseEvent) => {
          onSelectLocation(e.latlng.lat, e.latlng.lng);
        });
      } else {
        circle.bindPopup(
          `<div style="font-family:sans-serif; font-size:12px; padding:4px; min-width:200px;">
            <strong style="color:${theme.color}; font-size:13px;">${theme.icon} ${dz.nombre}</strong><br/>
            <span style="font-size:11px; color:#475569;">Tipo: <strong>${theme.label}</strong></span><br/>
            <span style="font-size:11px; color:#475569;">Radio de impacto: <strong>${dz.radioMetros} metros</strong></span>
          </div>`
        );
      }
      customDesastresGroupRef.current?.addLayer(circle);

      // 2. Draw Marker in center of disaster
      const dzMarker = L.marker([dz.lat, dz.lng], {
        icon: createCategoryIcon(theme.color, dz.nombre, `ZONA DE IMPACTO (${theme.icon})`, theme.icon),
      });

      if (isSelectingLocation && onSelectLocation) {
        dzMarker.on('click', (e: L.LeafletMouseEvent) => {
          onSelectLocation(e.latlng.lat, e.latlng.lng);
        });
      } else {
        dzMarker.bindPopup(
          `<div style="font-family:sans-serif; font-size:12px; padding:4px; min-width:200px;">
            <strong style="color:${theme.color}; font-size:13px;">${theme.icon} ${dz.nombre}</strong><br/>
            <span style="font-size:11px; color:#475569;">Tipo: <strong>${theme.label}</strong></span><br/>
            <span style="font-size:11px; color:#475569;">Radio de impacto: <strong>${dz.radioMetros}m</strong></span>
          </div>`
        );
      }
      customDesastresGroupRef.current?.addLayer(dzMarker);
    });

    // Handle Layer Visibility
    const updateVisibility = (group: L.LayerGroup | null, visible: boolean) => {
      if (!group) return;
      if (visible && !mapInstanceRef.current?.hasLayer(group)) mapInstanceRef.current?.addLayer(group);
      else if (!visible && mapInstanceRef.current?.hasLayer(group)) mapInstanceRef.current?.removeLayer(group);
    };

    updateVisibility(acopiosGroupRef.current, siteFilter === 'TODOS' || siteFilter === 'ACOPIOS');
    updateVisibility(campamentosGroupRef.current, siteFilter === 'TODOS' || siteFilter === 'CAMPAMENTOS');
    updateVisibility(customDesastresGroupRef.current, desastresToRender.length > 0);
    
    dynamicMarkersGroupRef.current.clearLayers();
  }, [gaps, siteFilter, selectedDisasterTypes, statusFilter, stateAcopios, stateCampamentos, stateDesastres, isSelectingLocation, onSelectLocation]);

  const totalCampamentosCount = stateCampamentos.length;
  const totalAcopiosCount = stateAcopios.length;
  const totalDesastresCount = stateDesastres.length;

  return (
    <div className="flex flex-col gap-3.5 w-full">
      <style>{`
        .selecting-location-active .leaflet-overlay-pane,
        .selecting-location-active .leaflet-marker-pane,
        .selecting-location-active .leaflet-popup-pane {
          pointer-events: none !important;
        }
      `}</style>
      {isSelectingLocation && (
        <div className="flex items-center justify-between p-3.5 bg-gradient-to-r from-red-700 to-amber-600 text-white rounded-2xl shadow-xl animate-pulse">
          <div className="flex items-center gap-2.5">
            <MapPin className="w-5 h-5 text-amber-200" />
            <span className="text-xs font-black uppercase tracking-widest">Modo Selección Activo</span>
          </div>
        </div>
      )}

      {/* Triple Filter Control Section - Modern 3-Card Segmented System */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full">
        {/* Card 1: Infraestructura */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-3 shadow-sm flex flex-col gap-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5 text-xs font-black text-slate-800 uppercase tracking-wider">
              <Layers className="w-4 h-4 text-red-600" />
              <span>Infraestructura</span>
            </div>
            <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
              {totalCampamentosCount + totalAcopiosCount} sitios
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
            <button
              onClick={() => setSiteFilter('TODOS')}
              className={`flex items-center justify-center py-1.5 px-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                siteFilter === 'TODOS'
                  ? 'bg-slate-900 text-white shadow-sm scale-[1.01]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <span>Todas</span>
            </button>

            <button
              onClick={() => setSiteFilter('CAMPAMENTOS')}
              className={`flex items-center justify-center gap-1 py-1.5 px-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                siteFilter === 'CAMPAMENTOS'
                  ? 'bg-purple-700 text-white shadow-sm scale-[1.01]'
                  : 'text-purple-700 hover:bg-purple-50'
              }`}
            >
              <span>⛺ Refugios ({totalCampamentosCount})</span>
            </button>

            <button
              onClick={() => setSiteFilter('ACOPIOS')}
              className={`flex items-center justify-center gap-1 py-1.5 px-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                siteFilter === 'ACOPIOS'
                  ? 'bg-emerald-700 text-white shadow-sm scale-[1.01]'
                  : 'text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              <span>📦 Acopios ({totalAcopiosCount})</span>
            </button>
          </div>
        </div>

        {/* Card 2: Zonas de Desastre (Multiselección) */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-3 shadow-sm flex flex-col gap-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5 text-xs font-black text-slate-800 uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4 text-red-600" />
              <span>Eventos y Desastres</span>
            </div>
            <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
              {selectedDisasterTypes.length} de {availableDisasterTypes.length} tipos visibles
            </span>
          </div>

          <div className="flex items-center gap-1 overflow-x-auto bg-slate-100/80 p-1 rounded-xl border border-slate-200/60 no-scrollbar">
            <button
              onClick={() => setSelectedDisasterTypes(availableDisasterTypes)}
              className={`py-1.5 px-2 rounded-lg text-xs font-extrabold transition-all shrink-0 cursor-pointer ${
                isAllDisastersSelected
                  ? 'bg-slate-950 text-white shadow-sm scale-[1.01]'
                  : 'text-slate-700 hover:bg-white/50'
              }`}
            >
              <span>Todos</span>
            </button>

            {availableDisasterTypes.map((tipo) => {
              const theme = getDisasterTheme(tipo);
              const count = disasterCountsByType[tipo] || 0;
              const isSelected = selectedDisasterTypes.includes(tipo);

              return (
                <button
                  key={tipo}
                  onClick={() => toggleDisasterType(tipo)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-extrabold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 border ${
                    isSelected
                      ? 'text-white shadow-sm scale-[1.01] border-transparent font-black'
                      : 'bg-slate-200/60 text-slate-400 border-slate-300/80 line-through opacity-70 hover:opacity-100'
                  }`}
                  style={isSelected ? { backgroundColor: theme.color } : {}}
                >
                  <span>{theme.icon}</span>
                  <span>{theme.label.split('/')[0].trim()} ({count})</span>
                </button>
              );
            })}

            <button
              onClick={() => setSelectedDisasterTypes([])}
              className={`py-1.5 px-2 rounded-lg text-xs font-extrabold transition-all shrink-0 cursor-pointer ${
                isNoDisasterSelected
                  ? 'bg-red-800 text-white shadow-sm scale-[1.01]'
                  : 'text-slate-500 hover:bg-slate-200'
              }`}
            >
              <span>🚫 Ninguno</span>
            </button>
          </div>
        </div>

        {/* Card 3: Estado de Severidad / Brechas */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-3 shadow-sm flex flex-col gap-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5 text-xs font-black text-slate-800 uppercase tracking-wider">
              <Filter className="w-4 h-4 text-red-600" />
              <span>Filtrar por Severidad</span>
            </div>
            <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
              Brechas
            </span>
          </div>

          <div className="grid grid-cols-4 gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
            <button
              onClick={() => setStatusFilter('TODAS')}
              className={`flex items-center justify-center py-1.5 px-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                statusFilter === 'TODAS'
                  ? 'bg-slate-900 text-white shadow-sm scale-[1.01]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <span>Todas</span>
            </button>

            <button
              onClick={() => setStatusFilter('CRITICOS')}
              className={`flex items-center justify-center gap-1 py-1.5 px-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                statusFilter === 'CRITICOS'
                  ? 'bg-red-600 text-white shadow-sm scale-[1.01]'
                  : 'text-red-700 hover:bg-red-50'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Críticos</span>
            </button>

            <button
              onClick={() => setStatusFilter('REDISTRIBUCION')}
              className={`flex items-center justify-center gap-1 py-1.5 px-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                statusFilter === 'REDISTRIBUCION'
                  ? 'bg-amber-500 text-slate-950 shadow-sm scale-[1.01]'
                  : 'text-amber-800 hover:bg-amber-50'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Redist.</span>
            </button>

            <button
              onClick={() => setStatusFilter('TRANSITO')}
              className={`flex items-center justify-center gap-1 py-1.5 px-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                statusFilter === 'TRANSITO'
                  ? 'bg-blue-600 text-white shadow-sm scale-[1.01]'
                  : 'text-blue-700 hover:bg-blue-50'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Tránsito</span>
            </button>
          </div>
        </div>
      </div>

      <div className="relative w-full h-[600px] rounded-3xl overflow-hidden border border-slate-300 shadow-xl z-0">
        {activeState && (
          <button
            type="button"
            onClick={handleRecenterState}
            title={`Centrar mapa en ${activeState.nombre}`}
            className="absolute top-4 right-4 z-[9999] bg-white/95 backdrop-blur-md border-2 border-red-200 text-slate-900 hover:text-red-600 hover:bg-red-50 text-xs font-black px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 transition-all cursor-pointer hover:scale-105"
          >
            <LocateFixed className="w-4 h-4 text-red-600" />
            <span>Centrar en {activeState.nombre}</span>
          </button>
        )}
        <div ref={mapContainerRef} className="w-full h-full" />
      </div>
    </div>
  );
};
