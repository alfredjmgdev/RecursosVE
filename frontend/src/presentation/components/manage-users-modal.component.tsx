'use client';

import React, { useState } from 'react';
import { X, Users, UserPlus, Trash2, Shield, Truck, HeartHandshake, Filter, AlertCircle, Key, Mail, User as UserIcon, Building2 } from 'lucide-react';
import { useRecursosVE } from '../../application/context/recursosve-context';
import { UserRole } from '../../domain/entities/user.entity';

interface ManageUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ManageUsersModalComponent: React.FC<ManageUsersModalProps> = ({ isOpen, onClose }) => {
  const { users, createUser, deleteUser, fetchUsers } = useRecursosVE();

  const [activeTab, setActiveTab] = useState<'list' | 'create'>('list');
  const [filterRole, setFilterRole] = useState<string>('ALL');

  // Form State
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState<UserRole>(UserRole.BRIGADISTA);
  const [campamentoAsignado, setCampamentoAsignado] = useState('');
  const [vehiculoTipo, setVehiculoTipo] = useState('');
  const [vehiculoCapacidad, setVehiculoCapacidad] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredUsers = users.filter((u) => {
    if (filterRole === 'ALL') return true;
    return u.rol === filterRole;
  });

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await createUser({
        nombre,
        email,
        password: password || '123456',
        rol,
        campamentoAsignado: campamentoAsignado.trim() || undefined,
        vehiculoTipo: vehiculoTipo.trim() || undefined,
        vehiculoCapacidad: vehiculoCapacidad.trim() || undefined,
      });

      setSuccessMsg(`¡Usuario "${nombre}" registrado exitosamente en PostgreSQL!`);
      setNombre('');
      setEmail('');
      setPassword('');
      setCampamentoAsignado('');
      setVehiculoTipo('');
      setVehiculoCapacidad('');
      setActiveTab('list');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error registrando el usuario.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, userNombre: string) => {
    if (!confirm(`¿Está seguro de eliminar al usuario "${userNombre}" del sistema?`)) return;
    setDeletingId(id);
    try {
      await deleteUser(id);
    } catch (err) {
      console.error('Error eliminando usuario:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const getRoleBadge = (userRol: UserRole) => {
    switch (userRol) {
      case UserRole.COORDINADOR:
        return 'bg-red-100 text-red-700 border-red-300';
      case UserRole.BRIGADISTA:
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case UserRole.DONANTE:
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case UserRole.TRANSPORTISTA:
        return 'bg-cyan-100 text-cyan-800 border-cyan-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const getRoleIcon = (userRol: UserRole) => {
    switch (userRol) {
      case UserRole.COORDINADOR:
        return <Shield className="w-3.5 h-3.5 text-red-600 inline mr-1" />;
      case UserRole.BRIGADISTA:
        return <Shield className="w-3.5 h-3.5 text-amber-600 inline mr-1" />;
      case UserRole.DONANTE:
        return <HeartHandshake className="w-3.5 h-3.5 text-emerald-600 inline mr-1" />;
      case UserRole.TRANSPORTISTA:
        return <Truck className="w-3.5 h-3.5 text-cyan-600 inline mr-1" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in">
      <div className="bg-white border-2 border-slate-200 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-900 px-6 py-5 border-b border-slate-800 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center text-white shadow-lg">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
                Gestión de Usuarios
                <span className="text-[10px] bg-red-600/30 text-red-400 border border-red-500/30 px-2.5 py-0.5 rounded-full font-bold uppercase">
                  PostgreSQL DB
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                Control de usuarios, asignación de roles y accesos al ecosistema RecursosVE
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-100 border-b border-slate-200 px-6 py-2.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('list')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'list'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'text-slate-600 hover:bg-white hover:text-slate-900'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Usuarios Registrados ({users.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('create')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'create'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-slate-600 hover:bg-white hover:text-slate-900'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Nuevo Usuario</span>
            </button>
          </div>

          {activeTab === 'list' && (
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="bg-white border border-slate-300 rounded-xl text-xs font-bold px-3 py-1.5 text-slate-700 focus:outline-none focus:border-red-600"
              >
                <option value="ALL">Todos los Roles</option>
                <option value={UserRole.COORDINADOR}>Coordinadores</option>
                <option value={UserRole.TRANSPORTISTA}>Transportistas</option>
                <option value={UserRole.BRIGADISTA}>Brigadistas</option>
                <option value={UserRole.DONANTE}>Donantes</option>
              </select>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          
          {successMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold flex items-center justify-between">
              <span>{successMsg}</span>
              <button onClick={() => setSuccessMsg(null)} className="text-emerald-600 font-black cursor-pointer">×</button>
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-red-800 text-xs font-bold flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span>{errorMsg}</span>
              </div>
              <button onClick={() => setErrorMsg(null)} className="text-red-600 font-black cursor-pointer">×</button>
            </div>
          )}

          {activeTab === 'list' ? (
            <div className="space-y-3">
              {filteredUsers.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <Users className="w-10 h-10 mx-auto text-slate-300" />
                  <p className="text-xs font-bold">No se encontraron usuarios con este filtro.</p>
                </div>
              ) : (
                <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-100 text-slate-600 uppercase font-black tracking-wider text-[10px] border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3">Nombre</th>
                        <th className="px-4 py-3">Correo Electrónico</th>
                        <th className="px-4 py-3">Rol</th>
                        <th className="px-4 py-3">Vehículo / Capacidad</th>
                        <th className="px-4 py-3">Campamento / Adscripción</th>
                        <th className="px-4 py-3 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-medium bg-white">
                      {filteredUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3.5 font-extrabold text-slate-900">
                            {u.nombre}
                          </td>
                          <td className="px-4 py-3.5 text-slate-600">
                            {u.email}
                          </td>
                          <td className="px-4 py-3.5">
                            <span className={`px-2.5 py-1 rounded-md text-[10px] font-black border uppercase ${getRoleBadge(u.rol)}`}>
                              {getRoleIcon(u.rol)}
                              {u.rol}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-slate-700 font-semibold">
                            {u.vehiculoTipo ? (
                              <div className="flex flex-col">
                                <span className="font-extrabold text-slate-900">{u.vehiculoTipo}</span>
                                {u.vehiculoCapacidad && (
                                  <span className="text-[10px] text-cyan-700 font-bold bg-cyan-50 border border-cyan-200 px-1.5 py-0.5 rounded w-max mt-0.5">
                                    📦 {u.vehiculoCapacidad}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-400 font-normal">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3.5 text-slate-500 font-medium">
                            {u.campamentoAsignado || '—'}
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <button
                              onClick={() => handleDelete(u.id, u.nombre)}
                              disabled={deletingId === u.id}
                              className="p-1.5 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white rounded-lg border border-red-200 transition-colors cursor-pointer disabled:opacity-50"
                              title="Eliminar Usuario"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            /* Create User Form */
            <form onSubmit={handleCreateSubmit} className="space-y-4 max-w-xl mx-auto bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-xs">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-2">
                Formulario de Registro de Usuario en PostgreSQL
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nombre */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nombre Completo *
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      placeholder="Ej: Carlos Mendoza"
                      className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs font-semibold focus:outline-none focus:border-red-600"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Correo Electrónico *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="usuario@recursosve.org"
                      className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs font-semibold focus:outline-none focus:border-red-600"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Contraseña *
                  </label>
                  <div className="relative">
                    <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs font-semibold focus:outline-none focus:border-red-600"
                    />
                  </div>
                </div>

                {/* Rol */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Rol del Sistema *
                  </label>
                  <select
                    value={rol}
                    onChange={(e) => setRol(e.target.value as UserRole)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-extrabold text-slate-800 focus:outline-none focus:border-red-600"
                  >
                    <option value={UserRole.BRIGADISTA}>BRIGADISTA</option>
                    <option value={UserRole.TRANSPORTISTA}>TRANSPORTISTA</option>
                    <option value={UserRole.COORDINADOR}>COORDINADOR</option>
                    <option value={UserRole.DONANTE}>DONANTE</option>
                  </select>
                </div>
              </div>

              {/* Campamento / Adscripción */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Campamento o Depósito Asignado (Opcional)
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={campamentoAsignado}
                    onChange={(e) => setCampamentoAsignado(e.target.value)}
                    placeholder="Ej: Base Logística Catia La Mar"
                    className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs font-semibold focus:outline-none focus:border-red-600"
                  />
                </div>
              </div>

              {/* Campos específicos de Transportista */}
              {rol === UserRole.TRANSPORTISTA && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-cyan-50/70 border border-cyan-200 rounded-2xl">
                  <div>
                    <label className="block text-xs font-bold text-cyan-900 mb-1 flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-cyan-700" />
                      Tipo / Modelo de Vehículo *
                    </label>
                    <input
                      type="text"
                      required
                      value={vehiculoTipo}
                      onChange={(e) => setVehiculoTipo(e.target.value)}
                      placeholder="Ej: Pick-Up 4x4, Camión 350, Furgón"
                      className="w-full bg-white border border-cyan-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-cyan-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-cyan-900 mb-1">
                      Capacidad del Vehículo (Carga) *
                    </label>
                    <input
                      type="text"
                      required
                      value={vehiculoCapacidad}
                      onChange={(e) => setVehiculoCapacidad(e.target.value)}
                      placeholder="Ej: 1.5 Toneladas, 500L Agua, 10T"
                      className="w-full bg-white border border-cyan-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-cyan-600"
                    />
                  </div>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('list')}
                  className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Guardando en DB...' : '💾 Registrar Usuario'}
                </button>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};
