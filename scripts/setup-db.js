/**
 * Prepares the database: applies Prisma migrations, then loads the initial
 * campus data (admin, students, companies, applications, offers) if the
 * database has no users yet. Safe to run on every deploy.
 *
 *   node scripts/setup-db.js              migrate + seed-if-empty
 *   node scripts/setup-db.js --seed-only  seed-if-empty only
 *
 * Neon's pooled host ("-pooler") does not support the advisory locks Prisma
 * migrations use, so migrations run against the direct host automatically.
 */
const { execSync } = require('child_process');

const url = process.env.DATABASE_URL;
if (!url) {
    console.log('[setup-db] DATABASE_URL is not set, skipping database setup.');
    process.exit(0);
}
const directUrl = process.env.DIRECT_URL || url.replace('-pooler.', '.');

function migrate() {
    console.log('[setup-db] Applying migrations…');
    execSync('npx prisma migrate deploy', {
        stdio: 'inherit',
        env: { ...process.env, DATABASE_URL: directUrl },
    });
}

function mulberry32(a) {
    return function () {
        a |= 0;
        a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

const FIRST = ['Arjun', 'Rahul', 'Karthik', 'Vikram', 'Aditya', 'Rohan', 'Siddharth', 'Pranav', 'Nikhil', 'Varun', 'Akash', 'Gautham', 'Naveen', 'Kiran', 'Ashwin', 'Tarun', 'Priya', 'Ananya', 'Divya', 'Sneha', 'Kavya', 'Meera', 'Pooja', 'Aishwarya', 'Nandini', 'Shreya', 'Swathi', 'Harini', 'Neha', 'Bhavana', 'Deepika', 'Anjali', 'Gayathri', 'Sowmya', 'Tanvi', 'Ramya'];
const LAST = ['Sharma', 'Reddy', 'Iyer', 'Nair', 'Kumar', 'Patel', 'Rao', 'Menon', 'Gupta', 'Krishnan', 'Pillai', 'Verma', 'Joshi', 'Shetty', 'Naidu', 'Bhat', 'Desai', 'Hegde', 'Kulkarni', 'Srinivasan'];
const BRANCHES = [
    ['CSE', 'CS'], ['ISE', 'IS'], ['ECE', 'EC'], ['EIE', 'EI'], ['ME', 'ME'], ['CV', 'CV'], ['IEM', 'IM'],
];
const SECTIONS = ['A', 'B', 'C'];
const PASSING_YEAR = 2025;

const COMPANIES = [
    // name, type, package (LPA), days from today (negative = already visited), eligibility [CGPA, backlogs, 10th, 12th]
    ['Nimbus Softworks', 'SERVICE', 6.5, -120, [6.5, 1, 60, 60]],
    ['Kaveri Analytics', 'PRODUCT', 8, -95, [7, 0, 65, 65]],
    ['Orbitron Systems', 'PRODUCT', 42, -80, [8.5, 0, 80, 80]],
    ['Deccan Fintech Labs', 'PRODUCT', 28, -64, [8, 0, 75, 75]],
    ['Sahyadri Infotech', 'SERVICE', 4.2, -50, [6, 2, 55, 55]],
    ['Vortex Semiconductors', 'PRODUCT', 12, -41, [7.5, 0, 70, 70]],
    ['Bluepeak Cloud', 'PRODUCT', 9.5, -30, [7, 0, 65, 65]],
    ['Ironclad Motors', 'SERVICE', 6, -21, [6.5, 1, 60, 60]],
    ['Lotus Health Tech', 'SERVICE', 5, -10, [6, 1, 60, 60]],
    ['Quantica AI', 'PRODUCT', 18, 9, [8, 0, 75, 75]],
    ['Pinnacle Consulting', 'SERVICE', 7.8, 16, [7, 0, 60, 60]],
    ['Meridian Robotics', 'PRODUCT', 7.2, 24, [7, 0, 65, 65]],
    ['Granite Build Corp', 'SERVICE', 4.8, 33, [6, 2, 55, 55]],
    ['Tejas Power Grid Solutions', 'SERVICE', 5.5, 45, [6.5, 1, 60, 60]],
];

async function seed() {
    const { PrismaClient } = require('@prisma/client');
    const bcrypt = require('bcryptjs');
    const prisma = new PrismaClient({ datasources: { db: { url: directUrl } } });
    try {
        const existing = await prisma.user.count();
        if (existing > 0) {
            console.log(`[setup-db] Database already has ${existing} users, skipping seed.`);
            return;
        }
        console.log('[setup-db] Loading initial data…');
        const rand = mulberry32(20250611);
        const pick = (a) => a[Math.floor(rand() * a.length)];
        const round = (n, d) => Math.round(n * 10 ** d) / 10 ** d;
        const today = new Date();
        today.setHours(10, 0, 0, 0);

        const adminHash = await bcrypt.hash('Admin@123', 10);
        const studentHash = await bcrypt.hash('Student@123', 10);
        const demoHash = await bcrypt.hash('DEMO@123', 10);

        // Everything is written in one transaction, so a failed run leaves the database empty.
        await prisma.$transaction(async (tx) => {
        await tx.user.create({ data: { USN: 'ADMIN', password: adminHash, role: 'ADMIN' } });

        const students = [];
        BRANCHES.forEach(([branch, short]) => {
            for (let i = 1; i <= 12; i++) {
                const first = pick(FIRST);
                const last = pick(LAST);
                const CGPA = round(5.8 + rand() * 3.9, 2);
                const backlogs = CGPA < 6.5 ? Math.floor(rand() * 3) : rand() < 0.08 ? 1 : 0;
                students.push({
                    USN: `1AT21${short}${String(i).padStart(3, '0')}`,
                    name: `${first} ${last}`,
                    email: `${first}.${last}.${short}${i}@aits.edu.in`.toLowerCase(),
                    branch,
                    section: SECTIONS[(i - 1) % 3],
                    year: PASSING_YEAR,
                    CGPA,
                    backlogs,
                    tenth: round(70 + rand() * 28, 1),
                    twelth: round(65 + rand() * 32, 1),
                    eligible: backlogs <= 2,
                });
            }
        });
        students.push({
            USN: 'DEMO', name: 'Demo Student', email: 'demo.student@aits.edu.in', branch: 'CSE', section: 'A',
            year: PASSING_YEAR, CGPA: 8.1, backlogs: 0, tenth: 88.4, twelth: 85.2, eligible: true,
        });

        for (const s of students) {
            const password = s.USN === 'DEMO' ? demoHash : studentHash;
            await tx.user.create({
                data: { USN: s.USN, password, role: 'STUDENT', details: { create: { ...s, USN: undefined } } },
            });
        }

        for (const [name, type, pkg, days, [CGPA, backlogs, tenth, twelth]] of COMPANIES) {
            const arrival = new Date(today.getTime() + days * 86400000);
            await tx.company.create({
                data: {
                    name, type, package: pkg, year: PASSING_YEAR, arrival_date: arrival,
                    eligibility: { create: { CGPA, backlogs, tenth, twelth } },
                },
            });
        }

        // Applications and offers, following the same eligibility rules the API enforces.
        const best = {};
        for (const s of students) {
            if (s.USN === 'DEMO') continue;
            best[s.USN] = 0;
            const order = COMPANIES.slice().sort(() => rand() - 0.5);
            let applications = 0;
            for (const [name, , pkg, days, [c, b, t, tw]] of order) {
                if (applications >= 3) break;
                const ok = s.CGPA >= c && s.backlogs <= b && s.tenth >= t && s.twelth >= tw && best[s.USN] * 1.3 < pkg;
                if (!ok || rand() < 0.35) continue;
                await tx.applied.create({ data: { userID: s.USN, companyID: name } });
                applications++;
                if (days < 0 && rand() < 0.45) {
                    await tx.selected.create({ data: { userID: s.USN, companyID: name } });
                    best[s.USN] = Math.max(best[s.USN], pkg);
                }
            }
            if (best[s.USN] > 0) {
                await tx.userDetails.update({ where: { USN: s.USN }, data: { placed: true, package: best[s.USN] } });
            }
        }
        console.log(`[setup-db] Loaded ${students.length} students and ${COMPANIES.length} companies.`);
        }, { maxWait: 20000, timeout: 180000 });
    } finally {
        await prisma.$disconnect();
    }
}

(async () => {
    if (!process.argv.includes('--seed-only')) migrate();
    await seed();
})().catch((e) => {
    console.error('[setup-db] Failed:', e.message);
    process.exit(1);
});
