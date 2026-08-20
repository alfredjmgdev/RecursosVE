import { CollectionCenter } from '../../entities/collection-center.entity';

export const COLLECTION_CENTER_REPOSITORY_PORT = Symbol('COLLECTION_CENTER_REPOSITORY_PORT');

export interface CollectionCenterRepositoryPort {
  save(center: CollectionCenter): Promise<CollectionCenter>;
  findAll(): Promise<CollectionCenter[]>;
  findById(id: string): Promise<CollectionCenter | null>;
  update(id: string, payload: Partial<CollectionCenter>): Promise<CollectionCenter>;
  delete(id: string): Promise<void>;
}
