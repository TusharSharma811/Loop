import {create} from 'zustand';

export interface User {
    id: string;
    fullname: string;
    username: string;
    email: string;
    avatarUrl?: string;
}

interface UserStore {
    user: User | null;
    setUser: (user: User) => void;
    clearUser: () => void;
    fetchUser: () => Promise<void>;
    loading?: boolean;
    error?: string | null;
}

const useUserStore = create<UserStore>((set , get) => ({
    user: null,
    loading: false,
    error: null,
    setUser: (user : User) => set({ user }),
    clearUser: () => set({ user: null }),
    fetchUser: async () => {
      if (get().user) return; // already have user
      try {
        set({ loading: true, error: null });
        const response = await fetch('/api/auth/me', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include', // include cookies for auth
        });
        if (!response.ok) {
          throw new Error('Failed to fetch user');
        }
        const data= await response.json();
        console.log("Fetched user:", data);
        
        set({ user: data.user , loading: false, error: null });
      } catch (error) {
        console.error('Error fetching user:', error);
        set({ loading: false, error: error.message });
      }
    },
}));

export default useUserStore;
