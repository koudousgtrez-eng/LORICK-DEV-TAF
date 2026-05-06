import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'BUYER' | 'SELLER' | 'ADMIN';
}

interface AuthStore {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => {
    localStorage.clear();
    set({ user: null });
  },
}));
