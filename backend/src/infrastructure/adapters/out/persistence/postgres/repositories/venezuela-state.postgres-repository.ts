import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VenezuelaStateOrmEntity } from '../entities/venezuela-state.orm-entity';
import { VenezuelaState } from '../../../../../../domain/entities/venezuela-state.entity';
import { VenezuelaStateRepositoryPort } from '../../../../../../domain/ports/out/venezuela-state-repository.port';

@Injectable()
export class VenezuelaStatePostgresRepository implements VenezuelaStateRepositoryPort {
  constructor(
    @InjectRepository(VenezuelaStateOrmEntity)
    private readonly repo: Repository<VenezuelaStateOrmEntity>,
  ) {}

  async findAll(): Promise<VenezuelaState[]> {
    const entities = await this.repo.find({ order: { nombre: 'ASC' } });
    return entities.map((e) => e.toDomain());
  }
}
