import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CollectionCenter } from '../../../../../../domain/entities/collection-center.entity';
import { CollectionCenterRepositoryPort } from '../../../../../../domain/ports/out/collection-center-repository.port';
import { CollectionCenterOrmEntity } from '../entities/collection-center.orm-entity';

@Injectable()
export class CollectionCenterPostgresRepository implements CollectionCenterRepositoryPort {
  constructor(
    @InjectRepository(CollectionCenterOrmEntity)
    private readonly repository: Repository<CollectionCenterOrmEntity>,
  ) {}

  async save(center: CollectionCenter): Promise<CollectionCenter> {
    const ormEntity = CollectionCenterOrmEntity.fromDomain(center);
    const saved = await this.repository.save(ormEntity);
    return saved.toDomain();
  }

  async findAll(): Promise<CollectionCenter[]> {
    const list = await this.repository.find({ order: { createdAt: 'DESC' } });
    return list.map((e) => e.toDomain());
  }

  async findById(id: string): Promise<CollectionCenter | null> {
    const found = await this.repository.findOne({ where: { id } });
    return found ? found.toDomain() : null;
  }

  async update(id: string, payload: Partial<CollectionCenter>): Promise<CollectionCenter> {
    const entity = await this.repository.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(`CollectionCenter with id ${id} not found`);
    }
    Object.assign(entity, payload);
    const saved = await this.repository.save(entity);
    return saved.toDomain();
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
