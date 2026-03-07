import { Stack } from 'expo-router';

/**
 * 운영자 화면 그룹 — Stack 네비게이션
 */
export default function OperatorLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="reservations" />
      <Stack.Screen name="members" />
      <Stack.Screen name="checkin" />
      <Stack.Screen name="fulfillment" />
    </Stack>
  );
}
