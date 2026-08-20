import { IsDateString, IsEnum, IsNumber, IsString } from 'class-validator';
import { ResourceCategory } from '../../../../../domain/entities/report.entity';

export class CreateDonationDto {
  @IsString()
  donanteNombre: string;

  @IsEnum(ResourceCategory)
  categoria: ResourceCategory;

  @IsString()
  item: string;

  @IsNumber()
  cantidad: number;

  @IsString()
  unidad: string;

  @IsString()
  origenUbicacion: string;

  @IsDateString()
  fechaDisponible: Date;
}
