import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DispatchShipmentOrmEntity } from '../../infrastructure/adapters/out/persistence/postgres/entities/dispatch-shipment.orm-entity';
import { ManageShipmentUseCase, AssignShipmentCommand, DispatchShipmentDto } from '../../domain/ports/in/manage-shipment.use-case';

@Injectable()
export class ManageShipmentService implements ManageShipmentUseCase {
  constructor(
    @InjectRepository(DispatchShipmentOrmEntity)
    private readonly shipmentRepository: Repository<DispatchShipmentOrmEntity>,
  ) {}

  async assignSmartShipment(command: AssignShipmentCommand): Promise<DispatchShipmentDto> {
    // 1. Available drivers database pool
    const availableDrivers = [
      {
        id: 'usr_trans_4',
        nombre: 'Carlos Mendoza (Chofer 4x4)',
        ubicacionInicial: { lat: 10.605, lng: -66.94, nombre: 'Base Logística Catia La Mar' },
        vehiculo: command.vehiculoTipo || 'PICKUP_4X4',
      },
      {
        id: 'usr_trans_5',
        nombre: 'Jesús Silva (Camión 350)',
        ubicacionInicial: { lat: 10.58, lng: -66.91, nombre: 'Terminal Maiquetía' },
        vehiculo: 'CAMION_350',
      },
    ];

    // 2. Select optimal driver based on proximity to pickup origin
    let selectedDriver = availableDrivers[0];
    let minDistance = Infinity;

    for (const driver of availableDrivers) {
      const dist = this.calculateDistanceKm(
        driver.ubicacionInicial.lat,
        driver.ubicacionInicial.lng,
        command.origen.lat,
        command.origen.lng,
      );
      if (dist < minDistance) {
        minDistance = dist;
        selectedDriver = driver;
      }
    }

    // 3. Create and persist dispatch shipment
    const entity = this.shipmentRepository.create({
      donacionId: command.donacionId || `DON_${Date.now()}`,
      reporteId: command.reporteId || `REP_${Date.now()}`,
      transportistaId: selectedDriver.id,
      transportistaNombre: selectedDriver.nombre,
      vehiculoTipo: selectedDriver.vehiculo,
      ubicacionInicial: selectedDriver.ubicacionInicial,
      origen: command.origen,
      destino: command.destino,
      estado: 'ASIGNADO',
      insumoDescripcion: command.insumoDescripcion || 'Agua Embotellada y Kits de Primeros Auxilios',
    });

    const saved = await this.shipmentRepository.save(entity);
    return this.mapToDto(saved);
  }

  async getAssignedShipment(transportistaId: string): Promise<DispatchShipmentDto | null> {
    // Search for non-completed shipment for this driver or demo fallback
    const shipment = await this.shipmentRepository.findOne({
      where: [
        { transportistaId, estado: 'ASIGNADO' },
        { transportistaId, estado: 'RECOGIDO' },
      ],
      order: { createdAt: 'DESC' },
    });

    if (!shipment) {
      // Fallback demo shipment if database is empty for testing UI
      return {
        id: 'ship_demo_101',
        donacionId: 'DON_9901',
        reporteId: 'REP_LAGUAIRA_01',
        transportistaId,
        transportistaNombre: 'Carlos Mendoza (Chofer 4x4)',
        vehiculoTipo: 'PICKUP_4X4',
        ubicacionInicial: { lat: 10.605, lng: -66.94, nombre: 'Base Logística Catia La Mar' },
        origen: { lat: 10.601, lng: -66.932, nombre: 'Centro de Acopio Puerto La Guaira' },
        destino: { lat: 10.595, lng: -66.915, nombre: 'Refugio Carayaca Emergencia' },
        estado: 'ASIGNADO',
        insumoDescripcion: '500L Agua Potable & 20 Kits Médicos de Urgencia',
        createdAt: new Date(),
      };
    }

    return this.mapToDto(shipment);
  }

  async updateShipmentStatus(id: string, nuevoEstado: 'RECOGIDO' | 'ENTREGADO'): Promise<DispatchShipmentDto> {
    if (id === 'ship_demo_101') {
      return {
        id,
        donacionId: 'DON_9901',
        reporteId: 'REP_LAGUAIRA_01',
        transportistaId: 'usr_trans_4',
        transportistaNombre: 'Carlos Mendoza (Chofer 4x4)',
        vehiculoTipo: 'PICKUP_4X4',
        ubicacionInicial: { lat: 10.605, lng: -66.94, nombre: 'Base Logística Catia La Mar' },
        origen: { lat: 10.601, lng: -66.932, nombre: 'Centro de Acopio Puerto La Guaira' },
        destino: { lat: 10.595, lng: -66.915, nombre: 'Refugio Carayaca Emergencia' },
        estado: nuevoEstado,
        insumoDescripcion: '500L Agua Potable & 20 Kits Médicos de Urgencia',
        createdAt: new Date(),
        recogidoAt: nuevoEstado === 'RECOGIDO' || nuevoEstado === 'ENTREGADO' ? new Date() : undefined,
        entregadoAt: nuevoEstado === 'ENTREGADO' ? new Date() : undefined,
      };
    }

    const shipment = await this.shipmentRepository.findOneBy({ id });
    if (!shipment) {
      throw new NotFoundException(`Despacho con ID ${id} no encontrado`);
    }

    shipment.estado = nuevoEstado;
    if (nuevoEstado === 'RECOGIDO') {
      shipment.recogidoAt = new Date();
    } else if (nuevoEstado === 'ENTREGADO') {
      shipment.entregadoAt = new Date();
    }

    const updated = await this.shipmentRepository.save(shipment);
    return this.mapToDto(updated);
  }

  private calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Number((R * c).toFixed(1));
  }

  private mapToDto(entity: DispatchShipmentOrmEntity): DispatchShipmentDto {
    return {
      id: entity.id,
      donacionId: entity.donacionId,
      reporteId: entity.reporteId,
      transportistaId: entity.transportistaId,
      transportistaNombre: entity.transportistaNombre,
      vehiculoTipo: entity.vehiculoTipo,
      ubicacionInicial: entity.ubicacionInicial,
      origen: entity.origen,
      destino: entity.destino,
      estado: entity.estado,
      insumoDescripcion: entity.insumoDescripcion,
      createdAt: entity.createdAt,
      recogidoAt: entity.recogidoAt,
      entregadoAt: entity.entregadoAt,
    };
  }
}
