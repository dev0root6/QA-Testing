import { query } from '@/lib/db';
import { json, serverError } from '@/lib/api';
import { encodeSession, SESSION_COOKIE } from '@/lib/session';

export async function POST(req) {
  try {
    const { username, password } = await req.json();
    if (!username || !password) return json({ error: 'Username and password are required' }, 400);

    const r = await query('SELECT * FROM users WHERE username = $1', [username.trim()]);
    const user = r.rows[0];
    if (!user) return json({ error: 'No account found with this username' }, 401);
    if (user.password !== password) return json({ error: 'Incorrect password for this account' }, 401);

    await query('UPDATE users SET last_login = now() WHERE id = $1', [user.id]);
    const res = json({ ok: true, role: user.role, studentId: user.student_id });
    res.cookies.set(SESSION_COOKIE, encodeSession(user), { path: '/', sameSite: 'lax', maxAge: 60 * 60 * 8 });
    return res;
  } catch (e) {
    return serverError(e);
  }
}
