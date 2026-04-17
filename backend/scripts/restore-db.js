/* eslint-disable no-console */
const fs = require('node:fs/promises');
const path = require('node:path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

function getArg(name) {
  const item = process.argv.find((arg) => arg.startsWith(`${name}=`));
  return item ? item.slice(name.length + 1) : null;
}

function ensureArray(value, name) {
  if (!Array.isArray(value)) {
    throw new Error(`Invalid backup file. Missing array: ${name}`);
  }
}

async function run() {
  const fileArg = getArg('--file');
  const dryRun = process.argv.includes('--dry-run');

  if (!fileArg) {
    throw new Error('Provide backup file path: --file=/absolute/or/relative/path.json');
  }

  const filePath = path.isAbsolute(fileArg)
    ? fileArg
    : path.join(process.cwd(), fileArg);
  const raw = await fs.readFile(filePath, 'utf8');
  const parsed = JSON.parse(raw);

  if (!parsed || typeof parsed !== 'object' || !parsed.data) {
    throw new Error('Invalid backup file format.');
  }

  const {
    users,
    adminProfiles,
    institutions,
    passengers,
    monthlyFees,
    receipts,
    notifications,
    auditLogs,
  } = parsed.data;

  ensureArray(users, 'users');
  ensureArray(adminProfiles, 'adminProfiles');
  ensureArray(institutions, 'institutions');
  ensureArray(passengers, 'passengers');
  ensureArray(monthlyFees, 'monthlyFees');
  ensureArray(receipts, 'receipts');
  ensureArray(notifications, 'notifications');
  ensureArray(auditLogs, 'auditLogs');

  console.log(`Restore file loaded: ${filePath}`);
  console.log(
    `Counts -> users=${users.length}, adminProfiles=${adminProfiles.length}, institutions=${institutions.length}, passengers=${passengers.length}, fees=${monthlyFees.length}, receipts=${receipts.length}, notifications=${notifications.length}, auditLogs=${auditLogs.length}`,
  );

  if (dryRun) {
    console.log('Dry run completed. No data changed.');
    return;
  }

  await prisma.$transaction(async (tx) => {
    await tx.receipt.deleteMany();
    await tx.notification.deleteMany();
    await tx.auditLog.deleteMany();
    await tx.monthlyFee.deleteMany();
    await tx.passengerProfile.deleteMany();
    await tx.adminProfile.deleteMany();
    await tx.institution.deleteMany();
    await tx.user.deleteMany();

    if (users.length) {
      await tx.user.createMany({ data: users });
    }
    if (adminProfiles.length) {
      await tx.adminProfile.createMany({ data: adminProfiles });
    }
    if (institutions.length) {
      await tx.institution.createMany({ data: institutions });
    }
    if (passengers.length) {
      await tx.passengerProfile.createMany({ data: passengers });
    }
    if (monthlyFees.length) {
      await tx.monthlyFee.createMany({ data: monthlyFees });
    }
    if (receipts.length) {
      await tx.receipt.createMany({ data: receipts });
    }
    if (notifications.length) {
      await tx.notification.createMany({ data: notifications });
    }
    if (auditLogs.length) {
      await tx.auditLog.createMany({ data: auditLogs });
    }
  });

  console.log('Restore completed successfully.');
}

run()
  .catch((error) => {
    console.error('Restore failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
