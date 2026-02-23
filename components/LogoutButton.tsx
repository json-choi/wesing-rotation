'use client';

import { useState } from 'react';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setIsPending(true);
    await authClient.signOut({
      fetchOptions: { onSuccess: () => router.push('/admin') },
    });
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isPending}
      className="text-sm text-gray-500 hover:text-red-500 transition-colors px-2 py-1.5 disabled:opacity-50"
    >
      {isPending ? '로그아웃 중...' : '로그아웃'}
    </button>
  );
}
