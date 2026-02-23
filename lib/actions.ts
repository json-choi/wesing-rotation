'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from './db';
import { createToken, setAuthCookie, clearAuthCookie, isAuthenticated } from './auth';
import { ALL_ROLES } from './constants';

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function login(formData: FormData) {
  const password = formData.get('password') as string;

  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return { error: '비밀번호가 올바르지 않습니다.' };
  }

  const token = await createToken();
  await setAuthCookie(token);
  redirect('/admin/dashboard');
}

export async function logout() {
  await clearAuthCookie();
  redirect('/admin');
}

// ── Guard helper ──────────────────────────────────────────────────────────────

async function requireAuth() {
  const ok = await isAuthenticated();
  if (!ok) redirect('/admin');
}

// ── Schedules ─────────────────────────────────────────────────────────────────

export async function createSchedule(formData: FormData): Promise<void> {
  await requireAuth();

  const title = formData.get('title') as string;
  const month = formData.get('month') as string;

  if (!title?.trim() || !month) return;

  const schedule = await prisma.schedule.create({
    data: { title: title.trim(), month },
  });

  revalidatePath('/admin/dashboard');
  revalidatePath('/');
  redirect(`/admin/dashboard/${schedule.id}`);
}

export async function updateSchedule(id: string, formData: FormData): Promise<void> {
  await requireAuth();

  const title = formData.get('title') as string;
  const month = formData.get('month') as string;

  await prisma.schedule.update({
    where: { id },
    data: { title: title.trim(), month },
  });

  revalidatePath('/admin/dashboard');
  revalidatePath(`/admin/dashboard/${id}`);
  revalidatePath('/');
}

export async function deleteSchedule(id: string) {
  await requireAuth();

  await prisma.schedule.delete({ where: { id } });

  revalidatePath('/admin/dashboard');
  revalidatePath('/');
  redirect('/admin/dashboard');
}

// ── Weeks ─────────────────────────────────────────────────────────────────────

export async function createWeek(scheduleId: string, formData: FormData) {
  await requireAuth();

  const title = formData.get('title') as string;
  const note = (formData.get('note') as string) ?? '';
  const weekNumber = parseInt(formData.get('weekNumber') as string, 10) || 1;

  const lastWeek = await prisma.week.findFirst({
    where: { scheduleId },
    orderBy: { order: 'desc' },
  });

  const week = await prisma.week.create({
    data: {
      scheduleId,
      title: title.trim(),
      note: note.trim(),
      weekNumber,
      order: (lastWeek?.order ?? 0) + 1,
    },
  });

  // Create empty assignment slots for every role
  await prisma.assignment.createMany({
    data: ALL_ROLES.map((r) => ({
      weekId: week.id,
      role: r.id,
      names: '',
    })),
  });

  revalidatePath(`/admin/dashboard/${scheduleId}`);
  revalidatePath('/');
  return { success: true, weekId: week.id };
}

export async function updateWeek(weekId: string, formData: FormData) {
  await requireAuth();

  const title = formData.get('title') as string;
  const note = (formData.get('note') as string) ?? '';

  await prisma.week.update({
    where: { id: weekId },
    data: { title: title.trim(), note: note.trim() },
  });

  // Upsert assignments
  const updates = ALL_ROLES.map((r) => {
    const names = ((formData.get(`role_${r.id}`) as string) ?? '').trim();
    return prisma.assignment.upsert({
      where: { weekId_role: { weekId, role: r.id } },
      create: { weekId, role: r.id, names },
      update: { names },
    });
  });

  await Promise.all(updates);

  const week = await prisma.week.findUnique({
    where: { id: weekId },
    select: { scheduleId: true },
  });

  if (week) {
    revalidatePath(`/admin/dashboard/${week.scheduleId}`);
    revalidatePath('/');
  }

  return { success: true };
}

export async function deleteWeek(weekId: string) {
  await requireAuth();

  const week = await prisma.week.findUnique({
    where: { id: weekId },
    select: { scheduleId: true },
  });

  await prisma.week.delete({ where: { id: weekId } });

  if (week) {
    revalidatePath(`/admin/dashboard/${week.scheduleId}`);
    revalidatePath('/');
  }

  return { success: true };
}
