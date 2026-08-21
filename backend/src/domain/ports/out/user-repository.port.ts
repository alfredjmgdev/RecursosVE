import { User, UserRole } from '../../entities/user.entity';

export const USER_REPOSITORY_PORT = 'USER_REPOSITORY_PORT';

export interface UserWithPassword extends User {
  password?: string;
}

export interface CreateUserData {
  email: string;
  password?: string;
  nombre: string;
  rol: UserRole;
  campamentoAsignado?: string;
}

export interface UserRepositoryPort {
  findByEmail(email: string): Promise<User | null>;
  findRawByEmail(email: string): Promise<UserWithPassword | null>;
  findAll(): Promise<User[]>;
  create(data: CreateUserData): Promise<User>;
  delete(id: string): Promise<boolean>;
}
