/* eslint-disable no-console */
const fs = require('node:fs/promises');
const path = require('node:path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function run() {
  const backupDir = process.env.BACKUP_DIR || path.join(process.cwd(), 'backups');
  const now = new Date();
  const stamp = now.toISOString().replace(/[:.]/g, '-');
  const filePath = path.join(backupDir, `transport-backup-manual-${stamp}.json`);

  const [users, adminProfiles, institutions, passengers, monthlyFees, receipts, notifications, auditLogs] =
    await Promise.all([
      prisma.user.findMany(),
      prisma.adminProfile.findMany(),
      prisma.institution.findMany(),
      prisma.passengerProfile.findMany(),
      prisma.monthlyFee.findMany(),
      prisma.receipt.findMany(),
      prisma.notification.findMany(),
      prisma.auditLog.findMany(),
    ]);

  const payload = {
    meta: {
      generatedAt: now.toISOString(),
      mode: 'manual-script',
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

  await fs.mkdir(backupDir, { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(payload, null, 2), 'utf8');

  console.log(`Backup created: ${filePath}`);
  console.log(
    `Counts -> users=${users.length}, adminProfiles=${adminProfiles.length}, institutions=${institutions.length}, passengers=${passengers.length}, fees=${monthlyFees.length}, receipts=${receipts.length}, notifications=${notifications.length}, auditLogs=${auditLogs.length}`,
  );
}

run()
  .catch((error) => {
    console.error('Backup failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
