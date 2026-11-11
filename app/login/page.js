'use client';
import { useState } from 'react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const r = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await r.json();
      if (!r.ok) {
        setError(data.error || 'Login failed');
        return;
      }
      window.location.href = data.role === 'student' ? `/students/${data.studentId}` : '/dashboard';
    } catch {
      setError('Unable to reach the server. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-art">
        <div className="brand" style={{ padding: 0 }}>
          <div className="brand-logo">AITS</div>
          <div>Aravali Institute of Technology &amp; Science<small style={{ color: '#c8d0ff' }}>Training &amp; Placement Cell</small></div>
        </div>
        <div>
          <h1>Placement Portal<br />Batch 2021 – 2025</h1>
          <p>Track student records, department-wise placement status, recruiter drives and offers — all in one place.</p>
        </div>
        <small style={{ color: '#c8d0ff' }}>Autonomous · Affiliated to State Technical University · NAAC A+</small>
      </div>
      <div className="login-box">
        <form onSubmit={submit} className="card" style={{ padding: 28 }}>
          <h2 style={{ fontSize: 20, marginBottom: 4 }}>Sign in</h2>
          <p className="sub">Use your portal credentials.</p>
          {error && <div className="alert alert-err">{error}</div>}
          <div className="field">
            <label htmlFor="u">Username</label>
            <input id="u" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" />
          </div>
          <div className="field">
            <label htmlFor="p">Password</label>
            <input id="p" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
          </div>
          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={busy}>
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
