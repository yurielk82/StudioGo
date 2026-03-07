import { View, Platform, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { LogIn } from 'lucide-react-native';
import { Screen, StyledText, Button, GlassCard, COLORS } from '@/design-system';
import { useKakaoNativeLogin, useKakaoWebLogin } from '@/hooks/useAuth';

const KAKAO_AUTH_URL = 'https://kauth.kakao.com/oauth/authorize';
const WEB_REDIRECT_URI = `${process.env.EXPO_PUBLIC_APP_URL ?? 'http://localhost:8081'}/auth/kakao/callback`;

/**
 * 카카오 로그인 화면
 * - 네이티브: @react-native-kakao/login SDK 사용
 * - 웹: OAuth redirect 방식
 */
export default function LoginScreen() {
  const nativeLogin = useKakaoNativeLogin();
  const webLogin = useKakaoWebLogin();

  const isLoading = nativeLogin.isPending || webLogin.isPending;
  const error = nativeLogin.error ?? webLogin.error;

  async function handleKakaoLogin() {
    if (Platform.OS === 'web') {
      // 웹: 카카오 OAuth 페이지로 리다이렉트
      const kakaoAppKey = process.env.EXPO_PUBLIC_KAKAO_APP_KEY ?? '';
      const url = `${KAKAO_AUTH_URL}?client_id=${kakaoAppKey}&redirect_uri=${encodeURIComponent(WEB_REDIRECT_URI)}&response_type=code`;
      await Linking.openURL(url);
      return;
    }

    // 네이티브: 카카오 SDK 로그인
    try {
      const { login } = await import('@react-native-kakao/login');
      const result = await login();
      if (result.accessToken) {
        nativeLogin.mutate(result.accessToken);
      }
    } catch (err) {
      console.error('카카오 네이티브 로그인 실패:', err);
    }
  }

  return (
    <Screen padded={false}>
      <LinearGradient
        colors={COLORS.gradient.primary}
        style={{ flex: 1 }}
      >
        <View className="flex-1 justify-end pb-16 px-6">
          {/* 로고 영역 */}
          <View className="flex-1 justify-center items-center">
            <StyledText variant="display-lg" className="text-white mb-2">
              StudioGo
            </StyledText>
            <StyledText variant="body-lg" className="text-white/70 text-center">
              라이브커머스 스튜디오를{'\n'}간편하게 예약하세요
            </StyledText>
          </View>

          {/* 로그인 카드 */}
          <GlassCard className="p-6">
            <Button
              onPress={handleKakaoLogin}
              loading={isLoading}
              fullWidth
              size="lg"
              className="bg-[#FEE500] active:bg-[#E5CF00]"
              icon={<LogIn size={20} color="#391B1B" />}
            >
              <StyledText className="text-[#391B1B] font-semibold text-body-lg">
                카카오로 시작하기
              </StyledText>
            </Button>

            {error && (
              <StyledText variant="body-sm" className="text-error text-center mt-3">
                로그인에 실패했습니다. 다시 시도해주세요.
              </StyledText>
            )}

            <StyledText variant="caption" className="text-white/50 text-center mt-4">
              로그인 시 서비스 이용약관 및 개인정보 처리방침에 동의합니다.
            </StyledText>
          </GlassCard>
        </View>
      </LinearGradient>
    </Screen>
  );
}
