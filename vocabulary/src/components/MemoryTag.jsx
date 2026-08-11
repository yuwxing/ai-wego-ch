export default function MemoryTag({ level }) {
  if (!level) return null
  return (
    <span style={{
      display: 'inline-block', padding: '2px 10px', borderRadius: 10,
      fontSize: 12, fontWeight: 500, color: '#fff',
      background: level.color || '#6b7280', marginTop: 8,
    }}>
      {level.label}
    </span>
  )
}
