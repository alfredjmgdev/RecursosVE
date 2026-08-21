export interface AssignShipmentCommand {
  donacionId?: string;
  reporteId?: string;
  origen: { lat: number; lng: number; nombre: string };
  destino: { lat: number; lng: number; nombre: string };
  insumoDescripcion?: string;
  vehiculoTipo?: string;
}

export interface DispatchShipmentDto {
  id: string;
  donacionId?: string;
  reporteId?: string;
  transportistaId: string;
  transportistaNombre: string;
  vehiculoTipo: string;
  ubicacionInicial: { lat: number; lng: number; nombre?: string };
  origen: { lat: number; lng: number; nombre: string };
  destino: { lat: number; lng: number; nombre: string };
  estado: 'ASIGNADO' | 'RECOGIDO' | 'ENTREGADO';
  insumoDescripcion?: string;
  createdAt: Date;
  recogidoAt?: Date;
  entregadoAt?: Date;
}

export abstract class ManageShipmentUseCase {
  abstract assignSmartShipment(command: AssignShipmentCommand): Promise<DispatchShipmentDto>;
  abstract getAssignedShipment(transportistaId: string): Promise<DispatchShipmentDto | null>;
  abstract updateShipmentStatus(id: string, nuevoEstado: 'RECOGIDO' | 'ENTREGADO'): Promise<DispatchShipmentDto>;
}
