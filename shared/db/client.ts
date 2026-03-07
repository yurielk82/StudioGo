import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import * as relations from './relations';

let _db: ReturnType<typeof drizzle> | null = null;

function getConnectionString(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL 환경변수가 설정되지 않았습니다.');
  }
  return url;
}

/** Lazy-initialized DB 인스턴스 — 첫 쿼리 시점에 연결 */
export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_target, prop) {
    if (!_db) {
      const client = postgres(getConnectionString(), {
        max: 10,
        idle_timeout: 20,
        connect_timeout: 10,
      });
      _db = drizzle(client, {
        schema: { ...schema, ...relations },
      });
    }
    return Reflect.get(_db, prop);
  },
});

export type Database = ReturnType<typeof drizzle>;
