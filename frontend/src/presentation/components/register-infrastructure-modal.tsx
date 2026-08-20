'use client';

import React, { useState } from 'react';
import { X, MapPin, Home, Package, ShieldAlert, CheckCircle2, Navigation } from 'lucide-react';
import { useRecursosVE, DisasterEventType } from '../../application/context/recursosve-context';
import { DISASTER_THEMES, getDisasterTheme } from '../../domain/entities/disaster-palette';

interface RegisterInfrastructureModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCoords: { lat: number; lng: number } | null;
  onEnableMapPicker: () => void;
}

export type EntityCategory = 'CAMPAMENTO' | 'ACOPIO' | 'DESASTRE';

export const RegisterInfrastructureModal: React.FC<RegisterInfrastructureModalProps> = ({
  isOpen,
  onClose,
  selectedCoords,
  onEnableMapPicker,
}) => {
  const { addCampamento, addAcopio, addDesastre, disasterTypes, selectedStateId } = useRecursosVE();

  const [category, setCategory] = useState<EntityCategory>('CAMPAMENTO');
  const [nombre, setNombre] = useState('');
  const [latInput, setLatInput] = useState('');
  const [lngInput, setLngInput] = useState('');

  // Campamento fields
  const [poblacion, setPoblacion] = useState('200');
  const [capacidad, setCapacidad] = useState('250');
  const [coordinadorNombre, setCoordinadorNombre] = useState('');
  const [coordinadorTelefono, setCoordinadorTelefono] = useState('');

  // Acopio fields
  const [stockInfo, setStockInfo] = useState('');
  const [contactoNombre, setContactoNombre] = useState('');
  const [contactoTelefono, setContactoTelefono] = useState('');

  // Desastre fields
  const [tipoDesastre, setTipoDesastre] = useState<DisasterEventType>('DESLAVE');
  const [radioMetros, setRadioMetros] = useState('2000');

  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Sync inputs when selectedCoords prop changes
  React.useEffect(() => {
    if (selectedCoords) {
      setLatInput(selectedCoords.lat.toFixed(5));
      setLngInput(selectedCoords.lng.toFixed(5));
    }
  }, [selectedCoords]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const lat = parseFloat(latInput);
    const lng = parseFloat(lngInput);

    if (isNaN(lat) || isNaN(lng)) {
      alert('Por favor ingresá o seleccioná coordenadas válidas en el mapa.');
      return;
    }

    if (!nombre.trim()) {
      alert('Por favor ingresá un nombre identificativo.');
      return;
    }

    if (category === 'CAMPAMENTO') {
      const pob = parseInt(poblacion) || 100;
      const cap = parseInt(capacidad) || pob + 50;
      const fam = Math.round(pob / 4);
      const coordCombined = coordinadorTelefono.trim()
        ? `${coordinadorNombre.trim()} (${coordinadorTelefono.trim()})`
        : coordinadorNombre.trim() || 'Coordinador Asignado';

      addCampamento({
        nombre: nombre.trim(),
        lat,
        lng,
        poblacion: pob,
        familias: fam,
        capacidad: cap,
        coordinador: coordCombined,
        estadoId: selectedStateId ?? 22,
      });
      setSuccessMessage(`⛺ Refugio/Campamento "${nombre}" registrado con éxito en el mapa.`);
    } else if (category === 'ACOPIO') {
      const contactoCombined = contactoTelefono.trim()
        ? `${contactoNombre.trim()} (${contactoTelefono.trim()})`
        : contactoNombre.trim() || 'Encargado de Almacén';

      addAcopio({
        nombre: nombre.trim(),
        lat,
        lng,
        stockInfo: stockInfo.trim() || 'Stock en recepción inicial',
        contacto: contactoCombined,
        estadoId: selectedStateId ?? 22,
      });
      setSuccessMessage(`📦 Centro de Acopio "${nombre}" agregado al mapa.`);
    } else if (category === 'DESASTRE') {
      const radio = parseInt(radioMetros) || 2000;
      addDesastre({
        nombre: nombre.trim(),
        tipo: tipoDesastre,
        lat,
        lng,
        radioMetros: radio,
        estadoId: selectedStateId ?? 22,
      });
      setSuccessMessage(`⚠️ Zona de Desastre "${nombre}" delimitada en el mapa.`);
    }

    setTimeout(() => {
      setSuccessMessage(null);
      onClose();
      // Reset form
      setNombre('');
      setCoordinadorNombre('');
      setCoordinadorTelefono('');
      setContactoNombre('');
      setContactoTelefono('');
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-amber-200/50 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header - Crimson Red & Amber Gradient */}
        <div className="flex items-center justify-between px-6 py-4.5 bg-gradient-to-r from-red-700 via-red-600 to-amber-600 text-white shrink-0 shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-400/20 text-amber-200 rounded-xl border border-amber-300/30">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight text-white">Registrar Infraestructura / Desastre</h3>
              <p className="text-xs text-red-100 font-medium">Añadí puntos estratégicos señalando en el mapa</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-red-100 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 bg-white">
          {successMessage && (
            <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-300 text-amber-950 rounded-2xl animate-fadeIn shadow-sm">
              <CheckCircle2 className="w-5 h-5 text-amber-600 shrink-0" />
              <span className="text-xs font-black">{successMessage}</span>
            </div>
          )}

          {/* Category Selector Tabs - White, Yellow & Red Theme */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-800 uppercase tracking-wider">Tipo de Registro</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setCategory('CAMPAMENTO')}
                className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border text-xs font-black transition-all cursor-pointer ${
                  category === 'CAMPAMENTO'
                    ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md shadow-amber-200 scale-[1.02]'
                    : 'bg-white border-amber-200 text-amber-900 hover:bg-amber-50/60'
                }`}
              >
                <Home className="w-4 h-4" />
                <span>⛺ Campamento</span>
              </button>

              <button
                type="button"
                onClick={() => setCategory('ACOPIO')}
                className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border text-xs font-black transition-all cursor-pointer ${
                  category === 'ACOPIO'
                    ? 'bg-red-600 text-white border-red-600 shadow-md shadow-red-200 scale-[1.02]'
                    : 'bg-white border-red-200 text-red-800 hover:bg-red-50/60'
                }`}
              >
                <Package className="w-4 h-4" />
                <span>📦 Acopio</span>
              </button>

              <button
                type="button"
                onClick={() => setCategory('DESASTRE')}
                className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border text-xs font-black transition-all cursor-pointer ${
                  category === 'DESASTRE'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-md scale-[1.02]'
                    : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-100'
                }`}
              >
                <ShieldAlert className="w-4 h-4 text-red-600" />
                <span>⚠️ Desastre</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Coordinates Selector Card - Warm Amber & Red Styling */}
            <div className="p-4 bg-gradient-to-br from-amber-50/70 via-white to-red-50/40 rounded-2xl border border-amber-200 space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <Navigation className="w-4 h-4 text-amber-600" />
                  Ubicación Geográfica:
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onEnableMapPicker();
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-black shadow-md shadow-amber-200 transition-all cursor-pointer border border-amber-400"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  🎯 Señalar en el mapa
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Latitud</label>
                  <input
                    type="number"
                    step="any"
                    value={latInput}
                    onChange={(e) => setLatInput(e.target.value)}
                    placeholder="ej: 10.6012"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Longitud</label>
                  <input
                    type="number"
                    step="any"
                    value={lngInput}
                    onChange={(e) => setLngInput(e.target.value)}
                    placeholder="ej: -66.9315"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              {selectedCoords && (
                <p className="text-[11px] font-bold text-amber-900 bg-amber-100/90 px-3 py-1.5 rounded-lg border border-amber-300 flex items-center gap-1.5">
                  <span>✓ Coordenadas seleccionadas:</span>
                  <span className="font-mono">({selectedCoords.lat.toFixed(5)}, {selectedCoords.lng.toFixed(5)})</span>
                </p>
              )}
            </div>

            {/* Entity Name */}
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">Nombre / Identificador</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder={
                  category === 'CAMPAMENTO'
                    ? 'ej: Refugio Polideportivo Vargas'
                    : category === 'ACOPIO'
                    ? 'ej: Almacén Logístico Este'
                    : 'ej: Deslave Sector El Rincón'
                }
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-red-500 focus:outline-none"
                required
              />
            </div>

            {/* Category Specific Fields */}
            {category === 'CAMPAMENTO' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1">Población Actual (refugiados)</label>
                    <input
                      type="number"
                      value={poblacion}
                      onChange={(e) => setPoblacion(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1">Capacidad Máxima</label>
                    <input
                      type="number"
                      value={capacidad}
                      onChange={(e) => setCapacidad(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1">Coordinador / Responsable</label>
                    <input
                      type="text"
                      value={coordinadorNombre}
                      onChange={(e) => setCoordinadorNombre(e.target.value)}
                      placeholder="ej: Cap. Rivas"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1">Teléfono de Contacto</label>
                    <input
                      type="tel"
                      value={coordinadorTelefono}
                      onChange={(e) => setCoordinadorTelefono(e.target.value)}
                      placeholder="ej: 0414-555-0999"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {category === 'ACOPIO' && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">Stock / Insumos Principales</label>
                  <input
                    type="text"
                    value={stockInfo}
                    onChange={(e) => setStockInfo(e.target.value)}
                    placeholder="ej: 500L Agua, Pastillas Potabilizadoras, Kits Médicos"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1">Encargado / Responsable</label>
                    <input
                      type="text"
                      value={contactoNombre}
                      onChange={(e) => setContactoNombre(e.target.value)}
                      placeholder="ej: Lic. José M."
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-red-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1">Teléfono de Contacto</label>
                    <input
                      type="tel"
                      value={contactoTelefono}
                      onChange={(e) => setContactoTelefono(e.target.value)}
                      placeholder="ej: 0424-555-0811"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-red-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {category === 'DESASTRE' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1">Tipo de Evento</label>
                    <select
                      value={tipoDesastre}
                      onChange={(e) => setTipoDesastre(e.target.value as DisasterEventType)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    >
                      {(disasterTypes.length > 0 ? disasterTypes : Object.values(DISASTER_THEMES)).map((t) => (
                        <option key={'code' in t ? t.code : t.tipo} value={'code' in t ? t.code : t.tipo}>
                          {t.icon} {'nombre' in t ? t.nombre : t.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1">Radio Afectado (metros)</label>
                    <input
                      type="number"
                      step="100"
                      value={radioMetros}
                      onChange={(e) => setRadioMetros(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                    />
                  </div>
                </div>

                {/* Color Preview Badge (Loaded from PostgreSQL / Backend) */}
                {(() => {
                  const dbType = disasterTypes.find((dt) => dt.code === tipoDesastre);
                  const theme = dbType
                    ? {
                        color: dbType.color,
                        bgBadge: dbType.bgBadge,
                        textBadge: dbType.textBadge,
                        icon: dbType.icon,
                      }
                    : getDisasterTheme(tipoDesastre);
                  return (
                    <div
                      className="flex items-center justify-between p-3 rounded-2xl border text-xs font-bold transition-all"
                      style={{
                        backgroundColor: theme.bgBadge,
                        borderColor: `${theme.color}55`,
                        color: theme.textBadge,
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">{theme.icon}</span>
                        <span>Color característico (PostgreSQL DB):</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className="w-4 h-4 rounded-full border border-white/50 shadow-sm inline-block"
                          style={{ backgroundColor: theme.color }}
                        />
                        <span className="font-mono text-[11px] font-black">{theme.color}</span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Form Action Buttons - Red & Amber Primary Action */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white text-xs font-black shadow-lg shadow-red-600/20 transition-all cursor-pointer"
              >
                Guardar e Integrar al Mapa
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
