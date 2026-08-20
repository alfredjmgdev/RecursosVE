import { DisasterZone } from '../../entities/disaster-zone.entity';
import { RefugeeCamp } from '../../entities/refugee-camp.entity';
import { CollectionCenter } from '../../entities/collection-center.entity';
import { DisasterType } from '../../entities/disaster-type.entity';
import { VenezuelaState } from '../../entities/venezuela-state.entity';

export const MANAGE_INFRASTRUCTURE_USE_CASE = Symbol('MANAGE_INFRASTRUCTURE_USE_CASE');

export interface ManageInfrastructureUseCase {
  createDisaster(payload: Omit<DisasterZone, 'id' | 'createdAt'>): Promise<DisasterZone>;
  getDisasters(): Promise<DisasterZone[]>;
  updateDisaster(id: string, payload: Partial<DisasterZone>): Promise<DisasterZone>;
  deleteDisaster(id: string): Promise<void>;

  createCamp(payload: Omit<RefugeeCamp, 'id' | 'createdAt'>): Promise<RefugeeCamp>;
  getCamps(): Promise<RefugeeCamp[]>;
  updateCamp(id: string, payload: Partial<RefugeeCamp>): Promise<RefugeeCamp>;
  deleteCamp(id: string): Promise<void>;

  createCollectionCenter(payload: Omit<CollectionCenter, 'id' | 'createdAt'>): Promise<CollectionCenter>;
  getCollectionCenters(): Promise<CollectionCenter[]>;
  updateCollectionCenter(id: string, payload: Partial<CollectionCenter>): Promise<CollectionCenter>;
  deleteCollectionCenter(id: string): Promise<void>;

  getDisasterTypes(): Promise<DisasterType[]>;
  getStates(): Promise<VenezuelaState[]>;
}
