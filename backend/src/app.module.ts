import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { AdminModule } from './admin/admin.module';
import { InstitutionsModule } from './institutions/institutions.module';
import { PassengersModule } from './passengers/passengers.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    HealthModule,
    AdminModule,
    InstitutionsModule,
    PassengersModule,
  ],
})
export class AppModule {}
