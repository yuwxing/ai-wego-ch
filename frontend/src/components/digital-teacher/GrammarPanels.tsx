import { Html } from '@react-three/drei'
import GRAMMAR_MODULES from './grammarData'

const RADIUS = 2.8
const BASE_Y = 1.2

export default function GrammarPanels() {
  return (
    <group>
      {GRAMMAR_MODULES.map((module, i) => {
        const angle = (i / GRAMMAR_MODULES.length) * Math.PI * 2
        const x = Math.sin(angle) * RADIUS
        const z = Math.cos(angle) * RADIUS
        return (
          <group key={module.id} position={[x, BASE_Y, z]} rotation={[0, -angle, 0]}>
            <mesh position={[0, 0.6, 0]} castShadow>
              <boxGeometry args={[4, 2.4, 0.08]} />
              <meshStandardMaterial color="#1a1a2e" roughness={0.8} metalness={0.1} />
            </mesh>
            <mesh position={[0, 0.6, 0.005]}>
              <planeGeometry args={[3.8, 2.2]} />
              <meshBasicMaterial color="#0a0a18" transparent opacity={0.9} />
            </mesh>
            <Html
              position={[-1.7, 1.35, 0.015]}
              style={{ width: '360px', pointerEvents: 'none', userSelect: 'none' }}
              center={false}
              distanceFactor={2.5}
            >
              <div style={{
                color: module.color, fontSize: '18px', fontWeight: 700,
                marginBottom: '4px', textShadow: '0 0 8px rgba(0,0,0,0.9)',
                fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif',
              }}>{module.title}</div>
              <div style={{
                color: '#cbd5e1', fontSize: '13px', lineHeight: '1.6',
                textShadow: '0 0 6px rgba(0,0,0,0.8)',
                fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif',
                whiteSpace: 'pre-wrap',
              }}>
                {module.details.slice(0, 2).join('\n')}
              </div>
            </Html>
          </group>
        )
      })}
    </group>
  )
}
