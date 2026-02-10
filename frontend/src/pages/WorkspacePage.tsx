import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useFetchWorkspaces,
  useCreateWorkspace,
  useUpdateWorkspace,
  useDeleteWorkspace,
} from '@/hooks/useWorkspaces';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { useAuthStore } from '@/stores/authStore';
import { useLogout } from '@/hooks/useAuth';
import type { Workspace } from '@/types';

export default function WorkspacePage() {
  const navigate = useNavigate();
  const { isLoading, error } = useFetchWorkspaces();
  const createMutation = useCreateWorkspace();
  const updateMutation = useUpdateWorkspace();
  const deleteMutation = useDeleteWorkspace();
  const logoutMut = useLogout();

  const workspaces = useWorkspaceStore((s) => s.workspaces);
  const editingWorkspaceId = useWorkspaceStore((s) => s.editingWorkspaceId);
  const setEditingWorkspaceId = useWorkspaceStore(
    (s) => s.setEditingWorkspaceId,
  );

  const user = useAuthStore((s) => s.user);

  const [newTitle, setNewTitle] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = (e: FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    createMutation.mutate(
      { title: newTitle.trim() },
      {
        onSuccess: () => {
          setNewTitle('');
          setIsCreating(false);
        },
      },
    );
  };

  const handleStartEdit = (workspace: Workspace) => {
    setEditingWorkspaceId(workspace.id);
    setEditTitle(workspace.title);
  };

  const handleCancelEdit = () => {
    setEditingWorkspaceId(null);
    setEditTitle('');
  };

  const handleUpdate = (id: string) => {
    if (!editTitle.trim()) return;

    updateMutation.mutate(
      { id, payload: { title: editTitle.trim() } },
      {
        onSuccess: () => {
          setEditingWorkspaceId(null);
          setEditTitle('');
        },
      },
    );
  };

  const handleDelete = (id: string) => {
    if (confirm('워크스페이스를 삭제하시겠습니까? 모든 태스크도 함께 삭제됩니다.')) {
      deleteMutation.mutate(id);
    }
  };

  const handleEnterWorkspace = (id: string) => {
    navigate(`/board/${id}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">워크스페이스를 불러오는데 실패했습니다.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen ]">
      <div className="max-w-4xl mx-auto pt-12 px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">워크스페이스</h1>
          <button
            onClick={() => logoutMut.mutate()}
            className="text-sm text-gray-600 hover:text-gray-900 underline cursor-pointer"
          >
            로그아웃
          </button>
        </div>

        {/* Create Button / Form */}
        {!isCreating ? (
          <button
            onClick={() => setIsCreating(true)}
            className="w-full py-4 mb-6 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-green-400 hover:text-green-500 transition-colors cursor-pointer"
          >
            + 새 워크스페이스 만들기
          </button>
        ) : (
          <form
            onSubmit={handleCreate}
            className="mb-6 p-4 bg-white rounded-xl shadow-sm border border-gray-200"
          >
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="워크스페이스 이름을 입력하세요"
              autoFocus
              className="w-full px-3 py-2 mb-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
            />
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false);
                  setNewTitle('');
                }}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 cursor-pointer"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending || !newTitle.trim()}
                className="px-4 py-2 text-sm bg-green-400 text-white rounded-lg hover:bg-green-500 disabled:opacity-50 cursor-pointer"
              >
                {createMutation.isPending ? '생성 중...' : '만들기'}
              </button>
            </div>
          </form>
        )}

        {/* Workspace List */}
        <div className="space-y-3">
          {workspaces.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              아직 워크스페이스가 없습니다. 새로 만들어보세요!
            </div>
          ) : (
            workspaces.map((workspace) => (
              <div
                key={workspace.id}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                {editingWorkspaceId === workspace.id ? (
                  // Edit Mode
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      autoFocus
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleUpdate(workspace.id);
                        } else if (e.key === 'Escape') {
                          handleCancelEdit();
                        }
                      }}
                    />
                    <button
                      onClick={() => handleUpdate(workspace.id)}
                      disabled={updateMutation.isPending || !editTitle.trim()}
                      className="px-3 py-2 text-sm bg-green-400 text-white rounded-lg hover:bg-green-500 disabled:opacity-50 cursor-pointer"
                    >
                      저장
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 cursor-pointer"
                    >
                      취소
                    </button>
                  </div>
                ) : (
                  // View Mode
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => handleEnterWorkspace(workspace.id)}
                  >
                    <div>
                      <span
                        className={`font-semibold text-gray-900 inline ${
                          user?.id === workspace.creator.id
                            ? 'hover:text-green-600'
                            : ''
                        }`}
                        onClick={(e) => {
                          if (user?.id === workspace.creator.id) {
                            e.stopPropagation();
                            handleStartEdit(workspace);
                          }
                        }}
                      >
                        {workspace.title}
                      </span>
                      <p className="text-sm text-gray-500 mt-1">
                        생성자: {workspace.creator.name} ·{' '}
                        {new Date(workspace.createdAt).toLocaleDateString(
                          'ko-KR',
                        )}
                      </p>
                    </div>

                    {/* Actions - Only for creator */}
                    {user?.id === workspace.creator.id && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(workspace.id);
                          }}
                          disabled={deleteMutation.isPending}
                          className="p-2 text-gray-400 hover:text-red-500 cursor-pointer disabled:opacity-50"
                          title="삭제"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
