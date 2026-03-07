import { View } from 'react-native';
import { Clock } from 'lucide-react-native';
import { Screen, StyledText, Button, GlassCard, COLORS } from '@/design-system';
import { useLogout, useMe } from '@/hooks/useAuth';

/**
 * 승인 대기 화면 — PENDING 상태 사용자에게 표시
 */
export default function PendingScreen() {
  const logout = useLogout();
  const { refetch, isFetching } = useMe();

  return (
    <Screen>
      <View className="flex-1 justify-center items-center px-4">
        <GlassCard className="p-8 items-center w-full max-w-sm">
          <View className="w-16 h-16 rounded-full bg-primary-50 items-center justify-center mb-4">
            <Clock size={32} color={COLORS.primary.DEFAULT} />
          </View>

          <StyledText variant="heading-lg" className="mb-2 text-center">
            승인 대기 중
          </StyledText>

          <StyledText variant="body-md" className="text-neutral-500 text-center mb-6">
            운영자가 회원가입을 검토 중입니다.{'\n'}
            승인이 완료되면 알림을 보내드립니다.
          </StyledText>

          <Button
            onPress={() => refetch()}
            variant="outline"
            fullWidth
            loading={isFetching}
            className="mb-3"
          >
            상태 확인
          </Button>

          <Button onPress={() => logout.mutate()} variant="ghost" fullWidth>
            로그아웃
          </Button>
        </GlassCard>
      </View>
    </Screen>
  );
}
