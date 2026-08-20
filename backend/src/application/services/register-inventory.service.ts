import { Inject, Injectable } from '@nestjs/common';
import { RegisterInventoryCommand, RegisterInventoryUseCase } from '../../domain/ports/in/register-inventory.use-case';
import { CommunityInventory } from '../../domain/entities/inventory.entity';
import { INVENTORY_REPOSITORY_PORT } from '../../domain/ports/out/inventory-repository.port';
import type { InventoryRepositoryPort } from '../../domain/ports/out/inventory-repository.port';

@Injectable()
export class RegisterInventoryService implements RegisterInventoryUseCase {
  constructor(
    @Inject(INVENTORY_REPOSITORY_PORT)
    private readonly inventoryRepository: InventoryRepositoryPort,
  ) {}

  async execute(command: RegisterInventoryCommand): Promise<CommunityInventory> {
    const inventory = new CommunityInventory(
      `inv_${Date.now()}`,
      command.ubicacion,
      command.categoria,
      command.item,
      command.cantidadDisponible,
      command.unidad,
      command.contacto,
    );

    return this.inventoryRepository.save(inventory);
  }
}
