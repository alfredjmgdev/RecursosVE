import { Injectable } from '@nestjs/common';
import { DonationRepositoryPort } from '../../../../../../domain/ports/out/donation-repository.port';
import { DonationOffer, DonationStatus } from '../../../../../../domain/entities/donation.entity';
import { ResourceCategory } from '../../../../../../domain/entities/report.entity';

@Injectable()
export class DonationPostgresRepository implements DonationRepositoryPort {
  private readonly inMemoryStore = new Map<string, DonationOffer>();

  async save(donation: DonationOffer): Promise<DonationOffer> {
    this.inMemoryStore.set(donation.id, donation);
    return donation;
  }

  async findAvailableByCategory(category: ResourceCategory): Promise<DonationOffer[]> {
    return Array.from(this.inMemoryStore.values()).filter(
      (don) => don.categoria === category && don.status === DonationStatus.OFERTADA,
    );
  }

  async findAll(): Promise<DonationOffer[]> {
    return Array.from(this.inMemoryStore.values());
  }
}
