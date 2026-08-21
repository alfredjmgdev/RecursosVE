import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { User, UserRole } from '../../../../../../domain/entities/user.entity';
import { RoleOrmEntity } from './role.orm-entity';

@Entity('users')
export class UserOrmEntity {
  @PrimaryColumn({ type: 'varchar' })
  id: string;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'varchar' })
  password: string;

  @Column({ type: 'varchar' })
  nombre: string;

  @ManyToOne(() => RoleOrmEntity, { eager: true })
  @JoinColumn({ name: 'rol_id' })
  role: RoleOrmEntity;

  @Column({ name: 'campamento_asignado', type: 'varchar', nullable: true, default: null })
  campamentoAsignado: string | null;

  @Column({ name: 'vehiculo_tipo', type: 'varchar', nullable: true, default: null })
  vehiculoTipo: string | null;

  @Column({ name: 'vehiculo_capacidad', type: 'varchar', nullable: true, default: null })
  vehiculoCapacidad: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  toDomain(): User {
    const rolEnum = (this.role?.codigo as UserRole) || UserRole.BRIGADISTA;
    return new User(
      this.id,
      this.email,
      this.nombre,
      rolEnum,
      this.campamentoAsignado || undefined,
      this.vehiculoTipo || undefined,
      this.vehiculoCapacidad || undefined,
    );
  }
}
