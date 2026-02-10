// frontend/src/api/task.ts
import { apiClient } from '@/api/apiClient';
import type {
  Task,
  CreateTaskPayload,
  UpdateTaskPayload,
  MoveTaskPayload,
} from '@/types';

const getBase = (workspaceId: string) => `/workspaces/${workspaceId}/tasks`;

/**
 * 태스크 목록 조회
 * @param workspaceId 워크스페이스 ID
 * @param search 검색어
 * @returns Promise<Task[]>
 */
export async function fetchTasks(
  workspaceId: string,
  search?: string,
): Promise<Task[]> {
  const params = search ? { search } : {};
  const { data } = await apiClient.get<Task[]>(getBase(workspaceId), { params });
  return data;
}

/**
 * 태스크 생성
 * @param workspaceId 워크스페이스 ID
 * @param payload 태스크 생성 페이로드
 * @returns Promise<Task>
 */
export async function createTask(
  workspaceId: string,
  payload: CreateTaskPayload,
): Promise<Task> {
  const { data } = await apiClient.post<Task>(getBase(workspaceId), payload);
  return data;
}

/**
 * 태스크 수정
 * @param workspaceId 워크스페이스 ID
 * @param id 태스크 ID
 * @param payload 태스크 수정 페이로드
 * @returns Promise<Task>
 */
export async function updateTask(
  workspaceId: string,
  id: string,
  payload: UpdateTaskPayload,
): Promise<Task> {
  const { data } = await apiClient.patch<Task>(
    `${getBase(workspaceId)}/${id}`,
    payload,
  );
  return data;
}

/**
 * 태스크 이동
 * @param workspaceId 워크스페이스 ID
 * @param id 태스크 ID
 * @param payload 태스크 이동 페이로드
 * @returns Promise<Task>
 */
export async function moveTask(
  workspaceId: string,
  id: string,
  payload: MoveTaskPayload,
): Promise<Task> {
  const { data } = await apiClient.patch<Task>(
    `${getBase(workspaceId)}/${id}/move`,
    payload,
  );
  return data;
}

/**
 * 태스크 삭제
 * @param workspaceId 워크스페이스 ID
 * @param id 태스크 ID
 * @returns Promise<void>
 */
export async function deleteTask(
  workspaceId: string,
  id: string,
): Promise<void> {
  await apiClient.delete(`${getBase(workspaceId)}/${id}`);
}

/**
 * 태스크 SSE 이벤트
 */
export type TaskSSEEvent =
  | { type: 'create'; data: Task }
  | { type: 'update'; data: Task }
  | { type: 'move'; data: Task }
  | { type: 'delete'; data: { id: string } };

/**
 * 태스크 SSE 연결
 * @param workspaceId 워크스페이스 ID
 * @param onEvent 이벤트 처리 함수
 * @param onError 에러 처리 함수
 * @returns 정리 함수
 */
export function connectSSE(
  workspaceId: string,
  onEvent: (event: TaskSSEEvent) => void,
  onError?: (error: Event) => void,
): () => void {
  const token = localStorage.getItem('jwt_token') || '';

  if (!token) {
    console.error('SSE: No JWT token found');
    return () => {};
  }

  // 백엔드가 쿼리 파라미터로 토큰을 받을 수 있도록 설정
  const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
  const url = `${baseURL}${getBase(workspaceId)}/events?token=${encodeURIComponent(token)}`;

  console.log('SSE: Connecting to', url);

  const eventSource = new EventSource(url);

  // 연결 성공
  eventSource.onopen = () => {
    console.log('SSE: Connection established');
  };

  // 메시지 수신
  eventSource.onmessage = (event: MessageEvent) => {
    try {
      const parsed = JSON.parse(event.data);

      // 백엔드에서 { type: 'create', data: Task } 형태로 전송
      if (parsed.type && parsed.data) {
        onEvent(parsed as TaskSSEEvent);
      } else {
        console.warn('SSE: Invalid event format:', parsed);
      }
    } catch (error) {
      console.error('SSE: Failed to parse message:', error, event.data);
    }
  };

  // 에러 처리
  eventSource.onerror = (error: Event) => {
    console.error('SSE: Connection error:', error);

    if (eventSource.readyState === EventSource.CLOSED) {
      console.log('SSE: Connection closed');
    } else if (eventSource.readyState === EventSource.CONNECTING) {
      console.log('SSE: Reconnecting...');
    }

    onError?.(error);
  };

  // cleanup 함수
  return () => {
    console.log('SSE: Closing connection');
    eventSource.close();
  };
}
