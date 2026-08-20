import { CreateReportFormView } from '../../../../presentation/views/create-report-form.view';

export const metadata = {
  title: 'Reportar Necesidad Crítica | RecursosVE',
  description: 'Reportar necesidad de insumos por estado en Venezuela.',
};

export default async function EstadoReportarPage({
  params,
}: {
  params: Promise<{ codigo: string }>;
}) {
  const { codigo } = await params;
  return <CreateReportFormView stateCodeParam={codigo} />;
}
