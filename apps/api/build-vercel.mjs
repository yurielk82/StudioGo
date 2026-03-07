// Vercel Build Output API를 사용하여 CJS 번들 생성
// ESM→CJS 변환으로 Vercel 서버리스 런타임 호환성 확보
import { build } from 'esbuild';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FUNC_DIR = resolve(__dirname, '.vercel/output/functions/api/index.func');
const OUTPUT_DIR = resolve(__dirname, '.vercel/output');

mkdirSync(FUNC_DIR, { recursive: true });

// esbuild: 모노레포 루트 기준으로 경로 해석
await build({
  entryPoints: [resolve(__dirname, 'api/index.ts')],
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'cjs',
  outfile: resolve(FUNC_DIR, 'index.js'),
  external: ['node:*'],
  minify: false,
  sourcemap: false,
  // absWorkingDir을 모노레포 루트로 설정하여 shared/ 경로 해석
  absWorkingDir: resolve(__dirname, '../..'),
  // CJS default export를 module.exports에 직접 할당
  footer: { js: 'if(module.exports.default)module.exports=module.exports.default;' },
});

// 함수 디렉토리에 CJS 명시 (상위 package.json의 "type": "module" 오버라이드)
writeFileSync(
  resolve(FUNC_DIR, 'package.json'),
  JSON.stringify({ type: 'commonjs' }),
);

// 함수 설정
writeFileSync(
  resolve(FUNC_DIR, '.vc-config.json'),
  JSON.stringify({
    handler: 'index.js',
    runtime: 'nodejs22.x',
    launcherType: 'Nodejs',
    shouldAddHelpers: true,
    shouldAddSourcemapSupport: false,
  }),
);

// Vercel 라우팅 설정
writeFileSync(
  resolve(OUTPUT_DIR, 'config.json'),
  JSON.stringify({
    version: 3,
    routes: [
      { src: '/api/(.*)', dest: '/api' },
      { handle: 'filesystem' },
    ],
  }),
);

// @vercel/node Zero Config이 api/index.ts를 tsc 컴파일하여 Build Output API를
// 덮어쓰는 것을 방지: 번들링 후 소스를 빈 핸들러로 교체
writeFileSync(
  resolve(__dirname, 'api/index.ts'),
  'export default function handler(_req: any, res: any) { res.end("use build output"); }\n',
);

console.log('Vercel build complete: CJS bundle created');
