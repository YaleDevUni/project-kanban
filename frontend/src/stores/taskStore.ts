// src/stores/taskStore.ts
import { create } from 'zustand';
import { arrayMove } from '@dnd-kit/sortable';
import type { Task, TaskStatus } from '@/types';

type ColumnId = 'todo' | 'doing' | 'done';
type ItemsState = Record<ColumnId, Task[]>;

const COLUMN_IDS: ColumnId[] = ['todo', 'doing', 'done'];

const createEmptyItems = (): ItemsState => ({
  todo: [],
  doing: [],
  done: [],
});

const statusToColumnId = (status: TaskStatus): ColumnId =>
  status.toLowerCase() as ColumnId;

const sortByPosition = (tasks: Task[]): Task[] =>
  [...tasks].sort((a, b) =>
    a.position === b.position ? 0 : a.position < b.position ? -1 : 1,
  );

const groupTasksByColumn = (tasks: Task[]): ItemsState => {
  const grouped = createEmptyItems();

  tasks.forEach((task) => {
    const column = statusToColumnId(task.status);
    grouped[column].push(task);
  });

  COLUMN_IDS.forEach((column) => {
    grouped[column] = sortByPosition(grouped[column]);
  });

  return grouped;
};

const removeTaskFromItems = (items: ItemsState, id: string): ItemsState => {
  const updated: ItemsState = { ...items };

  COLUMN_IDS.forEach((column) => {
    updated[column] = updated[column].filter((task) => task.id !== id);
  });

  return updated;
};

interface TaskStore {
  items: ItemsState;
  activeId: string | null;
  search: string;
  setSearch: (search: string) => void;
  setActiveId: (id: string | null) => void;
  setItemsFromTasks: (tasks: Task[]) => void;
  clearItems: () => void;
  addTask: (task: Task) => void;
  updateTaskInList: (task: Task) => void;
  updateTaskTitle: (id: string, title: string) => Task | undefined;
  removeTask: (id: string) => void;
  findContainer: (id: string) => ColumnId | undefined;
  getTask: (id: string) => Task | undefined;
  moveBetweenContainers: (
    activeId: string,
    overId: string,
    draggingRect?: any,
    over?: any,
  ) => void;
  reorderInContainer: (containerId: ColumnId, from: number, to: number) => void;
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  items: createEmptyItems(),
  activeId: null,
  search: '',
  setActiveId: (id) => set({ activeId: id }),
  setSearch: (search) => set({ search }),
  setItemsFromTasks: (tasks) => set({ items: groupTasksByColumn(tasks) }),
  clearItems: () => set({ items: createEmptyItems(), search: '' }),

  addTask: (task) =>
    set((state) => {
      const column = statusToColumnId(task.status);
      const cleaned = removeTaskFromItems(state.items, task.id);

      return {
        items: {
          ...cleaned,
          [column]: sortByPosition([...cleaned[column], task]),
        },
      };
    }),

  updateTaskInList: (task) =>
    set((state) => {
      // Skip updates for the task being dragged to prevent conflicts
      if (state.activeId === task.id) {
        return state;
      }

      const cleaned = removeTaskFromItems(state.items, task.id);
      const targetColumn = statusToColumnId(task.status);

      return {
        items: {
          ...cleaned,
          [targetColumn]: sortByPosition([...cleaned[targetColumn], task]),
        },
      };
    }),

  // Optimistic update for title only - returns the old task for rollback
  updateTaskTitle: (id, title) => {
    const { items } = get();
    let oldTask: Task | undefined;

    for (const column of COLUMN_IDS) {
      const taskIndex = items[column].findIndex((t) => t.id === id);
      if (taskIndex !== -1) {
        oldTask = { ...items[column][taskIndex] };
        const updatedTasks = [...items[column]];
        updatedTasks[taskIndex] = { ...updatedTasks[taskIndex], title };
        set({
          items: {
            ...items,
            [column]: updatedTasks,
          },
        });
        break;
      }
    }

    return oldTask;
  },

  getTask: (id) => {
    const { items } = get();
    for (const column of COLUMN_IDS) {
      const task = items[column].find((t) => t.id === id);
      if (task) return task;
    }
    return undefined;
  },

  removeTask: (id) =>
    set((state) => ({
      items: removeTaskFromItems(state.items, id),
    })),

  findContainer: (id) => {
    const { items } = get();
    if (COLUMN_IDS.includes(id as ColumnId)) return id as ColumnId;
    return COLUMN_IDS.find((key) => items[key].some((task) => task.id === id));
  },

  moveBetweenContainers: (activeId, overId, draggingRect, over) => {
    const { items, findContainer } = get();
    const activeContainer = findContainer(activeId);
    const overContainer = findContainer(overId);

    if (
      !activeContainer ||
      !overContainer ||
      activeContainer === overContainer
    ) {
      return;
    }

    const activeItems = items[activeContainer];
    const overItems = items[overContainer];
    const activeIndex = activeItems.findIndex((t) => t.id === activeId);
    if (activeIndex === -1) return;

    const activeTask = activeItems[activeIndex];
    const isOverColumn = COLUMN_IDS.includes(overId as ColumnId);

    let newIndex: number;

    if (isOverColumn) {
      newIndex = overItems.length;
    } else {
      const overIndex = overItems.findIndex((t) => t.id === overId);
      const isBelowLastItem =
        over &&
        draggingRect &&
        overIndex === overItems.length - 1 &&
        draggingRect.offsetTop > over.rect.offsetTop + over.rect.height;

      newIndex =
        overIndex >= 0
          ? overIndex + (isBelowLastItem ? 1 : 0)
          : overItems.length;
    }

    set({
      items: {
        ...items,
        [activeContainer]: activeItems.filter((t) => t.id !== activeId),
        [overContainer]: [
          ...overItems.slice(0, newIndex),
          activeTask,
          ...overItems.slice(newIndex),
        ],
      },
    });
  },

  reorderInContainer: (containerId, from, to) => {
    const { items } = get();

    set({
      items: {
        ...items,
        [containerId]: arrayMove(items[containerId], from, to),
      },
    });
  },
}));
