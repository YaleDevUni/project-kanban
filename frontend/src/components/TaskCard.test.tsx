import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import TaskCard from '@/components/TaskCard'
import type { Task } from '@/types'

// ─── 모듈 모킹 ───────────────────────────────────────────────
vi.mock('@/hooks/useTasks', () => ({
  useUpdateTask: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
  useDeleteTask: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
}))

const mockTask: Task = {
  id: 'task-1',
  title: '테스트 일감',
  status: 'Todo',
  creator: { id: 'u1', name: '김철수', email: 'kim@test.com' },
  version: 1,
  order: 'a',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
}

describe('TaskCard', () => {
  const onDragStart = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('제목과 생성자 이름이 렌더링된다', () => {
    render(<TaskCard task={mockTask} onDragStart={onDragStart} />)

    expect(screen.getByText('테스트 일감')).toBeDefined()
    expect(screen.getByText(/김철수/)).toBeDefined()
  })

  it('제목을 클릭하면 편집 모드가 활성화된다', () => {
    render(<TaskCard task={mockTask} onDragStart={onDragStart} />)

    // 제목 클릭
    fireEvent.click(screen.getByText('테스트 일감'))

    // input이 나타남
    const input = screen.getByDisplayValue('테스트 일감')
    expect(input.tagName).toBe('INPUT')
  })

  it('편집 중 Escape를 누르면 편집 모드가 취소된다', () => {
    render(<TaskCard task={mockTask} onDragStart={onDragStart} />)

    // 편집 모드 진입
    fireEvent.click(screen.getByText('테스트 일감'))
    const input = screen.getByDisplayValue('테스트 일감')

    // Escape 키 입력
    fireEvent.keyDown(input, { key: 'Escape' })

    // input이 사라지고 원래 제목이 복원됨
    expect(screen.getByText('테스트 일감')).toBeDefined()
  })

  it('카드는 draggable 속성을 가진다', () => {
    const { container } = render(<TaskCard task={mockTask} onDragStart={onDragStart} />)
    const card = container.firstElementChild as HTMLElement
    expect(card.getAttribute('draggable')).toBe('true')
  })

  it('생성자 표시에 "담당자 :" 접두사가 있다', () => {
    render(<TaskCard task={mockTask} onDragStart={onDragStart} />)
    expect(screen.getByText(/담당자 : 김철수/)).toBeDefined()
  })
})
