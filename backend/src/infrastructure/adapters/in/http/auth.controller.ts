import { Body, Controller, Inject, Post } from '@nestjs/common';
import { LOGIN_USE_CASE } from '../../../../domain/ports/in/login.use-case';
import type { LoginUseCase } from '../../../../domain/ports/in/login.use-case';

export class LoginDto {
  email!: string;
  password!: string;
}

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(LOGIN_USE_CASE)
    private readonly loginUseCase: LoginUseCase,
  ) {}

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.loginUseCase.execute(dto);
  }
}
