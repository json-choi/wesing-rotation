"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLoginPage() {
    const [error, setError] = useState("");
    const [pending, setPending] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setPending(true);
        setError("");

        const data = new FormData(e.currentTarget);
        const { error: authError } = await authClient.signIn.email({
            email: data.get("email") as string,
            password: data.get("password") as string,
        });

        if (authError) {
            setError("이메일 또는 비밀번호가 올바르지 않습니다.");
            setPending(false);
        } else {
            router.push("/admin/dashboard");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 font-pretendard">
            <div className="w-full max-w-sm">
                {/* Logo area */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-600 text-white text-2xl mb-5 shadow-lg shadow-brand-500/30">
                        ♪
                    </div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                        관리자 로그인
                    </h1>
                    <p className="text-sm text-slate-500 mt-1.5">위싱 찬양팀 로테이션 관리</p>
                </div>

                {/* Login form */}
                <form
                    onSubmit={handleSubmit}
                    className="bg-white rounded-3xl shadow-card border border-slate-100/50 p-8 space-y-5"
                >
                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-semibold text-slate-700 mb-2"
                        >
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
                        <label
                            htmlFor="password"
                            className="block text-sm font-semibold text-slate-700 mb-2"
                        >
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
                        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={pending}
                        className="btn-primary w-full justify-center flex mt-2"
                    >
                        {pending ? "로그인 중..." : "로그인"}
                    </button>
                </form>

                {/* Back link */}
                <div className="text-center mt-6">
                    <Link
                        href="/"
                        className="text-sm font-medium text-slate-400 hover:text-brand-600 transition-colors flex items-center justify-center gap-1"
                    >
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 19l-7-7m0 0l7-7m-7 7h18"
                            />
                        </svg>
                        로테이션 공지 보기
                    </Link>
                </div>
            </div>
        </div>
    );
}
