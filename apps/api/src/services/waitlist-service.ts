import { waitlistRepository } from '../repositories/waitlist-repository';
import { userRepository } from '../repositories/user-repository';
import { ApiError } from '../lib/api-error';
import type { CreateWaitlistRequest } from '../../../../shared/contracts';

export const waitlistService = {
  /** 대기 등록 */
  async create(userId: string, data: CreateWaitlistRequest) {
    const user = await userRepository.findById(userId);
    if (!user) throw ApiError.notFound('MEMBER_NOT_FOUND', '사용자를 찾을 수 없습니다.');
    if (user.status !== 'APPROVED') {
      throw ApiError.forbidden('MEMBER_NOT_APPROVED', '승인된 회원만 대기 등록할 수 있습니다.');
    }

    return waitlistRepository.create(userId, data);
  },

  /** 대기 취소 */
  async cancel(id: string, userId: string) {
    const entry = await waitlistRepository.findById(id);
    if (!entry) throw ApiError.notFound('GENERAL_NOT_FOUND', '대기 항목을 찾을 수 없습니다.');
    if (entry.userId !== userId) {
      throw ApiError.forbidden('PERMISSION_DENIED', '본인의 대기 항목만 취소할 수 있습니다.');
    }
    if (entry.status !== 'ACTIVE') {
      throw ApiError.badRequest(
        'VALIDATION_INVALID_INPUT',
        '활성 상태인 대기만 취소할 수 있습니다.',
      );
    }

    await waitlistRepository.cancel(id);
  },

  /** 내 대기 목록 */
  async getMyWaitlist(userId: string) {
    return waitlistRepository.findMyWaitlist(userId);
  },
};
