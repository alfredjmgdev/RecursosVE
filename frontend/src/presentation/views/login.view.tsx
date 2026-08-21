'use client';

import React, { useState } from 'react';
import { useRecursosVE } from '../../application/context/recursosve-context';
import { useRouter } from 'next/navigation';
import { UserRole } from '../../domain/entities/user.entity';
import { Shield, Truck, HeartHandshake, LogIn, Lock, Mail, AlertCircle, ArrowRight, HeartPulse } from 'lucide-react';

export const LoginView: React.FC = () => {
  const { login, currentUser } = useRecursosVE();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const loggedUser = await login(email, password);
      if (loggedUser.rol === UserRole.TRANSPORTISTA) {
        router.replace('/transportista');
      } else if (loggedUser.rol === UserRole.DONANTE) {
        router.replace('/donar');
      } else if (loggedUser.rol === UserRole.BRIGADISTA) {
        router.replace('/reportar');
      } else {
        router.replace('/');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al iniciar sesión. Verifique sus credenciales.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md md:max-w-3xl mx-auto space-y-6 py-4">
      {/* Banner Header */}
      <div className="bg-gradient-to-r from-red-700 via-red-600 to-amber-600 border border-red-800 p-6 md:p-8 rounded-3xl shadow-xl text-center text-white">
        <div className="w-12 h-12 rounded-2xl bg-white text-red-600 mx-auto flex items-center justify-center font-black text-2xl shadow-lg mb-3">
          <HeartPulse className="w-7 h-7 stroke-[2.5]" />
        </div>
        <h2 className="text-xl md:text-2xl font-black text-white mb-1">
          Acceso al Sistema RecursosVE
        </h2>
        <p className="text-xs md:text-sm text-red-100 font-medium">
          Control de Acceso Basado en Roles (RBAC) para Logística Humanitaria de Emergencia
        </p>
      </div>

      {currentUser && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-800 text-xs md:text-sm font-bold flex items-center justify-between shadow-xs">
          <span>Sesión activa como: <strong>{currentUser.nombre}</strong> ({currentUser.rol})</span>
          <button
            onClick={() => router.push(currentUser.rol === 'TRANSPORTISTA' ? '/transportista' : '/')}
            className="px-3 py-1 bg-red-600 text-white font-black rounded-xl text-xs hover:bg-red-700 cursor-pointer shadow-sm"
          >
            Ir al Inicio
          </button>
        </div>
      )}

      {/* Info Roles Overview */}
      <div className="space-y-3">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 px-1">
          Roles del Sistema y Niveles de Acceso:
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Card 1: Coordinador */}
          <div className="p-4 rounded-2xl border bg-white border-slate-200 shadow-md space-y-2">
            <div className="flex items-center justify-between">
              <Shield className="w-5 h-5 text-red-600" />
              <span className="text-[10px] font-black px-2 py-0.5 rounded bg-red-100 text-red-700 border border-red-300 uppercase">
                Coordinador
              </span>
            </div>
            <h4 className="font-extrabold text-slate-900 text-sm">Juan P.</h4>
            <p className="text-[11px] text-slate-500 font-medium">
              Control total de campamento, mapa en vivo y gestión de brechas.
            </p>
          </div>

          {/* Card 2: Transportista */}
          <div className="p-4 rounded-2xl border bg-white border-slate-200 shadow-md space-y-2">
            <div className="flex items-center justify-between">
              <Truck className="w-5 h-5 text-cyan-600" />
              <span className="text-[10px] font-black px-2 py-0.5 rounded bg-cyan-100 text-cyan-800 border border-cyan-300 uppercase">
                Transportista
              </span>
            </div>
            <h4 className="font-extrabold text-slate-900 text-sm">Carlos M.</h4>
            <p className="text-[11px] text-slate-500 font-medium">
              Despacho en terreno, mapa de 3 puntos y entrega de insumos.
            </p>
          </div>

          {/* Card 3: Brigadista */}
          <div className="p-4 rounded-2xl border bg-white border-slate-200 shadow-md space-y-2">
            <div className="flex items-center justify-between">
              <Shield className="w-5 h-5 text-amber-600" />
              <span className="text-[10px] font-black px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300 uppercase">
                Brigadista
              </span>
            </div>
            <h4 className="font-extrabold text-slate-900 text-sm">Pedro R.</h4>
            <p className="text-[11px] text-slate-500 font-medium">
              Operación de campo y reporte de necesidades críticas.
            </p>
          </div>

          {/* Card 4: Donante */}
          <div className="p-4 rounded-2xl border bg-white border-slate-200 shadow-md space-y-2">
            <div className="flex items-center justify-between">
              <HeartHandshake className="w-5 h-5 text-emerald-600" />
              <span className="text-[10px] font-black px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 uppercase">
                Donante
              </span>
            </div>
            <h4 className="font-extrabold text-slate-900 text-sm">ONG Solidarios</h4>
            <p className="text-[11px] text-slate-500 font-medium">
              Publicar ofertas dirigidas con Smart Matching.
            </p>
          </div>
        </div>
      </div>

      {/* Manual Login Form */}
      <div className="bg-white border border-slate-200 p-6 md:p-8 rounded-3xl shadow-xl space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
            Formulario de Autenticación
          </h3>
        </div>

        {errorMessage && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="usuario@recursosve.org"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-3 text-xs md:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-600 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs md:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-xs md:text-sm flex items-center justify-center gap-2 shadow-xl shadow-red-600/25 transition-all cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            {isLoading ? 'Iniciando Sesión...' : 'Entrar al Sistema'}
          </button>
        </form>
      </div>
    </div>
  );
};
