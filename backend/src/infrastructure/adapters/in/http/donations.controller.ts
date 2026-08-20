import { Body, Controller, Get, Inject, Post } from '@nestjs/common';
import { OFFER_DONATION_USE_CASE } from '../../../../domain/ports/in/offer-donation.use-case';
import type { OfferDonationUseCase } from '../../../../domain/ports/in/offer-donation.use-case';
import { DONATION_REPOSITORY_PORT } from '../../../../domain/ports/out/donation-repository.port';
import type { DonationRepositoryPort } from '../../../../domain/ports/out/donation-repository.port';
import { CreateDonationDto } from './dtos/create-donation.dto';

@Controller('donations')
export class DonationsController {
  constructor(
    @Inject(OFFER_DONATION_USE_CASE)
    private readonly offerDonationUseCase: OfferDonationUseCase,
    @Inject(DONATION_REPOSITORY_PORT)
    private readonly donationRepository: DonationRepositoryPort,
  ) {}

  @Post()
  async offerDonation(@Body() dto: CreateDonationDto) {
    return this.offerDonationUseCase.execute({
      ...dto,
      fechaDisponible: new Date(dto.fechaDisponible),
    });
  }

  @Get()
  async getAllDonations() {
    return this.donationRepository.findAll();
  }
}
