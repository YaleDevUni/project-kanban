import { useState } from 'react';
import { useRegister } from '@/hooks/useAuth';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const registerMut = useRegister();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerMut.mutate({ name, email, password });
  };

  return (
    <div className="min-h-screen bg-auth-bg flex items-center justify-center">
      <div className="bg-white w-[723px] rounded-2xl pb-[72px] pt-[56px] shadow-lg">
        {/* 제목 */}
        <h1 className="text-center font-pretendard font-semibold text-[26px]/[38px] tracking-[-0.005em]">
          회원가입
        </h1>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 mt-[32px] mx-[189px]"
        >
          {/* 이름 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px]/[20px] font-[500] tracking-[-0.005em]">
              이름 <span className="text-indicator-red">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="이름을 입력해 주세요."
              className="w-full h-[46px] min-h-8 px-[12px] py-[12.5px] rounded-xl text-[14px]/[21px] min-w-[116px] bg-input-gray text-input-black placeholder:text-placeholder-gray"
            />
          </div>
          {/* 이메일 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px]/[20px] font-[500] tracking-[-0.005em]">
              이메일 <span className="text-indicator-red">*</span>
            </label>
            <input
              type="text"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일을 입력해 주세요."
              autoComplete="new-password"
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
          {registerMut.error && (
            <p className=" text-sm text-center text-red-500 ">
              {Array.isArray(registerMut.error.response?.data?.message)
                ? registerMut.error.response.data.message.join(', ')
                : '회원가입에 실패했습니다.'}
            </p>
          )}

          {/* 로그인 버튼 */}
          <button
            type="submit"
            disabled={registerMut.isPending}
            className={`
    w-full py-2.5 rounded-xl text-[14px]/[21px] font-semibold tracking-[-0.005em] transition-all mt-[48px] border border-gray-400
    ${
      name && email && password
        ? 'cursor-pointer'
        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
    }
  `}>{registerMut.isPending ? '회원가입 중...' : '회원가입'}</button>
      </form>
    </div>
  </div>
);
}
