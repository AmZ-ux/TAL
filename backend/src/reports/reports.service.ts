import { Injectable } from '@nestjs/common';
import { Prisma, Status } from '@prisma/client';
import { normalizeReferenceMonth } from '../monthly-fees/utils/status-logic';
import { PrismaService } from '../prisma/prisma.service';
import { MonthlyReportQueryDto } from './dto/monthly-report-query.dto';
import { buildMonthlyCsvReport } from './utils/csv-report';
import { buildMonthlyPdfReport } from './utils/pdf-report';

const monthlyFeeSelection = {
  id: true,
  referenceMonth: true,
  amount: true,
  dueDate: true,
  status: true,
  passenger: {
    select: {
      fullName: true,
    },
  },
} satisfies Prisma.MonthlyFeeSelect;

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('pt-BR').format(date);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async buildMonthlyPdf(query: MonthlyReportQueryDto) {
    const report = await this.getMonthlyReportData(query);

    const buffer = buildMonthlyPdfReport({
      generatedAt: formatDate(new Date()),
      monthFilter: report.monthFilter ?? 'All',
      totalRecords: report.totalRecords,
      totalAmount: formatCurrency(report.totals.total),
      paidAmount: formatCurrency(report.totals.paid),
      pendingAmount: formatCurrency(report.totals.pending),
      overdueAmount: formatCurrency(report.totals.overdue),
      rows: report.rows.map((row) => ({
        passenger: row.passenger,
        amount: formatCurrency(row.amount),
        status: row.status,
        dueDate: formatDate(row.dueDate),
      })),
    });

    return {
      filename: `monthly-report-${report.monthFilter ?? 'all'}.pdf`,
      contentType: 'application/pdf',
      buffer,
    };
  }

  async buildMonthlyCsv(query: MonthlyReportQueryDto) {
    const report = await this.getMonthlyReportData(query);

    const csv = buildMonthlyCsvReport(
      report.rows.map((row) => ({
        passenger: row.passenger,
        amount: formatCurrency(row.amount),
        status: row.status,
        dueDate: formatDate(row.dueDate),
      })),
    );

    return {
      filename: `monthly-report-${report.monthFilter ?? 'all'}.csv`,
      contentType: 'text/csv; charset=utf-8',
      csv,
    };
  }

  private async getMonthlyReportData(query: MonthlyReportQueryDto) {
    const normalizedMonth = query.month
      ? normalizeReferenceMonth(query.month)
      : undefined;

    const fees = await this.prisma.monthlyFee.findMany({
      where: {
        ...(normalizedMonth ? { referenceMonth: normalizedMonth } : {}),
      },
      select: monthlyFeeSelection,
      orderBy: [{ referenceMonth: 'asc' }, { dueDate: 'asc' }],
    });

    const rows = fees.map((fee) => ({
      passenger: fee.passenger.fullName,
      amount: Number(fee.amount),
      status: fee.status,
      dueDate: fee.dueDate,
    }));

    const totals = rows.reduce(
      (acc, row) => {
        acc.total += row.amount;
        if (row.status === Status.PAID) {
          acc.paid += row.amount;
        }
        if (row.status === Status.PENDING) {
          acc.pending += row.amount;
        }
        if (row.status === Status.OVERDUE) {
          acc.overdue += row.amount;
        }
        return acc;
      },
      {
        total: 0,
        paid: 0,
        pending: 0,
        overdue: 0,
      },
    );

    return {
      monthFilter: normalizedMonth,
      totalRecords: rows.length,
      rows,
      totals,
    };
  }
}
