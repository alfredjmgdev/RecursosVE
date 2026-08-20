import { CommunityInventory } from '../../entities/inventory.entity';
import { ResourceCategory } from '../../entities/report.entity';

export const INVENTORY_REPOSITORY_PORT = 'INVENTORY_REPOSITORY_PORT';

export interface InventoryRepositoryPort {
  save(inventory: CommunityInventory): Promise<CommunityInventory>;
  findAvailableByCategory(category: ResourceCategory): Promise<CommunityInventory[]>;
  findAll(): Promise<CommunityInventory[]>;
}
