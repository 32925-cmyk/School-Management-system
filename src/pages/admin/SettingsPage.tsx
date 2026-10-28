/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Download,
  Upload,
  RotateCcw,
  Shield,
  Activity,
  CheckCircle2,
  Save,
  Building,
  DollarSign,
  AlertTriangle,
} from 'lucide-react';
import {
  getSystemSettings,
  updateSystemSettings,
  getAuditLogs,
  exportDatabaseBackup,
  importDatabaseBackup,
  resetDatabase,
} from '../../services/api';
import { SystemSettings, AuditLogEntry } from '../../types';
import { formatDate } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { DownloadProjectModal } from '../../components/modals/DownloadProjectModal';

export const SettingsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { showSuccess, showError, showWarning } = useToast();

  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'profile' | 'fees' | 'backup' | 'audit'>('profile');
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const [s, a] = await Promise.all([getSystemSettings(), getAuditLogs()]);
    setSettings(s);
    setAuditLogs(a);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings || !currentUser) return;
    setIsSaving(true);
    try {
      await updateSystemSettings(settings, currentUser);
      showSuccess('Settings Updated', 'Institutional configuration persisted.');
    } catch (err: any) {
      showError('Error', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportBackup = async () => {
    try {
      const json = await exportDatabaseBackup();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `AurelianHeights_Backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showSuccess('Backup Downloaded', 'Exported full JSON snapshot of institutional database.');
    } catch (err: any) {
      showError('Export Failed', err.message);
    }
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const text = evt.target?.result as string;
        await importDatabaseBackup(text, currentUser);
        showSuccess('Restoration Complete', 'Restored institutional database from backup file.');
        loadSettings();
      } catch (err: any) {
        showError('Restoration Failed', err.message);
      }
    };
    reader.readAsText(file);
  };

  const handleResetDemo = async () => {
    if (
      !window.confirm(
        'Are you sure you want to reset all database records back to original pre-seeded demo state? All newly created students and payments will be refreshed.'
      )
    ) {
      return;
    }

    try {
      await resetDatabase();
      showSuccess('Demo Data Reset', 'Restored pristine seed database with 60 students and 12 faculty.');
      window.location.reload();
    } catch (err: any) {
      showError('Reset Error', err.message);
    }
  };

  if (!settings) {
    return <div className="h-64 rounded-2xl bg-neutral-200 dark:bg-[#121933] animate-pulse" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-['Sora'] text-neutral-900 dark:text-white tracking-tight">
            Institutional Settings & System Configuration
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            School identity parameters, fee surcharge rules, automated data backups, and security audit logs.
          </p>
        </div>

        <button
          onClick={handleResetDemo}
          className="px-4 py-2 text-xs font-semibold rounded-xl border border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset Demo Data</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-neutral-200 dark:border-[#242E56] gap-4">
        {[
          { key: 'profile', label: 'School Profile & Charter', icon: Building },
          { key: 'fees', label: 'Grading & Fee Rules', icon: DollarSign },
          { key: 'backup', label: 'JSON Backup & Restore', icon: Download },
          { key: 'audit', label: `System Audit Log (${auditLogs.length})`, icon: Activity },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
                isActive
                  ? 'border-indigo-600 text-indigo-600 dark:text-teal-400 dark:border-teal-400'
                  : 'border-transparent text-neutral-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. PROFILE TAB */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveSettings} className="p-6 rounded-2xl bg-white dark:bg-[#121933] border border-neutral-200 dark:border-[#242E56] space-y-4 max-w-2xl shadow-xs">
          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold mb-1 text-neutral-700 dark:text-neutral-300">Institution Name</label>
              <input
                type="text"
                required
                value={settings.schoolName}
                onChange={(e) => setSettings({ ...settings, schoolName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-[#242E56] bg-neutral-50 dark:bg-[#0B1020]"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1 text-neutral-700 dark:text-neutral-300">Motto / Tagline</label>
              <input
                type="text"
                required
                value={settings.tagline}
                onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-[#242E56] bg-neutral-50 dark:bg-[#0B1020]"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold mb-1 text-neutral-700 dark:text-neutral-300">Official Email</label>
                <input
                  type="email"
                  required
                  value={settings.email}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-[#242E56] bg-neutral-50 dark:bg-[#0B1020]"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1 text-neutral-700 dark:text-neutral-300">Board PBX Phone</label>
                <input
                  type="text"
                  required
                  value={settings.phone}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-[#242E56] bg-neutral-50 dark:bg-[#0B1020]"
                />
              </div>
            </div>
            <div>
              <label className="block font-semibold mb-1 text-neutral-700 dark:text-neutral-300">Campus Address</label>
              <input
                type="text"
                required
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-[#242E56] bg-neutral-50 dark:bg-[#0B1020]"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1 text-neutral-700 dark:text-neutral-300">Academic Year</label>
              <input
                type="text"
                required
                value={settings.academicYear}
                onChange={(e) => setSettings({ ...settings, academicYear: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-[#242E56] bg-neutral-50 dark:bg-[#0B1020]"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-neutral-100 dark:border-[#1A2347] flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Save Institutional Settings</span>
            </button>
          </div>
        </form>
      )}

      {/* 2. FEES & GRADING TAB */}
      {activeTab === 'fees' && (
        <form onSubmit={handleSaveSettings} className="p-6 rounded-2xl bg-white dark:bg-[#121933] border border-neutral-200 dark:border-[#242E56] space-y-4 max-w-2xl shadow-xs">
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold mb-1 text-neutral-700 dark:text-neutral-300">Late Fee Surcharge (Per Day)</label>
                <input
                  type="number"
                  required
                  value={settings.lateFeePerDay}
                  onChange={(e) => setSettings({ ...settings, lateFeePerDay: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-[#242E56] bg-neutral-50 dark:bg-[#0B1020]"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1 text-neutral-700 dark:text-neutral-300">Attendance Warning Threshold (%)</label>
                <input
                  type="number"
                  required
                  min={50}
                  max={95}
                  value={settings.attendanceWarningThresholdPercent}
                  onChange={(e) => setSettings({ ...settings, attendanceWarningThresholdPercent: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-[#242E56] bg-neutral-50 dark:bg-[#0B1020]"
                />
              </div>
            </div>

            <div className="pt-3">
              <span className="font-semibold block mb-2 text-neutral-700 dark:text-neutral-300">Active Grading Scale</span>
              <div className="space-y-1.5">
                {settings.gradingScale.map((g, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-neutral-50 dark:bg-[#1A2347] flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-indigo-600 dark:text-teal-400">{g.grade}</span>
                    <span>Min Score: {g.minScore}%</span>
                    <span className="font-mono">GPA {g.gpa}</span>
                    <span className="text-neutral-400">{g.description}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-neutral-100 dark:border-[#1A2347] flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Update Parameters</span>
            </button>
          </div>
        </form>
      )}

      {/* 3. BACKUP / RESTORE TAB */}
      {activeTab === 'backup' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-[#121933] border border-neutral-200 dark:border-[#242E56] space-y-3">
            <h3 className="font-bold text-sm font-['Sora'] text-neutral-900 dark:text-white">Export Database Snapshot</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Download a complete JSON export file containing all 60 students, faculty records, fee transactions, exam tabulations, and audit trails.
            </p>
            <button
              onClick={handleExportBackup}
              className="px-4 py-2.5 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Export Database (JSON)</span>
            </button>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-[#121933] border border-neutral-200 dark:border-[#242E56] space-y-3">
            <h3 className="font-bold text-sm font-['Sora'] text-neutral-900 dark:text-white">Restore from Backup</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Upload an authorized Aurelian Heights Academy JSON backup file to overwrite current system records.
            </p>
            <input
              type="file"
              accept=".json"
              onChange={handleImportBackup}
              className="text-xs text-neutral-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-teal-600 file:text-white cursor-pointer"
            />
          </div>

          {/* 3rd Card: Deployable ZIP Archive */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#121933] border border-teal-500/30 dark:border-teal-500/30 space-y-3 md:col-span-2">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm font-['Sora'] text-neutral-900 dark:text-white flex items-center gap-2">
                <span className="p-1 rounded-md bg-teal-500/20 text-teal-400">📦</span>
                <span>Production Deployment Source Code (.ZIP)</span>
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/30">
                Ready to Deploy
              </span>
            </div>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Download the complete, self-contained project archive including full-stack Express server, database persistence layer, React 19 UI, Pakistani payment flow, seed data, and deployment scripts.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => setShowDownloadModal(true)}
                className="px-4 py-2.5 text-xs font-semibold rounded-xl bg-teal-600 hover:bg-teal-500 text-white flex items-center gap-2 shadow-xs transition-transform active:scale-95 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Deployment Package (.ZIP / .TAR.GZ)</span>
              </button>
              <span className="text-[11px] text-neutral-400 font-mono">
                Command: <code className="bg-neutral-100 dark:bg-[#0B1020] px-2 py-1 rounded text-teal-300">npm install && npm run build && npm start</code>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 4. AUDIT LOG TAB */}
      {activeTab === 'audit' && (
        <div className="rounded-2xl bg-white dark:bg-[#121933] border border-neutral-200 dark:border-[#242E56] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 dark:bg-[#0E152B] border-b border-neutral-200 dark:border-[#242E56] text-neutral-500 font-semibold">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Module</th>
                  <th className="py-3 px-4">Operator</th>
                  <th className="py-3 px-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-[#1A2347]">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-neutral-50/50 dark:hover:bg-[#1A2347]/50">
                    <td className="py-2.5 px-4 font-mono text-[11px] text-neutral-400">{formatDate(log.timestamp)}</td>
                    <td className="py-2.5 px-4 font-mono font-bold text-indigo-600 dark:text-teal-400">{log.action}</td>
                    <td className="py-2.5 px-4 text-neutral-500">{log.module}</td>
                    <td className="py-2.5 px-4 font-medium">{log.userName}</td>
                    <td className="py-2.5 px-4 text-neutral-600 dark:text-neutral-300 max-w-sm truncate">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Deployment & Download Modal */}
      <DownloadProjectModal
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
      />
    </div>
  );
};
