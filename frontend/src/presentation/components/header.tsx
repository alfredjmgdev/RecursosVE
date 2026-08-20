'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, PlusCircle, HeartHandshake, BrainCircuit, LogOut, LogIn, HeartPulse, Globe } from 'lucide-react';
import { useRecursosVE } from '../../application/context/recursosve-context';
import { UserRole } from '../../domain/entities/user.entity';

export const Header: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, logout, selectedStateId, venezuelaStates } = useRecursosVE();

  if (!currentUser) {
    return null;
  }

  const selectedStateCode = selectedStateId
    ? venezuelaStates.find((s) => s.id === selectedStateId)?.codigo.toLowerCase()
    : null;

  const dashboardHref = selectedStateCode ? `/estado/${selectedStateCode}` : '/';
  const reportarHref = selectedStateCode ? `/estado/${selectedStateCode}/reportar` : '/reportar';
  const donarHref = selectedStateCode ? `/estado/${selectedStateCode}/donar` : '/donar';

  const navItems = [
    { label: 'Seleccionar Estado', href: '/', icon: Globe, roles: [UserRole.COORDINADOR, UserRole.BRIGADISTA] },
    { label: 'Panel del Coordinador', href: dashboardHref, icon: LayoutDashboard, roles: [UserRole.COORDINADOR] },
    { label: 'Reportar Necesidad', href: reportarHref, icon: PlusCircle, roles: [UserRole.COORDINADOR, UserRole.BRIGADISTA] },
    { label: 'Portal de Donantes', href: donarHref, icon: HeartHandshake, roles: [UserRole.COORDINADOR, UserRole.BRIGADISTA, UserRole.DONANTE] },
    { label: 'IA & Aprendizaje', href: '/aprendizaje', icon: BrainCircuit, roles: [UserRole.COORDINADOR] },
  ];

  const filteredNavItems = currentUser
    ? navItems.filter((item) => item.roles.includes(currentUser.rol))
    : [];

  const getRoleBadgeStyle = (rol?: UserRole) => {
    switch (rol) {
      case UserRole.COORDINADOR:
        return 'bg-red-100 text-red-700 border-red-300 font-bold';
      case UserRole.BRIGADISTA:
        return 'bg-amber-100 text-amber-800 border-amber-300 font-bold';
      case UserRole.DONANTE:
        return 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const isSelectionPage = pathname === '/' || pathname === '/seleccionar-estado';

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b-2 border-red-600 text-slate-900 px-4 sm:px-6 py-2.5 shadow-md">
      <div className="w-full mx-auto flex items-center justify-between">
        {/* Brand Logo & Name */}
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-red-600 via-red-500 to-amber-400 flex items-center justify-center text-white shadow-md shadow-red-500/25 group-hover:scale-105 transition-transform">
            <HeartPulse className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="font-extrabold text-base md:text-lg tracking-tight text-slate-900 flex items-center gap-2">
              RecursosVE
              <span className="text-[10px] uppercase tracking-widest bg-red-50 text-red-700 font-extrabold px-2.5 py-0.5 rounded-full border border-red-200 shadow-xs hidden sm:inline-block">
                Ayuda Humanitaria
              </span>
            </h1>
            <p className="text-xs text-slate-500 font-medium hidden sm:block">
              Logística Inteligente de Emergencia post-desastre
            </p>
          </div>
        </Link>

        {/* Desktop Navigation Links (Hidden on state selection page) */}
        {!isSelectionPage && currentUser && (
          <nav className="hidden md:flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href.includes('/reportar') && pathname.includes('/reportar')) ||
                (item.href.includes('/donar') && pathname.includes('/donar')) ||
                (item.label === 'Panel del Coordinador' && pathname.startsWith('/estado/') && !pathname.endsWith('/reportar') && !pathname.endsWith('/donar'));
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all ${
                    isActive
                      ? 'bg-red-600 text-white shadow-md shadow-red-600/30 scale-[1.02]'
                      : 'text-slate-700 hover:text-red-600 hover:bg-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        )}

        {/* User Info & Actions */}
        <div className="flex items-center space-x-3">
          {currentUser ? (
            <div className="flex items-center gap-2.5">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-xs font-extrabold text-slate-900">{currentUser.nombre}</span>
                <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded border uppercase ${getRoleBadgeStyle(currentUser.rol)}`}>
                  {currentUser.rol}
                </span>
              </div>
              <button
                onClick={() => {
                  logout();
                  router.push('/login');
                }}
                className="p-2 rounded-xl bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-600 transition-colors border border-slate-200 cursor-pointer"
                title="Cerrar Sesión"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs shadow-md shadow-red-600/25 transition-all"
            >
              <LogIn className="w-4 h-4" />
              <span>Iniciar Sesión</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
