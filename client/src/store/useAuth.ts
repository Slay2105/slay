import { create } from "zustand";
import api from "../lib/api";
import { PlayerProfile } from "../types";

type AuthState = {
  profile?: PlayerProfile;
  token?: string;
  loading: boolean;
  error?: string;
  login: (payload: { usernameOrEmail: string; password: string }) => Promise<void>;
  register: (payload: { username: string; email: string; password: string }) => Promise<void>;
  logout: () => void;
  hydrate: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  profile: undefined,
  token: localStorage.getItem("wolvesville-token") || undefined,
  loading: false,
  async hydrate() {
    const token = localStorage.getItem("wolvesville-token");
    if (!token) return;
    try {
      const { data } = await api.get("/auth/me");
      set({ profile: data.profile, token });
    } catch (error) {
      localStorage.removeItem("wolvesville-token");
      set({ profile: undefined, token: undefined });
    }
  },
  async login(payload) {
    set({ loading: true, error: undefined });
    try {
      const { data } = await api.post("/auth/login", payload);
      localStorage.setItem("wolvesville-token", data.token);
      set({ profile: data.profile, token: data.token, loading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || "Đăng nhập thất bại", loading: false });
    }
  },
  async register(payload) {
    set({ loading: true, error: undefined });
    try {
      await api.post("/auth/register", payload);
      await useAuthStore.getState().login({
        usernameOrEmail: payload.username,
        password: payload.password
      });
    } catch (error: any) {
      set({ error: error.response?.data?.message || "Đăng ký thất bại", loading: false });
    }
  },
  logout() {
    localStorage.removeItem("wolvesville-token");
    set({ profile: undefined, token: undefined });
  }
}));
