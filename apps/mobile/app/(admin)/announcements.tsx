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
    <Screen centered>
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
            <GlassCard className="mb-2 p-4">
              <View className="mb-2 flex-row items-start justify-between">
                <View className="flex-1 flex-row items-center">
                  <Megaphone size={16} color={COLORS.primary.DEFAULT} />
                  <StyledText
                    variant="body-lg"
                    className="ml-2 flex-1 font-medium"
                    numberOfLines={1}
                  >
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
            <StyledText variant="body-md" className="py-8 text-center text-neutral-400">
              공지사항이 없습니다.
            </StyledText>
          }
        />
      )}
    </Screen>
  );
}
