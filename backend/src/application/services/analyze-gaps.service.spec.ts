import { AnalyzeGapsService } from './analyze-gaps.service';
import { NeedReport, ReportStatus, ResourceCategory } from '../../domain/entities/report.entity';
import { CommunityInventory } from '../../domain/entities/inventory.entity';
import { ActionPlanType } from '../../domain/entities/action-plan.entity';

describe('AnalyzeGapsService (Agente Analizador + Coordinador)', () => {
  let service: AnalyzeGapsService;
  let mockReportRepo: any;
  let mockInventoryRepo: any;
  let mockDonationRepo: any;

  beforeEach(() => {
    mockReportRepo = {
      findAllActive: jest.fn(),
    };
    mockInventoryRepo = {
      findAvailableByCategory: jest.fn(),
    };
    mockDonationRepo = {
      findAvailableByCategory: jest.fn(),
    };

    service = new AnalyzeGapsService(
      mockReportRepo,
      mockInventoryRepo,
      mockDonationRepo,
    );
  });

  it('should recommend local redistribution if community inventory is <= 2.0 km', async () => {

    const report = new NeedReport(
      'req_1',
      'NECESIDAD_CRITICA',
      { lat: 10.601, lng: -66.932, campamento: 'Campamento 7' },
      {
        categoria: ResourceCategory.AGUA,
        item: 'Agua potable',
        cantidadRequerida: 50,
        unidad: 'litros',
      },
      {
        poblacionVulnerable: false,
        horasSinCobertura: 12,
        confirmacionesLocales: 2,
      },
      ReportStatus.SIN_COBERTURA,
    );

    // Nearby inventory (1.8 km away)
    const inventory = new CommunityInventory(
      'inv_1',
      { lat: 10.605, lng: -66.930, campamento: 'Depósito Las Flores' },
      ResourceCategory.AGUA,
      'Agua potable',
      300,
      'litros',
      'Pedro R.',
    );

    mockReportRepo.findAllActive.mockResolvedValue([report]);
    mockInventoryRepo.findAvailableByCategory.mockResolvedValue([inventory]);
    mockDonationRepo.findAvailableByCategory.mockResolvedValue([]);

    const results = await service.execute();

    expect(results).toHaveLength(1);
    expect(results[0].accionRecomendada.tipoAccion).toBe(
      ActionPlanType.REDISTRIBUCION_LOCAL,
    );
    expect(results[0].brechaReal).toBe(0); // Fully covered locally
  });
});
