import { View, Pressable } from 'react-native';
import { useState } from 'react';
import { QrCode, Hash, Hand } from 'lucide-react-native';
import { Screen, StyledText, GlassCard, Button, Input, COLORS } from '@/design-system';
import { useCheckin, useCheckout } from '@/hooks/useOperator';

type CheckinMethod = 'QR' | 'PIN' | 'MANUAL';

/**
 * 체크인/체크아웃 화면 — QR/PIN/수동 3종
 */
export default function CheckinScreen() {
  const [method, setMethod] = useState<CheckinMethod>('MANUAL');
  const [reservationId, setReservationId] = useState('');
  const checkin = useCheckin();
  const checkout = useCheckout();

  function handleCheckin() {
    if (!reservationId.trim()) return;
    checkin.mutate(
      { reservationId, method },
      { onSuccess: () => setReservationId('') },
    );
  }

  function handleCheckout() {
    if (!reservationId.trim()) return;
    checkout.mutate(reservationId, {
      onSuccess: () => setReservationId(''),
    });
  }

  return (
    <Screen>
      <StyledText variant="heading-lg" className="mb-4">
        체크인/체크아웃
      </StyledText>

      {/* 방법 선택 */}
      <View className="flex-row gap-3 mb-6">
        {([
          { key: 'QR' as const, icon: QrCode, label: 'QR 스캔' },
          { key: 'PIN' as const, icon: Hash, label: 'PIN 입력' },
          { key: 'MANUAL' as const, icon: Hand, label: '수동' },
        ]).map(({ key, icon: Icon, label }) => (
          <Pressable key={key} onPress={() => setMethod(key)} className="flex-1">
            <GlassCard
              className={`p-4 items-center ${method === key ? 'border-2 border-primary' : ''}`}
            >
              <Icon size={24} color={method === key ? COLORS.primary.DEFAULT : COLORS.neutral[500]} />
              <StyledText
                variant="label-md"
                className={`mt-1 ${method === key ? 'text-primary' : 'text-neutral-500'}`}
              >
                {label}
              </StyledText>
            </GlassCard>
          </Pressable>
        ))}
      </View>

      {/* 입력 */}
      <GlassCard className="p-5 mb-6">
        {method === 'QR' ? (
          <View className="items-center py-12">
            <QrCode size={64} color={COLORS.neutral[300]} />
            <StyledText variant="body-md" className="text-neutral-500 mt-4">
              QR 코드 스캐너는 카메라 권한이 필요합니다.
            </StyledText>
          </View>
        ) : (
          <Input
            label={method === 'PIN' ? 'PIN 번호' : '예약번호 / 예약 ID'}
            placeholder={method === 'PIN' ? '4자리 PIN' : 'SG-20260307-001'}
            value={reservationId}
            onChangeText={setReservationId}
            keyboardType={method === 'PIN' ? 'number-pad' : 'default'}
          />
        )}
      </GlassCard>

      {/* 성공/에러 메시지 */}
      {checkin.isSuccess && (
        <StyledText variant="body-md" className="text-success text-center mb-3">
          체크인 완료!
        </StyledText>
      )}
      {checkin.error && (
        <StyledText variant="body-md" className="text-error text-center mb-3">
          체크인 실패. 예약 정보를 확인하세요.
        </StyledText>
      )}
      {checkout.isSuccess && (
        <StyledText variant="body-md" className="text-success text-center mb-3">
          체크아웃 완료!
        </StyledText>
      )}

      <View className="flex-row gap-3">
        <Button
          onPress={handleCheckin}
          loading={checkin.isPending}
          disabled={!reservationId.trim()}
          className="flex-1"
          size="lg"
        >
          체크인
        </Button>
        <Button
          onPress={handleCheckout}
          loading={checkout.isPending}
          disabled={!reservationId.trim()}
          variant="secondary"
          className="flex-1"
          size="lg"
        >
          체크아웃
        </Button>
      </View>
    </Screen>
  );
}
