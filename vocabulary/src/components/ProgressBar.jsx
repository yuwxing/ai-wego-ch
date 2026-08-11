export default function ProgressBar({ current, total, label }) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0
  return (
    <div style={{ width: '100%' }}>
      {label && <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}>{label}</div>}
      <div style={{
        width: '100%', height: 8, background: '#e5e7eb', borderRadius: 4, overflow: 'hidden',
      }}>
        <div style={{
          width: `${pct}%`, height: '100%', background: '#3b82f6', borderRadius: 4,
          transition: 'width 0.3s',
        }} />
      </div>
      <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{current}/{total}</div>
    </div>
  )
}
