import { query } from '@/lib/db';
import { json, requireSession, serverError } from '@/lib/api';
import { canManage } from '@/lib/session';

async function load(id) {
  const r = await query(
    `SELECT s.*, d.code AS dept, d.name AS dept_name,
            o.role AS offer_role, o.package_lpa AS offer_package, o.offer_date, c.name AS offer_company
     FROM students s
     JOIN departments d ON d.id = s.department_id
     LEFT JOIN offers o ON o.student_id = s.id
     LEFT JOIN companies c ON c.id = o.company_id
     WHERE s.id = $1 AND s.is_deleted = FALSE`,
    [id]
  );
  return r.rows[0];
}

function allowed(session, id) {
  return canManage(session) || (session.role === 'student' && Number(session.studentId) === id);
}

export async function GET(_req, { params }) {
  const { session, error } = await requireSession();
  if (error) return error;
  const id = parseInt((await params).id, 10);
  if (!Number.isInteger(id) || !allowed(session, id)) return json({ error: 'Not found' }, 404);
  try {
    const s = await load(id);
    if (!s) return json({ error: 'Not found' }, 404);
    return json({ student: s, canEdit: canManage(session) });
  } catch (e) {
    return serverError(e);
  }
}

export async function PUT(req, { params }) {
  const { session, error } = await requireSession();
  if (error) return error;
  if (!canManage(session)) return json({ error: 'Forbidden' }, 403);
  const id = parseInt((await params).id, 10);
  try {
    const b = await req.json();
    if (!b.name || !String(b.name).trim()) return json({ error: 'name is required' }, 400);
    const r = await query(
      `UPDATE students SET name = $1, phone = $2, city = $3, cgpa = $4, backlogs = $5, status = $6, remarks = $7
       WHERE id = $8 AND is_deleted = FALSE`,
      [String(b.name).trim(), b.phone || null, b.city || null, b.cgpa === '' ? null : Number(b.cgpa),
        parseInt(b.backlogs || 0, 10), b.status, b.remarks || '', id]
    );
    if (!r.rowCount) return json({ error: 'Not found' }, 404);
    return json({ ok: true, student: await load(id) });
  } catch (e) {
    return serverError(e);
  }
}

export async function DELETE(_req, { params }) {
  const { session, error } = await requireSession();
  if (error) return error;
  if (!canManage(session)) return json({ error: 'Forbidden' }, 403);
  const id = parseInt((await params).id, 10);
  try {
    const r = await query('UPDATE students SET is_deleted = TRUE WHERE id = $1', [id]);
    if (!r.rowCount) return json({ error: 'Not found' }, 404);
    return json({ ok: true });
  } catch (e) {
    return serverError(e);
  }
}
