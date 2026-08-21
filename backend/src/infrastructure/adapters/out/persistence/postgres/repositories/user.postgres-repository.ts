import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRepositoryPort, CreateUserData, UserWithPassword } from '../../../../../../domain/ports/out/user-repository.port';
import { User, UserRole } from '../../../../../../domain/entities/user.entity';
import { UserOrmEntity } from '../entities/user.orm-entity';
import { RoleOrmEntity } from '../entities/role.orm-entity';

const ROLE_MAP: Record<UserRole, { id: number; nombre: string }> = {
  [UserRole.COORDINADOR]: { id: 1, nombre: 'Coordinador Logístico' },
  [UserRole.BRIGADISTA]: { id: 2, nombre: 'Brigadista en Terreno' },
  [UserRole.DONANTE]: { id: 3, nombre: 'Donante Aliado' },
  [UserRole.TRANSPORTISTA]: { id: 4, nombre: 'Transportista Logístico' },
};

@Injectable()
export class UserPostgresRepository implements UserRepositoryPort, OnModuleInit {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly repo: Repository<UserOrmEntity>,
    @InjectRepository(RoleOrmEntity)
    private readonly roleRepo: Repository<RoleOrmEntity>,
  ) {}

  async onModuleInit() {
    // 1. Seed Roles table
    const rolesToSeed: Array<Partial<RoleOrmEntity>> = [
      { id: 1, codigo: UserRole.COORDINADOR, nombre: 'Coordinador Logístico' },
      { id: 2, codigo: UserRole.BRIGADISTA, nombre: 'Brigadista en Terreno' },
      { id: 3, codigo: UserRole.DONANTE, nombre: 'Donante Aliado' },
      { id: 4, codigo: UserRole.TRANSPORTISTA, nombre: 'Transportista Logístico' },
    ];

    for (const r of rolesToSeed) {
      const existing = await this.roleRepo.findOneBy({ id: r.id });
      if (!existing) {
        const roleEntity = this.roleRepo.create(r);
        await this.roleRepo.save(roleEntity);
      }
    }
    console.log('✅ Catálogo de roles verificado/sembrado en PostgreSQL (tabla roles)');

    // 2. Seed initial demo users into PostgreSQL
    const initialUsers = [
      {
        id: 'usr_coord_1',
        email: 'coordinador@recursosve.org',
        password: 'coord123',
        nombre: 'Juan P.',
        rolId: ROLE_MAP[UserRole.COORDINADOR].id,
        campamentoAsignado: 'Campamento La Guaira #12',
      },
      {
        id: 'usr_brig_2',
        email: 'brigadista@recursosve.org',
        password: 'briga123',
        nombre: 'Pedro R.',
        rolId: ROLE_MAP[UserRole.BRIGADISTA].id,
        campamentoAsignado: 'Depósito Las Flores',
      },
      {
        id: 'usr_donante_3',
        email: 'donante@recursosve.org',
        password: 'donant123',
        nombre: 'ONG Farmacéuticos Solidarios',
        rolId: ROLE_MAP[UserRole.DONANTE].id,
        campamentoAsignado: null,
      },
      {
        id: 'usr_trans_4',
        email: 'transportista@recursosve.org',
        password: 'driver123',
        nombre: 'Carlos Mendoza',
        rolId: ROLE_MAP[UserRole.TRANSPORTISTA].id,
        campamentoAsignado: null,
        vehiculoTipo: 'Pick-Up 4x4',
        vehiculoCapacidad: '1.5 Toneladas (500L)',
      },
      {
        id: 'usr_trans_4_alt',
        email: 'transportista@recursos.ve',
        password: 'driver123',
        nombre: 'Carlos Mendoza',
        rolId: ROLE_MAP[UserRole.TRANSPORTISTA].id,
        campamentoAsignado: null,
        vehiculoTipo: 'Pick-Up 4x4',
        vehiculoCapacidad: '1.5 Toneladas (500L)',
      },
      {
        id: 'usr_trans_5',
        email: 'transportista2@recursosve.org',
        password: 'driver123',
        nombre: 'María Briceño',
        rolId: ROLE_MAP[UserRole.TRANSPORTISTA].id,
        campamentoAsignado: null,
        vehiculoTipo: 'Chuto 10T',
        vehiculoCapacidad: '10 Toneladas',
      },
      {
        id: 'usr_trans_6',
        email: 'transportista3@recursosve.org',
        password: 'driver123',
        nombre: 'Roberto "Tito" Silva',
        rolId: ROLE_MAP[UserRole.TRANSPORTISTA].id,
        campamentoAsignado: null,
        vehiculoTipo: 'Camión 350',
        vehiculoCapacidad: '3.5 Toneladas',
      },
      {
        id: 'usr_trans_7',
        email: 'transportista4@recursosve.org',
        password: 'driver123',
        nombre: 'Yorman Gutiérrez',
        rolId: ROLE_MAP[UserRole.TRANSPORTISTA].id,
        campamentoAsignado: null,
        vehiculoTipo: 'Furgón Médico Refrigerado',
        vehiculoCapacidad: '2.0 Toneladas (Cadena de Frío)',
      },
    ];

    for (const userData of initialUsers) {
      const existing = await this.repo.findOneBy({ email: userData.email.toLowerCase() });
      if (!existing) {
        const entity = this.repo.create({
          id: userData.id,
          email: userData.email,
          password: userData.password,
          nombre: userData.nombre,
          role: { id: userData.rolId } as RoleOrmEntity,
          campamentoAsignado: userData.campamentoAsignado,
          vehiculoTipo: (userData as any).vehiculoTipo || null,
          vehiculoCapacidad: (userData as any).vehiculoCapacidad || null,
        });
        await this.repo.save(entity);
      } else {
        existing.nombre = userData.nombre;
        existing.vehiculoTipo = (userData as any).vehiculoTipo || null;
        existing.vehiculoCapacidad = (userData as any).vehiculoCapacidad || null;
        await this.repo.save(existing);
      }
    }
    console.log('✅ Usuarios semilla verificados/sembrados exitosamente en PostgreSQL (tabla users)');
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
    const rolInfo = ROLE_MAP[data.rol] || ROLE_MAP[UserRole.BRIGADISTA];

    const entity = this.repo.create({
      id: newId,
      email: data.email.toLowerCase(),
      password: data.password || '123456',
      nombre: data.nombre,
      role: { id: rolInfo.id } as RoleOrmEntity,
      campamentoAsignado: data.campamentoAsignado || null,
      vehiculoTipo: data.vehiculoTipo || null,
      vehiculoCapacidad: data.vehiculoCapacidad || null,
    });

    const saved = await this.repo.save(entity);
    const reloaded = await this.repo.findOne({ where: { id: saved.id } });
    return reloaded ? reloaded.toDomain() : saved.toDomain();
  }

  async delete(id: string): Promise<boolean> {
    const res = await this.repo.delete(id);
    return (res.affected || 0) > 0;
  }
}
