import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { VenezuelaState } from '../../../../../../domain/entities/venezuela-state.entity';

@Entity('venezuela_states')
export class VenezuelaStateOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column()
  codigo: string;

  @Column('float')
  lat: number;

  @Column('float')
  lng: number;

  @Column('int')
  zoom: number;

  toDomain(): VenezuelaState {
    return new VenezuelaState(
      this.id,
      this.nombre,
      this.codigo,
      Number(this.lat),
      Number(this.lng),
      Number(this.zoom),
    );
  }
}
