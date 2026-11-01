import React from 'react';
import { useApp, ActiveTab } from '../../context/AppContext';
import { Logo } from '../common/Logo';
import {
  LayoutDashboard,
  Cpu,
  FolderLock,
  Wrench,
  Sparkles,
  Settings,
  PlusCircle,
  ScanLine,
  ShieldCheck,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    appliances,
    documents,
    repairs,
    setIsAddApplianceOpen,
    setIsScannerOpen,
    apiStatus,
    settings,
  } = useApp();

  const navItems: { id: ActiveTab; label: string; icon: React.ComponentType<any>; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'appliances', label: 'My Appliances', icon: Cpu, badge: appliances.length },
    { id: 'vault', label: 'Warranty Vault', icon: FolderLock, badge: documents.length },
    { id: 'repairs', label: 'Repair History', icon: Wrench, badge: repairs.length },
    { id: 'assistant', label: 'AI Assistant', icon: Sparkles },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="hidden lg:flex lg:flex-col w-64 bg-white border-r border-slate-200/90 h-screen sticky top-0 z-30 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-100 flex-shrink-0">
        <Logo size="md" showTagline={true} />
      </div>

      {/* Quick Action Buttons */}
      <div className="p-3.5 space-y-2 border-b border-slate-100/80">
        <button
          type="button"
          onClick={() => setIsScannerOpen(true)}
          className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-semibold text-xs shadow-md shadow-teal-600/20 hover:from-teal-700 hover:to-emerald-700 transition-all cursor-pointer group"
        >
          <ScanLine className="w-4 h-4 transition-transform group-hover:scale-110" />
          <span>Scan Document (AI)</span>
        </button>

        <button
          type="button"
          onClick={() => setIsAddApplianceOpen(true)}
          className="w-full flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-700 font-semibold text-xs hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <PlusCircle className="w-3.5 h-3.5 text-teal-600" />
          <span>Add Appliance</span>
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const isAI = item.id === 'assistant';

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-teal-50 text-teal-900 font-bold shadow-xs border border-teal-200/70'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className={`w-4 h-4 ${
                    isActive
                      ? 'text-teal-700'
                      : isAI
                      ? 'text-teal-500'
                      : 'text-slate-400'
                  }`}
                />
                <span>{item.label}</span>
              </div>

              {item.badge !== undefined && (
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                    isActive
                      ? 'bg-teal-200 text-teal-900'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {item.badge}
                </span>
              )}

              {isAI && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-md font-bold bg-teal-100/80 text-teal-800 border border-teal-200">
                  3.8
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* AI & Local Status Footer */}
      <div className="p-3.5 m-3 rounded-2xl bg-slate-50 border border-slate-200/90 text-xs text-slate-600 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                apiStatus.geminiConfigured ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            />
            <span className="font-semibold text-slate-800 text-[11px]">
              {apiStatus.geminiConfigured ? 'Gemini AI Ready' : 'Local Storage Mode'}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">v1.0</span>
        </div>

        <div className="flex items-center gap-2 pt-1 border-t border-slate-200/70">
          <div className="w-7 h-7 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
            {settings.userName ? settings.userName.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="overflow-hidden">
            <p className="font-semibold text-slate-800 truncate text-[11px]">
              {settings.userName || 'Home Owner'}
            </p>
            <p className="text-[10px] text-slate-400 truncate">
              {settings.userEmail || 'Local Vault'}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
