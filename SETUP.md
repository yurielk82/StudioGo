# StudioGo Setup Guide

## 사전 요구사항

- Node.js 20+
- npm 10+
- Git
- Neon 계정 (PostgreSQL)
- Kakao Developers 계정
- Vercel 계정
- Expo 계정 (EAS Build)

## 초기 설치

```bash
# 레포 클론
git clone https://github.com/yurielk82/StudioGo.git
cd StudioGo

# 의존성 설치
npm install

# 환경변수 설정
cp apps/api/.env.example apps/api/.env
cp apps/mobile/.env.example apps/mobile/.env
# .env 파일에 실제 값 입력
```

## 개발 서버 실행

```bash
# 전체 실행 (모바일 + API)
npm run dev:all

# 개별 실행
npm run dev:mobile    # Expo dev server (포트 8081)
npm run dev:api       # Hono dev server (포트 3001)
```

## 데이터베이스

### 마이그레이션

```bash
# 마이그레이션 생성
cd apps/api
npx drizzle-kit generate

# 마이그레이션 실행
npx drizzle-kit migrate

# 마이그레이션 상태 확인
npx drizzle-kit status
```

### 시드

```bash
cd apps/api
npx tsx shared/db/seeds/index.ts
```

### Drizzle Studio (DB 탐색기)

```bash
cd apps/api
npx drizzle-kit studio
```

## 코드 품질

```bash
# 린트
npm run lint

# 포맷
npm run format

# 타입 체크
npm run typecheck

# 테스트
npm test

# 전체 검증
npm run lint && npm run typecheck && npm test
```

## 빌드

### API (Vercel)

```bash
npm run build:api
```

### Mobile (Expo Web)

```bash
npm run build:mobile
```

### Mobile (네이티브)

```bash
# iOS
cd apps/mobile
eas build --platform ios

# Android
cd apps/mobile
eas build --platform android
```

## 배포

### Vercel 배포 (API)

```bash
cd apps/api
vercel --prod
```

### Vercel 배포 (Web)

```bash
cd apps/mobile
vercel --prod
```

### EAS 제출 (앱스토어)

```bash
cd apps/mobile
eas submit --platform ios
eas submit --platform android
```

## 프로젝트 구조

```
studiogo/
  apps/
    mobile/          # Expo 앱
    api/             # Hono API 서버
  shared/
    domain/          # 비즈니스 규칙
    contracts/       # 공유 스키마/타입
    db/              # DB 스키마/마이그레이션
    constants/       # 공유 상수
```

상세 구조는 [ARCHITECTURE.md](./ARCHITECTURE.md) 참조.

## 문제 해결

### DB 연결 실패
- `DATABASE_URL` 확인
- Neon 대시보드에서 IP 허용 확인
- SSL 모드 확인 (`?sslmode=require`)

### 카카오 로그인 실패
- Kakao Developers 앱 설정 확인
- Redirect URI 등록 확인
- 네이티브 앱 키 / REST API 키 구분 확인

### Expo 빌드 에러
- `npx expo doctor` 실행
- `node_modules` 삭제 후 재설치
- Expo SDK 버전과 패키지 호환성 확인
