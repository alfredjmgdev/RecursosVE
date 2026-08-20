import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ResourceCategory } from '../../../../../domain/entities/report.entity';

export class GeoLocationDto {
  @IsNumber()
  lat: number;

  @IsNumber()
  lng: number;

  @IsString()
  campamento: string;

  @IsOptional()
  @IsString()
  infrastructureId?: string;

  @IsOptional()
  @IsString()
  infrastructureType?: 'CAMPAMENTO' | 'ACOPIO';
}

export class ResourceDetailDto {
  @IsEnum(ResourceCategory)
  categoria: ResourceCategory;

  @IsString()
  item: string;

  @IsNumber()
  cantidadRequerida: number;

  @IsString()
  unidad: string;
}

export class UrgencyMetadataDto {
  @IsBoolean()
  poblacionVulnerable: boolean;

  @IsNumber()
  horasSinCobertura: number;

  @IsNumber()
  confirmacionesLocales: number;

  @IsOptional()
  @IsNumber()
  donacionesEnTransito?: number;

  @IsOptional()
  @IsNumber()
  volumenPoblacionNormalizado?: number;
}

export class CreateReportDto {
  @IsString()
  tipo: string;

  @ValidateNested()
  @Type(() => GeoLocationDto)
  zona: GeoLocationDto;

  @ValidateNested()
  @Type(() => ResourceDetailDto)
  recurso: ResourceDetailDto;

  @ValidateNested()
  @Type(() => UrgencyMetadataDto)
  metadataUrgencia: UrgencyMetadataDto;
}
