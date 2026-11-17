import { User, UserRole } from '../types';
import { generateId, getItem, removeItem, setItem, STORAGE_KEYS } from './storageService';

export interface LoginPayload {
  email: string;
  password: string;
  remember?: boolean;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: Extract<UserRole, 'student' | 'client'>;
  university?: string;
  department?: string;
  companyName?: string;
}

export const authService = {
  getStoredSessionUserId(): string | null {
    const localSession = getItem<{ userId: string } | null>(STORAGE_KEYS.CURRENT_USER, null);
    if (localSession?.userId) return localSession.userId;
    try {
      const sessionRaw = sessionStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (sessionRaw) {
        const parsed = JSON.parse(sessionRaw) as { userId: string };
        return parsed?.userId || null;
      }
    } catch {
      return null;
    }
    return null;
  },

  persistSession(userId: string, remember = true): void {
    if (remember) {
      setItem(STORAGE_KEYS.CURRENT_USER, { userId, loggedInAt: new Date().toISOString() });
      sessionStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    } else {
      removeItem(STORAGE_KEYS.CURRENT_USER);
      sessionStorage.setItem(
        STORAGE_KEYS.CURRENT_USER,
        JSON.stringify({ userId, loggedInAt: new Date().toISOString() })
      );
    }
  },

  clearSession(): void {
    removeItem(STORAGE_KEYS.CURRENT_USER);
    try {
      sessionStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    } catch {
      // ignore
    }
  },

  authenticate(users: User[], payload: LoginPayload): { user?: User; error?: string } {
    const normalizedEmail = payload.email.trim().toLowerCase();
    const user = users.find((u) => u.email.toLowerCase() === normalizedEmail);
    if (!user) {
      return { error: 'No account found with that email address.' };
    }
    if (user.password !== payload.password) {
      return { error: 'Incorrect password. Please check your credentials.' };
    }
    if (user.status === 'suspended') {
      return {
        error:
          'This demonstration account has been suspended by an administrator. Contact admin@skillbridge.demo.',
      };
    }
    this.persistSession(user.id, payload.remember ?? true);
    return { user };
  },

  createUserRecord(users: User[], payload: RegisterPayload): { user?: User; error?: string } {
    const normalizedEmail = payload.email.trim().toLowerCase();
    const exists = users.some((u) => u.email.toLowerCase() === normalizedEmail);
    if (exists) {
      return { error: 'An account with this email address already exists.' };
    }
    // Never allow public admin registration
    if (payload.role !== 'student' && payload.role !== 'client') {
      return { error: 'Invalid account type selected.' };
    }

    const now = new Date().toISOString();
    const id = generateId(payload.role === 'student' ? 'stu' : 'cli');

    const newUser: User = {
      id,
      name: payload.name.trim(),
      email: normalizedEmail,
      password: payload.password,
      role: payload.role,
      status: 'active',
      createdAt: now,
      ...(payload.role === 'student'
        ? {
            studentProfile: {
              university: payload.university?.trim() || '',
              department: payload.department?.trim() || '',
              studentId: '',
              bio: '',
              skills: [],
              experienceLevel: 'Entry Level',
              education: '',
              githubUrl: '',
              linkedinUrl: '',
              websiteUrl: '',
              availability: 'Available Now',
              profileCompleted: false,
            },
          }
        : {
            clientProfile: {
              companyName: payload.companyName?.trim() || `${payload.name.trim()} Studio`,
              companyDescription: '',
              website: '',
              contactPhone: '',
              location: '',
            },
          }),
    };

    return { user: newUser };
  },
};
