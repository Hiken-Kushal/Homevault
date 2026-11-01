import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { RepairCostSummary } from './RepairCostSummary';
import { AddRepairModal } from './AddRepairModal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { formatDate, formatCurrency } from '../../lib/dateUtils';
import {
  Wrench,
  Plus,
  Calendar,
  DollarSign,
  UserCheck,
  Package,
  Receipt,
  Trash2,
  FileText,
  Clock,
} from 'lucide-react';

export const RepairsView: React.FC = () => {
  const {
    repairs,
    appliances,
    documents,
    deleteRepair,
    openAddRepair,
    setPreviewDocument,
    settings,
  } = useApp();

  const [selectedAppFilter, setSelectedAppFilter] = useState('All');
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; desc: string } | null>(null);

  const filteredRepairs = useMemo(() => {
    return [...repairs]
      .filter((r) => {
        if (selectedAppFilter !== 'All' && r.applianceId !== selectedAppFilter) {
          return false;
        }
        return true;
      })
      .sort((a, b) => new Date(b.repairDate).getTime() - new Date(a.repairDate).getTime());
  }, [repairs, selectedAppFilter]);

  const handleOpenReceipt = (receiptDocId?: string) => {
    if (!receiptDocId) return;
    const doc = documents.find((d) => d.id === receiptDocId);
    if (doc) {
      setPreviewDocument(doc);
    }
  };

  const handleConfirmDelete = async () => {
    if (deleteTarget) {
      await deleteRepair(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Repair &amp; Service History</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {filteredRepairs.length} Records
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Log technician visits, parts replacements, and monitor appliance maintenance costs.
          </p>
        </div>

        <button
          type="button"
          onClick={() => openAddRepair()}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm shadow-teal-600/20 transition-all cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Log New Repair</span>
        </button>
      </div>

      {/* Repair Cost & Stats Summary Cards */}
      <RepairCostSummary />

      {/* Filter Row */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600">Filter by Appliance:</span>
          <select
            value={selectedAppFilter}
            onChange={(e) => setSelectedAppFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          >
            <option value="All">All Appliances</option>
            {appliances.map((app) => (
              <option key={app.id} value={app.id}>
                {app.name}
              </option>
            ))}
          </select>
        </div>

        <span className="text-xs text-slate-400">Chronological timeline</span>
      </div>

      {/* Timeline List */}
      {filteredRepairs.length === 0 ? (
        <div className="py-16 px-4 text-center rounded-3xl bg-white border border-slate-200/90 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3.5">
            <Wrench className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">No repair logs</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-5">
            Keep track of every technician visit, invoice, and component replacement.
          </p>
          <button
            type="button"
            onClick={() => openAddRepair()}
            className="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-colors cursor-pointer"
          >
            Log First Repair
          </button>
        </div>
      ) : (
        <div className="relative pl-6 sm:pl-8 border-l-2 border-teal-500/30 space-y-6 my-4 ml-3 sm:ml-4">
          {filteredRepairs.map((rep) => {
            const hasReceipt = Boolean(rep.receiptDocumentId);

            return (
              <div key={rep.id} className="relative group">
                {/* Timeline Circle Node */}
                <div className="absolute -left-[33px] sm:-left-[41px] top-4 w-5 h-5 rounded-full bg-teal-600 text-white ring-4 ring-teal-50 flex items-center justify-center shadow-xs">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>

                {/* Timeline Record Card */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                          {rep.applianceName}
                        </span>
                        <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(rep.repairDate)}
                        </span>
                      </div>
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 mt-1.5">
                        {rep.problemDescription}
                      </h3>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-base font-black text-slate-900 px-3 py-1 rounded-xl bg-slate-50 border border-slate-200">
                        {formatCurrency(rep.repairCost, rep.currency || settings.currency)}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          setDeleteTarget({ id: rep.id, desc: rep.problemDescription })
                        }
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Repair Record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Metadata Specs */}
                  <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <span>
                        Technician:{' '}
                        <strong className="text-slate-800">{rep.serviceProvider}</strong>
                      </span>
                    </div>

                    {rep.partsReplaced && (
                      <div className="flex items-center gap-1.5">
                        <Package className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <span>
                          Parts:{' '}
                          <strong className="text-slate-800">{rep.partsReplaced}</strong>
                        </span>
                      </div>
                    )}

                    {hasReceipt && (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenReceipt(rep.receiptDocumentId)}
                          className="text-teal-700 hover:text-teal-900 font-bold inline-flex items-center gap-1 underline cursor-pointer"
                        >
                          <Receipt className="w-3.5 h-3.5 text-teal-600" />
                          <span>View Saved Receipt</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Notes if any */}
                  {rep.repairNotes && (
                    <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600">
                      <strong className="text-slate-800 font-semibold block mb-0.5">Comments:</strong>
                      {rep.repairNotes}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <AddRepairModal />

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Repair Record?"
        message={`Are you sure you want to delete the repair record "${deleteTarget?.desc}"?`}
        confirmLabel="Delete"
        isDestructive={true}
      />
    </div>
  );
};
