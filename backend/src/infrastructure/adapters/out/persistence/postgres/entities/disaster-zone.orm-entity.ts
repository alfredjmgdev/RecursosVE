import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';
import type { DisasterEventType } from '../../../../../../domain/entities/disaster-zone.entity';
import { DisasterZone } from '../../../../../../domain/entities/disaster-zone.entity';

@Entity('disaster_zones')
export class DisasterZoneOrmEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  nombre: string;

  @Column()
  tipo: string;

  @Column('float')
  lat: number;

  @Column('float')
  lng: number;

  @Column('int')
  radioMetros: number;

  @Column({ type: 'int', nullable: true, default: null })
  estadoId: number | null;

  @CreateDateColumn()
  createdAt: Date;

  static fromDomain(domain: DisasterZone): DisasterZoneOrmEntity {
    const entity = new DisasterZoneOrmEntity();
    entity.id = domain.id;
    entity.nombre = domain.nombre;
    entity.tipo = domain.tipo;
    entity.lat = domain.lat;
    entity.lng = domain.lng;
    entity.radioMetros = domain.radioMetros;
    entity.estadoId = domain.estadoId ?? null;
    entity.createdAt = domain.createdAt;
    return entity;
  }

  toDomain(): DisasterZone {
    return new DisasterZone(
      this.id,
      this.nombre,
      this.tipo as DisasterEventType,
      Number(this.lat),
      Number(this.lng),
      Number(this.radioMetros),
      this.createdAt,
      this.estadoId ?? null,
    );
  }
}
