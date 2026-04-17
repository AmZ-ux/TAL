import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Role, Status } from '@prisma/client';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
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
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async findAll(query: ListMonthlyFeesQueryDto, user: JwtPayload) {
    const normalizedMonth = query.month
      ? normalizeReferenceMonth(query.month)
      : undefined;

    const fees = await this.prisma.monthlyFee.findMany({
      where: {
        ...(query.passengerId ? { passengerId: query.passengerId } : {}),
        ...(normalizedMonth ? { referenceMonth: normalizedMonth } : {}),
        ...(user.role === Role.PASSENGER
          ? {
              passenger: {
                userId: user.sub,
              },
            }
          : {}),
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

  async markAsPaid(id: string, actorId: string) {
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

    const updated = await this.prisma.monthlyFee.update({
      where: { id },
      data: {
        status: Status.PAID,
        paymentDate: new Date(),
      },
      select: monthlyFeeSelection,
    });

    await this.auditLogsService.createLog({
      actorId,
      action: 'MONTHLY_FEE_MARKED_PAID',
      entity: 'MonthlyFee',
      entityId: updated.id,
      payload: {
        passengerId: updated.passengerId,
        referenceMonth: updated.referenceMonth,
        status: updated.status,
        paymentDate: updated.paymentDate?.toISOString() ?? null,
      },
    });

    return updated;
  }
}
