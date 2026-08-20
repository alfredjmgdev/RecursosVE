import { CommunityInventory } from '../../entities/inventory.entity';
import { ResourceCategory } from '../../entities/report.entity';

export interface RegisterInventoryCommand {
  ubicacion: {
    lat: number;
    lng: number;
    campamento: string;
  };
  categoria: ResourceCategory;
  item: string;
  cantidadDisponible: number;
  unidad: string;
  contacto: string;
}

export const REGISTER_INVENTORY_USE_CASE = 'REGISTER_INVENTORY_USE_CASE';

export interface RegisterInventoryUseCase {
  execute(command: RegisterInventoryCommand): Promise<CommunityInventory>;
}
