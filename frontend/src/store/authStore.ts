import { create } from "zustand";

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
      const res = await fetch("/api/auth/verify", { credentials: "include" });

      if (res.ok) {
        const data = await res.json();
        if (data.valid) {
          set({ isAuthenticated: true });
          return;
        }
      }

      // If access token invalid → try refresh
      const refreshRes = await fetch("/api/auth/refresh-token", { credentials: "include" });
      if (refreshRes.ok) {
        const data = await refreshRes.json();
        if (data.valid) {
          set({ isAuthenticated: true });
          return;
        }
      }

      set({ isAuthenticated: false });
    } catch (err) {
      console.error("Auth check failed", err);
      set({ isAuthenticated: false });
    }
  },
}));

export default useAuthStore;
