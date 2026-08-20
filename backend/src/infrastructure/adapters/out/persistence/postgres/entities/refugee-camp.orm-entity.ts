import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';
import { RefugeeCamp } from '../../../../../../domain/entities/refugee-camp.entity';

@Entity('refugee_camps')
export class RefugeeCampOrmEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  nombre: string;

  @Column('float')
  lat: number;

  @Column('float')
  lng: number;

  @Column('int')
  poblacion: number;

  @Column('int')
  familias: number;

  @Column('int')
  capacidad: number;

  @Column()
  coordinador: string;

  @Column({ type: 'int', nullable: true, default: null })
  estadoId: number | null;

  @CreateDateColumn()
  createdAt: Date;

  static fromDomain(domain: RefugeeCamp): RefugeeCampOrmEntity {
    const entity = new RefugeeCampOrmEntity();
    entity.id = domain.id;
    entity.nombre = domain.nombre;
    entity.lat = domain.lat;
    entity.lng = domain.lng;
    entity.poblacion = domain.poblacion;
    entity.familias = domain.familias;
    entity.capacidad = domain.capacidad;
    entity.coordinador = domain.coordinador;
    entity.estadoId = domain.estadoId ?? null;
    entity.createdAt = domain.createdAt;
    return entity;
  }

  toDomain(): RefugeeCamp {
    return new RefugeeCamp(
      this.id,
      this.nombre,
      Number(this.lat),
      Number(this.lng),
      Number(this.poblacion),
      Number(this.familias),
      Number(this.capacidad),
      this.coordinador,
      this.createdAt,
      this.estadoId ?? null,
    );
  }
}
