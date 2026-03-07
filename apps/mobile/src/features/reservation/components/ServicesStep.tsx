import { View, Pressable, FlatList } from 'react-native';
import { Check, Plus, Minus } from 'lucide-react-native';
import { StyledText, Button, GlassCard, Input, COLORS } from '@/design-system';
import { useReservationWizardStore } from '@/stores/reservation-wizard-store';

interface ServiceOption {
  id: string;
  name: string;
  icon: string;
  requiresQuantity: boolean;
  requiresMemo: boolean;
}

// Phase 9에서 API 연동 — 현재 목업 데이터
const MOCK_SERVICES: ServiceOption[] = [
  { id: 's1', name: '택배 포장', icon: '📦', requiresQuantity: true, requiresMemo: false },
  { id: 's2', name: '택배 발송', icon: '🚚', requiresQuantity: true, requiresMemo: false },
  { id: 's3', name: '상품 촬영', icon: '📸', requiresQuantity: false, requiresMemo: false },
  { id: 's4', name: '스타일리스트', icon: '👗', requiresQuantity: false, requiresMemo: true },
  { id: 's5', name: '기타 요청', icon: '📝', requiresQuantity: false, requiresMemo: true },
];

export function ServicesStep() {
  const { services, addService, removeService, updateServiceQuantity, nextStep, prevStep } =
    useReservationWizardStore();

  function handleToggleService(svc: ServiceOption) {
    const existing = services.find((s) => s.serviceId === svc.id);
    if (existing) {
      removeService(svc.id);
    } else {
      addService({
        serviceId: svc.id,
        serviceName: svc.name,
        quantity: 1,
        memo: '',
      });
    }
  }

  return (
    <View>
      <StyledText variant="heading-md" className="mb-1">
        부가서비스 선택
      </StyledText>
      <StyledText variant="body-sm" className="text-neutral-500 mb-4">
        필요한 서비스를 선택하세요 (선택사항)
      </StyledText>

      <FlatList
        data={MOCK_SERVICES}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const selected = services.find((s) => s.serviceId === item.id);
          const isSelected = !!selected;

          return (
            <Pressable onPress={() => handleToggleService(item)}>
              <GlassCard
                className={`p-4 mb-3 ${isSelected ? 'border-2 border-primary' : ''}`}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1">
                    <StyledText variant="heading-md" className="mr-3">
                      {item.icon}
                    </StyledText>
                    <StyledText variant="body-lg" className="font-medium">
                      {item.name}
                    </StyledText>
                  </View>

                  <View
                    className={`w-6 h-6 rounded-full items-center justify-center ${
                      isSelected ? 'bg-primary' : 'border-2 border-neutral-300'
                    }`}
                  >
                    {isSelected && <Check size={14} color="#FFFFFF" />}
                  </View>
                </View>

                {/* 수량 조절 */}
                {isSelected && item.requiresQuantity && selected && (
                  <View className="flex-row items-center mt-3 ml-10">
                    <Pressable
                      onPress={() =>
                        updateServiceQuantity(item.id, Math.max(1, selected.quantity - 1))
                      }
                      className="w-8 h-8 rounded-full bg-neutral-200 items-center justify-center"
                    >
                      <Minus size={14} color={COLORS.neutral[700]} />
                    </Pressable>
                    <StyledText variant="body-lg" className="mx-4 font-medium">
                      {String(selected.quantity)}
                    </StyledText>
                    <Pressable
                      onPress={() => updateServiceQuantity(item.id, selected.quantity + 1)}
                      className="w-8 h-8 rounded-full bg-neutral-200 items-center justify-center"
                    >
                      <Plus size={14} color={COLORS.neutral[700]} />
                    </Pressable>
                  </View>
                )}

                {/* 메모 입력 */}
                {isSelected && item.requiresMemo && (
                  <View className="mt-3 ml-10">
                    <Input
                      placeholder="요청사항을 입력하세요"
                      value={selected?.memo ?? ''}
                      onChangeText={(text) => {
                        if (selected) {
                          addService({ ...selected, memo: text });
                        }
                      }}
                    />
                  </View>
                )}
              </GlassCard>
            </Pressable>
          );
        }}
        scrollEnabled={false}
      />

      <View className="flex-row gap-3 mt-4">
        <Button onPress={prevStep} variant="ghost" className="flex-1">
          이전
        </Button>
        <Button onPress={nextStep} className="flex-1">
          다음
        </Button>
      </View>
    </View>
  );
}
