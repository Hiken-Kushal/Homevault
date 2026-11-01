import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { Wrench, Upload, CheckCircle2 } from 'lucide-react';

export const AddRepairModal: React.FC = () => {
  const {
    isAddRepairOpen,
    setIsAddRepairOpen,
    repairDefaultApplianceId,
    appliances,
    addRepair,
    addDocument,
    settings,
    showToast,
  } = useApp();

  const [applianceId, setApplianceId] = useState('');
  const [problemDescription, setProblemDescription] = useState('');
  const [repairDate, setRepairDate] = useState('');
  const [serviceProvider, setServiceProvider] = useState('');
  const [repairCost, setRepairCost] = useState<number | ''>('');
  const [partsReplaced, setPartsReplaced] = useState('');
  const [repairNotes, setRepairNotes] = useState('');

  // Receipt file state
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptData, setReceiptData] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (repairDefaultApplianceId) {
      setApplianceId(repairDefaultApplianceId);
    } else if (appliances.length > 0) {
      setApplianceId(appliances[0].id);
    }
    const today = new Date().toISOString().split('T')[0];
    setRepairDate(today);
  }, [repairDefaultApplianceId, appliances, isAddRepairOpen]);

  const handleReceiptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        showToast('Receipt file should be under 4MB', 'error');
        return;
      }
      setReceiptFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setReceiptData(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!applianceId) {
      showToast('Please select an appliance', 'error');
      return;
    }
    if (!problemDescription.trim()) {
      showToast('Please describe the problem resolved', 'error');
      return;
    }

    const linkedApp = appliances.find((a) => a.id === applianceId);
    const applianceName = linkedApp ? linkedApp.name : 'Unknown Appliance';

    setIsSubmitting(true);
    try {
      let createdDocId: string | undefined = undefined;
      let receiptDocName: string | undefined = undefined;

      // If user provided a receipt file, save it to the Warranty Vault too!
      if (receiptData && receiptFile) {
        receiptDocName = receiptFile.name;
        const newDoc = await addDocument({
          name: `Receipt_${receiptFile.name}`,
          applianceId,
          applianceName,
          documentType: 'Repair Receipt',
          fileType: receiptFile.type || 'application/pdf',
          fileSize: receiptFile.size,
          fileData: receiptData,
          notes: `Repair receipt for: ${problemDescription.slice(0, 50)}`,
        });
        createdDocId = newDoc.id;
      }

      await addRepair({
        applianceId,
        applianceName,
        problemDescription: problemDescription.trim(),
        repairDate: repairDate || new Date().toISOString().split('T')[0],
        serviceProvider: serviceProvider.trim() || 'Authorized Technician',
        repairCost: Number(repairCost) || 0,
        currency: settings.currency || '₹',
        partsReplaced: partsReplaced.trim(),
        repairNotes: repairNotes.trim(),
        receiptDocumentId: createdDocId,
        receiptName: receiptDocName,
      });

      handleClose();
    } catch (err: any) {
      showToast(err.message || 'Failed to log repair', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsAddRepairOpen(false);
    setProblemDescription('');
    setServiceProvider('');
    setRepairCost('');
    setPartsReplaced('');
    setRepairNotes('');
    setReceiptFile(null);
    setReceiptData('');
  };

  return (
    <Modal
      isOpen={isAddRepairOpen}
      onClose={handleClose}
      title="Log Appliance Repair or Service"
      subtitle="Track technician visits, parts replaced, and expenditure history."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Select Appliance */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Appliance <span className="text-rose-500">*</span>
          </label>
          <select
            required
            value={applianceId}
            onChange={(e) => setApplianceId(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800 bg-white"
          >
            {appliances.length === 0 ? (
              <option value="">No appliances available</option>
            ) : (
              appliances.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.brand})
                </option>
              ))
            )}
          </select>
        </div>

        {/* Problem Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Problem Description / Service Reason <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={problemDescription}
            onChange={(e) => setProblemDescription(e.target.value)}
            placeholder="e.g. Compressor gas refill and condenser fan motor lubrication"
            className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800"
          />
        </div>

        {/* Date & Cost */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Repair Date</label>
            <input
              type="date"
              required
              value={repairDate}
              onChange={(e) => setRepairDate(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Repair Cost</label>
            <div className="flex">
              <span className="inline-flex items-center px-2.5 rounded-l-xl border border-r-0 border-slate-200 bg-slate-50 text-slate-600 text-xs font-bold">
                {settings.currency || '₹'}
              </span>
              <input
                type="number"
                min="0"
                value={repairCost}
                onChange={(e) =>
                  setRepairCost(e.target.value === '' ? '' : Number(e.target.value))
                }
                placeholder="2500"
                className="w-full px-3.5 py-2 text-xs rounded-r-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800"
              />
            </div>
          </div>
        </div>

        {/* Service Provider & Parts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Service Center / Technician
            </label>
            <input
              type="text"
              value={serviceProvider}
              onChange={(e) => setServiceProvider(e.target.value)}
              placeholder="e.g. Authorized Samsung Care, Urban Company"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Parts Replaced</label>
            <input
              type="text"
              value={partsReplaced}
              onChange={(e) => setPartsReplaced(e.target.value)}
              placeholder="e.g. Defrost timer, Thermistor relay"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800"
            />
          </div>
        </div>

        {/* Upload Receipt */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Attach Service Bill / Receipt (PDF or Image)
          </label>
          <div className="border border-dashed border-slate-200 rounded-xl p-3 text-center bg-slate-50/50 hover:bg-slate-50 transition-colors relative cursor-pointer">
            <input
              type="file"
              accept=".pdf,image/png,image/jpeg,image/jpg"
              onChange={handleReceiptChange}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            {receiptFile ? (
              <div className="flex items-center justify-center gap-1.5 text-teal-700 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                <span className="truncate max-w-xs">{receiptFile.name}</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-1.5 text-slate-500 text-xs">
                <Upload className="w-4 h-4 text-teal-600" />
                <span>Upload repair receipt (auto-filed to Warranty Vault)</span>
              </div>
            )}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Notes / Diagnostic Comments</label>
          <textarea
            rows={2}
            value={repairNotes}
            onChange={(e) => setRepairNotes(e.target.value)}
            placeholder="e.g. Technician provided 90-day warranty on the replacement compressor sensor."
            className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800"
          />
        </div>

        {/* Submit */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || appliances.length === 0}
            className="px-5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-sm shadow-teal-600/20 transition-all cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Save Repair Record'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
