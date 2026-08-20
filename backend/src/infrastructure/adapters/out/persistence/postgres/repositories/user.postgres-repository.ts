import { Injectable } from '@nestjs/common';
import { UserRepositoryPort } from '../../../../../../domain/ports/out/user-repository.port';
import { User, UserRole } from '../../../../../../domain/entities/user.entity';

@Injectable()
export class UserInMemoryRepository implements UserRepositoryPort {
  private readonly users: User[] = [
    new User('usr_coord_1', 'coordinador@recursosve.org', 'Juan P.', UserRole.COORDINADOR, 'Campamento La Guaira #12'),
    new User('usr_brig_2', 'brigadista@recursosve.org', 'Pedro R.', UserRole.BRIGADISTA, 'Depósito Las Flores'),
    new User('usr_donante_3', 'donante@recursosve.org', 'ONG Farmacéuticos Solidarios', UserRole.DONANTE),
  ];

  async findByEmail(email: string): Promise<User | null> {
    const found = this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    return found ?? null;
  }
}
