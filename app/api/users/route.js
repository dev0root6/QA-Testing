import { query } from '@/lib/db';
import { json, requireSession, serverError } from '@/lib/api';

export async function GET() {
  const { session, error } = await requireSession();
  if (error) return error;
  if (session.role !== 'admin') return json({ error: 'Forbidden' }, 403);
  try {
    const r = await query('SELECT id, username, full_name, role, last_login FROM users ORDER BY id');
    return json({ users: r.rows });
  } catch (e) {
    return serverError(e);
  }
}
