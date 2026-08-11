export function speak(word, lang = 'en') {
  if (!window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(word)
  u.lang = lang
  u.rate = 0.85
  window.speechSynthesis.speak(u)
}
