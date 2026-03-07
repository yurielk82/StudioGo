import { Stack } from 'expo-router';

/**
 * 공개 화면 그룹 — 로그인/회원가입/대기 화면
 */
export default function PublicLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
    />
  );
}
