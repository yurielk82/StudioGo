import { studioRepository } from '../repositories/studio-repository';
import { systemLogRepository } from '../repositories/system-log-repository';
import { ApiError } from '../lib/api-error';
import type { CreateStudioRequest, UpdateStudioRequest } from '../../../../shared/contracts';

export const studioService = {
  /** 스튜디오 목록 조회 (MEMBER는 활성만, ADMIN은 전체) */
  async list(isAdmin: boolean) {
    return studioRepository.findAll(!isAdmin);
  },

  /** 스튜디오 상세 조회 */
  async getById(id: string) {
    const studio = await studioRepository.findById(id);
    if (!studio) throw ApiError.notFound('STUDIO_NOT_FOUND', '스튜디오를 찾을 수 없습니다.');
    return studio;
  },

  /** 스튜디오 생성 */
  async create(data: CreateStudioRequest, adminId: string) {
    const studio = await studioRepository.create(data);

    await systemLogRepository.create({
      userId: adminId,
      action: 'STUDIO_CREATE',
      target: 'studios',
      targetId: studio.id,
      details: { name: data.name },
    });

    return studio;
  },

  /** 스튜디오 수정 */
  async update(id: string, data: UpdateStudioRequest, adminId: string) {
    const existing = await studioRepository.findById(id);
    if (!existing) throw ApiError.notFound('STUDIO_NOT_FOUND', '스튜디오를 찾을 수 없습니다.');

    const updated = await studioRepository.update(id, data);

    await systemLogRepository.create({
      userId: adminId,
      action: 'STUDIO_UPDATE',
      target: 'studios',
      targetId: id,
      details: data,
    });

    return updated;
  },

  /** 스튜디오 삭제 (soft delete) */
  async delete(id: string, adminId: string) {
    const existing = await studioRepository.findById(id);
    if (!existing) throw ApiError.notFound('STUDIO_NOT_FOUND', '스튜디오를 찾을 수 없습니다.');

    await studioRepository.softDelete(id);

    await systemLogRepository.create({
      userId: adminId,
      action: 'STUDIO_DELETE',
      target: 'studios',
      targetId: id,
      details: { name: existing.name },
    });
  },

  /** 스튜디오 활성화 토글 */
  async toggleActive(id: string, adminId: string) {
    const existing = await studioRepository.findById(id);
    if (!existing) throw ApiError.notFound('STUDIO_NOT_FOUND', '스튜디오를 찾을 수 없습니다.');

    const updated = await studioRepository.toggleActive(id);

    await systemLogRepository.create({
      userId: adminId,
      action: 'STUDIO_TOGGLE_ACTIVE',
      target: 'studios',
      targetId: id,
      details: { isActive: updated?.isActive },
    });

    return updated;
  },
};
