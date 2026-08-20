import { Column, Entity, PrimaryColumn } from 'typeorm';
import { DisasterType } from '../../../../../../domain/entities/disaster-type.entity';

@Entity('disaster_types')
export class DisasterTypeOrmEntity {
  @PrimaryColumn()
  code: string;

  @Column()
  nombre: string;

  @Column()
  color: string;

  @Column()
  fillColor: string;

  @Column()
  bgBadge: string;

  @Column()
  textBadge: string;

  @Column()
  icon: string;

  static fromDomain(domain: DisasterType): DisasterTypeOrmEntity {
    const entity = new DisasterTypeOrmEntity();
    entity.code = domain.code;
    entity.nombre = domain.nombre;
    entity.color = domain.color;
    entity.fillColor = domain.fillColor;
    entity.bgBadge = domain.bgBadge;
    entity.textBadge = domain.textBadge;
    entity.icon = domain.icon;
    return entity;
  }

  toDomain(): DisasterType {
    return new DisasterType(
      this.code,
      this.nombre,
      this.color,
      this.fillColor,
      this.bgBadge,
      this.textBadge,
      this.icon,
    );
  }
}
