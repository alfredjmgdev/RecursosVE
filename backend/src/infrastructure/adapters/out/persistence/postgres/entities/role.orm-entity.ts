import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

@Entity('roles')
export class RoleOrmEntity {
  @PrimaryColumn({ type: 'int' })
  id: number;

  @Column({ type: 'varchar', unique: true })
  codigo: string;

  @Column({ type: 'varchar' })
  nombre: string;

  @CreateDateColumn()
  createdAt: Date;
}
