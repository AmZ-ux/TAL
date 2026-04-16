import { ReceiptStatus } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';

export class ListReceiptsQueryDto {
  @IsOptional()
  @IsEnum(ReceiptStatus)
  status?: ReceiptStatus;
}
