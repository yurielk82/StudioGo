import { Stack } from 'expo-router';

/**
 * 운영자 화면 그룹 — Phase 9에서 대시보드/예약관리/체크인 구현
 */
export default function OperatorLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    />
  );
}
