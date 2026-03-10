'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSignup } from '@/hooks/useAuth';
import { SignupRequestSchema, type SignupRequest } from '@contracts/schemas/auth';
import { Loader2 } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const signup = useSignup();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupRequest>({
    resolver: zodResolver(SignupRequestSchema),
  });

  const onSubmit = (data: SignupRequest) => {
    signup.mutate(data, {
      onSuccess: () => {
        router.replace('/pending');
      },
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold">추가 정보 입력</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            서비스 이용을 위해 아래 정보를 입력해 주세요.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium">
              이름
            </label>
            <input
              id="name"
              type="text"
              {...register('name')}
              className="border-input bg-background focus:border-primary focus:ring-primary w-full rounded-lg border px-4 py-2.5 text-sm focus:ring-1 focus:outline-none"
              placeholder="홍길동"
            />
            {errors.name && <p className="text-destructive mt-1 text-xs">{errors.name.message}</p>}
          </div>

          <div>
            <label htmlFor="nickname" className="mb-1 block text-sm font-medium">
              닉네임
            </label>
            <input
              id="nickname"
              type="text"
              {...register('nickname')}
              className="border-input bg-background focus:border-primary focus:ring-primary w-full rounded-lg border px-4 py-2.5 text-sm focus:ring-1 focus:outline-none"
              placeholder="방송에서 사용할 닉네임"
            />
            {errors.nickname && (
              <p className="text-destructive mt-1 text-xs">{errors.nickname.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="phone" className="mb-1 block text-sm font-medium">
              전화번호
            </label>
            <input
              id="phone"
              type="tel"
              {...register('phone')}
              className="border-input bg-background focus:border-primary focus:ring-primary w-full rounded-lg border px-4 py-2.5 text-sm focus:ring-1 focus:outline-none"
              placeholder="01012345678"
            />
            {errors.phone && (
              <p className="text-destructive mt-1 text-xs">{errors.phone.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={signup.isPending}
            className="bg-primary text-primary-foreground hover:bg-primary/90 flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-colors disabled:opacity-50"
          >
            {signup.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : '가입 신청'}
          </button>

          {signup.isError && (
            <p className="text-destructive text-center text-sm">
              가입 처리 중 오류가 발생했습니다. 다시 시도해 주세요.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
