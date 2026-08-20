'use client';

import React from 'react';
import { useRecursosVE } from '../../application/context/recursosve-context';
import { LoginView } from '../views/login.view';
import { HeartPulse, Loader2 } from 'lucide-react';

export const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, authChecked } = useRecursosVE();

  // Show loading state while checking localStorage for session
  if (!authChecked) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center text-white shadow-lg animate-bounce">
          <HeartPulse className="w-7 h-7" />
        </div>
        <div className="flex items-center gap-2 text-slate-600 text-xs font-bold">
          <Loader2 className="w-4 h-4 animate-spin text-red-600" />
          <span>Verificando credenciales del sistema...</span>
        </div>
      </div>
    );
  }

  // If user is not logged in, strictly render ONLY LoginView
  if (!currentUser) {
    return (
      <div className="w-full min-h-[75vh] flex items-center justify-center px-4">
        <LoginView />
      </div>
    );
  }

  // User is authenticated, render protected content
  return <>{children}</>;
};
