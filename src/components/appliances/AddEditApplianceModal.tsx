import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Appliance, ApplianceCategory } from '../../types';
import { Modal } from '../common/Modal';
import { calculateExpiryDate, calculateWarrantyStatus } from '../../lib/dateUtils';
import {
  Sparkles,
  Camera,
  Calendar,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

const CATEGORIES: ApplianceCategory[] = [
  'Refrigerator',
  'Washing Machine',
  'Television',
  'Air Conditioner',
  'Microwave',
  'Laptop',
  'Dishwasher',
  'Vacuum Cleaner',
  'Water Purifier',
  'Other',
];

export const AddEditApplianceModal: React.FC = () => {
  const {
    isAddApplianceOpen,
    setIsAddApplianceOpen,
    applianceToEdit,
    setApplianceToEdit,
    appliancePrefillData,
    setAppliancePrefillData,
    addAppliance,
    updateAppliance,
    settings,
    showToast,
  } = useApp();

  const isEditing = Boolean(applianceToEdit);
  const isPrefilled = Boolean(appliancePrefillData);

  // Form state
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ApplianceCategory>('Refrigerator');
  const [brand, setBrand] = useState('');
  const [modelNumber, setModelNumber] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [purchasePrice, setPurchasePrice] = useState<number | ''>('');
  const [currency, setCurrency] = useState('₹');
  const [seller, setSeller] = useState('');
  const [warrantyProvider, setWarrantyProvider] = useState('');
  const [warrantyDurationMonths, setWarrantyDurationMonths] = useState<number | ''>(12);
  const [warrantyStartDate, setWarrantyStartDate] = useState('');
  const [warrantyExpiryDate, setWarrantyExpiryDate] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [coverageDetails, setCoverageDetails] = useState('');
  const [importantConditions, setImportantConditions] = useState('');

  const [activeTabSection, setActiveTabSection] = useState<'details' | 'warranty' | 'notes'>('details');

  // Populate form on open
  useEffect(() => {
    if (applianceToEdit) {
      setName(applianceToEdit.name || '');
      setCategory(applianceToEdit.category || 'Other');
      setBrand(applianceToEdit.brand || '');
      setModelNumber(applianceToEdit.modelNumber || '');
      setSerialNumber(applianceToEdit.serialNumber || '');
      setPurchaseDate(applianceToEdit.purchaseDate || '');
      setPurchasePrice(applianceToEdit.purchasePrice ?? '');
      setCurrency(applianceToEdit.currency || settings.currency || '₹');
      setSeller(applianceToEdit.seller || '');
      setWarrantyProvider(applianceToEdit.warrantyProvider || '');
      setWarrantyDurationMonths(applianceToEdit.warrantyDurationMonths ?? 12);
      setWarrantyStartDate(applianceToEdit.warrantyStartDate || '');
      setWarrantyExpiryDate(applianceToEdit.warrantyExpiryDate || '');
      setImageUrl(applianceToEdit.imageUrl || '');
      setNotes(applianceToEdit.notes || '');
      setCoverageDetails(applianceToEdit.coverageDetails || '');
      setImportantConditions(applianceToEdit.importantConditions || '');
    } else if (appliancePrefillData) {
      setName(appliancePrefillData.name || '');
      setCategory(appliancePrefillData.category || 'Refrigerator');
      setBrand(appliancePrefillData.brand || '');
      setModelNumber(appliancePrefillData.modelNumber || '');
      setSerialNumber(appliancePrefillData.serialNumber || '');
      setPurchaseDate(appliancePrefillData.purchaseDate || '');
      setPurchasePrice(appliancePrefillData.purchasePrice ?? '');
      setCurrency(settings.currency || '₹');
      setSeller(appliancePrefillData.seller || '');
      setWarrantyProvider(appliancePrefillData.warrantyProvider || appliancePrefillData.brand || '');
      setWarrantyDurationMonths(appliancePrefillData.warrantyDurationMonths ?? 12);
      setWarrantyStartDate(
        appliancePrefillData.warrantyStartDate || appliancePrefillData.purchaseDate || ''
      );
      setWarrantyExpiryDate(appliancePrefillData.warrantyExpiryDate || '');
      setImageUrl(appliancePrefillData.imageUrl || '');
      setNotes(appliancePrefillData.notes || '');
      setCoverageDetails(appliancePrefillData.coverageDetails || '');
      setImportantConditions(appliancePrefillData.importantConditions || '');
    } else {
      // Defaults for brand new manual entry
      const today = new Date().toISOString().split('T')[0];
      setName('');
      setCategory('Refrigerator');
      setBrand('');
      setModelNumber('');
      setSerialNumber('');
      setPurchaseDate(today);
      setPurchasePrice('');
      setCurrency(settings.currency || '₹');
      setSeller('');
      setWarrantyProvider('');
      setWarrantyDurationMonths(12);
      setWarrantyStartDate(today);
      setWarrantyExpiryDate(calculateExpiryDate(today, 12));
      setImageUrl('');
      setNotes('');
      setCoverageDetails('');
      setImportantConditions('');
    }
  }, [applianceToEdit, appliancePrefillData, settings, isAddApplianceOpen]);

  // Handle auto-calculating expiry date when start date or duration changes
  const handleDurationChange = (val: number | '') => {
    setWarrantyDurationMonths(val);
    const start = warrantyStartDate || purchaseDate;
    if (start && val && Number(val) > 0) {
      setWarrantyExpiryDate(calculateExpiryDate(start, Number(val)));
    }
  };

  const handleStartDateChange = (date: string) => {
    setWarrantyStartDate(date);
    if (date && warrantyDurationMonths && Number(warrantyDurationMonths) > 0) {
      setWarrantyExpiryDate(calculateExpiryDate(date, Number(warrantyDurationMonths)));
    }
  };

  // Convert uploaded image to base64 Data URL for persistent storage in IndexedDB
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('Image size should be under 5MB', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      showToast('Please provide an appliance name', 'error');
      return;
    }
    if (!brand.trim()) {
      showToast('Please provide a brand name', 'error');
      return;
    }

    const payload = {
      name: name.trim(),
      category,
      brand: brand.trim(),
      modelNumber: modelNumber.trim(),
      serialNumber: serialNumber.trim(),
      purchaseDate,
      purchasePrice: Number(purchasePrice) || 0,
      currency,
      seller: seller.trim(),
      warrantyProvider: warrantyProvider.trim() || brand.trim(),
      warrantyDurationMonths: Number(warrantyDurationMonths) || 0,
      warrantyStartDate: warrantyStartDate || purchaseDate,
      warrantyExpiryDate,
      imageUrl:
        imageUrl ||
        'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=600&auto=format&fit=crop&q=80',
      notes: notes.trim(),
      coverageDetails: coverageDetails.trim(),
      importantConditions: importantConditions.trim(),
    };

    if (isEditing && applianceToEdit) {
      await updateAppliance(applianceToEdit.id, payload);
    } else {
      await addAppliance(payload);
    }

    handleClose();
  };

  const handleClose = () => {
    setIsAddApplianceOpen(false);
    setApplianceToEdit(null);
    setAppliancePrefillData(null);
  };

  const calculatedStatus = calculateWarrantyStatus(warrantyExpiryDate);

  return (
    <Modal
      isOpen={isAddApplianceOpen}
      onClose={handleClose}
      title={
        <div className="flex items-center gap-2">
          {isPrefilled && (
            <span className="p-1 rounded-md bg-teal-100 text-teal-700">
              <Sparkles className="w-4 h-4" />
            </span>
          )}
          <span>{isEditing ? 'Edit Appliance' : isPrefilled ? 'Review & Save Scanned Appliance' : 'Add New Appliance'}</span>
        </div>
      }
      subtitle={
        isPrefilled
          ? 'Fields were auto-extracted from your document. Please verify missing or unconfirmed fields.'
          : 'Store appliance specs, invoice data, and warranty terms in your secure vault.'
      }
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* AI Scanner Banner notice if prefilled */}
        {isPrefilled && (
          <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-200 text-xs text-teal-900 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold block">Smart AI Scanner Extracted Data</strong>
              Carefully verify the model, serial number, and warranty expiry date before saving. Any fields not found on the document are highlighted below.
            </div>
          </div>
        )}

        {/* Tab section buttons for clean form UX */}
        <div className="flex border-b border-slate-200 gap-4 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTabSection('details')}
            className={`pb-2 transition-colors cursor-pointer ${
              activeTabSection === 'details'
                ? 'border-b-2 border-teal-600 text-teal-700 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            1. Appliance &amp; Purchase
          </button>
          <button
            type="button"
            onClick={() => setActiveTabSection('warranty')}
            className={`pb-2 transition-colors cursor-pointer ${
              activeTabSection === 'warranty'
                ? 'border-b-2 border-teal-600 text-teal-700 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            2. Warranty &amp; Terms
          </button>
          <button
            type="button"
            onClick={() => setActiveTabSection('notes')}
            className={`pb-2 transition-colors cursor-pointer ${
              activeTabSection === 'notes'
                ? 'border-b-2 border-teal-600 text-teal-700 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            3. Photo &amp; Conditions
          </button>
        </div>

        {/* Section 1: Appliance & Purchase */}
        {activeTabSection === 'details' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Appliance Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Samsung 670L French Door Smart Refrigerator"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ApplianceCategory)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800 bg-white"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Brand <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="e.g. Samsung, LG, Daikin, Apple"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Model Number</label>
                <input
                  type="text"
                  value={modelNumber}
                  onChange={(e) => setModelNumber(e.target.value)}
                  placeholder="e.g. RF28T5001SR/TL"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Serial Number</label>
                <input
                  type="text"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  placeholder="e.g. SN-89210-449"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Purchase Date</label>
                <input
                  type="date"
                  value={purchaseDate}
                  onChange={(e) => {
                    setPurchaseDate(e.target.value);
                    if (!warrantyStartDate) handleStartDateChange(e.target.value);
                  }}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Price</label>
                <div className="flex">
                  <span className="inline-flex items-center px-2.5 rounded-l-xl border border-r-0 border-slate-200 bg-slate-50 text-slate-600 text-xs font-bold">
                    {currency}
                  </span>
                  <input
                    type="number"
                    value={purchasePrice}
                    onChange={(e) =>
                      setPurchasePrice(e.target.value === '' ? '' : Number(e.target.value))
                    }
                    placeholder="84990"
                    className="w-full px-3 py-2 text-xs rounded-r-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Seller / Store</label>
                <input
                  type="text"
                  value={seller}
                  onChange={(e) => setSeller(e.target.value)}
                  placeholder="e.g. Croma, Reliance Digital"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800"
                />
              </div>
            </div>
          </div>
        )}

        {/* Section 2: Warranty & Terms */}
        {activeTabSection === 'warranty' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Warranty Provider
                </label>
                <input
                  type="text"
                  value={warrantyProvider}
                  onChange={(e) => setWarrantyProvider(e.target.value)}
                  placeholder="e.g. Samsung India Electronics, AppleCare"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Duration (Months)
                </label>
                <input
                  type="number"
                  min="0"
                  max="120"
                  value={warrantyDurationMonths}
                  onChange={(e) =>
                    handleDurationChange(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  placeholder="12, 24, 60"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Warranty Start Date
                </label>
                <input
                  type="date"
                  value={warrantyStartDate}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Warranty Expiry Date
                  </label>
                  {warrantyDurationMonths && warrantyStartDate && (
                    <button
                      type="button"
                      onClick={() =>
                        setWarrantyExpiryDate(
                          calculateExpiryDate(warrantyStartDate, Number(warrantyDurationMonths))
                        )
                      }
                      className="text-[11px] font-bold text-teal-600 hover:text-teal-800 cursor-pointer"
                    >
                      Recalculate
                    </button>
                  )}
                </div>
                <input
                  type="date"
                  value={warrantyExpiryDate}
                  onChange={(e) => setWarrantyExpiryDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800 font-semibold"
                />
              </div>
            </div>

            {/* Calculated Status Preview */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
              <span className="font-medium text-slate-600">Calculated Protection Status:</span>
              <span className="font-bold text-slate-800 px-2.5 py-1 rounded-full bg-white border border-slate-200">
                {calculatedStatus}
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Coverage Details
              </label>
              <textarea
                rows={2}
                value={coverageDetails}
                onChange={(e) => setCoverageDetails(e.target.value)}
                placeholder="e.g. 10 years on inverter motor, 1 year comprehensive on all electronics &amp; wiring."
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800"
              />
            </div>
          </div>
        )}

        {/* Section 3: Photo & Conditions */}
        {activeTabSection === 'notes' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Appliance Image
              </label>
              <div className="flex items-center gap-3">
                {imageUrl && (
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="w-16 h-16 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                  />
                )}
                <div className="flex-1 space-y-1.5">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 cursor-pointer"
                  />
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="Or enter image URL (https://...)"
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Important Conditions &amp; Exclusions
              </label>
              <textarea
                rows={2}
                value={importantConditions}
                onChange={(e) => setImportantConditions(e.target.value)}
                placeholder="e.g. Regular servicing required every 6 months; physical or surge damage excluded."
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Additional Notes
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Extended warranty certificate filed in vault; service technician contact: 1800-XX-XXXX"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800"
              />
            </div>
          </div>
        )}

        {/* Modal Footer Controls */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            {activeTabSection !== 'notes' && (
              <button
                type="button"
                onClick={() =>
                  setActiveTabSection(activeTabSection === 'details' ? 'warranty' : 'notes')
                }
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Next Section →
              </button>
            )}

            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-sm shadow-teal-600/20 rounded-xl transition-all cursor-pointer active:scale-95"
            >
              {isEditing ? 'Save Changes' : 'Save Appliance'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
