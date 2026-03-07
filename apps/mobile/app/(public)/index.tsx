import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen } from '@/design-system';
import { StyledText } from '@/design-system';
import { COLORS } from '@/design-system';

/**
 * 랜딩 화면 — 카카오 로그인 진입점
 * Phase 6에서 카카오 로그인 버튼 + 온보딩 UI 구현
 */
export default function LandingScreen() {
  return (
    <Screen padded={false}>
      <LinearGradient
        colors={COLORS.gradient.primary}
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
      >
        <View className="items-center">
          <StyledText variant="display-lg" className="text-white mb-2">
            StudioGo
          </StyledText>
          <StyledText variant="body-lg" className="text-white/80">
            라이브커머스 스튜디오 예약
          </StyledText>
        </View>
      </LinearGradient>
    </Screen>
  );
}
