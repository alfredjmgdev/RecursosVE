import { VenezuelaState } from '../../entities/venezuela-state.entity';

export const VENEZUELA_STATE_REPOSITORY_PORT = 'VENEZUELA_STATE_REPOSITORY_PORT';

export interface VenezuelaStateRepositoryPort {
  findAll(): Promise<VenezuelaState[]>;
}
