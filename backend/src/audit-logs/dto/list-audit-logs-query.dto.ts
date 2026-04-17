import { IsDateString, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class ListAuditLogsQueryDto {
  @IsOptional()
  @IsUUID()
  user?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  action?: string;

  @IsOptional()
  @IsDateString()
  date?: string;
}
