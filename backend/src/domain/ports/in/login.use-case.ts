import { User } from '../../entities/user.entity';

export interface LoginCommand {
  email: string;
  password: string;
}

export interface AuthResult {
  user: User;
  token: string;
}

export const LOGIN_USE_CASE = 'LOGIN_USE_CASE';

export interface LoginUseCase {
  execute(command: LoginCommand): Promise<AuthResult>;
}
