/**
 * Expo Push Notification 클라이언트
 * @see https://docs.expo.dev/push-notifications/sending-notifications/
 */

const EXPO_PUSH_API = 'https://exp.host/--/api/v2/push/send';
const TIMEOUT_MS = 10_000;
const BATCH_SIZE = 100;

interface PushMessage {
  to: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sound?: 'default' | null;
  badge?: number;
  channelId?: string;
}

interface PushTicket {
  id?: string;
  status: 'ok' | 'error';
  message?: string;
  details?: { error?: string };
}

interface SendPushResult {
  success: boolean;
  tickets: PushTicket[];
  error?: string;
}

/**
 * Expo Push 알림 발송 (배치 지원)
 * 환경변수 미설정 시 로그만 출력하고 성공 반환
 */
export async function sendExpoPush(messages: PushMessage[]): Promise<SendPushResult> {
  const accessToken = process.env.EXPO_ACCESS_TOKEN;

  if (!accessToken) {
    console.warn('[Expo Push] 환경변수 미설정 — 스킵:', messages.length, '건');
    return {
      success: true,
      tickets: messages.map(() => ({ status: 'ok' as const, id: `dev-skip-${Date.now()}` })),
    };
  }

  const allTickets: PushTicket[] = [];

  // 100개씩 배치 전송
  for (let i = 0; i < messages.length; i += BATCH_SIZE) {
    const batch = messages.slice(i, i + BATCH_SIZE);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const response = await fetch(EXPO_PUSH_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
          'Accept-Encoding': 'gzip, deflate',
        },
        body: JSON.stringify(batch),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error('[Expo Push] 배치 실패:', response.status, errorBody);
        return { success: false, tickets: allTickets, error: `HTTP ${response.status}` };
      }

      const data = (await response.json()) as { data: PushTicket[] };
      allTickets.push(...data.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('[Expo Push] 네트워크 에러:', message);
      return { success: false, tickets: allTickets, error: message };
    } finally {
      clearTimeout(timeout);
    }
  }

  return { success: true, tickets: allTickets };
}

/**
 * 단일 푸시 알림 발송 헬퍼
 */
export async function sendSinglePush(
  pushToken: string,
  title: string,
  body: string,
  data?: Record<string, unknown>,
): Promise<SendPushResult> {
  return sendExpoPush([
    {
      to: pushToken,
      title,
      body,
      data,
      sound: 'default',
    },
  ]);
}
