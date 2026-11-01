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
  ScanLine,
  Plus,
} from 'lucide-react';

export const MobileHeader: React.FC = () => {
  const { setIsAddApplianceOpen, setIsScannerOpen, setActiveTab } = useApp();

  return (
    <header className="lg:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-4 py-3 flex items-center justify-between">
      <Logo size="sm" showTagline={false} />

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setIsScannerOpen(true)}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-teal-50 border border-teal-200 text-teal-700 text-xs font-semibold cursor-pointer active:scale-95"
          aria-label="Scan Document"
        >
          <ScanLine className="w-3.5 h-3.5 text-teal-600" />
          <span>Scan</span>
        </button>

        <button
          type="button"
          onClick={() => setIsAddApplianceOpen(true)}
          className="p-1.5 rounded-lg bg-teal-600 text-white shadow-sm hover:bg-teal-700 cursor-pointer active:scale-95"
          aria-label="Add Appliance"
        >
          <Plus className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
          aria-label="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

export const MobileBottomNav: React.FC = () => {
  const { activeTab, setActiveTab, setIsScannerOpen, appliances, documents } = useApp();

  const navButtons: { id: ActiveTab; label: string; icon: React.ComponentType<any>; badge?: number }[] = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'appliances', label: 'Appliances', icon: Cpu, badge: appliances.length },
    { id: 'vault', label: 'Vault', icon: FolderLock, badge: documents.length },
    { id: 'repairs', label: 'Repairs', icon: Wrench },
    { id: 'assistant', label: 'AI Advisor', icon: Sparkles },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-2 py-1.5 flex items-center justify-around shadow-lg pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      {navButtons.map((btn) => {
        const Icon = btn.icon;
        const isActive = activeTab === btn.id;

        return (
          <button
            key={btn.id}
            type="button"
            onClick={() => setActiveTab(btn.id)}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer select-none relative ${
              isActive ? 'text-teal-700 font-bold' : 'text-slate-500 hover:text-slate-800 font-medium'
            }`}
          >
            <div className="relative">
              <Icon className={`w-5 h-5 ${isActive ? 'text-teal-700 stroke-[2.4]' : 'text-slate-500 stroke-[1.8]'}`} />
              {btn.badge !== undefined && btn.badge > 0 && (
                <span className="absolute -top-1 -right-2 bg-teal-600 text-white text-[9px] font-bold rounded-full h-3.5 min-w-3.5 px-1 flex items-center justify-center">
                  {btn.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight">{btn.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
