import { mockUserAccount } from '@/lib/mock-data';

// Simple authentication state management using localStorage
const AUTH_KEY = 'xyzbank_auth';
const IN_APP_BALANCE_KEY = 'in_app_balance';

export interface User {
  email: string;
  name: string;
  externalAccountId?: string;
  phoneNumber?: string;
  streetAddress?: string[];
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  countryOfBirth?: string;
  investingChoice?: 'ai-wealth';
}

// Helper to check if localStorage is available (client-side only)
function isLocalStorageAvailable(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

export function setAuth(user: User) {
  if (isLocalStorageAvailable()) {
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
  }
}

export function getAuth(): User | null {
  if (!isLocalStorageAvailable()) {
    return null;
  }
  const auth = localStorage.getItem(AUTH_KEY);
  return auth ? JSON.parse(auth) : null;
}

export function clearAuth() {
  if (isLocalStorageAvailable()) {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(IN_APP_BALANCE_KEY);
  }
}

export function isAuthenticated(): boolean {
  return getAuth() !== null;
}

export function setExternalAccountId(accountId: string) {
  const user = getAuth();
  if (user) {
    setAuth({
      ...user,
      externalAccountId: accountId,
    });
  }
}

export function clearExternalAccountId() {
  const user = getAuth();
  if (user) {
    setAuth({
      ...user,
      externalAccountId: undefined,
    });
  }
}

export function setInvestingChoice(choice: 'ai-wealth') {
  const user = getAuth();
  if (user) {
    setAuth({
      ...user,
      investingChoice: choice,
    });
  }
}

export function getInvestingChoice(): 'ai-wealth' | null {
  const user = getAuth();
  return user?.investingChoice || null;
}

// In-App Balance Management
export function getInAppBalance(): number {
  if (isLocalStorageAvailable()) {
    const raw = localStorage.getItem(IN_APP_BALANCE_KEY);
    if (raw != null) {
      const num = parseFloat(raw);
      if (!Number.isNaN(num)) return num;
    }
  }
  return typeof mockUserAccount?.balance === 'number' ? mockUserAccount.balance : 0;
}

// Persist the in-app balance to localStorage (clamped to >= 0)
export function setInAppBalance(value: number) {
  if (isLocalStorageAvailable()) {
    localStorage.setItem(IN_APP_BALANCE_KEY, String(Math.max(0, value)));
  }
}
