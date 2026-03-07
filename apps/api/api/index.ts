import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import app from '../src/app';

// Vercel: /api/* 요청을 실제 앱으로 라우팅
const vercelApp = new Hono().basePath('/api');
vercelApp.route('/', app);

export default handle(vercelApp);
