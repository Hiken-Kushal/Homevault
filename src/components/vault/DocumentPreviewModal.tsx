import React from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { DocumentBadge } from '../common/Badge';
import { formatDate } from '../../lib/dateUtils';
import { Download, Trash2, Cpu, Calendar, FileText, ExternalLink } from 'lucide-react';

export const DocumentPreviewModal: React.FC = () => {
  const { previewDocument, setPreviewDocument, deleteDocument, showToast } = useApp();

  if (!previewDocument) return null;

  const isImage =
    previewDocument.fileType.startsWith('image/') ||
    previewDocument.fileData?.startsWith('data:image/');

  const handleDownload = () => {
    try {
      const a = document.createElement('a');
      a.href = previewDocument.fileData;
      a.download = previewDocument.name;
      a.click();
      showToast(`Downloaded ${previewDocument.name}`, 'success');
    } catch (err) {
      showToast('Failed to download file', 'error');
    }
  };

  const handleDelete = async () => {
    await deleteDocument(previewDocument.id);
    setPreviewDocument(null);
  };

  return (
    <Modal
      isOpen={Boolean(previewDocument)}
      onClose={() => setPreviewDocument(null)}
      title={
        <div className="flex items-center gap-2">
          <DocumentBadge type={previewDocument.documentType} />
          <span className="truncate max-w-sm font-bold text-slate-900">
            {previewDocument.name}
          </span>
        </div>
      }
      subtitle={`Linked to ${previewDocument.applianceName} • Uploaded on ${formatDate(
        previewDocument.uploadDate
      )}`}
      maxWidth="3xl"
    >
      <div className="space-y-4">
        {/* Document Viewer Frame */}
        <div className="rounded-2xl border border-slate-200 bg-slate-950/5 p-2 min-h-[350px] max-h-[550px] flex items-center justify-center overflow-auto">
          {isImage ? (
            <img
              src={previewDocument.fileData}
              alt={previewDocument.name}
              className="max-h-[500px] w-auto object-contain rounded-xl shadow-xs"
            />
          ) : previewDocument.fileData.startsWith('data:application/pdf') ? (
            <iframe
              src={previewDocument.fileData}
              title={previewDocument.name}
              className="w-full h-[500px] rounded-xl border border-slate-200 bg-white"
            />
          ) : (
            <div className="text-center p-8 space-y-3">
              <FileText className="w-16 h-16 text-teal-600 mx-auto" />
              <p className="text-sm font-bold text-slate-800">{previewDocument.name}</p>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                PDF document preview. Click below to download or view in an external viewer.
              </p>
              <button
                type="button"
                onClick={handleDownload}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </button>
            </div>
          )}
        </div>

        {/* Notes if any */}
        {previewDocument.notes && (
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
            <strong className="text-slate-800 block mb-0.5 font-semibold">Document Notes:</strong>
            {previewDocument.notes}
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={handleDelete}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-rose-700 bg-rose-50 hover:bg-rose-100 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Document</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPreviewDocument(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Close
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-sm shadow-teal-600/20 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download File</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
