import { memberRepository } from '../repositories/member-repository';
import { userRepository } from '../repositories/user-repository';
import { notificationRepository } from '../repositories/notification-repository';
import { systemLogRepository } from '../repositories/system-log-repository';
import { ApiError } from '../lib/api-error';
import type { MemberListQuery, UpdateMemberRequest } from '../../../../shared/contracts';

export const memberService = {
  /** 회원 목록 조회 */
  async list(query: MemberListQuery) {
    return memberRepository.findAll(query);
  },

  /** 회원 상세 조회 */
  async getById(id: string) {
    const member = await memberRepository.findDetailById(id);
    if (!member) throw ApiError.notFound('MEMBER_NOT_FOUND', '회원을 찾을 수 없습니다.');
    return member;
  },

  /** 회원 승인 */
  async approve(memberId: string, operatorId: string) {
    const member = await userRepository.findById(memberId);
    if (!member) throw ApiError.notFound('MEMBER_NOT_FOUND', '회원을 찾을 수 없습니다.');
    if (member.status !== 'PENDING') {
      throw ApiError.badRequest(
        'VALIDATION_INVALID_INPUT',
        '대기 상태인 회원만 승인할 수 있습니다.',
      );
    }

    await userRepository.updateStatus(memberId, 'APPROVED', operatorId);

    await notificationRepository.createJob({
      eventType: 'MEMBER_APPROVED',
      payload: { userId: memberId, userName: member.name },
      idempotencyKey: `member_approved_${memberId}`,
    });

    await systemLogRepository.create({
      userId: operatorId,
      action: 'MEMBER_APPROVE',
      target: 'users',
      targetId: memberId,
    });
  },

  /** 회원 정지 */
  async suspend(memberId: string, operatorId: string, reason: string) {
    const member = await userRepository.findById(memberId);
    if (!member) throw ApiError.notFound('MEMBER_NOT_FOUND', '회원을 찾을 수 없습니다.');
    if (member.status === 'SUSPENDED') {
      throw ApiError.badRequest('MEMBER_SUSPENDED', '이미 정지된 회원입니다.');
    }

    await userRepository.updateStatus(memberId, 'SUSPENDED');

    await systemLogRepository.create({
      userId: operatorId,
      action: 'MEMBER_SUSPEND',
      target: 'users',
      targetId: memberId,
      details: { reason },
    });
  },

  /** 정지 해제 */
  async unsuspend(memberId: string, operatorId: string) {
    const member = await userRepository.findById(memberId);
    if (!member) throw ApiError.notFound('MEMBER_NOT_FOUND', '회원을 찾을 수 없습니다.');
    if (member.status !== 'SUSPENDED') {
      throw ApiError.badRequest(
        'VALIDATION_INVALID_INPUT',
        '정지 상태인 회원만 해제할 수 있습니다.',
      );
    }

    await userRepository.updateStatus(memberId, 'APPROVED');

    await systemLogRepository.create({
      userId: operatorId,
      action: 'MEMBER_UNSUSPEND',
      target: 'users',
      targetId: memberId,
    });
  },

  /** 회원 정보 수정 (ADMIN) */
  async update(memberId: string, data: UpdateMemberRequest, adminId: string) {
    const member = await userRepository.findById(memberId);
    if (!member) throw ApiError.notFound('MEMBER_NOT_FOUND', '회원을 찾을 수 없습니다.');

    // 닉네임 중복 확인
    if (data.nickname) {
      const taken = await userRepository.isNicknameTaken(data.nickname, memberId);
      if (taken) throw ApiError.conflict('MEMBER_NICKNAME_TAKEN', '이미 사용 중인 닉네임입니다.');
    }

    const updateData: Record<string, unknown> = { ...data };
    if (data.nickname) {
      updateData.nicknameNormalized = data.nickname.replace(/\s/g, '').toLowerCase();
    }

    const updated = await memberRepository.update(memberId, updateData);

    await systemLogRepository.create({
      userId: adminId,
      action: 'MEMBER_UPDATE',
      target: 'users',
      targetId: memberId,
      details: data,
    });

    return updated;
  },

  /** 회원 예약/방송 이력 */
  async getHistory(memberId: string, page: number, limit: number) {
    const member = await userRepository.findById(memberId);
    if (!member) throw ApiError.notFound('MEMBER_NOT_FOUND', '회원을 찾을 수 없습니다.');

    return memberRepository.getReservationHistory(memberId, page, limit);
  },
};
