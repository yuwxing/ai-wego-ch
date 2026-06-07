import * as THREE from 'three'

// ── States ──
export type AnimState = 'idle' | 'walk' | 'run' | 'talk' | 'think' | 'teach' | 'wave' | 'point' | 'jump' | 'dance'

// Map our states to available animation clips in the model
const STATE_TO_CLIP: Record<AnimState, string> = {
  idle: 'Idle',
  walk: 'Walking',
  run: 'Running',
  talk: 'Idle',     // fallback — we add procedural talk on top
  think: 'Idle',    // fallback — we add procedural think
  teach: 'Point',
  wave: 'Wave',
  point: 'Point',
  jump: 'Jump',
  dance: 'Dance',
}

interface Transition {
  from: AnimState[]
  to: AnimState
  duration: number
}

const TRANSITIONS: Transition[] = [
  { from: ['idle', 'talk', 'think'], to: 'walk', duration: 0.25 },
  { from: ['walk', 'run', 'talk', 'think'], to: 'idle', duration: 0.25 },
  { from: ['idle', 'walk'], to: 'run', duration: 0.4 },
  { from: ['run'], to: 'walk', duration: 0.3 },
  { from: ['idle', 'walk', 'talk'], to: 'teach', duration: 0.2 },
  { from: ['idle'], to: 'talk', duration: 0.3 },
  { from: ['idle'], to: 'think', duration: 0.3 },
  { from: ['idle'], to: 'wave', duration: 0.15 },
  { from: ['idle'], to: 'point', duration: 0.15 },
  { from: ['idle', 'walk'], to: 'jump', duration: 0.1 },
  { from: ['idle', 'walk'], to: 'dance', duration: 0.3 },
  { from: ['dance'], to: 'idle', duration: 0.3 },
  { from: ['wave', 'point', 'teach'], to: 'idle', duration: 0.2 },
  { from: ['jump'], to: 'idle', duration: 0.15 },
]

// ── Animation Controller ──
export class AnimationController {
  private mixer: THREE.AnimationMixer
  private actions = new Map<string, THREE.AnimationAction>()
  private currentState: AnimState = 'idle'
  private currentAction: THREE.AnimationAction | null = null
  private crossfading = false
  private listeners: Array<(state: AnimState) => void> = []

  // Procedural modifiers
  private breathPhase = 0
  private blinkTimer = 0
  private blinkState = 0  // 0=open, 1=closing, 2=opening

  constructor(mixer: THREE.AnimationMixer, clips: THREE.AnimationClip[]) {
    this.mixer = mixer
    for (const clip of clips) {
      const action = mixer.clipAction(clip)
      this.actions.set(clip.name, action)
    }
  }

  get state() { return this.currentState }

  onStateChange(fn: (state: AnimState) => void) {
    this.listeners.push(fn)
    return () => { this.listeners = this.listeners.filter(l => l !== fn) }
  }

  play(state: AnimState, fadeIn = 0.25) {
    if (state === this.currentState && this.currentAction?.isRunning()) return

    // Check transition validity
    const valid = TRANSITIONS.some(t =>
      t.to === state && t.from.includes(this.currentState)
    )
    if (!valid && this.currentState !== state) {
      // Force through with longer crossfade
      fadeIn = 0.4
    }

    const clipName = STATE_TO_CLIP[state]
    const nextAction = this.actions.get(clipName)
    if (!nextAction) return

    const prev = this.currentAction
    if (prev && prev !== nextAction) {
      prev.fadeOut(fadeIn)
    }

    nextAction.reset()
    nextAction.setEffectiveTimeScale(1)
    nextAction.fadeIn(fadeIn)
    nextAction.play()

    this.currentAction = nextAction
    this.currentState = state
    this.crossfading = true

    // Reset crossfade flag after duration
    setTimeout(() => { this.crossfading = false }, fadeIn * 1000)

    this.listeners.forEach(fn => fn(state))
  }

  setSpeed(speed: number) {
    this.currentAction?.setEffectiveTimeScale(speed)
  }

  // ── Procedural Breathing (additive to idle/talk/think) ──
  updateBreath(delta: number) {
    this.breathPhase += delta * 1.8
    const breathe = Math.sin(this.breathPhase) * 0.003
    // Apply via mixer's internal node (can't directly modify bones here)
    return breathe
  }

  // ── Procedural Blinking ──
  updateBlink(delta: number, setExpression?: (name: string, weight: number) => void) {
    this.blinkTimer += delta
    if (this.blinkState === 0 && this.blinkTimer > 2.5 + Math.random() * 4) {
      this.blinkState = 1
      this.blinkTimer = 0
    }
    if (this.blinkState === 1) {
      const t = this.blinkTimer / 0.08
      setExpression?.('Blink', Math.min(t, 1))
      if (t >= 1) { this.blinkState = 2; this.blinkTimer = 0 }
    }
    if (this.blinkState === 2) {
      const t = this.blinkTimer / 0.08
      setExpression?.('Blink', Math.max(1 - t, 0))
      if (t >= 1) { this.blinkState = 0; this.blinkTimer = 0 }
    }
  }

  // ── Viseme sync for talk ──
  private visemePhase = 0
  updateViseme(delta: number, setViseme?: (viseme: string, w: number) => void) {
    if (this.currentState !== 'talk') return
    this.visemePhase += delta * 5
    const v = Math.abs(Math.sin(this.visemePhase))
    // Alternate between visemes for natural look
    const idx = Math.floor(this.visemePhase / Math.PI) % 6
    const visemes = ['AA', 'EE', 'IH', 'OH', 'OU', 'SS']
    const weight = Math.min(v * 1.2, 1)
    setViseme?.(visemes[idx], weight)
  }

  update(delta: number) {
    this.mixer.update(delta)
  }

  dispose() {
    this.mixer.stopAllAction()
  }
}
