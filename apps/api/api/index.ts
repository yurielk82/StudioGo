import { handle } from '@hono/node-server/vercel';
import type { IncomingMessage, ServerResponse } from 'node:http';

// 디버그: app import 시 에러 캡처
let handler: (req: IncomingMessage, res: ServerResponse) => void;
try {
  const app = require('../src/app').default;
  handler = handle(app);
} catch (e: unknown) {
  const err = e instanceof Error ? e : new Error(String(e));
  handler = (_req: IncomingMessage, res: ServerResponse) => {
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 500;
    res.end(
      JSON.stringify({
        error: 'APP_INIT_FAILED',
        message: err.message,
        stack: err.stack?.split('\n').slice(0, 5),
      }),
    );
  };
}

export default handler;
