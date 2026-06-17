import React from 'react'
import type { RobotStage } from './survivalGameData'

interface Props {
  stage: RobotStage
  mental: number
  baldness: number
  shake?: boolean
}

export default function SurvivalRobot({ stage, mental, baldness, shake }: Props) {
  const a = stage.appearance
  const eyeY = 48
  const faceW = 60

  const bodyGrad = `linear-gradient(135deg, ${a.shellColor}, ${adjustColor(a.shellColor, -30)})`
  const anim = shake ? 'shake 0.1s infinite' : 'none'

  return (
    <svg viewBox="0 0 200 280" style={{ width: '100%', maxWidth: 240, filter: mental < 30 ? 'grayscale(0.4)' : 'none', animation: anim }}>
      <defs>
        <style>{`
          @keyframes shake { 0%,100% { transform: translateX(0) } 25% { transform: translateX(-1px) } 75% { transform: translateX(1px) } }
          @keyframes blink { 0%,95%,100% { ry: 7 } 96%,99% { ry: 1 } }
          @keyframes emit { 0%,100% { opacity: 0.3 } 50% { opacity: 1 } }
        `}</style>
      </defs>

      {/* Body */}
      <rect x={70} y={90} width={60} height={100} rx={16} fill={bodyGrad} stroke="#333" strokeWidth={1.5} transform={`rotate(${a.armSlump || 0}, 100, 140)`} />

      {/* Head */}
      <g>
        <rect x={60} y={16} width={80} height={64} rx={20} fill={bodyGrad} stroke="#333" strokeWidth={1.5} />

        {/* Hat */}
        {a.hasHat && (
          <>
            {stage.id === 'zhijiao' ? (
              <polygon points="80,16 100,0 120,16" fill="#c8a050" stroke="#333" strokeWidth={1} />
            ) : (
              <rect x={68} y={4} width={64} height={14} rx={4} fill="#c0392b" stroke="#333" strokeWidth={1} />
            )}
            <rect x={85} y={0} width={30} height={6} rx={2} fill="#c0392b" stroke="#333" strokeWidth={1} />
          </>
        )}

        {/* Face plate */}
        <rect x={70} y={28} width={60} height={40} rx={8} fill="#e8e0d8" stroke="#999" strokeWidth={1} />

        {/* Eyes */}
        {a.eyeStyle === 'bright' && (
          <>
            <ellipse cx={86} cy={eyeY} rx={8} ry={7} fill="white" stroke="#555" strokeWidth={1} />
            <circle cx={86} cy={eyeY} r={4} fill="#2c3e50" />
            <circle cx={84} cy={eyeY - 2} r={1.5} fill="white" />
            <ellipse cx={114} cy={eyeY} rx={8} ry={7} fill="white" stroke="#555" strokeWidth={1} />
            <circle cx={114} cy={eyeY} r={4} fill="#2c3e50" />
            <circle cx={112} cy={eyeY - 2} r={1.5} fill="white" />
          </>
        )}
        {a.eyeStyle === 'cracked' && (
          <>
            <ellipse cx={86} cy={eyeY} rx={8} ry={7} fill="#f0e8d8" stroke="#555" strokeWidth={1} />
            <circle cx={86} cy={eyeY} r={4} fill="#8b6914" />
            <line x1={80} y1={eyeY - 5} x2={83} y2={eyeY - 2} stroke="#555" strokeWidth={0.8} />
            <ellipse cx={114} cy={eyeY} rx={8} ry={7} fill="#f0e8d8" stroke="#555" strokeWidth={1} />
            <circle cx={114} cy={eyeY} r={4} fill="#8b6914" />
            <line x1={108} y1={eyeY + 3} x2={112} y2={eyeY + 5} stroke="#555" strokeWidth={0.8} />
          </>
        )}
        {a.eyeStyle === 'bloodshot' && (
          <>
            <ellipse cx={86} cy={eyeY} rx={8} ry={7} fill="#f5e0d0" stroke="#555" strokeWidth={1} />
            <circle cx={86} cy={eyeY} r={4} fill="#c0392b" />
            <line x1={79} y1={eyeY - 4} x2={83} y2={eyeY - 1} stroke="#e74c3c" strokeWidth={0.6} />
            <line x1={77} y1={eyeY - 1} x2={82} y2={eyeY} stroke="#e74c3c" strokeWidth={0.6} />
            <ellipse cx={114} cy={eyeY} rx={8} ry={7} fill="#f5e0d0" stroke="#555" strokeWidth={1} />
            <circle cx={114} cy={eyeY} r={4} fill="#c0392b" />
            <line x1={121} y1={eyeY - 4} x2={117} y2={eyeY - 1} stroke="#e74c3c" strokeWidth={0.6} />
            <line x1={123} y1={eyeY - 1} x2={118} y2={eyeY} stroke="#e74c3c" strokeWidth={0.6} />
          </>
        )}
        {a.eyeStyle === 'smoking' && (
          <>
            <ellipse cx={86} cy={eyeY} rx={8} ry={7} fill="#f0e0d0" stroke="#555" strokeWidth={1} />
            <circle cx={86} cy={eyeY} r={4} fill="#2c3e50" />
            <ellipse cx={114} cy={eyeY} rx={8} ry={7} fill="#f0e0d0" stroke="#555" strokeWidth={1} />
            <circle cx={114} cy={eyeY} r={4} fill="#e74c3c" />
            <circle cx={116} cy={eyeY} r={6} fill="#e74c3c" opacity={0.3} />
            <circle cx={118} cy={eyeY - 2} r={4} fill="#e74c3c" opacity={0.2} />
            <line x1={118} y1={eyeY - 2} x2={126} y2={eyeY - 6} stroke="#e74c3c" strokeWidth={1.5} opacity={0.4} />
          </>
        )}

        {/* Bags under eyes */}
        {[...Array(a.bagsUnderEyes)].map((_, i) => (
          <ellipse key={i} cx={86} cy={eyeY + 10 + i * 3} rx={10} ry={3} fill="#8b6914" opacity={0.15 + i * 0.1} />
        ))}
        {[...Array(a.bagsUnderEyes)].map((_, i) => (
          <ellipse key={i + 10} cx={114} cy={eyeY + 10 + i * 3} rx={10} ry={3} fill="#8b6914" opacity={0.15 + i * 0.1} />
        ))}

        {/* Mouth */}
        {stage.id !== 'juanwang' ? (
          <path d={`M ${100 - faceW / 4} ${eyeY + 18} Q 100 ${eyeY + 24} ${100 + faceW / 4} ${eyeY + 18}`} fill="none" stroke="#555" strokeWidth={1.5} strokeLinecap="round" />
        ) : (
          <path d={`M ${100 - faceW / 4} ${eyeY + 18} Q 100 ${eyeY + 22} ${100 + faceW / 4} ${eyeY + 18}`} fill="none" stroke="#555" strokeWidth={1.5} strokeLinecap="round" />
        )}

        {/* Scratches */}
        {[...Array(a.scratches)].map((_, i) => {
          const x = 65 + Math.random() * 20
          const y = 20 + Math.random() * 30
          return <line key={`s${i}`} x1={x} y1={y} x2={x + 3 + Math.random() * 5} y2={y + 1 + Math.random() * 4} stroke="#666" strokeWidth={0.6} opacity={0.5} />
        })}
      </g>

      {/* Baldness indicator */}
      {a.isBald && (
        <g>
          <rect x={75} y={10} width={50} height={10} rx={3} fill="#5a4a3a" stroke="#333" strokeWidth={0.5} />
          <rect x={85} y={11} width={30} height={3} rx={1} fill="#e8c050" opacity={0.6} />
          <circle cx={100} cy={14} r={3} fill="#e74c3c" opacity={0.5}>
            <animate attributeName="opacity" values="0.3;0.6;0.3" dur="0.5s" repeatCount="indefinite" />
          </circle>
        </g>
      )}

      {/* Badges / labels */}
      {[...Array(Math.min(a.badgeCount, 4))].map((_, i) => (
        <rect key={`b${i}`} x={134} y={100 + i * 22} width={44} height={16} rx={3} fill="#e74c3c" stroke="#333" strokeWidth={0.5} />
      ))}

      {/* Arms */}
      <rect x={54} y={100} width={16} height={50} rx={8} fill={bodyGrad} stroke="#333" strokeWidth={1.5} transform={`rotate(${(a.armSlump || 0) + 10}, 62, 100)`} />
      <rect x={130} y={100} width={16} height={50} rx={8} fill={bodyGrad} stroke="#333" strokeWidth={1.5} transform={`rotate(${-(a.armSlump || 0) - 10}, 138, 100)`} />

      {/* Legs */}
      <rect x={80} y={190} width={16} height={30} rx={6} fill={bodyGrad} stroke="#333" strokeWidth={1.5} />
      <rect x={104} y={190} width={16} height={30} rx={6} fill={bodyGrad} stroke="#333" strokeWidth={1.5} />

      {/* 99+ bubble on head */}
      {stage.id === 'banzhuren' && (
        <g>
          <rect x={140} y={-4} width={44} height={20} rx={10} fill="#e74c3c" stroke="#333" strokeWidth={1} />
          <text x={162} y={10} textAnchor="middle" fill="white" fontSize={10} fontWeight="bold">99+</text>
          <circle cx={140} cy={16} r={4} fill="#e74c3c" stroke="#333" strokeWidth={0.5} />
          <circle cx={136} cy={22} r={2.5} fill="#e74c3c" stroke="#333" strokeWidth={0.5} />
        </g>
      )}

      {/* Certificates stack (juanwang) */}
      {stage.id === 'juanwang' && (
        <g>
          {[...Array(3)].map((_, i) => (
            <rect key={`c${i}`} x={70 + i * 2} y={4 - i * 3} width={60} height={14} rx={1} fill="#f5e8c8" stroke="#c8a050" strokeWidth={0.5} />
          ))}
          <text x={100} y={8} textAnchor="middle" fill="#8b6914" fontSize={6}>荣誉证书</text>
        </g>
      )}

      {/* Smoke from top (juanwang) */}
      {a.smoking && (
        <g>
          <circle cx={92} cy={6} r={4} fill="#aaa" opacity={0.3}>
            <animate attributeName="cy" values="6;-8" dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.3;0" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx={108} cy={4} r={5} fill="#aaa" opacity={0.25}>
            <animate attributeName="cy" values="4;-10" dur="2.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.25;0" dur="2.5s" repeatCount="indefinite" />
          </circle>
        </g>
      )}
    </svg>
  )
}

function adjustColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.max(0, Math.min(255, ((num >> 16) & 0xff) + amount))
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0xff) + amount))
  const b = Math.max(0, Math.min(255, (num & 0xff) + amount))
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}
