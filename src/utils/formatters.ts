import { ApplicationStatus, ProjectStatus, ProjectType, UserStatus } from '../types';

export function formatCurrency(amount: number, type?: ProjectType): string {
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
  return type === 'Hourly' ? `${formatted}/hr` : formatted;
}

export function formatDate(dateString: string): string {
  if (!dateString) return '—';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '';
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays}d ago`;
  return formatDate(dateString);
}

export function getInitials(name: string): string {
  if (!name) return 'SB';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function getApplicationStatusStyle(status: ApplicationStatus): {
  text: string;
  bg: string;
  border: string;
} {
  switch (status) {
    case 'Pending':
      return { text: 'text-amber-800', bg: 'bg-amber-50', border: 'border-amber-200' };
    case 'Under Review':
      return { text: 'text-blue-800', bg: 'bg-blue-50', border: 'border-blue-200' };
    case 'Shortlisted':
      return { text: 'text-indigo-800', bg: 'bg-indigo-50', border: 'border-indigo-200' };
    case 'Accepted':
      return { text: 'text-emerald-800', bg: 'bg-emerald-50', border: 'border-emerald-200' };
    case 'Rejected':
      return { text: 'text-rose-800', bg: 'bg-rose-50', border: 'border-rose-200' };
    case 'Withdrawn':
      return { text: 'text-slate-600', bg: 'bg-slate-100', border: 'border-slate-200' };
  }
}

export function getProjectStatusStyle(status: ProjectStatus): {
  text: string;
  bg: string;
  border: string;
} {
  switch (status) {
    case 'Published':
      return { text: 'text-blue-800', bg: 'bg-blue-50', border: 'border-blue-200' };
    case 'In Progress':
      return { text: 'text-indigo-800', bg: 'bg-indigo-50', border: 'border-indigo-200' };
    case 'Completed':
      return { text: 'text-emerald-800', bg: 'bg-emerald-50', border: 'border-emerald-200' };
    case 'Draft':
      return { text: 'text-amber-800', bg: 'bg-amber-50', border: 'border-amber-200' };
    case 'Closed':
      return { text: 'text-slate-600', bg: 'bg-slate-100', border: 'border-slate-200' };
  }
}

export function getUserStatusStyle(status: UserStatus): {
  text: string;
  bg: string;
  border: string;
} {
  return status === 'active'
    ? { text: 'text-emerald-800', bg: 'bg-emerald-50', border: 'border-emerald-200' }
    : { text: 'text-rose-800', bg: 'bg-rose-50', border: 'border-rose-200' };
}

export function readFileAsDataUrl(file: File, maxKb = 350): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Please select a valid image file (PNG, JPG, WebP).'));
      return;
    }
    const maxBytes = maxKb * 1024;
    if (file.size > maxBytes) {
      reject(
        new Error(
          `Image size (${Math.round(file.size / 1024)}KB) exceeds the ${maxKb}KB LocalStorage limit. Please upload a smaller image.`
        )
      );
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to read image file.'));
      }
    };
    reader.onerror = () => reject(new Error('Error reading selected file.'));
    reader.readAsDataURL(file);
  });
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function isValidUrl(url: string): boolean {
  if (!url.trim()) return true;
  try {
    const parsed = new URL(url.trim());
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}
