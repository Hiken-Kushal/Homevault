import React from 'react';
import { WarrantyDocument } from '../../types';
import { DocumentBadge } from '../common/Badge';
import { formatDate } from '../../lib/dateUtils';
import { Eye, Download, Trash2, FileText, FileImage, Cpu } from 'lucide-react';

interface DocumentCardProps {
  document: WarrantyDocument;
  onPreview: (doc: WarrantyDocument) => void;
  onDelete: (id: string, name: string) => void;
  onDownload: (doc: WarrantyDocument) => void;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  onPreview,
  onDelete,
  onDownload,
}) => {
  const isImage =
    document.fileType.startsWith('image/') ||
    document.fileData?.startsWith('data:image/');

  const fileSizeFormatted =
    document.fileSize > 1024 * 1024
      ? `${(document.fileSize / (1024 * 1024)).toFixed(1)} MB`
      : `${Math.round(document.fileSize / 1024)} KB`;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all p-4.5 flex flex-col justify-between group">
      <div>
        {/* Header with Type & Actions */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <DocumentBadge type={document.documentType} />

          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={() => onPreview(document)}
              className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Preview Document"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onDownload(document)}
              className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Download File"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(document.id, document.name)}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
              title="Delete Document"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Thumbnail or File Icon */}
        <div
          onClick={() => onPreview(document)}
          className="w-full h-32 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center overflow-hidden mb-3.5 cursor-pointer relative group/thumb"
        >
          {isImage ? (
            <img
              src={document.fileData}
              alt={document.name}
              className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-400">
              <FileText className="w-10 h-10 text-teal-600 mb-1" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                PDF Document
              </span>
            </div>
          )}

          <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1 backdrop-blur-xs">
            <Eye className="w-4 h-4" />
            <span>Click to Preview</span>
          </div>
        </div>

        {/* Title */}
        <h4
          onClick={() => onPreview(document)}
          className="text-xs font-bold text-slate-900 truncate hover:text-teal-700 transition-colors cursor-pointer"
          title={document.name}
        >
          {document.name}
        </h4>

        {/* Associated Appliance */}
        <div className="flex items-center gap-1.5 text-[11px] text-slate-600 mt-1">
          <Cpu className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
          <span className="truncate font-medium">{document.applianceName}</span>
        </div>
      </div>

      {/* Meta Footer */}
      <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
        <span>Uploaded {formatDate(document.uploadDate)}</span>
        <span>{fileSizeFormatted}</span>
      </div>
    </div>
  );
};
