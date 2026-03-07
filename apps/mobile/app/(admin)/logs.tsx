import { View, FlatList, ActivityIndicator } from 'react-native';
import { FileText } from 'lucide-react-native';
import { Screen, StyledText, GlassCard, COLORS } from '@/design-system';
import { useSystemLogs } from '@/hooks/useAdmin';

export default function SystemLogsScreen() {
  const { data, isLoading } = useSystemLogs();

  return (
    <Screen>
      <StyledText variant="heading-lg" className="mb-4">
        시스템 로그
      </StyledText>

      {isLoading ? (
        <ActivityIndicator size="large" color={COLORS.primary.DEFAULT} />
      ) : (
        <FlatList
          data={data?.items ?? []}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <GlassCard className="p-3 mb-1">
              <View className="flex-row items-start">
                <FileText size={14} color={COLORS.neutral[400]} className="mt-0.5" />
                <View className="flex-1 ml-2">
                  <View className="flex-row justify-between">
                    <StyledText variant="label-md">{item.action}</StyledText>
                    <StyledText variant="caption" className="text-neutral-400">
                      {new Date(item.createdAt).toLocaleString('ko-KR')}
                    </StyledText>
                  </View>
                  <StyledText variant="body-sm" className="text-neutral-500">
                    {item.target}
                  </StyledText>
                </View>
              </View>
            </GlassCard>
          )}
          ListEmptyComponent={
            <StyledText variant="body-md" className="text-neutral-400 text-center py-8">
              로그가 없습니다.
            </StyledText>
          }
        />
      )}
    </Screen>
  );
}
