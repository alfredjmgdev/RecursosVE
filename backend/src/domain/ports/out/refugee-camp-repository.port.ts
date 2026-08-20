import { RefugeeCamp } from '../../entities/refugee-camp.entity';

export const REFUGEE_CAMP_REPOSITORY_PORT = Symbol('REFUGEE_CAMP_REPOSITORY_PORT');

export interface RefugeeCampRepositoryPort {
  save(camp: RefugeeCamp): Promise<RefugeeCamp>;
  findAll(): Promise<RefugeeCamp[]>;
  findById(id: string): Promise<RefugeeCamp | null>;
  update(id: string, payload: Partial<RefugeeCamp>): Promise<RefugeeCamp>;
  delete(id: string): Promise<void>;
}
