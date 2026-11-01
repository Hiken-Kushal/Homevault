import React from 'react';
import { WarrantyStatus, DocumentType } from '../../types';
import { ShieldCheck, Clock, AlertTriangle, HelpCircle, FileText } from 'lucide-react';

interface WarrantyBadgeProps {
  status: WarrantyStatus;
  size?: 'sm' | 'md';
  showIcon?: boolean;
  className?: string;
}

export const WarrantyBadge: React.FC<WarrantyBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true,
  className = '',
}) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-semibold';

  switch (status) {
    case 'Active':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 font-medium ${sizeClasses} ${className}`}
        >
          {showIcon && <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />}
          Active
        </span>
      );
    case 'Expiring Soon':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/90 font-medium animate-pulse-subtle ${sizeClasses} ${className}`}
        >
          {showIcon && <Clock className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />}
          Expiring Soon
        </span>
      );
    case 'Expired':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200/80 font-medium ${sizeClasses} ${className}`}
        >
          {showIcon && <AlertTriangle className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />}
          Expired
        </span>
      );
    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-medium ${sizeClasses} ${className}`}
        >
          {showIcon && <HelpCircle className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />}
          Unknown
        </span>
      );
  }
};

interface DocumentBadgeProps {
  type: DocumentType;
  className?: string;
}

export const DocumentBadge: React.FC<DocumentBadgeProps> = ({ type, className = '' }) => {
  const styles: Record<DocumentType, string> = {
    Invoice: 'bg-blue-50 text-blue-700 border-blue-200',
    'Warranty Card': 'bg-teal-50 text-teal-700 border-teal-200',
    'Extended Warranty': 'bg-purple-50 text-purple-700 border-purple-200',
    'Repair Receipt': 'bg-amber-50 text-amber-700 border-amber-200',
    'User Manual': 'bg-slate-100 text-slate-700 border-slate-200',
    Other: 'bg-zinc-100 text-zinc-700 border-zinc-200',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium border ${styles[type] || styles.Other} ${className}`}
    >
      <FileText className="w-3 h-3 opacity-75" />
      {type}
    </span>
  );
};
