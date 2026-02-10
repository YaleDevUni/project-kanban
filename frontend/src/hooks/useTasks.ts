import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchTasks,
  createTask,
  updateTask,
  moveTask,
  deleteTask,
} from '@/api/task';
import { useTaskStore } from '@/stores/taskStore';
import { useDebouncedValue } from '@/hooks/useDebounceValue';
import type {
  Task,
  CreateTaskPayload,
  UpdateTaskPayload,
  MoveTaskPayload,
} from '@/types';
import axios from 'axios';

const CONFLICT_ALERT_MESSAGE =
  '이미 다른 사용자에 의해 수정된 태스크입니다. 다시시도해주세요';

function isConflictError(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 409;
}

/**
 * 태스크 목록 조회
 * 데이터 로드 시 store에 자동 반영
 * 검색어는 300ms 디바운스 적용
 */
export function useFetchTasks(workspaceId: string) {
  const setItemsFromTasks = useTaskStore((state) => state.setItemsFromTasks);
  const search = useTaskStore((state) => state.search);
  const debouncedSearch = useDebouncedValue(search, 300);

  const query = useQuery<Task[], Error>({
    queryKey: ['tasks', workspaceId, debouncedSearch],
    queryFn: () => fetchTasks(workspaceId, debouncedSearch || undefined),
    staleTime: 1000 * 60 * 5, // 5분간 fresh
    enabled: !!workspaceId,
  });

  useEffect(() => {
    if (query.data) {
      setItemsFromTasks(query.data);
    }
  }, [query.data, setItemsFromTasks]);

  useEffect(() => {
    if (query.error) {
      console.error('useFetchTasks: Failed to fetch tasks', query.error);
    }
  }, [query.error]);

  return query;
}

// 캐시에서 태스크 추가
function addTaskToCache(
  queryClient: ReturnType<typeof useQueryClient>,
  workspaceId: string,
  task: Task,
) {
  queryClient.setQueriesData<Task[]>(
    { queryKey: ['tasks', workspaceId] },
    (old) => (old ? [...old, task] : [task]),
  );
}

// 캐시에서 태스크 업데이트
function updateTaskInCache(
  queryClient: ReturnType<typeof useQueryClient>,
  workspaceId: string,
  task: Task,
) {
  queryClient.setQueriesData<Task[]>(
    { queryKey: ['tasks', workspaceId] },
    (old) => old?.map((t) => (t.id === task.id ? task : t)) ?? [],
  );
}

// 캐시에서 태스크 삭제
function removeTaskFromCache(
  queryClient: ReturnType<typeof useQueryClient>,
  workspaceId: string,
  taskId: string,
) {
  queryClient.setQueriesData<Task[]>(
    { queryKey: ['tasks', workspaceId] },
    (old) => old?.filter((t) => t.id !== taskId) ?? [],
  );
}

/**
 * 태스크 생성
 */
export function useCreateTask(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTaskPayload) =>
      createTask(workspaceId, payload),
    onSuccess: (task) => {
      addTaskToCache(queryClient, workspaceId, task);
    },
    onError: (error) => {
      if (isConflictError(error)) {
        alert(CONFLICT_ALERT_MESSAGE);
        queryClient.invalidateQueries({ queryKey: ['tasks', workspaceId] });
      }
    },
  });
}

/**
 * 태스크 수정
 */
export function useUpdateTask(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateTaskPayload }) =>
      updateTask(workspaceId, id, payload),
    onSuccess: (task) => {
      updateTaskInCache(queryClient, workspaceId, task);
    },
    onError: (error) => {
      if (isConflictError(error)) {
        alert(CONFLICT_ALERT_MESSAGE);
        queryClient.invalidateQueries({ queryKey: ['tasks', workspaceId] });
      }
    },
  });
}

/**
 * 태스크 이동
 */
export function useMoveTask(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: MoveTaskPayload }) =>
      moveTask(workspaceId, id, payload),
    onSuccess: (task) => {
      updateTaskInCache(queryClient, workspaceId, task);
    },
    onError: (error) => {
      if (isConflictError(error)) {
        alert(CONFLICT_ALERT_MESSAGE);
        queryClient.invalidateQueries({ queryKey: ['tasks', workspaceId] });
      }
    },
  });
}

/**
 * 태스크 삭제
 */
export function useDeleteTask(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTask(workspaceId, id),
    onSuccess: (_, id) => {
      removeTaskFromCache(queryClient, workspaceId, id);
    },
    onError: (error) => {
      if (isConflictError(error)) {
        alert(CONFLICT_ALERT_MESSAGE);
        queryClient.invalidateQueries({ queryKey: ['tasks', workspaceId] });
      }
    },
  });
}
