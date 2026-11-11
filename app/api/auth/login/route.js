import { query } from '@/lib/db';
import { json, serverError } from '@/lib/api';
import { verifyPassword } from '@/lib/crypto';
import { createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE } from '@/lib/session';

export async function POST(req) {
  try {
    const { username, password } = await req.json();
    if (!username || !password) return json({ error: 'Username and password are required' }, 400);

    const r = await query('SELECT * FROM users WHERE username = $1', [String(username).trim()]);
    const user = r.rows[0];
    if (!user || !verifyPassword(password, user.password_hash)) {
      return json({ error: 'Invalid username or password' }, 401);
    }

    await query('UPDATE users SET last_login = now() WHERE id = $1', [user.id]);
    const res = json({ ok: true, role: user.role, studentId: user.student_id });
    res.cookies.set(SESSION_COOKIE, createSessionToken(user), {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_MAX_AGE,
    });
    return res;
  } catch (e) {
    return serverError(e);
  }
}
