import { NeedReport, ReportStatus, ResourceCategory } from './report.entity';

describe('NeedReport Domain Entity', () => {
  it('should correctly calculate Criticality Score based on formula', () => {
    // Insulina rápida: Category MEDICAMENTO (W = 10)
    // Horas sin cobertura = 48 (T = 48)
    // Población vulnerable = true (P = 1)
    // Donaciones en tránsito = 0 (D = 0)
    // Volumen normalizado = 0.5 (V = 0.5)
    // Score = (10 * 0.5) + (48 * 1.5) + (1 * 2) - (0 * 0.8) = 5 + 72 + 2 - 0 = 79
    const report = new NeedReport(
      'req_1045',
      'NECESIDAD_CRITICA',
      { lat: 10.601, lng: -66.932, campamento: 'La Guaira #12' },
      {
        categoria: ResourceCategory.MEDICAMENTO,
        item: 'Insulina rápida',
        cantidadRequerida: 80,
        unidad: 'dosis',
      },
      {
        poblacionVulnerable: true,
        horasSinCobertura: 48,
        confirmacionesLocales: 2,
        donacionesEnTransito: 0,
        volumenPoblacionNormalizado: 0.5,
      },
      ReportStatus.SIN_COBERTURA,
    );

    const score = report.calculateCriticalityScore();
    expect(score).toBe(79);
  });
});
