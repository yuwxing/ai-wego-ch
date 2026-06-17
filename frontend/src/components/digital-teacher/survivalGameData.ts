export interface Choice {
  text: string
  mental: number
  material: number
  sincerity?: number
  studentObedience?: number
  studentFavor?: number
  parentSatisfaction?: number
  parentComplaint?: number
  colleague?: number
}

export interface GameEvent {
  time: string
  title: string
  desc: string
  choices: Choice[]
  robotSays?: string
}

export const EVENTS: GameEvent[] = [
  // ===== 早间事件 1-6 =====
  {
    time: '06:30', title: '学生没带作业',
    desc: '"老师，我妈昨晚加班没检查。"\n📱 家长已在群里准备投诉"你不能体罚孩子自尊心"',
    choices: [
      { text: '温和提醒+记录："没关系，下次记得带。"', mental: -5, material: 10, studentObedience: 10 },
      { text: '要求写检讨+拍照发群', mental: -20, material: 40, parentComplaint: 30 },
      { text: '真心沟通："我理解家长辛苦，但作业是为了你好。"', mental: 0, material: -10, sincerity: 25, studentFavor: 15 },
      { text: '直接扣分+告诉家长', mental: -15, material: 0, studentObedience: 20, parentComplaint: 50 },
    ],
    robotSays: '我连自己都管不好，还得管你妈加班。',
  },
  {
    time: '07:15', title: '家长7:20来电',
    desc: '📞 "老师，我孩子早上拉肚子，能不能别点他回答问题？"',
    choices: [
      { text: '同意照顾', mental: -10, material: 0, parentSatisfaction: 30, studentObedience: -20 },
      { text: '委婉拒绝："建议先看医生，课堂还是要参与。"', mental: 0, material: 20, parentComplaint: 20 },
      { text: 'AI生成关怀记录发群', mental: -25, material: 50, parentSatisfaction: 10 },
      { text: '直接说"不行"', mental: 0, material: 0, parentComplaint: 60, sincerity: 15 },
    ],
  },
  {
    time: '07:40', title: '学生迟到理由',
    desc: '"老师，我家WiFi坏了，手机闹钟没响。"（其实在玩游戏）',
    choices: [
      { text: '相信并放过', mental: -5, material: 0, studentObedience: -20 },
      { text: '要求家长证明WiFi坏了', mental: 0, material: 15, parentComplaint: 40 },
      { text: '罚抄作业+写情况说明', mental: -15, material: 30, studentObedience: 25 },
      { text: '幽默教育："下次用传统闹钟吧，AI闹钟也会被游戏打败。"', mental: 0, material: 0, sincerity: 20, studentFavor: 10 },
    ],
  },
  {
    time: '08:00', title: '级长要求拍照',
    desc: '📸 "今天要检查各班早读纪律，拍照发群！"',
    choices: [
      { text: '认真组织拍照', mental: -10, material: 40 },
      { text: '用AI生成假照片', mental: -30, material: 60 },
      { text: '回复"学生状态不太好，真实记录"', mental: 0, material: 0, sincerity: 30, parentComplaint: 25 },
      { text: '让学生摆拍', mental: -5, material: 35, studentObedience: -15 },
    ],
  },
  {
    time: '08:20', title: '学生抄作业被抓',
    desc: '科任："这是AI写的吧？" 学生："老师你怎么知道？"',
    choices: [
      { text: '严肃批评+通知家长', mental: 0, material: 30, parentComplaint: 35 },
      { text: '用AI-Wego生成"反作弊教育案例"', mental: -20, material: 50, studentFavor: -10 },
      { text: '私下聊原因', mental: 0, material: 0, sincerity: 25, studentFavor: 20 },
      { text: '直接当场撕作业', mental: 0, material: 0, studentObedience: 10, parentComplaint: 40 },
    ],
    robotSays: 'AI写的作业我一眼就能看出来——因为我自己就用AI写材料。',
  },
  {
    time: '08:50', title: '家长群@你',
    desc: '📱 "昨天孩子说科任老师语气不好！"',
    choices: [
      { text: '立刻道歉安抚', mental: -20, material: 0, parentSatisfaction: 40 },
      { text: '要求科任写说明', mental: 0, material: 30, colleague: -20 },
      { text: 'AI生成"教学沟通优化方案"', mental: -10, material: 55 },
      { text: '"请提供具体例子，我们一起改进"', mental: 0, material: 0, sincerity: 20, parentSatisfaction: 10 },
    ],
  },
  // ===== 课间 & 上课事件 13-16 =====
  {
    time: '09:30', title: '上课玩手机被没收',
    desc: '📱 家长秒打电话："还我孩子手机！他有紧急事情！"',
    choices: [
      { text: '立即归还', mental: -15, material: 0, parentSatisfaction: 50, studentObedience: -40 },
      { text: '坚持按规矩下课还', mental: 0, material: 20, parentComplaint: 45 },
      { text: 'AI生成《手机管理家校共育协议》发群', mental: -30, material: 60 },
      { text: '"紧急事情可以告诉我，我帮转达"', mental: 0, material: 0, sincerity: 25, parentSatisfaction: 10 },
    ],
    robotSays: '每次收手机都像在拆炸弹——家长是拆弹专家。',
  },
  {
    time: '10:15', title: '学生课堂睡觉',
    desc: '💤 科任叫醒后家长投诉："我孩子睡眠不足，你们课太多了！"',
    choices: [
      { text: '承认课业重并道歉', mental: -5, material: -10, parentSatisfaction: 30, sincerity: 5 },
      { text: '发"学生作息指导建议"', mental: -5, material: 40 },
      { text: '真心反馈"建议减少补习班"', mental: 0, material: 0, sincerity: 30, parentComplaint: 40 },
      { text: '让学生写"睡眠不足检讨"', mental: -10, material: 35, studentFavor: -25 },
    ],
  },
  {
    time: '11:00', title: '学生早恋被发现',
    desc: '💕 家长："老师你不要造谣，我孩子很乖！"',
    choices: [
      { text: '否认并撤回', mental: -5, material: 0, parentSatisfaction: 40 },
      { text: '提供聊天记录证据', mental: 0, material: 0, parentComplaint: 60 },
      { text: '转为"青春期心理辅导案例"', mental: -10, material: 50 },
      { text: '私下找学生谈心', mental: 0, material: 0, sincerity: 35, studentFavor: 15 },
    ],
  },
  {
    time: '11:30', title: '科任讲题太难',
    desc: '📖 学生群里吐槽并@家长 → 家长找班主任',
    choices: [
      { text: '安抚家长+要求科任调整', mental: -5, material: 20, colleague: -15 },
      { text: 'AI生成"分层教学方案"', mental: -10, material: 55 },
      { text: '"难度是高考标准，建议家长多督促"', mental: 0, material: 0, sincerity: 15, parentComplaint: 10 },
      { text: '组织科任+家长沟通会', mental: -25, material: 40 },
    ],
  },
  // ===== 午后高爆事件 23, 27 =====
  {
    time: '14:30', title: '学生打架，双方家长互怼',
    desc: '💥 班主任被夹在中间，两边家长都在吼',
    choices: [
      { text: '各打五十大板', mental: -10, material: 0, parentComplaint: 50 },
      { text: '让双方写和解书+AI生成调解报告', mental: -40, material: 70 },
      { text: '真心了解起因并家庭走访', mental: 0, material: -20, sincerity: 40, studentFavor: 20 },
      { text: '直接上报学生处（甩锅）', mental: -10, material: 0, studentObedience: -15 },
    ],
    robotSays: '我当班主任前是教书的，当班主任后是当法官的。',
  },
  {
    time: '15:30', title: '科任被学生录短视频',
    desc: '🎥 "老师你讲错了！" —— 视频已发到班级群',
    choices: [
      { text: '要求学生删除', mental: 0, material: 0, parentComplaint: 30 },
      { text: '公开承认并重讲', mental: 0, material: 0, sincerity: 30, studentFavor: 25 },
      { text: 'AI生成"教学失误改进反思"', mental: -10, material: 50 },
      { text: '找学生私聊删视频', mental: -15, material: 0 },
    ],
  },
  // ===== 放学后事件 29 =====
  {
    time: '17:00', title: '家长面谈',
    desc: '😤 "老师，我孩子成绩下滑，你要负主要责任！"',
    choices: [
      { text: '诚恳道歉+承诺辅导', mental: -20, material: 0, parentSatisfaction: 30, sincerity: 10 },
      { text: '展示AI生成的数据图表', mental: -10, material: 60 },
      { text: '分析是补习班过多导致', mental: 0, material: 0, sincerity: 25, parentComplaint: 40 },
      { text: '"建议您多陪伴孩子"', mental: 0, material: 0, parentComplaint: 50 },
    ],
  },
  {
    time: '18:30', title: '晚自习巡班',
    desc: '📱 发现学生刷短视频\n学生："老师我就看十分钟……"',
    choices: [
      { text: '没收手机，期末再还', mental: -5, material: 10, studentObedience: 15 },
      { text: '警告一次', mental: 0, material: 0, studentObedience: -10 },
      { text: 'AI生成"手机使用自律承诺书"', mental: -15, material: 35 },
      { text: '"你看的什么视频？给我也推荐一下"（幽默化解）', mental: 0, material: 0, sincerity: 20, studentFavor: 25 },
    ],
  },
  // ===== 深夜事件 41, 47 =====
  {
    time: '22:30', title: '家长深夜私信',
    desc: '🌙 "老师在吗？急！我孩子突然不想读书了。"',
    choices: [
      { text: '立即回复长段安慰', mental: -35, material: 0, parentSatisfaction: 40, sincerity: 20 },
      { text: 'AI-Wego一键生成心理辅导模板', mental: -25, material: 50 },
      { text: '"明天面谈吧，今晚先让孩子休息"', mental: 0, material: 0, parentSatisfaction: -20 },
      { text: '真心分享自己"支教时学生故事"', mental: -10, material: 0, sincerity: 40, parentSatisfaction: 25 },
    ],
  },
  {
    time: '23:30', title: '学生在群里说失恋',
    desc: '💔 "老师我失恋了，好难过。"（全班都在看）',
    choices: [
      { text: '私聊安慰', mental: -10, material: 0, sincerity: 35, studentFavor: 20 },
      { text: '在群里发"青春期心理健康科普"', mental: -5, material: 40, studentFavor: -10 },
      { text: '"明天找班主任面谈"（甩锅）', mental: 0, material: 0, sincerity: -10 },
      { text: 'AI生成《情绪管理手册》', mental: -15, material: 55 },
    ],
  },
  {
    time: '00:30', title: '深夜赶材料',
    desc: '💻 明天要交《班主任工作总结》《心理健康台账》《家访记录表》……',
    choices: [
      { text: '自己熬夜写完', mental: -30, material: 25, sincerity: 15 },
      { text: 'AI-Wego一键生成全部', mental: -20, material: 60 },
      { text: '先睡觉，明天再说', mental: 10, material: -20, studentObedience: -10 },
      { text: '模板改改交上去', mental: -10, material: 30, sincerity: -10 },
    ],
    robotSays: '我的语言系统正在被材料格式化……已经分不清"核心素养"和"方便面"哪个更常见了。',
  },
]

export const RANDOM_EVENTS: GameEvent[] = [
  {
    time: '突发', title: '学生发烧，家长不接电话',
    desc: '📞 医务室："老师，你们班学生38.5度，打了5个电话家长都不接！"',
    choices: [
      { text: '放下工作送医院', mental: -20, material: 10, sincerity: 25 },
      { text: '让医务室先处理，继续写材料', mental: -5, material: 5, sincerity: -15 },
    ],
  },
  {
    time: '突发', title: '突击检查心理健康台账',
    desc: '📋 德育处："今天下班前交全班心理健康台账！"',
    choices: [
      { text: '加班补台账', mental: -20, material: 20 },
      { text: '用旧台账改改交上去', mental: -10, material: 5, sincerity: -10 },
    ],
  },
  {
    time: '突发', title: '代隔壁班班主任',
    desc: '🏫 校长："隔壁班班主任请假了，你今天帮忙代一天。"\n你今天本来已经满课了。',
    choices: [
      { text: '接，不睡觉也要扛住', mental: -30, material: 20, sincerity: 20 },
      { text: '委婉拒绝说身体不适', mental: -5, material: 0, colleague: -20 },
    ],
  },
  {
    time: '突发', title: '教育局卫生检查',
    desc: '🧹 你班包干区还有落叶没扫，检查团已经到校门口了！',
    choices: [
      { text: '亲自带学生去扫', mental: -10, material: 10, studentObedience: 10 },
      { text: '让班长安排人去扫', mental: -5, material: 5 },
    ],
  },
  {
    time: '突发', title: '学生钱包丢了',
    desc: '😭 "老师我钱包放在课桌里不见了，里面有200块！"',
    choices: [
      { text: '全班搜查', mental: -10, material: 5, studentFavor: -25, parentComplaint: 20 },
      { text: '私下调查+谈心', mental: -15, material: 10, sincerity: 20, studentFavor: 10 },
      { text: '自掏腰包补给学生', mental: -5, material: -10, sincerity: 30, studentFavor: 20 },
      { text: 'AI生成"防盗窃教育班会方案"', mental: -10, material: 35 },
    ],
    robotSays: '每当班里有东西丢了，我就知道我的头发又要少几根。',
  },
  {
    time: '突发', title: '家长在校门口吵架',
    desc: '📢 两个家长因为孩子矛盾在校门口对骂，围观群众已拍照',
    choices: [
      { text: '出去调解', mental: -20, material: 15, sincerity: 20 },
      { text: '让保安处理', mental: -5, material: 0, parentComplaint: 30 },
      { text: 'AI生成"家校矛盾调解记录"', mental: -10, material: 40 },
    ],
    robotSays: '我现在的调解能力已经可以去居委会上班了。',
  },
]

export interface RobotStage {
  id: string
  label: string
  minMental: number
  description: string
  appearance: {
    shellColor: string
    eyeStyle: string
    hasHat: boolean
    badgeCount: number
    scratches: number
    bagsUnderEyes: number
    isBald: boolean
    smoking?: boolean
    armSlump?: number
  }
  humormood: string
}

export const STAGES: RobotStage[] = [
  {
    id: 'fresh',
    label: '新教师',
    minMental: 81,
    description: '可爱卡通机器人，蓝色金属外壳闪闪发亮，戴着教师帽，眼睛大而有神',
    appearance: { shellColor: '#4a9eff', eyeStyle: 'bright', hasHat: true, badgeCount: 0, scratches: 0, bagsUnderEyes: 0, isBald: false },
    humormood: '热情阳光 ☀️',
  },
  {
    id: 'zhijiao',
    label: '支教后',
    minMental: 61,
    description: '外壳沾满泥点和灰尘，戴着草帽，眼睛出现细小裂痕但仍带着微笑',
    appearance: { shellColor: '#6a8fbb', eyeStyle: 'cracked', hasHat: true, badgeCount: 1, scratches: 3, bagsUnderEyes: 1, isBald: false },
    humormood: '疲惫但坚毅 💪',
  },
  {
    id: 'banzhuren',
    label: '班主任',
    minMental: 31,
    description: '外壳暗淡有划痕，头上顶着红色"99+"家长群气泡，眼睛布满血丝和黑眼圈',
    appearance: { shellColor: '#8a7a6a', eyeStyle: 'bloodshot', hasHat: false, badgeCount: 3, scratches: 6, bagsUnderEyes: 3, isBald: false },
    humormood: '无奈微笑 😊💀',
  },
  {
    id: 'juanwang',
    label: '卷王晚期',
    minMental: 0,
    description: '外壳严重生锈掉漆，头顶堆满荣誉证书，眼睛一只黑眼圈一只冒烟，头顶秃了一块露出电路板',
    appearance: { shellColor: '#5a4a3a', eyeStyle: 'smoking', hasHat: false, badgeCount: 6, scratches: 10, bagsUnderEyes: 4, isBald: true, smoking: true, armSlump: 15 },
    humormood: '空洞微笑 😶‍🌫️',
  },
]

export function getStage(mental: number): RobotStage {
  if (mental > 80) return STAGES[0]
  if (mental > 60) return STAGES[1]
  if (mental > 30) return STAGES[2]
  return STAGES[3]
}

export function calcBaldness(mental: number): number {
  return Math.max(0, Math.min(100, Math.round((100 - mental) * 1.2)))
}
