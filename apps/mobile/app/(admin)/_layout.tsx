import { Stack } from 'expo-router';

/**
 * 관리자 화면 그룹 — Phase 10에서 설정/스튜디오/회원관리 구현
 */
export default function AdminLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    />
  );
}
