'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { CalendarCheck, Activity, Bell, Wallet, ArrowRight } from 'lucide-react';

const FEATURES = [
  {
    icon: CalendarCheck,
    title: '간편 예약',
    description: '캘린더에서 빈 슬롯을 확인하고, 3분 만에 예약을 완료하세요.',
  },
  {
    icon: Activity,
    title: '실시간 관리',
    description: '체크인부터 출고까지, 스튜디오 운영 현황을 한눈에 추적합니다.',
  },
  {
    icon: Bell,
    title: '스마트 알림',
    description: '카카오 알림톡으로 예약 변경, 일정 리마인더를 즉시 전달합니다.',
  },
  {
    icon: Wallet,
    title: '투명한 정산',
    description: '방송 실적 기반 자동 정산, 티어별 혜택으로 보상을 받으세요.',
  },
] as const;

const STEPS = [
  { step: '01', title: '스튜디오 선택', description: '원하는 장소와 장비를 고르세요' },
  { step: '02', title: '시간 예약', description: '빈 슬롯에서 원하는 시간을 선택하세요' },
  { step: '03', title: '방송 시작', description: '체크인 후 바로 라이브커머스를 시작하세요' },
] as const;

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function LandingPage() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="from-primary-500 via-primary-400 to-primary-300 relative flex min-h-screen items-center overflow-hidden bg-gradient-to-br pt-16">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8">
          <motion.div
            className="flex flex-col justify-center"
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl leading-tight font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              라이브커머스 스튜디오,
              <br />
              간편하게 예약하세요
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-white/80 sm:text-xl">
              의류 창고 기반 전문 촬영 스튜디오.
              <br />
              예약부터 출고까지 한 번에.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/login"
                className="bg-kakao text-kakao-text hover:bg-kakao-active inline-flex items-center justify-center gap-2 rounded-xl px-8 py-3.5 text-base font-semibold transition-colors"
              >
                카카오로 시작하기
              </Link>
              <a
                href="#features"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-8 py-3.5 text-base font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
              >
                서비스 둘러보기
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </motion.div>

          <motion.div
            className="flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="glass-card flex h-[400px] w-full max-w-md items-center justify-center p-8 lg:h-[460px]">
              <div className="space-y-4 text-center">
                <div className="bg-primary-500 mx-auto flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-bold text-white">
                  SG
                </div>
                <p className="text-foreground text-lg font-semibold">대시보드 미리보기</p>
                <div className="space-y-2">
                  {['다음 예약: 오후 2:00 ~ 4:00', '이번 달 방송 12회', '등급: GOLD'].map(
                    (text) => (
                      <div
                        key={text}
                        className="bg-muted/80 text-foreground rounded-lg px-4 py-2.5 text-sm"
                      >
                        {text}
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* 배경 장식 */}
        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="bg-secondary-500/20 absolute -top-20 -right-20 h-80 w-80 rounded-full blur-3xl" />
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold sm:text-4xl">
              스튜디오 운영, <span className="text-primary">더 스마트하게</span>
            </h2>
            <p className="text-muted-foreground mt-4 text-lg">
              예약부터 정산까지, 라이브커머스에 필요한 모든 기능을 제공합니다.
            </p>
          </motion.div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={feature.title}
                className="glass-card p-6"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-xl">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="bg-muted/50 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-3xl font-bold sm:text-4xl">
              <span className="text-primary">3단계</span>로 시작하세요
            </h2>
          </motion.div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.step}
                className="relative text-center"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                transition={{ delay: i * 0.15 }}
              >
                <div className="bg-primary text-primary-foreground mx-auto flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold">
                  {step.step}
                </div>
                <h3 className="mt-4 text-xl font-semibold">{step.title}</h3>
                <p className="text-muted-foreground mt-2 text-sm">{step.description}</p>
                {i < STEPS.length - 1 && (
                  <div className="absolute top-8 right-0 hidden w-full translate-x-1/2 md:block">
                    <ArrowRight className="text-muted-foreground/40 mx-auto h-5 w-5" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-3xl font-bold sm:text-4xl">지금 바로 시작하세요</h2>
            <p className="text-muted-foreground mt-4 text-lg">
              카카오 계정으로 간편하게 가입하고, 스튜디오를 예약해 보세요.
            </p>
            <Link
              href="/login"
              className="bg-kakao text-kakao-text hover:bg-kakao-active mt-8 inline-flex items-center justify-center gap-2 rounded-xl px-10 py-4 text-lg font-semibold transition-colors"
            >
              카카오로 시작하기
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}
