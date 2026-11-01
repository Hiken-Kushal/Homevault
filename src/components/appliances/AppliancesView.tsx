import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Appliance, ApplianceCategory, WarrantyStatus } from '../../types';
import { ApplianceCard } from './ApplianceCard';
import { ApplianceDetailModal } from './ApplianceDetailModal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { calculateWarrantyStatus, getDaysRemaining } from '../../lib/dateUtils';
import {
  Search,
  Filter,
  Plus,
  ScanLine,
  SlidersHorizontal,
  Cpu,
  Layers,
} from 'lucide-react';

const CATEGORIES: ('All' | ApplianceCategory)[] = [
  'All',
  'Refrigerator',
  'Washing Machine',
  'Television',
  'Air Conditioner',
  'Microwave',
  'Laptop',
  'Dishwasher',
  'Vacuum Cleaner',
  'Water Purifier',
  'Other',
];

const STATUS_FILTERS: ('All' | WarrantyStatus)[] = [
  'All',
  'Active',
  'Expiring Soon',
  'Expired',
  'Unknown',
];

type SortOption = 'newest' | 'expiry_soon' | 'price_desc' | 'price_asc' | 'name_asc';

export const AppliancesView: React.FC = () => {
  const {
    appliances,
    deleteAppliance,
    setIsAddApplianceOpen,
    setIsScannerOpen,
    setApplianceToEdit,
    selectedApplianceId,
    setSelectedApplianceId,
    searchQuery,
    setSearchQuery,
  } = useApp();

  // Local filter states
  const [selectedCategory, setSelectedCategory] = useState<'All' | ApplianceCategory>('All');
  const [selectedStatus, setSelectedStatus] = useState<'All' | WarrantyStatus>('All');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  // Filtered and sorted appliances
  const filteredAppliances = useMemo(() => {
    return appliances
      .filter((app) => {
        // Search query filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = app.name.toLowerCase().includes(q);
          const matchBrand = app.brand.toLowerCase().includes(q);
          const matchModel = app.modelNumber?.toLowerCase().includes(q);
          const matchSerial = app.serialNumber?.toLowerCase().includes(q);
          const matchSeller = app.seller?.toLowerCase().includes(q);
          if (!matchName && !matchBrand && !matchModel && !matchSerial && !matchSeller) {
            return false;
          }
        }

        // Category filter
        if (selectedCategory !== 'All' && app.category !== selectedCategory) {
          return false;
        }

        // Warranty status filter
        if (selectedStatus !== 'All') {
          const status = calculateWarrantyStatus(app.warrantyExpiryDate);
          if (status !== selectedStatus) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'expiry_soon': {
            const aDays = getDaysRemaining(a.warrantyExpiryDate) ?? 99999;
            const bDays = getDaysRemaining(b.warrantyExpiryDate) ?? 99999;
            return aDays - bDays;
          }
          case 'price_desc':
            return (b.purchasePrice || 0) - (a.purchasePrice || 0);
          case 'price_asc':
            return (a.purchasePrice || 0) - (b.purchasePrice || 0);
          case 'name_asc':
            return a.name.localeCompare(b.name);
          case 'newest':
          default:
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
      });
  }, [appliances, searchQuery, selectedCategory, selectedStatus, sortBy]);

  const handleEdit = (app: Appliance) => {
    setApplianceToEdit(app);
    setIsAddApplianceOpen(true);
  };

  const handleDeleteRequest = (id: string, name: string) => {
    setDeleteTarget({ id, name });
  };

  const handleConfirmDelete = async () => {
    if (deleteTarget) {
      await deleteAppliance(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header & Action Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>My Appliances</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {filteredAppliances.length} of {appliances.length}
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your registered appliances, coverage periods, and invoices.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsScannerOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-800 font-semibold text-xs transition-colors cursor-pointer"
          >
            <ScanLine className="w-4 h-4 text-teal-600" />
            <span>Scan Invoice</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setApplianceToEdit(null);
              setIsAddApplianceOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm shadow-teal-600/20 transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Appliance</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3.5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, brand, model or serial number..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800 placeholder-slate-400"
            />
          </div>

          {/* Warranty Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 hidden sm:inline">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            >
              {STATUS_FILTERS.map((st) => (
                <option key={st} value={st}>
                  {st === 'All' ? 'All Statuses' : st}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 hidden sm:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            >
              <option value="newest">Recently Added</option>
              <option value="expiry_soon">Expiring Soonest</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="name_asc">Name: A to Z</option>
            </select>
          </div>
        </div>

        {/* Category Horizontal Scroll Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 no-scrollbar">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Appliances Grid */}
      {filteredAppliances.length === 0 ? (
        <div className="py-16 px-4 text-center rounded-3xl bg-white border border-slate-200/90 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-3.5">
            <Cpu className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">No appliances found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-5">
            {searchQuery || selectedCategory !== 'All' || selectedStatus !== 'All'
              ? 'Try adjusting your search filters to find what you are looking for.'
              : 'Start protecting your home by adding your first appliance.'}
          </p>

          <div className="flex items-center justify-center gap-3">
            {(searchQuery || selectedCategory !== 'All' || selectedStatus !== 'All') && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                  setSelectedStatus('All');
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Clear Filters
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setApplianceToEdit(null);
                setIsAddApplianceOpen(true);
              }}
              className="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-colors cursor-pointer"
            >
              Add Appliance
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAppliances.map((app) => (
            <ApplianceCard
              key={app.id}
              appliance={app}
              onEdit={handleEdit}
              onDelete={handleDeleteRequest}
              onView={(id) => setSelectedApplianceId(id)}
            />
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <ApplianceDetailModal
        applianceId={selectedApplianceId}
        onClose={() => setSelectedApplianceId(null)}
        onEdit={handleEdit}
        onDelete={handleDeleteRequest}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Appliance?"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? All associated warranty documents and repair logs will also be permanently removed from your vault.`}
        confirmLabel="Delete Appliance"
        isDestructive={true}
      />
    </div>
  );
};
