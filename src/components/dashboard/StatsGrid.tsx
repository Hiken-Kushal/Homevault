import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../lib/dateUtils';
import { Cpu, ShieldCheck, AlertTriangle, Wrench, ArrowUpRight } from 'lucide-react';

export const StatsGrid: React.FC = () => {
  const { stats, settings, setActiveTab } = useApp();

  const cards = [
    {
      title: 'Total Appliances',
      value: stats.totalAppliances,
      subValue: `Asset Value: ${formatCurrency(stats.totalApplianceValue, settings.currency)}`,
      icon: Cpu,
      color: 'teal',
      bgGradient: 'from-teal-500/10 to-emerald-500/5',
      borderColor: 'border-teal-200/70',
      iconBg: 'bg-teal-100 text-teal-700',
      tab: 'appliances' as const,
    },
    {
      title: 'Active Warranties',
      value: stats.activeWarranties,
      subValue: `${
        stats.totalAppliances > 0
          ? Math.round((stats.activeWarranties / stats.totalAppliances) * 100)
          : 0
      }% of appliances protected`,
      icon: ShieldCheck,
      color: 'emerald',
      bgGradient: 'from-emerald-500/10 to-green-500/5',
      borderColor: 'border-emerald-200/70',
      iconBg: 'bg-emerald-100 text-emerald-700',
      tab: 'appliances' as const,
    },
    {
      title: 'Expiring Soon',
      value: stats.expiringSoonWarranties,
      subValue:
        stats.expiringSoonWarranties > 0
          ? `${stats.expiringSoonWarranties} need attention in 30 days`
          : 'All warranties healthy',
      icon: AlertTriangle,
      color: 'amber',
      bgGradient:
        stats.expiringSoonWarranties > 0
          ? 'from-amber-500/15 to-orange-500/5'
          : 'from-slate-500/5 to-slate-500/0',
      borderColor:
        stats.expiringSoonWarranties > 0 ? 'border-amber-300' : 'border-slate-200/80',
      iconBg:
        stats.expiringSoonWarranties > 0
          ? 'bg-amber-100 text-amber-700'
          : 'bg-slate-100 text-slate-600',
      tab: 'appliances' as const,
    },
    {
      title: 'Total Repairs',
      value: stats.totalRepairs,
      subValue: `Spent: ${formatCurrency(stats.totalRepairExpenditure, settings.currency)}`,
      icon: Wrench,
      color: 'blue',
      bgGradient: 'from-blue-500/10 to-indigo-500/5',
      borderColor: 'border-blue-200/70',
      iconBg: 'bg-blue-100 text-blue-700',
      tab: 'repairs' as const,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;

        return (
          <div
            key={idx}
            onClick={() => setActiveTab(card.tab)}
            className={`p-4 sm:p-5 rounded-2xl bg-white border ${card.borderColor} shadow-xs hover:shadow-md transition-all cursor-pointer relative overflow-hidden group`}
          >
            {/* Soft decorative background glow */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${card.bgGradient} opacity-60 pointer-events-none`}
            />

            <div className="relative flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 tracking-tight">
                {card.title}
              </span>
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center ${card.iconBg} transition-transform group-hover:scale-110`}
              >
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="relative">
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-none mb-1.5">
                {card.value}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-slate-500 truncate">
                  {card.subValue}
                </span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
