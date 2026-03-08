// ── 날짜/시간 유틸리티 ──────────────────────────────
// 비즈니스 기준: Asia/Seoul
// JS Date 직접 사용 금지 — 이 모듈을 통해 처리

const TIMEZONE = 'Asia/Seoul';
const TIMEZONE_OFFSET_MS = 9 * 60 * 60 * 1000; // KST = UTC+9

/** 현재 KST Date 객체 반환 */
export function nowKST(): Date {
  return new Date();
}

/** UTC Date를 KST YYYY-MM-DD 문자열로 변환 */
export function toKSTDateString(date: Date): string {
  const kst = new Date(date.getTime() + TIMEZONE_OFFSET_MS);
  return kst.toISOString().substring(0, 10);
}

/** UTC Date를 KST HH:mm 문자열로 변환 */
export function toKSTTimeString(date: Date): string {
  const kst = new Date(date.getTime() + TIMEZONE_OFFSET_MS);
  return kst.toISOString().slice(11, 16);
}

/** YYYY-MM-DD + HH:mm → UTC Date */
export function kstToUTC(dateStr: string, timeStr: string): Date {
  const kstDate = new Date(`${dateStr}T${timeStr}:00+09:00`);
  return kstDate;
}

/** KST 날짜 문자열(YYYY-MM-DD)을 해당 날짜 0시 UTC로 변환 */
export function kstDateToUTCStart(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00+09:00`);
}

/** KST 날짜 문자열(YYYY-MM-DD)을 해당 날짜 23:59:59 UTC로 변환 */
export function kstDateToUTCEnd(dateStr: string): Date {
  return new Date(`${dateStr}T23:59:59+09:00`);
}

/** 오늘 KST 날짜 문자열 반환 */
export function todayKST(): string {
  return toKSTDateString(new Date());
}

/** 두 Date 사이의 분 차이 */
export function diffMinutes(start: Date, end: Date): number {
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60));
}

/** 날짜에 일 추가 */
export function addDays(dateStr: string, days: number): string {
  const date = new Date(`${dateStr}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().substring(0, 10);
}

/** 날짜 범위 생성 (시작일 ~ 종료일 포함) */
export function dateRange(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  let current = startDate;

  while (current <= endDate) {
    dates.push(current);
    current = addDays(current, 1);
  }

  return dates;
}

/** 비즈니스 timezone 반환 */
export function getBusinessTimezone(): string {
  return TIMEZONE;
}
