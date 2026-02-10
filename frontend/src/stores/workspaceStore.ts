import { create } from 'zustand';
import type { Workspace } from '@/types';

interface WorkspaceStore {
  workspaces: Workspace[];
  selectedWorkspaceId: string | null;
  editingWorkspaceId: string | null;

  setWorkspaces: (workspaces: Workspace[]) => void;
  addWorkspace: (workspace: Workspace) => void;
  updateWorkspace: (workspace: Workspace) => void;
  removeWorkspace: (id: string) => void;
  setSelectedWorkspaceId: (id: string | null) => void;
  setEditingWorkspaceId: (id: string | null) => void;
  getWorkspaceById: (id: string) => Workspace | undefined;
}

export const useWorkspaceStore = create<WorkspaceStore>((set, get) => ({
  workspaces: [],
  selectedWorkspaceId: null,
  editingWorkspaceId: null,

  setWorkspaces: (workspaces) => set({ workspaces }),

  addWorkspace: (workspace) =>
    set((state) => ({
      workspaces: [workspace, ...state.workspaces],
    })),

  updateWorkspace: (workspace) =>
    set((state) => ({
      workspaces: state.workspaces.map((w) =>
        w.id === workspace.id ? workspace : w,
      ),
    })),

  removeWorkspace: (id) =>
    set((state) => ({
      workspaces: state.workspaces.filter((w) => w.id !== id),
      selectedWorkspaceId:
        state.selectedWorkspaceId === id ? null : state.selectedWorkspaceId,
    })),

  setSelectedWorkspaceId: (id) => set({ selectedWorkspaceId: id }),

  setEditingWorkspaceId: (id) => set({ editingWorkspaceId: id }),

  getWorkspaceById: (id) => get().workspaces.find((w) => w.id === id),
}));
