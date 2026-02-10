import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

export default function PrivateRoute({ children }: Props) {
  const { user, isLoading } = useAuthStore();

  if (isLoading) {
    console.log('isLoading, user', isLoading, user);
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: '#f0f0f3' }}
      >
        <p className="text-sm" style={{ color: '#9ca3af' }}>
          로딩 중...
        </p>
      </div>
    );
  }
  console.log('get reached here', isLoading, user);
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
