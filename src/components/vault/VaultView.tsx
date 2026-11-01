import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { DocumentType, WarrantyDocument } from '../../types';
import { DocumentCard } from './DocumentCard';
import { UploadDocumentModal } from './UploadDocumentModal';
import { DocumentPreviewModal } from './DocumentPreviewModal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import {
  FolderLock,
  Upload,
  Search,
  Filter,
  ScanLine,
  FileText,
  Cpu,
} from 'lucide-react';

const DOC_TYPES: ('All' | DocumentType)[] = [
  'All',
  'Invoice',
  'Warranty Card',
  'Extended Warranty',
  'Repair Receipt',
  'User Manual',
  'Other',
];

export const VaultView: React.FC = () => {
  const {
    documents,
    appliances,
    deleteDocument,
    openUploadDoc,
    setIsScannerOpen,
    setPreviewDocument,
    showToast,
  } = useApp();

  const [searchDocQuery, setSearchDocQuery] = useState('');
  const [selectedApplianceFilter, setSelectedApplianceFilter] = useState('All');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<'All' | DocumentType>('All');

  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const filteredDocs = useMemo(() => {
    return documents.filter((doc) => {
      if (searchDocQuery.trim()) {
        const q = searchDocQuery.toLowerCase();
        const matchName = doc.name.toLowerCase().includes(q);
        const matchApp = doc.applianceName.toLowerCase().includes(q);
        if (!matchName && !matchApp) return false;
      }

      if (selectedApplianceFilter !== 'All' && doc.applianceId !== selectedApplianceFilter) {
        return false;
      }

      if (selectedTypeFilter !== 'All' && doc.documentType !== selectedTypeFilter) {
        return false;
      }

      return true;
    });
  }, [documents, searchDocQuery, selectedApplianceFilter, selectedTypeFilter]);

  const handleDownload = (doc: WarrantyDocument) => {
    try {
      const a = document.createElement('a');
      a.href = doc.fileData;
      a.download = doc.name;
      a.click();
      showToast(`Downloading ${doc.name}`, 'info');
    } catch (err) {
      showToast('Could not download document', 'error');
    }
  };

  const handleConfirmDelete = async () => {
    if (deleteTarget) {
      await deleteDocument(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Warranty Vault</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {filteredDocs.length} Documents
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Your encrypted local repository for invoices, warranty slips, and receipts.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsScannerOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-800 font-semibold text-xs transition-colors cursor-pointer"
          >
            <ScanLine className="w-4 h-4 text-teal-600" />
            <span>Scan Invoice</span>
          </button>

          <button
            type="button"
            onClick={() => openUploadDoc()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm shadow-teal-600/20 transition-all cursor-pointer active:scale-95"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Document</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchDocQuery}
            onChange={(e) => setSearchDocQuery(e.target.value)}
            placeholder="Search documents by name or appliance..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800"
          />
        </div>

        {/* Appliance Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 hidden sm:inline">Appliance:</span>
          <select
            value={selectedApplianceFilter}
            onChange={(e) => setSelectedApplianceFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          >
            <option value="All">All Appliances</option>
            {appliances.map((app) => (
              <option key={app.id} value={app.id}>
                {app.name}
              </option>
            ))}
          </select>
        </div>

        {/* Document Type Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 hidden sm:inline">Type:</span>
          <select
            value={selectedTypeFilter}
            onChange={(e) => setSelectedTypeFilter(e.target.value as any)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          >
            {DOC_TYPES.map((dt) => (
              <option key={dt} value={dt}>
                {dt === 'All' ? 'All Document Types' : dt}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Documents Grid */}
      {filteredDocs.length === 0 ? (
        <div className="py-16 px-4 text-center rounded-3xl bg-white border border-slate-200/90 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-3.5">
            <FolderLock className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">No documents in vault</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-5">
            Upload purchase receipts, stamped guarantee cards, or extended warranty contracts.
          </p>
          <button
            type="button"
            onClick={() => openUploadDoc()}
            className="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-colors cursor-pointer"
          >
            Upload Document
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredDocs.map((doc) => (
            <DocumentCard
              key={doc.id}
              document={doc}
              onPreview={(d) => setPreviewDocument(d)}
              onDelete={(id, name) => setDeleteTarget({ id, name })}
              onDownload={handleDownload}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <UploadDocumentModal />
      <DocumentPreviewModal />

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Document?"
        message={`Are you sure you want to delete "${deleteTarget?.name}" from your vault? This action cannot be undone.`}
        confirmLabel="Delete Document"
        isDestructive={true}
      />
    </div>
  );
};
