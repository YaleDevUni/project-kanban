import { apiClient } from '@/api/apiClient';
import type {
  RegisterPayload,
  LoginPayload,
  AuthResponse,
  User,
} from '@/types';

const BASE = '/auth';

/**
 * 회원 가입
 * @param payload
 * @returns Promise<AuthResponse>
 */
export async function register(
  payload: RegisterPayload,
): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>(
    BASE + '/register',
    payload,
  );
  return data;
}

/**
 * 로그인
 * @param payload
 * @returns Promise<AuthResponse>
 */
export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>(BASE + '/login', payload);
  return data;
}

/**
 * 로그아웃
 */
export async function logout(): Promise<void> {
  await apiClient.post(BASE + '/logout');
}

/**
 * 내 정보 조회
 * @returns Promise<User>
 */
export async function getMe(): Promise<User> {
  const { data } = await apiClient.get<User>(BASE + '/me');
  return data;
}
