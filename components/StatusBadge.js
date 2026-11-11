export default function StatusBadge({ status }) {
  const cls = 'badge badge-' + String(status || '').toLowerCase().replace(/\s+/g, '-');
  return <span className={cls}>{status}</span>;
}
