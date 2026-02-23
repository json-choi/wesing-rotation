'use client';

import { useState } from 'react';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminLoginPage() {
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPending(true);
    setError('');

    const data = new FormData(e.currentTarget);
    const { error: authError } = await authClient.signIn.email({
      email: data.get('email') as string,
      password: data.get('password') as string,
    });

    if (authError) {
      setError('이메일 또는 비밀번호가 올바르지 않습니다.');
      setPending(false);
    } else {
      router.push('/admin/dashboard');
    }
  };

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
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4"
        >
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
              이메일
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoFocus
              className="input-field"
              placeholder="admin@example.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
              비밀번호
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="input-field"
              placeholder="비밀번호를 입력하세요"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-3 py-2">
              {error}
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
