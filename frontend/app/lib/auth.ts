// Simple authentication state management using localStorage

const AUTH_KEY = 'neobank_auth';

export interface User {
  email: string;
  name: string;
}

export function setAuth(user: User) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
}

export function getAuth(): User | null {
  const auth = localStorage.getItem(AUTH_KEY);
  return auth ? JSON.parse(auth) : null;
}

export function clearAuth() {
  localStorage.removeItem(AUTH_KEY);
}

export function isAuthenticated(): boolean {
  return getAuth() !== null;
}
