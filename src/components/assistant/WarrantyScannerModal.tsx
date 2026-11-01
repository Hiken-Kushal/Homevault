import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { analyzeWarrantyDocument } from '../../lib/api';
import { ExtractedWarrantyData, Appliance } from '../../types';
import {
  Sparkles,
  Upload,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  FileText,
  ArrowRight,
  ShieldAlert,
  Loader2,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

export const WarrantyScannerModal: React.FC = () => {
  const {
    isScannerOpen,
    setIsScannerOpen,
    openAddApplianceWithPrefill,
    apiStatus,
    showToast,
  } = useApp();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [extractedResult, setExtractedResult] = useState<ExtractedWarrantyData | null>(null);
  const [modelUsed, setModelUsed] = useState<string>('');
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        showToast('File size must be under 4MB for serverless scanning', 'error');
        return;
      }
      setSelectedFile(file);
      setErrorNotice(null);
      setExtractedResult(null);
    }
  };

  const handleStartScan = async () => {
    if (!selectedFile) {
      showToast('Please select an invoice or warranty card to scan', 'error');
      return;
    }

    setIsScanning(true);
    setErrorNotice(null);

    const result = await analyzeWarrantyDocument(selectedFile);
    setIsScanning(false);

    if (result.success && result.data) {
      setExtractedResult(result.data);
      setModelUsed(result.modelUsed || 'Gemini 3.8 Flash');
      showToast('Warranty document analyzed successfully!', 'success');
    } else {
      setErrorNotice(
        result.message || 'Could not extract information. Please verify API key setup.'
      );
      if (result.requiresConfig) {
        showToast('Gemini API key not configured in server/.env', 'error');
      }
    }
  };

  // Test with demo document data so user can experience the flow seamlessly
  const handleTestWithDemoData = () => {
    const demoData: ExtractedWarrantyData = {
      applianceName: 'Whirlpool 265L 3-Star Frost Free Inverter Double Door Refrigerator',
      brand: 'Whirlpool',
      modelNumber: 'IF CNV 278 ELT',
      serialNumber: 'WP-IND-2026-98124',
      category: 'Refrigerator',
      purchaseDate: new Date().toISOString().split('T')[0],
      purchasePrice: 28490,
      seller: 'Amazon Retail India Pvt Ltd',
      warrantyProvider: 'Whirlpool of India Ltd',
      warrantyDurationMonths: 24,
      warrantyStartDate: new Date().toISOString().split('T')[0],
      warrantyExpiryDate: new Date(Date.now() + 24 * 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
      coverageDetails: '10 Years on Inverter Compressor, 2 Years Comprehensive on Electrical Components & Coils.',
      importantConditions: 'Requires authorized technician installation receipt for full 10-year compressor coverage.',
      confidenceScore: 96,
      missingOrUnclearFields: ['Store Manager Stamp'],
    };

    setExtractedResult(demoData);
    setModelUsed('Gemini 3.8 Flash (Simulated Sample Document)');
    showToast('Loaded demo invoice extraction', 'info');
  };

  const handleApplyToAddAppliance = () => {
    if (!extractedResult) return;

    const prefill: Partial<Appliance> = {
      name: extractedResult.applianceName || '',
      brand: extractedResult.brand || '',
      modelNumber: extractedResult.modelNumber || '',
      serialNumber: extractedResult.serialNumber || '',
      category: extractedResult.category || 'Other',
      purchaseDate: extractedResult.purchaseDate || '',
      purchasePrice: extractedResult.purchasePrice || 0,
      seller: extractedResult.seller || '',
      warrantyProvider: extractedResult.warrantyProvider || extractedResult.brand || '',
      warrantyDurationMonths: extractedResult.warrantyDurationMonths || 12,
      warrantyStartDate: extractedResult.warrantyStartDate || extractedResult.purchaseDate || '',
      warrantyExpiryDate: extractedResult.warrantyExpiryDate || '',
      coverageDetails: extractedResult.coverageDetails || '',
      importantConditions: extractedResult.importantConditions || '',
    };

    setIsScannerOpen(false);
    resetState();
    openAddApplianceWithPrefill(prefill);
  };

  const resetState = () => {
    setSelectedFile(null);
    setIsScanning(false);
    setExtractedResult(null);
    setErrorNotice(null);
  };

  return (
    <Modal
      isOpen={isScannerOpen}
      onClose={() => {
        setIsScannerOpen(false);
        resetState();
      }}
      title={
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Smart Warranty Scanner</h3>
            <p className="text-xs text-slate-500">Powered by Google Gen AI (gemini-3.8-flash)</p>
          </div>
        </div>
      }
      maxWidth="2xl"
    >
      <div className="space-y-5">
        {/* Step 1: Upload & Scan Section (if no extracted result yet) */}
        {!extractedResult && (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-teal-200 bg-teal-50/40 rounded-2xl p-6 text-center relative hover:bg-teal-50/60 transition-colors">
              <input
                type="file"
                accept=".pdf,image/png,image/jpeg,image/jpg,image/webp"
                onChange={handleFileChange}
                disabled={isScanning}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full disabled:cursor-not-allowed"
              />

              <div className="space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center mx-auto shadow-xs">
                  <Upload className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">
                  {selectedFile ? selectedFile.name : 'Upload Purchase Invoice or Warranty Card'}
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {selectedFile
                    ? `${Math.round(selectedFile.size / 1024)} KB ready for AI extraction`
                    : 'PDF, JPG, PNG or WEBP up to 4MB. The AI will extract model, serials, and warranty terms.'}
                </p>
              </div>
            </div>

            {/* Error Message if scan failed */}
            {errorNotice && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold">{errorNotice}</p>
                  <p className="text-[11px] text-rose-700">
                    If GEMINI_API_KEY is not configured yet, you can add it to{' '}
                    <code>server/.env</code> or click "Test with Sample Invoice" below.
                  </p>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={handleTestWithDemoData}
                className="text-xs font-semibold text-slate-600 hover:text-teal-700 underline cursor-pointer"
              >
                Test with Sample Demo Invoice →
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  disabled={!selectedFile || isScanning}
                  onClick={handleStartScan}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isScanning ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Analyzing Document with Gemini...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Analyze Document</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Extracted Data Review Section */}
        {extractedResult && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-900">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <div>
                  <strong className="block font-bold">Extraction Complete</strong>
                  <span className="text-[11px] opacity-80">
                    Engine: {modelUsed} • Confidence: {extractedResult.confidenceScore || 95}%
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={resetState}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 hover:text-emerald-950 underline cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Scan Another</span>
              </button>
            </div>

            {/* Extracted Fields Table */}
            <div className="rounded-2xl border border-slate-200 overflow-hidden divide-y divide-slate-100 text-xs">
              <div className="p-3 bg-slate-50 font-bold text-slate-800">
                Extracted Appliance &amp; Warranty Metadata
              </div>

              <div className="p-3 grid grid-cols-3 gap-2">
                <span className="text-slate-500 font-medium">Appliance Name</span>
                <span className="col-span-2 font-bold text-slate-900">
                  {extractedResult.applianceName || <span className="text-amber-600">Not found in document</span>}
                </span>
              </div>

              <div className="p-3 grid grid-cols-3 gap-2">
                <span className="text-slate-500 font-medium">Brand &amp; Category</span>
                <span className="col-span-2 text-slate-800">
                  {extractedResult.brand || '—'} • {extractedResult.category || 'Other'}
                </span>
              </div>

              <div className="p-3 grid grid-cols-3 gap-2">
                <span className="text-slate-500 font-medium">Model &amp; Serial</span>
                <span className="col-span-2 font-mono text-slate-800">
                  Model: {extractedResult.modelNumber || 'None'} | Serial: {extractedResult.serialNumber || 'None'}
                </span>
              </div>

              <div className="p-3 grid grid-cols-3 gap-2">
                <span className="text-slate-500 font-medium">Purchase Date &amp; Price</span>
                <span className="col-span-2 text-slate-800 font-semibold">
                  Date: {extractedResult.purchaseDate || 'Not detected'} | Price: ₹{extractedResult.purchasePrice ?? '—'}
                </span>
              </div>

              <div className="p-3 grid grid-cols-3 gap-2">
                <span className="text-slate-500 font-medium">Warranty Provider &amp; Expiry</span>
                <span className="col-span-2 text-teal-800 font-bold">
                  {extractedResult.warrantyProvider || extractedResult.brand || 'Manufacturer'} • Expires:{' '}
                  {extractedResult.warrantyExpiryDate || 'Unspecified'} ({extractedResult.warrantyDurationMonths || 12} mos)
                </span>
              </div>

              {extractedResult.coverageDetails && (
                <div className="p-3 grid grid-cols-3 gap-2">
                  <span className="text-slate-500 font-medium">Coverage Details</span>
                  <span className="col-span-2 text-slate-700 leading-relaxed">
                    {extractedResult.coverageDetails}
                  </span>
                </div>
              )}

              {extractedResult.importantConditions && (
                <div className="p-3 grid grid-cols-3 gap-2">
                  <span className="text-slate-500 font-medium">Conditions &amp; Exclusions</span>
                  <span className="col-span-2 text-slate-700 leading-relaxed">
                    {extractedResult.importantConditions}
                  </span>
                </div>
              )}
            </div>

            {/* Unclear or missing fields badge */}
            {extractedResult.missingOrUnclearFields && extractedResult.missingOrUnclearFields.length > 0 && (
              <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900">
                <span className="font-semibold block mb-1">
                  ⚠️ Unclear / Missing on Document (Review in next step):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {extractedResult.missingOrUnclearFields.map((field, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-mono text-[10px]"
                    >
                      {field}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Next Step Action Button */}
            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={resetState}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 rounded-xl cursor-pointer"
              >
                Scan Another File
              </button>

              <button
                type="button"
                onClick={handleApplyToAddAppliance}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 transition-all cursor-pointer active:scale-95"
              >
                <span>Apply to Add Appliance Form</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Privacy Notice Banner */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
          <span>
            <strong>Privacy Guarantee:</strong> Documents are sent securely to Google's official Gemini API endpoint for analysis only when you choose to scan them. No sensitive documents are stored externally.
          </span>
        </div>
      </div>
    </Modal>
  );
};
