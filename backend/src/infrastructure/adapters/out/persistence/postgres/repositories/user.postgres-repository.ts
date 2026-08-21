import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRepositoryPort, CreateUserData, UserWithPassword } from '../../../../../../domain/ports/out/user-repository.port';
import { User, UserRole } from '../../../../../../domain/entities/user.entity';
import { UserOrmEntity } from '../entities/user.orm-entity';

@Injectable()
export class UserPostgresRepository implements UserRepositoryPort, OnModuleInit {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly repo: Repository<UserOrmEntity>,
  ) {}

  async onModuleInit() {
    // Seed initial demo users into PostgreSQL if empty
    const count = await this.repo.count();
    if (count === 0) {
      const initialUsers: Array<Partial<UserOrmEntity>> = [
        {
          id: 'usr_coord_1',
          email: 'coordinador@recursosve.org',
          password: 'coord123',
          nombre: 'Juan P.',
          rol: UserRole.COORDINADOR,
          campamentoAsignado: 'Campamento La Guaira #12',
        },
        {
          id: 'usr_brig_2',
          email: 'brigadista@recursosve.org',
          password: 'briga123',
          nombre: 'Pedro R.',
          rol: UserRole.BRIGADISTA,
          campamentoAsignado: 'Depósito Las Flores',
        },
        {
          id: 'usr_donante_3',
          email: 'donante@recursosve.org',
          password: 'donant123',
          nombre: 'ONG Farmacéuticos Solidarios',
          rol: UserRole.DONANTE,
          campamentoAsignado: null,
        },
        {
          id: 'usr_trans_4',
          email: 'transportista@recursosve.org',
          password: 'driver123',
          nombre: 'Carlos Mendoza (Chofer 4x4)',
          rol: UserRole.TRANSPORTISTA,
          campamentoAsignado: null,
        },
        {
          id: 'usr_trans_4_alt',
          email: 'transportista@recursos.ve',
          password: 'driver123',
          nombre: 'Carlos Mendoza (Chofer 4x4)',
          rol: UserRole.TRANSPORTISTA,
          campamentoAsignado: null,
        },
      ];

      for (const userData of initialUsers) {
        const entity = this.repo.create(userData);
        await this.repo.save(entity);
      }
      console.log('✅ Usuarios iniciales sembrados exitosamente en PostgreSQL (tabla users)');
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    const entity = await this.repo.findOne({
      where: { email: email.toLowerCase() },
    });
    return entity ? entity.toDomain() : null;
  }

  async findRawByEmail(email: string): Promise<UserWithPassword | null> {
    const entity = await this.repo.findOne({
      where: { email: email.toLowerCase() },
    });
    if (!entity) return null;
    const domainUser = entity.toDomain() as UserWithPassword;
    domainUser.password = entity.password;
    return domainUser;
  }

  async findAll(): Promise<User[]> {
    const entities = await this.repo.find({
      order: { createdAt: 'DESC' },
    });
    return entities.map((e) => e.toDomain());
  }

  async create(data: CreateUserData): Promise<User> {
    const newId = `usr_${Date.now()}`;
    const entity = this.repo.create({
      id: newId,
      email: data.email.toLowerCase(),
      password: data.password || '123456',
      nombre: data.nombre,
      rol: data.rol,
      campamentoAsignado: data.campamentoAsignado || null,
    });

    const saved = await this.repo.save(entity);
    return saved.toDomain();
  }

  async delete(id: string): Promise<boolean> {
    const res = await this.repo.delete(id);
    return (res.affected || 0) > 0;
  }
}
