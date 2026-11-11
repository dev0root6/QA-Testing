import { initDatabase } from '@/lib/db';
import { json, requireSession, serverError } from '@/lib/api';

export async function POST() {
  const { session, error } = await requireSession();
  if (error) return error;
  if (session.role !== 'admin') return json({ error: 'Forbidden' }, 403);
  try {
    await initDatabase({ reset: true });
    return json({ ok: true });
  } catch (e) {
    return serverError(e);
  }
}
