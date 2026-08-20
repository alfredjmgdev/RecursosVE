import { Body, Controller, Get, Inject, Post } from '@nestjs/common';
import { REGISTER_INVENTORY_USE_CASE } from '../../../../domain/ports/in/register-inventory.use-case';
import type { RegisterInventoryUseCase } from '../../../../domain/ports/in/register-inventory.use-case';
import { INVENTORY_REPOSITORY_PORT } from '../../../../domain/ports/out/inventory-repository.port';
import type { InventoryRepositoryPort } from '../../../../domain/ports/out/inventory-repository.port';
import { CreateInventoryDto } from './dtos/create-inventory.dto';

@Controller('inventory')
export class InventoryController {
  constructor(
    @Inject(REGISTER_INVENTORY_USE_CASE)
    private readonly registerInventoryUseCase: RegisterInventoryUseCase,
    @Inject(INVENTORY_REPOSITORY_PORT)
    private readonly inventoryRepository: InventoryRepositoryPort,
  ) {}

  @Post()
  async registerInventory(@Body() dto: CreateInventoryDto) {
    return this.registerInventoryUseCase.execute(dto);
  }

  @Get()
  async getAllInventory() {
    return this.inventoryRepository.findAll();
  }
}
