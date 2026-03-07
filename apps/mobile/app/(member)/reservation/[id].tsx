import { View, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Package,
  AlertTriangle,
  ArrowLeft,
} from 'lucide-react-native';
import {
  Screen,
  StyledText,
  Button,
  GlassCard,
  Badge,
  Divider,
  Input,
  COLORS,
} from '@/design-system';
import { useReservationDetail, useCancelReservation } from '@/hooks/useReservation';

const STATUS_LABEL: Record<string, string> = {
  PENDING: '승인 대기',
  APPROVED: '승인됨',
  REJECTED: '거절됨',
  CANCELLED: '취소됨',
  COMPLETED: '완료',
  NO_SHOW: '노쇼',
};

const STATUS_VARIANT: Record<string, 'primary' | 'success' | 'error' | 'warning' | 'neutral'> = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'error',
  CANCELLED: 'neutral',
  COMPLETED: 'primary',
  NO_SHOW: 'error',
};

/**
 * 예약 상세 화면
 */
export default function ReservationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: reservation, isLoading } = useReservationDetail(id ?? null);
  const cancelMutation = useCancelReservation();
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelForm, setShowCancelForm] = useState(false);

  if (isLoading) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={COLORS.primary.DEFAULT} />
        </View>
      </Screen>
    );
  }

  if (!reservation) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center">
          <AlertTriangle size={48} color={COLORS.error.DEFAULT} />
          <StyledText variant="heading-md" className="mt-4">
            예약을 찾을 수 없습니다
          </StyledText>
          <Button onPress={() => router.back()} variant="ghost" className="mt-4">
            돌아가기
          </Button>
        </View>
      </Screen>
    );
  }

  function handleCancel() {
    if (!id || !cancelReason.trim()) return;
    cancelMutation.mutate(
      { id, reason: cancelReason },
      { onSuccess: () => router.back() },
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        {/* 헤더 */}
        <View className="flex-row items-center mb-4">
          <Button onPress={() => router.back()} variant="ghost" size="sm">
            <ArrowLeft size={20} color={COLORS.neutral[700]} />
          </Button>
          <StyledText variant="heading-lg" className="ml-2 flex-1">
            예약 상세
          </StyledText>
          <Badge variant={STATUS_VARIANT[reservation.status] ?? 'neutral'}>
            {STATUS_LABEL[reservation.status] ?? reservation.status}
          </Badge>
        </View>

        {/* 예약번호 */}
        <StyledText variant="caption" className="text-neutral-500 mb-4">
          {reservation.reservationNumber}
        </StyledText>

        {/* 기본 정보 */}
        <GlassCard className="p-5 mb-4">
          <View className="flex-row items-center mb-3">
            <MapPin size={18} color={COLORS.primary.DEFAULT} />
            <StyledText variant="body-lg" className="ml-2 font-medium">
              {reservation.studioName}
            </StyledText>
          </View>
          <View className="flex-row items-center mb-3">
            <Calendar size={18} color={COLORS.primary.DEFAULT} />
            <StyledText variant="body-lg" className="ml-2">
              {reservation.date}
            </StyledText>
          </View>
          <View className="flex-row items-center">
            <Clock size={18} color={COLORS.primary.DEFAULT} />
            <StyledText variant="body-lg" className="ml-2">
              {reservation.startTime} - {reservation.endTime}
            </StyledText>
          </View>
        </GlassCard>

        {/* 부가서비스 */}
        {reservation.services.length > 0 && (
          <GlassCard className="p-5 mb-4">
            <View className="flex-row items-center mb-3">
              <Package size={18} color={COLORS.secondary.DEFAULT} />
              <StyledText variant="heading-sm" className="ml-2">
                부가서비스
              </StyledText>
            </View>
            {reservation.services.map((svc) => (
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
        {reservation.memo && (
          <GlassCard className="p-5 mb-4">
            <StyledText variant="label-md" className="text-neutral-500 mb-1">
              메모
            </StyledText>
            <StyledText variant="body-md">{reservation.memo}</StyledText>
          </GlassCard>
        )}

        {/* 거절 사유 */}
        {reservation.rejectedReason && (
          <GlassCard className="p-5 mb-4">
            <StyledText variant="label-md" className="text-error mb-1">
              거절 사유
            </StyledText>
            <StyledText variant="body-md">{reservation.rejectedReason}</StyledText>
          </GlassCard>
        )}

        {/* 상태 이력 */}
        <GlassCard className="p-5 mb-4">
          <StyledText variant="heading-sm" className="mb-3">
            상태 이력
          </StyledText>
          {reservation.statusHistory.map((h, i) => (
            <View key={i} className="flex-row items-start mb-2">
              <View className="w-2 h-2 rounded-full bg-primary mt-2 mr-3" />
              <View className="flex-1">
                <StyledText variant="body-sm">
                  {STATUS_LABEL[h.toStatus] ?? h.toStatus}
                </StyledText>
                <StyledText variant="caption" className="text-neutral-400">
                  {new Date(h.changedAt).toLocaleString('ko-KR')}
                </StyledText>
              </View>
            </View>
          ))}
        </GlassCard>

        {/* 취소 */}
        {reservation.canCancel && (
          <>
            <Divider className="my-4" />

            {showCancelForm ? (
              <View>
                <Input
                  label="취소 사유"
                  placeholder="취소 사유를 입력하세요"
                  value={cancelReason}
                  onChangeText={setCancelReason}
                  multiline
                  numberOfLines={3}
                  className="mb-3"
                />
                <View className="flex-row gap-3">
                  <Button
                    onPress={() => setShowCancelForm(false)}
                    variant="ghost"
                    className="flex-1"
                  >
                    돌아가기
                  </Button>
                  <Button
                    onPress={handleCancel}
                    variant="danger"
                    loading={cancelMutation.isPending}
                    disabled={!cancelReason.trim()}
                    className="flex-1"
                  >
                    취소 확인
                  </Button>
                </View>
              </View>
            ) : (
              <Button
                onPress={() => setShowCancelForm(true)}
                variant="outline"
                fullWidth
              >
                예약 취소
              </Button>
            )}
          </>
        )}
      </ScrollView>
    </Screen>
  );
}
