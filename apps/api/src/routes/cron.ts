import { Hono } from 'hono';
import { requireCronSecret } from '../middleware/auth';
import { slotService } from '../services/slot-service';
import { success } from '../lib/response';

const cronRoute = new Hono();

// 모든 cron 엔드포인트는 CRON_SECRET으로 보호
cronRoute.use('*', requireCronSecret);

// GET /cron/reminders — 방송 리마인더 발송
cronRoute.get('/reminders', async (c) => {
  // Phase 11에서 구현: notificationProcessor.processReminders()
  return success(c, { processed: 0, message: '리마인더 처리 완료' });
});

// GET /cron/daily-summary — 일일 요약
cronRoute.get('/daily-summary', async (c) => {
  // Phase 11에서 구현: notificationProcessor.processDailySummary()
  return success(c, { sent: 0, message: '일일 요약 발송 완료' });
});

// GET /cron/weekly-report — 주간 리포트
cronRoute.get('/weekly-report', async (c) => {
  // Phase 11에서 구현: notificationProcessor.processWeeklyReport()
  return success(c, { sent: 0, message: '주간 리포트 발송 완료' });
});

// GET /cron/expire-holds — 만료 hold 정리
cronRoute.get('/expire-holds', async (c) => {
  const expired = await slotService.expireHolds();
  return success(c, { expired, message: `${expired}건 hold 만료 처리 완료` });
});

export default cronRoute;
