import { View, Pressable, FlatList, ActivityIndicator } from 'react-native';
import { Users } from 'lucide-react-native';
import { StyledText, GlassCard, COLORS } from '@/design-system';
import { useReservationWizardStore } from '@/stores/reservation-wizard-store';
import { useStudios } from '@/hooks/useAdmin';

export function StudioSelectStep() {
  const { studioId, setStudio, nextStep } = useReservationWizardStore();
  const { data: studios, isLoading, isError } = useStudios();

  function handleSelect(studio: { id: string; name: string }) {
    setStudio(studio.id, studio.name);
    nextStep();
  }

  if (isLoading) {
    return (
      <View className="items-center py-12">
        <ActivityIndicator size="large" color={COLORS.primary} />
        <StyledText variant="body-sm" className="mt-2 text-neutral-500">
          스튜디오 목록을 불러오는 중...
        </StyledText>
      </View>
    );
  }

  if (isError || !studios) {
    return (
      <GlassCard className="items-center p-6">
        <StyledText variant="body-md" className="text-neutral-500">
          스튜디오 목록을 불러올 수 없습니다.
        </StyledText>
      </GlassCard>
    );
  }

  const activeStudios = studios.filter((s) => s.isActive);

  return (
    <View>
      <StyledText variant="heading-md" className="mb-1">
        스튜디오 선택
      </StyledText>
      <StyledText variant="body-sm" className="mb-4 text-neutral-500">
        방송할 스튜디오를 선택하세요.
      </StyledText>

      {activeStudios.length === 0 ? (
        <GlassCard className="items-center p-6">
          <StyledText variant="body-md" className="text-neutral-500">
            예약 가능한 스튜디오가 없습니다.
          </StyledText>
        </GlassCard>
      ) : (
        <FlatList
          data={activeStudios}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Pressable onPress={() => handleSelect(item)}>
              <GlassCard
                className={`mb-3 p-4 ${studioId === item.id ? 'border-2 border-primary' : ''}`}
              >
                <StyledText variant="heading-sm" className="mb-1">
                  {item.name}
                </StyledText>
                <View className="flex-row items-center">
                  <Users size={14} color={COLORS.neutral[500]} />
                  <StyledText variant="body-sm" className="ml-1 text-neutral-500">
                    수용 {item.capacity}명
                  </StyledText>
                </View>
              </GlassCard>
            </Pressable>
          )}
          scrollEnabled={false}
        />
      )}
    </View>
  );
}
