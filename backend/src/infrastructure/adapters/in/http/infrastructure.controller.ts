import { Body, Controller, Delete, Get, Inject, Param, Patch, Post } from '@nestjs/common';
import { MANAGE_INFRASTRUCTURE_USE_CASE } from '../../../../domain/ports/in/manage-infrastructure.use-case';
import type { ManageInfrastructureUseCase } from '../../../../domain/ports/in/manage-infrastructure.use-case';
import type { DisasterEventType, DisasterZone } from '../../../../domain/entities/disaster-zone.entity';
import { RefugeeCamp } from '../../../../domain/entities/refugee-camp.entity';
import { CollectionCenter } from '../../../../domain/entities/collection-center.entity';
import { DisasterType } from '../../../../domain/entities/disaster-type.entity';
import { VenezuelaState } from '../../../../domain/entities/venezuela-state.entity';

@Controller('infrastructure')
export class InfrastructureController {
  constructor(
    @Inject(MANAGE_INFRASTRUCTURE_USE_CASE)
    private readonly infraUseCase: ManageInfrastructureUseCase,
  ) {}

  @Get('states')
  async getStates(): Promise<VenezuelaState[]> {
    return this.infraUseCase.getStates();
  }

  @Get('disasters')
  async getDisasters(): Promise<DisasterZone[]> {
    return this.infraUseCase.getDisasters();
  }

  @Post('disasters')
  async createDisaster(@Body() body: { nombre: string; tipo: DisasterEventType; lat: number; lng: number; radioMetros: number; estadoId?: number | null }): Promise<DisasterZone> {
    return this.infraUseCase.createDisaster({ ...body, estadoId: body.estadoId ?? null });
  }

  @Patch('disasters/:id')
  async updateDisaster(@Param('id') id: string, @Body() body: Partial<DisasterZone>): Promise<DisasterZone> {
    return this.infraUseCase.updateDisaster(id, body);
  }

  @Delete('disasters/:id')
  async deleteDisaster(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.infraUseCase.deleteDisaster(id);
    return { success: true };
  }

  @Get('disaster-types')
  async getDisasterTypes(): Promise<DisasterType[]> {
    return this.infraUseCase.getDisasterTypes();
  }

  @Get('camps')
  async getCamps(): Promise<RefugeeCamp[]> {
    return this.infraUseCase.getCamps();
  }

  @Post('camps')
  async createCamp(@Body() body: { nombre: string; lat: number; lng: number; poblacion: number; familias: number; capacidad: number; coordinador: string; estadoId?: number | null }): Promise<RefugeeCamp> {
    return this.infraUseCase.createCamp({ ...body, estadoId: body.estadoId ?? null });
  }

  @Patch('camps/:id')
  async updateCamp(@Param('id') id: string, @Body() body: Partial<RefugeeCamp>): Promise<RefugeeCamp> {
    return this.infraUseCase.updateCamp(id, body);
  }

  @Delete('camps/:id')
  async deleteCamp(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.infraUseCase.deleteCamp(id);
    return { success: true };
  }

  @Get('acopios')
  async getAcopios(): Promise<CollectionCenter[]> {
    return this.infraUseCase.getCollectionCenters();
  }

  @Post('acopios')
  async createAcopio(@Body() body: { nombre: string; lat: number; lng: number; stockInfo: string; contacto: string; estadoId?: number | null }): Promise<CollectionCenter> {
    return this.infraUseCase.createCollectionCenter({ ...body, estadoId: body.estadoId ?? null });
  }

  @Patch('acopios/:id')
  async updateAcopio(@Param('id') id: string, @Body() body: Partial<CollectionCenter>): Promise<CollectionCenter> {
    return this.infraUseCase.updateCollectionCenter(id, body);
  }

  @Delete('acopios/:id')
  async deleteAcopio(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.infraUseCase.deleteCollectionCenter(id);
    return { success: true };
  }
}
