import { View, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { Bell, CheckCheck } from 'lucide-react-native';
import { Screen, StyledText, GlassCard, Button, COLORS } from '@/design-system';
import { useNotifications, useMarkAsRead, useMarkAllAsRead } from '@/hooks/useNotifications';

/**
 * 알림 탭 — 인앱 알림 목록 + 읽음 처리
 */
export default function NotificationsScreen() {
  const { data, isLoading } = useNotifications();
  const markRead = useMarkAsRead();
  const markAllRead = useMarkAllAsRead();

  const unreadCount = data?.items?.filter((n) => !n.isRead).length ?? 0;

  return (
    <Screen>
      <View className="flex-row items-center justify-between mb-4">
        <StyledText variant="heading-lg">알림</StyledText>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onPress={() => markAllRead.mutate()}
            icon={<CheckCheck size={16} color={COLORS.primary.DEFAULT} />}
          >
            전체 읽음
          </Button>
        )}
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={COLORS.primary.DEFAULT} />
        </View>
      ) : (
        <FlatList
          data={data?.items ?? []}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => !item.isRead && markRead.mutate(item.id)}
            >
              <GlassCard
                className={`p-4 mb-2 ${!item.isRead ? 'border-l-4 border-l-primary' : ''}`}
              >
                <View className="flex-row items-start">
                  <View
                    className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${
                      item.isRead ? 'bg-neutral-100' : 'bg-primary-50'
                    }`}
                  >
                    <Bell
                      size={16}
                      color={item.isRead ? COLORS.neutral[400] : COLORS.primary.DEFAULT}
                    />
                  </View>
                  <View className="flex-1">
                    <StyledText
                      variant="body-md"
                      className={`font-medium ${item.isRead ? 'text-neutral-500' : ''}`}
                    >
                      {item.title}
                    </StyledText>
                    <StyledText variant="body-sm" className="text-neutral-500 mt-0.5">
                      {item.body}
                    </StyledText>
                    <StyledText variant="caption" className="text-neutral-400 mt-1">
                      {new Date(item.createdAt).toLocaleString('ko-KR')}
                    </StyledText>
                  </View>
                </View>
              </GlassCard>
            </Pressable>
          )}
          ListEmptyComponent={
            <View className="items-center py-12">
              <Bell size={48} color={COLORS.neutral[300]} />
              <StyledText variant="body-md" className="text-neutral-400 mt-4">
                알림이 없습니다.
              </StyledText>
            </View>
          }
        />
      )}
    </Screen>
  );
}
