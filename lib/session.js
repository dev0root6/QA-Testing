import { cookies } from 'next/headers';
import { sign, unsign } from './crypto.js';

export const SESSION_COOKIE = 'aits_session';
export const SESSION_MAX_AGE = 60 * 60 * 8;

export function createSessionToken(user) {
  return sign({
    id: user.id,
    username: user.username,
    name: user.full_name,
    role: user.role,
    studentId: user.student_id,
    exp: Date.now() + SESSION_MAX_AGE * 1000,
  });
}

export async function getSession() {
  const store = await cookies();
  return unsign(store.get(SESSION_COOKIE)?.value);
}

export function canManage(session) {
  return !!session && (session.role === 'admin' || session.role === 'officer');
}
