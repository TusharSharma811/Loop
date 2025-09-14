import { create } from "zustand";
import api from "../lib/axiosInstance";

interface AuthState {
  isAuthenticated: boolean | null; // null = unknown
  setIsAuthenticated: (v: boolean) => void;
  checkAuth: () => Promise<void>;
}

const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: null,

  setIsAuthenticated: (v) => set({ isAuthenticated: v }),

  checkAuth: async () => {
    try {
      const res = await api.get("/auth/verify");
      if(res.data.valid){
        set({ isAuthenticated: true });
        return;
      }

      console.log("User is not authenticated");
      
      set({ isAuthenticated: false });
    } catch (err) {
      console.error("Auth check failed", err);
      set({ isAuthenticated: false });
    }
  },
}));

export default useAuthStore;
