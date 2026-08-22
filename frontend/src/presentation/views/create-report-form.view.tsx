'use client';

import React, { useMemo, useState } from 'react';
import { useRecursosVE } from '../../application/context/recursosve-context';
import { UserRole } from '../../domain/entities/user.entity';
import { ResourceCategory } from '../../domain/entities/report.entity';
import { Send, CheckCircle2, AlertTriangle, MapPin, HelpCircle, Info, PlusCircle, Sparkles, Bot, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FALLBACK_VENEZUELA_STATES } from '../../domain/entities/venezuela-states.data';

interface CreateReportFormViewProps {
  stateCodeParam?: string;
}

export const CreateReportFormView: React.FC<CreateReportFormViewProps> = ({ stateCodeParam }) => {
  const { createReport, customCampamentos, customAcopios, selectedStateId, setSelectedStateId, venezuelaStates, currentUser, processNlpReport } = useRecursosVE();
  const router = useRouter();

  // RBAC Guard: DONANTE cannot create report needs
  React.useEffect(() => {
    if (currentUser && currentUser.rol === UserRole.DONANTE) {
      router.push(stateCodeParam ? `/estado/${stateCodeParam}/donar` : '/donar');
    }
  }, [currentUser, router, stateCodeParam]);

  if (currentUser && currentUser.rol === UserRole.DONANTE) {
    return null;
  }

  const allStates = venezuelaStates.length > 0 ? venezuelaStates : FALLBACK_VENEZUELA_STATES;

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

  const stateCampamentos = useMemo(() => {
    if (!selectedStateId) return customCampamentos;
    return customCampamentos.filter((c) => c.estadoId === selectedStateId || (!c.estadoId && selectedStateId === 22));
  }, [customCampamentos, selectedStateId]);

  const stateAcopios = useMemo(() => {
    if (!selectedStateId) return customAcopios;
    return customAcopios.filter((a) => a.estadoId === selectedStateId || (!a.estadoId && selectedStateId === 22));
  }, [customAcopios, selectedStateId]);

  const hasNoInfrastructure = useMemo(() => {
    return stateCampamentos.length === 0 && stateAcopios.length === 0;
  }, [stateCampamentos, stateAcopios]);

  const [isManualOnly, setIsManualOnly] = useState(false);
  const [nlpText, setNlpText] = useState(
    'Urgente en Campamento La Guaira: requerimos 50 cajas de agua potable y 30 dosis de insulina rápida para 5 niños y ancianos afectados'
  );
  const [isAnalyzingNlp, setIsAnalyzingNlp] = useState(false);
  const [nlpSource, setNlpSource] = useState<string | null>(null);

  const [categoria, setCategoria] = useState<ResourceCategory>(ResourceCategory.MEDICAMENTO);
  const [item, setItem] = useState('Insulina rápida');
  const [cantidadRequerida, setCantidadRequerida] = useState(80);
  const [unidad, setUnidad] = useState('dosis');

  const handleAnalyzeNlp = async () => {
    if (!nlpText.trim()) return;
    setIsAnalyzingNlp(true);
    setNlpSource(null);
    try {
      const result = await processNlpReport(nlpText);
      setCategoria(result.categoria as ResourceCategory);
      setItem(result.item);
      setCantidadRequerida(result.cantidadRequerida);
      setUnidad(result.unidad);
      setPoblacionVulnerable(result.poblacionVulnerable);
      setHorasSinCobertura(result.horasSinCobertura);
      setNlpSource(result.source);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzingNlp(false);
    }
  };
  
  // Infrastructure Selection State
  const [selectedInfraId, setSelectedInfraId] = useState<string>('');
  const [campamento, setCampamento] = useState('');
  const [lat, setLat] = useState(10.601);
  const [lng, setLng] = useState(-66.932);

  const [poblacionVulnerable, setPoblacionVulnerable] = useState(true);
  const [horasSinCobertura, setHorasSinCobertura] = useState(48);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);

  // Auto-select first available campamento or acopio for the current state
  React.useEffect(() => {
    if (stateCampamentos.length > 0) {
      const firstCamp = stateCampamentos[0];
      setSelectedInfraId(`camp_${firstCamp.id}`);
      setCampamento(firstCamp.nombre);
      setLat(firstCamp.lat);
      setLng(firstCamp.lng);
    } else if (stateAcopios.length > 0) {
      const firstAcopio = stateAcopios[0];
      setSelectedInfraId(`acopio_${firstAcopio.id}`);
      setCampamento(`Centro de Acopio ${firstAcopio.nombre}`);
      setLat(firstAcopio.lat);
      setLng(firstAcopio.lng);
    } else {
      setSelectedInfraId('');
      setCampamento('');
      setLat(activeState?.lat ?? 10.601);
      setLng(activeState?.lng ?? -66.932);
    }
  }, [stateCampamentos, stateAcopios, activeState]);

  const handleInfraChange = (val: string) => {
    setSelectedInfraId(val);

    if (val.startsWith('camp_')) {
      const id = val.replace('camp_', '');
      const found = stateCampamentos.find((c) => c.id === id);
      if (found) {
        setCampamento(found.nombre);
        setLat(found.lat);
        setLng(found.lng);
      }
    } else if (val.startsWith('acopio_')) {
      const id = val.replace('acopio_', '');
      const found = stateAcopios.find((a) => a.id === id);
      if (found) {
        setCampamento(`Centro de Acopio ${found.nombre}`);
        setLat(found.lat);
        setLng(found.lng);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (hasNoInfrastructure) return;

    let cleanInfraId: string | undefined;
    let infraType: 'CAMPAMENTO' | 'ACOPIO' | undefined;
    if (selectedInfraId.startsWith('camp_')) {
      cleanInfraId = selectedInfraId.replace('camp_', '');
      infraType = 'CAMPAMENTO';
    } else if (selectedInfraId.startsWith('acopio_')) {
      cleanInfraId = selectedInfraId.replace('acopio_', '');
      infraType = 'ACOPIO';
    }

    try {
      setIsSubmitting(true);
      await createReport({
        tipo: 'NECESIDAD_CRITICA',
        zona: {
          lat: Number(lat),
          lng: Number(lng),
          campamento: campamento || `Sector ${activeState?.nombre}`,
          infrastructureId: cleanInfraId,
          infrastructureType: infraType,
        },
        recurso: {
          categoria,
          item,
          cantidadRequerida: Number(cantidadRequerida),
          unidad,
        },
        metadataUrgencia: {
          poblacionVulnerable,
          horasSinCobertura: Number(horasSinCobertura),
          confirmacionesLocales: 1,
        },
      });
      setSuccessMessage(true);
      setTimeout(() => {
        const targetCode = activeState?.codigo.toLowerCase() ?? 've-x';
        router.push(`/estado/${targetCode}`);
      }, 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="bg-white border border-slate-200 p-6 md:p-8 rounded-3xl shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <h2 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            Reportar Necesidad Crítica
          </h2>
          {activeState && (
            <span className="text-xs font-black bg-red-100 text-red-800 border border-red-300 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-xs">
              <MapPin className="w-3.5 h-3.5 text-red-600" />
              Estado: {activeState.nombre}
            </span>
          )}
        </div>
        <p className="text-xs md:text-sm text-slate-500 mb-6 font-medium">
          Agente de Captura (Local-First): los reportes se registran para <strong>{activeState?.nombre || 'el estado seleccionado'}</strong> y se sincronizan automáticamente.
        </p>

        {successMessage && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-800 text-xs md:text-sm font-bold flex items-center gap-2.5 animate-fadeIn shadow-md">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            ¡Reporte creado exitosamente! Calculando Score de Criticidad...
          </div>
        )}

        {/* Control Unificado: Checkbox para Carga Manual vs Asistencia IA */}
        <div className="mb-6 flex flex-wrap items-center justify-between p-3.5 bg-slate-50 border border-slate-200/90 rounded-2xl gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className={`w-4 h-4 ${!isManualOnly ? 'text-amber-600 animate-pulse' : 'text-slate-400'}`} />
            <span className="text-xs font-bold text-slate-800">
              {isManualOnly ? 'Modo Formulario Estructurado (Manual)' : 'Asistente de Captura IA (Agente 1 NLP)'}
            </span>
          </div>
          <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer select-none bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs hover:bg-slate-100 transition-colors">
            <input
              type="checkbox"
              checked={isManualOnly}
              onChange={(e) => setIsManualOnly(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-red-600 focus:ring-red-500 cursor-pointer"
            />
            <span>Ingresar datos manualmente</span>
          </label>
        </div>

        {/* Sección de Entradas del Agente 1 (NLP) - Opcional según Checkbox */}
        {!isManualOnly && (
          <div className="mb-6 p-5 bg-gradient-to-br from-amber-50/80 to-red-50/50 border border-amber-200 rounded-2xl space-y-3.5 shadow-sm">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-wider text-amber-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 animate-pulse" />
                Agente 1: Procesar Texto Informal de Emergencia (Qwen2.5 local)
              </label>
              {nlpSource && (
                <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  ✓ {nlpSource === 'OLLAMA_QWEN2.5' ? 'Extraído por Ollama (VPS)' : 'Extraído por Heurística Fallback'}
                </span>
              )}
            </div>
            <textarea
              rows={3}
              value={nlpText}
              onChange={(e) => setNlpText(e.target.value)}
              placeholder="Escribí o pegá un mensaje informal de WhatsApp o radio de emergencia..."
              className="w-full bg-white border border-amber-300 rounded-xl p-3.5 text-xs md:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
            />
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] text-amber-800/80 font-medium">
                💡 El Agente 1 analizará el texto, extraerá el insumo, la cantidad, la categoría y la población vulnerable automáticamente.
              </p>
              <button
                type="button"
                onClick={handleAnalyzeNlp}
                disabled={isAnalyzingNlp || !nlpText.trim()}
                className="bg-amber-600 hover:bg-amber-700 active:scale-98 text-white px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all shadow-md shrink-0 disabled:opacity-50"
              >
                {isAnalyzingNlp ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Analizando con Ollama...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Procesar con Agente 1 (NLP)
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Form Grid for Desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Categoría */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Categoría del Recurso
              </label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value as ResourceCategory)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-xs md:text-sm text-slate-900 focus:outline-none focus:border-red-600 transition-colors font-medium"
              >
                <option value={ResourceCategory.MEDICAMENTO}>Medicamentos / Insumos médicos</option>
                <option value={ResourceCategory.AGUA}>Agua potable</option>
                <option value={ResourceCategory.ALIMENTO}>Alimento no perecedero</option>
                <option value={ResourceCategory.ABRIGO}>Abrigo / Carpas</option>
                <option value={ResourceCategory.ROPA}>Ropa</option>
                <option value={ResourceCategory.OTRO}>Otro</option>
              </select>
            </div>

            {/* Nombre específico del ítem */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Ítem / Especificación
              </label>
              <input
                type="text"
                value={item}
                onChange={(e) => setItem(e.target.value)}
                required
                placeholder="Ej: Insulina rápida, Suero oral"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-xs md:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-600 transition-colors font-medium"
              />
            </div>
          </div>

          {/* Cantidad & Unidad */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Cantidad Requerida
              </label>
              <input
                type="number"
                value={cantidadRequerida}
                onChange={(e) => setCantidadRequerida(Number(e.target.value))}
                required
                min="1"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-xs md:text-sm text-slate-900 focus:outline-none focus:border-red-600 transition-colors font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Unidad
              </label>
              <input
                type="text"
                value={unidad}
                onChange={(e) => setUnidad(e.target.value)}
                required
                placeholder="dosis, litros, cajas"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-xs md:text-sm text-slate-900 focus:outline-none focus:border-red-600 transition-colors font-medium"
              />
            </div>
          </div>

          {/* Ubicación / Infraestructura del Reporte */}
          <div className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-4 h-4 text-red-600" />
              Infraestructura de Destino / Punto de Emergencia
            </h3>

            {hasNoInfrastructure ? (
              <div className="bg-red-50 border-2 border-red-200 p-5 rounded-2xl space-y-3.5">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-black text-red-900 uppercase tracking-wider">
                      Sin infraestructuras registradas en {activeState?.nombre || 'este estado'}
                    </h4>
                    <p className="text-xs text-red-700 font-medium mt-1 leading-relaxed">
                      Para publicar un reporte de necesidad, primero se requiere registrar al menos un refugio/campamento o centro de acopio en este estado.
                    </p>
                  </div>
                </div>

                <Link
                  href={activeState ? `/estado/${activeState.codigo.toLowerCase()}` : '/'}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black shadow-md shadow-red-600/20 transition-all border border-red-500"
                >
                  <PlusCircle className="w-4 h-4 text-amber-200" />
                  <span>Ir al Mapa de Mando a Registrar Infraestructura ({activeState?.nombre})</span>
                </Link>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Seleccionar Infraestructura Registrada en {activeState?.nombre || 'el Estado'}
                </label>
                <select
                  value={selectedInfraId}
                  onChange={(e) => handleInfraChange(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-xs md:text-sm text-slate-900 font-bold focus:outline-none focus:border-red-600 transition-colors shadow-xs"
                >
                  {stateCampamentos.length > 0 && (
                    <optgroup label={`⛺ Campamentos Registrados en ${activeState?.nombre || 'el Estado'}`}>
                      {stateCampamentos.map((c) => (
                        <option key={c.id} value={`camp_${c.id}`}>
                          ⛺ {c.nombre} ({c.familias} familias — Coord: {c.coordinador})
                        </option>
                      ))}
                    </optgroup>
                  )}

                  {stateAcopios.length > 0 && (
                    <optgroup label={`📦 Centros de Acopio Registrados en ${activeState?.nombre || 'el Estado'}`}>
                      {stateAcopios.map((a) => (
                        <option key={a.id} value={`acopio_${a.id}`}>
                          📦 Centro de Acopio {a.nombre}
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>

                <div className="mt-3 p-3 bg-red-50/80 border border-red-200 rounded-xl text-red-800 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-red-600 shrink-0" />
                  <span>Reporte vinculado a: <strong>{campamento}</strong></span>
                </div>
              </div>
            )}
          </div>

          {/* Variables de la Fórmula de Criticidad */}
          <div className="bg-amber-50/80 p-5 rounded-2xl border border-amber-200/90 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-amber-900 uppercase tracking-wider flex items-center gap-2">
                Variables de Priorización IA (Fórmula de Criticidad)
              </h3>
              <div className="group relative inline-block">
                <HelpCircle className="w-4 h-4 text-amber-700 hover:text-red-600 transition-colors cursor-pointer" />
                <div className="pointer-events-none absolute right-0 bottom-full mb-2 hidden group-hover:flex flex-col w-64 p-3 bg-slate-900 text-white text-[11px] font-normal leading-relaxed rounded-xl shadow-xl z-20 transition-all border border-slate-700">
                  <strong className="font-bold text-amber-300 mb-1 flex items-center gap-1">
                    <Info className="w-3.5 h-3.5" /> Fisiología de Priorización IA
                  </strong>
                  El sistema evalúa tiempo sin suministro y vulnerabilidad social para priorizar automáticamente la orden de despacho en el mapa de control.
                  <div className="absolute top-full right-3 -mt-1 border-4 border-transparent border-t-slate-900"></div>
                </div>
              </div>
            </div>

            {/* Slider Horas sin cobertura */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs md:text-sm text-slate-800 font-semibold flex items-center gap-1.5">
                  <span>Horas acumuladas sin cobertura:</span>
                  <span className="font-black text-red-600 text-sm">{horasSinCobertura} hrs</span>
                  <div className="group relative inline-block">
                    <HelpCircle className="w-4 h-4 text-amber-700 hover:text-red-600 transition-colors cursor-pointer" />
                    <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:flex flex-col w-72 p-3 bg-slate-900 text-white text-[11px] font-normal leading-relaxed rounded-xl shadow-xl z-20 transition-all border border-slate-700">
                      <strong className="font-bold text-amber-300 mb-1 flex items-center gap-1">
                        <Info className="w-3.5 h-3.5" /> ¿Cómo influyen las horas sin servicio?
                      </strong>
                      Indica el tiempo continuo que la comunidad lleva sin recibir el insumo vital. A mayor cantidad de horas acumuladas, el algoritmo de IA eleva exponencialmente el Score de Urgencia para evitar crisis severas.
                      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900"></div>
                    </div>
                  </div>
                </label>
              </div>

              <input
                type="range"
                min="1"
                max="72"
                value={horasSinCobertura}
                onChange={(e) => setHorasSinCobertura(Number(e.target.value))}
                className="w-full accent-red-600 cursor-pointer"
              />
            </div>

            {/* Checkbox Población Vulnerable */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-3 text-xs md:text-sm text-slate-800 cursor-pointer font-semibold">
                <input
                  type="checkbox"
                  checked={poblacionVulnerable}
                  onChange={(e) => setPoblacionVulnerable(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-red-600 focus:ring-red-500 cursor-pointer"
                />
                <span>Población de alto riesgo presente (niños/ancianos) (+2x multiplicador)</span>
              </label>

              <div className="group relative inline-block shrink-0 ml-2">
                <HelpCircle className="w-4 h-4 text-amber-700 hover:text-red-600 transition-colors cursor-pointer" />
                <div className="pointer-events-none absolute right-0 bottom-full mb-2 hidden group-hover:flex flex-col w-72 p-3 bg-slate-900 text-white text-[11px] font-normal leading-relaxed rounded-xl shadow-xl z-20 transition-all border border-slate-700">
                  <strong className="font-bold text-amber-300 mb-1 flex items-center gap-1">
                    <Info className="w-3.5 h-3.5" /> Multiplicador de Población Vulnerable
                  </strong>
                  Al marcar esta opción se duplica (x2) la ponderación del reporte. Se activa cuando hay niños, personas mayores, embarazadas o enfermos crónicos en el lugar afectado.
                  <div className="absolute top-full right-2 -mt-1 border-4 border-transparent border-t-slate-900"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || hasNoInfrastructure}
            className={`w-full py-4 px-6 rounded-2xl font-black text-sm flex items-center justify-center gap-2.5 transition-all ${
              hasNoInfrastructure
                ? 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed shadow-none'
                : 'bg-red-600 hover:bg-red-700 text-white shadow-xl shadow-red-600/25 cursor-pointer'
            }`}
          >
            <Send className="w-5 h-5" />
            {hasNoInfrastructure
              ? 'Registrá una infraestructura para publicar el reporte'
              : isSubmitting
              ? 'Enviando Reporte...'
              : 'Publicar Reporte de Necesidad'}
          </button>
        </form>
      </div>
    </div>
  );
};
