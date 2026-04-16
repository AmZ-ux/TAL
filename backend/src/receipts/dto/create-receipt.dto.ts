import { IsIn, IsString, IsUUID, MaxLength } from 'class-validator';

const allowedFileTypes = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'application/pdf',
] as const;

export class CreateReceiptDto {
  @IsUUID()
  monthlyFeeId: string;

  @IsString()
  @MaxLength(10_000_000)
  fileUrl: string;

  @IsString()
  @IsIn(allowedFileTypes)
  fileType: string;
}
