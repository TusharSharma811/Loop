import {create} from 'zustand';

interface User {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
}

interface UserStore {
    user: User | null;
    setUser: (user: User) => void;
    clearUser: () => void;
}

const useUserStore = create<UserStore>((set) => ({
    user: null,
    setUser: (user : User) => set({ user }),
    clearUser: () => set({ user: null }),
    fetchUser: async () => {
      try {
        const response = await fetch('/api/auth/me', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include', // include cookies for auth
        });
        if (!response.ok) {
          throw new Error('Failed to fetch user');
        }
        const data: User = await response.json();
        set({ user: data });
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    },
}));

export default useUserStore;
