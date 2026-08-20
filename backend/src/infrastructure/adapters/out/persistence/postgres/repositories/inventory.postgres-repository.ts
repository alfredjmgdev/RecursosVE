import { Injectable } from '@nestjs/common';
import { InventoryRepositoryPort } from '../../../../../../domain/ports/out/inventory-repository.port';
import { CommunityInventory } from '../../../../../../domain/entities/inventory.entity';
import { ResourceCategory } from '../../../../../../domain/entities/report.entity';

@Injectable()
export class InventoryPostgresRepository implements InventoryRepositoryPort {
  private readonly inMemoryStore = new Map<string, CommunityInventory>();

  constructor() {
    // Seed initial mock community inventory for demo/MVP
    const mock1 = new CommunityInventory(
      'inv_101',
      { lat: 10.605, lng: -66.930, campamento: 'Depósito Las Flores' },
      ResourceCategory.AGUA,
      'Agua potable',
      300,
      'litros',
      'Pedro R. (0414-555-0199)',
    );

    const mock2 = new CommunityInventory(
      'inv_102',
      { lat: 10.605, lng: -66.945, campamento: 'Almacén Puerto Maiquetía' },
      ResourceCategory.ABRIGO,
      'Carpas Térmicas Impermeables',
      50,
      'unidades',
      'Capitán Morales (0412-888-3344)',
    );

    const mock3 = new CommunityInventory(
      'inv_103',
      { lat: 10.605, lng: -66.930, campamento: 'Depósito Las Flores' },
      ResourceCategory.AGUA,
      'Pastillas Potabilizadoras',
      2500,
      'pastillas',
      'Dra. Elena G. (0416-222-1100)',
    );

    this.inMemoryStore.set(mock1.id, mock1);
    this.inMemoryStore.set(mock2.id, mock2);
    this.inMemoryStore.set(mock3.id, mock3);
  }

  async save(inventory: CommunityInventory): Promise<CommunityInventory> {
    this.inMemoryStore.set(inventory.id, inventory);
    return inventory;
  }

  async findAvailableByCategory(category: ResourceCategory): Promise<CommunityInventory[]> {
    return Array.from(this.inMemoryStore.values()).filter(
      (inv) => inv.categoria === category && inv.cantidadDisponible > 0 && !inv.isExpired(),
    );
  }

  async findAll(): Promise<CommunityInventory[]> {
    return Array.from(this.inMemoryStore.values());
  }
}
