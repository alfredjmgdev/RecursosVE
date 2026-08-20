'use client';

import React, { useState } from 'react';
import {
  useRecursosVE,
  CustomAcopio,
  CustomCampamento,
  CustomDesastre,
  DisasterEventType,
} from '../../application/context/recursosve-context';
import { DISASTER_THEMES, getDisasterTheme } from '../../domain/entities/disaster-palette';
import { Building2, Home, Flame, Edit2, Trash2, X, Search, Check, AlertCircle } from 'lucide-react';

interface ManageInfrastructureListModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function parseContact(raw: string): { nombre: string; telefono: string } {
  if (!raw) return { nombre: '', telefono: '' };
  const match = raw.match(/^(.*?)\s*\(([^)]+)\)$/);
  if (match) {
    return { nombre: match[1].trim(), telefono: match[2].trim() };
  }
  return { nombre: raw.trim(), telefono: '' };
}

export const ManageInfrastructureListModal: React.FC<ManageInfrastructureListModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    customCampamentos,
    customAcopios,
    customDesastres,
    disasterTypes,
    updateCampamento,
    deleteCampamento,
    updateAcopio,
    deleteAcopio,
    updateDesastre,
    deleteDesastre,
  } = useRecursosVE();

  const [activeTab, setActiveTab] = useState<'CAMPAMENTOS' | 'ACOPIOS' | 'DESASTRES'>('CAMPAMENTOS');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Edit form state
  const [editName, setEditName] = useState('');
  const [editLat, setEditLat] = useState('');
  const [editLng, setEditLng] = useState('');
  // Campamento
  const [editPoblacion, setEditPoblacion] = useState('');
  const [editFamilias, setEditFamilias] = useState('');
  const [editCapacidad, setEditCapacidad] = useState('');
  const [editCoordinadorNombre, setEditCoordinadorNombre] = useState('');
  const [editCoordinadorTelefono, setEditCoordinadorTelefono] = useState('');
  // Acopio
  const [editStock, setEditStock] = useState('');
  const [editContactoNombre, setEditContactoNombre] = useState('');
  const [editContactoTelefono, setEditContactoTelefono] = useState('');
  // Desastre
  const [editTipo, setEditTipo] = useState<DisasterEventType>('TERREMOTO');
  const [editRadio, setEditRadio] = useState('');

  if (!isOpen) return null;

  const startEditCamp = (camp: CustomCampamento) => {
    setEditingId(camp.id);
    setEditName(camp.nombre);
    setEditLat(camp.lat.toString());
    setEditLng(camp.lng.toString());
    setEditPoblacion(camp.poblacion.toString());
    setEditFamilias(camp.familias.toString());
    setEditCapacidad(camp.capacidad.toString());
    const parsed = parseContact(camp.coordinador);
    setEditCoordinadorNombre(parsed.nombre);
    setEditCoordinadorTelefono(parsed.telefono);
  };

  const startEditAcopio = (acopio: CustomAcopio) => {
    setEditingId(acopio.id);
    setEditName(acopio.nombre);
    setEditLat(acopio.lat.toString());
    setEditLng(acopio.lng.toString());
    setEditStock(acopio.stockInfo);
    const parsed = parseContact(acopio.contacto);
    setEditContactoNombre(parsed.nombre);
    setEditContactoTelefono(parsed.telefono);
  };

  const startEditDesastre = (desastre: CustomDesastre) => {
    setEditingId(desastre.id);
    setEditName(desastre.nombre);
    setEditLat(desastre.lat.toString());
    setEditLng(desastre.lng.toString());
    setEditTipo(desastre.tipo);
    setEditRadio(desastre.radioMetros.toString());
  };

  const handleSaveCamp = async (id: string) => {
    const coordCombined = editCoordinadorTelefono.trim()
      ? `${editCoordinadorNombre.trim()} (${editCoordinadorTelefono.trim()})`
      : editCoordinadorNombre.trim();

    await updateCampamento(id, {
      nombre: editName,
      lat: parseFloat(editLat),
      lng: parseFloat(editLng),
      poblacion: parseInt(editPoblacion) || 0,
      familias: parseInt(editFamilias) || 0,
      capacidad: parseInt(editCapacidad) || 0,
      coordinador: coordCombined,
    });
    setEditingId(null);
  };

  const handleSaveAcopio = async (id: string) => {
    const contactoCombined = editContactoTelefono.trim()
      ? `${editContactoNombre.trim()} (${editContactoTelefono.trim()})`
      : editContactoNombre.trim();

    await updateAcopio(id, {
      nombre: editName,
      lat: parseFloat(editLat),
      lng: parseFloat(editLng),
      stockInfo: editStock,
      contacto: contactoCombined,
    });
    setEditingId(null);
  };

  const handleSaveDesastre = async (id: string) => {
    await updateDesastre(id, {
      nombre: editName,
      lat: parseFloat(editLat),
      lng: parseFloat(editLng),
      tipo: editTipo,
      radioMetros: parseInt(editRadio) || 1000,
    });
    setEditingId(null);
  };

  const filteredCamps = customCampamentos.filter((c) =>
    c.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredAcopios = customAcopios.filter((a) =>
    a.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredDesastres = customDesastres.filter((d) =>
    d.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-slate-900 via-slate-800 to-red-950 text-white border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-600/20 border border-red-500/30 rounded-2xl">
              <Building2 className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white tracking-wide">
                Gestión de Infraestructura Registrada
              </h2>
              <p className="text-xs text-slate-300">
                Edita o elimina registros guardados en la base de datos de PostgreSQL
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Tabs Toolbar */}
        <div className="p-5 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Tabs */}
          <div className="flex bg-slate-200/80 p-1 rounded-2xl w-full md:w-auto">
            <button
              onClick={() => {
                setActiveTab('CAMPAMENTOS');
                setEditingId(null);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeTab === 'CAMPAMENTOS'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              <Home className="w-4 h-4" />
              Campamentos ({customCampamentos.length})
            </button>
            <button
              onClick={() => {
                setActiveTab('ACOPIOS');
                setEditingId(null);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeTab === 'ACOPIOS'
                  ? 'bg-amber-500 text-white shadow-md'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-4 h-4" />
              Acopios ({customAcopios.length})
            </button>
            <button
              onClick={() => {
                setActiveTab('DESASTRES');
                setEditingId(null);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeTab === 'DESASTRES'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              <Flame className="w-4 h-4" />
              Desastres ({customDesastres.length})
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Buscar por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Modal Body / Items List */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* CAMPAMENTOS TAB */}
          {activeTab === 'CAMPAMENTOS' && (
            <>
              {filteredCamps.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-sm">
                  No hay campamentos registrados.
                </div>
              ) : (
                filteredCamps.map((camp) => (
                  <div
                    key={camp.id}
                    className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all"
                  >
                    {editingId === camp.id ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                          <span className="text-xs font-bold text-red-600 uppercase">
                            Editando Campamento
                          </span>
                          <span className="text-[11px] font-mono text-slate-400">{camp.id}</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                          <div>
                            <label className="font-bold text-slate-700 block mb-1">Nombre</label>
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="w-full p-2 border border-slate-300 rounded-lg text-slate-900"
                            />
                          </div>
                          <div>
                            <label className="font-bold text-slate-700 block mb-1">Coordinador / Responsable</label>
                            <input
                              type="text"
                              value={editCoordinadorNombre}
                              onChange={(e) => setEditCoordinadorNombre(e.target.value)}
                              placeholder="Nombre del responsable"
                              className="w-full p-2 border border-slate-300 rounded-lg text-slate-900"
                            />
                          </div>
                          <div>
                            <label className="font-bold text-slate-700 block mb-1">Teléfono de Contacto</label>
                            <input
                              type="tel"
                              value={editCoordinadorTelefono}
                              onChange={(e) => setEditCoordinadorTelefono(e.target.value)}
                              placeholder="Teléfono (ej: 0414-555-0999)"
                              className="w-full p-2 border border-slate-300 rounded-lg text-slate-900"
                            />
                          </div>
                          <div>
                            <label className="font-bold text-slate-700 block mb-1">Población / Familias</label>
                            <div className="flex gap-2">
                              <input
                                type="number"
                                value={editPoblacion}
                                onChange={(e) => setEditPoblacion(e.target.value)}
                                placeholder="Población"
                                className="w-1/2 p-2 border border-slate-300 rounded-lg text-slate-900"
                              />
                              <input
                                type="number"
                                value={editFamilias}
                                onChange={(e) => setEditFamilias(e.target.value)}
                                placeholder="Familias"
                                className="w-1/2 p-2 border border-slate-300 rounded-lg text-slate-900"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="font-bold text-slate-700 block mb-1">Capacidad Máxima</label>
                            <input
                              type="number"
                              value={editCapacidad}
                              onChange={(e) => setEditCapacidad(e.target.value)}
                              className="w-full p-2 border border-slate-300 rounded-lg text-slate-900"
                            />
                          </div>
                          <div>
                            <label className="font-bold text-slate-700 block mb-1">Latitud</label>
                            <input
                              type="number"
                              step="any"
                              value={editLat}
                              onChange={(e) => setEditLat(e.target.value)}
                              className="w-full p-2 border border-slate-300 rounded-lg text-slate-900"
                            />
                          </div>
                          <div>
                            <label className="font-bold text-slate-700 block mb-1">Longitud</label>
                            <input
                              type="number"
                              step="any"
                              value={editLng}
                              onChange={(e) => setEditLng(e.target.value)}
                              className="w-full p-2 border border-slate-300 rounded-lg text-slate-900"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-3 py-1.5 text-xs font-bold text-slate-600 border rounded-lg hover:bg-slate-100"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={() => handleSaveCamp(camp.id)}
                            className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" /> Guardar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-slate-900 text-sm">{camp.nombre}</h3>
                            <span className="px-2 py-0.5 text-[10px] font-black bg-red-100 text-red-700 rounded-md">
                              CAMPAMENTO
                            </span>
                          </div>
                          <p className="text-xs text-slate-600">
                            Población: <strong>{camp.poblacion} pers.</strong> ({camp.familias} fam.) | Capacidad: <strong>{camp.capacidad}</strong> | Coord: {camp.coordinador || 'N/A'}
                          </p>
                          <p className="text-[11px] font-mono text-slate-400">
                            Coords: {camp.lat}, {camp.lng}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          {deleteConfirmId === camp.id ? (
                            <div className="flex items-center gap-1 animate-in fade-in">
                              <span className="text-xs text-red-600 font-bold mr-1">¿Eliminar?</span>
                              <button
                                onClick={() => {
                                  deleteCampamento(camp.id);
                                  setDeleteConfirmId(null);
                                }}
                                className="px-2.5 py-1 text-xs font-bold text-white bg-red-600 rounded-lg hover:bg-red-700"
                              >
                                Sí
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="px-2.5 py-1 text-xs font-bold text-slate-700 bg-slate-200 rounded-lg hover:bg-slate-300"
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <>
                              <button
                                onClick={() => startEditCamp(camp)}
                                className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                                title="Editar"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(camp.id)}
                                className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                title="Eliminar"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </>
          )}

          {/* ACOPIOS TAB */}
          {activeTab === 'ACOPIOS' && (
            <>
              {filteredAcopios.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-sm">
                  No hay centros de acopio registrados.
                </div>
              ) : (
                filteredAcopios.map((acopio) => (
                  <div
                    key={acopio.id}
                    className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all"
                  >
                    {editingId === acopio.id ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                          <span className="text-xs font-bold text-amber-600 uppercase">
                            Editando Centro de Acopio
                          </span>
                          <span className="text-[11px] font-mono text-slate-400">{acopio.id}</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                          <div>
                            <label className="font-bold text-slate-700 block mb-1">Nombre</label>
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="w-full p-2 border border-slate-300 rounded-lg text-slate-900"
                            />
                          </div>
                          <div>
                            <label className="font-bold text-slate-700 block mb-1">Encargado / Responsable</label>
                            <input
                              type="text"
                              value={editContactoNombre}
                              onChange={(e) => setEditContactoNombre(e.target.value)}
                              placeholder="Nombre del encargado"
                              className="w-full p-2 border border-slate-300 rounded-lg text-slate-900"
                            />
                          </div>
                          <div>
                            <label className="font-bold text-slate-700 block mb-1">Teléfono de Contacto</label>
                            <input
                              type="tel"
                              value={editContactoTelefono}
                              onChange={(e) => setEditContactoTelefono(e.target.value)}
                              placeholder="Teléfono (ej: 0424-555-0811)"
                              className="w-full p-2 border border-slate-300 rounded-lg text-slate-900"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="font-bold text-slate-700 block mb-1">Inventario / Stock Disponible</label>
                            <input
                              type="text"
                              value={editStock}
                              onChange={(e) => setEditStock(e.target.value)}
                              className="w-full p-2 border border-slate-300 rounded-lg text-slate-900"
                            />
                          </div>
                          <div>
                            <label className="font-bold text-slate-700 block mb-1">Latitud</label>
                            <input
                              type="number"
                              step="any"
                              value={editLat}
                              onChange={(e) => setEditLat(e.target.value)}
                              className="w-full p-2 border border-slate-300 rounded-lg text-slate-900"
                            />
                          </div>
                          <div>
                            <label className="font-bold text-slate-700 block mb-1">Longitud</label>
                            <input
                              type="number"
                              step="any"
                              value={editLng}
                              onChange={(e) => setEditLng(e.target.value)}
                              className="w-full p-2 border border-slate-300 rounded-lg text-slate-900"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-3 py-1.5 text-xs font-bold text-slate-600 border rounded-lg hover:bg-slate-100"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={() => handleSaveAcopio(acopio.id)}
                            className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" /> Guardar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-slate-900 text-sm">{acopio.nombre}</h3>
                            <span className="px-2 py-0.5 text-[10px] font-black bg-amber-100 text-amber-700 rounded-md">
                              ACOPIO
                            </span>
                          </div>
                          <p className="text-xs text-slate-600">
                            Stock: <strong>{acopio.stockInfo}</strong> | Contacto: {acopio.contacto || 'N/A'}
                          </p>
                          <p className="text-[11px] font-mono text-slate-400">
                            Coords: {acopio.lat}, {acopio.lng}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          {deleteConfirmId === acopio.id ? (
                            <div className="flex items-center gap-1 animate-in fade-in">
                              <span className="text-xs text-red-600 font-bold mr-1">¿Eliminar?</span>
                              <button
                                onClick={() => {
                                  deleteAcopio(acopio.id);
                                  setDeleteConfirmId(null);
                                }}
                                className="px-2.5 py-1 text-xs font-bold text-white bg-red-600 rounded-lg hover:bg-red-700"
                              >
                                Sí
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="px-2.5 py-1 text-xs font-bold text-slate-700 bg-slate-200 rounded-lg hover:bg-slate-300"
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <>
                              <button
                                onClick={() => startEditAcopio(acopio)}
                                className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                                title="Editar"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(acopio.id)}
                                className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                title="Eliminar"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </>
          )}

          {/* DESASTRES TAB */}
          {activeTab === 'DESASTRES' && (
            <>
              {filteredDesastres.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-sm">
                  No hay zonas de desastre registradas.
                </div>
              ) : (
                filteredDesastres.map((desastre) => {
                  const dbType = disasterTypes.find((dt) => dt.code === desastre.tipo);
                  const theme = dbType
                    ? {
                        color: dbType.color,
                        bgBadge: dbType.bgBadge,
                        textBadge: dbType.textBadge,
                        icon: dbType.icon,
                        label: dbType.nombre,
                      }
                    : getDisasterTheme(desastre.tipo);

                  return (
                    <div
                      key={desastre.id}
                      className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all"
                    >
                      {editingId === desastre.id ? (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                            <span className="text-xs font-bold text-purple-600 uppercase">
                              Editando Zona de Desastre
                            </span>
                            <span className="text-[11px] font-mono text-slate-400">{desastre.id}</span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                            <div>
                              <label className="font-bold text-slate-700 block mb-1">Nombre</label>
                              <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="w-full p-2 border border-slate-300 rounded-lg text-slate-900"
                              />
                            </div>
                            <div>
                              <label className="font-bold text-slate-700 block mb-1">Tipo de Evento</label>
                              <select
                                value={editTipo}
                                onChange={(e) => setEditTipo(e.target.value as DisasterEventType)}
                                className="w-full p-2 border border-slate-300 rounded-lg text-slate-900 font-bold"
                              >
                                {(disasterTypes.length > 0 ? disasterTypes : Object.values(DISASTER_THEMES)).map((t) => (
                                  <option key={'code' in t ? t.code : t.tipo} value={'code' in t ? t.code : t.tipo}>
                                    {t.icon} {'nombre' in t ? t.nombre : t.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="font-bold text-slate-700 block mb-1">Radio Afectado (m)</label>
                              <input
                                type="number"
                                step="100"
                                value={editRadio}
                                onChange={(e) => setEditRadio(e.target.value)}
                                className="w-full p-2 border border-slate-300 rounded-lg text-slate-900"
                              />
                            </div>
                            <div>
                              <label className="font-bold text-slate-700 block mb-1">Latitud</label>
                              <input
                                type="number"
                                step="any"
                                value={editLat}
                                onChange={(e) => setEditLat(e.target.value)}
                                className="w-full p-2 border border-slate-300 rounded-lg text-slate-900"
                              />
                            </div>
                            <div>
                              <label className="font-bold text-slate-700 block mb-1">Longitud</label>
                              <input
                                type="number"
                                step="any"
                                value={editLng}
                                onChange={(e) => setEditLng(e.target.value)}
                                className="w-full p-2 border border-slate-300 rounded-lg text-slate-900"
                              />
                            </div>
                          </div>
                          <div className="flex justify-end gap-2 pt-2">
                            <button
                              onClick={() => setEditingId(null)}
                              className="px-3 py-1.5 text-xs font-bold text-slate-600 border rounded-lg hover:bg-slate-100"
                            >
                              Cancelar
                            </button>
                            <button
                              onClick={() => handleSaveDesastre(desastre.id)}
                              className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 flex items-center gap-1"
                            >
                              <Check className="w-3.5 h-3.5" /> Guardar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span
                                className="px-2 py-0.5 text-[10px] font-black rounded-md flex items-center gap-1"
                                style={{
                                  backgroundColor: theme.bgBadge,
                                  color: theme.textBadge,
                                  border: `1px solid ${theme.color}44`,
                                }}
                              >
                                {theme.icon} {theme.label.toUpperCase()}
                              </span>
                              <h3 className="font-bold text-slate-900 text-sm">{desastre.nombre}</h3>
                            </div>
                            <p className="text-xs text-slate-600">
                              Radio Afectado: <strong>{desastre.radioMetros} metros</strong>
                            </p>
                            <p className="text-[11px] font-mono text-slate-400">
                              Coords: {desastre.lat}, {desastre.lng}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            {deleteConfirmId === desastre.id ? (
                              <div className="flex items-center gap-1 animate-in fade-in">
                                <span className="text-xs text-red-600 font-bold mr-1">¿Eliminar?</span>
                                <button
                                  onClick={() => {
                                    deleteDesastre(desastre.id);
                                    setDeleteConfirmId(null);
                                  }}
                                  className="px-2.5 py-1 text-xs font-bold text-white bg-red-600 rounded-lg hover:bg-red-700"
                                >
                                  Sí
                                </button>
                                <button
                                  onClick={() => setDeleteConfirmId(null)}
                                  className="px-2.5 py-1 text-xs font-bold text-slate-700 bg-slate-200 rounded-lg hover:bg-slate-300"
                                >
                                  No
                                </button>
                              </div>
                            ) : (
                              <>
                                <button
                                  onClick={() => startEditDesastre(desastre)}
                                  className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                                  title="Editar"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setDeleteConfirmId(desastre.id)}
                                  className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                  title="Eliminar"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
