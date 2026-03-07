/**
 * 카카오 알림톡 API 클라이언트
 * @see https://developers.kakao.com/docs/latest/ko/message/rest-api
 */

const KAKAO_BIZ_API = 'https://kapi.kakao.com/v2/api/talk/memo/default/send';
const TIMEOUT_MS = 5_000;

interface SendAlimtalkParams {
  /** 수신자 전화번호 (국가코드 포함, 예: 01012345678) */
  phoneNumber: string;
  /** 알림톡 템플릿 코드 */
  templateCode: string;
  /** 템플릿 변수 치환 */
  variables: Record<string, string>;
}

interface AlimtalkResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * 카카오 알림톡 발송
 * 환경변수 미설정 시 로그만 출력하고 성공 반환 (개발 환경 대응)
 */
export async function sendAlimtalk(params: SendAlimtalkParams): Promise<AlimtalkResult> {
  const appKey = process.env.KAKAO_BIZ_APP_KEY;
  const senderKey = process.env.KAKAO_BIZ_SENDER_KEY;

  if (!appKey || !senderKey) {
    console.warn('[알림톡] 환경변수 미설정 — 스킵:', params.templateCode, params.phoneNumber);
    return { success: true, messageId: `dev-skip-${Date.now()}` };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(KAKAO_BIZ_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `KakaoAK ${appKey}`,
      },
      body: JSON.stringify({
        senderKey,
        templateCode: params.templateCode,
        recipientList: [
          {
            recipientNo: params.phoneNumber,
            templateParameter: params.variables,
          },
        ],
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('[알림톡] 발송 실패:', response.status, errorBody);
      return { success: false, error: `HTTP ${response.status}: ${errorBody}` };
    }

    const data = (await response.json()) as { messageId?: string };
    return { success: true, messageId: data.messageId };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[알림톡] 네트워크 에러:', message);
    return { success: false, error: message };
  } finally {
    clearTimeout(timeout);
  }
}
