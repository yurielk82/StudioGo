import { Stack } from 'expo-router';

/**
 * 관리자 화면 그룹 — Stack 네비게이션
 */
export default function AdminLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="studios" />
      <Stack.Screen name="blackouts" />
      <Stack.Screen name="announcements" />
      <Stack.Screen name="notification-settings" />
      <Stack.Screen name="permissions" />
      <Stack.Screen name="feature-flags" />
      <Stack.Screen name="logs" />
    </Stack>
  );
}
