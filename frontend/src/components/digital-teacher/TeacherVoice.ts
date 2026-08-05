let _voicesLoaded = false
let _voiceResolve: (() => void) | null = null

function ensureVoices(): Promise<void> {
  if (_voicesLoaded) return Promise.resolve()
  if (window.speechSynthesis.getVoices().length > 0) {
    _voicesLoaded = true
    return Promise.resolve()
  }
  return new Promise((resolve) => {
    _voiceResolve = resolve
    window.speechSynthesis.onvoiceschanged = () => {
      _voicesLoaded = true
      window.speechSynthesis.onvoiceschanged = null
      resolve()
    }
    setTimeout(() => { _voicesLoaded = true; resolve() }, 3000)
  })
}

// Chrome workaround: speechSynthesis sometimes enters a bad state
let _chromeFixInterval: ReturnType<typeof setInterval> | null = null
function chromeSpeechFix() {
  if (_chromeFixInterval) return
  _chromeFixInterval = setInterval(() => {
    if (window.speechSynthesis && window.speechSynthesis.paused) {
      window.speechSynthesis.resume()
    }
  }, 5000)
}

// ── Text-To-Speech ──
export async function speak(text: string, lang = 'zh-CN', rate = 1.1, pitch = 1.0, gender: 'female' | 'male' = 'female'): Promise<void> {
  if (!window.speechSynthesis) {
    console.warn('SpeechSynthesis not supported')
    return
  }

  window.speechSynthesis.cancel()
  await ensureVoices()
  chromeSpeechFix()

  return new Promise((resolve) => {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = lang
    utterance.rate = rate
    utterance.pitch = gender === 'female' ? 1.2 : 0.9

    const voices = window.speechSynthesis.getVoices()
    const zhVoice = voices.find(v => v.lang.startsWith('zh') && (v.name.includes('Natural') || v.name.includes('Xiaoxiao') || v.name.includes('Yunxi')))
      || voices.find(v => v.lang.startsWith('zh') && v.name.includes('Female'))
      || voices.find(v => v.lang.startsWith('zh'))
      || voices.find(v => v.lang.startsWith('en') && v.name.includes(gender === 'female' ? 'Female' : 'Male'))
    if (zhVoice) utterance.voice = zhVoice

    utterance.onend = resolve
    utterance.onerror = resolve
    try { window.speechSynthesis.speak(utterance) } catch { resolve() }
    setTimeout(resolve, text.length * 80 + 3000)
  })
}

// ── Speech-To-Text ──
export function listen(lang = 'zh-CN'): Promise<string> {
  return new Promise((resolve, reject) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      reject(new Error('SpeechRecognition not supported'))
      return
    }

    const rec = new SpeechRecognition()
    rec.lang = lang
    rec.interimResults = false
    rec.continuous = false
    rec.maxAlternatives = 1

    rec.onresult = (e) => { resolve(e.results[0][0].transcript) }
    rec.onerror = (e) => { reject(new Error(`STT error: ${e.error}`)) }
    rec.onend = () => { /* handled by result or error */ }

    rec.start()

    // Timeout
    setTimeout(() => { rec.abort(); reject(new Error('STT timeout')) }, 15000)
  })
}

// ── Check if speech is supported ──
export function isSpeechSupported(): { stt: boolean; tts: boolean } {
  return {
    stt: !!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window),
    tts: 'speechSynthesis' in window,
  }
}
