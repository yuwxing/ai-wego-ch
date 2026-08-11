export default function AudioPlayer({ onPlay, size = 32 }) {
  return (
    <button
      onClick={onPlay}
      title="听发音"
      style={{
        width: size, height: size, borderRadius: '50%',
        border: '1px solid #d1d5db', background: '#f9fafb',
        cursor: 'pointer', display: 'inline-flex', alignItems: 'center',
        justifyContent: 'center', fontSize: size * 0.5, color: '#4b5563',
        lineHeight: 1,
      }}
    >
      🔊
    </button>
  )
}
