import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { updateSchedule } from '@/lib/actions';
import WeekEditor from '@/components/WeekEditor';
import AddWeekForm from '@/components/AddWeekForm';
import Link from 'next/link';

export default async function ScheduleEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const schedule = await prisma.schedule.findUnique({
    where: { id },
    include: {
      weeks: {
        orderBy: { order: 'asc' },
        include: { assignments: true },
      },
    },
  });

  if (!schedule) notFound();

  const nextWeekNumber = (schedule.weeks.at(-1)?.weekNumber ?? 0) + 1;

  const updateThisSchedule = updateSchedule.bind(null, id);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link
            href="/admin/dashboard"
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="대시보드로 돌아가기"
          >
            ←
          </Link>
          <div>
            <h1 className="text-base font-bold text-gray-800">{schedule.title}</h1>
            <p className="text-xs text-gray-400">로테이션표 수정</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Schedule meta editor */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            기본 정보
          </h2>
          <form action={updateThisSchedule} className="flex flex-col sm:flex-row gap-3">
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
              className="input-field sm:w-40"
            />
            <button type="submit" className="btn-primary whitespace-nowrap">
              저장
            </button>
          </form>
        </section>

        {/* Weeks */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
              주차 목록 ({schedule.weeks.length}주)
            </h2>
            <Link
              href={`/?month=${schedule.month}`}
              target="_blank"
              className="text-xs text-brand-600 hover:underline"
            >
              공개 화면으로 보기 ↗
            </Link>
          </div>

          <div className="space-y-4">
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
