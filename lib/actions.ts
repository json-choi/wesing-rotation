'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { eq, desc } from 'drizzle-orm';
import { db } from './db';
import { schedules, weeks, assignments } from './schema';
import { auth } from './auth';
import { ALL_ROLES } from './constants';

// ── Guard helper ──────────────────────────────────────────────────────────────

async function requireAuth() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect('/admin');
}

// ── Schedules ─────────────────────────────────────────────────────────────────

export async function createSchedule(formData: FormData): Promise<void> {
  await requireAuth();

  const title = formData.get('title') as string;
  const month = formData.get('month') as string;
  if (!title?.trim() || !month) return;

  const [schedule] = await db
    .insert(schedules)
    .values({ title: title.trim(), month })
    .returning({ id: schedules.id });

  revalidatePath('/admin/dashboard');
  revalidatePath('/');
  redirect(`/admin/dashboard/${schedule.id}`);
}

export async function updateSchedule(id: string, formData: FormData): Promise<void> {
  await requireAuth();

  const title = formData.get('title') as string;
  const month = formData.get('month') as string;

  await db
    .update(schedules)
    .set({ title: title.trim(), month, updatedAt: new Date() })
    .where(eq(schedules.id, id));

  revalidatePath('/admin/dashboard');
  revalidatePath(`/admin/dashboard/${id}`);
  revalidatePath('/');
}

export async function deleteSchedule(id: string): Promise<void> {
  await requireAuth();

  await db.delete(schedules).where(eq(schedules.id, id));

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

  const [lastWeek] = await db
    .select({ order: weeks.order })
    .from(weeks)
    .where(eq(weeks.scheduleId, scheduleId))
    .orderBy(desc(weeks.order))
    .limit(1);

  const [week] = await db
    .insert(weeks)
    .values({
      scheduleId,
      title: title.trim(),
      note: note.trim(),
      weekNumber,
      order: (lastWeek?.order ?? 0) + 1,
    })
    .returning({ id: weeks.id });

  await db.insert(assignments).values(
    ALL_ROLES.map((r) => ({ weekId: week.id, role: r.id, names: '' }))
  );

  revalidatePath(`/admin/dashboard/${scheduleId}`);
  revalidatePath('/');
  return { success: true };
}

export async function updateWeek(weekId: string, formData: FormData) {
  await requireAuth();

  const title = formData.get('title') as string;
  const note = (formData.get('note') as string) ?? '';

  await db
    .update(weeks)
    .set({ title: title.trim(), note: note.trim() })
    .where(eq(weeks.id, weekId));

  await Promise.all(
    ALL_ROLES.map((r) => {
      const names = ((formData.get(`role_${r.id}`) as string) ?? '').trim();
      return db
        .insert(assignments)
        .values({ weekId, role: r.id, names })
        .onConflictDoUpdate({
          target: [assignments.weekId, assignments.role],
          set: { names },
        });
    })
  );

  const [week] = await db
    .select({ scheduleId: weeks.scheduleId })
    .from(weeks)
    .where(eq(weeks.id, weekId));

  if (week) {
    revalidatePath(`/admin/dashboard/${week.scheduleId}`);
    revalidatePath('/');
  }

  return { success: true };
}

export async function deleteWeek(weekId: string) {
  await requireAuth();

  const [week] = await db
    .select({ scheduleId: weeks.scheduleId })
    .from(weeks)
    .where(eq(weeks.id, weekId));

  await db.delete(weeks).where(eq(weeks.id, weekId));

  if (week) {
    revalidatePath(`/admin/dashboard/${week.scheduleId}`);
    revalidatePath('/');
  }

  return { success: true };
}
