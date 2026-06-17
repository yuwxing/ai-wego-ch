export interface Student {
  id: number
  name: string
  personality: string
  scores: { english: number; math: number; chinese: number }
  popularity: string
  family: string
  dream: string
  status: string
  recent: string
  gender: '男' | '女'
  history: { year: string; text: string }[]
  finalOutcome?: string
}

export interface GameState {
  day: number
  date: string
  month: number
  year: number
  phase: 'first' | 'daily' | 'event' | 'milestone' | 'graduation'
  currentEvent: GameEvent | null
  selectedStudent: Student | null
  showSeating: boolean
  growth: { responsibility: number; courage: number; integrity: number; empathy: number }
  milestones: string[]
  logs: string[]
}

export interface GameEvent {
  id: number
  title: string
  desc: string
  choices: { label: string; effect: Partial<Record<string, number>>; text: string }[]
}

const SURNAMES = ['王', '李', '张', '刘', '陈', '杨', '赵', '黄', '周', '吴', '徐', '孙', '胡', '朱', '高', '林', '何', '郭', '马', '罗']
const GIVEN_M = ['浩', '伟', '明', '强', '军', '磊', '杰', '涛', '鑫', '宇', '飞', '鹏', '超', '文', '博', '勇', '成', '华', '峰', '凯']
const GIVEN_F = ['静', '婷', '芳', '娟', '敏', '丽', '娜', '玲', '雪', '琳', '丹', '萌', '悦', '倩', '洋', '慧', '蕾', '瑶', '琪', '诺']

const PERSONALITIES = ['调皮', '文静', '活泼', '内向', '开朗', '认真', '粗心', '热心', '孤僻', '幽默', '勤奋', '懒散', '乐观', '敏感', '稳重']
const FAMILIES = ['双职工', '单亲', '留守儿童', '经商', '公务员', '教师', '务工', '务农', '个体户', '知识分子']
const DREAMS = ['医生', '教师', '警察', '科学家', '工程师', '艺术家', '作家', '程序员', '运动员', '军人', '飞行员', '律师', '设计师', '主播', '创业者']
const STATUSES = ['上课认真', '上课爱讲话', '经常走神', '勤奋好学', '沉默寡言', '活跃分子', '乐于助人', '容易分心']
const RECENTS = ['被班主任表扬', '被班主任警告', '作业被表扬', '作业未完成', '刚交到新朋友', '参加比赛获奖', '体育课受伤', '担任课代表']

function rand(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min }
function pick<T>(arr: T[]) { return arr[rand(0, arr.length - 1)] }

export function generateStudent(id: number): Student {
  const gender = Math.random() > 0.5 ? '男' : '女'
  const surname = pick(SURNAMES)
  const given = pick(gender === '男' ? GIVEN_M : GIVEN_F)
  return {
    id, name: surname + given, gender,
    personality: pick(PERSONALITIES),
    scores: { english: rand(25, 80), math: rand(25, 80), chinese: rand(25, 80) },
    popularity: pick(['高', '中', '低']),
    family: pick(FAMILIES),
    dream: pick(DREAMS),
    status: pick(STATUSES),
    recent: pick(RECENTS),
    history: [],
  }
}

export function generateClass(): Student[] {
  return Array.from({ length: 50 }, (_, i) => generateStudent(i + 1))
}

const DAILY_EVENTS: GameEvent[] = [
  {
    id: 1, title: '课间风波',
    desc: '课间休息时，{student} 把篮球带进教室，一不小心砸坏了班牌。四周的同学都看了过来。\n\n班主任李老师正在走廊往这边走。',
    choices: [
      { label: '主动承认错误', effect: { responsibility: 5, courage: 3, integrity: 5 }, text: '你走过去告诉老师是你碰的。\n李老师点点头："诚实比什么都重要。"' },
      { label: '指给别人', effect: { integrity: -5, courage: -2 }, text: '你指向旁边的同学。\n那同学愣住了。\n你心里有点不安。' },
      { label: '偷偷修好', effect: { responsibility: 3, integrity: 2 }, text: '趁没人注意，你用胶带把班牌粘好。\n虽然不太完美，但至少解决了。' },
    ],
  },
  {
    id: 2, title: '课堂提问',
    desc: '英语课上，老师提问：\n\n"What does this word mean?"\n\n教室安静下来。\n\n你知道答案，但也有些紧张。',
    choices: [
      { label: '举手回答', effect: { courage: 5, responsibility: 2 }, text: '你举手回答对了问题。\n老师投来赞许的目光。\n坐下时，心跳还在加快。' },
      { label: '低头不语', effect: { courage: -2 }, text: '你低下头，假装在看书。\n老师叫了另一个同学回答。' },
      { label: '悄悄提醒同桌', effect: { empathy: 3, courage: 1 }, text: '你小声把答案告诉了同桌。\n同桌顺利回答了问题，向你眨眨眼。' },
    ],
  },
  {
    id: 3, title: '运动会时刻',
    desc: '运动会 4×100 米接力赛。\n\n{student} 在弯道处不慎摔倒。\n\n你是下一棒选手。',
    choices: [
      { label: '停下来扶起他', effect: { empathy: 5, responsibility: 3 }, text: '你停下来扶起 {student}。\n虽然输了比赛，但全班为你们鼓掌。\n{student} 说："谢谢你。"' },
      { label: '继续完成比赛', effect: { courage: 2, responsibility: 2 }, text: '你咬咬牙继续跑完。\n赛后你去看望 {student}。\n他说："没事，比赛重要。"' },
      { label: '去找老师帮忙', effect: { responsibility: 3 }, text: '你赶紧跑去找校医。\n老师处理了伤口。\n{student} 感激地看着你。' },
    ],
  },
  {
    id: 4, title: '作业风波',
    desc: '早自习，课代表在收作业。\n\n你发现 {student} 正着急地翻书包——作业没写。\n\n他看向你，小声问："借我抄一下？"',
    choices: [
      { label: '借给他抄', effect: { empathy: 2, integrity: -3 }, text: '你把作业递过去。\n他快速抄完。\n但你知道这样做不对。' },
      { label: '拒绝并帮他讲解', effect: { integrity: 5, empathy: 3, responsibility: 3 }, text: '"我教你吧。"\n你用课间时间给他讲了解题思路。\n他似懂非懂地点点头。' },
      { label: '假装没听见', effect: { empathy: -2 }, text: '你转过头。\n他叹了口气，去找别人了。\n你有点过意不去。' },
    ],
  },
  {
    id: 5, title: '分组竞争',
    desc: '语文课小组讨论。\n\n每组需要推选一人代表发言。\n\n你们组还没选出来，大家看向了你。',
    choices: [
      { label: '主动上台', effect: { courage: 5, responsibility: 3 }, text: '你站起来走向讲台。\n虽然有点紧张，但完整表达了观点。\n组员给你竖大拇指。' },
      { label: '推荐别人', effect: { empathy: 2, responsibility: 2 }, text: '"让 {student} 来吧，他准备得很充分。"\n{student} 惊讶地看了你一眼，然后自信地走上台。' },
      { label: '沉默等别人去', effect: {}, text: '最终另一个同学站了出来。\n你松了一口气。' },
    ],
  },
  {
    id: 6, title: '午休秘密',
    desc: '午休时间。\n\n你看到 {student} 独自在教室角落看一本课外书。\n\n他注意到你，赶紧把书藏起来。',
    choices: [
      { label: '好奇地问在看什么', effect: { empathy: 3 }, text: '"在看什么呢？"\n他犹豫了一下，把书拿出来。\n原来是一本《三体》。\n你们聊了一中午科幻。' },
      { label: '替她保密', effect: { integrity: 3, empathy: 2 }, text: '你笑笑走开了。\n他松了口气。\n之后他主动找你聊天。' },
      { label: '告诉班长', effect: { integrity: -3 }, text: '你告诉了班长。\n班长收走了他的书。\n他瞪了你一眼。' },
    ],
  },
  {
    id: 7, title: '考前焦虑',
    desc: '明天就是月考。\n\n放学后，{student} 还坐在座位上发呆。\n\n面前摊着课本，但一个字都没看进去。',
    choices: [
      { label: '留下来一起复习', effect: { empathy: 4, responsibility: 3 }, text: '你坐下来，把笔记推过去。\n"这个公式我教你记。"\n他感激地笑了。' },
      { label: '鼓励他几句', effect: { empathy: 2, courage: 1 }, text: '"别紧张，你平时学得不错的。"\n他笑了笑："谢了。"\n有时候一句话就够了。' },
      { label: '先走了', effect: {}, text: '你收拾书包离开。\n回头看了一眼，他还在发呆。' },
    ],
  },
  {
    id: 8, title: '谁丢了钱',
    desc: '课间，你在座位下捡到 50 元钱。\n\n你环顾四周，不确定是谁丢的。\n\n{student} 正在焦急地翻钱包。',
    choices: [
      { label: '马上还给他', effect: { integrity: 5, responsibility: 3 }, text: '"这是你的吗？"\n他接过来，长舒一口气："谢谢你！这周的生活费。"' },
      { label: '交给老师', effect: { integrity: 3, responsibility: 3 }, text: '你交给了李老师。\n老师在班上表扬了你。\n失主也来道谢。' },
      { label: '自己留着', effect: { integrity: -5 }, text: '你把钱收进口袋。\n但一整天都惴惴不安。' },
    ],
  },
]

const MILESTONES = [
  { day: 7, title: '📚 第一次月考', desc: '进入初中后的第一次月考。\n全班都紧张地等待着成绩。\n\n李老师说：\n"这只是开始，不用太在意名次。"' },
  { day: 20, title: '👪 家长会', desc: '家长会那天。\n教室里的座位坐满了家长。\n\n李老师在讲台上发言。\n你看到家长的表情有骄傲、有担忧、有期待。' },
  { day: 35, title: '🏃 运动会', desc: '一年一度的运动会。\n全班穿着统一的班服。\n\n广播里循环播放着加油稿。\n操场上充满了呐喊声。' },
  { day: 50, title: '🎉 元旦晚会', desc: '教室挂满了彩带和气球。\n同学们表演节目、做游戏。\n\n{student} 唱了一首歌。\n全班一起倒计时迎接新年。\n\n这是最快乐的一个晚上。' },
  { day: 70, title: '🌸 春游', desc: '全校春游。\n大巴车上充满了欢声笑语。\n\n{student} 和你坐在一起。\n你们分享零食、聊天、拍照。\n\n这是属于青春的一天。' },
  { day: 100, title: '📝 中考报名', desc: '中考报名表发下来了。\n教室里弥漫着一种紧张的气氛。\n\n三年的努力，\n将在这次考试中见分晓。' },
  { day: 135, title: '🎓 毕业典礼', desc: '最后一天。\n全班最后一次坐在这个教室里。\n\n李老师站在讲台上，\n声音有些哽咽。\n\n"同学们，你们毕业了。"' },
]

export function pickDailyEvent(day: number): GameEvent {
  const evt = { ...pick(DAILY_EVENTS) }
  const names = ['王浩', '李明', '张伟', '陈静', '刘婷', '赵磊', '周雪', '孙悦']
  evt.desc = evt.desc.replace(/\{student\}/g, pick(names))
  evt.choices = evt.choices.map(c => ({
    ...c,
    text: c.text.replace(/\{student\}/g, pick(names)),
  }))
  return evt
}

export function getMilestone(day: number) {
  return MILESTONES.find(m => m.day === day) || null
}

export function formatDate(year: number, month: number, day: number) {
  const weekdays = ['日', '一', '二', '三', '四', '五', '六']
  const d = new Date(year, month - 1, day)
  return `${year}年${month}月${d.getDate()}日 星期${weekdays[d.getDay()]}`
}

export function computeFinalOutcome(student: Student): string {
  const avg = (student.scores.english + student.scores.math + student.scores.chinese) / 3
  if (avg >= 85) return '重点高中'
  if (avg >= 70) return '普通高中'
  if (avg >= 55) return '职业高中'
  return '进入社会'
}

export function generateFutureCareer(student: Student, avg: number): string {
  const careers: Record<string, string[]> = {
    '警察': ['派出所民警', '刑警', '交警'],
    '医生': ['社区医生', '外科医生', '护士'],
    '教师': ['小学教师', '初中教师', '补习班教师'],
    '程序员': ['前端开发', '后端工程师', '产品经理'],
    '运动员': ['体育教练', '体育老师', '健身教练'],
    '科学家': ['研究员', '实验室助理', '大学教授'],
    '设计师': ['平面设计师', '室内设计师', '自由插画师'],
    '军人': ['士官', '军官', '退伍创业'],
    '艺术家': ['画廊签约', '美术老师', '自由创作者'],
    '作家': ['网络写手', '出版社编辑', '自由撰稿人'],
    '创业者': ['开店', '互联网创业', '继承家业'],
    '律师': ['律师事务所', '企业法务', '公务员'],
    '主播': ['游戏主播', '带货主播', '自媒体'],
    '飞行员': ['民航飞行员', '地勤', '无人机操作'],
    '工程师': ['建筑工程师', '机械工程师', '电气工程师'],
  }
  const list = careers[student.dream] || ['普通职员', '技术工人', '自由职业']
  if (avg >= 80) return list[0]
  if (avg >= 60) return list[Math.min(1, list.length - 1)]
  return list[list.length - 1]
}
