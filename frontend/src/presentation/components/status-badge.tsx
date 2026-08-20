'use client';

import React from 'react';
import { AlertTriangle, CheckCircle2, Clock, Truck } from 'lucide-react';
import { ReportStatus } from '../../domain/entities/report.entity';

interface StatusBadgeProps {
  status: ReportStatus | string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  switch (status) {
    case ReportStatus.SIN_COBERTURA:
    case 'CRÍTICO':
    case 'CRITICO':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-black bg-red-600 text-white border border-red-700 uppercase tracking-wide shadow-sm shadow-red-600/20 shrink-0">
          <AlertTriangle className="w-3.5 h-3.5" />
          CRÍTICO
        </span>
      );
    case ReportStatus.PARCIAL:
    case 'PARCIAL':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-black bg-amber-500 text-slate-950 border border-amber-600 uppercase tracking-wide shadow-sm shadow-amber-500/20 shrink-0">
          <Clock className="w-3.5 h-3.5" />
          PARCIAL
        </span>
      );
    case ReportStatus.EN_TRANSITO:
    case 'EN_TRANSITO':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-black bg-amber-400 text-slate-950 border border-amber-500 uppercase tracking-wide shadow-sm shrink-0">
          <Truck className="w-3.5 h-3.5" />
          EN TRÁNSITO
        </span>
      );
    case ReportStatus.CUBIERTA:
    case 'CUBIERTO':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-black bg-emerald-600 text-white border border-emerald-700 uppercase tracking-wide shadow-sm shrink-0">
          <CheckCircle2 className="w-3.5 h-3.5" />
          CUBIERTO
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-slate-200 text-slate-800 shrink-0">
          {status}
        </span>
      );
  }
};
