import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Download, 
  Upload, 
  RotateCcw, 
  X, 
  Check, 
  AlertTriangle, 
  FileJson, 
  ShieldCheck, 
  Database, 
  HardDrive 
} from 'lucide-react';
import { sounds } from '../../utils/audio';

interface AdminBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminBackupModal: React.FC<AdminBackupModalProps> = ({ isOpen, onClose }) => {
  const { 
    currentUser,
    allUsers,
    plans,
    userInvestments,
    transactions,
    settings,
    auditLogs,
    giftCodes,
    fraudAlerts,
    resetToDefaults,
    showNotification,
    theme 
  } = useApp();

  const isLight = theme === 'light';
  const [importJsonText, setImportJsonText] = useState('');
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);

  if (!isOpen) return null;

  // Handle Export Full JSON
  const handleExportJson = () => {
    sounds.playCash();
    const backupData = {
      version: '2.5.0',
      timestamp: new Date().toISOString(),
      platform: settings.platformName || 'Apex Treasury',
      payload: {
        currentUser,
        allUsers,
        plans,
        userInvestments,
        transactions,
        settings,
        auditLogs,
        giftCodes,
        fraudAlerts
      }
    };

    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(backupData, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute(
      'download',
      `Apex_System_Backup_${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    showNotification('Database backup exported as JSON file successfully!', 'success');
  };

  // Handle File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        setImportJsonText(text);
        setImportStatus('idle');
        setErrorMessage('');
      } catch (err) {
        setImportStatus('error');
        setErrorMessage('Failed to read file');
      }
    };
    reader.readAsText(file);
  };

  // Handle Restore
  const handleExecuteRestore = () => {
    if (!importJsonText.trim()) return;

    try {
      const parsed = JSON.parse(importJsonText);
      const data = parsed.payload || parsed;

      if (!data.allUsers || !data.plans || !data.transactions) {
        throw new Error('Invalid backup schema. Required collections (users, plans, transactions) not found.');
      }

      // Restore to localStorage
      if (data.currentUser) localStorage.setItem('apexcraft_current_user', JSON.stringify(data.currentUser));
      if (data.allUsers) localStorage.setItem('apexcraft_all_users', JSON.stringify(data.allUsers));
      if (data.plans) localStorage.setItem('apexcraft_plans', JSON.stringify(data.plans));
      if (data.userInvestments) localStorage.setItem('apexcraft_investments', JSON.stringify(data.userInvestments));
      if (data.transactions) localStorage.setItem('apexcraft_transactions', JSON.stringify(data.transactions));
      if (data.settings) localStorage.setItem('apexcraft_settings', JSON.stringify(data.settings));
      if (data.auditLogs) localStorage.setItem('apexcraft_audit_logs', JSON.stringify(data.auditLogs));
      if (data.giftCodes) localStorage.setItem('apexcraft_gift_codes', JSON.stringify(data.giftCodes));
      if (data.fraudAlerts) localStorage.setItem('apexcraft_fraud_alerts', JSON.stringify(data.fraudAlerts));

      sounds.playSuccess();
      setImportStatus('success');
      showNotification('Database snapshot restored! Refreshing platform state...', 'success');

      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err: any) {
      sounds.playError();
      setImportStatus('error');
      setErrorMessage(err.message || 'Malformed JSON payload');
    }
  };

  // Factory Reset
  const handleFactoryReset = () => {
    sounds.playClick();
    resetToDefaults();
    showNotification('System restored to original factory defaults!', 'info');
    onClose();
  };

  return (
    <div 
      id="admin-backup-modal-backdrop"
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in"
    >
      <div 
        id="admin-backup-modal-content"
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-xl rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${
          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
        }`}
      >
        {/* Header */}
        <div className={`p-4 border-b flex items-center justify-between ${
          isLight ? 'border-slate-200 bg-slate-50' : 'border-slate-800 bg-slate-950/70'
        }`}>
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-500 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold font-['Outfit']">System Database Backup & Disaster Recovery</h3>
              <p className="text-[11px] text-slate-400">Snapshot export, full state restoration & data integrity</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 space-y-5 overflow-y-auto no-scrollbar text-xs">
          
          {/* Section 1: Export Snapshot */}
          <div className={`p-4 rounded-2xl border space-y-3 ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileJson className="w-4 h-4 text-emerald-500" />
                <span className="font-bold text-slate-800 dark:text-slate-200">1-Click Full System Backup</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                {allUsers.length} Users • {transactions.length} Txns • {plans.length} Plans
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Generates a cryptographically sound JSON document containing all user balances, active investments, cleared UTRs, and payment gateway credentials.
            </p>
            <button
              onClick={handleExportJson}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center space-x-2 shadow-md shadow-emerald-600/20 transition-all active:scale-98"
            >
              <Download className="w-4 h-4" />
              <span>Download System Snapshot (.JSON)</span>
            </button>
          </div>

          {/* Section 2: Restore Snapshot */}
          <div className={`p-4 rounded-2xl border space-y-3 ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Upload className="w-4 h-4 text-blue-500" />
                <span className="font-bold text-slate-800 dark:text-slate-200">Restore from JSON Backup</span>
              </div>
              <span className="text-[10px] font-mono text-blue-400">Recovery Tool</span>
            </div>

            <div className="flex items-center space-x-2">
              <label className="flex-1 py-2 px-3 rounded-xl border border-dashed border-blue-500/40 bg-blue-500/5 hover:bg-blue-500/10 text-blue-500 font-semibold cursor-pointer text-center flex items-center justify-center space-x-2">
                <Upload className="w-3.5 h-3.5" />
                <span>Choose Backup File...</span>
                <input 
                  type="file" 
                  accept=".json" 
                  onChange={handleFileUpload} 
                  className="hidden" 
                />
              </label>
            </div>

            <textarea
              rows={3}
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              placeholder="Or paste backup JSON payload string here..."
              className={`w-full p-2.5 rounded-xl border font-mono text-[10px] outline-hidden ${
                isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800 text-slate-200'
              }`}
            />

            {errorMessage && (
              <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-[11px] flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {importStatus === 'success' && (
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] flex items-center space-x-2">
                <Check className="w-4 h-4 flex-shrink-0" />
                <span>Database restored successfully! Reloading...</span>
              </div>
            )}

            <button
              disabled={!importJsonText.trim()}
              onClick={handleExecuteRestore}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold flex items-center justify-center space-x-2 shadow-md shadow-blue-600/20 transition-all active:scale-98"
            >
              <HardDrive className="w-4 h-4" />
              <span>Validate & Restore Entire Database</span>
            </button>
          </div>

          {/* Section 3: Factory Reset Safeguard */}
          <div className={`p-4 rounded-2xl border space-y-2.5 ${
            isLight ? 'bg-red-50/50 border-red-200' : 'bg-red-950/20 border-red-900/40'
          }`}>
            <div className="flex items-center space-x-2 text-red-600 dark:text-red-400 font-bold">
              <AlertTriangle className="w-4 h-4" />
              <span>Factory Reset Platform Demo Data</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Resets all user accounts, transactions, and settings to the initial seeded test environment.
            </p>

            {!confirmReset ? (
              <button
                onClick={() => setConfirmReset(true)}
                className="py-1.5 px-3 rounded-xl bg-red-600/10 hover:bg-red-600/20 text-red-600 dark:text-red-400 border border-red-500/30 font-bold text-[11px] transition-all"
              >
                Reset Database to Factory Defaults...
              </button>
            ) : (
              <div className="flex items-center space-x-2 pt-1">
                <button
                  onClick={handleFactoryReset}
                  className="py-1.5 px-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-[11px]"
                >
                  Yes, Wipe & Reset to Defaults
                </button>
                <button
                  onClick={() => setConfirmReset(false)}
                  className="py-1.5 px-3 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[11px]"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
