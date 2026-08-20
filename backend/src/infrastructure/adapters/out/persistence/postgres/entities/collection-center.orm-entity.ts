import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';
import { CollectionCenter } from '../../../../../../domain/entities/collection-center.entity';

@Entity('collection_centers')
export class CollectionCenterOrmEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  nombre: string;

  @Column('float')
  lat: number;

  @Column('float')
  lng: number;

  @Column()
  stockInfo: string;

  @Column()
  contacto: string;

  @Column({ type: 'int', nullable: true, default: null })
  estadoId: number | null;

  @CreateDateColumn()
  createdAt: Date;

  static fromDomain(domain: CollectionCenter): CollectionCenterOrmEntity {
    const entity = new CollectionCenterOrmEntity();
    entity.id = domain.id;
    entity.nombre = domain.nombre;
    entity.lat = domain.lat;
    entity.lng = domain.lng;
    entity.stockInfo = domain.stockInfo;
    entity.contacto = domain.contacto;
    entity.estadoId = domain.estadoId ?? null;
    entity.createdAt = domain.createdAt;
    return entity;
  }

  toDomain(): CollectionCenter {
    return new CollectionCenter(
      this.id,
      this.nombre,
      Number(this.lat),
      Number(this.lng),
      this.stockInfo,
      this.contacto,
      this.createdAt,
      this.estadoId ?? null,
    );
  }
}
