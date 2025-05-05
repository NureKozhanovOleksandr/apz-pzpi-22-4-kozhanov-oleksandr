const cron = require('node-cron');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

/**
 * @function scheduleBackup
 * @desc Schedules daily MongoDB database backup using mongodump and archives it to a ZIP file
 */
const scheduleBackup = () => {
  cron.schedule('0 0 * * *', () => {
    const backupDir = path.join(__dirname, '../backups');
    const timestamp = Date.now();
    const tempBackupDir = path.join(backupDir, `temp-${timestamp}`);
    const backupFile = path.join(backupDir, `backup-${timestamp}.zip`);

    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir);
    }
    if (!fs.existsSync(tempBackupDir)) {
      fs.mkdirSync(tempBackupDir);
    }

    const command = `mongodump --uri="${process.env.MONGO_URI}" --out="${tempBackupDir}"`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Backup error: ${stderr}`);
        fs.rmSync(tempBackupDir, { recursive: true, force: true });
        return;
      }

      const maxBackups = 7;
      const files = fs.readdirSync(backupDir)
        .filter(file => file.startsWith('backup-') && file.endsWith('.zip'))
        .sort((a, b) => fs.statSync(path.join(backupDir, b)).mtime - fs.statSync(path.join(backupDir, a)).mtime);
      if (files.length > maxBackups) {
        files.slice(maxBackups).forEach(file => fs.unlinkSync(path.join(backupDir, file)));
      }

      const output = fs.createWriteStream(backupFile);
      const archive = archiver('zip', { zlib: { level: 9 } });

      output.on('close', () => {
        fs.rmSync(tempBackupDir, { recursive: true, force: true });
        console.log(`Automatic backup created: ${backupFile}`);
      });

      archive.on('error', (err) => {
        console.error(`Archive error: ${err}`);
        fs.rmSync(tempBackupDir, { recursive: true, force: true });
      });

      archive.pipe(output);
      archive.directory(tempBackupDir, false);
      archive.finalize();
    });
  });

  console.log('Backup scheduler initialized');
};

module.exports = scheduleBackup;