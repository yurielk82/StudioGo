import { View, FlatList, ActivityIndicator } from 'react-native';
import { Megaphone } from 'lucide-react-native';
import { Screen, StyledText, GlassCard, Badge, COLORS } from '@/design-system';
import { useAnnouncements } from '@/hooks/useAdmin';

const TYPE_LABEL: Record<string, string> = {
  BANNER: '배너',
  NOTICE: '공지',
  POPUP: '팝업',
};

export default function AnnouncementsScreen() {
  const { data, isLoading } = useAnnouncements();

  return (
    <Screen>
      <StyledText variant="heading-lg" className="mb-4">
        공지사항
      </StyledText>

      {isLoading ? (
        <ActivityIndicator size="large" color={COLORS.primary.DEFAULT} />
      ) : (
        <FlatList
          data={data ?? []}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <GlassCard className="p-4 mb-2">
              <View className="flex-row justify-between items-start mb-2">
                <View className="flex-row items-center flex-1">
                  <Megaphone size={16} color={COLORS.primary.DEFAULT} />
                  <StyledText variant="body-lg" className="ml-2 font-medium flex-1" numberOfLines={1}>
                    {item.title}
                  </StyledText>
                </View>
                <View className="flex-row gap-1">
                  <Badge variant="neutral">{TYPE_LABEL[item.type] ?? item.type}</Badge>
                  <Badge variant={item.isPublished ? 'success' : 'warning'}>
                    {item.isPublished ? '게시' : '미게시'}
                  </Badge>
                </View>
              </View>
              <StyledText variant="body-sm" className="text-neutral-500" numberOfLines={2}>
                {item.content}
              </StyledText>
            </GlassCard>
          )}
          ListEmptyComponent={
            <StyledText variant="body-md" className="text-neutral-400 text-center py-8">
              공지사항이 없습니다.
            </StyledText>
          }
        />
      )}
    </Screen>
  );
}
