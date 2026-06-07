// ── Text-To-Speech ──
export function speak(text: string, lang = 'zh-CN', rate = 1.1, pitch = 1.0): Promise<void> {
  return new Promise((resolve) => {
    if (!window.speechSynthesis) {
      console.warn('SpeechSynthesis not supported')
      resolve()
      return
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = lang
    utterance.rate = rate
    utterance.pitch = pitch

    // Try to find a good Chinese voice
    const voices = window.speechSynthesis.getVoices()
    const zhVoice = voices.find(v => v.lang.startsWith('zh') && v.name.includes('Natural'))
      || voices.find(v => v.lang.startsWith('zh'))
      || voices.find(v => v.lang.startsWith('en') && v.name.includes('Female'))
    if (zhVoice) utterance.voice = zhVoice

    utterance.onend = () => resolve()
    utterance.onerror = () => resolve()

    window.speechSynthesis.speak(utterance)

    // Fallback timeout
    setTimeout(resolve, text.length * 80 + 2000)
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
