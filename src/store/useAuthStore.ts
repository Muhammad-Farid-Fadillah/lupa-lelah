import { create } from 'zustand';

interface UserData {
  uid: string;
  email: string | null;
  role: 'manager' | 'logistik' | 'barista' | 'unknown';
}

interface AuthState {
  user: UserData | null;
  setUser: (user: UserData | null) => void;
  clearUser: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}));
