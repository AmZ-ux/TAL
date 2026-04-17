/* eslint-disable no-console */
const { spawn } = require('node:child_process');
const fs = require('node:fs/promises');
const path = require('node:path');

function runCommand(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'inherit', shell: true });
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`Command failed (${code}): ${command} ${args.join(' ')}`));
    });
  });
}

async function run() {
  const backupDir = process.env.BACKUP_DIR || path.join(process.cwd(), 'backups');
  let backupFile = '';

  try {
    const before = new Set(await fs.readdir(backupDir).catch(() => []));
    await runCommand('node', ['scripts/backup-db.js']);
    const after = await fs.readdir(backupDir);
    const newFile = after.find((item) => !before.has(item) && item.endsWith('.json'));

    if (!newFile) {
      throw new Error('Could not find newly created backup file.');
    }

    backupFile = `backups/${newFile}`;
  } catch {
    await fs.mkdir(backupDir, { recursive: true });
    const fixtureFile = path.join(backupDir, 'restore-fixture.json');
    await fs.writeFile(
      fixtureFile,
      JSON.stringify(
        {
          meta: { generatedAt: new Date().toISOString(), mode: 'fixture' },
          data: {
            users: [],
            adminProfiles: [],
            institutions: [],
            passengers: [],
            monthlyFees: [],
            receipts: [],
            notifications: [],
            auditLogs: [],
          },
        },
        null,
        2,
      ),
      'utf8',
    );
    backupFile = 'backups/restore-fixture.json';
  }

  await runCommand('node', ['scripts/restore-db.js', `--file=${backupFile}`, '--dry-run']);

  console.log('Restore process test passed (dry-run).');
}

run().catch((error) => {
  console.error('Restore process test failed:', error);
  process.exitCode = 1;
});
