import { View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Settings,
  Building2,
  CalendarX,
  Megaphone,
  ToggleLeft,
  FileText,
  Shield,
  Bell,
  BarChart3,
} from 'lucide-react-native';
import { Screen, StyledText, GlassCard, COLORS } from '@/design-system';

const MENU_ITEMS = [
  { key: 'dashboard', icon: BarChart3, label: '통계 대시보드', route: '/(admin)/dashboard' },
  { key: 'settings', icon: Settings, label: '운영 설정', route: '/(admin)/settings' },
  { key: 'studios', icon: Building2, label: '스튜디오 관리', route: '/(admin)/studios' },
  { key: 'blackouts', icon: CalendarX, label: '블랙아웃', route: '/(admin)/blackouts' },
  { key: 'announcements', icon: Megaphone, label: '공지사항', route: '/(admin)/announcements' },
  { key: 'notifications', icon: Bell, label: '알림 설정', route: '/(admin)/notification-settings' },
  { key: 'permissions', icon: Shield, label: '권한 관리', route: '/(admin)/permissions' },
  { key: 'flags', icon: ToggleLeft, label: '기능 플래그', route: '/(admin)/feature-flags' },
  { key: 'logs', icon: FileText, label: '시스템 로그', route: '/(admin)/logs' },
] as const;

/**
 * 관리자 메인 — 관리 메뉴 그리드
 */
export default function AdminHomeScreen() {
  const router = useRouter();

  return (
    <Screen>
      <StyledText variant="heading-lg" className="mb-6">
        관리자 패널
      </StyledText>

      <View className="flex-row flex-wrap gap-3">
        {MENU_ITEMS.map(({ key, icon: Icon, label, route }) => (
          <Pressable
            key={key}
            onPress={() => router.push(route as never)}
            className="w-[48%]"
          >
            <GlassCard className="p-5 items-center">
              <View className="w-12 h-12 rounded-full bg-primary-50 items-center justify-center mb-3">
                <Icon size={24} color={COLORS.primary.DEFAULT} />
              </View>
              <StyledText variant="label-lg">{label}</StyledText>
            </GlassCard>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}
