export type ApplianceCategory =
  | 'Refrigerator'
  | 'Washing Machine'
  | 'Television'
  | 'Air Conditioner'
  | 'Microwave'
  | 'Laptop'
  | 'Dishwasher'
  | 'Vacuum Cleaner'
  | 'Water Purifier'
  | 'Other';

export type WarrantyStatus = 'Active' | 'Expiring Soon' | 'Expired' | 'Unknown';

export interface Appliance {
  id: string;
  name: string;
  category: ApplianceCategory;
  brand: string;
  modelNumber: string;
  serialNumber: string;
  purchaseDate: string; // YYYY-MM-DD
  purchasePrice: number;
  currency: string;
  seller: string;
  warrantyProvider: string;
  warrantyDurationMonths: number;
  warrantyStartDate: string; // YYYY-MM-DD
  warrantyExpiryDate: string; // YYYY-MM-DD
  imageUrl?: string;
  notes?: string;
  coverageDetails?: string;
  importantConditions?: string;
  createdAt: string;
  updatedAt: string;
}

export type DocumentType =
  | 'Invoice'
  | 'Warranty Card'
  | 'Extended Warranty'
  | 'Repair Receipt'
  | 'User Manual'
  | 'Other';

export interface WarrantyDocument {
  id: string;
  name: string;
  applianceId: string;
  applianceName: string;
  documentType: DocumentType;
  uploadDate: string;
  fileType: string; // e.g. 'application/pdf', 'image/jpeg', 'image/png'
  fileSize: number; // bytes
  fileData: string; // base64 data URL
  notes?: string;
}

export interface RepairRecord {
  id: string;
  applianceId: string;
  applianceName: string;
  problemDescription: string;
  repairDate: string; // YYYY-MM-DD
  serviceProvider: string; // technician or service center
  repairCost: number;
  currency: string;
  partsReplaced?: string;
  repairNotes?: string;
  receiptDocumentId?: string;
  receiptName?: string;
  createdAt: string;
}

export interface UserSettings {
  userName: string;
  userEmail: string;
  currency: string; // ₹, $, €, £
  currencyCode: string; // INR, USD, EUR, GBP
  expiryReminderDays: number; // 7, 15, 30, 60
  emailNotifications: boolean;
  browserNotifications: boolean;
  theme: 'light' | 'system';
}

export interface AIChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  suggestedActions?: {
    label: string;
    action: string;
    payload?: any;
  }[];
}

export interface ExtractedWarrantyData {
  applianceName: string | null;
  brand: string | null;
  modelNumber: string | null;
  serialNumber: string | null;
  category: ApplianceCategory | null;
  purchaseDate: string | null;
  purchasePrice: number | null;
  seller: string | null;
  warrantyProvider: string | null;
  warrantyDurationMonths: number | null;
  warrantyStartDate: string | null;
  warrantyExpiryDate: string | null;
  coverageDetails: string | null;
  importantConditions: string | null;
  confidenceScore?: number;
  missingOrUnclearFields: string[];
}

export interface DashboardStats {
  totalAppliances: number;
  totalApplianceValue: number;
  activeWarranties: number;
  expiringSoonWarranties: number;
  expiredWarranties: number;
  unknownWarranties: number;
  totalRepairs: number;
  totalRepairExpenditure: number;
}
