import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useInitAuth } from '@/hooks/useAuth';
import PrivateRoute from '@/components/PrivateRoute';
import PublicRoute from '@/components/PublicRoute';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import BoardPage from '@/pages/BoardPage';
import WorkspacePage from '@/pages/WorkspacePage';

export default function App() {
  useInitAuth();

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />

        {/* Protected */}
        <Route
          path="/workspaces"
          element={
            <PrivateRoute>
              <WorkspacePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/board/:workspaceId"
          element={
            <PrivateRoute>
              <BoardPage />
            </PrivateRoute>
          }
        />

        {/* 기타 경로 → 워크스페이스 페이지로 리다이렉트 */}
        <Route
          path="*"
          element={
            <PrivateRoute>
              <WorkspacePage />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
