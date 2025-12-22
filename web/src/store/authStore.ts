import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  displayName?: string;
  profileImageUrl?: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  setToken: (token: string, user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setToken: (token, user) => {
        localStorage.setItem('echo_token', token);
        localStorage.setItem('echo_user', JSON.stringify(user));
        set({ token, user });
      },
      logout: () => {
        localStorage.removeItem('echo_token');
        localStorage.removeItem('echo_user');
        set({ token: null, user: null });
      },
    }),
    {
      name: 'echo-auth',
    }
  )
);
