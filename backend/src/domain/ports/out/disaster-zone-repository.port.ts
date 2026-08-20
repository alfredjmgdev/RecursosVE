import { DisasterZone } from '../../entities/disaster-zone.entity';

export const DISASTER_ZONE_REPOSITORY_PORT = Symbol('DISASTER_ZONE_REPOSITORY_PORT');

export interface DisasterZoneRepositoryPort {
  save(disaster: DisasterZone): Promise<DisasterZone>;
  findAll(): Promise<DisasterZone[]>;
  findById(id: string): Promise<DisasterZone | null>;
  update(id: string, payload: Partial<DisasterZone>): Promise<DisasterZone>;
  delete(id: string): Promise<void>;
}
