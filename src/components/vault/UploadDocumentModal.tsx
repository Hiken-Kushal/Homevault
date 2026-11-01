import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { DocumentType } from '../../types';
import { Upload, FileText, CheckCircle2 } from 'lucide-react';

const DOC_TYPES: DocumentType[] = [
  'Invoice',
  'Warranty Card',
  'Extended Warranty',
  'Repair Receipt',
  'User Manual',
  'Other',
];

export const UploadDocumentModal: React.FC = () => {
  const {
    isUploadDocOpen,
    setIsUploadDocOpen,
    uploadDefaultApplianceId,
    appliances,
    addDocument,
    showToast,
  } = useApp();

  const [file, setFile] = useState<File | null>(null);
  const [fileData, setFileData] = useState<string>('');
  const [docName, setDocName] = useState('');
  const [applianceId, setApplianceId] = useState('');
  const [documentType, setDocumentType] = useState<DocumentType>('Invoice');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (uploadDefaultApplianceId) {
      setApplianceId(uploadDefaultApplianceId);
    } else if (appliances.length > 0) {
      setApplianceId(appliances[0].id);
    }
  }, [uploadDefaultApplianceId, appliances, isUploadDocOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (selected.size > 4 * 1024 * 1024) {
        showToast('Document size should be under 4MB', 'error');
        return;
      }
      setFile(selected);
      if (!docName) {
        setDocName(selected.name);
      }

      const reader = new FileReader();
      reader.onload = () => {
        setFileData(reader.result as string);
      };
      reader.readAsDataURL(selected);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fileData) {
      showToast('Please select a file to upload', 'error');
      return;
    }
    if (!applianceId) {
      showToast('Please link this document to an appliance', 'error');
      return;
    }

    const linkedApp = appliances.find((a) => a.id === applianceId);
    const applianceName = linkedApp ? linkedApp.name : 'Unknown Appliance';

    setIsSubmitting(true);
    try {
      await addDocument({
        name: docName || file?.name || 'Document',
        applianceId,
        applianceName,
        documentType,
        fileType: file?.type || 'application/pdf',
        fileSize: file?.size || fileData.length,
        fileData,
        notes: notes.trim(),
      });

      handleClose();
    } catch (err: any) {
      showToast(err.message || 'Failed to save document', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsUploadDocOpen(false);
    setFile(null);
    setFileData('');
    setDocName('');
    setNotes('');
  };

  return (
    <Modal
      isOpen={isUploadDocOpen}
      onClose={handleClose}
      title="Upload Document to Vault"
      subtitle="Store purchase invoices, stamped warranty cards, or service receipts securely in IndexedDB."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* File Dropzone */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Choose Document File (PDF, PNG, JPG) <span className="text-rose-500">*</span>
          </label>
          <div className="border-2 border-dashed border-slate-200 rounded-2xl p-5 text-center bg-slate-50/50 hover:bg-slate-50 transition-colors relative cursor-pointer">
            <input
              type="file"
              required
              accept=".pdf,image/png,image/jpeg,image/jpg,image/webp"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            {file ? (
              <div className="flex items-center justify-center gap-2 text-teal-700 text-xs font-bold">
                <CheckCircle2 className="w-5 h-5 text-teal-600" />
                <span className="truncate max-w-xs">{file.name}</span>
                <span className="text-[10px] text-slate-400 font-normal">
                  ({Math.round(file.size / 1024)} KB)
                </span>
              </div>
            ) : (
              <div className="space-y-1">
                <Upload className="w-7 h-7 text-teal-600 mx-auto" />
                <p className="text-xs font-bold text-slate-800">Click or drag file to upload</p>
                <p className="text-[11px] text-slate-400">PDF, JPG, PNG or WEBP up to 4MB</p>
              </div>
            )}
          </div>
        </div>

        {/* Document Title */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Document Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={docName}
            onChange={(e) => setDocName(e.target.value)}
            placeholder="e.g. LG_Washing_Machine_Invoice_2026.pdf"
            className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800"
          />
        </div>

        {/* Associated Appliance */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Associated Appliance <span className="text-rose-500">*</span>
          </label>
          <select
            required
            value={applianceId}
            onChange={(e) => setApplianceId(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800 bg-white"
          >
            {appliances.length === 0 ? (
              <option value="">No appliances found - Add an appliance first</option>
            ) : (
              appliances.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.brand})
                </option>
              ))
            )}
          </select>
        </div>

        {/* Document Type */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Document Type
          </label>
          <select
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value as DocumentType)}
            className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800 bg-white"
          >
            {DOC_TYPES.map((dt) => (
              <option key={dt} value={dt}>
                {dt}
              </option>
            ))}
          </select>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Additional Notes
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Includes GST tax break-up and extended dealer warranty endorsement."
            className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800"
          />
        </div>

        {/* Buttons */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || appliances.length === 0}
            className="px-5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-sm shadow-teal-600/20 transition-all cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Save Document'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
