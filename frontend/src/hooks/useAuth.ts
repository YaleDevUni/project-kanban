import { useMutation, useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { useTaskStore } from '@/stores/taskStore';
import { register, login, logout, getMe } from '@/api/auth';
import type { RegisterPayload, LoginPayload } from '@/types';
import { useNavigate } from 'react-router-dom';

/**
 * 앱 초기화 시 내 정보 조회
 * 토큰이 없으면 바로 로딩 완료 처리
 * 토큰이 있으면 내 정보 조회 시도
 */
export function useInitAuth() {
  const { setAuth, setLoading } = useAuthStore();
  useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const token = localStorage.getItem('jwt_token');
      if (!token) {
        setLoading(false);
        return null;
      }
      try {
        const user = await getMe();
        setAuth(user, token);
        return user;
      } catch {
        setLoading(false);
        return null;
      }
    },
    staleTime: Infinity,
    retry: false,
  });
}

/**
 * 회원가입
 * 성공시 로그인 페이지로 이동
 */
export function useRegister() {
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: RegisterPayload) => register(payload),
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken);
      navigate('/login');
    },
    onError: (error: any) => {
      // 서버에서 내려준 메시지 출력
      if (error.response?.data?.message) {
        return error.response.data.message.join('\n');
      } else {
        alert(error.message);
      }
    },
  });
}

/**
 * 로그인
 * 성공시 워크스페이스 페이지로 이동
 */
export function useLogin() {
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: LoginPayload) => login(payload),
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken);
      navigate('/workspaces');
    },
  });
}

/**
 * 로그아웃
 * 성공시 로그인 페이지로 이동
 */
export function useLogout() {
  const { clearAuth } = useAuthStore();
  const resetTasks = useTaskStore((s) => s.setItemsFromTasks);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: () => logout(),
    onSuccess: () => {
      clearAuth();
      resetTasks([]);
      navigate('/login');
    },
    // 백엔드 실패해도 클라이언트 토큰 제거
    onError: () => {
      clearAuth();
      resetTasks([]);
      navigate('/login');
    },
  });
}
