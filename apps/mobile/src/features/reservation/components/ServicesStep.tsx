import { View, Pressable, FlatList, ActivityIndicator } from 'react-native';
import { Check, Plus, Minus } from 'lucide-react-native';
import { StyledText, Button, GlassCard, Input, COLORS } from '@/design-system';
import { useReservationWizardStore } from '@/stores/reservation-wizard-store';
import { useServices } from '@/hooks/useServices';

export function ServicesStep() {
  const { services, addService, removeService, updateServiceQuantity, nextStep, prevStep } =
    useReservationWizardStore();
  const { data: serviceList, isLoading } = useServices();

  const activeServices = (serviceList ?? []).filter((s) => s.isActive);

  function handleToggleService(svc: { id: string; name: string }) {
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
      <StyledText variant="body-sm" className="mb-4 text-neutral-500">
        필요한 서비스를 선택하세요 (선택사항)
      </StyledText>

      {isLoading ? (
        <View className="items-center py-8">
          <ActivityIndicator size="large" color={COLORS.primary.DEFAULT} />
        </View>
      ) : activeServices.length === 0 ? (
        <GlassCard className="mb-4 items-center p-6">
          <StyledText variant="body-md" className="text-neutral-500">
            등록된 부가서비스가 없습니다.
          </StyledText>
        </GlassCard>
      ) : (
        <FlatList
          data={activeServices}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const selected = services.find((s) => s.serviceId === item.id);
            const isSelected = !!selected;

            return (
              <Pressable onPress={() => handleToggleService(item)}>
                <GlassCard className={`mb-3 p-4 ${isSelected ? 'border-2 border-primary' : ''}`}>
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1 flex-row items-center">
                      {item.icon ? (
                        <StyledText variant="heading-md" className="mr-3">
                          {item.icon}
                        </StyledText>
                      ) : null}
                      <View className="flex-1">
                        <StyledText variant="body-lg" className="font-medium">
                          {item.name}
                        </StyledText>
                        {item.description ? (
                          <StyledText variant="body-sm" className="text-neutral-500">
                            {item.description}
                          </StyledText>
                        ) : null}
                      </View>
                    </View>

                    <View
                      className={`h-6 w-6 items-center justify-center rounded-full ${
                        isSelected ? 'bg-primary' : 'border-2 border-neutral-300'
                      }`}
                    >
                      {isSelected && <Check size={14} color={COLORS.white} />}
                    </View>
                  </View>

                  {/* 수량 조절 */}
                  {isSelected && item.requiresQuantity && selected && (
                    <View className="ml-10 mt-3 flex-row items-center">
                      <Pressable
                        onPress={() =>
                          updateServiceQuantity(item.id, Math.max(1, selected.quantity - 1))
                        }
                        className="h-8 w-8 items-center justify-center rounded-full bg-neutral-200"
                      >
                        <Minus size={14} color={COLORS.neutral[700]} />
                      </Pressable>
                      <StyledText variant="body-lg" className="mx-4 font-medium">
                        {String(selected.quantity)}
                      </StyledText>
                      <Pressable
                        onPress={() => updateServiceQuantity(item.id, selected.quantity + 1)}
                        className="h-8 w-8 items-center justify-center rounded-full bg-neutral-200"
                      >
                        <Plus size={14} color={COLORS.neutral[700]} />
                      </Pressable>
                    </View>
                  )}

                  {/* 메모 입력 */}
                  {isSelected && item.requiresMemo && (
                    <View className="ml-10 mt-3">
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
      )}

      <View className="mt-4 flex-row gap-3">
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
