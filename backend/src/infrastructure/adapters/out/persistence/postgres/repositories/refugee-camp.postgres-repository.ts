import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefugeeCamp } from '../../../../../../domain/entities/refugee-camp.entity';
import { RefugeeCampRepositoryPort } from '../../../../../../domain/ports/out/refugee-camp-repository.port';
import { RefugeeCampOrmEntity } from '../entities/refugee-camp.orm-entity';

@Injectable()
export class RefugeeCampPostgresRepository implements RefugeeCampRepositoryPort {
  constructor(
    @InjectRepository(RefugeeCampOrmEntity)
    private readonly repository: Repository<RefugeeCampOrmEntity>,
  ) {}

  async save(camp: RefugeeCamp): Promise<RefugeeCamp> {
    const ormEntity = RefugeeCampOrmEntity.fromDomain(camp);
    const saved = await this.repository.save(ormEntity);
    return saved.toDomain();
  }

  async findAll(): Promise<RefugeeCamp[]> {
    const list = await this.repository.find({ order: { createdAt: 'DESC' } });
    return list.map((e) => e.toDomain());
  }

  async findById(id: string): Promise<RefugeeCamp | null> {
    const found = await this.repository.findOne({ where: { id } });
    return found ? found.toDomain() : null;
  }

  async update(id: string, payload: Partial<RefugeeCamp>): Promise<RefugeeCamp> {
    const entity = await this.repository.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(`RefugeeCamp with id ${id} not found`);
    }
    Object.assign(entity, payload);
    const saved = await this.repository.save(entity);
    return saved.toDomain();
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
