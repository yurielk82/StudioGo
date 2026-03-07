import { View, FlatList, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { Screen, StyledText, GlassCard, Button, Input, COLORS } from '@/design-system';
import { useOperationSettings, useUpdateSetting } from '@/hooks/useAdmin';

/**
 * 운영 설정 — key-value 설정 편집
 */
export default function SettingsScreen() {
  const { data, isLoading } = useOperationSettings();
  const update = useUpdateSetting();
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  function startEdit(key: string, currentValue: string) {
    setEditingKey(key);
    setEditValue(currentValue);
  }

  function handleSave() {
    if (!editingKey) return;
    update.mutate(
      { key: editingKey, value: editValue },
      { onSuccess: () => setEditingKey(null) },
    );
  }

  if (isLoading) {
    return (
      <Screen>
        <ActivityIndicator size="large" color={COLORS.primary.DEFAULT} className="mt-12" />
      </Screen>
    );
  }

  return (
    <Screen>
      <StyledText variant="heading-lg" className="mb-4">
        운영 설정
      </StyledText>

      <FlatList
        data={data ?? []}
        keyExtractor={(item) => item.key}
        renderItem={({ item }) => (
          <GlassCard className="p-4 mb-2">
            <StyledText variant="label-md" className="text-neutral-500 mb-1">
              {item.key}
            </StyledText>
            {item.description && (
              <StyledText variant="caption" className="text-neutral-400 mb-2">
                {item.description}
              </StyledText>
            )}

            {editingKey === item.key ? (
              <View>
                <Input
                  value={editValue}
                  onChangeText={setEditValue}
                  className="mb-2"
                />
                <View className="flex-row gap-2">
                  <Button variant="ghost" size="sm" onPress={() => setEditingKey(null)} className="flex-1">
                    취소
                  </Button>
                  <Button size="sm" onPress={handleSave} loading={update.isPending} className="flex-1">
                    저장
                  </Button>
                </View>
              </View>
            ) : (
              <View className="flex-row items-center justify-between">
                <StyledText variant="body-lg" className="font-medium flex-1">
                  {item.value}
                </StyledText>
                <Button variant="ghost" size="sm" onPress={() => startEdit(item.key, item.value)}>
                  수정
                </Button>
              </View>
            )}
          </GlassCard>
        )}
      />
    </Screen>
  );
}
