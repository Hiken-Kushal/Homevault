import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { MobileHeader, MobileBottomNav } from './components/layout/MobileNav';
import { ApiKeyBanner } from './components/common/ApiKeyBanner';
import { ToastContainer } from './components/common/Toast';
import { AddEditApplianceModal } from './components/appliances/AddEditApplianceModal';
import { WarrantyScannerModal } from './components/assistant/WarrantyScannerModal';

// Views
import { DashboardView } from './components/dashboard/DashboardView';
import { AppliancesView } from './components/appliances/AppliancesView';
import { VaultView } from './components/vault/VaultView';
import { RepairsView } from './components/repairs/RepairsView';
import { AssistantView } from './components/assistant/AssistantView';
import { SettingsView } from './components/settings/SettingsView';

const MainLayout: React.FC = () => {
  const { activeTab, isLoading } = useApp();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FBFBFA] flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-teal-600/30 animate-bounce mb-3">
          HV
        </div>
        <p className="text-sm font-bold text-slate-800">Opening HomeVault AI...</p>
        <p className="text-xs text-slate-400 mt-1">Initializing secure local IndexedDB storage</p>
      </div>
    );
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'appliances':
        return <AppliancesView />;
      case 'vault':
        return <VaultView />;
      case 'repairs':
        return <RepairsView />;
      case 'assistant':
        return <AssistantView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBFA] text-slate-900 flex flex-col font-sans">
      {/* API Key Notification Banner */}
      <ApiKeyBanner />

      {/* Mobile Top Header (hidden on desktop) */}
      <MobileHeader />

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar (hidden on mobile) */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto pb-24 lg:pb-12">
          {/* Desktop Top Search & Actions Header */}
          <Header />

          {/* Active View Container */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {renderActiveView()}
          </main>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar (hidden on desktop) */}
      <MobileBottomNav />

      {/* Global Modals */}
      <AddEditApplianceModal />
      <WarrantyScannerModal />

      {/* Toast Notification Container */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
