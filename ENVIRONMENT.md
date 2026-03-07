# StudioGo Environment Variables

## 필수 환경변수

### Database (Neon)
```env
DATABASE_URL=postgresql://user:password@host/studiogo?sslmode=require
```

### Auth (Kakao)
```env
KAKAO_REST_API_KEY=           # 카카오 REST API 키
KAKAO_CLIENT_SECRET=          # 카카오 Client Secret
KAKAO_REDIRECT_URI=           # 웹 OAuth 콜백 URL (예: https://api.studiogo.kr/auth/kakao/callback)
```

### JWT
```env
JWT_SECRET=                   # JWT 서명 키 (최소 32자)
JWT_ACCESS_EXPIRES_IN=15m     # Access token 만료 시간
JWT_REFRESH_EXPIRES_IN=7d     # Refresh token 만료 시간
```

### Kakao 알림톡 (비즈메시지)
```env
KAKAO_BIZ_APP_KEY=            # 비즈메시지 앱 키
KAKAO_BIZ_SENDER_KEY=         # 발신 프로필 키
```

### Expo Push Notifications
```env
EXPO_ACCESS_TOKEN=            # Expo push 토큰
```

### Vercel Cron
```env
CRON_SECRET=                  # Cron 엔드포인트 보호 시크릿
```

### Sentry
```env
SENTRY_DSN=                   # Sentry DSN
SENTRY_AUTH_TOKEN=            # Sentry 릴리스 업로드 토큰
```

### Storage (파일 업로드)
```env
STORAGE_PROVIDER=r2           # r2 | s3 | vercel-blob
STORAGE_BUCKET=studiogo
STORAGE_ACCESS_KEY=
STORAGE_SECRET_KEY=
STORAGE_ENDPOINT=             # R2/S3 엔드포인트
STORAGE_PUBLIC_URL=           # CDN 공개 URL
```

### App URLs
```env
API_URL=https://api.studiogo.kr
APP_URL=https://app.studiogo.kr
```

## 클라이언트 환경변수 (Expo)

Expo 앱에서 사용하는 환경변수는 `EXPO_PUBLIC_` 접두사 필수.

```env
EXPO_PUBLIC_API_URL=https://api.studiogo.kr
EXPO_PUBLIC_KAKAO_NATIVE_APP_KEY=   # 네이티브 앱 키 (공개 가능)
EXPO_PUBLIC_SENTRY_DSN=
```

## 환경별 설정

| 변수 | Development | Production |
|------|-------------|------------|
| API_URL | http://localhost:3001 | https://api.studiogo.kr |
| APP_URL | http://localhost:8081 | https://app.studiogo.kr |
| DATABASE_URL | 로컬 또는 Neon dev branch | Neon production |

## .env 파일 구조

```
apps/api/.env          # API 서버 전용
apps/api/.env.local    # 로컬 개발용 오버라이드
apps/mobile/.env       # Expo 앱 전용
.env.example           # 템플릿 (값 없이 키만)
```

## 주의사항

- `.env` 파일은 절대 git에 커밋하지 않음
- `KAKAO_CLIENT_SECRET`, `JWT_SECRET`, `CRON_SECRET`은 절대 클라이언트에 노출 금지
- Vercel 환경변수는 프로젝트 설정에서 관리
- EAS 빌드 시크릿은 `eas secret` 명령으로 관리
