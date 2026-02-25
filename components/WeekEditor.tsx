"use client";

import { useState, useTransition } from "react";
import { updateWeek, deleteWeek } from "@/lib/actions";
import { INSTRUMENT_ROLES, RHYTHM_ROLES, ALL_ROLES } from "@/lib/constants";

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

function getNames(assignments: Assignment[], role: string): string {
    return assignments.find((a) => a.role === role)?.names ?? "";
}

export default function WeekEditor({ week }: { week: Week }) {
    const [isPending, startTransition] = useTransition();
    const [isDeleting, setIsDeleting] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleSave = (formData: FormData) => {
        startTransition(async () => {
            await updateWeek(week.id, formData);
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        });
    };

    const handleDelete = () => {
        if (!confirm(`"${week.title}"을 삭제하시겠습니까?`)) return;
        setIsDeleting(true);
        startTransition(async () => {
            await deleteWeek(week.id);
        });
    };

    if (isDeleting) return null;

    return (
        <div className="week-card group">
            <form action={handleSave}>
                {/* Week header */}
                <div className="week-card-header bg-slate-50/50">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4 w-full">
                        <div className="flex-1 space-y-3 w-full">
                            <div className="flex items-center gap-2">
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-brand-100 text-brand-700 text-xs font-bold shrink-0">
                                    {week.weekNumber}
                                </span>
                                <input
                                    name="title"
                                    type="text"
                                    defaultValue={week.title}
                                    required
                                    className="input-field font-bold text-slate-900 text-lg py-2"
                                    placeholder="예: 1주 — (주일) 젊은이예배"
                                />
                            </div>
                            <div className="flex items-center gap-2 pl-8">
                                <svg
                                    className="w-4 h-4 text-slate-400 shrink-0"
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
                                <input
                                    name="note"
                                    type="text"
                                    defaultValue={week.note}
                                    className="input-field text-sm py-1.5 bg-white/50"
                                    placeholder="메모 (예: 13시 / 토요 모임 포함)"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2 shrink-0 self-end sm:self-start mt-2 sm:mt-0">
                            <button
                                type="submit"
                                disabled={isPending}
                                className={`btn-primary text-sm py-2 px-4 flex items-center gap-1.5 ${saved ? "bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500" : ""}`}
                            >
                                {isPending ? (
                                    <>
                                        <svg
                                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            ></circle>
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            ></path>
                                        </svg>
                                        저장 중...
                                    </>
                                ) : saved ? (
                                    <>
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
                                                d="M5 13l4 4L19 7"
                                            />
                                        </svg>
                                        저장됨
                                    </>
                                ) : (
                                    "저장"
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={isPending}
                                className="btn-danger py-2 px-3"
                                aria-label="삭제"
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
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Role assignment table */}
                <div className="overflow-x-auto p-1">
                    <table className="rotation-table">
                        <thead>
                            <tr>
                                {INSTRUMENT_ROLES.map((r) => (
                                    <th key={r.id} className="whitespace-nowrap text-sm">
                                        {r.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {/* Instrument inputs */}
                            <tr>
                                {INSTRUMENT_ROLES.map((r) => (
                                    <td key={r.id} className="p-2">
                                        <input
                                            name={`role_${r.id}`}
                                            type="text"
                                            defaultValue={getNames(week.assignments, r.id)}
                                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 min-w-[100px] transition-all bg-slate-50/50 focus:bg-white"
                                            placeholder="이름"
                                        />
                                    </td>
                                ))}
                            </tr>

                            {/* Rhythm sub-header */}
                            <tr className="subheader">
                                {RHYTHM_ROLES.map((r, i) => (
                                    <td
                                        key={r.id}
                                        className="text-sm"
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

                            {/* Rhythm inputs */}
                            <tr>
                                {RHYTHM_ROLES.map((r, i) => (
                                    <td
                                        key={r.id}
                                        className="p-2"
                                        colSpan={
                                            i === RHYTHM_ROLES.length - 1
                                                ? INSTRUMENT_ROLES.length - RHYTHM_ROLES.length + 1
                                                : 1
                                        }
                                    >
                                        <input
                                            name={`role_${r.id}`}
                                            type="text"
                                            defaultValue={getNames(week.assignments, r.id)}
                                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 min-w-[100px] transition-all bg-slate-50/50 focus:bg-white"
                                            placeholder={
                                                r.id === "singers" ? "이름, 이름, ..." : "이름"
                                            }
                                        />
                                    </td>
                                ))}
                            </tr>
                        </tbody>
                    </table>
                </div>
            </form>
        </div>
    );
}
