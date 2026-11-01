import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  calculateWarrantyStatus,
  getDaysRemaining,
  formatRemainingTime,
  formatDate,
  getOfficialWarrantySearchUrl,
} from '../../lib/dateUtils';
import { WarrantyBadge } from '../common/Badge';
import { Clock, AlertCircle, ArrowRight, ExternalLink, Calendar } from 'lucide-react';

export const UpcomingExpirations: React.FC = () => {
  const { appliances, setSelectedApplianceId, setActiveTab } = useApp();

  // Find appliances with valid expiry date, sorted by upcoming/least remaining days
  const expiringAppliances = appliances
    .filter((a) => a.warrantyExpiryDate)
    .map((a) => ({
      ...a,
      status: calculateWarrantyStatus(a.warrantyExpiryDate),
      daysRemaining: getDaysRemaining(a.warrantyExpiryDate),
    }))
    // Prioritize expiring soon (0 to 30 days), then active with fewest days remaining
    .sort((a, b) => {
      const aDays = a.daysRemaining ?? 9999;
      const bDays = b.daysRemaining ?? 9999;
      return aDays - bDays;
    })
    .slice(0, 4);

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Upcoming Warranty Expirations</h3>
            <p className="text-xs text-slate-500">Track protection deadlines & renew in time</p>
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

      {expiringAppliances.length === 0 ? (
        <div className="py-8 text-center text-slate-500 text-xs">
          No warranties currently registered with expiration dates.
        </div>
      ) : (
        <div className="space-y-3">
          {expiringAppliances.map((app) => {
            const isUrgent = app.status === 'Expiring Soon';
            const isExpired = app.status === 'Expired';

            return (
              <div
                key={app.id}
                className={`p-3 sm:p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isUrgent
                    ? 'bg-amber-50/60 border-amber-200/90'
                    : isExpired
                    ? 'bg-rose-50/50 border-rose-200/80'
                    : 'bg-slate-50/60 border-slate-200/80 hover:bg-slate-50'
                }`}
              >
                <div
                  className="flex items-start gap-3 cursor-pointer flex-1"
                  onClick={() => setSelectedApplianceId(app.id)}
                >
                  <img
                    src={
                      app.imageUrl ||
                      'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=200&auto=format&fit=crop&q=80'
                    }
                    alt={app.name}
                    className="w-12 h-12 rounded-lg object-cover border border-slate-200 flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 truncate">{app.name}</h4>
                    <p className="text-[11px] text-slate-500">
                      {app.brand} • {app.modelNumber || app.category}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="inline-flex items-center gap-1 text-[11px] text-slate-600">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {formatDate(app.warrantyExpiryDate)}
                      </span>
                      <WarrantyBadge status={app.status} size="sm" showIcon={false} />
                    </div>
                  </div>
                </div>

                {/* Remaining Days & Action */}
                <div className="flex items-center justify-between sm:justify-end gap-2.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60 flex-shrink-0">
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                      isUrgent
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : isExpired
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {formatRemainingTime(app.warrantyExpiryDate)}
                  </span>

                  <a
                    href={getOfficialWarrantySearchUrl(app.brand, app.modelNumber, app.category)}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Find Official Warranty Policy on Google"
                    className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-colors inline-flex items-center gap-1 text-[11px] font-semibold"
                  >
                    <span>Support</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
