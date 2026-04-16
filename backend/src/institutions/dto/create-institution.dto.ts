import { InstitutionStatus } from '@prisma/client';
import {
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateInstitutionDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name: string;

  @IsOptional()
  @IsEnum(InstitutionStatus)
  status?: InstitutionStatus;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
