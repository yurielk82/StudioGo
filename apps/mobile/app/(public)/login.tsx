import { View, Platform, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { LogIn, UserCheck, ShieldCheck, Settings, Clock } from 'lucide-react-native';
import { Screen, StyledText, Button, GlassCard, COLORS } from '@/design-system';
import { useKakaoNativeLogin, useKakaoWebLogin, useDevLogin } from '@/hooks/useAuth';

const KAKAO_AUTH_URL = 'https://kauth.kakao.com/oauth/authorize';
const WEB_REDIRECT_URI = `${process.env.EXPO_PUBLIC_APP_URL ?? 'http://localhost:8081'}/auth/kakao/callback`;

/**
 * 카카오 로그인 화면
 * - 네이티브: @react-native-kakao/user SDK 사용
 * - 웹: OAuth redirect 방식
 */
const DEV_LOGIN_BUTTONS = [
  { role: 'member', label: '멤버 로그인', icon: UserCheck },
  { role: 'operator', label: '운영자 로그인', icon: Settings },
  { role: 'admin', label: '관리자 로그인', icon: ShieldCheck },
  { role: 'pending', label: '대기회원 로그인', icon: Clock },
] as const;

function isLocalhost(): boolean {
  if (Platform.OS !== 'web') return false;
  const hostname = typeof window !== 'undefined' ? window.location?.hostname : '';
  return hostname === 'localhost' || hostname === '127.0.0.1';
}

export default function LoginScreen() {
  const nativeLogin = useKakaoNativeLogin();
  const webLogin = useKakaoWebLogin();
  const devLogin = useDevLogin();

  const isLoading = nativeLogin.isPending || webLogin.isPending || devLogin.isPending;
  const error = nativeLogin.error ?? webLogin.error ?? devLogin.error;

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
      const kakaoUser = require('@react-native-kakao/user');
      const result = await kakaoUser.login();
      if (result.accessToken) {
        nativeLogin.mutate(result.accessToken);
      }
    } catch (err) {
      console.error('카카오 네이티브 로그인 실패:', err);
    }
  }

  return (
    <Screen padded={false}>
      <LinearGradient colors={COLORS.gradient.primary} style={{ flex: 1 }}>
        <View className="flex-1 justify-end px-6 pb-16">
          {/* 로고 영역 */}
          <View className="flex-1 items-center justify-center">
            <StyledText variant="display-lg" className="mb-2 text-white">
              StudioGo
            </StyledText>
            <StyledText variant="body-lg" className="text-center text-white/70">
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
              className="bg-kakao active:bg-kakao-active"
              icon={<LogIn size={20} color={COLORS.kakao.text} />}
            >
              <StyledText className="text-body-lg font-semibold text-kakao-text">
                카카오로 시작하기
              </StyledText>
            </Button>

            {isLocalhost() && (
              <View className="mt-4 gap-2">
                <StyledText variant="caption" className="text-center text-white/40">
                  개발용 로그인
                </StyledText>
                {DEV_LOGIN_BUTTONS.map(({ role, label, icon: Icon }) => (
                  <Button
                    key={role}
                    onPress={() => devLogin.mutate(role)}
                    loading={devLogin.isPending && devLogin.variables === role}
                    disabled={isLoading}
                    fullWidth
                    size="sm"
                    variant="outline"
                    icon={<Icon size={16} color="rgba(255,255,255,0.6)" />}
                  >
                    <StyledText variant="body-sm" className="text-white/60">
                      {label}
                    </StyledText>
                  </Button>
                ))}
              </View>
            )}

            {error && (
              <StyledText variant="body-sm" className="mt-3 text-center text-error">
                로그인에 실패했습니다. 다시 시도해주세요.
              </StyledText>
            )}

            <StyledText variant="caption" className="mt-4 text-center text-white/50">
              로그인 시 서비스 이용약관 및 개인정보 처리방침에 동의합니다.
            </StyledText>
          </GlassCard>
        </View>
      </LinearGradient>
    </Screen>
  );
}
