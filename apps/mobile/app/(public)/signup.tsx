import { ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Screen, StyledText, Button, Input, GlassCard } from '@/design-system';
import { useSignup } from '@/hooks/useAuth';
import { SignupRequestSchema } from '@contracts/schemas/auth';
import type { SignupRequest } from '@contracts/schemas/auth';

/**
 * 회원가입 추가정보 입력
 * 카카오 로그인 후 PENDING 상태일 때 표시
 */
export default function SignupScreen() {
  const signup = useSignup();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupRequest>({
    resolver: zodResolver(SignupRequestSchema),
    defaultValues: {
      name: '',
      nickname: '',
      phone: '',
      bankName: '',
      accountNumber: '',
      accountHolder: '',
    },
  });

  function onSubmit(data: SignupRequest) {
    signup.mutate(data);
  }

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 32 }}
          keyboardShouldPersistTaps="handled"
        >
          <StyledText variant="display-sm" className="mb-2 mt-4">
            회원가입
          </StyledText>
          <StyledText variant="body-md" className="mb-6 text-neutral-500">
            서비스 이용을 위한 추가 정보를 입력해주세요.
          </StyledText>

          <GlassCard className="mb-4 p-5">
            <StyledText variant="heading-sm" className="mb-4">
              기본 정보
            </StyledText>

            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="이름"
                  placeholder="홍길동"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.name?.message}
                  className="mb-3"
                />
              )}
            />

            <Controller
              control={control}
              name="nickname"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="닉네임"
                  placeholder="방송에서 사용할 닉네임"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.nickname?.message}
                  hint="2~20자"
                  className="mb-3"
                />
              )}
            />

            <Controller
              control={control}
              name="phone"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="전화번호"
                  placeholder="01012345678"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.phone?.message}
                  keyboardType="phone-pad"
                  hint="'-' 없이 숫자만 입력"
                />
              )}
            />
          </GlassCard>

          <GlassCard className="mb-6 p-5">
            <StyledText variant="heading-sm" className="mb-1">
              정산 계좌 (선택)
            </StyledText>
            <StyledText variant="caption" className="mb-4 text-neutral-500">
              나중에 설정할 수 있습니다.
            </StyledText>

            <Controller
              control={control}
              name="bankName"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="은행명"
                  placeholder="국민은행"
                  value={value ?? ''}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  className="mb-3"
                />
              )}
            />

            <Controller
              control={control}
              name="accountNumber"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="계좌번호"
                  placeholder="1234567890123"
                  value={value ?? ''}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="number-pad"
                  className="mb-3"
                />
              )}
            />

            <Controller
              control={control}
              name="accountHolder"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="예금주"
                  placeholder="홍길동"
                  value={value ?? ''}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
              )}
            />
          </GlassCard>

          <Button onPress={handleSubmit(onSubmit)} loading={signup.isPending} fullWidth size="lg">
            가입 완료
          </Button>

          {signup.error && (
            <StyledText variant="body-sm" className="mt-3 text-center text-error">
              {signup.error instanceof Error ? signup.error.message : '가입에 실패했습니다.'}
            </StyledText>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
