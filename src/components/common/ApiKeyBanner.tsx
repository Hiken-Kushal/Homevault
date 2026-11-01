import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from './Modal';
import { Sparkles, Key, AlertCircle, ExternalLink, CheckCircle2, ShieldAlert, RefreshCw } from 'lucide-react';

export const ApiKeyBanner: React.FC = () => {
  const { apiStatus, refreshApiStatus, showToast } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshApiStatus();
    setIsRefreshing(false);
    showToast('Checked Gemini API status', 'info');
  };

  if (dismissed && !isModalOpen) return null;

  return (
    <>
      {!apiStatus.geminiConfigured && (
        <div className="bg-amber-50/90 border-b border-amber-200/80 px-4 py-2.5 text-xs text-amber-900 transition-colors">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>
                <strong className="font-semibold">Gemini AI Setup:</strong> Add your Google Gemini API key to{' '}
                <code className="bg-amber-100/90 px-1.5 py-0.5 rounded text-[11px] font-mono text-amber-950 font-bold">
                  server/.env
                </code>{' '}
                to activate live AI document scanning and chat.
              </span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="font-semibold text-amber-900 hover:text-amber-950 underline cursor-pointer"
              >
                Setup Guide
              </button>
              <button
                type="button"
                onClick={() => setDismissed(true)}
                className="text-amber-600 hover:text-amber-800 px-1 cursor-pointer"
                title="Dismiss"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Setup Guide Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Gemini AI Configuration</h3>
              <p className="text-xs text-slate-500">Official Google Gen AI SDK Integration</p>
            </div>
          </div>
        }
        maxWidth="lg"
      >
        <div className="space-y-4 text-sm text-slate-700">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-3 h-3 rounded-full ${
                  apiStatus.geminiConfigured ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              />
              <span className="font-medium text-slate-900">
                Status:{' '}
                {apiStatus.geminiConfigured
                  ? `Active (${apiStatus.model})`
                  : 'Key Missing (Local Mode)'}
              </span>
            </div>
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
              Check Status
            </button>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-slate-900">Quick 3-Step Setup:</h4>
            <ol className="list-decimal list-inside space-y-2 text-xs text-slate-600 leading-relaxed">
              <li>
                Get a free API key from{' '}
                <a
                  href="https://aistudio.google.com/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-teal-600 hover:text-teal-700 underline inline-flex items-center gap-0.5"
                >
                  Google AI Studio <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                Open the file <code className="bg-slate-100 px-1 py-0.5 rounded font-mono font-bold text-slate-800">server/.env</code> in your project.
              </li>
              <li>
                Add your key and save:
                <pre className="mt-1.5 p-2.5 bg-slate-900 text-teal-300 rounded-lg font-mono text-[11px] overflow-x-auto">
                  GEMINI_API_KEY=your_actual_api_key_here
                </pre>
              </li>
            </ol>
          </div>

          {/* Privacy Notice */}
          <div className="p-3 rounded-xl bg-teal-50/70 border border-teal-200/80 text-xs text-teal-900">
            <div className="flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-teal-700 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold">Privacy Notice:</strong> Documents (invoices, warranty cards) are only sent to Google's official Gemini API endpoint when you explicitly choose to scan them. All parsed records and files are stored strictly on your local machine using browser IndexedDB.
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};
