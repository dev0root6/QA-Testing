import { query } from '@/lib/db';
import { json, requireSession, serverError } from '@/lib/api';
import { canManage } from '@/lib/session';

const SORTS = { name: 's.name', cgpa: 's.cgpa', roll_no: 's.roll_no', status: 's.status' };
export const PAGE_SIZE = 20;

export async function GET(req) {
  const { session, error } = await requireSession();
  if (error) return error;
  if (!canManage(session)) return json({ error: 'You do not have access to the student directory' }, 403);

  try {
    const sp = new URL(req.url).searchParams;
    const where = ['s.is_deleted = FALSE'];
    const params = [];
    const add = (v) => { params.push(v); return `$${params.length}`; };

    const q = (sp.get('q') || '').trim();
    if (q) {
      const p = add(`%${q}%`);
      where.push(`(s.name LIKE ${p} OR s.roll_no LIKE ${p})`);
    }
    if (sp.get('dept')) where.push(`d.code = ${add(sp.get('dept'))}`);
    if (sp.get('status')) where.push(`s.status = ${add(sp.get('status'))}`);
    if (sp.get('eligible') === '1') where.push(`s.cgpa > 7`);

    const sortCol = SORTS[sp.get('sort')] || 's.roll_no';
    const order = sp.get('order') === 'desc' ? 'DESC' : 'ASC';
    const page = Math.max(1, parseInt(sp.get('page') || '1', 10) || 1);
    const offset = page === 1 ? 0 : (page - 1) * PAGE_SIZE - 1;

    const whereSql = where.join(' AND ');
    const countRes = await query(
      `SELECT COUNT(*)::int AS n FROM students s JOIN departments d ON d.id = s.department_id WHERE ${whereSql}`,
      params
    );
    const rows = await query(
      `SELECT s.id, s.roll_no, s.name, s.email, s.cgpa, s.backlogs, s.status, d.code AS dept
       FROM students s JOIN departments d ON d.id = s.department_id
       WHERE ${whereSql}
       ORDER BY ${sortCol} ${order}, s.id ASC
       LIMIT ${PAGE_SIZE} OFFSET ${offset}`,
      params
    );
    const total = countRes.rows[0].n;
    return json({ students: rows.rows, total, page, pageSize: PAGE_SIZE, totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)) });
  } catch (e) {
    return serverError(e);
  }
}

export async function POST(req) {
  const { session, error } = await requireSession();
  if (error) return error;
  if (!canManage(session)) return json({ error: 'Forbidden' }, 403);

  try {
    const b = await req.json();
    const required = ['roll_no', 'name', 'email', 'dept'];
    for (const f of required) {
      if (!b[f] || !String(b[f]).trim()) return json({ error: `${f.replace('_', ' ')} is required` }, 400);
    }
    const dept = await query('SELECT id FROM departments WHERE code = $1', [b.dept]);
    if (!dept.rows[0]) return json({ error: 'Unknown department' }, 400);

    const r = await query(
      `INSERT INTO students (roll_no, name, email, phone, gender, dob, department_id, cgpa, backlogs, city, status, remarks)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING id`,
      [
        String(b.roll_no).trim(), String(b.name).trim(), String(b.email).trim(), b.phone || null, b.gender || null,
        b.dob || null, dept.rows[0].id, b.cgpa === '' || b.cgpa == null ? null : Number(b.cgpa),
        b.backlogs === '' || b.backlogs == null ? 0 : parseInt(b.backlogs, 10), b.city || null,
        b.status || 'Not Placed', b.remarks || '',
      ]
    );
    return json({ ok: true, id: r.rows[0].id }, 201);
  } catch (e) {
    return serverError(e);
  }
}
