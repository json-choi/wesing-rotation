import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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

async function main() {
  console.log('Seeding database...');

  await prisma.schedule.deleteMany();

  const schedule = await prisma.schedule.create({
    data: {
      title: '위싱 3월 로테이션표',
      month: '2025-03',
    },
  });

  for (const weekData of march2025Weeks) {
    const { assignments, ...week } = weekData;
    const createdWeek = await prisma.week.create({
      data: {
        ...week,
        order: weekData.weekNumber,
        scheduleId: schedule.id,
      },
    });

    const assignmentData = Object.entries(assignments).map(([role, names]) => ({
      weekId: createdWeek.id,
      role,
      names,
    }));

    await prisma.assignment.createMany({ data: assignmentData });
  }

  console.log('Seeding complete!');
  console.log(`Created schedule: ${schedule.title} (${schedule.month})`);
  console.log(`Created ${march2025Weeks.length} weeks`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
