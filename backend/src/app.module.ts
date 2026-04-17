import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
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
import { AuditLogsModule } from './audit-logs/audit-logs.module';
import { BackupModule } from './backup/backup.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          name: 'default',
          ttl: 60000,
          limit: 120,
        },
      ],
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
    AuditLogsModule,
    BackupModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
