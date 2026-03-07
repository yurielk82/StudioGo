import { Redirect } from 'expo-router';

/**
 * (public) 진입점 → 로그인 화면으로 리다이렉트
 */
export default function PublicIndex() {
  return <Redirect href="/(public)/login" />;
}
