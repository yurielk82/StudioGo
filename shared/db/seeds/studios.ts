import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { studios } from '../schema';

export async function seedStudios(db: PostgresJsDatabase<Record<string, unknown>>) {
  const existingStudios = await db.select().from(studios).limit(1);
  if (existingStudios.length > 0) return;

  await db.insert(studios).values([
    {
      name: 'A 스튜디오',
      description: '넓고 밝은 메인 스튜디오. 대형 방송에 적합합니다.',
      capacity: 4,
      equipment: ['링라이트', '4K 카메라', '마이크', '모니터', '옷걸이 100개'],
      images: [],
      isActive: true,
      sortOrder: 0,
    },
    {
      name: 'B 스튜디오',
      description: '아담한 크기의 서브 스튜디오. 소규모 방송에 적합합니다.',
      capacity: 2,
      equipment: ['링라이트', 'HD 카메라', '마이크', '옷걸이 50개'],
      images: [],
      isActive: true,
      sortOrder: 1,
    },
    {
      name: 'C 스튜디오',
      description: 'VIP 전용 프리미엄 스튜디오.',
      capacity: 6,
      equipment: [
        '프로 조명 세트',
        '4K 듀얼 카메라',
        '콘덴서 마이크',
        '대형 모니터',
        '옷걸이 200개',
        '피팅룸',
      ],
      images: [],
      isActive: true,
      sortOrder: 2,
    },
  ]);
}
