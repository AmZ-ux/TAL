import { Module } from '@nestjs/common';
import { MonthlyFeesController } from './monthly-fees.controller';
import { MonthlyFeesService } from './monthly-fees.service';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';

@Module({
  imports: [AuditLogsModule],
  controllers: [MonthlyFeesController],
  providers: [MonthlyFeesService],
})
export class MonthlyFeesModule {}
