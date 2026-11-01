import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ConfirmDialog } from '../common/ConfirmDialog';
import {
  Settings,
  User,
  Bell,
  HardDrive,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  Key,
  CheckCircle2,
  AlertTriangle,
  Shield,
  HelpCircle,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    exportData,
    importData,
    resetToDefaultData,
    clearAllData,
    appliances,
    documents,
    repairs,
    apiStatus,
    refreshApiStatus,
    showToast,
  } = useApp();

  // Local form state for settings
  const [name, setName] = useState(settings.userName || '');
  const [email, setEmail] = useState(settings.userEmail || '');
  const [currency, setCurrency] = useState(settings.currency || '₹');
  const [reminderDays, setReminderDays] = useState(settings.expiryReminderDays || 30);
  const [emailNotifs, setEmailNotifs] = useState(settings.emailNotifications ?? true);
  const [browserNotifs, setBrowserNotifs] = useState(settings.browserNotifications ?? true);

  // Confirmation dialog states
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings({
      userName: name.trim(),
      userEmail: email.trim(),
      currency,
      expiryReminderDays: Number(reminderDays),
      emailNotifications: emailNotifs,
      browserNotifications: browserNotifs,
    });
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const content = reader.result as string;
          await importData(content);
        } catch (err: any) {
          showToast(err.message || 'Import failed', 'error');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <span>Settings &amp; Data Management</span>
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage your personal profile, notification thresholds, backups, and local storage.
        </p>
      </div>

      {/* Local Storage Mode Notice */}
      <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200/90 text-xs text-teal-900 flex items-start gap-3">
        <Shield className="w-5 h-5 text-teal-700 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="font-bold block">100% Client-Side Private Storage (IndexedDB)</strong>
          <p className="leading-relaxed text-teal-800">
            This version uses high-capacity browser IndexedDB. All uploaded warranty cards, purchase invoices, and repair records remain permanently on your machine across browser refreshes without requiring a remote cloud account.
          </p>
        </div>
      </div>

      {/* 1. User Profile & Preferences Form */}
      <form onSubmit={handleSaveProfile} className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
            <User className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-bold text-slate-900">User Profile &amp; Currency</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Your Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Piyush Sharma"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. piyush@example.com"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-800"
            >
              <option value="₹">₹ (Indian Rupee - INR)</option>
              <option value="$">$ (US Dollar - USD)</option>
              <option value="€">€ (Euro - EUR)</option>
              <option value="£">£ (British Pound - GBP)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Warranty Expiry Reminder Horizon
            </label>
            <select
              value={reminderDays}
              onChange={(e) => setReminderDays(Number(e.target.value))}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-800"
            >
              <option value={7}>7 days before expiry</option>
              <option value={15}>15 days before expiry</option>
              <option value={30}>30 days before expiry (Recommended)</option>
              <option value={60}>60 days before expiry</option>
            </select>
          </div>
        </div>

        {/* Notification Checkboxes */}
        <div className="pt-2 border-t border-slate-100 space-y-2.5">
          <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={browserNotifs}
              onChange={(e) => setBrowserNotifs(e.target.checked)}
              className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4 cursor-pointer"
            />
            <span className="font-medium">Enable in-app expiration reminder banners</span>
          </label>

          <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={emailNotifs}
              onChange={(e) => setEmailNotifs(e.target.checked)}
              className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4 cursor-pointer"
            />
            <span className="font-medium">Send monthly protection summary emails (Demo)</span>
          </label>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Save Profile
          </button>
        </div>
      </form>

      {/* 2. Gemini AI Integration Info Card */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Gemini 3.8 Flash Engine</h2>
              <p className="text-xs text-slate-500">Official @google/genai SDK Backend</p>
            </div>
          </div>

          <button
            type="button"
            onClick={async () => {
              await refreshApiStatus();
              showToast('Checked API status', 'info');
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Check Status</span>
          </button>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                apiStatus.geminiConfigured ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            />
            <span className="font-bold text-slate-800">
              {apiStatus.geminiConfigured
                ? `Active: ${apiStatus.model}`
                : 'API Key Not Configured (Using Local Fallback)'}
            </span>
          </div>

          <span className="font-mono text-slate-500 text-[11px]">Port 3001</span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          To enable live document scanning and multi-turn AI chat, create or edit the{' '}
          <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono font-bold text-slate-900">
            server/.env
          </code>{' '}
          file with your Google AI Studio API key:
        </p>

        <pre className="p-3 rounded-xl bg-slate-900 text-teal-300 font-mono text-[11px] overflow-x-auto">
          GEMINI_API_KEY=AIzaSyYourActualGeminiKeyHere
        </pre>
      </div>

      {/* 3. Data Backup, Restore & Clear */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
            <HardDrive className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Data Management &amp; Backups</h2>
            <p className="text-xs text-slate-500">
              {appliances.length} appliances &bull; {documents.length} documents &bull; {repairs.length} repair records
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Export JSON */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Download className="w-4 h-4 text-teal-600" />
              <span>Export Full JSON Backup</span>
            </h3>
            <p className="text-[11px] text-slate-500">
              Download your appliances, warranty cards, invoices and repairs in a single portable JSON file.
            </p>
            <button
              type="button"
              onClick={exportData}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:border-teal-300 text-slate-700 hover:text-teal-700 font-semibold text-xs shadow-2xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Backup (.json)</span>
            </button>
          </div>

          {/* Import JSON */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-blue-600" />
              <span>Restore from Backup</span>
            </h3>
            <p className="text-[11px] text-slate-500">
              Restore previously saved appliances, documents, and settings from a JSON file.
            </p>
            <label className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-700 font-semibold text-xs shadow-2xs transition-colors cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>Select Backup File</span>
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleImportFile}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Reset & Clear Actions */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setConfirmResetOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-slate-600 bg-slate-100 hover:bg-slate-200 text-xs font-semibold transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset to Sample Data</span>
          </button>

          <button
            type="button"
            onClick={() => setConfirmClearOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All Data</span>
          </button>
        </div>
      </div>

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        isOpen={confirmClearOpen}
        onClose={() => setConfirmClearOpen(false)}
        onConfirm={clearAllData}
        title="Clear All Local Data?"
        message="This will permanently delete all your registered appliances, vault documents, and repair records from this device's IndexedDB. Export a backup first if you want to keep your data."
        confirmLabel="Clear All Data"
        isDestructive={true}
      />

      <ConfirmDialog
        isOpen={confirmResetOpen}
        onClose={() => setConfirmResetOpen(false)}
        onConfirm={resetToDefaultData}
        title="Reset to Realistic Sample Data?"
        message="This will replace current entries with 5 realistic sample appliances (Samsung Fridge, LG Washer, Apple MacBook, Sony OLED TV, Daikin AC) with realistic warranty dates and 3 repair logs."
        confirmLabel="Reset to Sample"
        isDestructive={false}
      />
    </div>
  );
};
