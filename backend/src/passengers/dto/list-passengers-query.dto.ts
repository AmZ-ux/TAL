import { PassengerStatus } from '@prisma/client';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class ListPassengersQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;

  @IsOptional()
  @IsEnum(PassengerStatus)
  status?: PassengerStatus;

  @IsOptional()
  @IsUUID()
  institutionId?: string;
}
