import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
interface User {
  id: string;
  email?: string;
  isAdmin?: boolean;
}
interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string, user: { id: string; email?: string }) => void;
  logout: () => void;
}
// This is a mock admin check for demonstration purposes.
// In a real application, this role would come from the JWT payload.
const ADMIN_EMAIL = 'admin@chronobank.dev';
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      login: (token, user) => {
        const isAdmin = user.email === ADMIN_EMAIL;
        set({ token, user: { ...user, isAdmin }, isAuthenticated: true });
      },
      logout: () => set({ token: null, user: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage', // unique name
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
    }
  )
);