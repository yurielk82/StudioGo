import { Hono } from 'hono';
import { serviceRepository } from '../repositories/service-repository';
import { requireAuth } from '../middleware/auth';
import { success } from '../lib/response';

const servicesRoute = new Hono();

// GET /services — 활성 부가서비스 목록 (MEMBER+ 권한)
servicesRoute.get('/', requireAuth, async (c) => {
  const services = await serviceRepository.findAll(true);
  return success(c, services);
});

export default servicesRoute;
