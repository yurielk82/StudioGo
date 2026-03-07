import { handle } from '@hono/node-server/vercel';
import type { IncomingMessage, ServerResponse } from 'node:http';
import app from '../src/app';

// 디버그: 초기화 에러를 응답으로 반환
const wrappedHandler = handle(app);
let initError: Error | null = null;

export default function handler(req: IncomingMessage, res: ServerResponse) {
  if (initError) {
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 500;
    res.end(
      JSON.stringify({
        error: 'APP_INIT_FAILED',
        message: initError.message,
        stack: initError.stack?.split('\n').slice(0, 10),
      }),
    );
    return;
  }
  try {
    return wrappedHandler(req, res);
  } catch (e: unknown) {
    initError = e instanceof Error ? e : new Error(String(e));
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 500;
    res.end(
      JSON.stringify({
        error: 'HANDLER_ERROR',
        message: initError.message,
        stack: initError.stack?.split('\n').slice(0, 10),
      }),
    );
  }
}
