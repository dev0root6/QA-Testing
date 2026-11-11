import { Pool } from 'pg';
import { generateData, DEPARTMENTS, COMPANIES, USERS } from './seed.js';

const g = globalThis;

function makePool() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set');
  const local = /localhost|127\.0\.0\.1/.test(url);
  return new Pool({
    connectionString: url,
    ssl: local ? false : { rejectUnauthorized: false },
    max: 5,
  });
}

export function getPool() {
  if (!g.__aitsPool) g.__aitsPool = makePool();
  return g.__aitsPool;
}

const SCHEMA = `
CREATE TABLE IF NOT EXISTS departments (
  id SERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  hod TEXT NOT NULL,
  block TEXT NOT NULL,
  intake INT NOT NULL
);
CREATE TABLE IF NOT EXISTS students (
  id SERIAL PRIMARY KEY,
  roll_no TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  gender TEXT,
  dob DATE,
  department_id INT REFERENCES departments(id),
  batch INT NOT NULL DEFAULT 2025,
  cgpa NUMERIC(4,2),
  backlogs INT DEFAULT 0,
  tenth_pct NUMERIC(5,1),
  twelfth_pct NUMERIC(5,1),
  city TEXT,
  status TEXT NOT NULL DEFAULT 'Not Placed',
  remarks TEXT DEFAULT '',
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS companies (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  sector TEXT,
  city TEXT
);
CREATE TABLE IF NOT EXISTS drives (
  id SERIAL PRIMARY KEY,
  company_id INT REFERENCES companies(id),
  drive_date DATE NOT NULL,
  role TEXT NOT NULL,
  package_lpa NUMERIC(5,2) NOT NULL,
  min_cgpa NUMERIC(4,2) NOT NULL,
  eligible_depts TEXT,
  mode TEXT
);
CREATE TABLE IF NOT EXISTS offers (
  id SERIAL PRIMARY KEY,
  student_id INT REFERENCES students(id),
  company_id INT REFERENCES companies(id),
  role TEXT NOT NULL,
  package_lpa NUMERIC(5,2) NOT NULL,
  offer_date DATE NOT NULL DEFAULT CURRENT_DATE
);
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL,
  student_id INT REFERENCES students(id),
  last_login TIMESTAMPTZ
);
`;

async function seed(client) {
  await client.query(SCHEMA);
  const deptIds = [];
  for (const d of DEPARTMENTS) {
    const r = await client.query(
      'INSERT INTO departments (code, name, hod, block, intake) VALUES ($1,$2,$3,$4,$5) RETURNING id',
      [d.code, d.name, d.hod, d.block, d.intake]
    );
    deptIds.push(r.rows[0].id);
  }
  const companyIds = [];
  for (const c of COMPANIES) {
    const r = await client.query('INSERT INTO companies (name, sector, city) VALUES ($1,$2,$3) RETURNING id', [c.name, c.sector, c.city]);
    companyIds.push(r.rows[0].id);
  }

  const { students, offers, drives } = generateData();
  const studentIds = [];
  const byRoll = {};
  for (const s of students) {
    const r = await client.query(
      `INSERT INTO students (roll_no, name, email, phone, gender, dob, department_id, batch, cgpa, backlogs, tenth_pct, twelfth_pct, city, status, remarks, is_deleted)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16) RETURNING id`,
      [s.roll_no, s.name, s.email, s.phone, s.gender, s.dob, deptIds[s.dept_index], s.batch, s.cgpa, s.backlogs, s.tenth_pct, s.twelfth_pct, s.city, s.status, s.remarks, s.is_deleted]
    );
    studentIds.push(r.rows[0].id);
    byRoll[s.roll_no] = { id: r.rows[0].id, name: s.name };
  }
  for (const [i, o] of offers.entries()) {
    const month = 8 + (i % 5);
    const day = 1 + ((i * 7) % 27);
    await client.query('INSERT INTO offers (student_id, company_id, role, package_lpa, offer_date) VALUES ($1,$2,$3,$4,$5)', [
      studentIds[o.studentIdx], companyIds[o.companyIdx], o.role, o.pkg, `2024-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
    ]);
  }
  for (const d of drives) {
    await client.query(
      'INSERT INTO drives (company_id, drive_date, role, package_lpa, min_cgpa, eligible_depts, mode) VALUES ($1,$2,$3,$4,$5,$6,$7)',
      [companyIds[d.companyIdx], d.date, d.role, d.pkg, d.minCgpa, d.depts, d.mode]
    );
  }
  for (const u of USERS) {
    const linked = u.studentRoll ? byRoll[u.studentRoll] : null;
    await client.query('INSERT INTO users (username, password, full_name, role, student_id) VALUES ($1,$2,$3,$4,$5)', [
      u.username, u.password, linked ? linked.name : u.full_name, u.role, linked ? linked.id : null,
    ]);
  }
}

export async function initDatabase({ reset = false } = {}) {
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    await client.query('SELECT pg_advisory_xact_lock(424242)');
    if (reset) {
      await client.query('DROP TABLE IF EXISTS offers, drives, users, students, companies, departments CASCADE');
    }
    const exists = await client.query("SELECT to_regclass('public.students') AS t");
    if (!exists.rows[0].t) await seed(client);
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

export async function query(text, params) {
  if (!g.__aitsReady) g.__aitsReady = initDatabase().catch((e) => { g.__aitsReady = null; throw e; });
  await g.__aitsReady;
  return getPool().query(text, params);
}

export async function readOnly(fn) {
  if (!g.__aitsReady) g.__aitsReady = initDatabase().catch((e) => { g.__aitsReady = null; throw e; });
  await g.__aitsReady;
  const client = await getPool().connect();
  try {
    await client.query('BEGIN TRANSACTION READ ONLY');
    const out = await fn(client);
    await client.query('COMMIT');
    return out;
  } catch (e) {
    await client.query('ROLLBACK').catch(() => {});
    throw e;
  } finally {
    client.release();
  }
}
