import { Tabs } from 'expo-router';
import { Calendar, Home, Bell, User } from 'lucide-react-native';
import { useResponsive } from '@/hooks/useResponsive';
import { COLORS } from '@/design-system';

const ICON_SIZE = 22;
const ACTIVE_COLOR = COLORS.primary.DEFAULT;
const INACTIVE_COLOR = COLORS.neutral[400];

/**
 * 회원 탭 레이아웃 — 모바일: 하단 탭, 태블릿/데스크톱: Phase 8에서 사이드바 전환
 */
export default function MemberLayout() {
  const { isMobile } = useResponsive();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: ACTIVE_COLOR,
        tabBarInactiveTintColor: INACTIVE_COLOR,
        tabBarStyle: {
          display: isMobile ? 'flex' : 'none',
          borderTopWidth: 0,
          elevation: 0,
          backgroundColor: 'rgba(255,255,255,0.9)',
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '홈',
          tabBarIcon: ({ color }) => <Home size={ICON_SIZE} color={color} />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: '캘린더',
          tabBarIcon: ({ color }) => <Calendar size={ICON_SIZE} color={color} />,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: '알림',
          tabBarIcon: ({ color }) => <Bell size={ICON_SIZE} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: '내 정보',
          tabBarIcon: ({ color }) => <User size={ICON_SIZE} color={color} />,
        }}
      />
    </Tabs>
  );
}
