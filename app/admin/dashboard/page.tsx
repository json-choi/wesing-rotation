import { db } from "@/lib/db";
import { schedules, weeks } from "@/lib/schema";
import { createSchedule } from "@/lib/actions";
import DeleteScheduleButton from "@/components/DeleteScheduleButton";
import LogoutButton from "@/components/LogoutButton";
import { desc, eq, count } from "drizzle-orm";
import Link from "next/link";

export const dynamic = "force-dynamic";

function MonthLabel(month: string): string {
    const [year, m] = month.split("-");
    return `${year}년 ${parseInt(m)}월`;
}

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) redirect("/admin");

    const allSchedules = await db
        .select({
            id: schedules.id,
            title: schedules.title,
            month: schedules.month,
            weekCount: count(weeks.id),
        })
        .from(schedules)
        .leftJoin(weeks, eq(weeks.scheduleId, schedules.id))
        .groupBy(schedules.id)
        .orderBy(desc(schedules.month));

    return (
        <div className="min-h-screen bg-slate-50 font-pretendard">
            {/* Header */}
            <header className="bg-white border-b border-slate-200/80 sticky top-0 z-10 backdrop-blur-md bg-white/80">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                            관리자 대시보드
                        </h1>
                        <p className="text-sm text-slate-500 mt-0.5">로테이션표 관리</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href="/" className="btn-secondary text-sm py-2 px-4">
                            공개 페이지 보기
                        </Link>
                        <LogoutButton />
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
                {/* Create new schedule */}
                <section className="bg-white rounded-3xl shadow-card border border-slate-100/50 p-6 sm:p-8">
                    <h2 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
                        <svg
                            className="w-5 h-5 text-brand-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 4v16m8-8H4"
                            />
                        </svg>
                        새 로테이션표 만들기
                    </h2>
                    <form action={createSchedule} className="flex flex-col sm:flex-row gap-4">
                        <input
                            name="title"
                            type="text"
                            required
                            className="input-field flex-1"
                            placeholder="예: 위싱 4월 로테이션표"
                        />
                        <input name="month" type="month" required className="input-field sm:w-48" />
                        <button type="submit" className="btn-primary whitespace-nowrap">
                            만들기
                        </button>
                    </form>
                </section>

                {/* Schedule list */}
                <section>
                    <h2 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
                        <svg
                            className="w-5 h-5 text-brand-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 6h16M4 10h16M4 14h16M4 18h16"
                            />
                        </svg>
                        로테이션표 목록
                    </h2>

                    {allSchedules.length === 0 ? (
                        <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-16 text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                                <svg
                                    className="w-8 h-8 text-slate-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-slate-900 mb-1">
                                아직 만들어진 로테이션표가 없습니다
                            </h3>
                            <p className="text-slate-500">위에서 새 로테이션표를 만들어보세요.</p>
                        </div>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {allSchedules.map((s) => (
                                <div
                                    key={s.id}
                                    className="bg-white rounded-3xl border border-slate-100/50 shadow-card p-6 flex flex-col justify-between gap-6 transition-all duration-300 hover:shadow-soft hover:-translate-y-1"
                                >
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold border border-brand-100">
                                                {MonthLabel(s.month)}
                                            </span>
                                            <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-md">
                                                {s.weekCount}주차
                                            </span>
                                        </div>
                                        <h3 className="font-bold text-slate-900 text-lg line-clamp-2">
                                            {s.title}
                                        </h3>
                                    </div>
                                    <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
                                        <Link
                                            href={`/admin/dashboard/${s.id}`}
                                            className="btn-secondary flex-1 text-sm py-2 px-3 text-center"
                                        >
                                            수정
                                        </Link>
                                        <DeleteScheduleButton id={s.id} title={s.title} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}
