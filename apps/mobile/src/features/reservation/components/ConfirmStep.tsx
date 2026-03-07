import { View } from 'react-native';
import { Calendar, Clock, MapPin, Package } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { StyledText, Button, GlassCard, Input, Divider, COLORS } from '@/design-system';
import { useReservationWizardStore } from '@/stores/reservation-wizard-store';
import { useCreateReservation, useCancelHold } from '@/hooks/useReservation';

export function ConfirmStep() {
  const router = useRouter();
  const wizard = useReservationWizardStore();
  const createReservation = useCreateReservation();
  const cancelHold = useCancelHold();

  async function handleConfirm() {
    if (!wizard.studioId || !wizard.timeSlotId || !wizard.date) return;

    try {
      await createReservation.mutateAsync({
        studioId: wizard.studioId,
        timeSlotId: wizard.timeSlotId,
        date: wizard.date,
        holdToken: wizard.holdToken ?? undefined,
        services: wizard.services.map((s) => ({
          serviceId: s.serviceId,
          quantity: s.quantity,
          memo: s.memo || undefined,
        })),
        memo: wizard.memo || undefined,
      });

      wizard.reset();
      router.replace('/(member)');
    } catch {
      // 에러는 UI에 표시
    }
  }

  async function handleCancel() {
    if (wizard.holdToken) {
      await cancelHold.mutateAsync(wizard.holdToken);
    }
    wizard.reset();
    router.back();
  }

  return (
    <View>
      <StyledText variant="heading-md" className="mb-4">
        예약 확인
      </StyledText>

      <GlassCard className="p-5 mb-4">
        {/* 스튜디오 */}
        <View className="flex-row items-center mb-3">
          <MapPin size={18} color={COLORS.primary.DEFAULT} />
          <StyledText variant="body-lg" className="ml-2 font-medium">
            {wizard.studioName}
          </StyledText>
        </View>

        <Divider className="my-3" />

        {/* 날짜 */}
        <View className="flex-row items-center mb-3">
          <Calendar size={18} color={COLORS.primary.DEFAULT} />
          <StyledText variant="body-lg" className="ml-2">
            {wizard.date}
          </StyledText>
        </View>

        {/* 시간 */}
        <View className="flex-row items-center">
          <Clock size={18} color={COLORS.primary.DEFAULT} />
          <StyledText variant="body-lg" className="ml-2">
            {wizard.startTime} - {wizard.endTime}
          </StyledText>
        </View>
      </GlassCard>

      {/* 부가서비스 */}
      {wizard.services.length > 0 && (
        <GlassCard className="p-5 mb-4">
          <View className="flex-row items-center mb-3">
            <Package size={18} color={COLORS.secondary.DEFAULT} />
            <StyledText variant="heading-sm" className="ml-2">
              부가서비스
            </StyledText>
          </View>
          {wizard.services.map((svc) => (
            <View key={svc.serviceId} className="flex-row justify-between mb-2">
              <StyledText variant="body-md">{svc.serviceName}</StyledText>
              <StyledText variant="body-md" className="text-neutral-500">
                {svc.quantity > 1 ? `x${svc.quantity}` : ''}
              </StyledText>
            </View>
          ))}
        </GlassCard>
      )}

      {/* 메모 */}
      <GlassCard className="p-5 mb-6">
        <Input
          label="메모 (선택)"
          placeholder="운영자에게 전달할 사항"
          value={wizard.memo}
          onChangeText={wizard.setMemo}
          multiline
          numberOfLines={3}
        />
      </GlassCard>

      {createReservation.error && (
        <StyledText variant="body-sm" className="text-error text-center mb-3">
          예약에 실패했습니다. 다시 시도해주세요.
        </StyledText>
      )}

      <Button
        onPress={handleConfirm}
        loading={createReservation.isPending}
        fullWidth
        size="lg"
        className="mb-3"
      >
        예약 신청
      </Button>

      <View className="flex-row gap-3">
        <Button onPress={wizard.prevStep} variant="ghost" className="flex-1">
          이전
        </Button>
        <Button onPress={handleCancel} variant="outline" className="flex-1">
          취소
        </Button>
      </View>
    </View>
  );
}
