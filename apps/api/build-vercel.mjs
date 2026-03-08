// Vercel Build Output API를 사용하여 CJS 번들 생성
// ESM→CJS 변환으로 Vercel 서버리스 런타임 호환성 확보
import { build } from 'esbuild';
import { mkdirSync, writeFileSync, cpSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FUNC_DIR = resolve(__dirname, '.vercel/output/functions/api/index.func');
const OUTPUT_DIR = resolve(__dirname, '.vercel/output');
const STATIC_DIR = resolve(OUTPUT_DIR, 'static');

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

// 정적 파일 복사 (이용약관, 개인정보처리방침 등)
const publicDir = resolve(__dirname, 'public');
if (existsSync(publicDir)) {
  mkdirSync(STATIC_DIR, { recursive: true });
  cpSync(publicDir, STATIC_DIR, { recursive: true });
  console.log('Static files copied from public/');
}

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

console.log('Vercel build complete: CJS bundle created');
