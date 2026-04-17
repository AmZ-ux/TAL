import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { NotificationType, Status } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function endOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('pt-BR').format(date);
}

function formatCurrency(value: string) {
  const amount = Number(value);

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number.isNaN(amount) ? 0 : amount);
}

@Injectable()
export class AutomationService {
  private readonly logger = new Logger(AutomationService.name);
  private readonly reminderDaysBefore = Number(process.env.REMINDER_DAYS_BEFORE ?? 3);
  private readonly timezone = process.env.CRON_TIMEZONE ?? 'America/Sao_Paulo';

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  @Cron('0 8 * * *', { timeZone: process.env.CRON_TIMEZONE ?? 'America/Sao_Paulo' })
  async runReminderCron() {
    const result = await this.processReminders();

    this.logger.log(
      `[ReminderCron] done | checked=${result.checked} created=${result.created} skipped=${result.skipped} day=${result.targetDate}`,
    );
  }

  @Cron('0 9 * * *', { timeZone: process.env.CRON_TIMEZONE ?? 'America/Sao_Paulo' })
  async runOverdueChargeCron() {
    const result = await this.processOverdueCharges('cron');

    this.logger.log(
      `[ChargeCron] done | checked=${result.checked} created=${result.created} skipped=${result.skipped} statusUpdates=${result.updatedToOverdue}`,
    );
  }

  async triggerChargesManually() {
    const result = await this.processOverdueCharges('manual');

    this.logger.log(
      `[ChargeManual] done | checked=${result.checked} created=${result.created} skipped=${result.skipped} statusUpdates=${result.updatedToOverdue}`,
    );

    return result;
  }

  private async processReminders() {
    const now = new Date();
    const baseDay = startOfDay(now);
    const targetDate = new Date(baseDay);
    targetDate.setDate(targetDate.getDate() + this.reminderDaysBefore);

    const fees = await this.prisma.monthlyFee.findMany({
      where: {
        paymentDate: null,
        dueDate: {
          gte: startOfDay(targetDate),
          lte: endOfDay(targetDate),
        },
        status: Status.PENDING,
        passenger: {
          userId: {
            not: null,
          },
        },
      },
      select: {
        id: true,
        amount: true,
        dueDate: true,
        referenceMonth: true,
        passenger: {
          select: {
            fullName: true,
            userId: true,
          },
        },
      },
    });

    let created = 0;
    let skipped = 0;

    for (const fee of fees) {
      if (!fee.passenger.userId) {
        skipped += 1;
        continue;
      }

      const response = await this.notificationsService.createIfNotExists({
        userId: fee.passenger.userId,
        type: NotificationType.REMINDER,
        title: 'Payment reminder',
        message: `Your monthly fee ${fee.referenceMonth} (${formatCurrency(String(fee.amount))}) is due on ${formatDate(fee.dueDate)}.`,
      });

      if (response.created) {
        created += 1;
      } else {
        skipped += 1;
      }
    }

    return {
      checked: fees.length,
      created,
      skipped,
      targetDate: formatDate(targetDate),
      reminderDaysBefore: this.reminderDaysBefore,
      timezone: this.timezone,
    };
  }

  private async processOverdueCharges(trigger: 'cron' | 'manual') {
    const today = startOfDay(new Date());

    const fees = await this.prisma.monthlyFee.findMany({
      where: {
        paymentDate: null,
        dueDate: {
          lt: today,
        },
        passenger: {
          userId: {
            not: null,
          },
        },
      },
      select: {
        id: true,
        amount: true,
        dueDate: true,
        referenceMonth: true,
        status: true,
        passenger: {
          select: {
            fullName: true,
            userId: true,
          },
        },
      },
    });

    let created = 0;
    let skipped = 0;
    let updatedToOverdue = 0;

    for (const fee of fees) {
      if (!fee.passenger.userId) {
        skipped += 1;
        continue;
      }

      if (fee.status !== Status.OVERDUE) {
        await this.prisma.monthlyFee.update({
          where: { id: fee.id },
          data: { status: Status.OVERDUE },
        });
        updatedToOverdue += 1;
      }

      const response = await this.notificationsService.createIfNotExists({
        userId: fee.passenger.userId,
        type: NotificationType.CHARGE,
        title: 'Overdue charge notice',
        message: `Monthly fee ${fee.referenceMonth} is overdue since ${formatDate(fee.dueDate)}. Current amount: ${formatCurrency(String(fee.amount))}.`,
      });

      if (response.created) {
        created += 1;
      } else {
        skipped += 1;
      }
    }

    return {
      trigger,
      checked: fees.length,
      created,
      skipped,
      updatedToOverdue,
      timezone: this.timezone,
    };
  }
}
