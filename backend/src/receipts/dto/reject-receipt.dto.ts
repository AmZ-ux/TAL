import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class RejectReceiptDto {
  @IsString()
  @MinLength(3)
  @MaxLength(500)
  rejectionReason: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  adminNotes?: string;
}
