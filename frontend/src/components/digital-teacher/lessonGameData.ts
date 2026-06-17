const STUDENT_NAMES = [
  '张宇','李欣','王浩','林小雨','陈浩','刘婷','赵磊','孙悦',
  '周杰','吴萱','郑凯','冯梦','王萌萌','李想','张一凡','陈思思',
  '刘洋','黄鑫','林可','苏小冉','唐毅','沈晨曦','陆子豪','顾佳',
]

const SUBJECTS = ['语文','数学','英语','物理','化学','历史','地理','生物']

const FUNNY_EVENTS = [
  '学生手机突然响起，铃声是《好运来》',
  '一只鸟飞进教室，全班沸腾',
  '学生打喷嚏太大声，全班笑了一分钟',
  '老师板书写错字，学生偷偷笑',
  '窗外忽然下大雨，所有人转头看窗外',
]

const PATROL_EVENTS = [
  '教导主任从后窗经过，全班瞬间正襟危坐',
  '监控广播："请各班级保持安静，注意课堂纪律。"',
  '校长推门巡课，所有人假装在认真讨论',
  '教务处巡堂通报已发到工作群',
  '走廊传来脚步声……全班安静如鸡',
]

export interface Choice {
  id: string
  prompt: string
  options: { text: string; reaction: string }[]
}

export interface Scene {
  id: string
  title?: string
  lines: Line[]
}

export type Line =
  | { type: 'dialogue'; speaker: string; text: string }
  | { type: 'narrator'; text: string }
  | { type: 'system'; text: string }
  | { type: 'divider' }
  | { type: 'choice'; choice: Choice }
  | { type: 'event'; text: string }
  | { type: 'blackout'; text?: string }
  | { type: 'stats'; data: Record<string, number | string> }
  | { type: 'roast'; text: string }

export function generateScenes(): Scene[] {
  const s = pick(STUDENT_NAMES, 4)
  const subject = pick(SUBJECTS, 1)[0]
  const fun = pick(FUNNY_EVENTS, 1)[0]
  const patrol = pick(PATROL_EVENTS, 1)[0]

  return [
    // ===== 开场 =====
    { id: 'opening', lines: [
      { type: 'blackout' },
      { type: 'system', text: '📢 上课！' },
      { type: 'narrator', text: '全体学生：老师好——' },
      { type: 'system', text: `九月 · 星期二 · 上午第二节 · ${subject}课` },
      { type: 'narrator', text: '一间普通教室，一群普通学生，一节普通的课。' },
      { type: 'narrator', text: '你走进教室。40分钟，开始。' },
    ]},

    // ===== 第一幕：热闹的课堂 =====
    { id: 'act1', title: '热闹的课堂', lines: [
      { type: 'system', text: '第3分钟' },
      { type: 'dialogue', speaker: '你', text: '这道题谁来回答？' },
      { type: 'narrator', text: '举手的永远是那三个。' },
      { type: 'system', text: `${s[0]}举手` },
      { type: 'system', text: `${s[1]}举手` },
      { type: 'system', text: `${s[2]}举手` },
      { type: 'system', text: '其他37人进入隐身状态' },
      { type: 'roast', text: '教师生涯三大幻觉：这节课讲得真好、学生都听懂了、沉默是因为在思考。' },
      { type: 'divider' },
      { type: 'system', text: '第5分钟' },
      { type: 'narrator', text: '后排睡神出现。' },
      { type: 'dialogue', speaker: '你', text: '那位同学，站起来！' },
      { type: 'dialogue', speaker: s[3], text: '老师我没睡……我在思考。' },
      { type: 'system', text: '技能解锁：闭眼听课' },
      { type: 'choice', choice: {
        id: 'sleepy',
        prompt: '你选择？',
        options: [
          { text: '让他站着听课', reaction: '你："站着精神好，顺便活动一下。"\n全班窃笑。' },
          { text: '信了，继续讲课', reaction: '你："好，那你思考出什么了？"\n他："……思考到哪题了？"' },
          { text: '讲个笑话提神', reaction: '你："那我讲个笑话吧。"\n全班瞬间精神了，睡神也睁眼了。' },
          { text: '让他去洗把脸', reaction: '你："去厕所洗把脸，顺便帮我看下厕所有人没。"' },
        ],
      }},
      { type: 'divider' },
      { type: 'system', text: '第8分钟' },
      { type: 'dialogue', speaker: '学生', text: '老师，我想上厕所。' },
      { type: 'narrator', text: '一分钟后。又一个。' },
      { type: 'dialogue', speaker: '学生', text: '老师我也去。' },
      { type: 'narrator', text: '两分钟后。第三个。' },
      { type: 'event', text: '成就解锁：厕所传送门' },
      { type: 'choice', choice: {
        id: 'toilet',
        prompt: '你会？',
        options: [
          { text: '全放行，回来再补课', reaction: '你："去吧去吧，这节课是厕所专场。"' },
          { text: '禁止，忍到下节课', reaction: '你："刚才下课干嘛去了？"\n学生："刚才没感觉……"' },
          { text: '让他们一起去，组成厕所学习小组', reaction: '你："组个厕所学习小组吧，顺便讨论下刚才的题。"' },
          { text: '自己也想去但忍住了', reaction: '（内心：我也想去啊……）' },
        ],
      }},
      { type: 'event', text: fun },
      { type: 'event', text: patrol },
      { type: 'roast', text: '当老师之后，膀胱功能得到了极大的锻炼。' },
      { type: 'divider' },
      { type: 'system', text: '第12分钟' },
      { type: 'dialogue', speaker: '你', text: '听懂了吗？' },
      { type: 'narrator', text: '全班：听懂了！' },
      { type: 'stats', data: { '真懂': 11, '半懂': 15, '没懂': 9, '发呆': 5 } },
      { type: 'choice', choice: {
        id: 'understand',
        prompt: '看到这个数据，你？',
        options: [
          { text: '假装没看到，继续讲', reaction: '你："很好，那我们看下一题。"' },
          { text: '再讲一遍，不厌其烦', reaction: '你："那我再讲一遍，没懂的举手。"\n全班：没人举手。' },
          { text: '安排小组讨论', reaction: '你："小组讨论一下，会的教不会的。"\n结果：会的在教，不会的在聊天。' },
          { text: '发张卷子测验', reaction: '全班："啊——"（哀嚎遍野）' },
        ],
      }},
    ]},

    // ===== 第二幕：课堂背后 =====
    { id: 'act2', title: '课堂背后', lines: [
      { type: 'system', text: '第15分钟' },
      { type: 'narrator', text: '你点开学生档案。' },
      { type: 'divider' },
      { type: 'system', text: s[0] },
      { type: 'narrator', text: '课堂表现：发呆。' },
      { type: 'narrator', text: '真实原因：昨晚刷短视频到凌晨三点。' },
      { type: 'roast', text: '现在的学生熬夜能力远超他们的学习能力。' },
      { type: 'divider' },
      { type: 'system', text: s[1] },
      { type: 'narrator', text: '课堂表现：睡觉。' },
      { type: 'narrator', text: '真实原因：昨晚跟网友联机打游戏到凌晨。' },
      { type: 'roast', text: '每一个上课睡觉的学生，晚上都在另一个领域发光发热。' },
      { type: 'divider' },
      { type: 'system', text: s[2] },
      { type: 'narrator', text: '课堂表现：一直低头。' },
      { type: 'narrator', text: '真实原因：昨天被同学孤立。' },
      { type: 'divider' },
      { type: 'narrator', text: '课堂看到的，只是表面。' },
      { type: 'choice', choice: {
        id: 'realize',
        prompt: '知道真相后，你？',
        options: [
          { text: '感慨一下，继续上课', reaction: '想管，但课还得上。' },
          { text: '下课找他们聊聊', reaction: '你默默在心里记下了这几个名字。' },
          { text: '在班里搞个匿名信箱', reaction: '学生有些话，当着老师面说不出来。' },
          { text: '算了，管不了那么多', reaction: '你叹了口气，翻开了教案。' },
        ],
      }},
    ]},

    // ===== 第三幕：那些没有被看见的人 =====
    { id: 'act3', title: '那些没有被看见的人', lines: [
      { type: 'system', text: '第20分钟' },
      { type: 'narrator', text: '教室里42名学生，今天发言人数：4。' },
      { type: 'system', text: '其余38人沉默。' },
      { type: 'divider' },
      { type: 'narrator', text: '你注意到最后一排的男生。' },
      { type: 'stats', data: { '开学': '第73天', '被提问次数': 0, '主动发言': '从未' } },
      { type: 'roast', text: '有些学生读了三年书，老师只记得他座位在哪一排。' },
      { type: 'choice', choice: {
        id: 'quiet',
        prompt: '你会？',
        options: [
          { text: '点他回答问题', reaction: '他愣了一下，小声说出了正确答案。\n你："不是不会啊，为什么不举手？"\n他笑了笑没说话。' },
          { text: '下课单独聊聊', reaction: '你走到他座位边："最近怎么样？"\n他有点意外："挺……挺好的。"' },
          { text: '在花名册上做个记号', reaction: '你在他的名字旁边画了个圈。\n提醒自己下次多关注他。' },
          { text: '继续上课，时间有限', reaction: '你看了看表，还有半黑板的题没讲。' },
        ],
      }},
    ]},

    // ===== 第四幕：看不见的压力 =====
    { id: 'act4', title: '看不见的压力', lines: [
      { type: 'system', text: '下课了。' },
      { type: 'narrator', text: '你切换为教师视角。' },
      { type: 'system', text: '📝 待办清单' },
      { type: 'narrator', text: '备课 · 批改 · 家校沟通 · 教研活动 · 表格填写' },
      { type: 'divider' },
      { type: 'event', text: '📢 通知：请参加会议' },
      { type: 'event', text: '📢 通知：请提交材料' },
      { type: 'event', text: '📢 通知：请填写统计表' },
      { type: 'event', text: '📢 通知：请更新数据' },
      { type: 'roast', text: '教师的主要工作：上课只占三分之一，剩下三分之二是填表、开会和回复家长消息。' },
      { type: 'stats', data: { '本周研究学生时间': '2小时', '本周填写材料时间': '11小时' } },
      { type: 'narrator', text: '数字自己会说话。' },
    ]},

    // ===== 第五幕：AI时代 =====
    { id: 'act5', title: 'AI时代', lines: [
      { type: 'narrator', text: '你布置了一篇作文。' },
      { type: 'narrator', text: '第二天。' },
      { type: 'system', text: `系统检测：42份作文中${Math.floor(26 + Math.random() * 10)}份疑似AI辅助` },
      { type: 'roast', text: 'AI用起来真方便，学生交作业更方便了——反正不是自己写的。' },
      { type: 'choice', choice: {
        id: 'ai',
        prompt: '你怎么处理？',
        options: [
          { text: '全部打回重写', reaction: '你："自己写，哪怕写一句也行。"\n学生："可未来工作都要用AI啊。"' },
          { text: '睁一只眼闭一只眼', reaction: '你叹了口气，批了个"已阅"。' },
          { text: '教他们怎么正确用AI', reaction: '你："AI是工具，不是代写。我们来学学怎么用AI辅助学习。"\n学生：居然还有这种操作？' },
          { text: '让AI给AI写的作文打分', reaction: '你让学生把AI作文输入AI评分，结果AI给了高分。\n你：……这算不算AI内卷？' },
        ],
      }},
    ]},

    // ===== 第六幕：十年后 =====
    { id: 'act6', title: '十年后', lines: [
      { type: 'blackout' },
      { type: 'system', text: '🔔 铃声响了。' },
      { type: 'narrator', text: '学生冲出教室，教室慢慢空下来。' },
      { type: 'narrator', text: '只剩你一个人。' },
      { type: 'divider' },
      { type: 'system', text: '⏳ 十年后' },
      { type: 'narrator', text: '学生资料开始滚动。' },
      { type: 'system', text: `${s[0]} → 厨师` },
      { type: 'system', text: `${s[1]} → 程序员` },
      { type: 'system', text: `${s[2]} → 护士` },
      { type: 'system', text: `${s[3]} → 汽车维修工` },
      { type: 'system', text: `${s[0]} → 医生（学霸转型成功）` },
      { type: 'roast', text: '当年成绩好的成了医生，成绩不好的成了老板的也有。人生呐，谁说得准呢。' },
      { type: 'narrator', text: '他们的人生继续前进。' },
      { type: 'narrator', text: '很多学生当年成绩一般，但人生并没有停止。' },
    ]},

    // ===== 最后一幕 =====
    { id: 'finale', title: '最后一课', lines: [
      { type: 'blackout', text: '多年后……' },
      { type: 'narrator', text: '你退休了。整理办公室时，抽屉里掉出一张纸。' },
      { type: 'narrator', text: '是很多年前的纸条。' },
      { type: 'divider' },
      { type: 'system', text: '纸条上写着：' },
      { type: 'narrator', text: '"老师，那时候我成绩不好，你可能不记得我。但你有一次说：慢一点没关系。我记了很多年。"' },
      { type: 'blackout' },
      { type: 'system', text: '你教过：1268 名学生' },
      { type: 'narrator', text: '你记得其中很多人，但更多人记得你。' },
      { type: 'blackout' },
      { type: 'narrator', text: '课堂从来不只是传授知识。' },
      { type: 'narrator', text: '有些课讲完就忘了。' },
      { type: 'narrator', text: '有些话会留在人一生里。' },
    ]},
  ]
}

function pick<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, n)
}
