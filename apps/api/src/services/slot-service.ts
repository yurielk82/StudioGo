import { slotRepository } from '../repositories/slot-repository';
import { settingsRepository } from '../repositories/settings-repository';
import { ApiError } from '../lib/api-error';
import { generateSlots } from '../../../../shared/domain/slot';
import { dateRange } from '../../../../shared/domain/date-time';

export const slotService = {
  /** 특정 날짜의 슬롯 조회 */
  async getSlots(date: string, studioId?: string) {
    return slotRepository.findByDateAndStudio(date, studioId);
  },

  /** 슬롯 hold 생성 (2분) */
  async createHold(timeSlotId: string, userId: string) {
    const slot = await slotRepository.findById(timeSlotId);
    if (!slot || slot.status !== 'AVAILABLE') {
      throw ApiError.conflict('SLOT_NOT_AVAILABLE', '선택한 시간은 사용할 수 없습니다.');
    }

    const holdDuration = await settingsRepository.get('hold_duration_seconds');
    const expiresAt = new Date(Date.now() + holdDuration * 1000);

    const hold = await slotRepository.createHold({
      timeSlotId,
      userId,
      expiresAt,
    });

    if (!hold) {
      throw ApiError.conflict('SLOT_ALREADY_HELD', '다른 사용자가 이미 선택 중입니다.');
    }

    return hold;
  },

  /** hold 해제 */
  async cancelHold(holdToken: string, userId: string) {
    await slotRepository.cancelHold(holdToken, userId);
  },

  /** 만료된 hold 정리 (cron) */
  async expireHolds() {
    return slotRepository.expireHolds();
  },

  /** 슬롯 (재)생성 — ADMIN */
  async generateSlots(studioId: string, startDate: string, endDate: string) {
    const [operatingHours, slotDuration, cleaningDuration] = await Promise.all([
      settingsRepository.get('operating_hours'),
      settingsRepository.get('slot_duration_minutes'),
      settingsRepository.get('cleaning_duration_minutes'),
    ]);

    const slotTemplates = generateSlots({
      operatingHoursStart: operatingHours.start,
      operatingHoursEnd: operatingHours.end,
      slotDurationMinutes: slotDuration,
      cleaningDurationMinutes: cleaningDuration,
    });

    const dates = dateRange(startDate, endDate);

    // 미예약 슬롯 삭제
    await slotRepository.deleteAvailableByDateRange(studioId, startDate, endDate);

    // 새 슬롯 생성
    const newSlots = dates.flatMap((date) =>
      slotTemplates.map((template) => ({
        studioId,
        date,
        startTime: template.startTime,
        endTime: template.endTime,
        cleaningEndTime: template.cleaningEndTime,
      })),
    );

    await slotRepository.bulkInsert(newSlots);

    return { created: newSlots.length, dates: dates.length };
  },
};
