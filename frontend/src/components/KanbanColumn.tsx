import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import type { Task, TaskStatus } from '@/types';
import SortableTask from './SortableTask';
import { useCreateTask } from '@/hooks/useTasks';

type ColumnId = 'todo' | 'doing' | 'done';

const COLUMN_CONFIG: Record<
  ColumnId,
  { label: string; bg: string; labelBg: string }
> = {
  todo: { label: 'Todo', bg: '', labelBg: '' },
  doing: { label: 'Doing', bg: '', labelBg: '' },
  done: { label: 'Done', bg: '', labelBg: '' },
};

interface KanbanColumnProps {
  id: ColumnId;
  tasks: Task[];
  workspaceId: string;
}

export default function KanbanColumn({
  id,
  tasks = [],
  workspaceId,
}: KanbanColumnProps) {
  const createMut = useCreateTask(workspaceId);
  const status = id.toUpperCase() as TaskStatus;
  const { setNodeRef } = useDroppable({ id });
  const config = COLUMN_CONFIG[id];

  return (
    <SortableContext
      id={id}
      items={tasks.map((t) => t.id)}
      strategy={verticalListSortingStrategy}  
    >
      {/* shadow four sides */}
      <div
        ref={setNodeRef}
        className={`w-[384px] rounded-xl h-fit ${config.bg} shadow-md border border-gray-200 `}
      > 
        <div
          className={`${config.labelBg} rounded-4xl py-0.5 px-[18px] mb-[20px] mx-[16px] mt-[16px] w-fit font-semibold bg-white border border-gray-200`}
        >
          {config.label}
        </div>

        <div className="flex flex-col gap-2 mb-[8px]">
          {tasks.map((task) => (
            <SortableTask key={task.id} id={task.id} task={task} />
          ))}
        </div>

        <button
          onClick={() => createMut.mutate({ status })}
          disabled={createMut.isPending}
          className="border border-gray-400 rounded-xl mx-[16px] mb-[16px] p-[16px] h-[64px] flex items-center gap-[8px] w-[calc(100%-32px)] cursor-pointer opacity-70 text-link-register"
        >
          <span className="text-2xl">+</span>
          <span className="font-semibold text-[16px]/[24px]">새 프로젝트</span>
        </button>
      </div>
    </SortableContext>
  );
}
