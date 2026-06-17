// 新人教七年级下册语法 — 8个单元语法闯关

export interface ChallengeOption {
  label: string
  text: string
}

export interface ChallengeQuestion {
  theme: string
  question: string
  options: ChallengeOption[]
  correct: number
  explanation: string
  points: number
}

export interface ChallengeRound {
  id: string
  name: string
  emoji: string
  unitLabel: string
  grade: string
  questions: ChallengeQuestion[]
}

export function mc(q: string, correct: string, opts: string[], points = 10): ChallengeQuestion {
  const allOpts = [correct, ...opts.filter(o => o !== correct)]
  for (let i = allOpts.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[allOpts[i], allOpts[j]] = [allOpts[j], allOpts[i]]
  }
  const correctIdx = allOpts.indexOf(correct)
  const labels = ['A', 'B', 'C', 'D']
  return {
    theme: q,
    question: q.replace('______', '____'),
    options: allOpts.map((text, i) => ({ label: labels[i], text })),
    correct: correctIdx,
    explanation: `正确答案是 "${correct}"`,
    points,
  }
}

const unit1Questions: ChallengeQuestion[] = [
  mc('There are two ______ (wolf) in the zoo.', 'wolves', ['wolf', 'wolfs', 'wolfes'], 10),
  mc('Be ______ (care)! The path near the forest is slippery.', 'careful', ['careless', 'caring', 'care'], 10),
  mc('We mustn\'t swim in the river. It\'s ______ (danger).', 'dangerous', ['danger', 'endangered', 'dangerly'], 10),
  mc('Look! Some ______ are playing games on the playground. (kid)', 'kids', ['kid', 'kides', 'kiding'], 10),
  mc('The story you told is so ______ (scare) that I can\'t sleep.', 'scary', ['scared', 'scaring', 'scareful'], 10),
  mc('My mother loves me and ______ (care) about me so much.', 'cares', ['care', 'caring', 'cared'], 10),
  mc('What animals do you like ______ (well)?', 'best', ['good', 'better', 'well'], 10),
  mc('The Great Wall is ______ (amaze), and I can\'t wait to visit it.', 'amazing', ['amazed', 'amaze', 'amazeful'], 10),
  mc('— Why do you like ______ (they)? — Because they are lovely.', 'them', ['they', 'their', 'theirs'], 10),
  mc('Look! The cat ______ (run) after a mouse.', 'is running', ['runs', 'ran', 'running'], 10),
]

const unit2Questions: ChallengeQuestion[] = [
  mc('You must ______ the school rules.', 'follow', ['follows', 'following', 'followed'], 10),
  mc('______ (not) litter rubbish everywhere.', "Don't", ["Doesn't", "Isn't", "Aren't"], 10),
  mc('We ______ (不得不) wear school uniforms on weekdays.', 'have to', ['has to', 'had to', 'having to'], 10),
  mc('______ you finish your homework, you can watch TV.', 'If', ['When', 'Because', 'Although'], 10),
  mc('Be ______ (polite) to your teachers and classmates.', 'polite', ['politely', 'politing', 'impolite'], 10),
  mc('She is always late ______ class.', 'for', ['to', 'in', 'at'], 10),
  mc('We should show ______ for our elders.', 'respect', ['respectful', 'respecting', 'respected'], 10),
  mc('If it rains tomorrow, we ______ at home.', 'will stay', ['stay', 'stayed', 'are staying'], 10),
  mc('Don\'t ______ (run) in the hallway.', 'run', ['to run', 'running', 'ran'], 10),
  mc('You have to ______ (arrive) on time.', 'arrive', ['arrives', 'arriving', 'arrived'], 10),
]

const unit3Questions: ChallengeQuestion[] = [
  mc('______ do you exercise? — Three times a week.', 'How often', ['How many', 'How long', 'How much'], 10),
  mc('I ______ ever play football. I don\'t like it.', 'hardly', ['hard', 'hardy', 'never'], 10),
  mc('This is not my book. It\'s ______ (她的).', 'hers', ['her', 'she', 'herself'], 10),
  mc('— Whose T-shirt is this? — It belongs ______ Tom.', 'to', ['with', 'for', 'of'], 10),
  mc('I ______ (很少) play computer games.', 'seldom', ['sometimes', 'always', 'often'], 10),
  mc('She practices ______ (play) the piano every day.', 'playing', ['play', 'plays', 'to play'], 10),
  mc('He has made great ______ in English this term.', 'progress', ['progression', 'progressive', 'progressed'], 10),
  mc('Doing exercise is a good way to keep ______.', 'fit', ['fitness', 'fitting', 'fitted'], 10),
  mc('I can\'t find my pen. Maybe it\'s ______ (你的).', 'yours', ['your', 'you', 'yourself'], 10),
  mc('My brother ______ (exercise) every morning.', 'exercises', ['exercise', 'exercising', 'exercised'], 10),
]

const unit4Questions: ChallengeQuestion[] = [
  mc('We need some ______ (tomato) for the salad.', 'tomatoes', ['tomatos', 'tomato', 'tomaties'], 10),
  mc('There isn\'t ______ milk in the fridge.', 'any', ['some', 'many', 'a'], 10),
  mc('She would like ______ (order) a pizza.', 'to order', ['order', 'ordering', 'ordered'], 10),
  mc('Eating too much fast food is bad ______ your health.', 'for', ['to', 'with', 'at'], 10),
  mc('How about ______ (go) to the restaurant?', 'going', ['go', 'goes', 'to go'], 10),
  mc('Would you like ______ (some) water?', 'some', ['any', 'many', 'a'], 10),
  mc('My mother often ______ (cook) dinner for us.', 'cooks', ['cook', 'cooking', 'cooked'], 10),
  mc('Apples are ______ (health) food.', 'healthy', ['health', 'healthful', 'healthily'], 10),
  mc('— What would you like to drink? — ______ orange juice.', 'Some', ['A', 'An', 'Any'], 10),
  mc('I prefer ______ (drink) tea in the morning.', 'to drink', ['drink', 'drinking', 'drinks'], 10),
]

const unit5Questions: ChallengeQuestion[] = [
  mc('______ there a bank near here?', 'Is', ['Are', 'Am', 'Do'], 10),
  mc('The supermarket is ______ from the post office.', 'across', ['cross', 'crossing', 'crossed'], 10),
  mc('Go ______ this street and turn right.', 'along', ['with', 'to', 'on'], 10),
  mc('The hospital is ______ the police station and the library.', 'between', ['among', 'in', 'on'], 10),
  mc('There ______ some books on the desk.', 'are', ['is', 'am', 'be'], 10),
  mc('The bank is ______ (在...后面) the hotel.', 'behind', ['beside', 'between', 'before'], 10),
  mc('Is ______ a park in your neighborhood?', 'there', ['here', 'this', 'that'], 10),
  mc('The restaurant is ______ Center Street.', 'on', ['in', 'at', 'to'], 10),
  mc('The library is next ______ the school.', 'to', ['of', 'in', 'on'], 10),
  mc('The hotel is ______ front of the station.', 'in', ['on', 'at', 'to'], 10),
]

const unit6Questions: ChallengeQuestion[] = [
  mc('It ______ (rain) heavily now.', 'is raining', ['rains', 'rained', 'rain'], 10),
  mc('What ______ the weather like today?', 'is', ['does', 'do', 'are'], 10),
  mc('We usually ______ (stay) in when it snows.', 'stay', ['stayed', 'are staying', 'staying'], 10),
  mc('Look! The children ______ (fly) kites in the park.', 'are flying', ['fly', 'flew', 'flies'], 10),
  mc('______ you doing your homework now?', 'Are', ['Is', 'Do', 'Does'], 10),
  mc('Although the weather is bad, they are still in high ______.', 'spirits', ['spirit', 'spiriting', 'spirited'], 10),
  mc('Don\'t go out. It ______ (snow) heavily.', 'is snowing', ['snows', 'snowed', 'will snow'], 10),
  mc('I feel like ______ (take) a walk after dinner.', 'taking', ['take', 'to take', 'takes'], 10),
  mc('The sun ______ (shine) brightly at the moment.', 'is shining', ['shines', 'shined', 'shone'], 10),
  mc('It\'s cold outside. You should ______ (stay) in.', 'stay', ['staying', 'stays', 'stayed'], 10),
]

const unit7Questions: ChallengeQuestion[] = [
  mc('I ______ (visit) my grandparents yesterday.', 'visited', ['visits', 'visiting', 'will visit'], 10),
  mc('She ______ (go) to the museum last Sunday.', 'went', ['goes', 'going', 'gone'], 10),
  mc('We ______ (have) a wonderful time at the party.', 'had', ['have', 'having', 'has'], 10),
  mc('He ______ (not do) his homework last night.', "didn't do", ["doesn't do", "don't do", "isn't do"], 10),
  mc('______ you see the movie last weekend?', 'Did', ['Do', 'Does', 'Are'], 10),
  mc('They ______ (be) very happy to see each other.', 'were', ['was', 'are', 'is'], 10),
  mc('She ______ (buy) a new dress for the trip.', 'bought', ['buyed', 'buys', 'buy'], 10),
  mc('The children ______ (play) in the park yesterday.', 'played', ['plays', 'playing', 'were playing'], 10),
  mc('My father ______ (teach) me to swim when I was five.', 'taught', ['teachs', 'teached', 'teaching'], 10),
  mc('I ______ (eat) a big breakfast this morning.', 'ate', ['eated', 'eat', 'eaten'], 10),
]

const unit8Questions: ChallengeQuestion[] = [
  mc('Once upon a time, there ______ (be) an old man.', 'was', ['were', 'are', 'is'], 10),
  mc('The hunter ______ (shoot) the wolf and saved the girl.', 'shot', ['shooted', 'shoots', 'shooting'], 10),
  mc('She ______ (tell) me the truth yesterday.', 'told', ['telled', 'tells', 'telling'], 10),
  mc('The little duckling ______ (grow) into a beautiful swan.', 'grew', ['growed', 'grows', 'growing'], 10),
  mc('He decided ______ (go) for a walk in the forest.', 'to go', ['go', 'going', 'went'], 10),
  mc('The fisherman ______ (catch) a golden fish.', 'caught', ['catched', 'catchs', 'catching'], 10),
  mc('She noticed a man ______ (knock) at the door.', 'knocking', ['knocked', 'knocks', 'to knock'], 10),
  mc('The emperor ______ (pretend) to wear new clothes.', 'pretended', ['pretends', 'pretending', 'pretend'], 10),
  mc('— Didn\'t you know the time? — This is a ______ question.', 'negative', ['positive', 'question', 'rhetorical'], 10),
  mc('The swallow ______ (fly) away before winter came.', 'flew', ['flied', 'flyed', 'flies'], 10),
]

export const ROUNDS: ChallengeRound[] = [
  { id: 'unit1', name: 'Unit 1 Animal Friends', emoji: '🐾', unitLabel: 'U1', grade: '7下', questions: unit1Questions },
  { id: 'unit2', name: 'Unit 2 No Rules, No Order', emoji: '📏', unitLabel: 'U2', grade: '7下', questions: unit2Questions },
  { id: 'unit3', name: 'Unit 3 Keep Fit', emoji: '💪', unitLabel: 'U3', grade: '7下', questions: unit3Questions },
  { id: 'unit4', name: 'Unit 4 Eat Well', emoji: '🍎', unitLabel: 'U4', grade: '7下', questions: unit4Questions },
  { id: 'unit5', name: 'Unit 5 Here and Now', emoji: '📍', unitLabel: 'U5', grade: '7下', questions: unit5Questions },
  { id: 'unit6', name: 'Unit 6 Rain or Shine', emoji: '🌤️', unitLabel: 'U6', grade: '7下', questions: unit6Questions },
  { id: 'unit7', name: 'Unit 7 A Day to Remember', emoji: '📅', unitLabel: 'U7', grade: '7下', questions: unit7Questions },
  { id: 'unit8', name: 'Unit 8 Once upon a Time', emoji: '📖', unitLabel: 'U8', grade: '7下', questions: unit8Questions },
]

// ── Progress persistence ──
const STORAGE_KEY = 'textbook-challenge'

export interface Progress {
  completed: string[]
  stars: Record<string, number>
  scores: Record<string, number>
  totalXp: number
  badges: string[]
}

export function loadProgress(): Progress {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
    if (raw && typeof raw === 'object') {
      return {
        completed: Array.isArray(raw.completed) ? raw.completed : [],
        stars: raw.stars && typeof raw.stars === 'object' ? raw.stars : {},
        scores: raw.scores && typeof raw.scores === 'object' ? raw.scores : {},
        totalXp: typeof raw.totalXp === 'number' ? raw.totalXp : 0,
        badges: Array.isArray(raw.badges) ? raw.badges : [],
      }
    }
    return emptyProgress()
  } catch { return emptyProgress() }
}

function emptyProgress(): Progress {
  return { completed: [], stars: {}, scores: {}, totalXp: 0, badges: [] }
}

export function saveProgress(roundId: string, score: number, total: number) {
  const data = loadProgress()
  const pct = Math.round(score / total * 100)
  const stars = pct >= 90 ? 3 : pct >= 70 ? 2 : pct >= 50 ? 1 : 0

  if (!data.completed.includes(roundId)) {
    data.completed.push(roundId)
  }
  data.stars[roundId] = Math.max(data.stars[roundId] || 0, stars)
  data.scores[roundId] = Math.max(data.scores[roundId] || 0, pct)
  data.totalXp += score * 2

  if (data.totalXp >= 500 && !data.badges.includes('⭐')) data.badges.push('⭐')
  if (data.totalXp >= 1000 && !data.badges.includes('🏅')) data.badges.push('🏅')
  if (data.completed.length >= 8 && !data.badges.includes('👑')) data.badges.push('👑')

  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  return stars
}
