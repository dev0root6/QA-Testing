import { redirect } from 'next/navigation';
import { getSession, canManage } from './session.js';

export async function requireStaff() {
  const s = await getSession();
  if (!s) redirect('/login');
  if (!canManage(s)) redirect(`/students/${s.studentId}`);
  return s;
}

export function fmtDate(d) {
  if (!d) return '—';
  const x = new Date(d);
  return x.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}
