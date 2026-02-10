import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useLogin } from '@/hooks/useAuth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const loginMut = useLogin();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    loginMut.mutate({ email, password });
  };

  return (
    <div className="min-h-screen bg-auth-bg flex items-center justify-center">
      <div className="bg-white w-[723px] rounded-2xl pb-[72px] pt-[56px] shadow-lg">
        {/* 제목 */}
        <h1 className="text-center font-pretendard font-semibold text-[26px]/[38px] tracking-[-0.005em]">
          로그인
        </h1>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 mt-[32px] mx-[189px]"
        >
          {/* 이메일 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px]/[20px] font-[500] tracking-[-0.005em]">
              이메일 <span className="text-indicator-red">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일을 입력해 주세요."
              className="w-full h-[46px] min-h-8 px-[12px] py-[12.5px] rounded-xl text-[14px]/[21px] min-w-[116px] bg-input-gray text-input-black placeholder:text-placeholder-gray"
            />
          </div>

          {/* 비밀번호 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px]/[20px] font-[500] tracking-[-0.005em]">
              비밀번호 <span className="text-indicator-red">*</span>
            </label>
            <input
              type="text"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력해 주세요."
              autoComplete="new-password"
              className="w-full h-[46px] min-h-8 px-[12px] py-[12.5px] rounded-xl text-[14px]/[21px] min-w-[116px] bg-input-gray text-input-black placeholder:text-placeholder-gray"
            />
          </div>

          {/* 에러 메시지 */}
          {loginMut.error && (
            <p className="text-sm text-center" style={{ color: '#ef4444' }}>
              이메일 또는 비밀번호가 올바르지 않습니다.
            </p>
          )}

          {/* 로그인 버튼 */}
          <button
            type="submit"
            disabled={loginMut.isPending}
            className={`
    w-full py-2.5 rounded-xl text-[14px]/[21px] font-semibold tracking-[-0.005em] transition-all mt-[48px]  border border-gray-400
    ${
      email && password
        ? ' cursor-pointer'
        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
    }
  `}
          >
            {loginMut.isPending ? '로그인 중...' : '로그인'}
          </button>

          {/* 회원가입 링크 */}
          <div className="text-center mt-1">
            <Link
              to="/register"
              className="text-sm underline text-link-register"
            >
              회원가입하기
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
