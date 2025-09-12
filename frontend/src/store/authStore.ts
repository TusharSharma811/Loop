import { create } from "zustand";


export type AuthState = {
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
};

const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  setIsAuthenticated: (value: boolean) => set({ isAuthenticated: value }),
}));

export default useAuthStore;

