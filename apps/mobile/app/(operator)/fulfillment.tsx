import { View, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { Truck } from 'lucide-react-native';
import { Screen, StyledText, GlassCard, Badge, Button, Input, COLORS } from '@/design-system';
import { useFulfillmentTasks, useUpdateFulfillment } from '@/hooks/useOperator';

const STATUS_FLOW = ['PENDING', 'PACKING', 'READY', 'SHIPPED', 'COMPLETED'] as const;

const STATUS_LABEL: Record<string, string> = {
  PENDING: '대기',
  PACKING: '포장 중',
  READY: '발송 준비',
  SHIPPED: '발송됨',
  COMPLETED: '완료',
};

const STATUS_VARIANT: Record<string, 'warning' | 'primary' | 'success' | 'secondary' | 'neutral'> =
  {
    PENDING: 'warning',
    PACKING: 'primary',
    READY: 'secondary',
    SHIPPED: 'success',
    COMPLETED: 'neutral',
  };

export default function FulfillmentScreen() {
  const [filter, setFilter] = useState<string | undefined>('PENDING');
  const { data, isLoading } = useFulfillmentTasks({ status: filter });
  const update = useUpdateFulfillment();
  const [shippingInfo, setShippingInfo] = useState<{
    id: string;
    courier: string;
    trackingNumber: string;
  } | null>(null);

  function getNextStatus(current: string): string | null {
    const idx = STATUS_FLOW.indexOf(current as (typeof STATUS_FLOW)[number]);
    if (idx < 0 || idx >= STATUS_FLOW.length - 1) return null;
    return STATUS_FLOW[idx + 1] ?? null;
  }

  function handleAdvance(id: string, currentStatus: string) {
    const nextStatus = getNextStatus(currentStatus);
    if (!nextStatus) return;

    if (nextStatus === 'SHIPPED') {
      setShippingInfo({ id, courier: '', trackingNumber: '' });
      return;
    }

    update.mutate({ id, status: nextStatus });
  }

  function handleShip() {
    if (!shippingInfo) return;
    update.mutate(
      {
        id: shippingInfo.id,
        status: 'SHIPPED',
        courier: shippingInfo.courier,
        trackingNumber: shippingInfo.trackingNumber,
      },
      { onSuccess: () => setShippingInfo(null) },
    );
  }

  return (
    <Screen centered>
      <StyledText variant="heading-lg" className="mb-4">
        포장/출고 관리
      </StyledText>

      <View className="mb-4 flex-row flex-wrap gap-1">
        {[undefined, ...STATUS_FLOW.slice(0, 4)].map((s, i) => (
          <Pressable
            key={i}
            onPress={() => setFilter(s)}
            className={`rounded-chip px-3 py-1.5 ${filter === s ? 'bg-primary' : 'bg-neutral-100'}`}
          >
            <StyledText
              variant="label-md"
              className={filter === s ? 'text-white' : 'text-neutral-600'}
            >
              {s ? STATUS_LABEL[s] : '전체'}
            </StyledText>
          </Pressable>
        ))}
      </View>

      {/* 발송 정보 입력 */}
      {shippingInfo && (
        <GlassCard className="mb-4 p-4">
          <StyledText variant="heading-sm" className="mb-3">
            발송 정보
          </StyledText>
          <Input
            label="택배사"
            placeholder="CJ대한통운"
            value={shippingInfo.courier}
            onChangeText={(t) => setShippingInfo({ ...shippingInfo, courier: t })}
            className="mb-3"
          />
          <Input
            label="운송장번호"
            placeholder="1234567890"
            value={shippingInfo.trackingNumber}
            onChangeText={(t) => setShippingInfo({ ...shippingInfo, trackingNumber: t })}
            className="mb-3"
          />
          <View className="flex-row gap-2">
            <Button variant="ghost" onPress={() => setShippingInfo(null)} className="flex-1">
              취소
            </Button>
            <Button onPress={handleShip} loading={update.isPending} className="flex-1">
              발송 처리
            </Button>
          </View>
        </GlassCard>
      )}

      {isLoading ? (
        <ActivityIndicator size="large" color={COLORS.primary.DEFAULT} />
      ) : (
        <FlatList
          data={data?.items ?? []}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const next = getNextStatus(item.status);

            return (
              <GlassCard className="mb-2 p-4">
                <View className="mb-2 flex-row items-start justify-between">
                  <View>
                    <StyledText variant="body-lg" className="font-medium">
                      {item.userName}
                    </StyledText>
                    <StyledText variant="body-sm" className="text-neutral-500">
                      {item.reservationNumber}
                    </StyledText>
                  </View>
                  <Badge variant={STATUS_VARIANT[item.status] ?? 'neutral'}>
                    {STATUS_LABEL[item.status] ?? item.status}
                  </Badge>
                </View>

                {item.courier && (
                  <View className="mt-1 flex-row items-center">
                    <Truck size={14} color={COLORS.neutral[500]} />
                    <StyledText variant="body-sm" className="ml-1 text-neutral-500">
                      {item.courier} {item.trackingNumber}
                    </StyledText>
                  </View>
                )}

                {next && (
                  <Button
                    size="sm"
                    variant="outline"
                    onPress={() => handleAdvance(item.id, item.status)}
                    className="mt-3"
                    fullWidth
                  >
                    {STATUS_LABEL[next]}(으)로 변경
                  </Button>
                )}
              </GlassCard>
            );
          }}
          ListEmptyComponent={
            <StyledText variant="body-md" className="py-8 text-center text-neutral-400">
              작업이 없습니다.
            </StyledText>
          }
        />
      )}
    </Screen>
  );
}
