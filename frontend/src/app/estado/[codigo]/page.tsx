import { CoordinatorDashboardView } from '../../../presentation/views/coordinator-dashboard.view';

export const metadata = {
  title: 'Panel Regional | RecursosVE',
  description: 'Panel de logística y coordinación humanitaria por estado en Venezuela.',
};

export default async function EstadoPage({
  params,
}: {
  params: Promise<{ codigo: string }>;
}) {
  const { codigo } = await params;
  return <CoordinatorDashboardView stateCodeParam={codigo} />;
}
