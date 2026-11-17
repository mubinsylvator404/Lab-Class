import {
  INITIAL_CATEGORIES,
  INITIAL_NOTIFICATIONS,
  INITIAL_PORTFOLIOS,
  INITIAL_PROJECTS,
  INITIAL_REVIEWS,
  INITIAL_SETTINGS,
  INITIAL_USERS,
  INITIAL_APPLICATIONS,
} from '../data/demoData';
import {
  Application,
  Category,
  Notification,
  PlatformSettings,
  PortfolioItem,
  Project,
  Review,
  User,
} from '../types';

export const STORAGE_KEYS = {
  USERS: 'skillbridge_users',
  PROJECTS: 'skillbridge_projects',
  APPLICATIONS: 'skillbridge_applications',
  PORTFOLIOS: 'skillbridge_portfolios',
  REVIEWS: 'skillbridge_reviews',
  NOTIFICATIONS: 'skillbridge_notifications',
  CATEGORIES: 'skillbridge_categories',
  CURRENT_USER: 'skillbridge_current_user',
  SETTINGS: 'skillbridge_settings',
} as const;

const COLLECTION_KEYS = [
  STORAGE_KEYS.USERS,
  STORAGE_KEYS.PROJECTS,
  STORAGE_KEYS.APPLICATIONS,
  STORAGE_KEYS.PORTFOLIOS,
  STORAGE_KEYS.REVIEWS,
  STORAGE_KEYS.NOTIFICATIONS,
  STORAGE_KEYS.CATEGORIES,
  STORAGE_KEYS.SETTINGS,
];

export function generateId(prefix = 'sb'): string {
  const randomPart = Math.random().toString(36).slice(2, 8);
  const timePart = Date.now().toString(36);
  return `${prefix}-${timePart}-${randomPart}`;
}

export function getItem<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    const parsed = JSON.parse(raw) as T;
    if (parsed === null || parsed === undefined) return fallback;
    return parsed;
  } catch (err) {
    console.warn(`[SkillBridge Storage] Failed to parse key "${key}", using fallback.`, err);
    return fallback;
  }
}

export function setItem<T>(key: string, value: T): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    console.error(`[SkillBridge Storage] Failed to write key "${key}":`, err);
    return false;
  }
}

export function removeItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (err) {
    console.error(`[SkillBridge Storage] Failed to remove key "${key}":`, err);
  }
}

export function validateStoredData(): boolean {
  try {
    for (const key of COLLECTION_KEYS) {
      const raw = localStorage.getItem(key);
      if (!raw) return false;
      JSON.parse(raw);
    }
    const users = getItem<User[]>(STORAGE_KEYS.USERS, []);
    if (!Array.isArray(users) || users.length === 0) return false;
    const hasAdmin = users.some((u) => u.role === 'admin');
    if (!hasAdmin) return false;
    return true;
  } catch {
    return false;
  }
}

export function initializeData(): void {
  // Initialize each missing or corrupted collection individually so existing user data is never overwritten on refresh
  if (!localStorage.getItem(STORAGE_KEYS.USERS) || !Array.isArray(getItem(STORAGE_KEYS.USERS, null))) {
    setItem<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
  } else {
    // Ensure demo admin exists if users array was somehow empty
    const currentUsers = getItem<User[]>(STORAGE_KEYS.USERS, []);
    if (currentUsers.length === 0) {
      setItem<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
    }
  }

  if (!localStorage.getItem(STORAGE_KEYS.PROJECTS) || !Array.isArray(getItem(STORAGE_KEYS.PROJECTS, null))) {
    setItem<Project[]>(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS);
  }

  if (
    !localStorage.getItem(STORAGE_KEYS.APPLICATIONS) ||
    !Array.isArray(getItem(STORAGE_KEYS.APPLICATIONS, null))
  ) {
    setItem<Application[]>(STORAGE_KEYS.APPLICATIONS, INITIAL_APPLICATIONS);
  }

  if (!localStorage.getItem(STORAGE_KEYS.PORTFOLIOS) || !Array.isArray(getItem(STORAGE_KEYS.PORTFOLIOS, null))) {
    setItem<PortfolioItem[]>(STORAGE_KEYS.PORTFOLIOS, INITIAL_PORTFOLIOS);
  }

  if (!localStorage.getItem(STORAGE_KEYS.REVIEWS) || !Array.isArray(getItem(STORAGE_KEYS.REVIEWS, null))) {
    setItem<Review[]>(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
  }

  if (
    !localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) ||
    !Array.isArray(getItem(STORAGE_KEYS.NOTIFICATIONS, null))
  ) {
    setItem<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  }

  if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES) || !Array.isArray(getItem(STORAGE_KEYS.CATEGORIES, null))) {
    setItem<Category[]>(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
  }

  if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
    setItem<PlatformSettings>(STORAGE_KEYS.SETTINGS, {
      ...INITIAL_SETTINGS,
      demoInitializedAt: new Date().toISOString(),
    });
  }
}

export function resetDemoData(): void {
  setItem<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
  setItem<Project[]>(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS);
  setItem<Application[]>(STORAGE_KEYS.APPLICATIONS, INITIAL_APPLICATIONS);
  setItem<PortfolioItem[]>(STORAGE_KEYS.PORTFOLIOS, INITIAL_PORTFOLIOS);
  setItem<Review[]>(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
  setItem<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  setItem<Category[]>(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
  setItem<PlatformSettings>(STORAGE_KEYS.SETTINGS, {
    ...INITIAL_SETTINGS,
    demoInitializedAt: new Date().toISOString(),
  });
}

export interface StorageKeyStats {
  key: string;
  recordsCount: number | string;
  bytes: number;
  kb: string;
}

export function getStorageUsageInfo(): { totalBytes: number; totalKb: string; breakdown: StorageKeyStats[] } {
  let totalBytes = 0;
  const breakdown: StorageKeyStats[] = Object.values(STORAGE_KEYS).map((key) => {
    const raw = localStorage.getItem(key) || '';
    const bytes = new Blob([raw]).size;
    totalBytes += bytes;
    let recordsCount: number | string = '—';
    try {
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) recordsCount = parsed.length;
        else if (typeof parsed === 'object' && parsed !== null) recordsCount = 1;
      } else {
        recordsCount = 0;
      }
    } catch {
      recordsCount = 'Error';
    }
    return {
      key,
      recordsCount,
      bytes,
      kb: (bytes / 1024).toFixed(2),
    };
  });

  return {
    totalBytes,
    totalKb: (totalBytes / 1024).toFixed(2),
    breakdown,
  };
}
