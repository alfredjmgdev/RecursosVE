import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DisasterType } from '../../../../../../domain/entities/disaster-type.entity';
import type { DisasterTypeRepositoryPort } from '../../../../../../domain/ports/out/disaster-type-repository.port';
import { DisasterTypeOrmEntity } from '../entities/disaster-type.orm-entity';

const INITIAL_DISASTER_TYPES: DisasterType[] = [
  new DisasterType('DESLAVE', 'Deslave / Alud de Tierra', '#dc2626', '#ef4444', '#fee2e2', '#b91c1c', '🪨'),
  new DisasterType('TERREMOTO', 'Terremoto / Sismo', '#7c3aed', '#8b5cf6', '#f3e8ff', '#6b21a8', '🌋'),
  new DisasterType('INUNDACION', 'Inundación / Desbordamiento', '#0284c7', '#38bdf8', '#e0f2fe', '#0369a1', '🌧️'),
  new DisasterType('HURACAN', 'Huracán / Ciclón Tropical', '#0891b2', '#22d3ee', '#cffafe', '#155e75', '🌀'),
  new DisasterType('TORNADO', 'Tornado / Vientos Fuertes', '#d97706', '#fbbf24', '#fef3c7', '#b45309', '🌪️'),
  new DisasterType('INCENDIO', 'Incendio Forestal / Urbano', '#ea580c', '#f97316', '#ffedd5', '#c2410c', '🔥'),
  new DisasterType('VOLCAN', 'Erupción Volcánica', '#b91c1c', '#dc2626', '#fef2f2', '#991b1b', '🌋'),
  new DisasterType('TSUNAMI', 'Tsunami / Marejada', '#0f766e', '#14b8a6', '#ccfbf1', '#0f766e', '🌊'),
  new DisasterType('SEQUIA', 'Sequía / Onda de Calor', '#ca8a04', '#facc15', '#fef9c3', '#a16207', '☀️'),
  new DisasterType('HELADA', 'Ola de Frío / Helada', '#0284c7', '#7dd3fc', '#e0f2fe', '#0369a1', '❄️'),
  new DisasterType('EPIDEMIA', 'Emergencia Sanitaria / Epidemia', '#059669', '#10b981', '#d1fae5', '#047857', '☣️'),
  new DisasterType('COLAPSO', 'Colapso Estructural / Explosión', '#475569', '#64748b', '#f1f5f9', '#334155', '💥'),
];

@Injectable()
export class DisasterTypePostgresRepository implements DisasterTypeRepositoryPort, OnModuleInit {
  constructor(
    @InjectRepository(DisasterTypeOrmEntity)
    private readonly repo: Repository<DisasterTypeOrmEntity>,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.seedInitialTypes();
  }

  async seedInitialTypes(): Promise<void> {
    const count = await this.repo.count();
    if (count === 0) {
      const entities = INITIAL_DISASTER_TYPES.map((t) => DisasterTypeOrmEntity.fromDomain(t));
      await this.repo.save(entities);
    }
  }

  async findAll(): Promise<DisasterType[]> {
    const entities = await this.repo.find({ order: { nombre: 'ASC' } });
    return entities.map((e) => e.toDomain());
  }

  async findByCode(code: string): Promise<DisasterType | null> {
    const entity = await this.repo.findOne({ where: { code } });
    return entity ? entity.toDomain() : null;
  }

  async save(disasterType: DisasterType): Promise<DisasterType> {
    const entity = DisasterTypeOrmEntity.fromDomain(disasterType);
    const saved = await this.repo.save(entity);
    return saved.toDomain();
  }
}
