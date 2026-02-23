'use client';

import { useState, useTransition } from 'react';
import { createWeek } from '@/lib/actions';

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
        className="w-full py-3 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400
                   hover:border-brand-300 hover:text-brand-500 transition-colors text-sm font-medium"
      >
        + 주차 추가
      </button>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-brand-200 shadow-sm p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">새 주차 추가</h3>
      <form action={handleSubmit} className="space-y-3">
        <input name="weekNumber" type="hidden" value={nextWeekNumber} />
        <input
          name="title"
          type="text"
          required
          autoFocus
          className="input-field"
          placeholder={`예: ${nextWeekNumber}주 — (주일) 젊은이예배`}
        />
        <input
          name="note"
          type="text"
          className="input-field"
          placeholder="메모 (예: 13시 / 토요 모임 포함)"
        />
        <div className="flex gap-2">
          <button type="submit" disabled={isPending} className="btn-primary text-sm">
            {isPending ? '추가 중...' : '추가'}
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="btn-secondary text-sm"
          >
            취소
          </button>
        </div>
      </form>
    </div>
  );
}
