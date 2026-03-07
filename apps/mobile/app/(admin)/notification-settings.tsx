import { Screen, StyledText } from '@/design-system';

/**
 * 알림 설정 — Phase 11에서 구현
 */
export default function NotificationSettingsScreen() {
  return (
    <Screen>
      <StyledText variant="heading-lg" className="mb-4">
        알림 설정
      </StyledText>
      <StyledText variant="body-md" className="text-neutral-500">
        알림 템플릿 및 발송 설정은 Phase 11에서 구현됩니다.
      </StyledText>
    </Screen>
  );
}
