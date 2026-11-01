import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  Appliance,
  WarrantyDocument,
  RepairRecord,
  UserSettings,
  DashboardStats,
} from '../types';
import {
  db,
  initializeDatabase,
  exportDatabaseBackup,
  importDatabaseBackup,
  resetToSampleData,
  clearAllDatabaseData,
} from '../lib/db';
import { defaultSettings } from '../lib/initialData';
import { calculateWarrantyStatus } from '../lib/dateUtils';
import { checkApiStatus, ApiStatus } from '../lib/api';

export type ActiveTab = 'dashboard' | 'appliances' | 'vault' | 'repairs' | 'assistant' | 'settings';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface AppContextType {
  // Navigation & View State
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;

  // Data
  appliances: Appliance[];
  documents: WarrantyDocument[];
  repairs: RepairRecord[];
  settings: UserSettings;
  stats: DashboardStats;
  isLoading: boolean;
  apiStatus: ApiStatus;
  refreshApiStatus: () => Promise<void>;

  // Appliance Actions
  addAppliance: (data: Omit<Appliance, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Appliance>;
  updateAppliance: (id: string, data: Partial<Appliance>) => Promise<void>;
  deleteAppliance: (id: string) => Promise<void>;

  // Document Actions
  addDocument: (data: Omit<WarrantyDocument, 'id' | 'uploadDate'>) => Promise<WarrantyDocument>;
  deleteDocument: (id: string) => Promise<void>;

  // Repair Actions
  addRepair: (data: Omit<RepairRecord, 'id' | 'createdAt'>) => Promise<RepairRecord>;
  deleteRepair: (id: string) => Promise<void>;

  // Settings & Storage Actions
  updateSettings: (newSettings: Partial<UserSettings>) => Promise<void>;
  exportData: () => Promise<void>;
  importData: (jsonStr: string) => Promise<boolean>;
  resetToDefaultData: () => Promise<void>;
  clearAllData: () => Promise<void>;

  // Active Modals & Pre-fills
  isAddApplianceOpen: boolean;
  setIsAddApplianceOpen: (open: boolean) => void;
  applianceToEdit: Appliance | null;
  setApplianceToEdit: (appliance: Appliance | null) => void;
  appliancePrefillData: Partial<Appliance> | null;
  setAppliancePrefillData: (data: Partial<Appliance> | null) => void;
  openAddApplianceWithPrefill: (prefill: Partial<Appliance>) => void;

  isScannerOpen: boolean;
  setIsScannerOpen: (open: boolean) => void;

  isAddRepairOpen: boolean;
  setIsAddRepairOpen: (open: boolean) => void;
  repairDefaultApplianceId: string | null;
  openAddRepair: (applianceId?: string) => void;

  isUploadDocOpen: boolean;
  setIsUploadDocOpen: (open: boolean) => void;
  uploadDefaultApplianceId: string | null;
  openUploadDoc: (applianceId?: string) => void;

  selectedApplianceId: string | null;
  setSelectedApplianceId: (id: string | null) => void;

  previewDocument: WarrantyDocument | null;
  setPreviewDocument: (doc: WarrantyDocument | null) => void;

  // Search & Filter state
  searchQuery: string;
  setSearchQuery: (q: string) => void;

  // Toasts
  toasts: ToastMessage[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  dismissToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [appliances, setAppliances] = useState<Appliance[]>([]);
  const [documents, setDocuments] = useState<WarrantyDocument[]>([]);
  const [repairs, setRepairs] = useState<RepairRecord[]>([]);
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [apiStatus, setApiStatus] = useState<ApiStatus>({
    isOnline: false,
    geminiConfigured: false,
    model: 'gemini-3.8-flash',
  });

  // Modals & UI States
  const [isAddApplianceOpen, setIsAddApplianceOpen] = useState(false);
  const [applianceToEdit, setApplianceToEdit] = useState<Appliance | null>(null);
  const [appliancePrefillData, setAppliancePrefillData] = useState<Partial<Appliance> | null>(null);

  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isAddRepairOpen, setIsAddRepairOpen] = useState(false);
  const [repairDefaultApplianceId, setRepairDefaultApplianceId] = useState<string | null>(null);

  const [isUploadDocOpen, setIsUploadDocOpen] = useState(false);
  const [uploadDefaultApplianceId, setUploadDefaultApplianceId] = useState<string | null>(null);

  const [selectedApplianceId, setSelectedApplianceId] = useState<string | null>(null);
  const [previewDocument, setPreviewDocument] = useState<WarrantyDocument | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      dismissToast(id);
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const refreshApiStatus = async () => {
    const status = await checkApiStatus();
    setApiStatus(status);
  };

  // Initialize DB and API Status
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const initData = await initializeDatabase();
        setAppliances(initData.appliances);
        setDocuments(initData.documents);
        setRepairs(initData.repairs);
        setSettings(initData.settings);
      } catch (err) {
        console.error('Failed to initialize database:', err);
        showToast('Error loading local database', 'error');
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
    refreshApiStatus();
  }, []);

  // Compute live dashboard stats
  const stats: DashboardStats = useMemo(() => {
    let active = 0;
    let expiringSoon = 0;
    let expired = 0;
    let unknown = 0;
    let totalValue = 0;

    for (const app of appliances) {
      totalValue += Number(app.purchasePrice) || 0;
      const status = calculateWarrantyStatus(app.warrantyExpiryDate);
      if (status === 'Active') active++;
      else if (status === 'Expiring Soon') expiringSoon++;
      else if (status === 'Expired') expired++;
      else unknown++;
    }

    const totalRepairExpenditure = repairs.reduce((acc, curr) => acc + (Number(curr.repairCost) || 0), 0);

    return {
      totalAppliances: appliances.length,
      totalApplianceValue: totalValue,
      activeWarranties: active,
      expiringSoonWarranties: expiringSoon,
      expiredWarranties: expired,
      unknownWarranties: unknown,
      totalRepairs: repairs.length,
      totalRepairExpenditure,
    };
  }, [appliances, repairs]);

  // Appliance Actions
  const addAppliance = async (data: Omit<Appliance, 'id' | 'createdAt' | 'updatedAt'>): Promise<Appliance> => {
    const id = `app-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const newAppliance: Appliance = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now,
    };

    await db.appliances.add(newAppliance);
    setAppliances((prev) => [newAppliance, ...prev]);
    showToast(`Added ${newAppliance.name} successfully!`, 'success');
    return newAppliance;
  };

  const updateAppliance = async (id: string, data: Partial<Appliance>): Promise<void> => {
    const now = new Date().toISOString();
    const updatedFields = { ...data, updatedAt: now };

    await db.appliances.update(id, updatedFields);
    setAppliances((prev) =>
      prev.map((app) => (app.id === id ? { ...app, ...updatedFields } : app))
    );
    showToast('Appliance updated successfully!', 'success');
  };

  const deleteAppliance = async (id: string): Promise<void> => {
    await db.appliances.delete(id);
    // Also delete associated documents and repairs
    await db.documents.where('applianceId').equals(id).delete();
    await db.repairs.where('applianceId').equals(id).delete();

    setAppliances((prev) => prev.filter((a) => a.id !== id));
    setDocuments((prev) => prev.filter((d) => d.applianceId !== id));
    setRepairs((prev) => prev.filter((r) => r.applianceId !== id));

    if (selectedApplianceId === id) {
      setSelectedApplianceId(null);
    }
    showToast('Appliance and related records deleted', 'info');
  };

  // Document Actions
  const addDocument = async (data: Omit<WarrantyDocument, 'id' | 'uploadDate'>): Promise<WarrantyDocument> => {
    const id = `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString().split('T')[0];
    const newDoc: WarrantyDocument = {
      ...data,
      id,
      uploadDate: now,
    };

    await db.documents.add(newDoc);
    setDocuments((prev) => [newDoc, ...prev]);
    showToast(`Stored document "${newDoc.name}" in Warranty Vault`, 'success');
    return newDoc;
  };

  const deleteDocument = async (id: string): Promise<void> => {
    await db.documents.delete(id);
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    showToast('Document removed from vault', 'info');
  };

  // Repair Actions
  const addRepair = async (data: Omit<RepairRecord, 'id' | 'createdAt'>): Promise<RepairRecord> => {
    const id = `rep-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newRepair: RepairRecord = {
      ...data,
      id,
      createdAt: new Date().toISOString(),
    };

    await db.repairs.add(newRepair);
    setRepairs((prev) => [newRepair, ...prev]);
    showToast('Repair record logged successfully!', 'success');
    return newRepair;
  };

  const deleteRepair = async (id: string): Promise<void> => {
    await db.repairs.delete(id);
    setRepairs((prev) => prev.filter((r) => r.id !== id));
    showToast('Repair record removed', 'info');
  };

  // Settings Actions
  const updateSettings = async (newSettings: Partial<UserSettings>): Promise<void> => {
    const updated = { ...settings, ...newSettings };
    await db.settings.put({ ...updated, id: 'user_settings' });
    setSettings(updated);
    showToast('Settings saved successfully', 'success');
  };

  const exportData = async (): Promise<void> => {
    try {
      const json = await exportDatabaseBackup();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `HomeVault_Backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Backup exported successfully!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to export backup', 'error');
    }
  };

  const importData = async (jsonStr: string): Promise<boolean> => {
    try {
      const success = await importDatabaseBackup(jsonStr);
      if (success) {
        const [a, d, r, s] = await Promise.all([
          db.appliances.toArray(),
          db.documents.toArray(),
          db.repairs.toArray(),
          db.settings.get('user_settings'),
        ]);
        setAppliances(a);
        setDocuments(d);
        setRepairs(r);
        if (s) setSettings(s);
        showToast('Backup restored successfully!', 'success');
        return true;
      }
      return false;
    } catch (err: any) {
      showToast(`Import failed: ${err.message}`, 'error');
      return false;
    }
  };

  const resetToDefaultData = async (): Promise<void> => {
    await resetToSampleData();
    const [a, d, r, s] = await Promise.all([
      db.appliances.toArray(),
      db.documents.toArray(),
      db.repairs.toArray(),
      db.settings.get('user_settings'),
    ]);
    setAppliances(a);
    setDocuments(d);
    setRepairs(r);
    if (s) setSettings(s);
    showToast('Reset to realistic sample appliances and repairs', 'info');
  };

  const clearAllData = async (): Promise<void> => {
    await clearAllDatabaseData();
    setAppliances([]);
    setDocuments([]);
    setRepairs([]);
    showToast('All local appliance data cleared', 'info');
  };

  // Pre-fill helper for Add Appliance
  const openAddApplianceWithPrefill = (prefill: Partial<Appliance>) => {
    setAppliancePrefillData(prefill);
    setApplianceToEdit(null);
    setIsAddApplianceOpen(true);
  };

  const openAddRepair = (applianceId?: string) => {
    setRepairDefaultApplianceId(applianceId || null);
    setIsAddRepairOpen(true);
  };

  const openUploadDoc = (applianceId?: string) => {
    setUploadDefaultApplianceId(applianceId || null);
    setIsUploadDocOpen(true);
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        appliances,
        documents,
        repairs,
        settings,
        stats,
        isLoading,
        apiStatus,
        refreshApiStatus,
        addAppliance,
        updateAppliance,
        deleteAppliance,
        addDocument,
        deleteDocument,
        addRepair,
        deleteRepair,
        updateSettings,
        exportData,
        importData,
        resetToDefaultData,
        clearAllData,
        isAddApplianceOpen,
        setIsAddApplianceOpen,
        applianceToEdit,
        setApplianceToEdit,
        appliancePrefillData,
        setAppliancePrefillData,
        openAddApplianceWithPrefill,
        isScannerOpen,
        setIsScannerOpen,
        isAddRepairOpen,
        setIsAddRepairOpen,
        repairDefaultApplianceId,
        openAddRepair,
        isUploadDocOpen,
        setIsUploadDocOpen,
        uploadDefaultApplianceId,
        openUploadDoc,
        selectedApplianceId,
        setSelectedApplianceId,
        previewDocument,
        setPreviewDocument,
        searchQuery,
        setSearchQuery,
        toasts,
        showToast,
        dismissToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
