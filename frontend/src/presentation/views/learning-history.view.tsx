'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRecursosVE } from '../../application/context/recursosve-context';
import { UserRole } from '../../domain/entities/user.entity';
import { BrainCircuit, TrendingUp, ShieldCheck, Zap, Sliders, MessageSquarePlus } from 'lucide-react';
import { LearningPattern } from '../../domain/entities/learning.entity';
import { ReportFeedbackModal } from '../components/report-feedback-modal.component';

export const LearningHistoryView: React.FC = () => {
  const { learningMetrics, currentUser } = useRecursosVE();
  const router = useRouter();
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

  // RBAC Guard: Only COORDINADOR can view IA & Aprendizaje
  React.useEffect(() => {
    if (currentUser && currentUser.rol !== UserRole.COORDINADOR) {
      if (currentUser.rol === UserRole.BRIGADISTA) {
        router.push('/reportar');
      } else {
        router.push('/donar');
      }
    }
  }, [currentUser, router]);

  if (currentUser && currentUser.rol !== UserRole.COORDINADOR) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Feedback Modal Triggered for Agente 5 */}
      <ReportFeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        reportId="REP_DEMO_2026"
        categoriaInsumo="AGUA_Y_MEDICINAS"
        estadoNombre="La Guaira"
      />

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-red-700 via-red-600 to-amber-600 border border-red-800 p-6 md:p-8 rounded-3xl shadow-xl text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-white font-black text-lg md:text-xl">
            <BrainCircuit className="w-6 h-6 text-amber-200" />
            <h2>Agente de Aprendizaje & Memoria Adaptativa (Agente 5)</h2>
          </div>
          <p className="text-xs md:text-sm text-red-100 leading-relaxed font-medium">
            Analiza ciclos completados para evitar cuellos de botella recurrentes y ajustar ponderadores de criticidad en función de la experiencia en terreno.
          </p>
        </div>

        <button
          onClick={() => setIsFeedbackModalOpen(true)}
          className="px-4 py-3 bg-white text-red-700 hover:bg-red-50 font-black text-xs rounded-2xl shadow-lg transition-all flex items-center gap-2 shrink-0 self-start md:self-auto cursor-pointer"
        >
          <MessageSquarePlus className="w-4 h-4 text-red-600" />
          <span>Evaluar Despacho (Feedback)</span>
        </button>
      </div>

      {/* Metrics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border-2 border-red-200 p-5 rounded-2xl text-center shadow-md">
          <span className="block text-3xl font-black text-red-600">
            {learningMetrics?.ciclosCompletados ?? 47}
          </span>
          <span className="text-xs uppercase font-black text-red-700">
            Ciclos Resueltos
          </span>
        </div>
        <div className="bg-white border-2 border-amber-200 p-5 rounded-2xl text-center shadow-md">
          <span className="block text-3xl font-black text-amber-600">
            {learningMetrics?.tiempoPromedioResolucionHoras ?? 3.5}h
          </span>
          <span className="text-xs uppercase font-black text-amber-700">
            Tiempo Promedio
          </span>
        </div>
        <div className="bg-white border-2 border-emerald-200 p-5 rounded-2xl text-center shadow-md">
          <span className="block text-3xl font-black text-emerald-600 flex items-center justify-center gap-1">
            <TrendingUp className="w-5 h-5" />
            +{learningMetrics?.mejoraTiempoPorcentaje ?? 41}%
          </span>
          <span className="text-xs uppercase font-black text-emerald-700">
            Eficiencia Acelerada
          </span>
        </div>
      </div>

      {/* Adaptive Criticality Multipliers Panel */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg space-y-3 text-white">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
          <Sliders className="w-4 h-4 text-amber-400" />
          <span>Matriz de Pesos Adaptativos Dinámicos (Agente 2 & Agente 5)</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
            <span className="text-slate-400 block mb-1">Población Vulnerable</span>
            <span className="text-lg font-black text-cyan-400">1.80x</span>
            <span className="text-[10px] text-emerald-400 block mt-0.5">↑ Ajustado por IA</span>
          </div>
          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
            <span className="text-slate-400 block mb-1">Insumo Medicamentos</span>
            <span className="text-lg font-black text-amber-400">1.50x</span>
            <span className="text-[10px] text-amber-400 block mt-0.5">• Estable</span>
          </div>
          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
            <span className="text-slate-400 block mb-1">Insumo Agua Potable</span>
            <span className="text-lg font-black text-cyan-400">1.40x</span>
            <span className="text-[10px] text-emerald-400 block mt-0.5">↑ Ajustado por IA</span>
          </div>
          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
            <span className="text-slate-400 block mb-1">Horas sin Cobertura</span>
            <span className="text-lg font-black text-emerald-400">1.25x</span>
            <span className="text-[10px] text-slate-400 block mt-0.5"> Base fija</span>
          </div>
        </div>
      </div>

      {/* AI Detected Patterns Section */}
      <div className="space-y-4">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 px-1 flex items-center gap-2">
          <Zap className="w-4 h-4 text-red-600" />
          Patrones Detectados en Terreno & Ajustes de Regla
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {learningMetrics?.patronesDetectados.map((patron: LearningPattern) => {
            let badgeColor = 'bg-red-100 text-red-700 border-red-300';
            if (patron.tipo === 'PREALERTA') {
              badgeColor = 'bg-amber-100 text-amber-800 border-amber-300';
            } else if (patron.tipo === 'CATEGORIA_PAUSADA') {
              badgeColor = 'bg-rose-100 text-rose-800 border-rose-300';
            } else if (patron.tipo === 'MEJORA_TIEMPO') {
              badgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-300';
            }

            return (
              <div
                key={patron.id}
                className="bg-white border border-slate-200 p-5 rounded-2xl space-y-3 shadow-md hover:border-red-300 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg border uppercase ${badgeColor}`}>
                      {patron.tipo}
                    </span>
                    <span className="text-xs font-bold text-slate-400">#{patron.id}</span>
                  </div>

                  <h4 className="font-extrabold text-slate-900 text-base mb-1">{patron.titulo}</h4>

                  <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-medium">{patron.descripcion}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 text-xs text-red-700 font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-red-600 shrink-0" />
                  <span>Impacto: {patron.impacto}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
