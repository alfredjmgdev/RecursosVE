import { Controller, Get, Post, Patch, Param, Body } from '@nestjs/common';
import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';
import { ManageShipmentUseCase } from '../../../../domain/ports/in/manage-shipment.use-case';

export class AssignShipmentDtoClass {
  @IsString()
  @IsOptional()
  donacionId?: string;

  @IsString()
  @IsOptional()
  reporteId?: string;

  @IsObject()
  @IsNotEmpty()
  origen!: { lat: number; lng: number; nombre: string };

  @IsObject()
  @IsNotEmpty()
  destino!: { lat: number; lng: number; nombre: string };

  @IsString()
  @IsOptional()
  insumoDescripcion?: string;

  @IsString()
  @IsOptional()
  vehiculoTipo?: string;
}

export class UpdateShipmentStatusDto {
  @IsString()
  @IsNotEmpty()
  estado!: 'RECOGIDO' | 'ENTREGADO';
}

@Controller('shipments')
export class ShipmentsController {
  constructor(private readonly manageShipmentUseCase: ManageShipmentUseCase) {}

  @Post('assign')
  async assignShipment(@Body() command: AssignShipmentDtoClass) {
    return this.manageShipmentUseCase.assignSmartShipment(command);
  }

  @Get('assigned/:transportistaId')
  async getAssignedShipment(@Param('transportistaId') transportistaId: string) {
    return this.manageShipmentUseCase.getAssignedShipment(transportistaId);
  }

  @Patch(':id/status')
  async updateShipmentStatus(
    @Param('id') id: string,
    @Body() dto: UpdateShipmentStatusDto,
  ) {
    return this.manageShipmentUseCase.updateShipmentStatus(id, dto.estado);
  }
}
