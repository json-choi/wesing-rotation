"use client";

import { useState, useTransition } from "react";
import { createWeek } from "@/lib/actions";

interface AddWeekFormProps {
    scheduleId: string;
    nextWeekNumber: number;
}

export default function AddWeekForm({ scheduleId, nextWeekNumber }: AddWeekFormProps) {
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    const handleSubmit = (formData: FormData) => {
        startTransition(async () => {
            await createWeek(scheduleId, formData);
            setOpen(false);
        });
    };

    if (!open) {
        return (
            <button
                onClick={() => setOpen(true)}
                className="w-full py-4 border-2 border-dashed border-slate-200 rounded-3xl text-slate-400
                   hover:border-brand-400 hover:text-brand-600 hover:bg-brand-50/50 transition-all duration-200 text-sm font-bold flex items-center justify-center gap-2"
            >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                    />
                </svg>
                주차 추가
            </button>
        );
    }

    return (
        <div className="bg-white rounded-3xl border border-brand-200 shadow-card p-6">
            <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                <svg
                    className="w-4 h-4 text-brand-500"
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
                새 주차 추가
            </h3>
            <form action={handleSubmit} className="space-y-4">
                <input name="weekNumber" type="hidden" value={nextWeekNumber} />
                <input
                    name="title"
                    type="text"
                    required
                    autoFocus
                    className="input-field font-medium"
                    placeholder={`예: ${nextWeekNumber}주 — (주일) 젊은이예배`}
                />
                <input
                    name="note"
                    type="text"
                    className="input-field text-sm"
                    placeholder="메모 (예: 13시 / 토요 모임 포함)"
                />
                <div className="flex gap-2 pt-2">
                    <button
                        type="submit"
                        disabled={isPending}
                        className="btn-primary text-sm py-2 px-5"
                    >
                        {isPending ? "추가 중..." : "추가"}
                    </button>
                    <button
                        type="button"
                        onClick={() => setOpen(false)}
                        className="btn-secondary text-sm py-2 px-5"
                    >
                        취소
                    </button>
                </div>
            </form>
        </div>
    );
}
