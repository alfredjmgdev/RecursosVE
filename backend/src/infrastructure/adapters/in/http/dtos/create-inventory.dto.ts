import { IsEnum, IsNumber, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { GeoLocationDto } from './create-report.dto';
import { ResourceCategory } from '../../../../../domain/entities/report.entity';

export class CreateInventoryDto {
  @ValidateNested()
  @Type(() => GeoLocationDto)
  ubicacion: GeoLocationDto;

  @IsEnum(ResourceCategory)
  categoria: ResourceCategory;

  @IsString()
  item: string;

  @IsNumber()
  cantidadDisponible: number;

  @IsString()
  unidad: string;

  @IsString()
  contacto: string;
}
