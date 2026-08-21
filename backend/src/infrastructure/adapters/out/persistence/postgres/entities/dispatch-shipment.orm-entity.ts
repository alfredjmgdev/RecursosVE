import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('dispatch_shipments')
export class DispatchShipmentOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'donacion_id', nullable: true })
  donacionId: string;

  @Column({ name: 'reporte_id', nullable: true })
  reporteId: string;

  @Column({ name: 'transportista_id' })
  transportistaId: string;

  @Column({ name: 'transportista_nombre' })
  transportistaNombre: string;

  @Column({ name: 'vehiculo_tipo', default: 'CAMION_350' })
  vehiculoTipo: string;

  @Column({ type: 'jsonb', name: 'ubicacion_inicial' })
  ubicacionInicial: { lat: number; lng: number; nombre?: string };

  @Column({ type: 'jsonb' })
  origen: { lat: number; lng: number; nombre: string };

  @Column({ type: 'jsonb' })
  destino: { lat: number; lng: number; nombre: string };

  @Column({ default: 'ASIGNADO' })
  estado: 'ASIGNADO' | 'RECOGIDO' | 'ENTREGADO';

  @Column({ name: 'insumo_descripcion', nullable: true })
  insumoDescripcion: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'recogido_at', nullable: true })
  recogidoAt: Date;

  @Column({ name: 'entregado_at', nullable: true })
  entregadoAt: Date;
}
