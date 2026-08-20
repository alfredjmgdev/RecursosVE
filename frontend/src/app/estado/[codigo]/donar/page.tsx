import { DonorPortalView } from '../../../../presentation/views/donor-portal.view';

export const metadata = {
  title: 'Portal de Donantes | RecursosVE',
  description: 'Portal de donantes emparejados por estado en Venezuela.',
};

export default async function EstadoDonarPage({
  params,
}: {
  params: Promise<{ codigo: string }>;
}) {
  const { codigo } = await params;
  return <DonorPortalView stateCodeParam={codigo} />;
}
