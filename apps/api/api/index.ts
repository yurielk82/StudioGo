// 최소 테스트 핸들러 - 외부 의존성 없음
import type { IncomingMessage, ServerResponse } from 'node:http';

export default function handler(req: IncomingMessage, res: ServerResponse) {
  res.setHeader('Content-Type', 'application/json');
  res.end(
    JSON.stringify({
      success: true,
      data: { service: 'StudioGo API', status: 'healthy', timestamp: new Date().toISOString() },
    }),
  );
}
