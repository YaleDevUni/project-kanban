import { Task } from '../task.entity';

/** SSE 이벤트 타입 */
export type TaskEventType = 'create' | 'move' | 'update' | 'delete';

/** create, move, update 이벤트의 data (Task 엔티티) */
export type TaskEventDataWithTask = Task;

/** delete 이벤트의 data */
export type TaskEventDataDelete = { id: string };

/** 이벤트별 data 타입 */
export type TaskEventData =
  | TaskEventDataWithTask
  | TaskEventDataDelete;

/** EventEmitter2에서 emit되는 payload 구조 */
export interface TaskMessagePayload<T extends TaskEventData = TaskEventData> {
  workspaceId: string;
  type: TaskEventType;
  data: T;
}

/** SSE MessageEvent의 data 필드 구조 */
export interface TaskSseEventData<T extends TaskEventData = TaskEventData> {
  type: TaskEventType;
  data: T;
}

/** NestJS SSE 반환용 MessageEvent */
export interface TaskSseMessageEvent<T extends TaskEventData = TaskEventData>
  extends MessageEvent {
  data: TaskSseEventData<T>;
}
