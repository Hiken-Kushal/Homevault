import React from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, Clock, AlertTriangle, HelpCircle } from 'lucide-react';

export const WarrantyChart: React.FC = () => {
  const { stats } = useApp();
  const total = stats.totalAppliances || 1;

  const items = [
    {
      label: 'Active',
      count: stats.activeWarranties,
      percentage: Math.round((stats.activeWarranties / total) * 100),
      color: '#10B981', // emerald-500
      bgColor: 'bg-emerald-500',
      lightBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      icon: ShieldCheck,
    },
    {
      label: 'Expiring Soon',
      count: stats.expiringSoonWarranties,
      percentage: Math.round((stats.expiringSoonWarranties / total) * 100),
      color: '#F59E0B', // amber-500
      bgColor: 'bg-amber-500',
      lightBg: 'bg-amber-50 text-amber-800 border-amber-200',
      icon: Clock,
    },
    {
      label: 'Expired',
      count: stats.expiredWarranties,
      percentage: Math.round((stats.expiredWarranties / total) * 100),
      color: '#F43F5E', // rose-500
      bgColor: 'bg-rose-500',
      lightBg: 'bg-rose-50 text-rose-800 border-rose-200',
      icon: AlertTriangle,
    },
    {
      label: 'Unknown',
      count: stats.unknownWarranties,
      percentage: Math.round((stats.unknownWarranties / total) * 100),
      color: '#94A3B8', // slate-400
      bgColor: 'bg-slate-400',
      lightBg: 'bg-slate-50 text-slate-700 border-slate-200',
      icon: HelpCircle,
    },
  ];

  // SVG Donut Calculations
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  let strokeOffsetAccumulator = 0;

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Warranty Overview</h3>
          <p className="text-xs text-slate-500">Distribution across all appliances</p>
        </div>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
          {stats.totalAppliances} Total
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6 pt-2">
        {/* SVG Donut Chart */}
        <div className="relative w-36 h-36 flex-shrink-0 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 140 140">
            {/* Background ring */}
            <circle
              cx="70"
              cy="70"
              r={radius}
              stroke="#F1F5F9"
              strokeWidth="14"
              fill="transparent"
            />

            {/* Segments */}
            {stats.totalAppliances > 0 &&
              items.map((item, idx) => {
                const strokeDasharray = `${(item.count / total) * circumference} ${circumference}`;
                const strokeDashoffset = -strokeOffsetAccumulator;
                strokeOffsetAccumulator += (item.count / total) * circumference;

                if (item.count === 0) return null;

                return (
                  <circle
                    key={idx}
                    cx="70"
                    cy="70"
                    r={radius}
                    stroke={item.color}
                    strokeWidth="14"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-700 ease-out"
                  />
                );
              })}
          </svg>

          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-black text-slate-900 leading-none">
              {stats.totalAppliances > 0
                ? Math.round((stats.activeWarranties / stats.totalAppliances) * 100)
                : 0}
              %
            </span>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
              Covered
            </span>
          </div>
        </div>

        {/* Legend / Metrics List */}
        <div className="flex-1 w-full grid grid-cols-2 gap-2.5">
          {items.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className={`p-2.5 rounded-xl border flex items-center justify-between ${item.lightBg}`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${item.bgColor}`} />
                  <span className="text-xs font-semibold">{item.label}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold">{item.count}</span>
                  <span className="text-[10px] opacity-75 ml-1">({item.percentage}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
