import { DonationOffer } from '../../entities/donation.entity';
import { ResourceCategory } from '../../entities/report.entity';

export interface OfferDonationCommand {
  donanteNombre: string;
  categoria: ResourceCategory;
  item: string;
  cantidad: number;
  unidad: string;
  origenUbicacion: string;
  fechaDisponible: Date;
}

export interface MatchResult {
  donation: DonationOffer;
  reporteAsignado?: {
    id: string;
    campamento: string;
    necesidadCritica: string;
    distanciaEstimadaKm: number;
    contacto?: string;
    instruccionesEntrega?: string;
  };
}

export const OFFER_DONATION_USE_CASE = 'OFFER_DONATION_USE_CASE';

export interface OfferDonationUseCase {
  execute(command: OfferDonationCommand): Promise<MatchResult>;
}
