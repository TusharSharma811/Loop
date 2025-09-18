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
    loading: true,
    error: null,
    setUser: (user : User) => set({ user }),
    clearUser: () => set({ user: null }),
    fetchUser: async () => {
      if (get().user) return; 
      try {
        const response = await api.get('/user/me');
        const data= response.data;
        set({ user: data.user , loading: false, error: null });
      } catch (error) {
        if (error instanceof Error) {
          set({ loading: false, error: error.message });
        } else {
          set({ loading: false, error: 'An unknown error occurred' });
        }
      }
    },
}));

export default useUserStore;
