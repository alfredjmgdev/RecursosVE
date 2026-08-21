import { Controller, Get, Post, Delete, Body, Param, Inject, BadRequestException, NotFoundException } from '@nestjs/common';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { USER_REPOSITORY_PORT, UserRepositoryPort } from '../../../../domain/ports/out/user-repository.port';
import { UserRole } from '../../../../domain/entities/user.entity';

export class CreateUserDto {
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  @IsNotEmpty({ message: 'El correo electrónico es requerido' })
  email!: string;

  @IsString()
  @IsOptional()
  password?: string;

  @IsString()
  @IsNotEmpty({ message: 'El nombre es requerido' })
  nombre!: string;

  @IsEnum(UserRole, { message: 'Rol de usuario inválido' })
  @IsNotEmpty({ message: 'El rol es requerido' })
  rol!: UserRole;

  @IsString()
  @IsOptional()
  campamentoAsignado?: string;

  @IsString()
  @IsOptional()
  vehiculoTipo?: string;

  @IsString()
  @IsOptional()
  vehiculoCapacidad?: string;
}

@Controller('users')
export class UsersController {
  constructor(
    @Inject(USER_REPOSITORY_PORT)
    private readonly userRepo: any,
  ) {}

  @Get()
  async getAllUsers() {
    return await this.userRepo.findAll();
  }

  @Post()
  async createUser(@Body() dto: CreateUserDto) {
    const existing = await this.userRepo.findByEmail(dto.email);
    if (existing) {
      throw new BadRequestException('Ya existe un usuario registrado con este correo electrónico.');
    }

    return await this.userRepo.create({
      email: dto.email,
      password: dto.password || '123456',
      nombre: dto.nombre,
      rol: dto.rol,
      campamentoAsignado: dto.campamentoAsignado,
      vehiculoTipo: dto.vehiculoTipo,
      vehiculoCapacidad: dto.vehiculoCapacidad,
    });
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    const success = await this.userRepo.delete(id);
    if (!success) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado.`);
    }
    return { success: true, message: 'Usuario eliminado exitosamente' };
  }
}
