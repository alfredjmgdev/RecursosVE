import { NeedReport, ResourceCategory } from '../../entities/report.entity';

export interface CreateReportCommand {
  tipo: string;
  zona: {
    lat: number;
    lng: number;
    campamento: string;
    infrastructureId?: string;
    infrastructureType?: 'CAMPAMENTO' | 'ACOPIO';
  };
  recurso: {
    categoria: ResourceCategory;
    item: string;
    cantidadRequerida: number;
    unidad: string;
  };
  metadataUrgencia: {
    poblacionVulnerable: boolean;
    horasSinCobertura: number;
    confirmacionesLocales: number;
    donacionesEnTransito?: number;
    volumenPoblacionNormalizado?: number;
  };
}

export const CREATE_REPORT_USE_CASE = 'CREATE_REPORT_USE_CASE';

export interface CreateReportUseCase {
  execute(command: CreateReportCommand): Promise<NeedReport>;
}
