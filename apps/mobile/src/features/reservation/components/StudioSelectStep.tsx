import { View, Pressable, FlatList } from 'react-native';
import { MapPin, Users } from 'lucide-react-native';
import { StyledText, GlassCard, COLORS } from '@/design-system';
import { useReservationWizardStore } from '@/stores/reservation-wizard-store';

interface StudioItem {
  id: string;
  name: string;
  capacity: number;
  address: string;
}

// Phase 9에서 API 연동 — 현재 목업 데이터
const MOCK_STUDIOS: StudioItem[] = [
  { id: '1', name: 'A 스튜디오', capacity: 30, address: '서울 성동구 성수동' },
  { id: '2', name: 'B 스튜디오', capacity: 50, address: '서울 성동구 성수동' },
  { id: '3', name: 'C 스튜디오', capacity: 20, address: '서울 강남구 역삼동' },
];

export function StudioSelectStep() {
  const { studioId, setStudio, nextStep } = useReservationWizardStore();

  function handleSelect(studio: StudioItem) {
    setStudio(studio.id, studio.name);
    nextStep();
  }

  return (
    <View>
      <StyledText variant="heading-md" className="mb-1">
        스튜디오 선택
      </StyledText>
      <StyledText variant="body-sm" className="text-neutral-500 mb-4">
        방송할 스튜디오를 선택하세요.
      </StyledText>

      <FlatList
        data={MOCK_STUDIOS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable onPress={() => handleSelect(item)}>
            <GlassCard
              className={`p-4 mb-3 ${
                studioId === item.id ? 'border-2 border-primary' : ''
              }`}
            >
              <StyledText variant="heading-sm" className="mb-1">
                {item.name}
              </StyledText>
              <View className="flex-row items-center mb-1">
                <MapPin size={14} color={COLORS.neutral[500]} />
                <StyledText variant="body-sm" className="text-neutral-500 ml-1">
                  {item.address}
                </StyledText>
              </View>
              <View className="flex-row items-center">
                <Users size={14} color={COLORS.neutral[500]} />
                <StyledText variant="body-sm" className="text-neutral-500 ml-1">
                  수용 {item.capacity}명
                </StyledText>
              </View>
            </GlassCard>
          </Pressable>
        )}
        scrollEnabled={false}
      />
    </View>
  );
}
