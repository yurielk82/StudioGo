import { View, Pressable, FlatList, ActivityIndicator } from 'react-native';
import { Clock, AlertTriangle } from 'lucide-react-native';
import { StyledText, Button, Badge, COLORS } from '@/design-system';
import { useReservationWizardStore } from '@/stores/reservation-wizard-store';
import { useSlots, useCreateHold } from '@/hooks/useReservation';

export function TimeSelectStep() {
  const { date, studioId, timeSlotId, setTimeSlot, setHold, nextStep, prevStep } =
    useReservationWizardStore();

  const { data: slots, isLoading, error } = useSlots(date, studioId ?? undefined);
  const createHold = useCreateHold();

  async function handleSelectSlot(slotId: string, start: string, end: string) {
    setTimeSlot(slotId, start, end);

    // Hold 생성 (2분 임시 점유)
    try {
      const hold = await createHold.mutateAsync(slotId);
      setHold(hold.holdToken, hold.expiresAt);
      nextStep();
    } catch {
      // Hold 실패 — 이미 다른 사용자가 선택
    }
  }

  if (isLoading) {
    return (
      <View className="items-center py-12">
        <ActivityIndicator size="large" color={COLORS.primary.DEFAULT} />
        <StyledText variant="body-md" className="text-neutral-500 mt-3">
          시간대를 불러오는 중...
        </StyledText>
      </View>
    );
  }

  if (error) {
    return (
      <View className="items-center py-12">
        <AlertTriangle size={32} color={COLORS.error.DEFAULT} />
        <StyledText variant="body-md" className="text-error mt-2">
          시간대 조회에 실패했습니다.
        </StyledText>
        <Button onPress={prevStep} variant="ghost" className="mt-4">
          이전 단계
        </Button>
      </View>
    );
  }

  return (
    <View>
      <StyledText variant="heading-md" className="mb-1">
        시간 선택
      </StyledText>
      <StyledText variant="body-sm" className="text-neutral-500 mb-4">
        {date} 사용 가능한 시간대
      </StyledText>

      <FlatList
        data={slots}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const isAvailable = item.status === 'AVAILABLE';
          const isSelected = timeSlotId === item.id;

          return (
            <Pressable
              onPress={() => isAvailable && handleSelectSlot(item.id, item.startTime, item.endTime)}
              disabled={!isAvailable}
            >
              <View
                className={`flex-row items-center justify-between p-4 mb-2 rounded-button border-2 ${
                  isSelected
                    ? 'border-primary bg-primary-50'
                    : isAvailable
                      ? 'border-neutral-200 bg-white dark:bg-dark-surface'
                      : 'border-neutral-100 bg-neutral-100 opacity-50'
                }`}
              >
                <View className="flex-row items-center">
                  <Clock size={18} color={isAvailable ? COLORS.primary.DEFAULT : COLORS.neutral[400]} />
                  <StyledText variant="body-lg" className="ml-3 font-medium">
                    {item.startTime} - {item.endTime}
                  </StyledText>
                </View>

                <Badge variant={isAvailable ? 'success' : 'neutral'}>
                  {isAvailable ? '예약 가능' : item.status === 'RESERVED' ? '예약됨' : '사용 불가'}
                </Badge>
              </View>
            </Pressable>
          );
        }}
        scrollEnabled={false}
        ListEmptyComponent={
          <StyledText variant="body-md" className="text-neutral-500 text-center py-8">
            선택 가능한 시간대가 없습니다.
          </StyledText>
        }
      />

      {createHold.error && (
        <StyledText variant="body-sm" className="text-error text-center mt-2">
          슬롯 선점에 실패했습니다. 다른 시간을 선택해주세요.
        </StyledText>
      )}

      <View className="mt-4">
        <Button onPress={prevStep} variant="ghost">
          이전 단계
        </Button>
      </View>
    </View>
  );
}
