import React from 'react';
import { useApp } from '../../context/AppContext';
import { calculateWarrantyStatus, formatDate } from '../../lib/dateUtils';
import { WarrantyBadge } from '../common/Badge';
import { Cpu, ArrowRight, Plus } from 'lucide-react';

export const RecentAppliances: React.FC = () => {
  const { appliances, setSelectedApplianceId, setActiveTab, setIsAddApplianceOpen } = useApp();

  const recent = [...appliances]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Recently Added Appliances</h3>
            <p className="text-xs text-slate-500">Your digital registry</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setActiveTab('appliances')}
          className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1 cursor-pointer"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {recent.length === 0 ? (
        <div className="py-8 text-center text-slate-500 text-xs">
          <p className="mb-2">No appliances added yet.</p>
          <button
            type="button"
            onClick={() => setIsAddApplianceOpen(true)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-teal-600 text-white font-semibold text-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add First Appliance</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {recent.map((app) => {
            const status = calculateWarrantyStatus(app.warrantyExpiryDate);

            return (
              <div
                key={app.id}
                onClick={() => setSelectedApplianceId(app.id)}
                className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center gap-3 cursor-pointer group"
              >
                <img
                  src={
                    app.imageUrl ||
                    'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=200&auto=format&fit=crop&q=80'
                  }
                  alt={app.name}
                  className="w-12 h-12 rounded-lg object-cover border border-slate-200 flex-shrink-0 group-hover:scale-105 transition-transform"
                />

                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-slate-900 truncate group-hover:text-teal-700 transition-colors">
                    {app.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 truncate">
                    {app.brand} • Purchased {formatDate(app.purchaseDate)}
                  </p>
                  <div className="mt-1">
                    <WarrantyBadge status={status} size="sm" showIcon={false} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
