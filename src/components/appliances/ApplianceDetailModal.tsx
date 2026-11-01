import React from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { WarrantyBadge, DocumentBadge } from '../common/Badge';
import {
  calculateWarrantyStatus,
  formatDate,
  formatCurrency,
  formatRemainingTime,
  getOfficialWarrantySearchUrl,
} from '../../lib/dateUtils';
import {
  ExternalLink,
  Edit2,
  Trash2,
  FileText,
  Wrench,
  Upload,
  Plus,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Store,
  Hash,
  Clock,
} from 'lucide-react';

interface ApplianceDetailModalProps {
  applianceId: string | null;
  onClose: () => void;
  onEdit: (appliance: any) => void;
  onDelete: (id: string, name: string) => void;
}

export const ApplianceDetailModal: React.FC<ApplianceDetailModalProps> = ({
  applianceId,
  onClose,
  onEdit,
  onDelete,
}) => {
  const {
    appliances,
    documents,
    repairs,
    openUploadDoc,
    openAddRepair,
    setPreviewDocument,
  } = useApp();

  if (!applianceId) return null;

  const appliance = appliances.find((a) => a.id === applianceId);
  if (!appliance) return null;

  const status = calculateWarrantyStatus(appliance.warrantyExpiryDate);
  const relatedDocs = documents.filter((d) => d.applianceId === appliance.id);
  const relatedRepairs = repairs.filter((r) => r.applianceId === appliance.id);

  const officialWarrantyUrl = getOfficialWarrantySearchUrl(
    appliance.brand,
    appliance.modelNumber,
    appliance.category
  );

  return (
    <Modal isOpen={Boolean(applianceId)} onClose={onClose} maxWidth="3xl">
      <div className="space-y-6">
        {/* Header Hero Section */}
        <div className="flex flex-col sm:flex-row gap-5 items-start">
          <img
            src={
              appliance.imageUrl ||
              'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=600&auto=format&fit=crop&q=80'
            }
            alt={appliance.name}
            className="w-full sm:w-44 h-44 rounded-2xl object-cover border border-slate-200 shadow-xs flex-shrink-0"
          />

          <div className="space-y-2 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <WarrantyBadge status={status} size="md" />
              <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                {appliance.category}
              </span>
              <span className="text-xs font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-full">
                {formatRemainingTime(appliance.warrantyExpiryDate)}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {appliance.name}
            </h2>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
              <span>
                Brand: <strong className="text-slate-800">{appliance.brand}</strong>
              </span>
              {appliance.modelNumber && (
                <span>
                  Model: <strong className="font-mono text-slate-800">{appliance.modelNumber}</strong>
                </span>
              )}
              {appliance.serialNumber && (
                <span>
                  Serial: <strong className="font-mono text-slate-800">{appliance.serialNumber}</strong>
                </span>
              )}
            </div>

            {/* Official Warranty Search Button */}
            <div className="pt-2 flex flex-wrap items-center gap-2">
              <a
                href={officialWarrantyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-800 font-semibold text-xs transition-colors"
              >
                <span>Find Official Warranty Policy</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(appliance);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onDelete(appliance.id, appliance.name);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>

        {/* Detailed Information Tabs / Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Purchase Details Card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Store className="w-4 h-4 text-slate-500" />
              Purchase Details
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-500 block">Purchase Date</span>
                <span className="font-semibold text-slate-900">{formatDate(appliance.purchaseDate)}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Purchase Price</span>
                <span className="font-bold text-slate-900">
                  {formatCurrency(appliance.purchasePrice, appliance.currency)}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-500 block">Seller / Retailer</span>
                <span className="font-semibold text-slate-900">{appliance.seller || 'Not specified'}</span>
              </div>
            </div>
          </div>

          {/* Warranty Details Card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              Warranty Coverage
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-500 block">Duration</span>
                <span className="font-semibold text-slate-900">
                  {appliance.warrantyDurationMonths
                    ? `${appliance.warrantyDurationMonths} Months`
                    : 'Unspecified'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Warranty Provider</span>
                <span className="font-semibold text-slate-900">
                  {appliance.warrantyProvider || appliance.brand}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Start Date</span>
                <span className="font-semibold text-slate-900">
                  {formatDate(appliance.warrantyStartDate || appliance.purchaseDate)}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Expiry Date</span>
                <span className="font-bold text-slate-900">
                  {formatDate(appliance.warrantyExpiryDate)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Coverage Terms & Important Conditions */}
        {(appliance.coverageDetails || appliance.importantConditions || appliance.notes) && (
          <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/70 space-y-2.5 text-xs text-slate-700">
            {appliance.coverageDetails && (
              <div>
                <strong className="text-slate-900 block font-semibold mb-0.5">Coverage Details:</strong>
                <p className="text-slate-600 leading-relaxed">{appliance.coverageDetails}</p>
              </div>
            )}
            {appliance.importantConditions && (
              <div>
                <strong className="text-slate-900 block font-semibold mb-0.5">Conditions &amp; Exclusions:</strong>
                <p className="text-slate-600 leading-relaxed">{appliance.importantConditions}</p>
              </div>
            )}
            {appliance.notes && (
              <div>
                <strong className="text-slate-900 block font-semibold mb-0.5">Additional Notes:</strong>
                <p className="text-slate-600 leading-relaxed">{appliance.notes}</p>
              </div>
            )}
          </div>
        )}

        {/* Connected Documents Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal-600" />
              <span>Vault Documents ({relatedDocs.length})</span>
            </h4>
            <button
              type="button"
              onClick={() => openUploadDoc(appliance.id)}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Document</span>
            </button>
          </div>

          {relatedDocs.length === 0 ? (
            <div className="p-4 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-500">
              No warranty card or invoice uploaded for this appliance yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {relatedDocs.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => setPreviewDocument(doc)}
                  className="p-3 rounded-xl border border-slate-200 bg-white hover:border-teal-300 hover:shadow-xs transition-all flex items-center justify-between gap-3 cursor-pointer"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{doc.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <DocumentBadge type={doc.documentType} />
                      <span className="text-[10px] text-slate-400">{formatDate(doc.uploadDate)}</span>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-teal-700">View</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Connected Repair History Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Wrench className="w-4 h-4 text-blue-600" />
              <span>Repair History ({relatedRepairs.length})</span>
            </h4>
            <button
              type="button"
              onClick={() => openAddRepair(appliance.id)}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Repair</span>
            </button>
          </div>

          {relatedRepairs.length === 0 ? (
            <div className="p-4 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-500">
              No repairs logged. This appliance is running smoothly!
            </div>
          ) : (
            <div className="space-y-2">
              {relatedRepairs.map((rep) => (
                <div
                  key={rep.id}
                  className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 truncate">{rep.problemDescription}</p>
                    <p className="text-[11px] text-slate-500">
                      {formatDate(rep.repairDate)} • By {rep.serviceProvider}
                    </p>
                  </div>
                  <span className="font-extrabold text-slate-900 px-2 py-1 bg-white rounded-lg border border-slate-200">
                    {formatCurrency(rep.repairCost, rep.currency)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
