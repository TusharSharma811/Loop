import {create} from 'zustand';
import api from '../lib/axiosInstance';

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
      if (get().user) return; 
      try {
        set({ loading: true, error: null });
        const response = await api.get('/auth/me');
        if (!response.data.ok) {
          throw new Error('Failed to fetch user');
        }
        const data= response.data;
        console.log("Fetched user:", data);
        
        set({ user: data.user , loading: false, error: null });
      } catch (error) {
        console.error('Error fetching user:', error);
        if (error instanceof Error) {
          set({ loading: false, error: error.message });
        } else {
          set({ loading: false, error: 'An unknown error occurred' });
        }
      }
    },
}));

export default useUserStore;
