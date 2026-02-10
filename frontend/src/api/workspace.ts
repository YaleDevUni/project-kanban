import { apiClient } from '@/api/apiClient';
import type {
  Workspace,
  CreateWorkspacePayload,
  UpdateWorkspacePayload,
} from '@/types';

const BASE = '/workspaces';

/**
 * 워크스페이스 목록 조회
 * @returns Promise<Workspace[]>
 */
export async function fetchWorkspaces(): Promise<Workspace[]> {
  const { data } = await apiClient.get<Workspace[]>(BASE);
  return data;
}

/**
 * 워크스페이스 단일 조회
 * @param id 워크스페이스 ID
 * @returns Promise<Workspace>
 */
export async function fetchWorkspace(id: string): Promise<Workspace> {
  const { data } = await apiClient.get<Workspace>(`${BASE}/${id}`);
  return data;
}

/**
 * 워크스페이스 생성
 * @param payload 워크스페이스 생성 페이로드
 * @returns Promise<Workspace>
 */
export async function createWorkspace(
  payload: CreateWorkspacePayload,
): Promise<Workspace> {
  const { data } = await apiClient.post<Workspace>(BASE, payload);
  return data;
}

/**
 * 워크스페이스 수정
 * @param id 워크스페이스 ID
 * @param payload 워크스페이스 수정 페이로드
 * @returns Promise<Workspace>
 */
export async function updateWorkspace(
  id: string,
  payload: UpdateWorkspacePayload,
): Promise<Workspace> {
  const { data } = await apiClient.patch<Workspace>(`${BASE}/${id}`, payload);
  return data;
}

/**
 * 워크스페이스 삭제
 * @param id 워크스페이스 ID
 * @returns Promise<void>
 */
export async function deleteWorkspace(id: string): Promise<void> {
  await apiClient.delete(`${BASE}/${id}`);
}
