import React from 'react';
import { Appliance } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  calculateWarrantyStatus,
  formatDate,
  formatCurrency,
  formatRemainingTime,
  getOfficialWarrantySearchUrl,
} from '../../lib/dateUtils';
import { WarrantyBadge } from '../common/Badge';
import {
  ExternalLink,
  Edit2,
  Trash2,
  FileText,
  Wrench,
  Calendar,
  Sparkles,
} from 'lucide-react';

interface ApplianceCardProps {
  appliance: Appliance;
  onEdit: (appliance: Appliance) => void;
  onDelete: (id: string, name: string) => void;
  onView: (id: string) => void;
}

export const ApplianceCard: React.FC<ApplianceCardProps> = ({
  appliance,
  onEdit,
  onDelete,
  onView,
}) => {
  const { documents, repairs } = useApp();
  const status = calculateWarrantyStatus(appliance.warrantyExpiryDate);

  const docCount = documents.filter((d) => d.applianceId === appliance.id).length;
  const repairCount = repairs.filter((r) => r.applianceId === appliance.id).length;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col group">
      {/* Top Image & Badge Overlay */}
      <div className="relative h-44 sm:h-48 bg-slate-100 overflow-hidden cursor-pointer" onClick={() => onView(appliance.id)}>
        <img
          src={
            appliance.imageUrl ||
            'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=600&auto=format&fit=crop&q=80'
          }
          alt={appliance.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=600&auto=format&fit=crop&q=80';
          }}
        />

        {/* Status Badge overlay */}
        <div className="absolute top-3 left-3">
          <WarrantyBadge status={status} />
        </div>

        {/* Category Pill */}
        <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-slate-900/70 backdrop-blur-md text-white text-[10px] font-semibold">
          {appliance.category}
        </div>

        {/* Remaining Days Ribbon if Expiring Soon */}
        {status === 'Expiring Soon' && (
          <div className="absolute bottom-0 inset-x-0 bg-amber-500/95 backdrop-blur-xs text-amber-950 font-bold text-center text-[11px] py-1 shadow-xs">
            ⚠️ {formatRemainingTime(appliance.warrantyExpiryDate)}
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3
              onClick={() => onView(appliance.id)}
              className="text-sm sm:text-base font-bold text-slate-900 line-clamp-1 hover:text-teal-700 transition-colors cursor-pointer"
            >
              {appliance.name}
            </h3>
          </div>

          <p className="text-xs text-slate-500 mt-0.5">
            <span className="font-semibold text-slate-700">{appliance.brand}</span>
            {appliance.modelNumber ? ` • ${appliance.modelNumber}` : ''}
          </p>

          {/* Quick Specs Grid */}
          <div className="mt-3.5 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                Purchased
              </span>
              <span className="font-semibold text-slate-800">
                {formatDate(appliance.purchaseDate)}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                Warranty Expiry
              </span>
              <span className="font-semibold text-slate-800">
                {formatDate(appliance.warrantyExpiryDate)}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                Price
              </span>
              <span className="font-semibold text-slate-800">
                {formatCurrency(appliance.purchasePrice, appliance.currency)}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                Records
              </span>
              <div className="flex items-center gap-2 text-slate-600 font-medium">
                <span className="inline-flex items-center gap-0.5" title="Documents">
                  <FileText className="w-3 h-3 text-teal-600" />
                  {docCount}
                </span>
                <span className="inline-flex items-center gap-0.5" title="Repairs">
                  <Wrench className="w-3 h-3 text-blue-600" />
                  {repairCount}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-1">
          {/* Find Official Warranty Google Link */}
          <a
            href={getOfficialWarrantySearchUrl(
              appliance.brand,
              appliance.modelNumber,
              appliance.category
            )}
            target="_blank"
            rel="noopener noreferrer"
            title="Search official manufacturer warranty terms on Google"
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-slate-600 hover:text-teal-700 hover:bg-teal-50 border border-slate-200 hover:border-teal-200 text-xs font-semibold transition-colors"
          >
            <span>Official Warranty</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          {/* Edit & Delete Action Buttons */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onEdit(appliance)}
              className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Edit Appliance"
              aria-label="Edit"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(appliance.id, appliance.name)}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
              title="Delete Appliance"
              aria-label="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
