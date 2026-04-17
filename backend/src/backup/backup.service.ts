import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { PrismaService } from '../prisma/prisma.service';

type BackupSummary = {
  filePath: string;
  createdAt: string;
  counts: Record<string, number>;
};

@Injectable()
export class BackupService {
  private readonly logger = new Logger(BackupService.name);
  private readonly backupDir =
    process.env.BACKUP_DIR ?? join(process.cwd(), 'backups');
  private readonly timezone = process.env.CRON_TIMEZONE ?? 'America/Sao_Paulo';

  constructor(private readonly prisma: PrismaService) {}

  @Cron('30 2 * * *', { timeZone: process.env.CRON_TIMEZONE ?? 'America/Sao_Paulo' })
  async runDailyBackup() {
    const summary = await this.createBackup('auto');
    this.logger.log(
      `[DailyBackup] done | file=${summary.filePath} users=${summary.counts.users} fees=${summary.counts.monthlyFees} receipts=${summary.counts.receipts}`,
    );
  }

  async createBackup(mode: 'auto' | 'manual' = 'manual'): Promise<BackupSummary> {
    const now = new Date();
    const stamp = now.toISOString().replace(/[:.]/g, '-');
    const fileName = `transport-backup-${mode}-${stamp}.json`;
    const filePath = join(this.backupDir, fileName);

    const [users, adminProfiles, institutions, passengers, monthlyFees, receipts, notifications, auditLogs] =
      await Promise.all([
        this.prisma.user.findMany(),
        this.prisma.adminProfile.findMany(),
        this.prisma.institution.findMany(),
        this.prisma.passengerProfile.findMany(),
        this.prisma.monthlyFee.findMany(),
        this.prisma.receipt.findMany(),
        this.prisma.notification.findMany(),
        this.prisma.auditLog.findMany(),
      ]);

    const payload = {
      meta: {
        generatedAt: now.toISOString(),
        timezone: this.timezone,
        mode,
      },
      data: {
        users,
        adminProfiles,
        institutions,
        passengers,
        monthlyFees,
        receipts,
        notifications,
        auditLogs,
      },
    };

    await mkdir(this.backupDir, { recursive: true });
    await writeFile(filePath, JSON.stringify(payload, null, 2), 'utf8');

    return {
      filePath,
      createdAt: now.toISOString(),
      counts: {
        users: users.length,
        adminProfiles: adminProfiles.length,
        institutions: institutions.length,
        passengers: passengers.length,
        monthlyFees: monthlyFees.length,
        receipts: receipts.length,
        notifications: notifications.length,
        auditLogs: auditLogs.length,
      },
    };
  }
}
