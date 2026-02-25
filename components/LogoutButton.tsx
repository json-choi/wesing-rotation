"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
    const [isPending, setIsPending] = useState(false);
    const router = useRouter();

    const handleLogout = async () => {
        setIsPending(true);
        await authClient.signOut({
            fetchOptions: { onSuccess: () => router.push("/admin") },
        });
    };

    return (
        <button
            type="button"
            onClick={handleLogout}
            disabled={isPending}
            className="text-sm font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors px-3 py-2 rounded-xl disabled:opacity-50"
        >
            {isPending ? "로그아웃 중..." : "로그아웃"}
        </button>
    );
}
