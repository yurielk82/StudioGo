// ── 정산 계산기 ──────────────────────────────────
// 순수 계산 — DB/프레임워크 의존 없음.

interface SettlementInput {
  baseAmount: number;
  services: Array<{
    unitPrice: number;
    quantity: number;
  }>;
  penaltyAmount?: number;
}

export interface SettlementResult {
  amount: number;
  serviceAmount: number;
  penaltyAmount: number;
  totalAmount: number;
}

export function calculateSettlement(input: SettlementInput): SettlementResult {
  const serviceAmount = input.services.reduce(
    (sum, s) => sum + s.unitPrice * s.quantity,
    0,
  );
  const penaltyAmount = input.penaltyAmount ?? 0;
  const totalAmount = input.baseAmount + serviceAmount + penaltyAmount;

  return {
    amount: input.baseAmount,
    serviceAmount,
    penaltyAmount,
    totalAmount,
  };
}
