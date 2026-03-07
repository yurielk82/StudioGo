import { useState } from 'react';
import { View, Pressable, Switch, ActivityIndicator, ScrollView } from 'react-native';
import { Shield, ChevronRight } from 'lucide-react-native';
import { Screen, StyledText, GlassCard, COLORS } from '@/design-system';
import { useOperatorList, useOperatorPermissions, useUpdatePermissions } from '@/hooks/useAdmin';

const PERMISSION_LABELS: Record<string, string> = {
  canApproveReservations: '예약 승인',
  canManageCheckins: '체크인 관리',
  canManageFulfillment: '포장/출고 관리',
  canViewReports: '리포트 조회',
  canManageMembers: '회원 관리',
};

export default function PermissionsScreen() {
  const [selectedOperatorId, setSelectedOperatorId] = useState<string | null>(null);

  const { data: operatorData, isLoading: isLoadingOperators } = useOperatorList();
  const { data: permissions, isLoading: isLoadingPerms } =
    useOperatorPermissions(selectedOperatorId);
  const updatePermissions = useUpdatePermissions();

  const operators = operatorData?.items ?? [];

  function handleToggle(key: string, value: boolean) {
    if (!permissions) return;
    updatePermissions.mutate({
      operatorId: permissions.operatorId,
      permissions: { ...permissions.permissions, [key]: value },
    });
  }

  if (isLoadingOperators) {
    return (
      <Screen>
        <ActivityIndicator size="large" color={COLORS.primary.DEFAULT} />
      </Screen>
    );
  }

  // 운영자 선택 전: 목록 표시
  if (!selectedOperatorId) {
    return (
      <Screen>
        <StyledText variant="heading-lg" className="mb-4">
          권한 관리
        </StyledText>
        <StyledText variant="body-sm" className="mb-4 text-neutral-500">
          권한을 설정할 운영자를 선택하세요.
        </StyledText>

        {operators.length === 0 ? (
          <GlassCard className="items-center p-6">
            <Shield size={32} color={COLORS.neutral[400]} />
            <StyledText variant="body-md" className="mt-2 text-neutral-500">
              등록된 운영자가 없습니다.
            </StyledText>
          </GlassCard>
        ) : (
          operators.map((op) => (
            <Pressable key={op.id} onPress={() => setSelectedOperatorId(op.id)}>
              <GlassCard className="mb-3 flex-row items-center justify-between p-4">
                <View className="flex-1 flex-row items-center">
                  <Shield size={20} color={COLORS.primary.DEFAULT} />
                  <View className="ml-3">
                    <StyledText variant="body-lg" className="font-medium">
                      {op.name}
                    </StyledText>
                    <StyledText variant="body-sm" className="text-neutral-500">
                      {op.nickname}
                    </StyledText>
                  </View>
                </View>
                <ChevronRight size={20} color={COLORS.neutral[400]} />
              </GlassCard>
            </Pressable>
          ))
        )}
      </Screen>
    );
  }

  // 운영자 선택 후: 권한 설정
  const selectedOperator = operators.find((o) => o.id === selectedOperatorId);

  return (
    <Screen>
      <Pressable onPress={() => setSelectedOperatorId(null)}>
        <StyledText variant="body-sm" className="mb-2 text-primary">
          ← 운영자 목록
        </StyledText>
      </Pressable>

      <StyledText variant="heading-lg" className="mb-1">
        {selectedOperator?.name ?? '운영자'} 권한
      </StyledText>
      <StyledText variant="body-sm" className="mb-4 text-neutral-500">
        각 권한을 활성화/비활성화할 수 있습니다.
      </StyledText>

      {isLoadingPerms ? (
        <ActivityIndicator size="large" color={COLORS.primary.DEFAULT} />
      ) : permissions ? (
        <ScrollView>
          {Object.entries(PERMISSION_LABELS).map(([key, label]) => (
            <GlassCard key={key} className="mb-3 flex-row items-center justify-between p-4">
              <StyledText variant="body-lg">{label}</StyledText>
              <Switch
                value={permissions.permissions[key as keyof typeof permissions.permissions]}
                onValueChange={(val) => handleToggle(key, val)}
                trackColor={{ false: COLORS.neutral[300], true: COLORS.primary.DEFAULT }}
                disabled={updatePermissions.isPending}
              />
            </GlassCard>
          ))}
        </ScrollView>
      ) : (
        <GlassCard className="items-center p-6">
          <StyledText variant="body-md" className="text-neutral-500">
            권한 정보를 불러올 수 없습니다.
          </StyledText>
        </GlassCard>
      )}
    </Screen>
  );
}
