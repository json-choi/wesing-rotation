import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { schedules, weeks } from "@/lib/schema";
import { eq, asc } from "drizzle-orm";
import { updateSchedule } from "@/lib/actions";
import WeekEditor from "@/components/WeekEditor";
import AddWeekForm from "@/components/AddWeekForm";
import Link from "next/link";

export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function ScheduleEditorPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) redirect("/admin");

    const { id } = await params;

    const schedule = await db.query.schedules.findFirst({
        where: eq(schedules.id, id),
        with: {
            weeks: {
                orderBy: [asc(weeks.order)],
                with: { assignments: true },
            },
        },
    });

    if (!schedule) notFound();

    const nextWeekNumber = (schedule.weeks.at(-1)?.weekNumber ?? 0) + 1;

    const updateThisSchedule = updateSchedule.bind(null, id);

    return (
        <div className="min-h-screen bg-slate-50 font-pretendard">
            {/* Header */}
            <header className="bg-white border-b border-slate-200/80 sticky top-0 z-10 backdrop-blur-md bg-white/80">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center gap-4">
                    <Link
                        href="/admin/dashboard"
                        className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-slate-50 text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                        aria-label="대시보드로 돌아가기"
                    >
                        <svg
                            className="w-5 h-5"
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
                    </Link>
                    <div>
                        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                            {schedule.title}
                        </h1>
                        <p className="text-sm text-slate-500 mt-0.5">로테이션표 수정</p>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
                {/* Schedule meta editor */}
                <section className="bg-white rounded-3xl shadow-card border border-slate-100/50 p-6 sm:p-8">
                    <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-5 flex items-center gap-2">
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
                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        기본 정보
                    </h2>
                    <form action={updateThisSchedule} className="flex flex-col sm:flex-row gap-4">
                        <input
                            name="title"
                            type="text"
                            defaultValue={schedule.title}
                            required
                            className="input-field flex-1"
                            placeholder="예: 위싱 3월 로테이션표"
                        />
                        <input
                            name="month"
                            type="month"
                            defaultValue={schedule.month}
                            required
                            className="input-field sm:w-48"
                        />
                        <button type="submit" className="btn-primary whitespace-nowrap">
                            저장
                        </button>
                    </form>
                </section>

                {/* Weeks */}
                <section>
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
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
                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                            </svg>
                            주차 목록{" "}
                            <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full text-xs ml-1">
                                {schedule.weeks.length}주
                            </span>
                        </h2>
                        <Link
                            href={`/?month=${schedule.month}`}
                            target="_blank"
                            className="text-sm font-medium text-brand-600 hover:text-brand-700 hover:underline flex items-center gap-1"
                        >
                            공개 화면으로 보기
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
                                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                />
                            </svg>
                        </Link>
                    </div>

                    <div className="space-y-6">
                        {schedule.weeks.map((week) => (
                            <WeekEditor key={week.id} week={week} />
                        ))}

                        <AddWeekForm scheduleId={id} nextWeekNumber={nextWeekNumber} />
                    </div>
                </section>
            </main>
        </div>
    );
}
