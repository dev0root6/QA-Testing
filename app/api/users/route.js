import { query } from '@/lib/db';
import { json, requireSession, serverError } from '@/lib/api';

export async function GET() {
  const { error } = await requireSession();
  if (error) return error;
  try {
    const r = await query('SELECT * FROM users ORDER BY id');
    return json({ users: r.rows });
  } catch (e) {
    return serverError(e);
  }
}
