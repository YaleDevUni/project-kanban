import { useEffect, useRef } from 'react';
import { connectSSE, type TaskSSEEvent } from '@/api/task';
import { useTaskStore } from '@/stores/taskStore';

/**
 * SSE 연결을 관리하는 훅
 * 태스크 이벤트를 실시간으로 수신하여 store 업데이트
 */
export function useTaskSSE(workspaceId: string) {
  // 재연결 방지를 위한 ref
  const isConnectedRef = useRef(false);
  const currentWorkspaceIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!workspaceId) return;

    // 워크스페이스가 변경되면 재연결
    if (
      isConnectedRef.current &&
      currentWorkspaceIdRef.current === workspaceId
    ) {
      return;
    }

    console.log('useTaskSSE: Setting up SSE connection for workspace', workspaceId);
    isConnectedRef.current = true;
    currentWorkspaceIdRef.current = workspaceId;

    const handleEvent = (event: TaskSSEEvent) => {
      // Get store functions directly from the store to avoid stale closures
      const { addTask, updateTaskInList, removeTask } = useTaskStore.getState();

      switch (event.type) {
        case 'create':
          addTask(event.data);
          break;
        case 'update':
        case 'move':
          updateTaskInList(event.data);
          break;
        case 'delete':
          removeTask(event.data.id);
          break;
        default:
          console.warn('useTaskSSE: Unknown event type:', event);
      }
    };

    const handleError = (error: Event) => {
      console.error('useTaskSSE: Error occurred:', error);
    };

    const cleanup = connectSSE(workspaceId, handleEvent, handleError);

    return () => {
      isConnectedRef.current = false;
      currentWorkspaceIdRef.current = null;
      cleanup();
    };
  }, [workspaceId]);
}
