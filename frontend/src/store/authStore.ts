import axios from "axios";
import { create } from "zustand";
import axiosInstance from "../lib/axiosInstance";


export type AuthState = {
  isAuthenticated: boolean;
  user:any | null;
  setIsAuthenticated: (value: boolean) => void;
  setUser: (user: any | null) => void;
  getUser: () => any | null;
  fetchUser: () => Promise<void>;
};

const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  setIsAuthenticated: (value: boolean) => set({ isAuthenticated: value }),
  user: null,
  setUser: (user: any | null) => set({ user }),
  getUser: () => { return useAuthStore.getState().user; },
  fetchUser: async () => {
    try {
      const response = await axiosInstance.get("/auth/me");
      set({ user: response.data.user });
    } catch (error) {
      console.error(error);
    }
  }
}));

export default useAuthStore;

