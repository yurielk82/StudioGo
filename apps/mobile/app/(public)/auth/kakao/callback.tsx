import { useEffect, useRef } from 'react';
import { View, ActivityIndicator, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, StyledText, COLORS } from '@/design-system';
import { useKakaoWebLogin } from '@/hooks/useAuth';

/**
 * 카카오 OAuth 콜백 페이지
 * 카카오 인증 후 ?code=xxx 파라미터를 받아 서버에 전달
 */
export default function KakaoCallbackScreen() {
  const router = useRouter();
  const webLogin = useKakaoWebLogin();
  const processed = useRef(false);

  // URL에서 code 추출 → API 서버로 토큰 교환 요청
  useEffect(() => {
    if (Platform.OS !== 'web' || processed.current) return;

    const url = new URL(window.location.href);
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');

    if (error) {
      console.error('카카오 인증 거부:', error);
      router.replace('/(public)/login');
      return;
    }

    if (!code) {
      router.replace('/(public)/login');
      return;
    }

    processed.current = true;
    const redirectUri = `${window.location.origin}/auth/kakao/callback`;
    webLogin.mutate({ code, redirectUri });
  }, []);

  // 성공 시 사용자 상태에 따라 라우팅
  useEffect(() => {
    if (webLogin.isSuccess && webLogin.data) {
      const { isNewUser, user } = webLogin.data;
      if (isNewUser || !user.nickname) {
        router.replace('/(public)/signup');
      } else if (user.status === 'PENDING') {
        router.replace('/(public)/pending');
      }
      // APPROVED 사용자는 AuthGuard가 역할별 홈으로 라우팅
    }
  }, [webLogin.isSuccess, webLogin.data]);

  // 에러 발생 시 로그인 화면으로
  useEffect(() => {
    if (webLogin.isError) {
      router.replace('/(public)/login');
    }
  }, [webLogin.isError]);

  return (
    <Screen>
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={COLORS.primary.DEFAULT} />
        <StyledText variant="body-md" className="mt-4 text-neutral-500">
          카카오 로그인 처리 중...
        </StyledText>
      </View>
    </Screen>
  );
}
