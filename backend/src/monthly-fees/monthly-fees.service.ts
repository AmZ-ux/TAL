import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Status } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ListMonthlyFeesQueryDto } from './dto/list-monthly-fees-query.dto';
import {
  normalizeReferenceMonth,
  resolveMonthlyFeeStatus,
} from './utils/status-logic';

const monthlyFeeSelection = {
  id: true,
  passengerId: true,
  referenceMonth: true,
  amount: true,
  dueDate: true,
  status: true,
  paymentDate: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
  passenger: {
    select: {
      id: true,
      fullName: true,
    },
  },
} satisfies Prisma.MonthlyFeeSelect;

@Injectable()
export class MonthlyFeesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ListMonthlyFeesQueryDto) {
    const normalizedMonth = query.month
      ? normalizeReferenceMonth(query.month)
      : undefined;

    const fees = await this.prisma.monthlyFee.findMany({
      where: {
        ...(query.passengerId ? { passengerId: query.passengerId } : {}),
        ...(normalizedMonth ? { referenceMonth: normalizedMonth } : {}),
      },
      select: monthlyFeeSelection,
      orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
    });

    const now = new Date();
    const updates: Promise<unknown>[] = [];

    const feesWithComputedStatus = fees.map((fee) => {
      const computedStatus = resolveMonthlyFeeStatus(
        fee.dueDate,
        fee.paymentDate,
        now,
      );

      if (computedStatus !== fee.status) {
        updates.push(
          this.prisma.monthlyFee.update({
            where: { id: fee.id },
            data: { status: computedStatus },
          }),
        );
      }

      return {
        ...fee,
        status: computedStatus,
      };
    });

    if (updates.length > 0) {
      await Promise.all(updates);
    }

    if (!query.status) {
      return feesWithComputedStatus;
    }

    return feesWithComputedStatus.filter((fee) => fee.status === query.status);
  }

  async markAsPaid(id: string) {
    const monthlyFee = await this.prisma.monthlyFee.findUnique({
      where: { id },
      select: monthlyFeeSelection,
    });

    if (!monthlyFee) {
      throw new NotFoundException('Monthly fee not found.');
    }

    const currentStatus = resolveMonthlyFeeStatus(
      monthlyFee.dueDate,
      monthlyFee.paymentDate,
    );

    if (currentStatus === Status.PAID || monthlyFee.paymentDate) {
      throw new BadRequestException('Monthly fee is already paid.');
    }

    return this.prisma.monthlyFee.update({
      where: { id },
      data: {
        status: Status.PAID,
        paymentDate: new Date(),
      },
      select: monthlyFeeSelection,
    });
  }
}
