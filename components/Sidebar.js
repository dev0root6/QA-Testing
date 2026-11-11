'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const STAFF_LINKS = [
  { href: '/dashboard', label: 'Dashboard', ico: '▦' },
  { href: '/students', label: 'Students', ico: '◉' },
  { href: '/departments', label: 'Departmnets', ico: '▤' },
  { href: '/companies', label: 'Companies & Drives', ico: '◆' },
  { href: '/placements', label: 'Placements', ico: '★' },
];

export default function Sidebar({ session }) {
  const path = usePathname();
  const links =
    session.role === 'student'
      ? [{ href: `/students/${session.studentId}`, label: 'My Profile', ico: '◉' }]
      : session.role === 'admin'
        ? [...STAFF_LINKS, { href: '/settings', label: 'Settings', ico: '⚙' }]
        : STAFF_LINKS;

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  }

  return (
    <aside className="side">
      <div className="brand">
        <div className="brand-logo">AITS</div>
        <div>
          Placement Portal
          <small>Aravali Institute</small>
        </div>
      </div>
      <nav className="nav">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className={path === l.href || (l.href !== '/dashboard' && path.startsWith(l.href + '/')) ? 'active' : ''}>
            <span className="ico">{l.ico}</span>
            {l.label}
          </Link>
        ))}
        <a href="#" onClick={(e) => { e.preventDefault(); logout(); }}>
          <span className="ico">⎋</span>
          Sign out
        </a>
      </nav>
      <div className="side-foot">
        <b>{session.name}</b>
        {session.role === 'admin' ? 'Administrator' : session.role === 'officer' ? 'Placement Officer' : 'Student'}
      </div>
    </aside>
  );
}
