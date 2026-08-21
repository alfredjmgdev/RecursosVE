import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { User, UserRole } from '../../../../../../domain/entities/user.entity';

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

  @Column({
    type: 'varchar',
    default: UserRole.BRIGADISTA,
  })
  rol: UserRole;

  @Column({ type: 'varchar', nullable: true, default: null })
  campamentoAsignado: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  toDomain(): User {
    return new User(
      this.id,
      this.email,
      this.nombre,
      this.rol,
      this.campamentoAsignado || undefined,
    );
  }

  static fromDomain(domain: User, password?: string): UserOrmEntity {
    const entity = new UserOrmEntity();
    entity.id = domain.id;
    entity.email = domain.email;
    entity.password = password || '123456';
    entity.nombre = domain.nombre;
    entity.rol = domain.rol;
    entity.campamentoAsignado = domain.campamentoAsignado || null;
    return entity;
  }
}
