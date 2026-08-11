function pick(arr) { return arr[Math.floor(Math.random() * arr.length)] }

const SENTENCE_TEMPLATES = [
  (w) => `I ${pick(['like', 'have', 'see', 'need', 'want'])} ${pick(['a', 'an', 'the'])} ${w}.`,
  (w) => `${pick(['This is', 'That is', 'Here is'])} ${pick(['a', 'an', 'the'])} ${w}.`,
  (w) => `${pick(['Can you', 'Please', 'Let me'])} ${w}?`,
  (w) => `I ${pick(['think', 'believe', 'hope'])} ${pick(['it is', 'this is', 'that is'])} ${w}.`,
  (w) => `${pick(['My', 'Your', 'His', 'Her'])} ${w} ${pick(['is nice', 'is big', 'is new', 'is red'])}.`,
]

const DIALOGUE_TEMPLATES = [
  (w, m) => `A: What's this?  B: It's ${pick(['a', 'an'])} ${w}.  A: What does it mean?  B: It means "${m}".`,
  (w, m) => `A: Do you know "${w}"?  B: Yes, it means "${m}" in Chinese.  A: Great!`,
]

export function generateExplanation(wordObj) {
  const article = /^[aeiou]/.test(wordObj.word) ? 'an' : 'a'
  return `"${wordObj.word}" (/${wordObj.phonetic}/) is ${article} English word that means "${wordObj.meaning}" in Chinese.`
}

export function generateSentence(wordObj) {
  const template = pick(SENTENCE_TEMPLATES)
  return template(wordObj.word)
}

export function generateDialogue(wordObj) {
  const template = pick(DIALOGUE_TEMPLATES)
  return template(wordObj.word, wordObj.meaning)
}

export function generateAllReview(wordObj) {
  return {
    explanation: generateExplanation(wordObj),
    sentence: generateSentence(wordObj),
    dialogue: generateDialogue(wordObj),
  }
}
