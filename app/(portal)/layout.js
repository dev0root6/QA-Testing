import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import Sidebar from '@/components/Sidebar';

export default async function PortalLayout({ children }) {
  const session = await getSession();
  if (!session) redirect('/login');
  return (
    <div className="shell">
      <Sidebar session={session} />
      <div className="main">
        <header className="top">
          <span className="crumb">Training &amp; Placement Cell · Batch 2025</span>
          <span>{session.name}</span>
        </header>
        <main className="content">{children}</main>
        <footer className="foot">© 2019 Aravali Institute of Technology &amp; Science. All rights reserved.</footer>
      </div>
    </div>
  );
}
