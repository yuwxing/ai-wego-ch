export interface VerbEntry {
  base: string
  past: string
  pp: string
  meaning: string
  level: number
}

export interface StageData {
  grade: string
  stage: number
  name: string
  verbs: VerbEntry[]
}

export function isFullFormGrade(grade: string) {
  return grade === '八上' || grade === '八下'
}

export function getGameMode(grade: string): 'card' | 'typing' | 'typeStage' {
  if (grade === '七下') return 'card'
  if (grade === '八上') return 'typing'
  return 'typeStage'
}

function splitStages(grade: string, verbs: VerbEntry[], size = 6): StageData[] {
  const stages: StageData[] = []
  const names = ['初阶', '进阶', '挑战', '冲刺', '高手', '达人', '大师', '传奇']
  for (let i = 0; i < verbs.length; i += size) {
    stages.push({
      grade,
      stage: stages.length + 1,
      name: `第${stages.length + 1}关 · ${names[stages.length] || '极限'}`,
      verbs: verbs.slice(i, i + size),
    })
  }
  return stages
}

const G7: VerbEntry[] = [
  { base: 'awake', past: 'awoke', pp: 'awoken', meaning: '醒来', level: 3 },
  { base: 'be (am/is/are)', past: 'was/were', pp: 'been', meaning: '是', level: 1 },
  { base: 'bear', past: 'bore', pp: 'born/borne', meaning: '忍受', level: 2 },
  { base: 'beat', past: 'beat', pp: 'beaten', meaning: '打败', level: 2 },
  { base: 'become', past: 'became', pp: 'become', meaning: '成为', level: 1 },
  { base: 'begin', past: 'began', pp: 'begun', meaning: '开始', level: 1 },
  { base: 'bleed', past: 'bled', pp: 'bled', meaning: '流血', level: 2 },
  { base: 'blow', past: 'blew', pp: 'blown', meaning: '吹', level: 1 },
  { base: 'break', past: 'broke', pp: 'broken', meaning: '打破', level: 1 },
  { base: 'bring', past: 'brought', pp: 'brought', meaning: '带来', level: 2 },
  { base: 'build', past: 'built', pp: 'built', meaning: '建造', level: 2 },
  { base: 'burn', past: 'burnt/burned', pp: 'burnt/burned', meaning: '燃烧', level: 2 },
  { base: 'buy', past: 'bought', pp: 'bought', meaning: '买', level: 1 },
  { base: 'catch', past: 'caught', pp: 'caught', meaning: '抓住', level: 2 },
  { base: 'choose', past: 'chose', pp: 'chosen', meaning: '选择', level: 2 },
  { base: 'come', past: 'came', pp: 'come', meaning: '来', level: 1 },
  { base: 'cost', past: 'cost', pp: 'cost', meaning: '花费(钱)', level: 1 },
  { base: 'cut', past: 'cut', pp: 'cut', meaning: '切', level: 1 },
  { base: 'deal', past: 'dealt', pp: 'dealt', meaning: '处理', level: 2 },
  { base: 'dig', past: 'dug', pp: 'dug', meaning: '挖', level: 2 },
  { base: 'do (does)', past: 'did', pp: 'done', meaning: '做', level: 1 },
  { base: 'draw', past: 'drew', pp: 'drawn', meaning: '画', level: 2 },
  { base: 'dream', past: 'dreamt/dreamed', pp: 'dreamt/dreamed', meaning: '做梦', level: 2 },
  { base: 'drink', past: 'drank', pp: 'drunk', meaning: '喝', level: 1 },
  { base: 'drive', past: 'drove', pp: 'driven', meaning: '驾驶', level: 1 },
  { base: 'eat', past: 'ate', pp: 'eaten', meaning: '吃', level: 1 },
  { base: 'fall', past: 'fell', pp: 'fallen', meaning: '落下', level: 1 },
  { base: 'feed', past: 'fed', pp: 'fed', meaning: '喂养', level: 2 },
  { base: 'feel', past: 'felt', pp: 'felt', meaning: '感觉', level: 1 },
  { base: 'fight', past: 'fought', pp: 'fought', meaning: '战斗', level: 2 },
  { base: 'find', past: 'found', pp: 'found', meaning: '找到', level: 1 },
  { base: 'fly', past: 'flew', pp: 'flown', meaning: '飞', level: 1 },
  { base: 'forget', past: 'forgot', pp: 'forgotten', meaning: '忘记', level: 2 },
  { base: 'freeze', past: 'froze', pp: 'frozen', meaning: '结冰', level: 3 },
  { base: 'get', past: 'got', pp: 'got/gotten', meaning: '得到', level: 1 },
  { base: 'give', past: 'gave', pp: 'given', meaning: '给', level: 1 },
  { base: 'go', past: 'went', pp: 'gone', meaning: '去', level: 1 },
  { base: 'grow', past: 'grew', pp: 'grown', meaning: '成长', level: 1 },
  { base: 'hang（悬挂）', past: 'hung', pp: 'hung', meaning: '悬挂', level: 2 },
  { base: 'have (has)', past: 'had', pp: 'had', meaning: '有', level: 1 },
  { base: 'hear', past: 'heard', pp: 'heard', meaning: '听见', level: 1 },
  { base: 'hide', past: 'hid', pp: 'hidden', meaning: '躲藏', level: 2 },
  { base: 'hit', past: 'hit', pp: 'hit', meaning: '打', level: 1 },
  { base: 'hold', past: 'held', pp: 'held', meaning: '握住', level: 1 },
  { base: 'hurt', past: 'hurt', pp: 'hurt', meaning: '受伤', level: 1 },
  { base: 'keep', past: 'kept', pp: 'kept', meaning: '保持', level: 1 },
  { base: 'know', past: 'knew', pp: 'known', meaning: '知道', level: 1 },
  { base: 'lay', past: 'laid', pp: 'laid', meaning: '放置', level: 2 },
  { base: 'lead', past: 'led', pp: 'led', meaning: '带领', level: 2 },
  { base: 'learn', past: 'learnt/learned', pp: 'learnt/learned', meaning: '学习', level: 1 },
  { base: 'leave', past: 'left', pp: 'left', meaning: '离开', level: 1 },
  { base: 'lend', past: 'lent', pp: 'lent', meaning: '借出', level: 2 },
  { base: 'let', past: 'let', pp: 'let', meaning: '让', level: 1 },
  { base: 'lie（躺）', past: 'lay', pp: 'lain', meaning: '躺', level: 3 },
  { base: 'light', past: 'lit/lighted', pp: 'lit/lighted', meaning: '点亮', level: 2 },
  { base: 'lose', past: 'lost', pp: 'lost', meaning: '失去', level: 1 },
  { base: 'make', past: 'made', pp: 'made', meaning: '制作', level: 1 },
  { base: 'mean', past: 'meant', pp: 'meant', meaning: '意思是', level: 1 },
  { base: 'meet', past: 'met', pp: 'met', meaning: '遇见', level: 1 },
  { base: 'mistake', past: 'mistook', pp: 'mistaken', meaning: '误解', level: 3 },
  { base: 'pay', past: 'paid', pp: 'paid', meaning: '支付', level: 1 },
  { base: 'put', past: 'put', pp: 'put', meaning: '放', level: 1 },
  { base: 'read', past: 'read', pp: 'read', meaning: '阅读', level: 1 },
  { base: 'ride', past: 'rode', pp: 'ridden', meaning: '骑', level: 2 },
  { base: 'ring', past: 'rang', pp: 'rung', meaning: '响', level: 2 },
  { base: 'rise', past: 'rose', pp: 'risen', meaning: '上升', level: 2 },
  { base: 'run', past: 'ran', pp: 'run', meaning: '跑', level: 1 },
  { base: 'say', past: 'said', pp: 'said', meaning: '说', level: 1 },
  { base: 'see', past: 'saw', pp: 'seen', meaning: '看见', level: 1 },
  { base: 'sell', past: 'sold', pp: 'sold', meaning: '卖', level: 1 },
  { base: 'send', past: 'sent', pp: 'sent', meaning: '发送', level: 1 },
  { base: 'set', past: 'set', pp: 'set', meaning: '设置', level: 1 },
  { base: 'shake', past: 'shook', pp: 'shaken', meaning: '摇动', level: 2 },
  { base: 'shine', past: 'shone', pp: 'shone', meaning: '照耀', level: 2 },
  { base: 'shoot', past: 'shot', pp: 'shot', meaning: '射击', level: 2 },
  { base: 'shut', past: 'shut', pp: 'shut', meaning: '关闭', level: 1 },
  { base: 'sing', past: 'sang', pp: 'sung', meaning: '唱歌', level: 1 },
  { base: 'sit', past: 'sat', pp: 'sat', meaning: '坐', level: 1 },
  { base: 'sleep', past: 'slept', pp: 'slept', meaning: '睡觉', level: 1 },
  { base: 'smell', past: 'smelt/smelled', pp: 'smelt/smelled', meaning: '闻', level: 2 },
  { base: 'speak', past: 'spoke', pp: 'spoken', meaning: '说', level: 1 },
  { base: 'speed', past: 'sped/speeded', pp: 'sped/speeded', meaning: '加速', level: 2 },
  { base: 'spell', past: 'spelt/spelled', pp: 'spelt/spelled', meaning: '拼写', level: 2 },
  { base: 'spend', past: 'spent', pp: 'spent', meaning: '花费', level: 1 },
  { base: 'spread', past: 'spread', pp: 'spread', meaning: '传播', level: 2 },
  { base: 'stand', past: 'stood', pp: 'stood', meaning: '站', level: 1 },
  { base: 'steal', past: 'stole', pp: 'stolen', meaning: '偷', level: 2 },
  { base: 'stick', past: 'stuck', pp: 'stuck', meaning: '粘住', level: 2 },
  { base: 'sweep', past: 'swept', pp: 'swept', meaning: '打扫', level: 2 },
  { base: 'swim', past: 'swam', pp: 'swum', meaning: '游泳', level: 1 },
  { base: 'take', past: 'took', pp: 'taken', meaning: '拿', level: 1 },
  { base: 'teach', past: 'taught', pp: 'taught', meaning: '教', level: 1 },
  { base: 'tell', past: 'told', pp: 'told', meaning: '告诉', level: 1 },
  { base: 'think', past: 'thought', pp: 'thought', meaning: '想', level: 1 },
  { base: 'throw', past: 'threw', pp: 'thrown', meaning: '扔', level: 1 },
  { base: 'understand', past: 'understood', pp: 'understood', meaning: '理解', level: 2 },
  { base: 'wake', past: 'woke', pp: 'woken', meaning: '醒来', level: 2 },
  { base: 'wear', past: 'wore', pp: 'worn', meaning: '穿', level: 1 },
  { base: 'win', past: 'won', pp: 'won', meaning: '赢', level: 1 },
  { base: 'write', past: 'wrote', pp: 'written', meaning: '写', level: 1 },
]

const G8U: VerbEntry[] = G7.map(v => ({ ...v }))

const G8D: VerbEntry[] = [
  { base: 'cost', past: 'cost', pp: 'cost', meaning: '花费；值', level: 1 },
  { base: 'cut', past: 'cut', pp: 'cut', meaning: '切；割', level: 1 },
  { base: 'hit', past: 'hit', pp: 'hit', meaning: '打；撞击', level: 1 },
  { base: 'hurt', past: 'hurt', pp: 'hurt', meaning: '伤害；疼痛', level: 1 },
  { base: 'let', past: 'let', pp: 'let', meaning: '让；允许', level: 1 },
  { base: 'put', past: 'put', pp: 'put', meaning: '放', level: 1 },
  { base: 'set', past: 'set', pp: 'set', meaning: '设置；安置', level: 1 },
  { base: 'shut', past: 'shut', pp: 'shut', meaning: '关闭', level: 1 },
  { base: 'spread', past: 'spread', pp: 'spread', meaning: '传播；展开', level: 2 },
  { base: 'become', past: 'became', pp: 'become', meaning: '变成；成为', level: 1 },
  { base: 'come', past: 'came', pp: 'come', meaning: '来', level: 1 },
  { base: 'run', past: 'ran', pp: 'run', meaning: '跑；运行', level: 1 },
  { base: 'beat', past: 'beat', pp: 'beaten', meaning: '打败；敲打', level: 2 },
  { base: 'bring', past: 'brought', pp: 'brought', meaning: '带来', level: 2 },
  { base: 'build', past: 'built', pp: 'built', meaning: '建造', level: 2 },
  { base: 'burn', past: 'burnt/burned', pp: 'burnt/burned', meaning: '燃烧', level: 2 },
  { base: 'buy', past: 'bought', pp: 'bought', meaning: '买', level: 1 },
  { base: 'catch', past: 'caught', pp: 'caught', meaning: '抓住；接住', level: 2 },
  { base: 'dig', past: 'dug', pp: 'dug', meaning: '挖', level: 2 },
  { base: 'dream', past: 'dreamt/dreamed', pp: 'dreamt/dreamed', meaning: '做梦；梦想', level: 2 },
  { base: 'feed', past: 'fed', pp: 'fed', meaning: '喂养', level: 2 },
  { base: 'feel', past: 'felt', pp: 'felt', meaning: '感觉', level: 1 },
  { base: 'fight', past: 'fought', pp: 'fought', meaning: '战斗；打架', level: 2 },
  { base: 'find', past: 'found', pp: 'found', meaning: '找到', level: 1 },
  { base: 'get', past: 'got', pp: 'got/gotten', meaning: '得到', level: 1 },
  { base: 'hang (悬挂)', past: 'hung', pp: 'hung', meaning: '悬挂；吊', level: 2 },
  { base: 'have (has)', past: 'had', pp: 'had', meaning: '有', level: 1 },
  { base: 'hear', past: 'heard', pp: 'heard', meaning: '听见', level: 1 },
  { base: 'hold', past: 'held', pp: 'held', meaning: '握住；举行', level: 1 },
  { base: 'keep', past: 'kept', pp: 'kept', meaning: '保持', level: 1 },
  { base: 'lay', past: 'laid', pp: 'laid', meaning: '放置；下蛋', level: 2 },
  { base: 'lead', past: 'led', pp: 'led', meaning: '带领；导致', level: 2 },
  { base: 'learn', past: 'learnt/learned', pp: 'learnt/learned', meaning: '学习', level: 1 },
  { base: 'leave', past: 'left', pp: 'left', meaning: '离开；留下', level: 1 },
  { base: 'lend', past: 'lent', pp: 'lent', meaning: '借出', level: 2 },
  { base: 'light', past: 'lit/lighted', pp: 'lit/lighted', meaning: '点亮；点燃', level: 2 },
  { base: 'lose', past: 'lost', pp: 'lost', meaning: '失去；输', level: 1 },
  { base: 'make', past: 'made', pp: 'made', meaning: '制作；使', level: 1 },
  { base: 'mean', past: 'meant', pp: 'meant', meaning: '意思是；意味着', level: 1 },
  { base: 'meet', past: 'met', pp: 'met', meaning: '遇见；会面', level: 1 },
  { base: 'pay', past: 'paid', pp: 'paid', meaning: '支付', level: 1 },
  { base: 'read /riːd/', past: 'read /red/', pp: 'read /red/', meaning: '阅读', level: 1 },
  { base: 'say', past: 'said', pp: 'said', meaning: '说', level: 1 },
  { base: 'sell', past: 'sold', pp: 'sold', meaning: '卖', level: 1 },
  { base: 'send', past: 'sent', pp: 'sent', meaning: '发送；派遣', level: 1 },
  { base: 'shine', past: 'shone', pp: 'shone', meaning: '照耀；发光', level: 2 },
  { base: 'sit', past: 'sat', pp: 'sat', meaning: '坐', level: 1 },
  { base: 'sleep', past: 'slept', pp: 'slept', meaning: '睡觉', level: 1 },
  { base: 'smell', past: 'smelt/smelled', pp: 'smelt/smelled', meaning: '闻；嗅', level: 2 },
  { base: 'speed', past: 'sped/speeded', pp: 'sped/speeded', meaning: '加速', level: 2 },
  { base: 'spell', past: 'spelt/spelled', pp: 'spelt/spelled', meaning: '拼写', level: 2 },
  { base: 'spend', past: 'spent', pp: 'spent', meaning: '花费（时间/钱）', level: 1 },
  { base: 'stand', past: 'stood', pp: 'stood', meaning: '站；忍受', level: 1 },
  { base: 'stick', past: 'stuck', pp: 'stuck', meaning: '粘住；坚持', level: 2 },
  { base: 'teach', past: 'taught', pp: 'taught', meaning: '教', level: 1 },
  { base: 'tell', past: 'told', pp: 'told', meaning: '告诉', level: 1 },
  { base: 'think', past: 'thought', pp: 'thought', meaning: '想；认为', level: 1 },
  { base: 'understand', past: 'understood', pp: 'understood', meaning: '理解', level: 2 },
  { base: 'win', past: 'won', pp: 'won', meaning: '赢', level: 1 },
  { base: 'blow', past: 'blew', pp: 'blown', meaning: '吹', level: 1 },
  { base: 'draw', past: 'drew', pp: 'drawn', meaning: '画；拉', level: 2 },
  { base: 'drive', past: 'drove', pp: 'driven', meaning: '驾驶；驱赶', level: 1 },
  { base: 'eat', past: 'ate', pp: 'eaten', meaning: '吃', level: 1 },
  { base: 'fall', past: 'fell', pp: 'fallen', meaning: '落下；跌倒', level: 1 },
  { base: 'fly', past: 'flew', pp: 'flown', meaning: '飞', level: 1 },
  { base: 'forget', past: 'forgot', pp: 'forgotten', meaning: '忘记', level: 2 },
  { base: 'give', past: 'gave', pp: 'given', meaning: '给', level: 1 },
  { base: 'go', past: 'went', pp: 'gone', meaning: '去', level: 1 },
  { base: 'grow', past: 'grew', pp: 'grown', meaning: '成长；种植', level: 1 },
  { base: 'hide', past: 'hid', pp: 'hidden', meaning: '躲藏', level: 2 },
  { base: 'know', past: 'knew', pp: 'known', meaning: '知道', level: 1 },
  { base: 'lie (躺)', past: 'lay', pp: 'lain', meaning: '躺；位于', level: 3 },
  { base: 'ride', past: 'rode', pp: 'ridden', meaning: '骑', level: 2 },
  { base: 'ring', past: 'rang', pp: 'rung', meaning: '响；打电话', level: 2 },
  { base: 'rise', past: 'rose', pp: 'risen', meaning: '上升；升起', level: 2 },
  { base: 'see', past: 'saw', pp: 'seen', meaning: '看见', level: 1 },
  { base: 'shake', past: 'shook', pp: 'shaken', meaning: '摇动；握手', level: 2 },
  { base: 'show', past: 'showed', pp: 'shown', meaning: '展示', level: 1 },
  { base: 'sing', past: 'sang', pp: 'sung', meaning: '唱歌', level: 1 },
  { base: 'speak', past: 'spoke', pp: 'spoken', meaning: '说（语言）', level: 1 },
  { base: 'steal', past: 'stole', pp: 'stolen', meaning: '偷', level: 2 },
  { base: 'swim', past: 'swam', pp: 'swum', meaning: '游泳', level: 1 },
  { base: 'take', past: 'took', pp: 'taken', meaning: '拿；花费（时间）', level: 1 },
  { base: 'throw', past: 'threw', pp: 'thrown', meaning: '扔', level: 1 },
  { base: 'wake', past: 'woke', pp: 'woken', meaning: '醒来', level: 2 },
  { base: 'wear', past: 'wore', pp: 'worn', meaning: '穿', level: 1 },
  { base: 'write', past: 'wrote', pp: 'written', meaning: '写', level: 1 },
  { base: 'be (am, is, are)', past: 'was, were', pp: 'been', meaning: '是', level: 1 },
  { base: 'bear', past: 'bore', pp: 'born/borne', meaning: '承受；生（孩子）', level: 2 },
  { base: 'begin', past: 'began', pp: 'begun', meaning: '开始', level: 1 },
  { base: 'break', past: 'broke', pp: 'broken', meaning: '打破；折断', level: 1 },
  { base: 'choose', past: 'chose', pp: 'chosen', meaning: '选择', level: 2 },
  { base: 'do (does)', past: 'did', pp: 'done', meaning: '做', level: 1 },
  { base: 'drink', past: 'drank', pp: 'drunk', meaning: '喝', level: 1 },
  { base: 'mistake', past: 'mistook', pp: 'mistaken', meaning: '弄错；误解', level: 3 },
]

export const GRADE_VERBS: Record<string, VerbEntry[]> = {
  '七下': G7,
  '八上': G8U,
  '八下': G8D,
}

export function getStages(grade: string): StageData[] {
  const verbs = GRADE_VERBS[grade]
  if (!verbs) return []
  const stages = splitStages(grade, verbs)
  stages.push({
    grade,
    stage: stages.length + 1,
    name: `第${stages.length + 1}关 · 总复习`,
    verbs: [...verbs],
  })
  stages.push({
    grade,
    stage: stages.length + 1,
    name: `第${stages.length + 1}关 · 终极默写`,
    verbs: [...verbs],
  })
  return stages
}
