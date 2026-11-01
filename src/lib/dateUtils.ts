import { WarrantyStatus } from '../types';

/**
 * Calculates the exact warranty status based on real-time current date.
 * - Active: Expiry date is more than 30 days away.
 * - Expiring Soon: Expiry date is within 30 days (inclusive of today).
 * - Expired: Expiry date has passed.
 * - Unknown: No valid expiry date provided.
 */
export function calculateWarrantyStatus(expiryDateStr?: string | null): WarrantyStatus {
  if (!expiryDateStr || expiryDateStr.trim() === '') {
    return 'Unknown';
  }

  const expiry = new Date(expiryDateStr);
  if (isNaN(expiry.getTime())) {
    return 'Unknown';
  }

  // Normalize today to start of day for clean day comparison
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const expiryDay = new Date(expiry.getFullYear(), expiry.getMonth(), expiry.getDate());

  const diffTime = expiryDay.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return 'Expired';
  } else if (diffDays <= 30) {
    return 'Expiring Soon';
  } else {
    return 'Active';
  }
}

/**
 * Returns number of days remaining until warranty expiration (negative if expired).
 */
export function getDaysRemaining(expiryDateStr?: string | null): number | null {
  if (!expiryDateStr) return null;
  const expiry = new Date(expiryDateStr);
  if (isNaN(expiry.getTime())) return null;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const expiryDay = new Date(expiry.getFullYear(), expiry.getMonth(), expiry.getDate());

  const diffTime = expiryDay.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Human-readable label for remaining time
 * e.g., "16 days left", "Today", "Expired 2 months ago", "2 years left"
 */
export function formatRemainingTime(expiryDateStr?: string | null): string {
  const days = getDaysRemaining(expiryDateStr);
  if (days === null) return 'Warranty unknown';

  if (days < 0) {
    const absDays = Math.abs(days);
    if (absDays === 1) return 'Expired yesterday';
    if (absDays < 30) return `Expired ${absDays} days ago`;
    const months = Math.floor(absDays / 30);
    if (months === 1) return 'Expired 1 month ago';
    if (months < 12) return `Expired ${months} months ago`;
    const years = (absDays / 365).toFixed(1);
    return `Expired ~${years} yrs ago`;
  }

  if (days === 0) return 'Expires today!';
  if (days === 1) return 'Expires tomorrow!';
  if (days <= 30) return `${days} days remaining`;
  if (days < 365) {
    const months = Math.round(days / 30);
    return `${months} month${months > 1 ? 's' : ''} remaining`;
  }
  const years = (days / 365).toFixed(1);
  return `${years} years remaining`;
}

/**
 * Calculates expiry date based on start date and warranty duration (in months).
 */
export function calculateExpiryDate(startDateStr: string, durationMonths: number): string {
  if (!startDateStr || !durationMonths || durationMonths <= 0) return '';
  const date = new Date(startDateStr);
  if (isNaN(date.getTime())) return '';

  const expiry = new Date(date);
  expiry.setMonth(expiry.getMonth() + Number(durationMonths));
  
  // Format as YYYY-MM-DD
  const yyyy = expiry.getFullYear();
  const mm = String(expiry.getMonth() + 1).padStart(2, '0');
  const dd = String(expiry.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Formats date string to friendly readable format like "Nov 15, 2026"
 */
export function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Formats currency amount
 */
export function formatCurrency(amount: number, currency: string = '₹'): string {
  if (amount === undefined || amount === null || isNaN(amount)) return `${currency}0`;
  return `${currency}${Number(amount).toLocaleString('en-IN')}`;
}

/**
 * Generates an official Google Search URL for the appliance's warranty/support policy in India.
 * Note: Clearly an external search suggestion, not fabricated official URL.
 */
export function getOfficialWarrantySearchUrl(brand: string, modelNumber?: string, category?: string): string {
  const parts = [
    brand,
    modelNumber,
    category,
    'official warranty policy customer support India service center',
  ].filter(Boolean);

  const query = parts.join(' ').trim();
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}
