import { Appliance, RepairRecord, WarrantyDocument, UserSettings } from '../types';

// Helper to format date offset from today as YYYY-MM-DD
function getDateOffset(daysOffset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export const defaultSettings: UserSettings = {
  userName: 'Piyush Sharma',
  userEmail: 'piyush@example.com',
  currency: '₹',
  currencyCode: 'INR',
  expiryReminderDays: 30,
  emailNotifications: true,
  browserNotifications: true,
  theme: 'light',
};

// Generates a lightweight realistic SVG invoice as a base64 Data URL for sample documents
function createSampleSvgDataUrl(title: string, brand: string, price: string, date: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800" fill="none">
    <rect width="600" height="800" fill="#ffffff" rx="16" />
    <rect x="40" y="40" width="520" height="120" rx="8" fill="#F0FDF4" stroke="#86EFAC" stroke-width="2"/>
    <text x="70" y="85" font-family="sans-serif" font-size="24" font-weight="bold" fill="#065F46">HomeVault Digital Vault Copy</text>
    <text x="70" y="115" font-family="sans-serif" font-size="14" fill="#047857">OFFICIAL PURCHASE INVOICE &amp; WARRANTY RECEIPT</text>
    <line x1="40" y1="180" x2="560" y2="180" stroke="#E2E8F0" stroke-width="2" stroke-dasharray="6 6"/>
    <text x="40" y="220" font-family="sans-serif" font-size="14" fill="#64748B">ITEM DESCRIPTION</text>
    <text x="40" y="250" font-family="sans-serif" font-size="20" font-weight="bold" fill="#0F172A">${title}</text>
    <text x="40" y="275" font-family="sans-serif" font-size="14" fill="#475569">Brand: ${brand} | Verified Customer Record</text>
    <rect x="40" y="310" width="520" height="190" rx="8" fill="#F8FAFC" stroke="#E2E8F0"/>
    <text x="60" y="350" font-family="sans-serif" font-size="14" fill="#64748B">Invoice Date:</text>
    <text x="240" y="350" font-family="sans-serif" font-size="15" font-weight="bold" fill="#0F172A">${date}</text>
    <text x="60" y="390" font-family="sans-serif" font-size="14" fill="#64748B">Invoice Total:</text>
    <text x="240" y="390" font-family="sans-serif" font-size="18" font-weight="bold" fill="#059669">${price}</text>
    <text x="60" y="430" font-family="sans-serif" font-size="14" fill="#64748B">Warranty Status:</text>
    <text x="240" y="430" font-family="sans-serif" font-size="15" font-weight="bold" fill="#0D9488">Verified In-System</text>
    <text x="60" y="470" font-family="sans-serif" font-size="14" fill="#64748B">Authorised Retailer:</text>
    <text x="240" y="470" font-family="sans-serif" font-size="15" fill="#334155">Reliance Digital Retail Ltd.</text>
    <rect x="40" y="530" width="520" height="150" rx="8" fill="#FFFBEB" stroke="#FDE68A"/>
    <text x="60" y="565" font-family="sans-serif" font-size="15" font-weight="bold" fill="#92400E">Warranty Claim Terms</text>
    <text x="60" y="595" font-family="sans-serif" font-size="13" fill="#B45309">1. Retain this digital document for official service center verification.</text>
    <text x="60" y="620" font-family="sans-serif" font-size="13" fill="#B45309">2. Covers defects in materials, motor/compressor components &amp; manufacturing.</text>
    <text x="60" y="645" font-family="sans-serif" font-size="13" fill="#B45309">3. Physical or liquid damage excluded under standard manufacturer terms.</text>
    <text x="40" y="740" font-family="sans-serif" font-size="12" fill="#94A3B8">HomeVault AI Document Vault ID: ${Math.random().toString(36).substring(2, 9).toUpperCase()}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function getSampleAppliances(): Appliance[] {
  return [
    {
      id: 'app-samsung-fridge',
      name: 'Samsung 670L French Door Smart Refrigerator',
      category: 'Refrigerator',
      brand: 'Samsung',
      modelNumber: 'RF28T5001SR/TL',
      serialNumber: 'SN-SAM-REF-902148',
      purchaseDate: getDateOffset(-180), // 6 months ago
      purchasePrice: 84990,
      currency: '₹',
      seller: 'Croma Electronics, Indiranagar',
      warrantyProvider: 'Samsung India Electronics Pvt Ltd',
      warrantyDurationMonths: 24, // 2-year comprehensive
      warrantyStartDate: getDateOffset(-180),
      warrantyExpiryDate: getDateOffset(550), // Active (expires in ~18 months)
      imageUrl: 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=600&auto=format&fit=crop&q=80',
      notes: 'Digital Inverter Compressor has a 10-year manufacturer warranty. Standard parts covered for 2 years.',
      coverageDetails: 'Complete electrical, cooling coils, thermistor and main control board replacement.',
      importantConditions: 'Requires voltage stabilizer or surge protector for claim validity.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'app-lg-washer',
      name: 'LG 8kg Front Load AI Direct Drive Washer',
      category: 'Washing Machine',
      brand: 'LG',
      modelNumber: 'FHM1208ZDL',
      serialNumber: 'SN-LG-WASH-483210',
      purchaseDate: getDateOffset(-349), // ~11.5 months ago
      purchasePrice: 38490,
      currency: '₹',
      seller: 'Reliance Digital, Phoenix Mall',
      warrantyProvider: 'LG Electronics India',
      warrantyDurationMonths: 12,
      warrantyStartDate: getDateOffset(-349),
      warrantyExpiryDate: getDateOffset(16), // Expiring Soon (16 days left!)
      imageUrl: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=600&auto=format&fit=crop&q=80',
      notes: '10 year warranty on Direct Drive motor. 1 year comprehensive warranty ending very soon. Consider extended warranty.',
      coverageDetails: 'Covers water pump, drum bearing, door seal and digital touch panel.',
      importantConditions: 'Regular descaling every 3 months recommended by technician.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'app-apple-macbook',
      name: 'Apple MacBook Pro 14" M3 Pro',
      category: 'Laptop',
      brand: 'Apple',
      modelNumber: 'MRX33HN/A',
      serialNumber: 'C02G9012MD6R',
      purchaseDate: getDateOffset(-356), // ~11.8 months ago
      purchasePrice: 199900,
      currency: '₹',
      seller: 'Apple BKC Flagship Store',
      warrantyProvider: 'AppleCare India',
      warrantyDurationMonths: 12,
      warrantyStartDate: getDateOffset(-356),
      warrantyExpiryDate: getDateOffset(9), // Expiring Soon (9 days left!)
      imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80',
      notes: '1-Year Limited Warranty expiring within 9 days! Eligible for AppleCare+ extension until expiry.',
      coverageDetails: 'Hardware defect, Liquid Retina XDR screen, MagSafe 3 and internal battery.',
      importantConditions: 'Physical damage or liquid spill not covered without AppleCare+ accidental protection.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'app-sony-bravia',
      name: 'Sony Bravia 55" 4K HDR OLED Google TV',
      category: 'Television',
      brand: 'Sony',
      modelNumber: 'XR-55A80L',
      serialNumber: 'SN-SONY-OLED-71932',
      purchaseDate: getDateOffset(-500), // ~16 months ago
      purchasePrice: 142990,
      currency: '₹',
      seller: 'Vijay Sales, MG Road',
      warrantyProvider: 'Sony India Pvt Ltd',
      warrantyDurationMonths: 12,
      warrantyStartDate: getDateOffset(-500),
      warrantyExpiryDate: getDateOffset(-135), // Expired (~4.5 months ago)
      imageUrl: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&auto=format&fit=crop&q=80',
      notes: 'Standard 1-year panel & motherboard warranty expired. Out-of-warranty repairs subject to standard technician rates.',
      coverageDetails: 'OLED panel burn-in not covered under standard terms.',
      importantConditions: 'Expired. Any upcoming service needs paid quote.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'app-daikin-ac',
      name: 'Daikin 1.5 Ton 5-Star Inverter Split AC',
      category: 'Air Conditioner',
      brand: 'Daikin',
      modelNumber: 'FTKM50U',
      serialNumber: 'SN-DAIKIN-INV-66321',
      purchaseDate: getDateOffset(-90), // 3 months ago
      purchasePrice: 47990,
      currency: '₹',
      seller: 'Tata Neu / Croma Online',
      warrantyProvider: 'Daikin Airconditioning India',
      warrantyDurationMonths: 60, // 5 years comprehensive on PCB + 10 year compressor
      warrantyStartDate: getDateOffset(-90),
      warrantyExpiryDate: getDateOffset(1735), // Active (expires in ~4.7 years)
      imageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop&q=80',
      notes: 'Special 5-year printed circuit board (PCB) comprehensive warranty included at promotional purchase.',
      coverageDetails: 'Copper condenser coil, inverter PCB, fan motor and refrigerant gas charge.',
      importantConditions: 'Requires bi-annual authorized service to maintain full PCB coverage.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'app-philips-airfryer',
      name: 'Philips Digital Air Fryer HD9252/90',
      category: 'Microwave',
      brand: 'Philips',
      modelNumber: 'HD9252/90',
      serialNumber: 'SN-PHIL-AF-33291',
      purchaseDate: getDateOffset(-800), // ~2.2 years ago
      purchasePrice: 8990,
      currency: '₹',
      seller: 'Amazon India',
      warrantyProvider: 'Philips Domestic Appliances',
      warrantyDurationMonths: 0,
      warrantyStartDate: '',
      warrantyExpiryDate: '', // Unknown warranty
      imageUrl: 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=600&auto=format&fit=crop&q=80',
      notes: 'Purchased online during festival sale. Physical receipt not uploaded yet; warranty duration marked as unknown.',
      coverageDetails: 'Standard heating coil and thermostat coverage.',
      importantConditions: 'Invoice needed for future claims.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
}

export function getSampleRepairs(): RepairRecord[] {
  return [
    {
      id: 'rep-1',
      applianceId: 'app-samsung-fridge',
      applianceName: 'Samsung 670L French Door Smart Refrigerator',
      problemDescription: 'Frost buildup in freezer compartment and slight humming noise from evaporator fan.',
      repairDate: getDateOffset(-45),
      serviceProvider: 'Samsung Authorized SmartCare Service, Koramangala',
      repairCost: 3200,
      currency: '₹',
      partsReplaced: 'Defrost Bi-Metal Sensor & Evaporator Blower Grommet',
      repairNotes: 'Covered under warranty labor; parts charged at discounted manufacturer rate. Cooling restored to optimal -18°C.',
      receiptDocumentId: 'doc-repair-1',
      receiptName: 'Samsung_Service_JobSheet_4592.pdf',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'rep-2',
      applianceId: 'app-daikin-ac',
      applianceName: 'Daikin 1.5 Ton 5-Star Inverter Split AC',
      problemDescription: 'Annual pre-summer deep chemical jet wash, drain pipe clearance and gas pressure check.',
      repairDate: getDateOffset(-20),
      serviceProvider: 'CoolTech HVAC Solutions (Daikin Partner)',
      repairCost: 1850,
      currency: '₹',
      partsReplaced: 'Air Filter Mesh & Antimicrobial Condensate Tablet',
      repairNotes: 'Coil pressure tested at 135 PSI (perfect). Airflow velocity increased by 35% after jet wash.',
      receiptDocumentId: 'doc-repair-2',
      receiptName: 'CoolTech_Maintenance_Invoice.pdf',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'rep-3',
      applianceId: 'app-sony-bravia',
      applianceName: 'Sony Bravia 55" 4K HDR OLED Google TV',
      problemDescription: 'HDMI Port 1 (eARC) intermittent signal drop when connected to home theater soundbar.',
      repairDate: getDateOffset(-85),
      serviceProvider: 'Sony Master Care Center, Indiranagar',
      repairCost: 2100,
      currency: '₹',
      partsReplaced: 'eARC Port Sub-connector & Firmware EEPROM reflash',
      repairNotes: 'Television out of original warranty period. Paid diagnostic fee + component repair. Audio pass-through tested with Dolby Atmos.',
      receiptDocumentId: 'doc-repair-3',
      receiptName: 'SonyCare_Repair_Receipt_7721.pdf',
      createdAt: new Date().toISOString(),
    },
  ];
}

export function getSampleDocuments(): WarrantyDocument[] {
  return [
    {
      id: 'doc-samsung-inv',
      name: 'Samsung_Fridge_Official_Invoice.pdf',
      applianceId: 'app-samsung-fridge',
      applianceName: 'Samsung 670L French Door Smart Refrigerator',
      documentType: 'Invoice',
      uploadDate: getDateOffset(-180),
      fileType: 'image/svg+xml',
      fileSize: 142800,
      fileData: createSampleSvgDataUrl(
        'Samsung 670L French Door Smart Refrigerator',
        'Samsung Electronics',
        '₹84,990',
        getDateOffset(-180)
      ),
      notes: 'Original GST tax invoice from Croma Electronics with serial number printed.',
    },
    {
      id: 'doc-lg-warranty',
      name: 'LG_Washing_Machine_Warranty_Card.png',
      applianceId: 'app-lg-washer',
      applianceName: 'LG 8kg Front Load AI Direct Drive Washer',
      documentType: 'Warranty Card',
      uploadDate: getDateOffset(-349),
      fileType: 'image/svg+xml',
      fileSize: 98400,
      fileData: createSampleSvgDataUrl(
        'LG 8kg Front Load Washer - Direct Drive Motor Card',
        'LG Electronics India',
        '₹38,490',
        getDateOffset(-349)
      ),
      notes: 'Stamped warranty booklet with 10-year motor endorsement sticker.',
    },
    {
      id: 'doc-macbook-applecare',
      name: 'AppleCare_Proof_Of_Coverage_MacBook.pdf',
      applianceId: 'app-apple-macbook',
      applianceName: 'Apple MacBook Pro 14" M3 Pro',
      documentType: 'Extended Warranty',
      uploadDate: getDateOffset(-356),
      fileType: 'image/svg+xml',
      fileSize: 112000,
      fileData: createSampleSvgDataUrl(
        'Apple MacBook Pro 14" M3 Pro - 1 Year Limited Warranty',
        'Apple Inc.',
        '₹1,99,900',
        getDateOffset(-356)
      ),
      notes: 'Electronic proof of coverage receipt from Apple BKC.',
    },
    {
      id: 'doc-repair-1',
      name: 'Samsung_Service_JobSheet_4592.pdf',
      applianceId: 'app-samsung-fridge',
      applianceName: 'Samsung 670L French Door Smart Refrigerator',
      documentType: 'Repair Receipt',
      uploadDate: getDateOffset(-45),
      fileType: 'image/svg+xml',
      fileSize: 84200,
      fileData: createSampleSvgDataUrl(
        'Samsung SmartCare Service Receipt - Defrost Sensor',
        'Samsung SmartCare',
        '₹3,200',
        getDateOffset(-45)
      ),
      notes: 'Technician service report verifying compressor status.',
    },
  ];
}
