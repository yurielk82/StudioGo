import { View, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { Search, User } from 'lucide-react-native';
import { Screen, StyledText, GlassCard, Badge, Input, COLORS } from '@/design-system';
import { useMembers } from '@/hooks/useOperator';

const TIER_VARIANT: Record<string, 'primary' | 'secondary' | 'warning' | 'neutral'> = {
  BRONZE: 'neutral',
  SILVER: 'neutral',
  GOLD: 'warning',
  PLATINUM: 'secondary',
  DIAMOND: 'primary',
};

export default function MembersScreen() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>('APPROVED');
  const { data, isLoading } = useMembers({ status: statusFilter, search: search || undefined });

  const statuses = [undefined, 'APPROVED', 'PENDING', 'SUSPENDED'] as const;
  const labels = ['전체', '활성', '대기', '정지'];

  return (
    <Screen centered>
      <StyledText variant="heading-lg" className="mb-4">
        회원 관리
      </StyledText>

      <Input
        placeholder="이름, 닉네임, 전화번호 검색"
        value={search}
        onChangeText={setSearch}
        icon={<Search size={18} color={COLORS.neutral[400]} />}
        className="mb-4"
      />

      <View className="mb-4 flex-row">
        {statuses.map((s, i) => (
          <Pressable
            key={labels[i]}
            onPress={() => setStatusFilter(s)}
            className={`mr-2 rounded-chip px-3 py-1.5 ${statusFilter === s ? 'bg-primary' : 'bg-neutral-100'}`}
          >
            <StyledText
              variant="label-md"
              className={statusFilter === s ? 'text-white' : 'text-neutral-600'}
            >
              {labels[i]}
            </StyledText>
          </Pressable>
        ))}
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={COLORS.primary.DEFAULT} />
      ) : (
        <FlatList
          data={data?.items ?? []}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <GlassCard className="mb-2 p-4">
              <View className="flex-row items-center">
                <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-primary-50">
                  <User size={18} color={COLORS.primary.DEFAULT} />
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center gap-2">
                    <StyledText variant="body-lg" className="font-medium">
                      {item.nickname}
                    </StyledText>
                    <Badge variant={TIER_VARIANT[item.tier] ?? 'neutral'}>{item.tier}</Badge>
                  </View>
                  <StyledText variant="body-sm" className="text-neutral-500">
                    {item.name} · {item.phone} · 방송 {item.totalBroadcasts}회
                  </StyledText>
                </View>
              </View>
            </GlassCard>
          )}
          ListEmptyComponent={
            <StyledText variant="body-md" className="py-8 text-center text-neutral-400">
              검색 결과가 없습니다.
            </StyledText>
          }
        />
      )}
    </Screen>
  );
}
