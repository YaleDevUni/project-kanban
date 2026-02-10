import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import LoginPage from '@/pages/LoginPage'

// ─── 모듈 모킹 ───────────────────────────────────────────────
const mockMutate = vi.fn()

vi.mock('@/hooks/useAuth', () => ({
  useLogin: () => ({
    mutate: mockMutate,
    isPending: false,
    error: null,
  }),
}))

describe('LoginPage', () => {
  it('로그인 폼이 올바르게 렌더링된다', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    )

    expect(screen.getByText('로그인')).toBeDefined()
    expect(screen.getByPlaceholderText('이메일을 입력해 주세요.')).toBeDefined()
    expect(screen.getByPlaceholderText('비밀번호를 입력해 주세요.')).toBeDefined()
    expect(screen.getByText('회원가입하기')).toBeDefined()
  })

  it('이메일과 비밀번호를 입력할 수 있다', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    )

    const emailInput = screen.getByPlaceholderText('이메일을 입력해 주세요.')
    const passwordInput = screen.getByPlaceholderText('비밀번호를 입력해 주세요.')

    fireEvent.change(emailInput, { target: { value: 'test@test.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })

    expect((emailInput as HTMLInputElement).value).toBe('test@test.com')
    expect((passwordInput as HTMLInputElement).value).toBe('password123')
  })

  it('폼 제출 시 login mutate가 호출된다', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    )

    const emailInput = screen.getByPlaceholderText('이메일을 입력해 주세요.')
    const passwordInput = screen.getByPlaceholderText('비밀번호를 입력해 주세요.')

    fireEvent.change(emailInput, { target: { value: 'test@test.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })

    // 폼 제출 (버튼 클릭)
    const submitBtn = screen.getByText('로그인')
    fireEvent.click(submitBtn)

    expect(mockMutate).toHaveBeenCalledWith({
      email: 'test@test.com',
      password: 'password123',
    })
  })

  it('로그인 버튼이 존재한다', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    )

    const btn = screen.getByText('로그인')
    expect(btn).toBeDefined()
  })
})
