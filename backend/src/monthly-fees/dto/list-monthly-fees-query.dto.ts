import { Status } from '@prisma/client';
import { IsEnum, IsOptional, IsString, IsUUID, Matches } from 'class-validator';

export class ListMonthlyFeesQueryDto {
  @IsOptional()
  @IsUUID()
  passengerId?: string;

  @IsOptional()
  @IsString()
  @Matches(/^(\d{4}-\d{2}|\d{2}\/\d{4})$/, {
    message: 'month must be in YYYY-MM or MM/YYYY format.',
  })
  month?: string;

  @IsOptional()
  @IsEnum(Status)
  status?: Status;
}
