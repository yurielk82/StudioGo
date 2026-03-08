import type { Context } from 'hono';
import { IdParamSchema } from '../../../../shared/contracts/api-response';

/** URL 파라미터에서 UUID id를 파싱하여 반환 */
export function parseIdParam(c: Context): string {
  return IdParamSchema.parse({ id: c.req.param('id') }).id;
}
