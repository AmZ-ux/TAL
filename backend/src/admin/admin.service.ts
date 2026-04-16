import { Injectable } from '@nestjs/common';
import { PassengerStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardSummary() {
    const [totalPassengers, paid, pending, overdue] = await Promise.all([
      this.prisma.passengerProfile.count(),
      this.prisma.passengerProfile.count({
        where: { status: PassengerStatus.PAID },
      }),
      this.prisma.passengerProfile.count({
        where: { status: PassengerStatus.PENDING },
      }),
      this.prisma.passengerProfile.count({
        where: { status: PassengerStatus.OVERDUE },
      }),
    ]);

    return {
      totalPassengers,
      paid,
      pending,
      overdue,
    };
  }
}
