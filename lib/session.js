import { cookies } from 'next/headers';

export const SESSION_COOKIE = 'aits_session';

export function encodeSession(user) {
  const payload = { id: user.id, username: user.username, name: user.full_name, role: user.role, studentId: user.student_id };
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

export function decodeSession(value) {
  if (!value) return null;
  try {
    const s = JSON.parse(Buffer.from(value, 'base64').toString('utf8'));
    return s && s.username ? s : null;
  } catch {
    return null;
  }
}

export async function getSession() {
  const store = await cookies();
  return decodeSession(store.get(SESSION_COOKIE)?.value);
}

export function canManage(session) {
  return session && (session.role === 'admin' || session.role === 'officer');
}
