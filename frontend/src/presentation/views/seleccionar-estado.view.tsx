'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  MapPin,
  Search,
  ArrowRight,
  Building2,
  Users,
  Radio,
  ShieldCheck,
  Landmark,
  Anchor,
  Trees,
  Sun,
  Shield,
  Zap,
  MountainSnow,
  Mountain,
  Church,
  Compass,
  Palmtree,
  Waves,
  Fish,
  Wind,
  Music,
  Wheat,
  Flame,
  Sprout,
  TreePine,
  Factory,
} from 'lucide-react';
import { useRecursosVE } from '../../application/context/recursosve-context';
import { UserRole } from '../../domain/entities/user.entity';
import type { VenezuelaStateFrontend } from '../../domain/ports/api-client.port';

// Hardcoded fallback states for when DB isn't seeded yet
const FALLBACK_STATES: VenezuelaStateFrontend[] = [
  { id: 1,  nombre: 'Amazonas',         codigo: 'VE-Z', lat: 3.851,   lng: -65.938,  zoom: 7  },
  { id: 2,  nombre: 'Anzoátegui',       codigo: 'VE-B', lat: 8.992,   lng: -63.858,  zoom: 8  },
  { id: 3,  nombre: 'Apure',            codigo: 'VE-C', lat: 6.900,   lng: -68.510,  zoom: 7  },
  { id: 4,  nombre: 'Aragua',           codigo: 'VE-D', lat: 10.123,  lng: -67.592,  zoom: 9  },
  { id: 5,  nombre: 'Barinas',          codigo: 'VE-E', lat: 8.623,   lng: -70.207,  zoom: 8  },
  { id: 6,  nombre: 'Bolívar',          codigo: 'VE-F', lat: 7.831,   lng: -63.552,  zoom: 7  },
  { id: 7,  nombre: 'Carabobo',         codigo: 'VE-G', lat: 10.244,  lng: -67.996,  zoom: 9  },
  { id: 8,  nombre: 'Cojedes',          codigo: 'VE-H', lat: 9.382,   lng: -68.403,  zoom: 9  },
  { id: 9,  nombre: 'Delta Amacuro',    codigo: 'VE-Y', lat: 8.882,   lng: -61.141,  zoom: 8  },
  { id: 10, nombre: 'Distrito Capital', codigo: 'VE-A', lat: 10.488,  lng: -66.879,  zoom: 12 },
  { id: 11, nombre: 'Falcón',           codigo: 'VE-I', lat: 11.182,  lng: -69.860,  zoom: 8  },
  { id: 12, nombre: 'Guárico',          codigo: 'VE-J', lat: 8.749,   lng: -66.236,  zoom: 8  },
  { id: 13, nombre: 'Lara',             codigo: 'VE-K', lat: 10.065,  lng: -69.357,  zoom: 9  },
  { id: 14, nombre: 'Mérida',           codigo: 'VE-L', lat: 8.593,   lng: -71.145,  zoom: 9  },
  { id: 15, nombre: 'Miranda',          codigo: 'VE-M', lat: 10.161,  lng: -66.432,  zoom: 9  },
  { id: 16, nombre: 'Monagas',          codigo: 'VE-N', lat: 9.335,   lng: -63.023,  zoom: 8  },
  { id: 17, nombre: 'Nueva Esparta',    codigo: 'VE-O', lat: 11.001,  lng: -63.912,  zoom: 10 },
  { id: 18, nombre: 'Portuguesa',       codigo: 'VE-P', lat: 9.094,   lng: -69.097,  zoom: 9  },
  { id: 19, nombre: 'Sucre',            codigo: 'VE-R', lat: 10.255,  lng: -62.638,  zoom: 8  },
  { id: 20, nombre: 'Táchira',          codigo: 'VE-S', lat: 7.914,   lng: -72.304,  zoom: 9  },
  { id: 21, nombre: 'Trujillo',         codigo: 'VE-T', lat: 9.369,   lng: -70.427,  zoom: 9  },
  { id: 22, nombre: 'La Guaira',        codigo: 'VE-X', lat: 10.601,  lng: -66.932,  zoom: 12 },
  { id: 23, nombre: 'Yaracuy',          codigo: 'VE-U', lat: 10.339,  lng: -68.808,  zoom: 9  },
  { id: 24, nombre: 'Zulia',            codigo: 'VE-V', lat: 10.389,  lng: -71.777,  zoom: 8  },
];

// Map state codes to representative icon components
const STATE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'VE-A': Landmark,     // Distrito Capital (El Capitolio)
  'VE-X': Anchor,       // La Guaira (Puerto Marítimo)
  'VE-M': Mountain,     // Miranda (Parque Nacional El Ávila)
  'VE-D': Factory,      // Aragua (Zona Industrial y Agrícola)
  'VE-G': Shield,       // Carabobo (Campo de Carabobo)
  'VE-V': Zap,          // Zulia (Relámpago del Catatumbo)
  'VE-L': MountainSnow, // Mérida (Sierra Nevada / Pico Bolívar)
  'VE-S': Mountain,     // Táchira (Cordillera Andina)
  'VE-T': Church,       // Trujillo (Monumento a la Virgen de la Paz)
  'VE-Z': Trees,        // Amazonas (Selva Amazónica / Tepuyes)
  'VE-F': Compass,      // Bolívar (Gran Sabana / Salto Ángel)
  'VE-O': Palmtree,     // Nueva Esparta (Isla de Margarita)
  'VE-B': Waves,        // Anzoátegui (Costas y Bahías)
  'VE-R': Fish,         // Sucre (Mochima / Tradición Pesquera)
  'VE-I': Wind,         // Falcón (Parque Eólico y Médanos)
  'VE-K': Music,        // Lara (Barquisimeto Capital Musical)
  'VE-J': Wheat,        // Guárico (Llanos Centrales)
  'VE-C': Waves,        // Apure (Ríos Llaneros)
  'VE-E': Sprout,       // Barinas (Llanos Agrícolas)
  'VE-H': Sun,          // Cojedes (Sol Llanero)
  'VE-P': Wheat,        // Portuguesa (Granero Agroindustrial)
  'VE-U': Trees,        // Yaracuy (Montaña de Sorte)
  'VE-N': Flame,        // Monagas (Petróleo y Cueva del Guácharo)
  'VE-Y': TreePine,     // Delta Amacuro (Delta del Orinoco)
};

// Map region codes to brand accents
const REGION_COLOR: Record<string, string> = {
  'VE-A': '#b91c1c', 'VE-M': '#b91c1c', 'VE-X': '#b91c1c', // Capital region — red-700
  'VE-D': '#d97706', 'VE-G': '#d97706', 'VE-Y': '#d97706', // Central — amber-600
  'VE-B': '#c2410c', 'VE-N': '#c2410c', 'VE-R': '#c2410c', 'VE-O': '#c2410c', // East — orange-700
  'VE-I': '#047857', 'VE-K': '#047857', 'VE-U': '#047857', // Northwest — emerald-700
  'VE-V': '#0369a1', // Zulia — sky-700
  'VE-S': '#9a3412', 'VE-T': '#9a3412', 'VE-L': '#9a3412', // Andes — orange-800
  'VE-E': '#d97706', 'VE-P': '#d97706', 'VE-C': '#d97706', 'VE-H': '#d97706', 'VE-J': '#d97706', // Llanos — amber-600
  'VE-F': '#991b1b', 'VE-Z': '#991b1b', // Guayana — red-800
};

export default function SeleccionarEstadoView() {
  const router = useRouter();
  const { venezuelaStates, customAcopios, customCampamentos, customDesastres, setSelectedStateId, currentUser } = useRecursosVE();
  const [search, setSearch] = useState('');

  const states = venezuelaStates.length > 0 ? venezuelaStates : FALLBACK_STATES;

  const filtered = useMemo(() => {
    if (!search.trim()) return states;
    return states.filter(
      (s) =>
        s.nombre.toLowerCase().includes(search.toLowerCase()) ||
        s.codigo.toLowerCase().includes(search.toLowerCase()),
    );
  }, [states, search]);

  const sitesPerState = useMemo(() => {
    const counts: Record<number, { camps: number; acopios: number; desastres: number }> = {};
    
    customCampamentos.forEach((c) => {
      const stId = c.estadoId ?? 22;
      if (!counts[stId]) counts[stId] = { camps: 0, acopios: 0, desastres: 0 };
      counts[stId].camps++;
    });

    customAcopios.forEach((a) => {
      const stId = a.estadoId ?? 22;
      if (!counts[stId]) counts[stId] = { camps: 0, acopios: 0, desastres: 0 };
      counts[stId].acopios++;
    });

    customDesastres.forEach((d) => {
      const stId = d.estadoId ?? 22;
      if (!counts[stId]) counts[stId] = { camps: 0, acopios: 0, desastres: 0 };
      counts[stId].desastres++;
    });

    return counts;
  }, [customAcopios, customCampamentos, customDesastres]);

  const handleSelectState = (state: VenezuelaStateFrontend) => {
    setSelectedStateId(state.id);
    const code = state.codigo.toLowerCase();
    if (currentUser?.rol === UserRole.BRIGADISTA) {
      router.push(`/estado/${code}/reportar`);
    } else if (currentUser?.rol === UserRole.DONANTE) {
      router.push(`/estado/${code}/donar`);
    } else {
      router.push(`/estado/${code}`);
    }
  };

  const totalWithActivity = Object.keys(sitesPerState).length;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      {/* Red, Gold & White Hero Banner */}
      <div className="max-w-6xl mx-auto bg-gradient-to-r from-red-700 via-red-600 to-amber-600 rounded-3xl p-8 sm:p-12 text-white shadow-2xl border border-red-800 text-center mb-10 relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-red-900/40 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 border border-white/25 text-amber-200 font-black text-xs uppercase tracking-wider mb-4 shadow-xs">
            <Radio className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>Selección de Zona Operativa</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-3">
            ¿Desde qué estado vas a coordinar hoy?
          </h1>

          <p className="text-sm sm:text-base text-red-100 font-medium max-w-xl mx-auto mb-8">
            El mapa interactivo y los recursos logísticos se enfocarán en el estado venezolano seleccionado.
          </p>

          {/* Search Box */}
          <div className="max-w-md mx-auto relative mb-6">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar estado por nombre o código (ej: La Guaira, VE-X)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-white text-slate-900 rounded-2xl border-2 border-amber-300 focus:border-white focus:outline-none shadow-xl text-sm font-extrabold placeholder:text-slate-400 placeholder:font-medium"
            />
          </div>

          {/* Stats Bar */}
          <div className="inline-flex items-center gap-3 text-xs font-black text-amber-200 bg-black/25 px-5 py-2 rounded-full border border-white/15 backdrop-blur-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>
              <strong className="text-white">{states.length}</strong> estados registrados
            </span>
            <span>•</span>
            <span>
              <strong className="text-emerald-300">{totalWithActivity}</strong> con infraestructura activa
            </span>
          </div>
        </div>
      </div>

      {/* State Grid */}
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6 px-1">
          <div className="flex items-center gap-2 text-slate-800 font-black text-sm uppercase tracking-wider">
            <MapPin className="w-4 h-4 text-red-600" />
            <span>Estados de Venezuela ({filtered.length})</span>
          </div>
          {search && (
            <button
              onClick={() => setSearch('')}
              className="text-xs font-extrabold text-red-600 hover:text-red-700 underline cursor-pointer"
            >
              Limpiar búsqueda
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((state) => {
            const color = REGION_COLOR[state.codigo] || '#b91c1c';
            const StateIcon = STATE_ICONS[state.codigo] || MapPin;
            const activity = sitesPerState[state.id];
            const hasActivity = !!activity;

            return (
              <button
                key={state.id}
                onClick={() => handleSelectState(state)}
                className="bg-white hover:bg-red-50/60 border-2 border-slate-200 hover:border-red-600 rounded-2xl p-5 text-left transition-all duration-200 shadow-sm hover:shadow-xl hover:shadow-red-600/10 hover:-translate-y-1 cursor-pointer group relative flex flex-col justify-between"
              >
                {/* Top colored accent border */}
                <div
                  className="absolute top-0 left-0 right-0 h-1.5 rounded-t-2xl"
                  style={{ backgroundColor: color }}
                />

                <div>
                  <div className="flex items-center justify-between mb-3 pt-1">
                    <span
                      className="w-10 h-10 rounded-xl flex items-center justify-center shadow-xs transition-transform group-hover:scale-110"
                      style={{
                        backgroundColor: `${color}15`,
                        color: color,
                        border: `1.5px solid ${color}35`,
                      }}
                    >
                      <StateIcon className="w-5 h-5" />
                    </span>
                    <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-red-600 group-hover:text-white text-slate-400 flex items-center justify-center transition-colors">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>

                  <h3 className="font-extrabold text-base text-slate-900 group-hover:text-red-700 transition-colors">
                    {state.nombre}
                  </h3>
                  <span className="text-xs font-bold text-slate-400 block mt-0.5">
                    {state.codigo}
                  </span>
                </div>

                {/* Activity Badges */}
                {hasActivity ? (
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 flex-wrap">
                    {(activity.desastres ?? 0) > 0 && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-100 border border-red-300 text-red-800 text-[10px] font-black uppercase">
                        <Flame className="w-3 h-3 text-red-600" />
                        {activity.desastres} des.
                      </span>
                    )}
                    {(activity.camps ?? 0) > 0 && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-black uppercase">
                        <Users className="w-3 h-3" />
                        {activity.camps} ref.
                      </span>
                    )}
                    {(activity.acopios ?? 0) > 0 && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-black uppercase">
                        <Building2 className="w-3 h-3" />
                        {activity.acopios} acop.
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Sin actividad registrada
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <Search className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="font-extrabold text-slate-800 text-base mb-1">
              No se encontraron estados
            </h3>
            <p className="text-xs font-medium text-slate-500">
              No hay coincidencias para "{search}". Verificá la ortografía o buscá por código.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
