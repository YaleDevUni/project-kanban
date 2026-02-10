import { useRef, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  pointerWithin,
  rectIntersection,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
  type CollisionDetection,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import KanbanColumn from '@/components/KanbanColumn';
import { TaskCard } from '@/components/SortableTask';
import { useFetchTasks, useMoveTask } from '@/hooks/useTasks';
import { useTaskSSE } from '@/hooks/useTaskSSE';
import { useTaskStore } from '@/stores/taskStore';
import { useLogout } from '@/hooks/useAuth';
import { useFetchWorkspace } from '@/hooks/useWorkspaces';
import type { TaskStatus } from '@/types';

function debounce<T extends (...args: Parameters<T>) => void>(
  fn: T,
  delay: number,
): T {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  return ((...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  }) as T;
}

type ColumnId = 'todo' | 'doing' | 'done';
const COLUMN_IDS: ColumnId[] = ['todo', 'doing', 'done'];

const columnIdToStatus = (columnId: string): TaskStatus =>
  columnId.toUpperCase() as TaskStatus;

const customCollisionDetection: CollisionDetection = (args) => {
  const pointerCollisions = pointerWithin(args);

  if (pointerCollisions.length > 0) {
    const itemCollision = pointerCollisions.find(
      (c) => !COLUMN_IDS.includes(c.id as ColumnId),
    );
    if (itemCollision) {
      return [itemCollision];
    }
  }

  // Fall back to rectIntersection for column detection
  const rectCollisions = rectIntersection(args);
  if (rectCollisions.length > 0) {
    return rectCollisions;
  }

  // Final fallback to closestCenter
  return closestCenter(args);
};

export default function BoardPage() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const navigate = useNavigate();

  const {
    items,
    activeId,
    setActiveId,
    findContainer,
    moveBetweenContainers,
    reorderInContainer,
    clearItems,
  } = useTaskStore();

  // Track the original container when drag starts
  const originalContainerRef = useRef<ColumnId | null>(null);

  // 워크스페이스 변경 시 기존 태스크 초기화
  useEffect(() => {
    clearItems();
  }, [workspaceId, clearItems]);

  // Fetch workspace info
  const { data: workspace, isLoading: isWorkspaceLoading } = useFetchWorkspace(
    workspaceId || '',
  );

  useFetchTasks(workspaceId || '');
  const { mutate: moveTask } = useMoveTask(workspaceId || '');
  const search = useTaskStore((s) => s.search);
  const setSearch = useTaskStore((s) => s.setSearch);
  const logoutMut = useLogout();
  useTaskSSE(workspaceId || '');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  const getTaskById = (id: string) =>
    Object.values(items)
      .flat()
      .find((t) => t.id === id);
  const activeTask = activeId ? getTaskById(activeId) : undefined;

  // Debounced drag over handler to prevent rapid state updates
  const debouncedDragOver = useMemo(
    () =>
      debounce((event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        const draggingRect = (
          event as DragOverEvent & { draggingRect?: DOMRect }
        ).draggingRect;

        moveBetweenContainers(
          active.id as string,
          over.id as string,
          draggingRect,
          over,
        );
      }, 50),
    [moveBetweenContainers],
  );

  if (isWorkspaceLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-auto">
      <div className="mt-[56px] px-6 min-w-fit mx-auto w-fit">
        <div className="flex items-center justify-between h-[69px] w-[1194px] mb-[40px]">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                clearItems();
                navigate('/workspaces');
              }}
              className="text-gray-500 hover:text-gray-700 cursor-pointer"
              title="워크스페이스 목록으로"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <h1 className="text-xl font-bold tracking-wide">
              {workspace?.title || 'PROJECT'}
            </h1>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="검색어를 입력해 주세요."
                className="pr-8 pl-3 py-1.5 rounded-lg text-sm w-[340px] bg-input-gray text-input-black placeholder:text-placeholder-gray outline-none"
              />
            </div>

            <button
              onClick={() => logoutMut.mutate()}
              className="text-sm transition-colors underline cursor-pointer"
            >
              로그아웃
            </button>
          </div>
        </div>
        <div className="flex gap-5">
          <DndContext
            sensors={sensors}
            collisionDetection={customCollisionDetection}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            {(['todo', 'doing', 'done'] as const).map((id) => (
              <KanbanColumn
                key={id}
                id={id}
                tasks={items[id]}
                workspaceId={workspaceId || ''}
              />
            ))}

            <DragOverlay>
              {activeTask ? (
                <TaskCard task={activeTask} isDragging isOverlay />
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      </div>
    </div>
  );

  function handleDragStart(event: DragStartEvent) {
    const id = event.active.id as string;
    setActiveId(id);
    // Remember the original container
    originalContainerRef.current = findContainer(id) ?? null;
  }

  function handleDragOver(event: DragOverEvent) {
    debouncedDragOver(event);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    const originalContainer = originalContainerRef.current;

    // Reset state
    setActiveId(null);
    originalContainerRef.current = null;

    if (!over) return;

    const task = getTaskById(active.id as string);
    if (!task) return;

    // Current container is where the task is now
    const currentContainer = findContainer(active.id as string);
    if (!currentContainer) return;

    // Determine target container from over element
    const isOverColumn = ['todo', 'doing', 'done'].includes(over.id as string);
    const overContainer = isOverColumn
      ? (over.id as ColumnId)
      : findContainer(over.id as string);

    if (!overContainer) return;

    // Get current items in the target container
    const targetItems = [...items[currentContainer]];
    const activeIndex = targetItems.findIndex((t) => t.id === active.id);

    // Determine target index
    let targetIndex: number;

    if (isOverColumn) {
      // Dropped on column itself - place at end
      targetIndex = targetItems.length - 1;
    } else {
      // Dropped on a task
      targetIndex = targetItems.findIndex((t) => t.id === over.id);
      if (targetIndex === -1) {
        targetIndex = targetItems.length - 1;
      }
    }

    // Check if this is a cross-column move (compare original container with current)
    const isCrossColumnMove =
      originalContainer && originalContainer !== currentContainer;

    if (!isCrossColumnMove && activeIndex === targetIndex) {
      // Same column, same position - no move needed
      return;
    }

    // Reorder within same container if needed
    if (
      !isCrossColumnMove &&
      activeIndex >= 0 &&
      targetIndex >= 0 &&
      activeIndex !== targetIndex
    ) {
      reorderInContainer(currentContainer, activeIndex, targetIndex);
    }

    // Build the final order to calculate prev/next
    const itemsWithoutActive = targetItems.filter((t) => t.id !== task.id);
    const insertIndex = Math.min(
      Math.max(0, targetIndex >= 0 ? targetIndex : itemsWithoutActive.length),
      itemsWithoutActive.length,
    );

    const finalOrder = [
      ...itemsWithoutActive.slice(0, insertIndex),
      task,
      ...itemsWithoutActive.slice(insertIndex),
    ];

    const taskFinalIndex = finalOrder.findIndex((t) => t.id === task.id);
    const prevTask = taskFinalIndex > 0 ? finalOrder[taskFinalIndex - 1] : null;
    const nextTask =
      taskFinalIndex < finalOrder.length - 1
        ? finalOrder[taskFinalIndex + 1]
        : null;

    // Always call the move API to sync with backend
    moveTask({
      id: task.id,
      payload: {
        status: columnIdToStatus(currentContainer),
        prevTaskId: prevTask?.id ?? null,
        nextTaskId: nextTask?.id ?? null,
        version: task.version,
      },
    });
  }
}
