import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DisasterZone } from '../../../../../../domain/entities/disaster-zone.entity';
import { DisasterZoneRepositoryPort } from '../../../../../../domain/ports/out/disaster-zone-repository.port';
import { DisasterZoneOrmEntity } from '../entities/disaster-zone.orm-entity';

@Injectable()
export class DisasterZonePostgresRepository implements DisasterZoneRepositoryPort {
  constructor(
    @InjectRepository(DisasterZoneOrmEntity)
    private readonly repository: Repository<DisasterZoneOrmEntity>,
  ) {}

  async save(disaster: DisasterZone): Promise<DisasterZone> {
    const ormEntity = DisasterZoneOrmEntity.fromDomain(disaster);
    const saved = await this.repository.save(ormEntity);
    return saved.toDomain();
  }

  async findAll(): Promise<DisasterZone[]> {
    const list = await this.repository.find({ order: { createdAt: 'DESC' } });
    return list.map((e) => e.toDomain());
  }

  async findById(id: string): Promise<DisasterZone | null> {
    const found = await this.repository.findOne({ where: { id } });
    return found ? found.toDomain() : null;
  }

  async update(id: string, payload: Partial<DisasterZone>): Promise<DisasterZone> {
    const entity = await this.repository.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(`DisasterZone with id ${id} not found`);
    }
    Object.assign(entity, payload);
    const saved = await this.repository.save(entity);
    return saved.toDomain();
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
