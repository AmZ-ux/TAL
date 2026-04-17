import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { AdminModule } from './admin/admin.module';
import { InstitutionsModule } from './institutions/institutions.module';
import { PassengersModule } from './passengers/passengers.module';
import { MonthlyFeesModule } from './monthly-fees/monthly-fees.module';
import { ReceiptsModule } from './receipts/receipts.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AutomationModule } from './automation/automation.module';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    UsersModule,
    HealthModule,
    AdminModule,
    InstitutionsModule,
    PassengersModule,
    MonthlyFeesModule,
    ReceiptsModule,
    NotificationsModule,
    AutomationModule,
    ReportsModule,
  ],
})
export class AppModule {}
