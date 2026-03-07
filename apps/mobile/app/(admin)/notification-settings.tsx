import { View, Switch, ActivityIndicator, ScrollView } from 'react-native';
import { Bell, MessageSquare, Smartphone } from 'lucide-react-native';
import { Screen, StyledText, GlassCard, COLORS } from '@/design-system';
import { useNotificationSettings, useUpdateNotificationSetting } from '@/hooks/useNotifications';

const EVENT_TYPE_LABELS: Record<string, string> = {
  MEMBER_REGISTERED: '신규 회원 가입',
  MEMBER_APPROVED: '회원 승인',
  RESERVATION_REQUESTED: '예약 요청',
  RESERVATION_APPROVED: '예약 승인',
  RESERVATION_REJECTED: '예약 거절',
  RESERVATION_CANCELLED_BY_MEMBER: '회원 예약 취소',
  RESERVATION_CANCELLED_BY_OPERATOR: '운영자 예약 취소',
  BROADCAST_REMINDER: '방송 리마인더',
  TIER_UPGRADED: '등급 승급',
  TIER_DOWNGRADED: '등급 하락',
  NO_SHOW: '노쇼 알림',
  DAILY_SUMMARY: '일일 요약',
  WEEKLY_REPORT: '주간 리포트',
};

export default function NotificationSettingsScreen() {
  const { data: settings, isLoading } = useNotificationSettings();
  const updateSetting = useUpdateNotificationSetting();

  if (isLoading) {
    return (
      <Screen>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </Screen>
    );
  }

  return (
    <Screen>
      <StyledText variant="heading-lg" className="mb-1">
        알림 설정
      </StyledText>
      <StyledText variant="body-sm" className="mb-4 text-neutral-500">
        이벤트별 알림 채널을 설정합니다.
      </StyledText>

      {!settings || settings.length === 0 ? (
        <GlassCard className="items-center p-6">
          <Bell size={32} color={COLORS.neutral[400]} />
          <StyledText variant="body-md" className="mt-2 text-neutral-500">
            알림 설정이 없습니다.
          </StyledText>
        </GlassCard>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {settings.map((setting) => (
            <GlassCard key={setting.eventType} className="mb-3 p-4">
              <StyledText variant="body-lg" className="mb-3 font-medium">
                {EVENT_TYPE_LABELS[setting.eventType] ?? setting.eventType}
              </StyledText>

              {/* 전체 활성화 */}
              <View className="mb-2 flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <Bell size={16} color={COLORS.neutral[600]} />
                  <StyledText variant="body-md" className="ml-2">
                    활성화
                  </StyledText>
                </View>
                <Switch
                  value={setting.enabled}
                  onValueChange={(val) =>
                    updateSetting.mutate({
                      eventType: setting.eventType,
                      enabled: val,
                    })
                  }
                  trackColor={{ false: COLORS.neutral[300], true: COLORS.primary }}
                  disabled={updateSetting.isPending}
                />
              </View>

              {/* 푸시 알림 */}
              <View className="mb-2 flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <Smartphone size={16} color={COLORS.neutral[600]} />
                  <StyledText variant="body-md" className="ml-2">
                    푸시 알림
                  </StyledText>
                </View>
                <Switch
                  value={setting.pushEnabled}
                  onValueChange={(val) =>
                    updateSetting.mutate({
                      eventType: setting.eventType,
                      pushEnabled: val,
                    })
                  }
                  trackColor={{ false: COLORS.neutral[300], true: COLORS.primary }}
                  disabled={updateSetting.isPending || !setting.enabled}
                />
              </View>

              {/* 알림톡 */}
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <MessageSquare size={16} color={COLORS.neutral[600]} />
                  <StyledText variant="body-md" className="ml-2">
                    알림톡
                  </StyledText>
                </View>
                <Switch
                  value={setting.alimtalkEnabled}
                  onValueChange={(val) =>
                    updateSetting.mutate({
                      eventType: setting.eventType,
                      alimtalkEnabled: val,
                    })
                  }
                  trackColor={{ false: COLORS.neutral[300], true: COLORS.primary }}
                  disabled={updateSetting.isPending || !setting.enabled}
                />
              </View>

              {setting.templateCode && (
                <StyledText variant="body-xs" className="mt-2 text-neutral-400">
                  템플릿: {setting.templateCode}
                </StyledText>
              )}
            </GlassCard>
          ))}
        </ScrollView>
      )}
    </Screen>
  );
}
