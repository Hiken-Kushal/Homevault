import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDate } from '../../lib/dateUtils';
import { Wrench, ArrowRight, Plus, Receipt } from 'lucide-react';

export const RecentRepairs: React.FC = () => {
  const { repairs, settings, openAddRepair, setActiveTab } = useApp();

  const recentRepairs = [...repairs]
    .sort((a, b) => new Date(b.repairDate).getTime() - new Date(a.repairDate).getTime())
    .slice(0, 3);

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
            <Wrench className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Recent Repair Activity</h3>
            <p className="text-xs text-slate-500">Service logs & maintenance costs</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setActiveTab('repairs')}
          className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1 cursor-pointer"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {recentRepairs.length === 0 ? (
        <div className="py-8 text-center text-slate-500 text-xs">
          <p className="mb-2">No repair records logged yet.</p>
          <button
            type="button"
            onClick={() => openAddRepair()}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log First Repair</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {recentRepairs.map((rep) => (
            <div
              key={rep.id}
              className="p-3 sm:p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/40 hover:bg-slate-50 transition-colors flex items-start justify-between gap-3"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-slate-900 truncate">
                    {rep.applianceName}
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {formatDate(rep.repairDate)}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5 line-clamp-1">
                  {rep.problemDescription}
                </p>
                <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-500">
                  <span>Provider: {rep.serviceProvider}</span>
                  {rep.partsReplaced && (
                    <span className="hidden sm:inline-block text-slate-400">
                      • Parts: {rep.partsReplaced}
                    </span>
                  )}
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <span className="text-xs font-extrabold text-slate-900 px-2 py-1 rounded-lg bg-white border border-slate-200 block">
                  {formatCurrency(rep.repairCost, rep.currency || settings.currency)}
                </span>
                {rep.receiptDocumentId && (
                  <span className="text-[10px] text-teal-600 font-medium inline-flex items-center gap-0.5 mt-1">
                    <Receipt className="w-3 h-3" />
                    Receipt
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
