import { View } from 'react-native';
import { Screen, StyledText, GlassCard, Button } from '@/design-system';

/**
 * 회원 홈 — 다음 예약, 빠른 예약, 최근 방송 요약
 * Phase 7에서 구현
 */
export default function MemberHomeScreen() {
  return (
    <Screen>
      <StyledText variant="heading-lg" className="mb-4">
        안녕하세요!
      </StyledText>

      <GlassCard className="p-5 mb-4">
        <StyledText variant="label-md" className="text-neutral-500 mb-1">
          다음 예약
        </StyledText>
        <StyledText variant="heading-md">예약이 없습니다</StyledText>
        <View className="mt-4">
          <Button size="md">새 예약하기</Button>
        </View>
      </GlassCard>
    </Screen>
  );
}
