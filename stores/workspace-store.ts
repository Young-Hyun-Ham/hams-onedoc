import { createStore } from "zustand/vanilla";
export type WorkspaceState = {
  projectId: string | null;
  setProjectId: (projectId: string | null) => void;
};
export const createWorkspaceStore = () =>
  createStore<WorkspaceState>()((set) => ({
    projectId: null,
    setProjectId: (projectId) => set({ projectId }),
  }));
