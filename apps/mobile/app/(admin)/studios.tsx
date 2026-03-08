import { View, FlatList, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { Building2, Plus } from 'lucide-react-native';
import { Screen, StyledText, GlassCard, Button, Input, Badge, COLORS } from '@/design-system';
import { useStudios, useCreateStudio } from '@/hooks/useAdmin';

export default function StudiosScreen() {
  const { data, isLoading } = useStudios();
  const create = useCreateStudio();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [capacity, setCapacity] = useState('');

  function handleCreate() {
    if (!name.trim() || !capacity) return;
    create.mutate(
      { name, capacity: Number(capacity) },
      {
        onSuccess: () => {
          setShowForm(false);
          setName('');
          setCapacity('');
        },
      },
    );
  }

  return (
    <Screen>
      <View className="mb-4 flex-row items-center justify-between">
        <StyledText variant="heading-lg">스튜디오 관리</StyledText>
        <Button
          size="sm"
          icon={<Plus size={16} color={COLORS.white} />}
          onPress={() => setShowForm(true)}
        >
          추가
        </Button>
      </View>

      {showForm && (
        <GlassCard className="mb-4 p-4">
          <Input label="이름" value={name} onChangeText={setName} className="mb-3" />
          <Input
            label="수용 인원"
            value={capacity}
            onChangeText={setCapacity}
            keyboardType="number-pad"
            className="mb-3"
          />
          <View className="flex-row gap-2">
            <Button variant="ghost" onPress={() => setShowForm(false)} className="flex-1">
              취소
            </Button>
            <Button onPress={handleCreate} loading={create.isPending} className="flex-1">
              생성
            </Button>
          </View>
        </GlassCard>
      )}

      {isLoading ? (
        <ActivityIndicator size="large" color={COLORS.primary.DEFAULT} />
      ) : (
        <FlatList
          data={data ?? []}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <GlassCard className="mb-2 p-4">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <Building2 size={18} color={COLORS.primary.DEFAULT} />
                  <StyledText variant="body-lg" className="ml-2 font-medium">
                    {item.name}
                  </StyledText>
                </View>
                <Badge variant={item.isActive ? 'success' : 'neutral'}>
                  {item.isActive ? '활성' : '비활성'}
                </Badge>
              </View>
              <StyledText variant="body-sm" className="mt-1 text-neutral-500">
                수용 인원: {item.capacity}명
              </StyledText>
            </GlassCard>
          )}
        />
      )}
    </Screen>
  );
}
