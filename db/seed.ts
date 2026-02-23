/**
 * Seed script — run once after `npm run db:push`
 * Usage: npm run db:seed
 *
 * Creates:
 *  1. Admin user (via Better Auth)
 *  2. 위싱 3월 로테이션표 (5 weeks of sample data)
 */

import { db } from '../lib/db';
import { auth } from '../lib/auth';
import { schedules, weeks, assignments } from '../lib/schema';

// ── Sample data ───────────────────────────────────────────────────────────────

const march2025Weeks = [
  {
    weekNumber: 1,
    title: '1주 — (주일) 젊은이예배',
    note: '13시 / 토요 모임 포함',
    assignments: {
      worship_leader: '김찬희',
      lead_synth: '심지우',
      aux_synth: '김은진',
      bass_g: '이지원',
      electric_g: '',
      acoustic_g: '한윤지',
      drum: '김승윤',
      sound_engineer: '김겸목',
      singers: '김은지, 최재송',
    },
  },
  {
    weekNumber: 2,
    title: '2주 — (주일) 젊은이예배',
    note: '은혜 토요모임 불참',
    assignments: {
      worship_leader: '임세린',
      lead_synth: '이은혜',
      aux_synth: '김한나',
      bass_g: '최준엽',
      electric_g: '',
      acoustic_g: '한윤지',
      drum: '백경근',
      sound_engineer: '김겸목',
      singers: '최재송, 임승준, 김은지, 이해인',
    },
  },
  {
    weekNumber: 3,
    title: '3주 — (주일) 젊은이예배',
    note: '13시',
    assignments: {
      worship_leader: '김찬희',
      lead_synth: '심지우',
      aux_synth: '김유진',
      bass_g: '최준엽',
      electric_g: '',
      acoustic_g: '한윤지',
      drum: '김승윤',
      sound_engineer: '김겸목',
      singers: '이은솔, 김민영, 박시은, 유경림',
    },
  },
  {
    weekNumber: 4,
    title: '4주 — (주일) 젊은이예배',
    note: '13시 / 은진 토요모임 불참',
    assignments: {
      worship_leader: '임세린',
      lead_synth: '김은진',
      aux_synth: '김한나',
      bass_g: '이지원',
      electric_g: '',
      acoustic_g: '한윤지',
      drum: '김승윤',
      sound_engineer: '김겸목',
      singers: '김은지, 유경림, 최재송',
    },
  },
  {
    weekNumber: 5,
    title: '5주 — (주일) 젊은이예배',
    note: '13시 / 승윤 · 지원 미참',
    assignments: {
      worship_leader: '임세린',
      lead_synth: '이은혜',
      aux_synth: '김유진',
      bass_g: '최준엽',
      electric_g: '',
      acoustic_g: '한윤지',
      drum: '백경근',
      sound_engineer: '김겸목',
      singers: '김민영, 박시은, 이해인, 임승준',
    },
  },
];

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('Seeding database...\n');

  // 1. Create admin user via Better Auth
  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@wesing.kr';
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'wesing2025';

  try {
    await auth.api.signUpEmail({
      body: { name: '관리자', email: adminEmail, password: adminPassword },
    });
    console.log(`✓ Admin user created: ${adminEmail}`);
  } catch {
    console.log(`  Admin user already exists (${adminEmail}), skipping.`);
  }

  // 2. Seed rotation schedule
  const [schedule] = await db
    .insert(schedules)
    .values({ title: '위싱 3월 로테이션표', month: '2025-03' })
    .returning({ id: schedules.id });

  console.log(`✓ Schedule created: 위싱 3월 로테이션표`);

  for (const weekData of march2025Weeks) {
    const { assignments: assignmentData, ...weekFields } = weekData;

    const [week] = await db
      .insert(weeks)
      .values({
        scheduleId: schedule.id,
        weekNumber: weekFields.weekNumber,
        title: weekFields.title,
        note: weekFields.note,
        order: weekFields.weekNumber,
      })
      .returning({ id: weeks.id });

    await db.insert(assignments).values(
      Object.entries(assignmentData).map(([role, names]) => ({
        weekId: week.id,
        role,
        names,
      }))
    );

    console.log(`  ✓ ${weekFields.title}`);
  }

  console.log('\nSeeding complete!');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
