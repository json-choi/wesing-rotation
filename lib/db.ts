import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import type { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import * as schema from './schema';

type Db = NeonHttpDatabase<typeof schema>;

let _db: Db | null = null;

function getDb(): Db {
  if (_db) return _db;
  // Lazy: neon() is called only on first actual database access (not at module load / build time)
  _db = drizzle(neon(process.env.DATABASE_URL!), { schema });
  return _db;
}

// Proxy forwards every property access to the lazily-created Drizzle instance
export const db = new Proxy({} as Db, {
  get(_, prop: string | symbol) {
    const instance = getDb();
    const value = (instance as unknown as Record<string | symbol, unknown>)[prop];
    return typeof value === 'function'
      ? (value as (...a: unknown[]) => unknown).bind(instance)
      : value;
  },
});
