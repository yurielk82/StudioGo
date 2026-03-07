import { Screen, StyledText } from '@/design-system';

/**
 * 권한 관리 — 운영자 권한 설정
 */
export default function PermissionsScreen() {
  return (
    <Screen>
      <StyledText variant="heading-lg" className="mb-4">
        권한 관리
      </StyledText>
      <StyledText variant="body-md" className="text-neutral-500">
        운영자 권한 설정 화면입니다.
      </StyledText>
    </Screen>
  );
}
