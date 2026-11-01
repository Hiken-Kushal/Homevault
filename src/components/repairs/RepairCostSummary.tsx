import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../lib/dateUtils';
import { Wrench, DollarSign, Activity, Cpu } from 'lucide-react';

export const RepairCostSummary: React.FC = () => {
  const { repairs, settings } = useApp();

  const totalCost = repairs.reduce((acc, curr) => acc + (Number(curr.repairCost) || 0), 0);
  const totalRepairs = repairs.length;
  const avgCost = totalRepairs > 0 ? Math.round(totalCost / totalRepairs) : 0;

  // Find most frequently serviced appliance
  const frequencyMap: Record<string, { count: number; name: string }> = {};
  for (const rep of repairs) {
    if (!frequencyMap[rep.applianceId]) {
      frequencyMap[rep.applianceId] = { count: 0, name: rep.applianceName };
    }
    frequencyMap[rep.applianceId].count++;
  }

  let mostServiced = 'None';
  let maxCount = 0;
  for (const key in frequencyMap) {
    if (frequencyMap[key].count > maxCount) {
      maxCount = frequencyMap[key].count;
      mostServiced = frequencyMap[key].name;
    }
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
      {/* Total Spending */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500">Total Spent</span>
          <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-black text-slate-900 tracking-tight">
          {formatCurrency(totalCost, settings.currency)}
        </div>
        <span className="text-[11px] text-slate-400 mt-1 block">Lifetime repair outlays</span>
      </div>

      {/* Service Events */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500">Service Events</span>
          <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
            <Wrench className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-black text-slate-900 tracking-tight">{totalRepairs}</div>
        <span className="text-[11px] text-slate-400 mt-1 block">Maintenance jobs logged</span>
      </div>

      {/* Average Ticket */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500">Average Job Cost</span>
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <Activity className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-black text-slate-900 tracking-tight">
          {formatCurrency(avgCost, settings.currency)}
        </div>
        <span className="text-[11px] text-slate-400 mt-1 block">Per repair ticket</span>
      </div>

      {/* Most Serviced */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500">Most Serviced</span>
          <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
            <Cpu className="w-4 h-4" />
          </div>
        </div>
        <div className="text-sm font-bold text-slate-900 truncate" title={mostServiced}>
          {mostServiced}
        </div>
        <span className="text-[11px] text-slate-400 mt-1 block">
          {maxCount > 0 ? `${maxCount} service visits` : 'No history yet'}
        </span>
      </div>
    </div>
  );
};
