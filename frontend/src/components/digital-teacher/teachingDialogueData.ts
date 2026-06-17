export interface Choice {
  text: string
  atmosphere: number
  favor: number
  progress: number
  energy: number
}

export interface SceneLine {
  speaker: string
  text: string
}

export interface Scene {
  id: string
  title: string
  setup: string
  lines: SceneLine[]
  choices: Choice[]
  resultLine: SceneLine
}

export const SCENES: Scene[] = [
  {
    id: 'talking',
    title: '上课有人讲话',
    setup: '你正在讲一道重点题，后排两个男生一直在窃窃私语。',
    lines: [
      { speaker: '你', text: '（停下讲课，看向后排）' },
      { speaker: '学生A', text: '（没注意到你停了，继续说话）' },
    ],
    choices: [
      { text: '"后面两位同学，有什么好聊的分享一下？"', atmosphere: -5, favor: 5, progress: 0, energy: -5 },
      { text: '猛拍讲台："安静！"', atmosphere: 10, favor: -15, progress: 5, energy: -10 },
      { text: '走到他们旁边继续讲课', atmosphere: 5, favor: 10, progress: -5, energy: -5 },
      { text: '点他们起来回答问题', atmosphere: 0, favor: -5, progress: 5, energy: -5 },
    ],
    resultLine: { speaker: '学生B', text: '（小声）"老师好像发现了……"后排终于安静了。' },
  },
  {
    id: 'weird_q',
    title: '学生问奇怪的问题',
    setup: '你正在讲古诗，一个学生突然举手。',
    lines: [
      { speaker: '学生', text: '"老师，古人写诗的时候真的想那么多吗？万一他们只是随便写的呢？"' },
      { speaker: '你', text: '（这个问题……问得好！）' },
    ],
    choices: [
      { text: '"好问题！我们一起来分析诗人的创作背景"', atmosphere: 10, favor: 15, progress: 5, energy: -10 },
      { text: '"考试不会考这个，我们继续看下一题"', atmosphere: -10, favor: -20, progress: 10, energy: 0 },
      { text: '"说不定真是随便写的，但我们考试得按标准答案答"', atmosphere: 5, favor: 10, progress: 0, energy: -5 },
      { text: '"这个问题下课我单独跟你讨论"', atmosphere: 0, favor: 5, progress: 5, energy: -5 },
    ],
    resultLine: { speaker: '你', text: '（心里想）现在的学生脑洞真大……不过也挺好的。' },
  },
  {
    id: 'no_homework',
    title: '学生没写作业',
    setup: '早读课，小组长收作业，一个学生交不出来。',
    lines: [
      { speaker: '小组长', text: '"老师，他又没写作业！"' },
      { speaker: '学生', text: '（低头玩手指）"我……我昨晚补习到十一点，太困了……"' },
    ],
    choices: [
      { text: '"今天中午来办公室补，不会的我教你"', atmosphere: 5, favor: 15, progress: 5, energy: -10 },
      { text: '"扣操行分，放学留下来补"', atmosphere: 0, favor: -10, progress: 10, energy: -5 },
      { text: '"这次原谅你，下次要写完哦"', atmosphere: 5, favor: 5, progress: -5, energy: 0 },
      { text: '"跟你家长说一下情况"', atmosphere: -5, favor: -5, progress: 5, energy: -15 },
    ],
    resultLine: { speaker: '学生', text: '（抬头看你一眼）"老师我知道了……"' },
  },
  {
    id: 'awkward',
    title: '课堂冷场',
    setup: '你提了一个问题，全班鸦雀无声，没人举手。',
    lines: [
      { speaker: '你', text: '"这道题谁来回答？"（沉默……）"没有人知道吗？"' },
      { speaker: '空气', text: '（安静的连根针掉地上都听得见）' },
    ],
    choices: [
      { text: '"那我换一种方式讲，大家仔细听"', atmosphere: 5, favor: 5, progress: 10, energy: -5 },
      { text: '"随机点名！"（全班低头）', atmosphere: -10, favor: -15, progress: 5, energy: -5 },
      { text: '"大家小组讨论两分钟"', atmosphere: 10, favor: 10, progress: 0, energy: -5 },
      { text: '"好吧，这题确实难，我直接讲答案"', atmosphere: 0, favor: 5, progress: 5, energy: 0 },
    ],
    resultLine: { speaker: '你', text: '（擦了擦汗）当老师最怕的就是这个……' },
  },
  {
    id: 'sleepy',
    title: '学生打瞌睡',
    setup: '下午第一节课，靠窗的一个学生脑袋一点一点的。',
    lines: [
      { speaker: '你', text: '（看着他头快碰到桌子了）' },
      { speaker: '同桌', text: '（偷偷用胳膊肘捅他）"喂，老师在看你了！"' },
    ],
    choices: [
      { text: '"昨晚又熬夜打游戏了吧？站起来清醒一下"', atmosphere: 0, favor: -5, progress: 5, energy: -5 },
      { text: '走过去轻轻敲他桌子，继续讲课', atmosphere: 5, favor: 5, progress: 0, energy: 0 },
      { text: '"大家全体起立，做两个伸展运动！"', atmosphere: 15, favor: 20, progress: -5, energy: -10 },
      { text: '当没看见，继续上课', atmosphere: -5, favor: 5, progress: 5, energy: 0 },
    ],
    resultLine: { speaker: '学生', text: '（被同桌捅醒，一脸懵）"啊？讲到哪了？"' },
  },
  {
    id: 'phone',
    title: '发现学生玩手机',
    setup: '你在讲台上转身板书时，听到一声"TIMI"（游戏音效）。',
    lines: [
      { speaker: '你', text: '（转头）"谁？自觉点交出来。"' },
      { speaker: '全班', text: '（齐刷刷看向最后一排）' },
    ],
    choices: [
      { text: '"手机拿来，期末再还。"严肃没收', atmosphere: 5, favor: -15, progress: 5, energy: -5 },
      { text: '"下课来办公室拿，下次不要带了"', atmosphere: 0, favor: 5, progress: 0, energy: -5 },
      { text: '"技术不错啊，什么段位了？下课跟我聊聊"', atmosphere: 10, favor: 20, progress: -5, energy: 0 },
      { text: '"再玩一次我就要请家长了哦"', atmosphere: -5, favor: -5, progress: 5, energy: -5 },
    ],
    resultLine: { speaker: '学生', text: '（尴尬地把手机塞进书包）"不敢了不敢了……"' },
  },
  {
    id: 'rain',
    title: '下雨天，学生没带伞',
    setup: '放学时突然下大雨，一个学生在教学楼门口徘徊。',
    lines: [
      { speaker: '学生', text: '（看着大雨叹气）"完了，没带伞……"' },
      { speaker: '你', text: '刚好从办公室出来，看见了这一幕。' },
    ],
    choices: [
      { text: '"我这把伞借你，我家近"', atmosphere: 5, favor: 25, progress: 0, energy: -5 },
      { text: '"我带你到校门口，你跑快一点"', atmosphere: 0, favor: 15, progress: 0, energy: -5 },
      { text: '"等雨小点再走吧，别感冒了"', atmosphere: 5, favor: 10, progress: 0, energy: 0 },
      { text: '"让你爸妈来接你"', atmosphere: -5, favor: -5, progress: 0, energy: 0 },
    ],
    resultLine: { speaker: '你', text: '（淋着小雨跑回家）当老师就是操心的命啊……' },
  },
  {
    id: 'conflict',
    title: '两个学生吵架',
    setup: '课间，两个学生在教室里互相推搡，旁边围了一圈人。',
    lines: [
      { speaker: '学生A', text: '"你再推一个试试！"' },
      { speaker: '学生B', text: '"是你先骂我的！"' },
    ],
    choices: [
      { text: '"都给我住手！去办公室站着！"', atmosphere: 10, favor: -10, progress: 0, energy: -10 },
      { text: '"怎么回事？一个一个说。"耐心调解', atmosphere: 10, favor: 15, progress: 0, energy: -15 },
      { text: '"你俩握个手，这事儿过了"', atmosphere: 0, favor: 5, progress: 0, energy: -5 },
      { text: '"再打就请家长！"', atmosphere: 0, favor: -15, progress: 0, energy: -5 },
    ],
    resultLine: { speaker: '围观学生', text: '（散开）"老师来了，快跑……不是，快坐好！"' },
  },
]

export const SCENE_IDS = SCENES.map(s => s.id)

export interface GameStats {
  atmosphere: number // 课堂氛围
  favor: number      // 学生好感
  progress: number   // 教学进度
  energy: number     // 精力
}

export function getGrade(stats: GameStats): string {
  const total = stats.atmosphere + stats.favor + stats.progress
  if (total >= 60) return 'S'
  if (total >= 40) return 'A'
  if (total >= 20) return 'B'
  if (total >= 0) return 'C'
  return 'D'
}
