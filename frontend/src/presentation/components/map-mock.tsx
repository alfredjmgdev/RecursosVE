'use client';

import React from 'react';
import { MapPin, Navigation } from 'lucide-react';

export const MapMock: React.FC = () => {
  return (
    <div className="relative w-full h-64 sm:h-80 md:h-[400px] lg:h-[440px] rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl group transition-all">
      {/* SVG Map Grid Background */}
      <svg className="absolute inset-0 w-full h-full opacity-30" width="100%" height="100%">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#334155" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Route Line Connecting Las Flores -> Campamento 7 */}
        <path
          d="M 320 280 L 220 160 L 140 160"
          fill="none"
          stroke="#14B8A6"
          strokeWidth="3"
          strokeDasharray="6 4"
          className="animate-pulse"
        />
        {/* Route Line to Zona Norte */}
        <path
          d="M 220 160 L 250 70"
          fill="none"
          stroke="#F43F5E"
          strokeWidth="2"
          strokeDasharray="4 4"
        />
      </svg>

      {/* Map Header Overlay */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-800 text-xs font-semibold text-slate-200 shadow-md">
          <Navigation className="w-4 h-4 text-cyan-400 animate-spin" />
          <span>Mapa Situacional en Tiempo Real (Venezuela 2026)</span>
        </div>
        <div className="text-xs font-semibold bg-cyan-950/80 text-cyan-300 backdrop-blur-md px-3 py-1.5 rounded-xl border border-cyan-800 shadow-md hidden sm:block">
          Radio de Cobertura Local: 2.0 km
        </div>
      </div>

      {/* Map Pins */}
      {/* Pin 1: Zona Norte - CRÍTICO */}
      <div className="absolute top-12 right-1/3 flex items-center gap-1.5 bg-slate-900/90 border border-rose-800 px-3 py-1.5 rounded-xl shadow-xl z-10 hover:scale-105 transition-transform">
        <MapPin className="w-4 h-4 text-rose-500 fill-rose-500/20 animate-bounce" />
        <span className="text-xs font-bold text-rose-400">Zona Norte - CRÍTICO (Score: 79)</span>
      </div>

      {/* Pin 2: Campamento 7 - PARCIAL */}
      <div className="absolute top-36 left-12 flex items-center gap-1.5 bg-slate-900/90 border border-amber-800 px-3 py-1.5 rounded-xl shadow-xl z-10 hover:scale-105 transition-transform">
        <MapPin className="w-4 h-4 text-amber-500 fill-amber-500/20" />
        <span className="text-xs font-bold text-amber-400">Campamento 7 - PARCIAL (Agua 50L)</span>
      </div>

      {/* Pin 3: Las Flores - CUBIERTO */}
      <div className="absolute bottom-16 right-16 flex items-center gap-1.5 bg-slate-900/90 border border-emerald-800 px-3 py-1.5 rounded-xl shadow-xl z-10 hover:scale-105 transition-transform">
        <MapPin className="w-4 h-4 text-emerald-500 fill-emerald-500/20" />
        <span className="text-xs font-bold text-emerald-400">Depósito Las Flores (Stock 300L)</span>
      </div>

      {/* Map Footer Bar */}
      <div className="absolute bottom-3 left-4 right-4 bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-800 text-xs font-semibold text-slate-300 flex justify-between items-center z-10 shadow-lg">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          12 Activas sin cobertura
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          8 En transporte local
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          34 Casos resueltos
        </span>
      </div>
    </div>
  );
};
