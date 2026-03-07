import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { additionalServices } from '../schema';

export async function seedAdditionalServices(db: PostgresJsDatabase) {
  const existing = await db.select().from(additionalServices).limit(1);
  if (existing.length > 0) return;

  await db.insert(additionalServices).values([
    {
      name: '택배 포장',
      description: '방송 후 주문 상품을 포장합니다.',
      icon: 'package',
      isActive: true,
      requiresQuantity: true,
      requiresMemo: false,
      sortOrder: 0,
    },
    {
      name: '택배 발송',
      description: '포장된 상품을 택배사에 접수합니다.',
      icon: 'truck',
      isActive: true,
      requiresQuantity: true,
      requiresMemo: false,
      sortOrder: 1,
    },
    {
      name: '상품 촬영',
      description: '방송 전 상품 사진 촬영 서비스입니다.',
      icon: 'camera',
      isActive: true,
      requiresQuantity: false,
      requiresMemo: true,
      sortOrder: 2,
    },
    {
      name: '상품 보관',
      description: '방송 전후 상품을 임시 보관합니다.',
      icon: 'warehouse',
      isActive: true,
      requiresQuantity: false,
      requiresMemo: true,
      sortOrder: 3,
    },
    {
      name: '모델 섭외',
      description: '방송에 필요한 피팅 모델을 섭외합니다.',
      icon: 'user',
      isActive: false,
      requiresQuantity: true,
      requiresMemo: true,
      sortOrder: 4,
    },
  ]);
}
