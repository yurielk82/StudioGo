import { View, Pressable } from 'react-native';
import { useState, useRef, useCallback, useEffect } from 'react';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { QrCode, Hash, Hand } from 'lucide-react-native';
import { Screen, StyledText, GlassCard, Button, Input, COLORS } from '@/design-system';
import { useCheckin, useCheckout } from '@/hooks/useOperator';

type CheckinMethod = 'QR' | 'PIN' | 'MANUAL';

const SCAN_COOLDOWN_MS = 3000;

/**
 * 체크인/체크아웃 화면 — QR/PIN/수동 3종
 */
export default function CheckinScreen() {
  const [method, setMethod] = useState<CheckinMethod>('MANUAL');
  const [reservationId, setReservationId] = useState('');
  const [permission, requestPermission] = useCameraPermissions();
  const lastScanRef = useRef(0);
  const checkin = useCheckin();
  const checkout = useCheckout();
  const checkinRef = useRef(checkin);
  useEffect(() => {
    checkinRef.current = checkin;
  });

  function handleCheckin() {
    if (!reservationId.trim()) return;
    checkin.mutate({ reservationId, method }, { onSuccess: () => setReservationId('') });
  }

  function handleCheckout() {
    if (!reservationId.trim()) return;
    checkout.mutate(reservationId, {
      onSuccess: () => setReservationId(''),
    });
  }

  const handleBarcodeScanned = useCallback(({ data }: { data: string }) => {
    const now = Date.now();
    if (now - lastScanRef.current < SCAN_COOLDOWN_MS) return;
    lastScanRef.current = now;

    const trimmed = data.trim();
    if (!trimmed || trimmed.length > 200) return;

    checkinRef.current.mutate(
      { reservationId: trimmed, method: 'QR' },
      { onSuccess: () => setReservationId('') },
    );
  }, []);

  const renderQRSection = () => {
    if (!permission) {
      return (
        <View className="items-center py-12">
          <QrCode size={64} color={COLORS.neutral[300]} />
          <StyledText variant="body-md" className="mt-4 text-neutral-500">
            카메라 권한을 확인 중입니다...
          </StyledText>
        </View>
      );
    }

    if (!permission.granted) {
      return (
        <View className="items-center py-12">
          <QrCode size={64} color={COLORS.neutral[300]} />
          <StyledText variant="body-md" className="mt-4 text-center text-neutral-500">
            QR 스캔을 위해 카메라 권한이 필요합니다.
          </StyledText>
          <Button onPress={requestPermission} className="mt-4" size="md">
            카메라 권한 허용
          </Button>
        </View>
      );
    }

    return (
      <View className="overflow-hidden rounded-xl" style={{ height: 280 }}>
        <CameraView
          style={{ flex: 1 }}
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={handleBarcodeScanned}
        />
        <View className="absolute bottom-3 left-0 right-0 items-center">
          <View className="rounded-full bg-black/60 px-4 py-1.5">
            <StyledText variant="label-md" className="text-white">
              QR 코드를 카메라에 비추세요
            </StyledText>
          </View>
        </View>
      </View>
    );
  };

  return (
    <Screen centered>
      <StyledText variant="heading-lg" className="mb-4">
        체크인/체크아웃
      </StyledText>

      {/* 방법 선택 */}
      <View className="mb-6 flex-row gap-3">
        {[
          { key: 'QR' as const, icon: QrCode, label: 'QR 스캔' },
          { key: 'PIN' as const, icon: Hash, label: 'PIN 입력' },
          { key: 'MANUAL' as const, icon: Hand, label: '수동' },
        ].map(({ key, icon: Icon, label }) => (
          <Pressable key={key} onPress={() => setMethod(key)} className="flex-1">
            <GlassCard
              className={`items-center p-4 ${method === key ? 'border-2 border-primary' : ''}`}
            >
              <Icon
                size={24}
                color={method === key ? COLORS.primary.DEFAULT : COLORS.neutral[500]}
              />
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
      <GlassCard className="mb-6 p-5">
        {method === 'QR' ? (
          renderQRSection()
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
        <StyledText variant="body-md" className="mb-3 text-center text-success">
          체크인 완료!
        </StyledText>
      )}
      {checkin.error && (
        <StyledText variant="body-md" className="mb-3 text-center text-error">
          체크인 실패. 예약 정보를 확인하세요.
        </StyledText>
      )}
      {checkout.isSuccess && (
        <StyledText variant="body-md" className="mb-3 text-center text-success">
          체크아웃 완료!
        </StyledText>
      )}

      {method !== 'QR' && (
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
      )}
    </Screen>
  );
}
