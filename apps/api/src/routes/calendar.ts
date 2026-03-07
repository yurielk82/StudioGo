import { Hono } from 'hono';
import { calendarService } from '../services/calendar-service';
import { requireAuth, getAuthUser } from '../middleware/auth';
import { success } from '../lib/response';
import {
  MonthlyCalendarQuerySchema,
  WeeklyCalendarQuerySchema,
  DailyCalendarQuerySchema,
} from '../../../../shared/contracts/schemas/calendar';

const calendarRoute = new Hono();

// GET /calendar/monthly — 월간 데이터
calendarRoute.get('/monthly', requireAuth, async (c) => {
  const user = getAuthUser(c);
  const query = MonthlyCalendarQuerySchema.parse(c.req.query());
  const data = await calendarService.getMonthly(query, user.userId);
  return success(c, data);
});

// GET /calendar/weekly — 주간 데이터
calendarRoute.get('/weekly', requireAuth, async (c) => {
  const query = WeeklyCalendarQuerySchema.parse(c.req.query());
  const data = await calendarService.getWeekly(query);
  return success(c, data);
});

// GET /calendar/daily — 일간 데이터
calendarRoute.get('/daily', requireAuth, async (c) => {
  const query = DailyCalendarQuerySchema.parse(c.req.query());
  const data = await calendarService.getDaily(query);
  return success(c, data);
});

export default calendarRoute;
