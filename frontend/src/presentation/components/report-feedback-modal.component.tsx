'use client';

import React, { useState } from 'react';
import { X, Star, BrainCircuit, CheckCircle2, AlertTriangle, MessageSquare } from 'lucide-react';
import { useRecursosVE } from '../../application/context/recursosve-context';

interface ReportFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportId: string;
  categoriaInsumo?: string;
  estadoNombre?: string;
}

export const ReportFeedbackModal: React.FC<ReportFeedbackModalProps> = ({
  isOpen,
  onClose,
  reportId,
  categoriaInsumo = 'Insumo de Emergencia',
  estadoNombre = 'La Guaira',
}) => {
  const { submitReportFeedback } = useRecursosVE();
  const [calificacion, setCalificacion] = useState<number>(5);
  const [resultado, setResultado] = useState<'EXITOSO' | 'DEMANDA_SUBESTIMADA' | 'RETRASO_LOGISTICO' | 'RECURSO_EQUIVOCADO'>('EXITOSO');
  const [comentario, setComentario] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await submitReportFeedback({
        reportId,
        calificacion,
        resultado,
        comentario,
        categoriaInsumo,
        estadoNombre,
      });
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Error enviando feedback:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30">
              <BrainCircuit className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Agente 5: Feedback & Memoria Adaptativa</h3>
              <p className="text-xs text-slate-400">Evaluación Operativa de Campo Post-Despacho</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
            <h4 className="text-lg font-bold text-white">¡Evaluación Registrada con Éxito!</h4>
            <p className="text-xs text-slate-300">
              El Agente 5 ha procesado la retroalimentación y recalculado los coeficientes de severidad para futuros despachos.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Target Summary */}
            <div className="bg-slate-800/60 border border-slate-700/50 p-3 rounded-xl text-xs space-y-1">
              <div className="text-slate-400">Reporte Asociado: <span className="font-mono text-cyan-400">{reportId}</span></div>
              <div className="text-slate-200 font-semibold">{categoriaInsumo} • {estadoNombre}</div>
            </div>

            {/* Star Rating */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Efectividad del Despacho (1 a 5 estrellas)
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setCalificacion(star)}
                    className="p-1 transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        star <= calificacion
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-600 hover:text-amber-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Outcome Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Resultado Operativo en Terreno
              </label>
              <select
                value={resultado}
                onChange={(e) => setResultado(e.target.value as any)}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500"
              >
                <option value="EXITOSO">🟢 Exitoso (Demanda y tiempos óptimos)</option>
                <option value="DEMANDA_SUBESTIMADA">🟡 Demanda Subestimada (Se requirió más insumo)</option>
                <option value="RETRASO_LOGISTICO">🟠 Retraso Logístico / Incidencia Vial</option>
                <option value="RECURSO_EQUIVOCADO">🔴 Especificación Incorrecta del Insumo</option>
              </select>
            </div>

            {/* Comments */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Observaciones de Campo
              </label>
              <textarea
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                placeholder="Escribe comentarios sobre el comportamiento de la demanda o lecciones aprendidas..."
                rows={3}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-3 text-xs focus:outline-none focus:border-red-500 placeholder-slate-500"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white rounded-lg text-xs font-bold transition-all shadow-md flex items-center gap-2"
              >
                {submitting ? 'Guardando...' : 'Enviar Retroalimentación a la IA'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
