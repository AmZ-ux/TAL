import { PassengerStatus } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdatePassengerDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  fullName?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(30)
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsUUID()
  institutionId?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  course?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(40)
  shift?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  boardingPoint?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;

  @IsOptional()
  @IsEnum(PassengerStatus)
  status?: PassengerStatus;
}
