import { NextResponse } from 'next/server';
import { getSession } from './session';

export function json(data, status = 200) {
  return NextResponse.json(data, { status });
}

export async function requireSession() {
  const s = await getSession();
  if (!s) return { error: json({ error: 'Not authenticated' }, 401) };
  return { session: s };
}

export function serverError(e) {
  console.error(e);
  return json({ error: 'Something went wrong. Please try again.' }, 500);
}
