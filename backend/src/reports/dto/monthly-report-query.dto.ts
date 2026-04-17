import { IsOptional, IsString, Matches } from 'class-validator';

export class MonthlyReportQueryDto {
  @IsOptional()
  @IsString()
  @Matches(/^(\d{4}-\d{2}|\d{2}\/\d{4})$/, {
    message: 'month must be in YYYY-MM or MM/YYYY format.',
  })
  month?: string;
}
