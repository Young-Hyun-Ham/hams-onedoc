"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useStore } from "zustand";
import { createUIStore, type UIState } from "@/stores/ui-store";
import {
  createWorkspaceStore,
  type WorkspaceState,
} from "@/stores/workspace-store";

const StoreContext = createContext<{
  ui: ReturnType<typeof createUIStore>;
  workspace: ReturnType<typeof createWorkspaceStore>;
} | null>(null);
export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [stores] = useState(() => ({
    ui: createUIStore(),
    workspace: createWorkspaceStore(),
  }));
  useEffect(() => {
    stores.ui
      .getState()
      .initializeTheme(
        document.documentElement.dataset.theme === "dark" ? "dark" : "light",
      );
  }, [stores]);
  return (
    <StoreContext.Provider value={stores}>{children}</StoreContext.Provider>
  );
}
function useStores() {
  const stores = useContext(StoreContext);
  if (!stores) throw new Error("AppStoreProvider is required");
  return stores;
}
export function useUI<T>(selector: (state: UIState) => T) {
  return useStore(useStores().ui, selector);
}
export function useWorkspace<T>(selector: (state: WorkspaceState) => T) {
  return useStore(useStores().workspace, selector);
}
export function useConfirmNavigation() {
  const dirty = useUI((s) => s.dirty);
  const setDirty = useUI((s) => s.setDirty);
  return () => {
    if (
      dirty &&
      !window.confirm(
        "저장되지 않은 임시 변경사항이 있습니다. 변경사항을 버리고 이동할까요?",
      )
    )
      return false;
    setDirty(false);
    return true;
  };
}
