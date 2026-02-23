'use client';

import { useTransition } from 'react';
import { logout } from '@/lib/actions';

export default function LogoutButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      onClick={() => startTransition(() => logout())}
      disabled={isPending}
      className="text-sm text-gray-500 hover:text-red-500 transition-colors px-2 py-1.5 disabled:opacity-50"
    >
      {isPending ? '로그아웃 중...' : '로그아웃'}
    </button>
  );
}
