import React from 'react';
import { useApp } from '../../context/AppContext';
import { StatsGrid } from './StatsGrid';
import { WarrantyChart } from './WarrantyChart';
import { UpcomingExpirations } from './UpcomingExpirations';
import { RecentAppliances } from './RecentAppliances';
import { RecentRepairs } from './RecentRepairs';
import { Plus, Sparkles, ScanLine, ShieldAlert } from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    settings,
    setIsAddApplianceOpen,
    setIsScannerOpen,
    setActiveTab,
    stats,
  } = useApp();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome Section */}
      <div className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 p-6 sm:p-8 text-white overflow-hidden shadow-lg shadow-slate-950/10">
        {/* Decorative background glow */}
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-teal-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] font-semibold text-teal-300 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
              Smart Appliance Vault
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back{settings.userName ? `, ${settings.userName}` : ''}!
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Your home's protection, all in one place. Monitor warranty validity, track repairs, and instantly extract invoice records with AI.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 flex-shrink-0">
            <button
              type="button"
              onClick={() => setIsScannerOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-semibold text-xs shadow-md shadow-teal-500/25 transition-all cursor-pointer active:scale-95"
            >
              <ScanLine className="w-4 h-4" />
              <span>Scan Invoice (AI)</span>
            </button>

            <button
              type="button"
              onClick={() => setIsAddApplianceOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs backdrop-blur-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Appliance</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('assistant')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-white/10 text-teal-300 font-semibold text-xs transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-teal-400" />
              <span>AI Warranty Assistant</span>
            </button>
          </div>
        </div>

        {/* Quick Expiration Warning Ribbon if applicable */}
        {stats.expiringSoonWarranties > 0 && (
          <div className="relative mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-amber-200">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>
                <strong>{stats.expiringSoonWarranties} appliance warranty</strong> expiring within the next 30 days!
              </span>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('appliances')}
              className="font-semibold text-amber-300 hover:text-amber-100 underline ml-2 cursor-pointer"
            >
              Review now →
            </button>
          </div>
        )}
      </div>

      {/* Statistics Cards */}
      <StatsGrid />

      {/* Main Dashboard 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section B: Upcoming Expirations */}
        <UpcomingExpirations />

        {/* Section D: Warranty Overview Chart */}
        <WarrantyChart />

        {/* Section A: Recently Added Appliances */}
        <RecentAppliances />

        {/* Section C: Recent Repair Activity */}
        <RecentRepairs />
      </div>
    </div>
  );
};
