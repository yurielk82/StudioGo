// ── 슬롯 생성기 ──────────────────────────────────
// 운영시간, 슬롯 단위, 청소 시간 기반으로 타임슬롯 목록을 생성한다.
// 순수 계산 — DB/프레임워크 의존 없음.

interface SlotGeneratorConfig {
  operatingHoursStart: string; // "09:00"
  operatingHoursEnd: string; // "22:00"
  slotDurationMinutes: number;
  cleaningDurationMinutes: number;
}

export interface GeneratedSlot {
  startTime: string; // "09:00"
  endTime: string; // "10:00"
  cleaningEndTime: string; // "10:30"
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return (hours ?? 0) * 60 + (minutes ?? 0);
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function generateSlots(config: SlotGeneratorConfig): GeneratedSlot[] {
  const startMinutes = timeToMinutes(config.operatingHoursStart);
  const endMinutes = timeToMinutes(config.operatingHoursEnd);
  const totalBlock = config.slotDurationMinutes + config.cleaningDurationMinutes;

  const slots: GeneratedSlot[] = [];
  let current = startMinutes;

  while (current + config.slotDurationMinutes <= endMinutes) {
    const slotEnd = current + config.slotDurationMinutes;
    const cleaningEnd = Math.min(slotEnd + config.cleaningDurationMinutes, endMinutes);

    slots.push({
      startTime: minutesToTime(current),
      endTime: minutesToTime(slotEnd),
      cleaningEndTime: minutesToTime(cleaningEnd),
    });

    current += totalBlock;
  }

  return slots;
}
