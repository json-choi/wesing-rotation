import { prisma } from '@/lib/db';
import { createSchedule } from '@/lib/actions';
import DeleteScheduleButton from '@/components/DeleteScheduleButton';
import LogoutButton from '@/components/LogoutButton';
import Link from 'next/link';

function MonthLabel(month: string): string {
  const [year, m] = month.split('-');
  return `${year}년 ${parseInt(m)}월`;
}

export default async function DashboardPage() {
  const schedules = await prisma.schedule.findMany({
    orderBy: { month: 'desc' },
    include: { _count: { select: { weeks: true } } },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-800">관리자 대시보드</h1>
            <p className="text-xs text-gray-400 mt-0.5">로테이션표 관리</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/" className="btn-secondary text-sm py-1.5 px-3">
              공개 페이지 보기
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Create new schedule */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-base font-semibold text-gray-700 mb-4">새 로테이션표 만들기</h2>
          <form action={createSchedule} className="flex flex-col sm:flex-row gap-3">
            <input
              name="title"
              type="text"
              required
              className="input-field flex-1"
              placeholder="예: 위싱 4월 로테이션표"
            />
            <input
              name="month"
              type="month"
              required
              className="input-field sm:w-40"
            />
            <button type="submit" className="btn-primary whitespace-nowrap">
              만들기
            </button>
          </form>
        </section>

        {/* Schedule list */}
        <section>
          <h2 className="text-base font-semibold text-gray-700 mb-3">로테이션표 목록</h2>

          {schedules.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center text-gray-400">
              <p className="text-4xl mb-3">📋</p>
              <p>아직 만들어진 로테이션표가 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {schedules.map((s) => (
                <div
                  key={s.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex items-center justify-between gap-4"
                >
                  <div>
                    <p className="font-semibold text-gray-800">{s.title}</p>
                    <p className="text-sm text-gray-400 mt-0.5">
                      {MonthLabel(s.month)} · {s._count.weeks}주차
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/admin/dashboard/${s.id}`}
                      className="btn-secondary text-sm py-1.5 px-3"
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
