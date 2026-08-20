import { Inject, Injectable } from '@nestjs/common';
import type { ManageInfrastructureUseCase } from '../../domain/ports/in/manage-infrastructure.use-case';
import { DisasterZone } from '../../domain/entities/disaster-zone.entity';
import { RefugeeCamp } from '../../domain/entities/refugee-camp.entity';
import { CollectionCenter } from '../../domain/entities/collection-center.entity';
import { DisasterType } from '../../domain/entities/disaster-type.entity';
import { VenezuelaState } from '../../domain/entities/venezuela-state.entity';

import { DISASTER_ZONE_REPOSITORY_PORT } from '../../domain/ports/out/disaster-zone-repository.port';
import type { DisasterZoneRepositoryPort } from '../../domain/ports/out/disaster-zone-repository.port';

import { REFUGEE_CAMP_REPOSITORY_PORT } from '../../domain/ports/out/refugee-camp-repository.port';
import type { RefugeeCampRepositoryPort } from '../../domain/ports/out/refugee-camp-repository.port';

import { COLLECTION_CENTER_REPOSITORY_PORT } from '../../domain/ports/out/collection-center-repository.port';
import type { CollectionCenterRepositoryPort } from '../../domain/ports/out/collection-center-repository.port';

import { DISASTER_TYPE_REPOSITORY_PORT } from '../../domain/ports/out/disaster-type-repository.port';
import type { DisasterTypeRepositoryPort } from '../../domain/ports/out/disaster-type-repository.port';

import { VENEZUELA_STATE_REPOSITORY_PORT } from '../../domain/ports/out/venezuela-state-repository.port';
import type { VenezuelaStateRepositoryPort } from '../../domain/ports/out/venezuela-state-repository.port';

@Injectable()
export class ManageInfrastructureService implements ManageInfrastructureUseCase {
  constructor(
    @Inject(DISASTER_ZONE_REPOSITORY_PORT)
    private readonly disasterRepo: DisasterZoneRepositoryPort,
    @Inject(REFUGEE_CAMP_REPOSITORY_PORT)
    private readonly campRepo: RefugeeCampRepositoryPort,
    @Inject(COLLECTION_CENTER_REPOSITORY_PORT)
    private readonly acopioRepo: CollectionCenterRepositoryPort,
    @Inject(DISASTER_TYPE_REPOSITORY_PORT)
    private readonly disasterTypeRepo: DisasterTypeRepositoryPort,
    @Inject(VENEZUELA_STATE_REPOSITORY_PORT)
    private readonly stateRepo: VenezuelaStateRepositoryPort,
  ) {}

  async createDisaster(payload: Omit<DisasterZone, 'id' | 'createdAt'>): Promise<DisasterZone> {
    const disaster = new DisasterZone(
      `disaster_${Date.now()}`,
      payload.nombre,
      payload.tipo,
      payload.lat,
      payload.lng,
      payload.radioMetros,
      new Date(),
      payload.estadoId ?? null,
    );
    return this.disasterRepo.save(disaster);
  }

  async getDisasters(): Promise<DisasterZone[]> {
    return this.disasterRepo.findAll();
  }

  async updateDisaster(id: string, payload: Partial<DisasterZone>): Promise<DisasterZone> {
    return this.disasterRepo.update(id, payload);
  }

  async deleteDisaster(id: string): Promise<void> {
    return this.disasterRepo.delete(id);
  }

  async createCamp(payload: Omit<RefugeeCamp, 'id' | 'createdAt'>): Promise<RefugeeCamp> {
    const camp = new RefugeeCamp(
      `camp_${Date.now()}`,
      payload.nombre,
      payload.lat,
      payload.lng,
      payload.poblacion,
      payload.familias,
      payload.capacidad,
      payload.coordinador,
      new Date(),
      payload.estadoId ?? null,
    );
    return this.campRepo.save(camp);
  }

  async getCamps(): Promise<RefugeeCamp[]> {
    return this.campRepo.findAll();
  }

  async updateCamp(id: string, payload: Partial<RefugeeCamp>): Promise<RefugeeCamp> {
    return this.campRepo.update(id, payload);
  }

  async deleteCamp(id: string): Promise<void> {
    return this.campRepo.delete(id);
  }

  async createCollectionCenter(payload: Omit<CollectionCenter, 'id' | 'createdAt'>): Promise<CollectionCenter> {
    const center = new CollectionCenter(
      `acopio_${Date.now()}`,
      payload.nombre,
      payload.lat,
      payload.lng,
      payload.stockInfo,
      payload.contacto,
      new Date(),
      payload.estadoId ?? null,
    );
    return this.acopioRepo.save(center);
  }

  async getCollectionCenters(): Promise<CollectionCenter[]> {
    return this.acopioRepo.findAll();
  }

  async updateCollectionCenter(id: string, payload: Partial<CollectionCenter>): Promise<CollectionCenter> {
    return this.acopioRepo.update(id, payload);
  }

  async deleteCollectionCenter(id: string): Promise<void> {
    return this.acopioRepo.delete(id);
  }

  async getDisasterTypes(): Promise<DisasterType[]> {
    return this.disasterTypeRepo.findAll();
  }

  async getStates(): Promise<VenezuelaState[]> {
    return this.stateRepo.findAll();
  }
}
