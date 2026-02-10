// ─── Auth Types ──────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

// ─── Task Types ──────────────────────────────────────────────
export type TaskStatus = 'TODO' | 'DOING' | 'DONE';

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  user: User;
  version: number;
  position: string; // LexoRank 문자열
}

export interface CreateTaskPayload {
  status: TaskStatus;
}

export interface UpdateTaskPayload {
  title: string;
  version: number;
}

export interface MoveTaskPayload {
  status: TaskStatus;
  nextTaskId: string | null; // 이 카드 아래로 이동 (null이면 맨 위)
  prevTaskId: string | null; // 이 카드 위로 이동 (null이면 맨 아래)
  version: number;
}

// ─── SSE Event Types ─────────────────────────────────────────
export type SSEEventType = 'create' | 'move' | 'update' | 'delete';

export interface SSEPayload {
  type: SSEEventType;
  data: Task;
}

// ─── Kanban Column ───────────────────────────────────────────
export interface KanbanColumn {
  status: TaskStatus;
  title: string;
  tasks: Task[];
}

// ─── Workspace Types ─────────────────────────────────────────
export interface Workspace {
  id: string;
  title: string;
  creator: {
    id: string;
    name: string;
  };
  createdAt: string;
}

export interface CreateWorkspacePayload {
  title: string;
}

export interface UpdateWorkspacePayload {
  title: string;
}
