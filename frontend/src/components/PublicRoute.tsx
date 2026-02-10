import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

export default function PublicRoute({ children }: Props) {
  const { user, isLoading } = useAuthStore();
  if (isLoading) return null;

  if (user) {
    return <Navigate to="/workspaces" />;
  }

  return <>{children}</>;
}
