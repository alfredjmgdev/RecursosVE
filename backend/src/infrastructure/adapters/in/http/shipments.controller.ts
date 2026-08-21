import { Controller, Get, Post, Patch, Param, Body } from '@nestjs/common';
import { ManageShipmentUseCase } from '../../../../domain/ports/in/manage-shipment.use-case';

export class AssignShipmentDtoClass {
  donacionId?: string;
  reporteId?: string;
  origen: { lat: number; lng: number; nombre: string };
  destino: { lat: number; lng: number; nombre: string };
  insumoDescripcion?: string;
  vehiculoTipo?: string;
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
    @Body() body: { estado: 'RECOGIDO' | 'ENTREGADO' },
  ) {
    return this.manageShipmentUseCase.updateShipmentStatus(id, body.estado);
  }
}
