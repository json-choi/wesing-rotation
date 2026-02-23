'use client';

import { useState, useTransition } from 'react';
import { updateWeek, deleteWeek } from '@/lib/actions';
import { INSTRUMENT_ROLES, RHYTHM_ROLES, ALL_ROLES } from '@/lib/constants';

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
  return assignments.find((a) => a.role === role)?.names ?? '';
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
    <div className="week-card">
      <form action={handleSave}>
        {/* Week header */}
        <div className="week-card-header bg-gray-50">
          <div className="flex flex-col sm:flex-row sm:items-start gap-3">
            <div className="flex-1 space-y-2">
              <input
                name="title"
                type="text"
                defaultValue={week.title}
                required
                className="input-field font-semibold"
                placeholder="예: 1주 — (주일) 젊은이예배"
              />
              <input
                name="note"
                type="text"
                defaultValue={week.note}
                className="input-field text-sm"
                placeholder="메모 (예: 13시 / 토요 모임 포함)"
              />
            </div>
            <div className="flex gap-2 shrink-0 self-start">
              <button
                type="submit"
                disabled={isPending}
                className="btn-primary text-sm py-1.5 px-3"
              >
                {isPending ? '저장 중...' : saved ? '✓ 저장됨' : '저장'}
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className="btn-danger"
              >
                삭제
              </button>
            </div>
          </div>
        </div>

        {/* Role assignment table */}
        <div className="overflow-x-auto p-4">
          <table className="rotation-table">
            <thead>
              <tr>
                {INSTRUMENT_ROLES.map((r) => (
                  <th key={r.id} className="whitespace-nowrap text-xs">
                    {r.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Instrument inputs */}
              <tr>
                {INSTRUMENT_ROLES.map((r) => (
                  <td key={r.id} className="p-1.5">
                    <input
                      name={`role_${r.id}`}
                      type="text"
                      defaultValue={getNames(week.assignments, r.id)}
                      className="w-full border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-brand-400 min-w-[80px]"
                      placeholder="이름"
                    />
                  </td>
                ))}
              </tr>

              {/* Rhythm sub-header */}
              <tr className="subheader">
                {RHYTHM_ROLES.map((r) => (
                  <td key={r.id} className="text-xs">{r.label}</td>
                ))}
                {Array.from({
                  length: INSTRUMENT_ROLES.length - RHYTHM_ROLES.length,
                }).map((_, i) => (
                  <td key={`empty-h-${i}`} />
                ))}
              </tr>

              {/* Rhythm inputs */}
              <tr>
                {RHYTHM_ROLES.map((r) => (
                  <td key={r.id} className="p-1.5">
                    <input
                      name={`role_${r.id}`}
                      type="text"
                      defaultValue={getNames(week.assignments, r.id)}
                      className="w-full border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-brand-400 min-w-[80px]"
                      placeholder={r.id === 'singers' ? '이름, 이름, ...' : '이름'}
                    />
                  </td>
                ))}
                {Array.from({
                  length: INSTRUMENT_ROLES.length - RHYTHM_ROLES.length,
                }).map((_, i) => (
                  <td key={`empty-d-${i}`} />
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </form>
    </div>
  );
}
