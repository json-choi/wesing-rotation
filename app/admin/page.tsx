'use client';

import { useActionState } from 'react';
import { login } from '@/lib/actions';
import Link from 'next/link';

const initialState = { error: '' };

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      const result = await login(formData);
      return result ?? initialState;
    },
    initialState
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo area */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-600 text-white text-2xl mb-4 shadow-lg">
            ♪
          </div>
          <h1 className="text-2xl font-bold text-gray-800">관리자 로그인</h1>
          <p className="text-sm text-gray-500 mt-1">위싱 찬양팀 로테이션 관리</p>
        </div>

        {/* Login form */}
        <form action={formAction} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
              비밀번호
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoFocus
              className="input-field"
              placeholder="관리자 비밀번호를 입력하세요"
            />
          </div>

          {state?.error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-3 py-2">
              {state.error}
            </div>
          )}

          <button
            type="submit"
            disabled={pending}
            className="btn-primary w-full justify-center flex"
          >
            {pending ? '로그인 중...' : '로그인'}
          </button>
        </form>

        {/* Back link */}
        <div className="text-center mt-4">
          <Link href="/" className="text-sm text-gray-400 hover:text-brand-600 transition-colors">
            ← 로테이션 공지 보기
          </Link>
        </div>
      </div>
    </div>
  );
}
