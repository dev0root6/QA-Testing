// Generates the initial campus dataset (deterministic so every fresh DB looks the same).

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const MALE = ['Arjun', 'Rahul', 'Karthik', 'Vikram', 'Aditya', 'Rohan', 'Siddharth', 'Pranav', 'Nikhil', 'Harish', 'Varun', 'Manoj', 'Suresh', 'Akash', 'Gautham', 'Abhishek', 'Naveen', 'Ravi', 'Deepak', 'Kiran', 'Ashwin', 'Sanjay', 'Tarun', 'Yash', 'Vignesh', 'Mohan', 'Dinesh', 'Ajay', 'Bharath', 'Lokesh'];
const FEMALE = ['Priya', 'Ananya', 'Divya', 'Sneha', 'Kavya', 'Meera', 'Pooja', 'Aishwarya', 'Lakshmi', 'Nandini', 'Shreya', 'Swathi', 'Keerthana', 'Harini', 'Ishita', 'Neha', 'Revathi', 'Sandhya', 'Bhavana', 'Deepika', 'Anjali', 'Ritika', 'Gayathri', 'Madhuri', 'Sowmya', 'Tanvi', 'Varsha', 'Yamini', 'Pavithra', 'Ramya'];
const SURNAMES = ['Sharma', 'Reddy', 'Iyer', 'Nair', 'Kumar', 'Patel', 'Rao', 'Menon', 'Gupta', 'Krishnan', 'Pillai', 'Verma', 'Joshi', 'Shetty', 'Naidu', 'Bhat', 'Desai', 'Chowdary', 'Subramanian', 'Hegde', 'Mishra', 'Agarwal', 'Kulkarni', 'Raghavan', 'Srinivasan'];
const CITIES = ['Bengaluru', 'Chennai', 'Hyderabad', 'Coimbatore', 'Mysuru', 'Pune', 'Kochi', 'Madurai', 'Vijayawada', 'Mangaluru', 'Salem', 'Tirupati', 'Hubballi', 'Visakhapatnam', 'Trichy'];

export const DEPARTMENTS = [
  { code: 'CSE', name: 'Computer Science & Engineering', hod: 'Dr. R. Venkatesh', block: 'A Block', intake: 42, placeRate: 0.86 },
  { code: 'IT', name: 'Information Technology', hod: 'Dr. S. Lavanya', block: 'A Block', intake: 40, placeRate: 0.8 },
  { code: 'AIML', name: 'Artificial Intelligence & Machine Learning', hod: 'Dr. K. Prakash', block: 'B Block', intake: 36, placeRate: 0.78 },
  { code: 'ECE', name: 'Electronics & Communication Engineering', hod: 'Dr. M. Shanthi', block: 'C Block', intake: 40, placeRate: 0.66 },
  { code: 'EEE', name: 'Electrical & Electronics Engineering', hod: 'Dr. P. Ramesh Babu', block: 'C Block', intake: 36, placeRate: 0.55 },
  { code: 'MECH', name: 'Mechanical Engineering', hod: 'Dr. A. Jayaraman', block: 'D Block', intake: 40, placeRate: 0.5 },
  { code: 'CIVIL', name: 'Civil Engineering', hod: 'Dr. N. Geetha', block: 'E Block', intake: 34, placeRate: 0.42 },
];

export const COMPANIES = [
  { name: 'Nimbus Softworks', sector: 'IT Services', city: 'Bengaluru', role: 'Software Engineer', pkg: 6.5, minCgpa: 6.5, depts: ['CSE', 'IT', 'AIML', 'ECE'] },
  { name: 'Kaveri Analytics', sector: 'Data & Analytics', city: 'Chennai', role: 'Data Analyst', pkg: 8.0, minCgpa: 7.0, depts: ['CSE', 'IT', 'AIML'] },
  { name: 'Orbitron Systems', sector: 'Product', city: 'Hyderabad', role: 'SDE I', pkg: 42.0, minCgpa: 8.5, depts: ['CSE', 'IT'] },
  { name: 'Deccan Fintech Labs', sector: 'Fintech', city: 'Bengaluru', role: 'Backend Developer', pkg: 28.0, minCgpa: 8.0, depts: ['CSE', 'IT', 'AIML'] },
  { name: 'Sahyadri Infotech', sector: 'IT Services', city: 'Pune', role: 'Associate Engineer', pkg: 4.2, minCgpa: 6.0, depts: ['CSE', 'IT', 'AIML', 'ECE', 'EEE', 'MECH', 'CIVIL'] },
  { name: 'Vortex Semiconductors', sector: 'Semiconductors', city: 'Bengaluru', role: 'VLSI Design Engineer', pkg: 12.0, minCgpa: 7.5, depts: ['ECE', 'EEE'] },
  { name: 'Tejas Power Grid Solutions', sector: 'Energy', city: 'Chennai', role: 'Graduate Engineer Trainee', pkg: 5.5, minCgpa: 6.5, depts: ['EEE', 'ECE'] },
  { name: 'Ironclad Motors', sector: 'Automotive', city: 'Chennai', role: 'Design Engineer', pkg: 6.0, minCgpa: 6.5, depts: ['MECH', 'EEE'] },
  { name: 'Granite Build Corp', sector: 'Construction', city: 'Hyderabad', role: 'Site Engineer', pkg: 4.8, minCgpa: 6.0, depts: ['CIVIL'] },
  { name: 'Bluepeak Cloud', sector: 'Cloud', city: 'Bengaluru', role: 'Cloud Engineer', pkg: 9.5, minCgpa: 7.0, depts: ['CSE', 'IT', 'AIML', 'ECE'] },
  { name: 'Lotus Health Tech', sector: 'Healthcare IT', city: 'Kochi', role: 'QA Engineer', pkg: 5.0, minCgpa: 6.0, depts: ['CSE', 'IT', 'AIML', 'ECE'] },
  { name: 'Meridian Robotics', sector: 'Robotics', city: 'Coimbatore', role: 'Robotics Engineer', pkg: 7.2, minCgpa: 7.0, depts: ['MECH', 'ECE', 'EEE', 'AIML'] },
  { name: 'Coastal Infra Projects', sector: 'Infrastructure', city: 'Mangaluru', role: 'Graduate Engineer', pkg: 4.5, minCgpa: 6.0, depts: ['CIVIL', 'MECH'] },
  { name: 'Quantica AI', sector: 'AI Research', city: 'Bengaluru', role: 'ML Engineer', pkg: 18.0, minCgpa: 8.0, depts: ['AIML', 'CSE'] },
  { name: 'Pinnacle Consulting', sector: 'Consulting', city: 'Mumbai', role: 'Business Analyst', pkg: 7.8, minCgpa: 7.0, depts: ['CSE', 'IT', 'AIML', 'ECE', 'EEE', 'MECH', 'CIVIL'] },
];

const REMARKS = [
  'Strong in problem solving. Completed internship at a product startup.',
  'Active member of the coding club. Good communication skills.',
  'Needs improvement in aptitude. Attended all training sessions.',
  'Won second prize in the inter-college hackathon.',
  'Interested in core roles. Completed NPTEL certification.',
  'Class representative. Good leadership qualities.',
  'Published a paper at a national conference.',
  'Preparing for GATE alongside placements.',
  '',
  '',
];

export function generateData() {
  const rand = mulberry32(20250611);
  const pick = (arr) => arr[Math.floor(rand() * arr.length)];
  const between = (a, b) => a + rand() * (b - a);

  const students = [];
  const offers = [];
  let globalIdx = 0;

  DEPARTMENTS.forEach((dept, deptIndex) => {
    for (let i = 1; i <= dept.intake; i++) {
      globalIdx++;
      const female = rand() < 0.45;
      const first = female ? pick(FEMALE) : pick(MALE);
      const last = pick(SURNAMES);
      const name = `${first} ${last}`;
      const roll = `21${dept.code}${String(i).padStart(3, '0')}`;
      let cgpa = Math.round(between(5.6, 9.7) * 100) / 100;
      if (globalIdx % 13 === 0) cgpa = 7.0;
      const backlogs = cgpa < 6.5 ? Math.floor(rand() * 3) : rand() < 0.1 ? 1 : 0;
      const y = 2003 + Math.floor(rand() * 2);
      const m = 1 + Math.floor(rand() * 12);
      const d = 1 + Math.floor(rand() * 28);
      const dob = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

      let status = 'Not Placed';
      const r = rand();
      const eligibleBoost = cgpa >= 7 ? 0.12 : -0.15;
      if (r < dept.placeRate + eligibleBoost) status = 'Placed';
      else if (r > 0.95) status = 'Higher Studies';
      else if (r > 0.92) status = 'Opted Out';

      const student = {
        roll_no: roll,
        name,
        email: `${first.toLowerCase()}.${last.toLowerCase()}${i}@aits.edu.in`,
        phone: `9${Math.floor(100000000 + rand() * 899999999)}`,
        gender: female ? 'Female' : 'Male',
        dob,
        dept_index: deptIndex,
        batch: 2025,
        cgpa,
        backlogs,
        tenth_pct: Math.round(between(72, 98) * 10) / 10,
        twelfth_pct: Math.round(between(68, 97) * 10) / 10,
        city: pick(CITIES),
        status,
        remarks: pick(REMARKS),
        is_deleted: i === dept.intake || i === dept.intake - 7,
      };
      students.push(student);

      if (status === 'Placed') {
        const options = COMPANIES.map((c, ci) => ({ c, ci })).filter(
          ({ c }) => c.depts.includes(dept.code) && cgpa >= c.minCgpa - 0.6
        );
        const chosen = options.length ? options[Math.floor(rand() * options.length)] : { c: COMPANIES[4], ci: 4 };
        offers.push({ studentIdx: students.length - 1, companyIdx: chosen.ci, role: chosen.c.role, pkg: chosen.c.pkg });
      }
    }
  });

  const drives = COMPANIES.map((c, ci) => {
    const month = 7 + (ci % 6);
    const day = 3 + ((ci * 5) % 24);
    const date = month <= 12 ? `2024-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}` : `2025-01-${day}`;
    return { companyIdx: ci, date, role: c.role, pkg: c.pkg, minCgpa: c.minCgpa, depts: c.depts.join(', '), mode: ci % 3 === 0 ? 'Virtual' : 'On Campus' };
  });
  drives.push(
    { companyIdx: 1, date: '2026-12-04', role: 'Analytics Engineer', pkg: 9.0, minCgpa: 7.0, depts: 'CSE, IT, AIML', mode: 'On Campus' },
    { companyIdx: 5, date: '2026-12-11', role: 'Verification Engineer', pkg: 11.0, minCgpa: 7.5, depts: 'ECE, EEE', mode: 'On Campus' },
    { companyIdx: 14, date: '2027-01-08', role: 'Associate Consultant', pkg: 8.4, minCgpa: 6.5, depts: 'All branches', mode: 'Virtual' }
  );

  return { students, offers, drives };
}

export const USERS = [
  { username: 'admin', password: 'Admin@123', full_name: 'Placement Admin', role: 'admin', studentRoll: null },
  { username: 'officer', password: 'Officer@123', full_name: 'Mrs. Kavitha Raman', role: 'officer', studentRoll: null },
  { username: 'hod.cse', password: 'Hod@123', full_name: 'Dr. R. Venkatesh', role: 'officer', studentRoll: null },
  { username: 'student', password: 'Student@123', full_name: 'Student Account', role: 'student', studentRoll: '21CSE001' },
  { username: 'student2', password: 'Student@123', full_name: 'Student Account 2', role: 'student', studentRoll: '21ECE004' },
];
