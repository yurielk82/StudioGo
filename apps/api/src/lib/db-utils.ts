/** INSERT/UPDATE .returning() 결과의 첫 행을 안전하게 추출한다. */
export function firstRow<T>(rows: T[]): T {
  const row = rows[0];
  if (row === undefined) throw new Error('쿼리 결과가 비어있습니다');
  return row;
}
