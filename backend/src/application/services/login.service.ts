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
    const user = await this.userRepository.findByEmail(command.email);

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas. Usuario no encontrado.');
    }

    // Simple password check for demo MVP
    const validPasswordMap: Record<string, string> = {
      'coordinador@recursosve.org': 'coord123',
      'brigadista@recursosve.org': 'briga123',
      'donante@recursosve.org': 'donant123',
      'transportista@recursosve.org': 'driver123',
      'transportista@recursos.ve': 'driver123',
    };

    const expectedPassword = validPasswordMap[command.email.toLowerCase()] ?? '123456';

    if (command.password !== expectedPassword) {
      throw new UnauthorizedException('Contraseña incorrecta');
    }

    const token = `token_recursosve_${user.id}_${Date.now()}`;

    return {
      user,
      token,
    };
  }
}
