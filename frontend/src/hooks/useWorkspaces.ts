import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchWorkspaces,
  fetchWorkspace,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace,
} from '@/api/workspace';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import type {
  Workspace,
  CreateWorkspacePayload,
  UpdateWorkspacePayload,
} from '@/types';
import { useEffect } from 'react';

/**
 * 워크스페이스 목록 조회
 * 데이터 로드 시 store에 자동 반영
 */
export function useFetchWorkspaces() {
  const setWorkspaces = useWorkspaceStore((state) => state.setWorkspaces);

  const query = useQuery<Workspace[], Error>({
    queryKey: ['workspaces'],
    queryFn: fetchWorkspaces,
    staleTime: 1000 * 60,
  });

  useEffect(() => {
    if (query.data) {
      setWorkspaces(query.data);
    }
  }, [query.data, setWorkspaces]);

  return query;
}

/**
 * 워크스페이스 단일 조회
 */
export function useFetchWorkspace(id: string) {
  return useQuery<Workspace, Error>({
    queryKey: ['workspace', id],
    queryFn: () => fetchWorkspace(id),
    enabled: !!id,
  });
}

/**
 * 워크스페이스 생성
 */
export function useCreateWorkspace() {
  const queryClient = useQueryClient();
  const addWorkspace = useWorkspaceStore((state) => state.addWorkspace);

  return useMutation({
    mutationFn: (payload: CreateWorkspacePayload) => createWorkspace(payload),
    onSuccess: (workspace) => {
      addWorkspace(workspace);
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    },
  });
}

/**
 * 워크스페이스 수정
 */
export function useUpdateWorkspace() {
  const queryClient = useQueryClient();
  const updateWorkspaceInStore = useWorkspaceStore(
    (state) => state.updateWorkspace,
  );

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateWorkspacePayload;
    }) => updateWorkspace(id, payload),
    onSuccess: (workspace) => {
      updateWorkspaceInStore(workspace);
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      queryClient.invalidateQueries({ queryKey: ['workspace', workspace.id] });
    },
  });
}

/**
 * 워크스페이스 삭제
 */
export function useDeleteWorkspace() {
  const queryClient = useQueryClient();
  const removeWorkspace = useWorkspaceStore((state) => state.removeWorkspace);

  return useMutation({
    mutationFn: (id: string) => deleteWorkspace(id),
    onSuccess: (_, id) => {
      removeWorkspace(id);
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    },
  });
}
