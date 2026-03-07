import '../global.css';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AppProviders } from '@/providers/AppProviders';

/**
 * 루트 레이아웃 — 전체 앱의 최상위
 * 프로바이더 래핑 + 전역 네비게이션 구조 정의
 */
export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppProviders>
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
      </AppProviders>
    </GestureHandlerRootView>
  );
}
