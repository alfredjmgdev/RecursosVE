import { DonationOffer } from '../../entities/donation.entity';
import { ResourceCategory } from '../../entities/report.entity';

export const DONATION_REPOSITORY_PORT = 'DONATION_REPOSITORY_PORT';

export interface DonationRepositoryPort {
  save(donation: DonationOffer): Promise<DonationOffer>;
  findAvailableByCategory(category: ResourceCategory): Promise<DonationOffer[]>;
  findAll(): Promise<DonationOffer[]>;
}
