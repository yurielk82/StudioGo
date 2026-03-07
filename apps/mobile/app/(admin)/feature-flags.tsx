import { View, FlatList, Switch, ActivityIndicator } from 'react-native';
import { ToggleLeft } from 'lucide-react-native';
import { Screen, StyledText, GlassCard, COLORS } from '@/design-system';
import { useFeatureFlags, useToggleFeatureFlag } from '@/hooks/useAdmin';

export default function FeatureFlagsScreen() {
  const { data, isLoading } = useFeatureFlags();
  const toggle = useToggleFeatureFlag();

  return (
    <Screen>
      <StyledText variant="heading-lg" className="mb-4">
        기능 플래그
      </StyledText>

      {isLoading ? (
        <ActivityIndicator size="large" color={COLORS.primary.DEFAULT} />
      ) : (
        <FlatList
          data={data ?? []}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <GlassCard className="p-4 mb-2">
              <View className="flex-row items-center justify-between">
                <View className="flex-1 mr-4">
                  <View className="flex-row items-center">
                    <ToggleLeft size={16} color={item.enabled ? COLORS.success : COLORS.neutral[400]} />
                    <StyledText variant="body-lg" className="ml-2 font-medium">
                      {item.key}
                    </StyledText>
                  </View>
                  {item.description && (
                    <StyledText variant="caption" className="text-neutral-400 mt-1">
                      {item.description}
                    </StyledText>
                  )}
                </View>
                <Switch
                  value={item.enabled}
                  onValueChange={(enabled) => toggle.mutate({ id: item.id, enabled })}
                  trackColor={{ false: COLORS.neutral[300], true: COLORS.primary.light }}
                  thumbColor={item.enabled ? COLORS.primary.DEFAULT : COLORS.neutral[50]}
                />
              </View>
            </GlassCard>
          )}
        />
      )}
    </Screen>
  );
}
