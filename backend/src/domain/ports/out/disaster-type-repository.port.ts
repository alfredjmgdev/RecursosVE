import { DisasterType } from '../../entities/disaster-type.entity';

export const DISASTER_TYPE_REPOSITORY_PORT = Symbol('DISASTER_TYPE_REPOSITORY_PORT');

export interface DisasterTypeRepositoryPort {
  findAll(): Promise<DisasterType[]>;
  findByCode(code: string): Promise<DisasterType | null>;
  save(disasterType: DisasterType): Promise<DisasterType>;
  seedInitialTypes(): Promise<void>;
}
