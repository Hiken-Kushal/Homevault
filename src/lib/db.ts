import Dexie, { Table } from 'dexie';
import { Appliance, RepairRecord, WarrantyDocument, UserSettings } from '../types';
import { getSampleAppliances, getSampleRepairs, getSampleDocuments, defaultSettings } from './initialData';

export class HomeVaultDatabase extends Dexie {
  appliances!: Table<Appliance, string>;
  documents!: Table<WarrantyDocument, string>;
  repairs!: Table<RepairRecord, string>;
  settings!: Table<UserSettings & { id: string }, string>;

  constructor() {
    super('HomeVaultAI_DB');
    this.version(1).stores({
      appliances: 'id, name, category, brand, warrantyExpiryDate, createdAt',
      documents: 'id, applianceId, documentType, uploadDate',
      repairs: 'id, applianceId, repairDate, repairCost',
      settings: 'id',
    });
  }
}

export const db = new HomeVaultDatabase();

/**
 * Initializes the database with realistic sample data on first run
 */
export async function initializeDatabase(): Promise<{
  appliances: Appliance[];
  documents: WarrantyDocument[];
  repairs: RepairRecord[];
  settings: UserSettings;
}> {
  const applianceCount = await db.appliances.count();
  
  if (applianceCount === 0) {
    const sampleAppliances = getSampleAppliances();
    const sampleRepairs = getSampleRepairs();
    const sampleDocuments = getSampleDocuments();

    await db.appliances.bulkAdd(sampleAppliances);
    await db.repairs.bulkAdd(sampleRepairs);
    await db.documents.bulkAdd(sampleDocuments);
    await db.settings.put({ ...defaultSettings, id: 'user_settings' });

    return {
      appliances: sampleAppliances,
      documents: sampleDocuments,
      repairs: sampleRepairs,
      settings: defaultSettings,
    };
  }

  const [appliances, documents, repairs, storedSettings] = await Promise.all([
    db.appliances.toArray(),
    db.documents.toArray(),
    db.repairs.toArray(),
    db.settings.get('user_settings'),
  ]);

  return {
    appliances,
    documents,
    repairs,
    settings: storedSettings || defaultSettings,
  };
}

/**
 * Exports all data as a JSON string for full backup
 */
export async function exportDatabaseBackup(): Promise<string> {
  const [appliances, documents, repairs, settings] = await Promise.all([
    db.appliances.toArray(),
    db.documents.toArray(),
    db.repairs.toArray(),
    db.settings.get('user_settings'),
  ]);

  const backupData = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    appName: 'HomeVault AI',
    data: {
      appliances,
      documents,
      repairs,
      settings: settings || defaultSettings,
    },
  };

  return JSON.stringify(backupData, null, 2);
}

/**
 * Restores all data from a JSON backup string
 */
export async function importDatabaseBackup(jsonString: string): Promise<boolean> {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed || !parsed.data) {
      throw new Error('Invalid backup file structure.');
    }

    const { appliances, documents, repairs, settings } = parsed.data;

    await db.transaction('rw', db.appliances, db.documents, db.repairs, db.settings, async () => {
      await db.appliances.clear();
      await db.documents.clear();
      await db.repairs.clear();
      await db.settings.clear();

      if (Array.isArray(appliances) && appliances.length > 0) {
        await db.appliances.bulkAdd(appliances);
      }
      if (Array.isArray(documents) && documents.length > 0) {
        await db.documents.bulkAdd(documents);
      }
      if (Array.isArray(repairs) && repairs.length > 0) {
        await db.repairs.bulkAdd(repairs);
      }
      if (settings) {
        await db.settings.put({ ...settings, id: 'user_settings' });
      }
    });

    return true;
  } catch (error) {
    console.error('Failed to import database backup:', error);
    throw error;
  }
}

/**
 * Resets database to sample data
 */
export async function resetToSampleData(): Promise<void> {
  await db.transaction('rw', db.appliances, db.documents, db.repairs, db.settings, async () => {
    await db.appliances.clear();
    await db.documents.clear();
    await db.repairs.clear();
    await db.settings.clear();

    const sampleAppliances = getSampleAppliances();
    const sampleRepairs = getSampleRepairs();
    const sampleDocuments = getSampleDocuments();

    await db.appliances.bulkAdd(sampleAppliances);
    await db.repairs.bulkAdd(sampleRepairs);
    await db.documents.bulkAdd(sampleDocuments);
    await db.settings.put({ ...defaultSettings, id: 'user_settings' });
  });
}

/**
 * Clears all data completely
 */
export async function clearAllDatabaseData(): Promise<void> {
  await db.transaction('rw', db.appliances, db.documents, db.repairs, db.settings, async () => {
    await db.appliances.clear();
    await db.documents.clear();
    await db.repairs.clear();
    await db.settings.clear();
    await db.settings.put({ ...defaultSettings, id: 'user_settings' });
  });
}
