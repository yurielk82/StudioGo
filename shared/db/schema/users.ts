import { pgTable, uuid, text, varchar, timestamp, pgEnum, index, uniqueIndex } from 'drizzle-orm/pg-core';

// ── Enums ──────────────────────────────────────

export const userRoleEnum = pgEnum('user_role', ['MEMBER', 'OPERATOR', 'ADMIN']);
export const userStatusEnum = pgEnum('user_status', ['PENDING', 'APPROVED', 'SUSPENDED', 'WITHDRAWN']);
export const tierEnum = pgEnum('tier', ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND']);

// ── Users ──────────────────────────────────────

export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    kakaoId: varchar('kakao_id', { length: 50 }).notNull().unique(),
    email: varchar('email', { length: 255 }),
    name: varchar('name', { length: 50 }),
    nickname: varchar('nickname', { length: 50 }),
    phone: varchar('phone', { length: 20 }),
    profileImage: text('profile_image'),
    bankName: varchar('bank_name', { length: 30 }),
    accountNumber: varchar('account_number', { length: 50 }),
    accountHolder: varchar('account_holder', { length: 30 }),
    tier: tierEnum('tier').notNull().default('BRONZE'),
    role: userRoleEnum('role').notNull().default('MEMBER'),
    status: userStatusEnum('status').notNull().default('PENDING'),
    approvedAt: timestamp('approved_at', { withTimezone: true }),
    approvedBy: uuid('approved_by'),
    memo: text('memo'),
    nicknameNormalized: varchar('nickname_normalized', { length: 50 }),
    phoneNormalized: varchar('phone_normalized', { length: 20 }),
    lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('users_kakao_id_idx').on(table.kakaoId),
    index('users_status_idx').on(table.status),
    index('users_role_idx').on(table.role),
    uniqueIndex('users_nickname_normalized_idx').on(table.nicknameNormalized),
  ],
);
