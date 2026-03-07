import { View } from 'react-native';
import { ShieldAlert } from 'lucide-react-native';
import { Screen, StyledText, Button, GlassCard, COLORS } from '@/design-system';
import { useLogout } from '@/hooks/useAuth';

/**
 * 정지 안내 화면 — SUSPENDED 상태 사용자에게 표시
 */
export default function SuspendedScreen() {
  const logout = useLogout();

  return (
    <Screen>
      <View className="flex-1 items-center justify-center px-4">
        <GlassCard className="w-full max-w-sm items-center p-8">
          <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-error-light">
            <ShieldAlert size={32} color={COLORS.error} />
          </View>

          <StyledText variant="heading-lg" className="mb-2 text-center">
            계정 정지
          </StyledText>

          <StyledText variant="body-md" className="mb-6 text-center text-neutral-500">
            회원님의 계정이 정지되었습니다.{'\n'}
            자세한 내용은 운영자에게 문의해주세요.
          </StyledText>

          <Button onPress={() => logout.mutate()} variant="ghost" fullWidth>
            로그아웃
          </Button>
        </GlassCard>
      </View>
    </Screen>
  );
}
