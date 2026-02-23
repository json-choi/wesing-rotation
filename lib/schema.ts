import {
  pgTable,
  text,
  boolean,
  timestamp,
  integer,
  unique,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ── Better Auth required tables ───────────────────────────────────────────────

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull(),
  image: text('image'),
  createdAt: timestamp('createdAt').notNull(),
  updatedAt: timestamp('updatedAt').notNull(),
});

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expiresAt').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('createdAt').notNull(),
  updatedAt: timestamp('updatedAt').notNull(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
});

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
  refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('createdAt').notNull(),
  updatedAt: timestamp('updatedAt').notNull(),
});

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt'),
  updatedAt: timestamp('updatedAt'),
});

// ── App tables ────────────────────────────────────────────────────────────────

export const schedules = pgTable('schedules', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  title: text('title').notNull(),
  month: text('month').notNull(), // "2025-03"
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const weeks = pgTable('weeks', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  scheduleId: text('schedule_id')
    .references(() => schedules.id, { onDelete: 'cascade' })
    .notNull(),
  weekNumber: integer('week_number').notNull(),
  title: text('title').notNull(),
  note: text('note').default('').notNull(),
  order: integer('order').default(0).notNull(),
});

export const assignments = pgTable(
  'assignments',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    weekId: text('week_id')
      .references(() => weeks.id, { onDelete: 'cascade' })
      .notNull(),
    role: text('role').notNull(),
    names: text('names').default('').notNull(),
  },
  (t) => ({
    weekRoleUnique: unique('assignments_week_role_unique').on(t.weekId, t.role),
  })
);

// ── Relations ─────────────────────────────────────────────────────────────────

export const schedulesRelations = relations(schedules, ({ many }) => ({
  weeks: many(weeks),
}));

export const weeksRelations = relations(weeks, ({ one, many }) => ({
  schedule: one(schedules, {
    fields: [weeks.scheduleId],
    references: [schedules.id],
  }),
  assignments: many(assignments),
}));

export const assignmentsRelations = relations(assignments, ({ one }) => ({
  week: one(weeks, {
    fields: [assignments.weekId],
    references: [weeks.id],
  }),
}));
