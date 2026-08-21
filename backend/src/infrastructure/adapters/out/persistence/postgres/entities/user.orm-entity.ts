import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { User, UserRole } from '../../../../../../domain/entities/user.entity';

@Entity('users')
export class UserOrmEntity {
  @PrimaryColumn()
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  nombre: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.BRIGADISTA,
  })
  rol: UserRole;

  @Column({ nullable: true, default: null })
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
