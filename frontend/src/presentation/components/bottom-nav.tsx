'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, PlusCircle, HeartHandshake, BrainCircuit } from 'lucide-react';
import { useRecursosVE } from '../../application/context/recursosve-context';
import { UserRole } from '../../domain/entities/user.entity';

export const BottomNav: React.FC = () => {
  const pathname = usePathname();
  const { currentUser, selectedStateId, venezuelaStates } = useRecursosVE();

  const isSelectionPage = pathname === '/' || pathname === '/seleccionar-estado';

  if (!currentUser || isSelectionPage) {
    return null;
  }

  const selectedStateCode = selectedStateId
    ? venezuelaStates.find((s) => s.id === selectedStateId)?.codigo.toLowerCase()
    : null;

  const dashboardHref = selectedStateCode ? `/estado/${selectedStateCode}` : '/';
  const reportarHref = selectedStateCode ? `/estado/${selectedStateCode}/reportar` : '/reportar';
  const donarHref = selectedStateCode ? `/estado/${selectedStateCode}/donar` : '/donar';

  const navItems = [
    { label: 'Panel', href: dashboardHref, icon: LayoutDashboard, roles: [UserRole.COORDINADOR] },
    { label: 'Reportar', href: reportarHref, icon: PlusCircle, roles: [UserRole.COORDINADOR, UserRole.BRIGADISTA] },
    { label: 'Donar', href: donarHref, icon: HeartHandshake, roles: [UserRole.COORDINADOR, UserRole.BRIGADISTA, UserRole.DONANTE] },
    { label: 'IA Aprendizaje', href: '/aprendizaje', icon: BrainCircuit, roles: [UserRole.COORDINADOR] },
  ];

  const filteredNavItems = navItems.filter((item) => item.roles.includes(currentUser.rol));

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t-2 border-red-600 py-2 px-3 shadow-2xl">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href.includes('/reportar') && pathname.includes('/reportar')) ||
            (item.href.includes('/donar') && pathname.includes('/donar')) ||
            (item.label === 'Panel' && pathname.startsWith('/estado/') && !pathname.endsWith('/reportar') && !pathname.endsWith('/donar'));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 text-[11px] font-extrabold transition-all ${
                isActive
                  ? 'text-red-600 scale-105'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div
                className={`p-1.5 rounded-xl ${
                  isActive
                    ? 'bg-red-50 text-red-600 border border-red-200 shadow-xs'
                    : 'bg-transparent'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
