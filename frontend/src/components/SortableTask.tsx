import docIconUrl from '@/assets/document.svg';
import closeIconUrl from '@/assets/close.svg';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task } from '@/types';
import { useUpdateTask, useDeleteTask } from '@/hooks/useTasks';
import { useTaskStore } from '@/stores/taskStore';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';

export function TaskCard(props: {
  task: Task;
  isDragging?: boolean;
  isOverlay?: boolean;
  onEditingChange?: (isEditing: boolean) => void;
}) {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const { task, onEditingChange, isOverlay } = props;
  const { user } = task;
  const [isEditing, setIsEditing] = useState(false);
  const [editingTitle, setEditingTitle] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const updateMut = useUpdateTask(workspaceId || '');
  const deleteMut = useDeleteTask(workspaceId || '');
  const updateTaskTitle = useTaskStore((state) => state.updateTaskTitle);
  const updateTaskInList = useTaskStore((state) => state.updateTaskInList);

  const displayTitle = isEditing ? editingTitle : task.title;

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    onEditingChange?.(isEditing);
  }, [isEditing, onEditingChange]);

  const handleTitleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTitle(task.title);
    setIsEditing(true);
  };

  const handleTitleSave = () => {
    const trimmedTitle = editingTitle.trim();
    if (trimmedTitle && trimmedTitle !== task.title) {
      // Optimistic update - immediately update UI
      const oldTask = updateTaskTitle(task.id, trimmedTitle);

      updateMut.mutate(
        {
          id: task.id,
          payload: { title: trimmedTitle, version: task.version },
        },
        {
          onError: () => {
            // Rollback on error
            if (oldTask) {
              updateTaskInList(oldTask);
            }
          },
          // SSE will handle the version update on success
        },
      );
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSave();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteMut.mutate(props.task.id);
  };

  return (
    <div
      className={`bg-white rounded-xl p-[16px] h-[101px] flex flex-col gap-4  border border-gray-400 ${
        isOverlay ? 'w-[352px] shadow-lg' : 'mx-[16px]'
      } ${props.isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src={docIconUrl} alt="" className="w-5 h-5 flex-shrink-0 " />
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={editingTitle}
              onChange={(e) => setEditingTitle(e.target.value)}
              onBlur={handleTitleSave}
              onKeyDown={handleKeyDown}
              onClick={(e) => e.stopPropagation()}
              className="font-semibold text-[16px]/[24px] border border-blue-400 rounded px-1 outline-none focus:ring-2 focus:ring-blue-300"
            />
          ) : (
            <span
              className="font-semibold text-[16px]/[24px] cursor-text hover:bg-gray-100 rounded px-1"
              onClick={handleTitleClick}
            >
              {displayTitle}
            </span>
          )}
        </div>
        <button
          onClick={handleDelete}
          className={`w-[24px] h-[24px] flex-shrink-0 bg-gray-200 rounded-sm p-1 hover:bg-red-200 transition-colors ${
            props.isDragging ? 'opacity-50' : ''
          }`}
        >
          <img
            src={closeIconUrl}
            alt="Delete"
            className="w-full h-full cursor-pointer"
          />
        </button>
      </div>
      <div className="text-[14px]/[21px] text-gray-500">
        당담자 : {user.name}
      </div>
    </div>
  );
}

export default function SortableTask(props: { id: string; task: Task }) {
  const [isEditing, setIsEditing] = useState(false);
  const handleEditingChange = useCallback((editing: boolean) => {
    setIsEditing(editing);
  }, []);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.id, disabled: isEditing });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: isDragging ? 'grabbing' : 'grab',
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="mx-[16px] rounded-xl p-[16px] h-[124px] border-2 border-dashed border-gray-400 bg-gray-100 opacity-50 "
      />
    );
  }

  return (
    <div>
      <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
        <TaskCard
          task={props.task}
          isDragging={isDragging}
          onEditingChange={handleEditingChange}
        />
      </div>
    </div>
  );
}
