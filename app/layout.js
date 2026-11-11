import './globals.css';

export const metadata = {
  title: 'AITS Placement Portal',
  description: 'Training & Placement Cell — Aravali Institute of Technology & Science',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
