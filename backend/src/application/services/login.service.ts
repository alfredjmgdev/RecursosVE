import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthResult, LoginCommand } from '../../domain/ports/in/login.use-case';
import type { LoginUseCase } from '../../domain/ports/in/login.use-case';
import { USER_REPOSITORY_PORT } from '../../domain/ports/out/user-repository.port';
import type { UserRepositoryPort } from '../../domain/ports/out/user-repository.port';

@Injectable()
export class LoginService implements LoginUseCase {
  constructor(
    @Inject(USER_REPOSITORY_PORT)
    private readonly userRepository: UserRepositoryPort,
  ) {}

  async execute(command: LoginCommand): Promise<AuthResult> {
    const rawUser = await this.userRepository.findRawByEmail(command.email);

    if (!rawUser) {
      throw new UnauthorizedException('Credenciales inválidas. Usuario no encontrado.');
    }

    const expectedPassword = rawUser.password || '123456';

    if (command.password !== expectedPassword) {
      throw new UnauthorizedException('Contraseña incorrecta');
    }

    // Strip password field before returning user domain object
    const { password, ...user } = rawUser;

    const token = `token_recursosve_${user.id}_${Date.now()}`;

    return {
      user,
      token,
    };
  }
}
