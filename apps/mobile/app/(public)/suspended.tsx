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
      <View className="flex-1 justify-center items-center px-4">
        <GlassCard className="p-8 items-center w-full max-w-sm">
          <View className="w-16 h-16 rounded-full bg-error-light items-center justify-center mb-4">
            <ShieldAlert size={32} color={COLORS.error.DEFAULT} />
          </View>

          <StyledText variant="heading-lg" className="mb-2 text-center">
            계정 정지
          </StyledText>

          <StyledText variant="body-md" className="text-neutral-500 text-center mb-6">
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
