import { ResourceCategory } from './report.entity';

export enum DonationStatus {
  OFERTADA = 'OFERTADA',
  ASIGNADA = 'ASIGNADA',
  EN_TRANSITO = 'EN_TRANSITO',
  ENTREGADA = 'ENTREGADA',
}

export class DonationOffer {
  constructor(
    public readonly id: string,
    public readonly donanteNombre: string,
    public readonly categoria: ResourceCategory,
    public readonly item: string,
    public readonly cantidad: number,
    public readonly unidad: string,
    public readonly origenUbicacion: string,
    public readonly fechaDisponible: Date,
    public status: DonationStatus = DonationStatus.OFERTADA,
    public reportIdAsignado?: string,
    public readonly createdAt: Date = new Date(),
  ) {}
}
