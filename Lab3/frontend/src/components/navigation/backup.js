import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../configs/api';
import { useNavigate } from 'react-router-dom';

const BackupManager = () => {
  const { t } = useTranslation();
  const [notification, setNotification] = useState({ isOpen: false, message: '' });
  const [importPath, setImportPath] = useState('');
    const navigate = useNavigate();

  const handleExportBackup = async () => {
    try {
      const response = await api.get('/backup/export', {
        responseType: 'blob',
      });

      if (response.status === 200) {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', response.headers['content-disposition']?.split('filename="')[1]?.split('"')[0] || 'backup.zip');
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        setNotification({ isOpen: true, message: t('backup.exportSuccess') });
      }
    } catch (error) {
      console.error('Error exporting backup:', error);
      setNotification({ isOpen: true, message: t('backup.exportFailed') });
    }
  };

  const handleImportBackup = async () => {
    try {
      const response = await api.post(
        '/backup/import',
        { dirPath: importPath },
      );
      if (response.status === 200) {
        setNotification({ isOpen: true, message: t('backup.importSuccess') });        
        setImportPath('');
        setTimeout(() => {
          navigate('/');
        }, 1300);
      }
    } catch (error) {
      console.error('Error importing backup:', error);
      setNotification({ isOpen: true, message: t('backup.importFailed') });
    }
  };

  return (
    <div>
      <h2>{t('backup.title')}</h2>
      <button onClick={handleExportBackup}>{t('backup.export')}</button>
      <div style={{ margin: '10px 0' }}>
        <input
          type="text"
          value={importPath}
          onChange={(e) => setImportPath(e.target.value)}
          placeholder={t('backup.enterPath')}
          style={{ marginRight: '10px' }}
        />
        <button onClick={handleImportBackup} disabled={!importPath}>
          {t('backup.import')}
        </button>
      </div>
      {notification.isOpen && (
        <p style={{ color: notification.message.includes('Failed') ? 'red' : 'green' }}>
          {notification.message}
        </p>
      )}
    </div>
  );
};

export default BackupManager;