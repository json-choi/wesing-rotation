import { db } from '@/lib/db';
import { schedules, weeks } from '@/lib/schema';
import { INSTRUMENT_ROLES, RHYTHM_ROLES } from '@/lib/constants';
import { desc, eq, asc } from 'drizzle-orm';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

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
  return assignments.find((a) => a.role === role)?.names ?? '';
}

function WeekTable({ week }: { week: Week }) {
  const { assignments } = week;

  return (
    <div className="week-card">
      <div className="week-card-header">
        <h2 className="text-lg font-semibold text-gray-800">{week.title}</h2>
        {week.note && (
          <p className="mt-1 text-sm text-gray-500">{week.note}</p>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="rotation-table">
          <thead>
            <tr>
              {INSTRUMENT_ROLES.map((r) => (
                <th key={r.id} className="whitespace-nowrap">
                  {r.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Instrument assignments */}
            <tr>
              {INSTRUMENT_ROLES.map((r) => (
                <td key={r.id} className="text-gray-700">
                  {getNames(assignments, r.id) || (
                    <span className="text-gray-300">—</span>
                  )}
                </td>
              ))}
            </tr>

            {/* Rhythm sub-header */}
            <tr className="subheader">
              {RHYTHM_ROLES.map((r) => (
                <td key={r.id}>{r.label}</td>
              ))}
              {/* Fill remaining columns */}
              {Array.from({ length: INSTRUMENT_ROLES.length - RHYTHM_ROLES.length }).map(
                (_, i) => (
                  <td key={`empty-${i}`} />
                )
              )}
            </tr>

            {/* Rhythm assignments */}
            <tr>
              {RHYTHM_ROLES.map((r) => (
                <td key={r.id} className="text-gray-700">
                  {getNames(assignments, r.id) || (
                    <span className="text-gray-300">—</span>
                  )}
                </td>
              ))}
              {Array.from({ length: INSTRUMENT_ROLES.length - RHYTHM_ROLES.length }).map(
                (_, i) => (
                  <td key={`empty-${i}`} />
                )
              )}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MonthLabel(month: string): string {
  const [year, m] = month.split('-');
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-br from-brand-700 to-brand-500 text-white shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <p className="text-brand-200 text-sm font-medium uppercase tracking-widest mb-1">
            위싱 찬양팀
          </p>
          <h1 className="text-3xl font-bold">로테이션 공지</h1>
          {schedule && (
            <p className="mt-2 text-brand-200">{schedule.title}</p>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Month tabs */}
        {allSchedules.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {allSchedules.map((s) => (
              <Link
                key={s.id}
                href={`/?month=${s.month}`}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  s.month === selectedMonth
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {MonthLabel(s.month)}
              </Link>
            ))}
          </div>
        )}

        {/* No schedules */}
        {allSchedules.length === 0 && (
          <div className="text-center py-24 text-gray-400">
            <p className="text-5xl mb-4">📋</p>
            <p className="text-lg">아직 로테이션표가 없습니다.</p>
          </div>
        )}

        {/* Schedule content */}
        {schedule && (
          <div className="space-y-6">
            {schedule.weeks.map((week) => (
              <WeekTable key={week.id} week={week} />
            ))}
          </div>
        )}

        {/* No weeks */}
        {schedule && schedule.weeks.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">📝</p>
            <p>아직 등록된 주차가 없습니다.</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto px-4 py-8 text-center text-sm text-gray-400 border-t border-gray-200 mt-8">
        <Link
          href="/admin"
          className="hover:text-brand-600 transition-colors"
        >
          관리자 페이지
        </Link>
      </footer>
    </div>
  );
}
