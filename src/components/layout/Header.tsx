import React from 'react';
import { useApp } from '../../context/AppContext';
import { Search, Plus, ScanLine, Sparkles, Shield } from 'lucide-react';

export const Header: React.FC = () => {
  const {
    searchQuery,
    setSearchQuery,
    setIsAddApplianceOpen,
    setIsScannerOpen,
    setActiveTab,
    apiStatus,
  } = useApp();

  return (
    <header className="hidden lg:flex items-center justify-between px-8 py-4 bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-20">
      {/* Global Search Bar */}
      <div className="relative w-80">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search appliances, brands, models..."
          className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800 placeholder-slate-400 transition-all"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs px-1"
          >
            ✕
          </button>
        )}
      </div>

      {/* Action Buttons & Status */}
      <div className="flex items-center gap-3">
        {/* Gemini status pill */}
        <button
          type="button"
          onClick={() => setActiveTab('assistant')}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
            apiStatus.geminiConfigured
              ? 'bg-teal-50 text-teal-800 border-teal-200/80 hover:bg-teal-100'
              : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-teal-600" />
          <span>Gemini 3.8 Flash</span>
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              apiStatus.geminiConfigured ? 'bg-emerald-500' : 'bg-amber-500'
            }`}
          />
        </button>

        {/* Scan Document */}
        <button
          type="button"
          onClick={() => setIsScannerOpen(true)}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-teal-50 text-teal-800 border border-teal-200 font-semibold text-xs hover:bg-teal-100 transition-colors cursor-pointer"
        >
          <ScanLine className="w-3.5 h-3.5 text-teal-600" />
          <span>Scan Invoice</span>
        </button>

        {/* Add Appliance */}
        <button
          type="button"
          onClick={() => setIsAddApplianceOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-sm shadow-teal-600/20 transition-all cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Appliance</span>
        </button>
      </div>
    </header>
  );
};
