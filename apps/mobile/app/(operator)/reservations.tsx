import { View, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { Check } from 'lucide-react-native';
import { Screen, StyledText, GlassCard, Badge, Button, Input, COLORS } from '@/design-system';
import { useMyReservations } from '@/hooks/useReservation';
import { useApproveReservation, useRejectReservation, useBatchApprove } from '@/hooks/useOperator';

const STATUS_LABEL: Record<string, string> = {
  PENDING: '대기',
  APPROVED: '승인',
  REJECTED: '거절',
  CANCELLED: '취소',
  COMPLETED: '완료',
  NO_SHOW: '노쇼',
};

const STATUS_VARIANT: Record<string, 'warning' | 'success' | 'error' | 'neutral' | 'primary'> = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'error',
  CANCELLED: 'neutral',
  COMPLETED: 'primary',
  NO_SHOW: 'error',
};

export default function OperatorReservationsScreen() {
  const [filter, setFilter] = useState<string | undefined>('PENDING');
  const { data, isLoading } = useMyReservations({ status: filter });
  const approve = useApproveReservation();
  const reject = useRejectReservation();
  const batchApprove = useBatchApprove();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleBatchApprove() {
    batchApprove.mutate([...selectedIds], {
      onSuccess: () => setSelectedIds(new Set()),
    });
  }

  function handleReject() {
    if (!rejectingId || !rejectReason.trim()) return;
    reject.mutate(
      { id: rejectingId, reason: rejectReason },
      {
        onSuccess: () => {
          setRejectingId(null);
          setRejectReason('');
        },
      },
    );
  }

  const filters = ['PENDING', 'APPROVED', 'COMPLETED', undefined] as const;
  const filterLabels = ['대기', '승인', '완료', '전체'];

  return (
    <Screen centered>
      <StyledText variant="heading-lg" className="mb-4">
        예약 관리
      </StyledText>

      {/* 필터 */}
      <View className="mb-4 flex-row">
        {filters.map((f, i) => (
          <Pressable
            key={filterLabels[i]}
            onPress={() => setFilter(f)}
            className={`mr-2 rounded-chip px-3 py-1.5 ${filter === f ? 'bg-primary' : 'bg-neutral-100'}`}
          >
            <StyledText
              variant="label-md"
              className={filter === f ? 'text-white' : 'text-neutral-600'}
            >
              {filterLabels[i]}
            </StyledText>
          </Pressable>
        ))}
      </View>

      {/* 일괄 승인 */}
      {filter === 'PENDING' && selectedIds.size > 0 && (
        <Button
          onPress={handleBatchApprove}
          loading={batchApprove.isPending}
          fullWidth
          className="mb-4"
        >
          {selectedIds.size}건 일괄 승인
        </Button>
      )}

      {/* 거절 사유 모달 */}
      {rejectingId && (
        <GlassCard className="mb-4 p-4">
          <StyledText variant="heading-sm" className="mb-2">
            거절 사유 입력
          </StyledText>
          <Input
            placeholder="거절 사유를 입력하세요"
            value={rejectReason}
            onChangeText={setRejectReason}
            className="mb-3"
          />
          <View className="flex-row gap-2">
            <Button variant="ghost" onPress={() => setRejectingId(null)} className="flex-1">
              취소
            </Button>
            <Button
              variant="danger"
              onPress={handleReject}
              loading={reject.isPending}
              disabled={!rejectReason.trim()}
              className="flex-1"
            >
              거절
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
          renderItem={({ item }) => (
            <GlassCard className="mb-2 p-4">
              <Pressable
                onPress={() => filter === 'PENDING' && toggleSelect(item.id)}
                className="flex-row items-start"
              >
                {filter === 'PENDING' && (
                  <View
                    className={`mr-3 mt-0.5 h-5 w-5 items-center justify-center rounded border-2 ${
                      selectedIds.has(item.id) ? 'border-primary bg-primary' : 'border-neutral-300'
                    }`}
                  >
                    {selectedIds.has(item.id) && <Check size={12} color={COLORS.white} />}
                  </View>
                )}
                <View className="flex-1">
                  <View className="mb-1 flex-row justify-between">
                    <StyledText variant="body-lg" className="font-medium">
                      {item.userName ?? item.userNickname}
                    </StyledText>
                    <Badge variant={STATUS_VARIANT[item.status] ?? 'neutral'}>
                      {STATUS_LABEL[item.status] ?? item.status}
                    </Badge>
                  </View>
                  <StyledText variant="body-sm" className="text-neutral-500">
                    {item.studioName} · {item.date} {item.startTime}-{item.endTime}
                  </StyledText>
                </View>
              </Pressable>

              {filter === 'PENDING' && !selectedIds.has(item.id) && (
                <View className="mt-3 flex-row gap-2">
                  <Button size="sm" onPress={() => approve.mutate(item.id)} className="flex-1">
                    승인
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onPress={() => setRejectingId(item.id)}
                    className="flex-1"
                  >
                    거절
                  </Button>
                </View>
              )}
            </GlassCard>
          )}
          ListEmptyComponent={
            <StyledText variant="body-md" className="py-8 text-center text-neutral-400">
              해당 상태의 예약이 없습니다.
            </StyledText>
          }
        />
      )}
    </Screen>
  );
}
