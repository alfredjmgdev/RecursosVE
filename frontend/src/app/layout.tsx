import type { Metadata } from 'next';
import './globals.css';
import { RecursosVEProvider } from '../application/context/recursosve-context';
import { Header } from '../presentation/components/header';
import { BottomNav } from '../presentation/components/bottom-nav';
import { AuthGuard } from '../presentation/components/auth-guard';

export const metadata: Metadata = {
  title: 'RecursosVE — Sistema Multiagente de Logística Humanitaria Inteligente',
  description: 'Optimizando la distribución de recursos en situaciones de desastre con agentes inteligentes y resiliencia offline.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="bg-slate-100 text-slate-900 antialiased selection:bg-red-600 selection:text-white min-h-screen flex flex-col font-sans">
        <RecursosVEProvider>
          <Header />
          <main className="flex-1 w-full py-6 pb-24 md:pb-12">
            <AuthGuard>{children}</AuthGuard>
          </main>
          <BottomNav />
        </RecursosVEProvider>
      </body>
    </html>
  );
}
