import { createStore } from "zustand/vanilla";
export const THEME_KEY = "hams-onedoc-theme";
export type Theme = "light" | "dark";
export type UIState = {
  theme: Theme;
  themeReady: boolean;
  menuOpen: boolean;
  notice: string;
  dirty: boolean;
  setTheme: (value: Theme) => void;
  initializeTheme: (value: Theme) => void;
  setMenuOpen: (value: boolean) => void;
  notify: (value: string) => void;
  setDirty: (value: boolean) => void;
};
export const createUIStore = () =>
  createStore<UIState>()((set) => ({
    theme: "light",
    themeReady: false,
    menuOpen: false,
    notice: "",
    dirty: false,
    initializeTheme: (theme) => set({ theme, themeReady: true }),
    setTheme: (theme) => {
      document.documentElement.dataset.theme = theme;
      try {
        localStorage.setItem(THEME_KEY, theme);
      } catch {
        /* Theme remains usable without storage. */
      }
      set({ theme });
    },
    setMenuOpen: (menuOpen) => set({ menuOpen }),
    notify: (notice) => set({ notice }),
    setDirty: (dirty) => set({ dirty }),
  }));
