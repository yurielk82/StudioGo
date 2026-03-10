import '../global.css';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Sentry from '@sentry/react-native';
import Constants from 'expo-constants';
import { AppProviders } from '@/providers/AppProviders';
import { AuthGuard } from '@/providers/AuthGuard';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// Sentry 초기화
const SENTRY_DSN = Constants.expoConfig?.extra?.sentryDsn as string | undefined;
if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    tracesSampleRate: __DEV__ ? 1.0 : 0.2,
    enabled: !__DEV__,
  });
}

/**
 * 루트 레이아웃 — 전체 앱의 최상위
 * 프로바이더 래핑 + 전역 네비게이션 구조 정의
 */
function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
        <AppProviders>
          <AuthGuard>
            <StatusBar style="auto" />
            <Stack
              screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
              }}
            >
              <Stack.Screen name="(public)" />
              <Stack.Screen name="(member)" />
              <Stack.Screen name="(operator)" />
              <Stack.Screen name="(admin)" />
            </Stack>
          </AuthGuard>
        </AppProviders>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}

// Sentry가 설정되어 있으면 감싸기, 아니면 그대로
export default SENTRY_DSN ? Sentry.wrap(RootLayout) : RootLayout;
