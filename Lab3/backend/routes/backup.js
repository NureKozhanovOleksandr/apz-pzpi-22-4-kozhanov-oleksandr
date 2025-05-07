const express = require('express');
const router = express.Router();
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

/**
 * @route GET /api/backup/export
 * @desc Export entire MongoDB database to a ZIP file
 * @access Private (admin)
 */
router.get('/export', authMiddleware, roleMiddleware(['admin']), (req, res) => {
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
      console.error(`Export error: ${stderr}`);
      fs.rmSync(tempBackupDir, { recursive: true, force: true });
      return res.status(500).json({ message: 'Error creating backup', error: stderr });
    }

    const output = fs.createWriteStream(backupFile);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
      fs.rmSync(tempBackupDir, { recursive: true, force: true });
      res.download(backupFile, path.basename(backupFile), (err) => {
        if (err) {
          console.error(`File download error: ${err}`);
          res.status(500).json({ message: 'Error sending the file' });
        }
        fs.unlinkSync(backupFile);
      });
    });

    archive.on('error', (err) => {
      console.error(`Archive error: ${err}`);
      fs.rmSync(tempBackupDir, { recursive: true, force: true });
      res.status(500).json({ message: 'Error creating archive', error: err.message });
    });

    archive.pipe(output);
    archive.directory(tempBackupDir, false);
    archive.finalize();
  });
});

/**
 * @route POST /api/backup/import
 * @desc Import data from a directory into the MongoDB database
 * @access Private (admin)
 */
router.post('/import', authMiddleware, roleMiddleware(['admin']), (req, res) => {
  const { dirPath } = req.body;

  if (!dirPath || !fs.existsSync(dirPath)) {
    return res.status(400).json({ message: 'Directory not found or not specified' });
  }

  const command = `mongorestore --uri="${process.env.MONGO_URI}" --dir="${dirPath}" --drop`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Import error: ${stderr}`);
      return res.status(500).json({ message: 'Error importing data', error: stderr });
    }
    res.status(200).json({ message: 'Data successfully imported' });
  });
});

module.exports = router;