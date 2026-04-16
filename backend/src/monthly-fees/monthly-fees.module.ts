import { Module } from '@nestjs/common';
import { MonthlyFeesController } from './monthly-fees.controller';
import { MonthlyFeesService } from './monthly-fees.service';

@Module({
  controllers: [MonthlyFeesController],
  providers: [MonthlyFeesService],
})
export class MonthlyFeesModule {}
