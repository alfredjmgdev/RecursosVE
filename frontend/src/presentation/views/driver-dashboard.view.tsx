'use client';

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Truck, MapPin, Package, CheckCircle2, Clock, Navigation, AlertCircle, ShieldAlert, ArrowRight } from 'lucide-react';
import { useRecursosVE } from '../../application/context/recursosve-context';
import { DispatchShipmentFrontend } from '../../domain/ports/api-client.port';
import { UserRole } from '../../domain/entities/user.entity';

export const DriverDashboardView: React.FC = () => {
  const { currentUser, getAssignedShipment, updateShipmentStatus } = useRecursosVE();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  const [shipment, setShipment] = useState<DispatchShipmentFrontend | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [updating, setUpdating] = useState<boolean>(false);

  useEffect(() => {
    const loadShipment = async () => {
      const driverId = currentUser?.id || 'usr_trans_4';
      try {
        const data = await getAssignedShipment(driverId);
        setShipment(data);
      } catch (err) {
        console.error('Error cargando despacho:', err);
      } finally {
        setLoading(false);
      }
    };

    loadShipment();
  }, [currentUser, getAssignedShipment]);

  // Leaflet map rendering 3 key locations (Driver initial -> Pickup -> Destination)
  useEffect(() => {
    if (!mapContainerRef.current || !shipment) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
    }).setView([shipment.origen.lat, shipment.origen.lng], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap',
    }).addTo(map);

    mapInstanceRef.current = map;

    // Icons
    const driverIcon = L.divIcon({
      className: 'custom-map-pin',
      html: `<div style="background-color:#3B82F6; width:36px; height:36px; border-radius:50%; display:flex; align-items:center; justify-content:center; border:2px solid white; box-shadow:0 4px 8px rgba(0,0,0,0.4); color:white; font-weight:bold;">🚚</div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });

    const pickupIcon = L.divIcon({
      className: 'custom-map-pin',
      html: `<div style="background-color:#10B981; width:36px; height:36px; border-radius:50%; display:flex; align-items:center; justify-content:center; border:2px solid white; box-shadow:0 4px 8px rgba(0,0,0,0.4); color:white; font-weight:bold;">📦</div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });

    const dropoffIcon = L.divIcon({
      className: 'custom-map-pin',
      html: `<div style="background-color:#EF4444; width:36px; height:36px; border-radius:50%; display:flex; align-items:center; justify-content:center; border:2px solid white; box-shadow:0 4px 8px rgba(0,0,0,0.4); color:white; font-weight:bold;">🏕️</div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });

    // 1. Initial Driver Location Marker
    L.marker([shipment.ubicacionInicial.lat, shipment.ubicacionInicial.lng], { icon: driverIcon })
      .addTo(map)
      .bindPopup(`<b>Chofer:</b> ${shipment.ubicacionInicial.nombre || 'Posición Inicial'}`);

    // 2. Pickup Origin Marker
    L.marker([shipment.origen.lat, shipment.origen.lng], { icon: pickupIcon })
      .addTo(map)
      .bindPopup(`<b>Punto de Recogida (Origen):</b> ${shipment.origen.nombre}`);

    // 3. Refuge Destination Marker
    L.marker([shipment.destino.lat, shipment.destino.lng], { icon: dropoffIcon })
      .addTo(map)
      .bindPopup(`<b>Punto de Entrega (Destino):</b> ${shipment.destino.nombre}`);

    // Polylines
    const leg1 = L.polyline(
      [
        [shipment.ubicacionInicial.lat, shipment.ubicacionInicial.lng],
        [shipment.origen.lat, shipment.origen.lng],
      ],
      { color: '#3B82F6', weight: 4, dashArray: '6, 6' },
    ).addTo(map);

    const leg2 = L.polyline(
      [
        [shipment.origen.lat, shipment.origen.lng],
        [shipment.destino.lat, shipment.destino.lng],
      ],
      { color: '#10B981', weight: 6 },
    ).addTo(map);

    const group = L.featureGroup([leg1, leg2]);
    map.fitBounds(group.getBounds(), { padding: [50, 50] });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [shipment]);

  const handleStatusChange = async (nuevoEstado: 'RECOGIDO' | 'ENTREGADO') => {
    if (!shipment) return;
    setUpdating(true);
    try {
      const updated = await updateShipmentStatus(shipment.id, nuevoEstado);
      setShipment(updated);
    } catch (err) {
      console.error('Error actualizando estado:', err);
    } finally {
      setUpdating(false);
    }
  };

  if (currentUser && currentUser.rol !== UserRole.TRANSPORTISTA) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl">
          <ShieldAlert className="w-12 h-12 text-amber-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Acceso Exclusivo para Transportistas</h2>
          <p className="text-slate-400 text-sm max-w-md mx-auto mb-6">
            Iniciá sesión como <strong>transportista@recursos.ve</strong> para acceder a este panel de control.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-xl">
            <Truck className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-white">Misión del Transportista</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                Agente 3 & 4 Dispatcher
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Ruteo asignado automáticamente por la IA según cercanía y seguridad vial.
            </p>
          </div>
        </div>

        {shipment && (
          <div className="flex items-center gap-3 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400">Estado Misión:</span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                shipment.estado === 'ASIGNADO'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : shipment.estado === 'RECOGIDO'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}
            >
              {shipment.estado === 'ASIGNADO' && '🟡 ASIGNADO'}
              {shipment.estado === 'RECOGIDO' && '🔵 EN TRÁNSITO'}
              {shipment.estado === 'ENTREGADO' && '🟢 ENTREGADO'}
            </span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 space-y-3">
          <Navigation className="w-8 h-8 animate-spin text-cyan-400 mx-auto" />
          <p className="text-sm font-semibold">Cargando misión asignada por la IA...</p>
        </div>
      ) : shipment ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Left Panel: Mission Info & Actions */}
          <div className="space-y-6 md:col-span-1">
            
            {/* Shipment Summary Card */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2">
                Detalle del Insumo Logístico
              </h3>

              <div className="flex items-start gap-3">
                <Package className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs text-slate-400 block">Carga Asignada</span>
                  <span className="text-sm font-bold text-white leading-tight">
                    {shipment.insumoDescripcion || 'Insumos Médicos & Agua Potable'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/80">
                <span className="text-slate-400">Vehículo Asignado:</span>
                <span className="font-semibold text-slate-200">{shipment.vehiculoTipo}</span>
              </div>
            </div>

            {/* Route Milestones */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2">
                Trayectoria de 3 Puntos
              </h3>

              {/* Point 1: Initial Driver Position */}
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/40 flex items-center justify-center text-xs shrink-0 font-bold">
                  1
                </div>
                <div>
                  <span className="text-[11px] text-blue-400 font-semibold block uppercase">Posición Inicial Chofer</span>
                  <span className="text-xs font-bold text-slate-200">{shipment.ubicacionInicial.nombre}</span>
                </div>
              </div>

              {/* Arrow */}
              <div className="pl-3.5 border-l-2 border-dashed border-slate-800 ml-3 py-1" />

              {/* Point 2: Pickup Origin */}
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center text-xs shrink-0 font-bold">
                  2
                </div>
                <div>
                  <span className="text-[11px] text-emerald-400 font-semibold block uppercase">Origen (Recogida Insumo)</span>
                  <span className="text-xs font-bold text-slate-200">{shipment.origen.nombre}</span>
                </div>
              </div>

              {/* Arrow */}
              <div className="pl-3.5 border-l-2 border-dashed border-slate-800 ml-3 py-1" />

              {/* Point 3: Refuge Destination */}
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 flex items-center justify-center text-xs shrink-0 font-bold">
                  3
                </div>
                <div>
                  <span className="text-[11px] text-red-400 font-semibold block uppercase">Destino (Entrega Refugio)</span>
                  <span className="text-xs font-bold text-slate-200">{shipment.destino.nombre}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons for Driver */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Acciones en Terreno
              </h3>

              {shipment.estado === 'ASIGNADO' && (
                <button
                  onClick={() => handleStatusChange('RECOGIDO')}
                  disabled={updating}
                  className="w-full py-3 px-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Package className="w-5 h-5" />
                  <span>📦 Confirmar Recogida de Insumo</span>
                </button>
              )}

              {shipment.estado === 'RECOGIDO' && (
                <button
                  onClick={() => handleStatusChange('ENTREGADO')}
                  disabled={updating}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>✅ Confirmar Entrega en Destino</span>
                </button>
              )}

              {shipment.estado === 'ENTREGADO' && (
                <div className="bg-emerald-950/40 border border-emerald-800/60 p-4 rounded-xl text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                  <p className="text-xs text-emerald-200 font-semibold">
                    ¡Misión completada con éxito! La donación fue entregada al campamento.
                  </p>
                </div>
              )}
            </div>

          </div>

          {/* Right Panel: Interactive Route Map */}
          <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col min-h-[500px]">
            <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Mapa del Despacho Asignado
                </span>
              </div>
              <span className="text-[11px] text-slate-400">
                Puntos: 🔵 Chofer ➔ 🟢 Acopio ➔ 🔴 Refugio
              </span>
            </div>

            <div className="flex-1 relative min-h-[450px]">
              <div ref={mapContainerRef} className="w-full h-full min-h-[450px] z-10" />
            </div>
          </div>

        </div>
      ) : null}

    </div>
  );
};
