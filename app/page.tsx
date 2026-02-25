import { db } from "@/lib/db";
import { schedules, weeks } from "@/lib/schema";
import { INSTRUMENT_ROLES, RHYTHM_ROLES } from "@/lib/constants";
import { desc, eq, asc } from "drizzle-orm";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface Assignment {
    role: string;
    names: string;
}

interface Week {
    id: string;
    weekNumber: number;
    title: string;
    note: string;
    assignments: Assignment[];
}

interface Schedule {
    id: string;
    title: string;
    month: string;
    weeks: Week[];
}

function getNames(assignments: Assignment[], role: string): string {
    return assignments.find((a) => a.role === role)?.names ?? "";
}

function WeekTable({ week }: { week: Week }) {
    const { assignments } = week;

    return (
        <div className="week-card group">
            <div className="week-card-header">
                <div className="flex-1">
                    <h2 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight">
                        {week.title}
                    </h2>
                    {week.note && (
                        <p className="mt-1.5 text-xs sm:text-sm text-slate-500 flex items-center gap-1.5">
                            <svg
                                className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0"
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
                            <span className="line-clamp-1 sm:line-clamp-none">{week.note}</span>
                        </p>
                    )}
                </div>
                <div className="text-xs sm:text-sm font-medium text-brand-600 bg-brand-50 px-2.5 sm:px-3 py-1 rounded-full border border-brand-100 shrink-0 self-start sm:self-center">
                    {week.weekNumber}주차
                </div>
            </div>

            <div className="overflow-x-auto relative">
                <table className="rotation-table">
                    <thead>
                        <tr>
                            {INSTRUMENT_ROLES.map((r) => (
                                <th key={r.id}>{r.label}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            {INSTRUMENT_ROLES.map((r) => {
                                const names = getNames(assignments, r.id);
                                return (
                                    <td key={r.id}>
                                        {names ? (
                                            <div className="flex flex-wrap gap-1.5">
                                                {names.split(",").map((name, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 font-medium whitespace-nowrap"
                                                    >
                                                        {name.trim()}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-slate-300">—</span>
                                        )}
                                    </td>
                                );
                            })}
                        </tr>

                        <tr className="subheader">
                            {RHYTHM_ROLES.map((r, i) => (
                                <td
                                    key={r.id}
                                    colSpan={
                                        i === RHYTHM_ROLES.length - 1
                                            ? INSTRUMENT_ROLES.length - RHYTHM_ROLES.length + 1
                                            : 1
                                    }
                                >
                                    {r.label}
                                </td>
                            ))}
                        </tr>

                        <tr>
                            {RHYTHM_ROLES.map((r, i) => {
                                const names = getNames(assignments, r.id);
                                return (
                                    <td
                                        key={r.id}
                                        colSpan={
                                            i === RHYTHM_ROLES.length - 1
                                                ? INSTRUMENT_ROLES.length - RHYTHM_ROLES.length + 1
                                                : 1
                                        }
                                    >
                                        {names ? (
                                            <div className="flex flex-wrap gap-1.5">
                                                {names.split(",").map((name, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 font-medium whitespace-nowrap"
                                                    >
                                                        {name.trim()}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-slate-300">—</span>
                                        )}
                                    </td>
                                );
                            })}
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function MonthLabel(month: string): string {
    const [year, m] = month.split("-");
    return `${year}년 ${parseInt(m)}월`;
}

export default async function HomePage({
    searchParams,
}: {
    searchParams: Promise<{ month?: string }>;
}) {
    const params = await searchParams;

    const allSchedules = await db
        .select({ id: schedules.id, title: schedules.title, month: schedules.month })
        .from(schedules)
        .orderBy(desc(schedules.month));

    const selectedMonth = params.month ?? allSchedules[0]?.month;

    const schedule = selectedMonth
        ? await db.query.schedules.findFirst({
              where: eq(schedules.month, selectedMonth),
              with: {
                  weeks: {
                      orderBy: [asc(weeks.order)],
                      with: { assignments: true },
                  },
              },
          })
        : null;

    return (
        <div className="min-h-screen bg-slate-50 font-pretendard">
            {/* Header */}
            <header className="bg-white border-b border-slate-200/80 sticky top-0 z-10 backdrop-blur-md bg-white/80">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                    <div>
                        <p className="text-brand-600 text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-1 sm:mb-1.5">
                            위싱 찬양팀
                        </p>
                        <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                            예배 로테이션
                        </h1>
                    </div>
                    {schedule && (
                        <div className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-medium text-slate-700 shadow-sm self-start sm:self-auto">
                            <svg
                                className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 text-brand-500"
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
                            {schedule.title}
                        </div>
                    )}
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
                {/* Month tabs */}
                {allSchedules.length > 0 && (
                    <div className="flex flex-nowrap sm:flex-wrap gap-2 mb-6 sm:mb-10 overflow-x-auto pb-2 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
                        {allSchedules.map((s) => (
                            <Link
                                key={s.id}
                                href={`/?month=${s.month}`}
                                className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-200 whitespace-nowrap shrink-0 ${
                                    s.month === selectedMonth
                                        ? "bg-slate-900 text-white shadow-md sm:scale-105"
                                        : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900"
                                }`}
                            >
                                {MonthLabel(s.month)}
                            </Link>
                        ))}
                    </div>
                )}

                {/* No schedules */}
                {allSchedules.length === 0 && (
                    <div className="text-center py-24 bg-white rounded-3xl border border-slate-200 border-dashed">
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
                            아직 로테이션표가 없습니다
                        </h3>
                        <p className="text-slate-500">
                            관리자가 새로운 일정을 등록하면 여기에 표시됩니다.
                        </p>
                    </div>
                )}

                {/* Schedule content */}
                {schedule && (
                    <div className="space-y-8">
                        {schedule.weeks.map((week) => (
                            <WeekTable key={week.id} week={week} />
                        ))}
                    </div>
                )}

                {/* No weeks */}
                {schedule && schedule.weeks.length === 0 && (
                    <div className="text-center py-24 bg-white rounded-3xl border border-slate-200 border-dashed">
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
                                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-slate-900 mb-1">
                            등록된 주차가 없습니다
                        </h3>
                        <p className="text-slate-500">
                            이 달의 세부 일정이 아직 등록되지 않았습니다.
                        </p>
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-8">
                <div className="border-t border-slate-200 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-slate-400">
                        © {new Date().getFullYear()} 위싱 찬양팀. All rights reserved.
                    </p>
                    <Link
                        href="/admin"
                        className="text-sm font-medium text-slate-500 hover:text-brand-600 transition-colors flex items-center gap-1"
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
                                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                            />
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                        </svg>
                        관리자 페이지
                    </Link>
                </div>
            </footer>
        </div>
    );
}
