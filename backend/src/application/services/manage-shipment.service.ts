import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DispatchShipmentOrmEntity } from '../../infrastructure/adapters/out/persistence/postgres/entities/dispatch-shipment.orm-entity';
import { ManageShipmentUseCase, AssignShipmentCommand, DispatchShipmentDto } from '../../domain/ports/in/manage-shipment.use-case';

@Injectable()
export class ManageShipmentService implements ManageShipmentUseCase, OnModuleInit {
  constructor(
    @InjectRepository(DispatchShipmentOrmEntity)
    private readonly shipmentRepository: Repository<DispatchShipmentOrmEntity>,
  ) {}

  async onModuleInit() {
    const initialShipments: Array<Partial<DispatchShipmentOrmEntity>> = [
      {
        id: 'a1111111-1111-4111-8111-111111111101',
        donacionId: 'DON_9901',
        reporteId: 'REP_LAGUAIRA_01',
        transportistaId: 'usr_trans_4',
        transportistaNombre: 'Carlos Mendoza (Pick-Up 4x4)',
        vehiculoTipo: 'PICKUP_4X4',
        ubicacionInicial: { lat: 10.605, lng: -66.94, nombre: 'Base Logística Catia La Mar' },
        origen: { lat: 10.601, lng: -66.932, nombre: 'Centro de Acopio Puerto La Guaira' },
        destino: { lat: 10.595, lng: -66.915, nombre: 'Refugio Carayaca Emergencia' },
        estado: 'ASIGNADO',
        insumoDescripcion: '500L Agua Potable & 20 Kits Médicos de Urgencia',
      },
      {
        id: 'a1111111-1111-4111-8111-111111111104',
        donacionId: 'DON_9901_ALT',
        reporteId: 'REP_LAGUAIRA_01',
        transportistaId: 'usr_trans_4_alt',
        transportistaNombre: 'Carlos Mendoza (Pick-Up 4x4)',
        vehiculoTipo: 'PICKUP_4X4',
        ubicacionInicial: { lat: 10.605, lng: -66.94, nombre: 'Base Logística Catia La Mar' },
        origen: { lat: 10.601, lng: -66.932, nombre: 'Centro de Acopio Puerto La Guaira' },
        destino: { lat: 10.595, lng: -66.915, nombre: 'Refugio Carayaca Emergencia' },
        estado: 'ASIGNADO',
        insumoDescripcion: '500L Agua Potable & 20 Kits Médicos de Urgencia',
      },
      {
        id: 'a1111111-1111-4111-8111-111111111102',
        donacionId: 'DON_9902',
        reporteId: 'REP_MACUTO_02',
        transportistaId: 'usr_trans_5',
        transportistaNombre: 'María Briceño (Chuto 10T)',
        vehiculoTipo: 'CHUTO_10T',
        ubicacionInicial: { lat: 10.585, lng: -66.91, nombre: 'Terminal Maiquetía' },
        origen: { lat: 10.598, lng: -66.902, nombre: 'Depósito Central Maiquetía' },
        destino: { lat: 10.612, lng: -66.885, nombre: 'Campamento Refugio Macuto' },
        estado: 'RECOGIDO',
        insumoDescripcion: '30 Cajas de Medicamentos Esenciales & Mantas Térmicas',
        recogidoAt: new Date(),
      },
      {
        id: 'a1111111-1111-4111-8111-111111111103',
        donacionId: 'DON_9903',
        reporteId: 'REP_NAIGUATA_03',
        transportistaId: 'usr_trans_6',
        transportistaNombre: 'Roberto "Tito" Silva (Camión 350)',
        vehiculoTipo: 'CAMION_350',
        ubicacionInicial: { lat: 10.62, lng: -66.86, nombre: 'Base Logística Caraballeda' },
        origen: { lat: 10.625, lng: -66.845, nombre: 'Centro de Acopio Naiguatá' },
        destino: { lat: 10.63, lng: -66.82, nombre: 'Refugio Los Anare' },
        estado: 'ENTREGADO',
        insumoDescripcion: '150 Raciones de Comida No Perecedera & Kits de Higiene',
        recogidoAt: new Date(Date.now() - 3600000),
        entregadoAt: new Date(),
      },
    ];

    // Explicitly clear any legacy seeded shipment for usr_trans_7 so Yorman is DISPONIBLE by default
    await this.shipmentRepository.delete({ transportistaId: 'usr_trans_7' });

    for (const shipData of initialShipments) {
      const existing = await this.shipmentRepository.findOneBy({ transportistaId: shipData.transportistaId });
      if (!existing) {
        const entity = this.shipmentRepository.create(shipData);
        await this.shipmentRepository.save(entity);
      }
    }
    console.log('✅ Despachos semilla verificados/sembrados exitosamente en PostgreSQL (tabla dispatch_shipments)');
  }

  async assignSmartShipment(command: AssignShipmentCommand): Promise<DispatchShipmentDto> {
    const availableDrivers = [
      {
        id: 'usr_trans_4',
        nombre: 'Carlos Mendoza (Pick-Up 4x4)',
        ubicacionInicial: { lat: 10.605, lng: -66.94, nombre: 'Base Logística Catia La Mar' },
        vehiculo: command.vehiculoTipo || 'PICKUP_4X4',
      },
      {
        id: 'usr_trans_5',
        nombre: 'María Briceño (Chuto 10T)',
        ubicacionInicial: { lat: 10.585, lng: -66.91, nombre: 'Terminal Maiquetía' },
        vehiculo: 'CHUTO_10T',
      },
      {
        id: 'usr_trans_6',
        nombre: 'Roberto "Tito" Silva (Camión 350)',
        ubicacionInicial: { lat: 10.62, lng: -66.86, nombre: 'Base Logística Caraballeda' },
        vehiculo: 'CAMION_350',
      },
      {
        id: 'usr_trans_7',
        nombre: 'Yorman Gutiérrez (Furgón Médico)',
        ubicacionInicial: { lat: 10.61, lng: -66.92, nombre: 'Centro Médico La Guaira' },
        vehiculo: 'FURGON_REFRIGERADO',
      },
    ];

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
    const shipment = await this.shipmentRepository.findOne({
      where: [
        { transportistaId, estado: 'ASIGNADO' },
        { transportistaId, estado: 'RECOGIDO' },
        { transportistaId, estado: 'ENTREGADO' },
      ],
      order: { createdAt: 'DESC' },
    });

    if (!shipment) {
      return null;
    }

    return this.mapToDto(shipment);
  }

  async updateShipmentStatus(id: string, nuevoEstado: 'RECOGIDO' | 'ENTREGADO'): Promise<DispatchShipmentDto> {
    if (id.startsWith('ship_fallback_')) {
      return {
        id,
        donacionId: 'DON_9901',
        reporteId: 'REP_LAGUAIRA_01',
        transportistaId: id.replace('ship_fallback_', ''),
        transportistaNombre: 'Transportista',
        vehiculoTipo: 'PICKUP_4X4',
        ubicacionInicial: { lat: 10.605, lng: -66.94, nombre: 'Base Logística Catia La Mar' },
        origen: { lat: 10.601, lng: -66.932, nombre: 'Centro de Acopio Puerto La Guaira' },
        destino: { lat: 10.595, lng: -66.915, nombre: 'Refugio Carayaca Emergencia' },
        estado: nuevoEstado,
        insumoDescripcion: 'Insumos Médicos y de Emergencia',
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
    const R = 6371;
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
