import type { Task } from '../task.entity';

export type TaskSSEEventType = 'create' | 'move' | 'update' | 'delete';

export type TaskSSEPayload =
  | { type: 'create'; data: Task }
  | { type: 'update'; data: Task }
  | { type: 'move'; data: Task }
  | { type: 'delete'; data: { id: string } };

/** EventEmitter 내부용 (workspaceId 포함) */
export type TaskSSEMessagePayload = { workspaceId: string } & TaskSSEPayload;
