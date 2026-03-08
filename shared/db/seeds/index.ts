import { config } from 'dotenv';
import { resolve } from 'path';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../schema';

// apps/api/.env 로드 (npm run db:seed 시 cwd가 apps/api)
config({ path: resolve(process.cwd(), '.env') });
import { seedOperationSettings } from './operation-settings';
import { seedNotificationSettings } from './notification-settings';
import { seedAdminUser } from './admin-user';
import { seedStudios } from './studios';
import { seedAdditionalServices } from './additional-services';
import { seedFeatureFlags } from './feature-flags';
import { seedDevUsers } from './dev-users';

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL 환경변수가 설정되지 않았습니다.');
  }

  const client = postgres(connectionString, { max: 1 });
  const db = drizzle(client, { schema });

  console.warn('시드 시작...');

  await seedOperationSettings(db);
  console.warn('  운영 설정 완료');

  await seedNotificationSettings(db);
  console.warn('  알림 설정 완료');

  await seedAdminUser(db);
  console.warn('  관리자 계정 완료');

  await seedStudios(db);
  console.warn('  스튜디오 완료');

  await seedAdditionalServices(db);
  console.warn('  부가서비스 완료');

  await seedFeatureFlags(db);
  console.warn('  Feature Flags 완료');

  await seedDevUsers(db);
  console.warn('  개발용 테스트 유저 완료');

  console.warn('시드 완료!');
  await client.end();
  process.exit(0);
}

main().catch((error) => {
  console.error('시드 실패:', error);
  process.exit(1);
});
