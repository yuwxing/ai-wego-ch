import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, BookOpen, Sparkles, Send, ListChecks, RefreshCw, Trophy, Medal, Eye, ChevronDown, ChevronUp, BarChart3, Users, Clock, TrendingUp, Award, PenLine, CheckCircle2, ArrowDown, Star } from 'lucide-react'
import { sendToDeepSeek, sendToDeepSeekSync, getSharedApiKey, setSharedApiKey, getApiKey } from '../utils/deepseek'
import { writingTasksAPI, sharedConfigAPI, writingExcellentAPI, writingRankingAPI } from '../utils/supabase'

interface WritingTask {
  id: string
  title: string
  grade: 'junior' | 'senior'
  level?: string
  type?: string
  description: string
  requirements: string[]
  minWords: number
  maxWords: number
  totalScore: number
  opening?: string
  closing?: string
}

interface ReviewScore {
  dimension: string
  score: number
  maxScore: number
  comment: string
  details?: { issue: string; original: string; corrected: string; note: string }[]
}

interface ReviewResult {
  content: ReviewScore
  language: ReviewScore
  structure: ReviewScore
  advanced: ReviewScore
  total: number
  maxTotal: number
  comment: string
}

interface Suggestion {
  original: string
  optimized: string
  note: string
}

interface RankEntry {
  studentName: string
  score: number
  total: number
  taskTitle: string
  submissionId: string
}

interface ExcellentWork {
  id: string
  studentName: string
  taskTitle: string
  content: string
  scores: ReviewResult
  highlights: string[]
  date: string
}

interface Improvement {
  beforeScore: number
  afterScore: number
  languageAccuracyBefore: number
  languageAccuracyAfter: number
  growthPoints: number
  details: string[]
}

const JUNIOR_TASKS: WritingTask[] = [
  {
    id: 'j1', grade: 'junior', level: '广东中考', totalScore: 15,
    opening: 'Dear Peter,\nOur school and the city museum will hold an event for us to get a taste of a folk custom. We are invited to vote for our favorite, and lion dance comes first now.',
    title: '民俗体验活动投票',
    description: `假设你是李明。你校计划与市博物馆合作举办民俗体验活动，需要同学们从若干民俗项目中选出最想体验的一项。你期待交换生 Peter 也参与投票。请你根据以下提示，写一封电子邮件给他。

目前票数最高的两项：舞狮 / 剪纸
你的选择：（项目名称）
选择理由：（2点）
项目目前得票情况：
你的期待：

注意：
(1) 可在内容提示的基础上适当拓展信息。
(2) 不能照抄原文；不得出现真实校名和考生真实姓名。
(3) 语句连贯，词数 80 左右。作文开头已给出，不计入总词数。

开头：
Dear Peter,
Our school and the city museum will hold an event for us to get a taste of a folk custom. We are invited to vote for our favorite, and lion dance comes first now.`,
    requirements: ['邮件格式', '词数80左右', '包含选择及理由', '可适当拓展'],
    minWords: 70, maxWords: 90
  },
  {
    id: 'j2', grade: 'junior', level: '广东中考', totalScore: 15,
    opening: 'This summer, our school plans to organize study trips to different places.',
    title: '暑假研学活动',
    description: `假设你是李华。你校为同学们暑假安排了四个研学地点：科技馆、博物馆、植物园、农场。请你写一篇短文，向校刊投稿，说出你最想去的地方并说明理由。

内容包括：
(1) 你选择的地点
(2) 你的理由（至少两点）
(3) 你的期待

注意：
(1) 可在内容提示的基础上适当拓展信息。
(2) 不能照抄原文；不得出现真实校名和考生真实姓名。
(3) 语句连贯，词数 80 左右。作文开头已给出。

开头：
This summer, our school plans to organize study trips to different places.`,
    requirements: ['短文投稿格式', '词数80左右', '至少两点理由', '可适当拓展'],
    minWords: 70, maxWords: 90
  },
  {
    id: 'j3', grade: 'junior', level: '广东中考', totalScore: 15,
    opening: 'Reading is a good hobby. Today I\'d like to share my favorite book with you.',
    title: '推荐一本好书',
    description: `假设你是李明，你校英语俱乐部正在举办"好书分享"活动。请你根据以下提示，用英语写一篇短文，推荐你最喜欢的一本书。

内容包括：
(1) 书名和作者
(2) 主要内容
(3) 你的推荐理由（至少两点）

注意：
(1) 可在内容提示的基础上适当拓展信息。
(2) 不能照抄原文；不得出现真实校名和考生真实姓名。
(3) 语句连贯，词数 80 左右。作文开头已给出。

开头：
Reading is a good hobby. Today I'd like to share my favorite book with you.`,
    requirements: ['短文格式', '词数80左右', '包含书名/作者/内容/理由', '可适当拓展'],
    minWords: 70, maxWords: 90
  },
  {
    id: 'j4', grade: 'junior', level: '广东中考', totalScore: 15,
    opening: 'Dear Mike,\nI\'m sorry to hear that you don\'t feel well these days. Here is some advice for you.',
    title: '如何保持健康',
    description: `假设你是李华，你的英国笔友 Mike 来信说他最近经常感冒，感觉很疲惫。请你给他回复一封邮件，给他一些保持健康的建议。

内容包括：
(1) 作息方面
(2) 饮食方面
(3) 运动方面

注意：
(1) 可在内容提示的基础上适当拓展信息。
(2) 不能照抄原文；不得出现真实校名和考生真实姓名。
(3) 语句连贯，词数 80 左右。作文开头已给出。

开头：
Dear Mike,
I'm sorry to hear that you don't feel well these days. Here is some advice for you.`,
    requirements: ['邮件格式', '词数80左右', '三个方面建议', '语句连贯'],
    minWords: 70, maxWords: 90
  },
  {
    id: 'j5', grade: 'junior', level: '广东中考', totalScore: 15,
    opening: 'My hometown is a beautiful place. Let me tell you something about it.',
    title: '我的家乡',
    description: `假设你是李明，你校英语报正在举办"My Hometown"主题征文活动。请你根据以下提示，写一篇短文介绍你的家乡。

内容包括：
(1) 地理位置和自然环境
(2) 特色食物或景点
(3) 你对家乡的感情

注意：
(1) 可在内容提示的基础上适当拓展信息。
(2) 不能照抄原文；不得出现真实校名和考生真实姓名。
(3) 语句连贯，词数 80 左右。作文开头已给出。

开头：
My hometown is a beautiful place. Let me tell you something about it.`,
    requirements: ['短文格式', '词数80左右', '地理/特色/感情', '可适当拓展'],
    minWords: 70, maxWords: 90
  },
  {
    id: 'j6', grade: 'junior', level: '广东中考', totalScore: 15,
    opening: 'Among all my trips, the one to _____ is the most special.',
    title: '一次难忘的旅行',
    description: `假设你是李华，你校英语报正在征集"A Special Trip"主题短文。请你根据以下提示，写一篇短文介绍你印象最深的一次旅行。

内容包括：
(1) 时间和地点
(2) 旅行中做了什么
(3) 为什么难忘

注意：
(1) 可在内容提示的基础上适当拓展信息。
(2) 不能照抄原文；不得出现真实校名和考生真实姓名。
(3) 语句连贯，词数 80 左右。作文开头已给出。

开头：
Among all my trips, the one to _____ is the most special.`,
    requirements: ['短文格式', '词数80左右', '时间/活动/感受', '过去时态'],
    minWords: 70, maxWords: 90
  },
  {
    id: 'j7', grade: 'junior', level: '广东中考', totalScore: 15,
    opening: 'Different people like different subjects. As for me, my favorite subject is _____.',
    title: '我最喜欢的科目',
    description: `假设你是李明，你校英语报正在开展"My Favorite Subject"征文活动。请你根据以下提示，写一篇短文介绍你最喜欢的科目。

内容包括：
(1) 你最喜欢的科目是什么
(2) 你喜欢它的理由（至少两点）
(3) 你在这门课上的收获

注意：
(1) 可在内容提示的基础上适当拓展信息。
(2) 不能照抄原文；不得出现真实校名和考生真实姓名。
(3) 语句连贯，词数 80 左右。作文开头已给出。

开头：
Different people like different subjects. As for me, my favorite subject is _____.`,
    requirements: ['短文格式', '词数80左右', '科目名称/理由/收获', '可适当拓展'],
    minWords: 70, maxWords: 90
  },
  {
    id: 'j8', grade: 'junior', level: '广东中考', totalScore: 15,
    opening: 'Hello everyone! I\'m Li Hua. Today I\'m glad to share my experience in learning English with you.',
    title: '英语学习经验分享',
    description: `假设你是李华，你校英语俱乐部邀请你在活动中分享英语学习经验。请你根据以下提示，准备一篇发言稿。

内容包括：
(1) 你的英语学习方法
(2) 遇到困难时如何克服
(3) 给同学们的建议

注意：
(1) 可在内容提示的基础上适当拓展信息。
(2) 不能照抄原文；不得出现真实校名和考生真实姓名。
(3) 语句连贯，词数 80 左右。作文开头已给出。

开头：
Hello everyone! I'm Li Hua. Today I'm glad to share my experience in learning English with you.`,
    requirements: ['发言稿格式', '词数80左右', '方法/困难/建议', '可适当拓展'],
    minWords: 70, maxWords: 90
  },
  {
    id: 'j9', grade: 'junior', level: '广东中考', totalScore: 15,
    opening: 'Dear schoolmates,\nOur school is launching a "Green Campus" activity. As students, it\'s our duty to protect the environment.',
    title: '环保倡议',
    description: `假设你是李明，你校正在开展"绿色校园"活动。请你根据以下提示，用英语写一篇倡议书，号召同学们共同保护校园环境。

内容包括：
(1) 环保的重要性
(2) 具体做法（至少三点）
(3) 发出号召

注意：
(1) 可在内容提示的基础上适当拓展信息。
(2) 不能照抄原文；不得出现真实校名和考生真实姓名。
(3) 语句连贯，词数 80 左右。作文开头已给出。

开头：
Dear schoolmates,
Our school is launching a "Green Campus" activity. As students, it's our duty to protect the environment.`,
    requirements: ['倡议书格式', '词数80左右', '三点具体做法', '可适当拓展'],
    minWords: 70, maxWords: 90
  },
  {
    id: 'j10', grade: 'junior', level: '广东中考', totalScore: 15,
    opening: 'Dear David,\nI\'m glad to hear that you\'re interested in Chinese traditional festivals. I\'d like to introduce my favorite one to you.',
    title: '给交换生介绍中国节日',
    description: `假设你是李明，你的加拿大交换生同学 David 对中国传统节日很感兴趣。请你根据以下提示，写一封邮件向他介绍一个你最喜欢的中国传统节日。

内容包括：
(1) 节日名称和时间
(2) 庆祝方式（至少两点）
(3) 这个节日的意义

注意：
(1) 可在内容提示的基础上适当拓展信息。
(2) 不能照抄原文；不得出现真实校名和考生真实姓名。
(3) 语句连贯，词数 80 左右。作文开头已给出。

开头：
Dear David,
I'm glad to hear that you're interested in Chinese traditional festivals. I'd like to introduce my favorite one to you.`,
    requirements: ['邮件格式', '词数80左右', '时间/庆祝/意义', '可适当拓展'],
    minWords: 70, maxWords: 90
  },
]

const SENIOR_TASKS: WritingTask[] = [
  {
    id: 's1', grade: 'senior', level: '新高考', type: '应用文', totalScore: 15,
    opening: 'Dear Jim,\nI\'m glad to know that you\'re going to take part in the UN Youth Proposal Campaign.',
    title: '倡议征集回复',
    description: `假设你是红星中学高三学生李华。联合国正面向全球青少年开展倡议征集活动。你的外国好友 Jim 打算参加，为此发来邮件，就倡议内容询问你的建议。请你用英文给他回复，内容包括：

(1) 提出的建议
(2) 建议的理由

提示词：倡议 proposal

注意：
(1) 词数 100 左右；
(2) 开头和结尾已给出，不计入总词数。

开头：
Dear Jim,
I'm glad to know that you're going to take part in the UN Youth Proposal Campaign.

结尾：
I hope my suggestions are helpful. Good luck!
Yours,
Li Hua`,
    requirements: ['建议内容清晰', '理由充分有说服力', '词数100左右', '书信格式'],
    minWords: 90, maxWords: 110
  },
  {
    id: 's2', grade: 'senior', level: '新高考', type: '应用文', totalScore: 15,
    opening: 'Dear Mr. Smith,\nI\'m writing on behalf of the Student Union to invite you to be a judge for our English Speech Contest.',
    title: '邀请外教担任评委',
    description: `假设你是李华，你校学生会计划举办一场英语演讲比赛，请你给外教 Mr. Smith 写一封邮件，邀请他担任评委。

内容包括：
(1) 比赛基本信息（时间、地点、主题）
(2) 邀请他担任评委的理由
(3) 期待他的回复

注意：
(1) 词数 100 左右；
(2) 可以适当增加细节，以使行文连贯；
(3) 开头和结尾已给出。

开头：
Dear Mr. Smith,
I'm writing on behalf of the Student Union to invite you to be a judge for our English Speech Contest.

结尾：
We would be honored if you could join us. Looking forward to your reply.
Yours sincerely,
Li Hua`,
    requirements: ['书信格式', '词数100左右', '信息完整', '语气礼貌'],
    minWords: 90, maxWords: 110
  },
  {
    id: 's3', grade: 'senior', level: '新高考', type: '应用文', totalScore: 15,
    opening: 'Dear Zhang Ming,\nI\'m sorry to hear that you\'re having trouble adjusting to your new school life.',
    title: '建议信——如何适应新环境',
    description: `假设你是李华，你的表弟张明刚升入高一，对新环境感到不适应，来信向你寻求建议。请你给他回信。

内容包括：
(1) 表示理解和安慰
(2) 提出具体建议（至少两点）
(3) 表达祝愿

注意：
(1) 词数 100 左右；
(2) 可以适当增加细节，以使行文连贯；
(3) 开头和结尾已给出。

开头：
Dear Zhang Ming,
I'm sorry to hear that you're having trouble adjusting to your new school life.

结尾：
I believe you'll make it. Best wishes!
Yours,
Li Hua`,
    requirements: ['书信格式', '词数100左右', '建议具体可行', '语气亲切'],
    minWords: 90, maxWords: 110
  },
  {
    id: 's4', grade: 'senior', level: '新高考', type: '应用文', totalScore: 15,
    opening: 'Dear Sir or Madam,\nI\'m Li Hua, a senior high school student. I\'m writing to apply for the volunteer position in the "Caring for the Elderly" activity.',
    title: '申请做志愿者',
    description: `假设你是李华，暑假期间你校将与社区合作举办"关爱老人"志愿服务活动。请你写一封申请信，申请成为志愿者。

内容包括：
(1) 写信目的
(2) 你的优势（性格、能力、经验等）
(3) 你的承诺

注意：
(1) 词数 100 左右；
(2) 可以适当增加细节，以使行文连贯；
(3) 开头和结尾已给出。

开头：
Dear Sir or Madam,
I'm Li Hua, a senior high school student. I'm writing to apply for the volunteer position in the "Caring for the Elderly" activity.

结尾：
I would appreciate it if you could give me a chance.
Yours faithfully,
Li Hua`,
    requirements: ['申请信格式', '词数100左右', '突出个人优势', '语气正式礼貌'],
    minWords: 90, maxWords: 110
  },
  {
    id: 's5', grade: 'senior', level: '新高考', type: '应用文', totalScore: 15,
    opening: 'Notice\nIn order to improve our English speaking skills, the Student Union will hold the first English Corner of this semester.',
    title: '通知——英语角活动',
    description: `假设你是李华，你校学生会将举办本学期第一期英语角活动。请你用英语写一则通知，向全校同学发布。

内容包括：
(1) 活动时间、地点
(2) 活动内容（主题讨论、自由交流等）
(3) 鼓励参加

注意：
(1) 词数 100 左右；
(2) 可以适当增加细节，以使行文连贯；
(3) 开头已给出。

开头：
Notice
In order to improve our English speaking skills, the Student Union will hold the first English Corner of this semester.`,
    requirements: ['通知格式', '词数100左右', '信息准确完整', '语气正式'],
    minWords: 90, maxWords: 110
  },
  {
    id: 's6', grade: 'senior', level: '新高考', type: '应用文', totalScore: 15,
    opening: 'Good morning, everyone! Today I\'m going to talk about how science and technology changes our life.',
    title: '演讲稿——科技改变生活',
    description: `假设你是李华，你校将举办以"Science and Technology Changes Our Life"为主题的英语演讲比赛。请你写一篇演讲稿参赛。

内容包括：
(1) 科技对生活的影响
(2) 举例说明
(3) 呼吁合理使用科技

注意：
(1) 词数 100 左右；
(2) 可以适当增加细节，以使行文连贯；
(3) 开头已给出。

开头：
Good morning, everyone! Today I'm going to talk about how science and technology changes our life.`,
    requirements: ['演讲稿格式', '词数100左右', '有说服力', '结构清晰'],
    minWords: 90, maxWords: 110
  },
  {
    id: 's7', grade: 'senior', level: '新高考', type: '读后续写', totalScore: 25,
    opening: 'The old woman smiled gratefully at the young man.',
    title: '雨中的帮助',
    description: `阅读下面材料，根据其内容和所给段落开头语续写两段，使之构成一篇完整的短文。

I was walking home from school when it suddenly started raining heavily. I didn't have an umbrella, so I ran quickly to a nearby shop to take shelter. Standing there, I saw an old woman struggling to carry her heavy bags in the rain. Just then, a young man ran up to her and offered his umbrella.

注意：
(1) 续写词数应为 150 左右；
(2) 请按如下格式作答。

Paragraph 1:
The old woman smiled gratefully at the young man.

Paragraph 2:
Seeing this, I felt a warmth spreading in my heart.`,
    requirements: ['两段续写', '词数150左右', '情节合理连贯', '有情感升华'],
    minWords: 130, maxWords: 170
  },
  {
    id: 's8', grade: 'senior', level: '新高考', type: '读后续写', totalScore: 25,
    opening: 'Taking a deep breath, Li Ming stepped onto the stage.',
    title: '一次演讲比赛',
    description: `阅读下面材料，根据其内容和所给段落开头语续写两段，使之构成一篇完整的短文。

Li Ming had always been a shy boy, afraid of speaking in public. However, his English teacher encouraged him to take part in the school English speech contest. After days of hesitation, he finally agreed. On the day of the contest, he stood backstage, his heart beating fast.

注意：
(1) 续写词数应为 150 左右；
(2) 请按如下格式作答。

Paragraph 1:
Taking a deep breath, Li Ming stepped onto the stage.

Paragraph 2:
When the result was announced, Li Ming couldn't believe his ears.`,
    requirements: ['两段续写', '词数150左右', '心理描写生动', '结局有成长'],
    minWords: 130, maxWords: 170
  },
  {
    id: 's9', grade: 'senior', level: '新高考', type: '概要写作', totalScore: 25, opening: '',
    title: 'Summary: The Importance of Teamwork',
    description: `阅读下面短文，写一篇 60 词左右的概要。

Teamwork is essential in almost every aspect of our lives. In the workplace, teams can accomplish more than individuals working alone because different members bring different skills and perspectives. Studies show that companies with strong team cultures are more productive and innovative. In sports, teamwork is equally important — a basketball team cannot win with just one star player; every member must work together. Moreover, teamwork teaches us communication and compromise. When we work with others, we learn to listen to different opinions and find common ground. These skills are valuable not only in professional settings but also in personal relationships. In conclusion, being able to work well with others is one of the most important skills we can develop.

注意：
(1) 词数 60 左右；
(2) 不得照抄原文；
(3) 使用自己的语言概括要点。`,
    requirements: ['词数60左右', '概括要点', '不照抄原文', '使用自己的语言'],
    minWords: 50, maxWords: 70
  },
  {
    id: 's10', grade: 'senior', level: '新高考', type: '概要写作', totalScore: 25, opening: '',
    title: 'Summary: Social Media and Teenagers',
    description: `阅读下面短文，写一篇 60 词左右的概要。

Social media has become an important part of teenagers' lives. On the positive side, it allows them to stay connected with friends, learn about current events, and express themselves creatively. Many teenagers use platforms like Instagram and TikTok to share their interests and build communities around shared hobbies. However, there are also concerns. Studies have found that excessive use of social media can lead to anxiety, poor sleep quality, and reduced face-to-face social skills. Cyberbullying is another serious issue that affects many young people. Experts suggest that parents should help their children develop healthy digital habits by setting time limits and encouraging offline activities. The key is to find a balance between the online world and real life.

注意：
(1) 词数 60 左右；
(2) 不得照抄原文；
(3) 使用自己的语言概括要点。`,
    requirements: ['词数60左右', '概括要点', '不照抄原文', '使用自己的语言'],
    minWords: 50, maxWords: 70
  },
  {
    id: 's11', grade: 'senior', level: '新高考', type: '主题写作', totalScore: 25,
    opening: 'With the rapid development of artificial intelligence, education is going through great changes.',
    title: 'AI与未来教育',
    description: `假设你是李华，你校英语报正在举办以"AI and Future Education"为题的征文比赛。请你写一篇短文参赛。

内容包括：
(1) AI 在教育中的应用现状
(2) AI 对未来教育的影响（利与弊）
(3) 你的观点

注意：
(1) 词数 120 左右；
(2) 可以适当增加细节，以使行文连贯。

开头：
With the rapid development of artificial intelligence, education is going through great changes.`,
    requirements: ['词数120左右', '论述全面', '结构清晰', '有自己的观点'],
    minWords: 100, maxWords: 130
  },
  {
    id: 's12', grade: 'senior', level: '新高考', type: '主题写作', totalScore: 25,
    opening: 'Last week, our school held a "Traditional Culture on Campus" activity, which left a deep impression on me.',
    title: '传统文化的传承',
    description: `假设你是李华，你校举办了"传统文化进校园"活动。请你根据以下提示，用英语写一篇短文，向校刊投稿。

内容包括：
(1) 活动描述（你参加了什么项目）
(2) 你的感受和收获
(3) 对传统文化传承的看法

注意：
(1) 词数 120 左右；
(2) 可以适当增加细节，以使行文连贯。

开头：
Last week, our school held a "Traditional Culture on Campus" activity, which left a deep impression on me.`,
    requirements: ['词数120左右', '活动描述具体', '有个人感悟', '观点积极'],
    minWords: 100, maxWords: 130
  },
]

function getTasksByGrade(grade: 'junior' | 'senior'): WritingTask[] {
  return grade === 'junior' ? JUNIOR_TASKS : SENIOR_TASKS
}

function getTodaysTask(grade: 'junior' | 'senior'): WritingTask {
  const tasks = getAllTasks(grade)
  const today = new Date()
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000)
  const index = dayOfYear % tasks.length
  return tasks[index]
}

function stripTemplateFromDesc(text: string): string {
  const idx = text.lastIndexOf('开头：')
  return idx >= 0 ? text.substring(0, idx).trim() : text.trim()
}

function getWordCount(text: string): number {
  const cleaned = text.trim()
  if (!cleaned) return 0
  return cleaned.split(/\s+/).length
}

function genId(): string {
  return Math.random().toString(36).substring(2, 10)
}

const GRADE_COLORS = {
  junior: { primary: 'from-emerald-500 to-green-600', secondary: 'from-green-50 to-emerald-50', text: 'text-green-700', badge: 'bg-green-100 text-green-700', border: 'border-green-200', accent: '#10b981' },
  senior: { primary: 'from-blue-500 to-indigo-600', secondary: 'from-blue-50 to-indigo-50', text: 'text-indigo-700', badge: 'bg-indigo-100 text-indigo-700', border: 'border-indigo-200', accent: '#6366f1' },
}

const STORAGE_KEYS = {
  submissions: 'writing_submissions',
  rankings: 'writing_rankings',
  excellentWorks: 'writing_excellent_works',
  teacherTasks: 'writing_teacher_tasks',
}

function getAllTasks(grade: 'junior' | 'senior'): WritingTask[] {
  const systemTasks = grade === 'junior' ? JUNIOR_TASKS : SENIOR_TASKS
  const teacherTasks = getTeacherTasks().filter(t => t.grade === grade)
  return [...teacherTasks, ...systemTasks]
}

let _teacherTaskCache: WritingTask[] | null = null

function getTeacherTasks(): WritingTask[] {
  if (_teacherTaskCache) return _teacherTaskCache
  try {
    _teacherTaskCache = JSON.parse(localStorage.getItem(STORAGE_KEYS.teacherTasks) || '[]')
    return _teacherTaskCache
  } catch { return [] }
}

function setTeacherTaskCache() {
  try {
    _teacherTaskCache = JSON.parse(localStorage.getItem(STORAGE_KEYS.teacherTasks) || '[]')
  } catch { _teacherTaskCache = [] }
}

async function loadTeacherTasksFromServer() {
  try {
    const data = await writingTasksAPI.fetchAll()
    if (data && data.length > 0) {
      localStorage.setItem(STORAGE_KEYS.teacherTasks, JSON.stringify(data))
      setTeacherTaskCache()
    }
  } catch {}
  setTeacherTaskCache()
}

async function saveTeacherTask(task: WritingTask) {
  try {
    await writingTasksAPI.save(task)
  } catch {}
  const list = getTeacherTasks()
  list.push(task)
  localStorage.setItem(STORAGE_KEYS.teacherTasks, JSON.stringify(list))
  _teacherTaskCache = list
}

async function deleteTeacherTask(id: string) {
  try {
    await writingTasksAPI.remove(id)
  } catch {}
  const list = getTeacherTasks().filter(t => t.id !== id)
  localStorage.setItem(STORAGE_KEYS.teacherTasks, JSON.stringify(list))
  _teacherTaskCache = list
}

function TeacherTaskCreator({ grade, onCreated, onClose }: { grade: 'junior' | 'senior'; onCreated: () => void; onClose?: () => void }) {
  const [form, setForm] = useState({ title: '', description: '', requirements: '', level: '', minWords: '80', maxWords: '120', totalScore: '15', type: '', opening: '', closing: '' })
  const [formMsg, setFormMsg] = useState('')
  const [myTasks, setMyTasks] = useState<WritingTask[]>([])

  useEffect(() => { setMyTasks(getTeacherTasks().filter(t => t.grade === grade)) }, [grade])

  function handleCreate() {
    if (!form.title.trim() || !form.description.trim()) { setFormMsg('请填写标题和题目描述'); return }
    const task: WritingTask = {
      id: 'teacher_' + genId(), grade, level: form.level || '教师命题',
      title: form.title.trim(), description: form.description.trim(),
      requirements: form.requirements.split('\n').filter(Boolean).map(r => r.trim()),
      minWords: parseInt(form.minWords) || 80, maxWords: parseInt(form.maxWords) || 120,
      totalScore: parseInt(form.totalScore) || 15, type: form.type || undefined,
      opening: form.opening || '', closing: form.closing || '',
    }
    saveTeacherTask(task)
    setMyTasks(getTeacherTasks().filter(t => t.grade === grade))
    setForm({ title: '', description: '', requirements: '', level: '', minWords: '80', maxWords: '120', totalScore: '15', type: '', opening: '', closing: '' })
    setFormMsg('命题发布成功！')
    onCreated()
    setTimeout(() => setFormMsg(''), 3000)
  }

  function handleDelete(id: string) { deleteTeacherTask(id); setMyTasks(getTeacherTasks().filter(t => t.grade === grade)); onCreated() }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-rose-100 p-5">
      <div className="flex items-center gap-2 mb-4">
        <PenLine className="w-4 h-4 text-rose-500" />
        <h3 className="font-semibold text-slate-800 text-sm">发布命题</h3>
        {onClose && (
          <button onClick={onClose} className="ml-auto text-xs text-slate-400 hover:text-slate-600 px-2 py-1 rounded-lg hover:bg-slate-100">
            关闭
          </button>
        )}
      </div>

      <div className="space-y-3">
        <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
          placeholder="作文题目（必填）" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-rose-300" />
        <div className="grid grid-cols-2 gap-2">
          <input value={form.level} onChange={e => setForm(p => ({ ...p, level: e.target.value }))}
            placeholder="年级标注（如：初三/广东中考）" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-rose-300" />
          <input value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
            placeholder="题型（如：应用文/续写）" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-rose-300" />
        </div>
        <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
          placeholder="场景描述、提示要点、注意项等（必填）" rows={5}
          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-rose-300 resize-y" />
        <div className="grid grid-cols-2 gap-2">
          <textarea value={form.opening} onChange={e => setForm(p => ({ ...p, opening: e.target.value }))}
            placeholder="开头句（选填）" rows={2}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-rose-300 resize-y" />
          <textarea value={form.closing} onChange={e => setForm(p => ({ ...p, closing: e.target.value }))}
            placeholder="结尾（选填，如：Yours, Li Hua）" rows={2}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-rose-300 resize-y" />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <input value={form.minWords} onChange={e => setForm(p => ({ ...p, minWords: e.target.value }))}
            placeholder="最少词数" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-rose-300" />
          <input value={form.maxWords} onChange={e => setForm(p => ({ ...p, maxWords: e.target.value }))}
            placeholder="最多词数" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-rose-300" />
          <input value={form.totalScore} onChange={e => setForm(p => ({ ...p, totalScore: e.target.value }))}
            placeholder="满分" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-rose-300" />
        </div>
        <textarea value={form.requirements} onChange={e => setForm(p => ({ ...p, requirements: e.target.value }))}
          placeholder="写作要求（每行一条，如：邮件格式、词数80左右）" rows={3}
          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-rose-300 resize-y" />
        <button onClick={handleCreate}
          className="w-full py-2.5 rounded-xl text-white text-sm font-medium bg-gradient-to-r from-rose-500 to-pink-600 shadow-md hover:shadow-lg transition-all">
          发布命题
        </button>
        {formMsg && <p className={`text-xs text-center ${formMsg.includes('成功') ? 'text-green-600' : 'text-red-500'}`}>{formMsg}</p>}
      </div>

      {myTasks.length > 0 && (
        <div className="mt-4 pt-4 border-t border-dashed border-slate-200">
          <h4 className="text-xs font-semibold text-slate-500 mb-2">已发布的命题（{myTasks.length}）</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {myTasks.map(t => (
              <div key={t.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-slate-700 truncate">{t.title}</div>
                  <div className="text-xs text-slate-400">{t.minWords}-{t.maxWords}词 · 满分{t.totalScore} · {t.level || '教师命题'}</div>
                </div>
                <button onClick={() => handleDelete(t.id)} className="text-xs text-red-400 hover:text-red-600 ml-2 shrink-0">删除</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function WritingGrowthPage() {
  const [grade, setGrade] = useState<'junior' | 'senior'>('junior')
  const [phase, setPhase] = useState<'task' | 'writing' | 'grading' | 'result' | 'revising' | 'final'>('task')
  const [task, setTask] = useState<WritingTask | null>(null)
  const [content, setContent] = useState('')
  const [reviewResult, setReviewResult] = useState<ReviewResult | null>(null)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [draft1, setDraft1] = useState<{ content: string; scores: ReviewResult } | null>(null)
  const [draft2, setDraft2] = useState<{ content: string; scores: ReviewResult } | null>(null)
  const [improvement, setImprovement] = useState<Improvement | null>(null)
  const [leaderboard, setLeaderboard] = useState<{ junior: RankEntry[]; senior: RankEntry[] }>({ junior: [], senior: [] })
  const [excellentWorks, setExcellentWorks] = useState<ExcellentWork[]>([])
  const [showTeacherView, setShowTeacherView] = useState(false)
  const [loading, setLoading] = useState(false)
  const [gradingStream, setGradingStream] = useState('')
  const [showAllRankings, setShowAllRankings] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'write' | 'leaderboard' | 'works'>('write')
  const [showTeacherTasks, setShowTeacherTasks] = useState(false)
  const [viewingWork, setViewingWork] = useState<ExcellentWork | null>(null)
  const [teacherTaskList, setTeacherTaskList] = useState<WritingTask[]>([])
  const [showTeacherPanel, setShowTeacherPanel] = useState(false)
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [teacherComment, setTeacherComment] = useState(() => { try { return localStorage.getItem('writing_teacher_comment') || '' } catch { return '' } })
  const [sharedKey, setSharedKey] = useState(() => getSharedApiKey() || '')
  const [showHistory, setShowHistory] = useState(false)
  const [submissions, setSubmissions] = useState<any[]>([])
  const [viewingSubmission, setViewingSubmission] = useState<any | null>(null)

  function loadSubmissions() {
    try { setSubmissions(JSON.parse(localStorage.getItem(STORAGE_KEYS.submissions) || '[]')) } catch {}
  }

  useEffect(() => { loadSubmissions() }, [])

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    loadLeaderboard()
    loadExcellentWorks()
    loadTeacherTasksFromServer().then(() => {
      setTeacherTaskList(getTeacherTasks())
      setTask(getTodaysTask(grade))
    })
    // 尝试从服务器加载共享API密钥
    sharedConfigAPI.get('shared_api_key').then(remoteKey => {
      if (remoteKey && !getApiKey() && !getSharedApiKey()) {
        setSharedApiKey(remoteKey)
        setSharedKey(remoteKey)
      }
    })
  }, [])

  useEffect(() => {
    setTask(getTodaysTask(grade))
  }, [grade])

  async function loadLeaderboard() {
    try {
      const data = await writingRankingAPI.fetchAll()
      if (data) {
        const filtered = {
          junior: (data.junior || []).filter((r: RankEntry) => r.studentName && r.studentName !== '匿名同学'),
          senior: (data.senior || []).filter((r: RankEntry) => r.studentName && r.studentName !== '匿名同学'),
        }
        setLeaderboard(filtered)
      }
    } catch {}
  }

  async function loadExcellentWorks() {
    try {
      const data = await writingExcellentAPI.fetchAll()
      if (data) setExcellentWorks(data.filter((w: ExcellentWork) => w.studentName && w.studentName !== '匿名同学'))
    } catch {}
  }

  function saveSubmission(content: string, scores: ReviewResult) {
    try {
      const existing = JSON.parse(localStorage.getItem(STORAGE_KEYS.submissions) || '[]')
      existing.push({
        id: genId(),
        grade,
        taskId: task?.id,
        taskTitle: task?.title,
        content,
        scores,
        date: new Date().toISOString(),
      })
      localStorage.setItem(STORAGE_KEYS.submissions, JSON.stringify(existing))
    } catch {}
  }

  async function addToLeaderboard(name: string, score: number, total: number) {
    if (!name || name === '匿名同学') return
    try {
      const today = new Date().toDateString()
      const entry: RankEntry = {
        studentName: name,
        score,
        total,
        taskTitle: task?.title || '',
        submissionId: today + '_' + genId(),
        grade,
      }
      await writingRankingAPI.save(entry)
      loadLeaderboard()
    } catch {}
  }

  async function checkExcellentWork(scores: ReviewResult, essayContent: string) {
    const pct = scores.total / scores.maxTotal
    if (pct >= 0.85) {
      const name = prompt('优秀作文！请输入你的名字上榜：')
      if (!name || name.trim() === '' || name === '匿名同学') return
      const work: ExcellentWork = {
        id: genId(),
        studentName: name.trim(),
        taskTitle: task?.title || '',
        content: essayContent,
        scores,
        highlights: [],
        date: new Date().toISOString(),
      }
      await writingExcellentAPI.save(work)
      loadExcellentWorks()
      addToLeaderboard(name.trim(), scores.total, scores.maxTotal)
    }
  }

  async function handleSubmit() {
    if (!content.trim()) return
    if (!getApiKey() && !getSharedApiKey()) {
      setError('⚠️ 未设置API密钥。请老师在「教师工作台」设置共享密钥，或个人在设置中填入 DeepSeek API 密钥')
      setPhase('task')
      return
    }
    setPhase('grading')
    setLoading(true)
    setError(null)
    setGradingStream('')

    const wordCount = getWordCount(content)
    if (task && wordCount < task.minWords) {
      setError(`字数不足：当前${wordCount}词，建议至少${task.minWords}词`)
      setPhase('writing')
      setLoading(false)
      return
    }

    try {
      const maxPerDim = Math.round((task?.totalScore || 80) / 4)
      const totalMax = task?.totalScore || 80
      const gradeLabel = grade === 'junior' ? '初中' : '高中'
      const simpleRule = grade === 'junior' ? '注意：批改评语和修改建议用简单英语，词汇不超出初中水平（1800词以内），不要用复杂词汇。' : ''

      const gradingPrompt = `你是一位专业的中学英语教师，请对以下学生作文进行详细批改。

题目：${task?.title || ''}
要求：${task?.requirements?.join('; ') || ''}
年级：${gradeLabel}

学生作文：
"""
${content}
"""

请从以下4个维度评分，每个维度满分${maxPerDim}分，总分满分${totalMax}分。给出具体问题和修改建议。

${simpleRule}

批改格式要求：
请严格按照以下JSON格式回复（不要加任何markdown标记，纯JSON）：

{
  "content": {
    "dimension": "内容",
    "score": <数字0-${maxPerDim}>,
    "maxScore": ${maxPerDim},
    "comment": "<内容方面的评语>",
    "details": [
      { "issue": "<问题描述>", "original": "<原句>", "corrected": "<修改句>", "note": "<语法说明>" }
    ]
  },
  "language": {
    "dimension": "语言",
    "score": <数字0-${maxPerDim}>,
    "maxScore": ${maxPerDim},
    "comment": "<语言方面的评语>",
    "details": [
      { "issue": "<问题描述>", "original": "<原句>", "corrected": "<修改句>", "note": "<语法说明>" }
    ]
  },
  "structure": {
    "dimension": "结构",
    "score": <数字0-${maxPerDim}>,
    "maxScore": ${maxPerDim},
    "comment": "<结构方面的评语>",
    "details": []
  },
  "advanced": {
    "dimension": "高级表达",
    "score": <数字0-${maxPerDim}>,
    "maxScore": ${maxPerDim},
    "comment": "<高级表达方面的评语>",
    "details": []
  },
  "total": <内容分+语言分+结构分+高级表达分>,
  "maxTotal": ${totalMax},
  "comment": "<总评语，鼓励为主>"
}

注意：评分要严格，不要给虚高分数。指出具体问题并给出修改。`

      const result = await sendToDeepSeekSync([{ role: 'user', content: gradingPrompt }])
      const parsed = JSON.parse(result) as ReviewResult
      setReviewResult(parsed)
      setDraft1({ content, scores: parsed })
      saveSubmission(content, parsed)
      checkExcellentWork(parsed, content)

      const simpleRuleSug = grade === 'junior' ? '注意：修改建议用简单英语，词汇不超出初中1800词范围。用词升级要适度，不要用初中生没学过的词汇。' : ''
      const suggestionPrompt = `你是一位专业的英语写作导师。请为以下作文提供具体的修改建议。

题目：${task?.title || ''}
年级：${grade === 'junior' ? '初中' : '高中'}
学生作文：
"""
${content}
"""

请从词汇、句型、连贯性三个方面，给出5-8条具体的"原句 → 优化句"修改建议。

${simpleRuleSug}

请严格按照以下JSON格式回复（纯JSON数组，不要markdown标记）：
[
  {
    "original": "<原句>",
    "optimized": "<优化后的句子>",
    "note": "<为什么这样改的解释>"
  }
]

每条建议应该：
1. 保留原句大意
2. 使用更合适的词汇或句型
3. 说明提升点（如：用词升级、句式变化、连接词添加等）`

      const sugResult = await sendToDeepSeekSync([{ role: 'user', content: suggestionPrompt }])
      const sugParsed = JSON.parse(sugResult) as Suggestion[]
      setSuggestions(sugParsed)

      setPhase('result')
    } catch (e: any) {
      setError(e.message || '批改失败，请重试')
      // 保存草稿，防止内容丢失
      try {
        const existing = JSON.parse(localStorage.getItem(STORAGE_KEYS.submissions) || '[]')
        existing.push({
          id: genId(), grade, taskId: task?.id, taskTitle: task?.title,
          content, scores: null, date: new Date().toISOString(), failed: true,
        })
        localStorage.setItem(STORAGE_KEYS.submissions, JSON.stringify(existing))
        loadSubmissions()
      } catch {}
      setPhase('task')
    }
    setLoading(false)
  }

  async function handleResubmit() {
    if (!content.trim()) return
    setPhase('grading')
    setLoading(true)
    setError(null)
    setGradingStream('')

    try {
      const maxPerDim = Math.round((task?.totalScore || 80) / 4)
      const totalMax = task?.totalScore || 80
      const simpleRule = grade === 'junior' ? '注意：批改评语和修改建议用简单英语，词汇不超出初中水平（1800词以内）。' : ''

      const gradingPrompt = `你是一位专业的中学英语教师，请对以下学生作文的修改稿进行详细批改。

题目：${task?.title || ''}
要求：${task?.requirements?.join('; ') || ''}
年级：${grade === 'junior' ? '初中' : '高中'}

学生修改稿：
"""
${content}
"""

${simpleRule}

请严格按照以下JSON格式回复（纯JSON，不要markdown标记）：
{
  "content": { "dimension": "内容", "score": <0-${maxPerDim}>, "maxScore": ${maxPerDim}, "comment": "<评语>", "details": [] },
  "language": { "dimension": "语言", "score": <0-${maxPerDim}>, "maxScore": ${maxPerDim}, "comment": "<评语>", "details": [] },
  "structure": { "dimension": "结构", "score": <0-${maxPerDim}>, "maxScore": ${maxPerDim}, "comment": "<评语>", "details": [] },
  "advanced": { "dimension": "高级表达", "score": <0-${maxPerDim}>, "maxScore": ${maxPerDim}, "comment": "<评语>", "details": [] },
  "total": <总分>,
  "maxTotal": ${totalMax},
  "comment": "<总评语>"
}`

      const result = await sendToDeepSeekSync([{ role: 'user', content: gradingPrompt }])
      const parsed = JSON.parse(result) as ReviewResult
      setReviewResult(parsed)
      setDraft2({ content, scores: parsed })
      saveSubmission(content, parsed)

      const before = draft1?.scores.total || 0
      const after = parsed.total
      const growthPoints = Math.min(Math.round((after - before) * 3), 100)

      const imp: Improvement = {
        beforeScore: before,
        afterScore: after,
        languageAccuracyBefore: draft1?.scores.language.score || 0,
        languageAccuracyAfter: parsed.language.score,
        growthPoints,
        details: [
          `总分：${before} → ${after}（+${after - before}分）`,
          `语言准确率：${Math.round((draft1?.scores.language.score || 0) / 20 * 100)}% → ${Math.round(parsed.language.score / 20 * 100)}%`,
          `成长值：+${growthPoints} WEGO`,
        ],
      }
      setImprovement(imp)
      setPhase('final')

      if (parsed.total / parsed.maxTotal >= 0.85) {
        checkExcellentWork(parsed, content)
      }
    } catch (e: any) {
      setError(e.message || '批改失败，请重试')
      setPhase('revising')
    }
    setLoading(false)
  }

  function handleStartWriting() {
    setPhase('writing')
    setContent('')
    setReviewResult(null)
    setSuggestions([])
    setDraft1(null)
    setDraft2(null)
    setImprovement(null)
    setError(null)
    setTimeout(() => textareaRef.current?.focus(), 100)
  }

  function handleRevise() {
    setPhase('revising')
    if (draft1) {
      setContent(draft1.content)
    }
  }

  function handleNewTask() {
    setPhase('task')
    setContent('')
    setReviewResult(null)
    setSuggestions([])
    setDraft1(null)
    setDraft2(null)
    setImprovement(null)
    setError(null)
    setTask(getTodaysTask(grade))
  }

  function getOverallGrade(pct: number): { label: string; color: string } {
    if (pct >= 0.9) return { label: '优秀', color: 'text-yellow-500' }
    if (pct >= 0.8) return { label: '良好', color: 'text-green-500' }
    if (pct >= 0.6) return { label: '中等', color: 'text-blue-500' }
    return { label: '继续努力', color: 'text-slate-500' }
  }

  const gc = GRADE_COLORS[grade]
  const wordCount = getWordCount(content)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-rose-50 to-amber-50">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <Link to="/learn" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-4">
          <ArrowLeft className="w-4 h-4" /> 返回学习中心
        </Link>

        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
            AI-Wego 英语写作成长空间
          </h1>
          <p className="text-slate-500 mt-1">每天一篇，让英语写作真正进步</p>
        </div>

        <div className="flex items-center justify-center gap-3 mb-6">
          <button onClick={() => setGrade('junior')} className={`px-6 py-2 rounded-full font-medium text-sm transition-all ${grade === 'junior' ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg shadow-green-200' : 'bg-white text-slate-600 border border-slate-200 hover:border-green-300'}`}>
            初中空间 <span className="text-xs opacity-70 ml-1">七/八/九年级</span>
          </button>
          <button onClick={() => setGrade('senior')} className={`px-6 py-2 rounded-full font-medium text-sm transition-all ${grade === 'senior' ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300'}`}>
            高中空间 <span className="text-xs opacity-70 ml-1">应用文/续写/概要</span>
          </button>
        </div>

        {/* API密钥状态栏 - 对所有用户可见 */}
        {!getApiKey() && !getSharedApiKey() && (
          <div className="mb-4 p-4 rounded-2xl bg-amber-50 border border-amber-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-amber-800">🔑 需要API密钥才能使用AI批改</p>
                <p className="text-xs text-amber-600 mt-0.5">请向老师获取密钥，粘贴到下面输入框</p>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <input value={sharedKey} onChange={e => { setSharedKey(e.target.value); setSharedApiKey(e.target.value); if (e.target.value) sharedConfigAPI.set('shared_api_key', e.target.value) }}
                  placeholder="粘贴共享API密钥..."
                  className="flex-1 sm:w-72 text-xs px-3 py-2 rounded-lg border border-amber-300 bg-white outline-none focus:border-amber-500"
                  type="password" />
              </div>
            </div>
          </div>
        )}

        {/* 教师工作台 */}
        <div className="flex flex-wrap items-center gap-2 mb-5 p-3 bg-white/80 rounded-2xl border border-dashed border-slate-200 backdrop-blur-sm">
          <button onClick={() => setShowTeacherPanel(!showTeacherPanel)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${showTeacherPanel ? 'bg-rose-100 text-rose-700 ring-1 ring-rose-200' : 'bg-slate-50 text-slate-500 hover:bg-rose-50 hover:text-rose-600 hover:ring-1 hover:ring-rose-200'}`}>
            {showTeacherPanel ? '关闭教师台' : '👨‍🏫 教师工作台'}
          </button>
          {showTeacherPanel && (
            <div className="w-full flex flex-wrap items-center gap-2 mt-2">
              <button onClick={() => setShowTaskForm(true)}
                className="px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-sm hover:shadow-md transition-all flex items-center gap-1.5">
                ➕ 发布写作任务
              </button>
              <span className="text-xs text-slate-400 px-2">
                已发布 {teacherTaskList.filter(t => t.grade === grade).length} 个任务
              </span>
              <button onClick={() => setShowTeacherView(!showTeacherView)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${showTeacherView ? 'bg-indigo-100 text-indigo-700' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}>
                📊 学生完成情况
              </button>
              <div className="flex items-center gap-2 ml-auto">
                <input value={sharedKey} onChange={e => { setSharedKey(e.target.value); setSharedApiKey(e.target.value); if (e.target.value) sharedConfigAPI.set('shared_api_key', e.target.value) }}
                  placeholder="设置共享API密钥（自动同步到服务器）"
                  className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-white outline-none focus:border-rose-300 w-64"
                  type="password" />
                {sharedKey && <span className="text-xs text-green-500">✓ 已设置</span>}
              </div>
            </div>
          )}
        </div>

        {/* 发布任务弹窗 */}
        {showTaskForm && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 pb-10 bg-black/30 backdrop-blur-sm overflow-y-auto" onClick={e => { if (e.target === e.currentTarget) setShowTaskForm(false) }}>
            <div className="w-full max-w-lg mx-4" onClick={e => e.stopPropagation()}>
              <TeacherTaskCreator grade={grade} onCreated={() => { setTeacherTaskList(getTeacherTasks()); setShowTaskForm(false) }} onClose={() => setShowTaskForm(false)} />
            </div>
          </div>
        )}

        {/* 历史批改详情弹窗 */}
        {viewingSubmission && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-6 pb-10 bg-black/30 backdrop-blur-sm overflow-y-auto" onClick={e => { if (e.target === e.currentTarget) setViewingSubmission(null) }}>
            <div className="w-full max-w-2xl mx-4 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between p-4 border-b border-slate-100">
                <div>
                  <h2 className="text-lg font-bold text-slate-800">{viewingSubmission.taskTitle || '历史批改'}</h2>
                  <p className="text-xs text-slate-400">{new Date(viewingSubmission.date).toLocaleString()} · {viewingSubmission.grade === 'junior' ? '初中' : '高中'}</p>
                </div>
                <button onClick={() => setViewingSubmission(null)} className="text-sm text-slate-400 hover:text-slate-600 px-3 py-1.5">关闭</button>
              </div>
              <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
                {viewingSubmission.failed && (
                  <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-center">
                    <p className="text-sm font-medium text-red-600">批改失败</p>
                    <p className="text-xs text-red-400 mt-1">提交时未收到AI评分，请检查API密钥后重新提交</p>
                  </div>
                )}
                {viewingSubmission.scores && (
                  <div className="grid grid-cols-2 gap-3">
                    <ScoreCard label="内容" score={viewingSubmission.scores.content?.score || 0} max={20} color="bg-blue-500" />
                    <ScoreCard label="语言" score={viewingSubmission.scores.language?.score || 0} max={20} color="bg-green-500" />
                    <ScoreCard label="结构" score={viewingSubmission.scores.structure?.score || 0} max={20} color="bg-purple-500" />
                    <ScoreCard label="高级表达" score={viewingSubmission.scores.advanced?.score || 0} max={20} color="bg-amber-500" />
                  </div>
                )}
                {viewingSubmission.scores?.comment && (
                  <div className="p-3 rounded-xl bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-100">
                    <p className="text-sm text-slate-700">{viewingSubmission.scores.comment}</p>
                  </div>
                )}
                {viewingSubmission.content && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-700 mb-2">你的作文</h3>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
                      {viewingSubmission.content}
                    </div>
                  </div>
                )}
                {viewingSubmission.scores?.language?.details?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-700 mb-2">语言问题修改</h3>
                    <div className="space-y-2">
                      {viewingSubmission.scores.language.details.map((d: any, i: number) => (
                        <div key={i} className="p-3 rounded-xl bg-red-50 border border-red-100">
                          <div className="text-xs text-red-500 mb-1">{d.issue}</div>
                          <div className="text-sm text-slate-500 line-through">{d.original}</div>
                          <div className="text-sm text-green-600 font-medium">{d.corrected}</div>
                          <div className="text-xs text-slate-400 mt-1">{d.note}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {viewingSubmission.content && !viewingSubmission.failed && (
                  <button onClick={() => { setTask({ ...task, title: viewingSubmission.taskTitle } as any); setContent(viewingSubmission.content); setPhase('writing'); setViewingSubmission(null) }}
                    className="w-full py-2.5 rounded-xl text-white font-medium bg-gradient-to-r from-indigo-500 to-purple-600 text-sm flex items-center justify-center gap-2">
                    继续修改此作文
                  </button>
                )}
                {viewingSubmission.failed && viewingSubmission.content && (
                  <button onClick={() => { setTask({ ...task, title: viewingSubmission.taskTitle } as any); setContent(viewingSubmission.content); setPhase('writing'); setViewingSubmission(null) }}
                    className="w-full py-2.5 rounded-xl text-white font-medium bg-gradient-to-r from-rose-500 to-pink-500 text-sm flex items-center justify-center gap-2">
                    重新提交（保留内容）
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {phase === 'task' && (
          <div className="space-y-5">
            {/* 📚 官方任务 */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-4 h-4 text-slate-500" />
                <h3 className="font-semibold text-slate-700 text-sm">官方任务</h3>
                <span className="text-xs text-slate-400">教材同步作文</span>
              </div>
              <div className={`bg-white rounded-2xl shadow-sm border ${gc.border} p-6`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Clock className={`w-4 h-4 ${gc.text}`} />
                    <span className={`text-xs font-medium ${gc.text}`}>
                      {task?.level || ''} {task?.type ? `· ${task.type}` : ''}
                    </span>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${gc.badge}`}>
                    满分 {task?.totalScore || 0} 分
                  </span>
                </div>
                <h2 className="text-xl font-bold text-slate-800">{task?.title}</h2>
                <div className="mt-3 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{task?.description ? stripTemplateFromDesc(task.description) : ''}</div>
                {(task?.opening || task?.closing) && (
                  <div className="mt-3 p-3 rounded-lg bg-blue-50 border border-blue-100 font-mono text-sm leading-relaxed whitespace-pre-wrap">
                    {task?.opening && <div className="text-slate-700">{task.opening}</div>}
                    <div className="text-slate-300 mt-1">
________________________________________________________
________________________________________________________
                    </div>
                    {task?.closing && <div className="text-slate-700 mt-1">{task.closing}</div>}
                  </div>
                )}
                <div className="mt-3 flex flex-wrap gap-2">
                  {task?.requirements.map((req, i) => (
                    <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">{req}</span>
                  ))}
                </div>
                <div className="mt-3 text-xs text-slate-400">
                  词数要求：{task?.minWords}-{task?.maxWords} 词
                </div>
                <button onClick={handleStartWriting} className={`mt-4 w-full py-3 rounded-xl text-white font-medium text-base bg-gradient-to-r ${gc.primary} shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2`}>
                  <PenLine className="w-5 h-5" /> 开始写作
                </button>
              </div>
            </div>

            {/* 👨‍🏫 教师任务 */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <PenLine className="w-4 h-4 text-rose-500" />
                <h3 className="font-semibold text-slate-700 text-sm">教师任务</h3>
                {teacherTaskList.filter(t => t.grade === grade).length > 0 && (
                  <span className="text-xs text-rose-500 font-medium">{teacherTaskList.filter(t => t.grade === grade).length} 个任务</span>
                )}
              </div>
              <div className="space-y-2">
                {teacherTaskList.filter(t => t.grade === grade).length === 0 ? (
                  <div className="bg-white/60 rounded-xl border border-dashed border-slate-200 p-4 text-center">
                    <p className="text-xs text-slate-400">暂无教师任务</p>
                  </div>
                ) : (
                  teacherTaskList.filter(t => t.grade === grade).map(t => (
                    <div key={t.id} onClick={() => setTask(t)}
                      className={`p-4 rounded-xl cursor-pointer border transition-all ${task?.id === t.id ? 'border-rose-300 bg-rose-50 ring-1 ring-rose-200' : 'border-slate-100 bg-white hover:border-rose-200 hover:shadow-sm'}`}>
                      <div className="flex items-start justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-bold text-slate-800">{t.title}</div>
                          <div className="text-xs text-slate-400 mt-0.5">{t.minWords}-{t.maxWords}词 · 满分{t.totalScore}</div>
                        </div>
                        <span className={`text-xs px-4 py-1.5 rounded-lg font-medium shrink-0 ml-3 ${task?.id === t.id ? 'bg-rose-500 text-white' : 'bg-rose-50 text-rose-600'}`}>
                          {task?.id === t.id ? '已选' : '选择'}
                        </span>
                      </div>
                      {task?.id === t.id && (
                        <div className="mt-2 pt-2 border-t border-dashed border-rose-100">
                          <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">{stripTemplateFromDesc(t.description)}</p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* 📋 历史批改 */}
            {submissions.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <h3 className="font-semibold text-slate-700 text-sm">历史批改</h3>
                  <button onClick={() => setShowHistory(!showHistory)} className="text-xs text-indigo-500 hover:underline">
                    {showHistory ? '收起' : `(${submissions.length}次)`}
                  </button>
                </div>
                {showHistory && (
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {[...submissions].reverse().slice(0, 20).map((s: any, i: number) => (
                      <div key={s.id || i} onClick={() => { setViewingSubmission(s); setShowHistory(false) }}
                        className="p-3 rounded-xl bg-white border border-slate-100 hover:border-indigo-200 cursor-pointer transition-all flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-slate-700 truncate">{s.taskTitle || '未知题目'}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{s.grade === 'junior' ? '初中' : '高中'} · {new Date(s.date).toLocaleDateString()}</p>
                        </div>
                        {s.failed ? (
                          <span className="text-xs font-medium text-red-500 bg-red-50 px-2 py-1 rounded-full shrink-0 ml-3">批改失败</span>
                        ) : (
                          <div className={`text-sm font-bold ml-3 shrink-0 ${(s.scores?.total || 0) >= 64 ? 'text-green-500' : 'text-amber-500'}`}>
                            {s.scores?.total || '?'}/{s.scores?.maxTotal || '80'}分
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

        {/* 🏆 优秀习作榜 */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Trophy className="w-4 h-4 text-amber-500" />
                <h3 className="font-semibold text-slate-700 text-sm">优秀习作榜</h3>
                <button onClick={() => setActiveTab(activeTab === 'leaderboard' ? 'write' : 'leaderboard')} className="text-xs text-indigo-500 hover:underline">
                  {activeTab === 'leaderboard' ? '收起' : '展开'}
                </button>
              </div>
              {activeTab === 'leaderboard' && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 space-y-3">
                  {leaderboard.junior.length === 0 && leaderboard.senior.length === 0 ? (
                    <p className="text-xs text-slate-400 italic text-center py-2">暂无上榜作品</p>
                  ) : (
                    <>
                      {leaderboard.junior.length > 0 && (
                        <div>
                          <h4 className="text-xs font-medium text-green-600 mb-1.5">初中榜</h4>
                          <div className="space-y-1.5">
                            {leaderboard.junior.slice(0, 3).map((entry, i) => (
                              <div key={entry.submissionId} className="flex items-center justify-between p-2 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100">
                                <div className="flex items-center gap-2">
                                  <span className="text-base">{['🥇', '🥈', '🥉'][i]}</span>
                                  <span className="text-sm font-medium text-slate-700">{entry.studentName}</span>
                                </div>
                                <span className="text-sm font-bold text-green-600">{entry.score}/{entry.total}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {leaderboard.senior.length > 0 && (
                        <div>
                          <h4 className="text-xs font-medium text-indigo-600 mb-1.5">高中榜</h4>
                          <div className="space-y-1.5">
                            {leaderboard.senior.slice(0, 3).map((entry, i) => (
                              <div key={entry.submissionId} className="flex items-center justify-between p-2 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-indigo-100">
                                <div className="flex items-center gap-2">
                                  <span className="text-base">{['🥇', '🥈', '🥉'][i]}</span>
                                  <span className="text-sm font-medium text-slate-700">{entry.studentName}</span>
                                </div>
                                <span className="text-sm font-bold text-indigo-600">{entry.score}/{entry.total}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
              {/* 历届优秀作文庫 */}
              {excellentWorks.length > 0 && (
                <div className="mt-2">
                  <button onClick={() => setShowAllRankings(!showAllRankings)} className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1">
                    <BarChart3 className="w-3 h-3" /> 历届优秀作文 {showAllRankings ? '收起' : `(${excellentWorks.length}篇)`}
                  </button>
                  {showAllRankings && (
                    <div className="mt-2 space-y-2 max-h-64 overflow-y-auto">
                      {excellentWorks.map(work => (
                        <button key={work.id} onClick={() => setViewingWork(work)}
                          className="w-full text-left p-2.5 rounded-xl bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-100 hover:shadow-md transition-shadow cursor-pointer">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-700">{work.studentName}</span>
                            <span className="text-xs font-bold text-amber-600">{work.scores.total}/{work.scores.maxTotal}分</span>
                          </div>
                          <p className="text-xs text-slate-500 truncate">{work.taskTitle} · {new Date(work.date).toLocaleDateString()}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 教师数据看板 */}
            {showTeacherView && (
              <TeacherView grade={grade} />
            )}
          </div>
        )}

        {/* 优秀作文详情弹窗 */}
        {viewingWork && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setViewingWork(null)}>
            <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-6 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">{viewingWork.studentName}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {viewingWork.taskTitle} · {new Date(viewingWork.date).toLocaleDateString()} · {viewingWork.scores.total}/{viewingWork.scores.maxTotal}分
                  </p>
                </div>
                <button onClick={() => setViewingWork(null)} className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 text-lg leading-none">&times;</button>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 whitespace-pre-wrap text-sm text-slate-700 leading-relaxed">
                {viewingWork.content}
              </div>
            </div>
          </div>
        )}

        {phase === 'writing' && (
          <WritingScaffold task={task} content={content} onContentChange={setContent}
            onBack={() => setPhase('task')} onSubmit={handleSubmit} loading={loading}
            error={error} minWords={task?.minWords || 0} maxWords={task?.maxWords || 150} />
        )}

        {(phase === 'grading' || phase === 'result' || phase === 'revising' || phase === 'final') && (
          <>
            {loading && phase === 'grading' && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center">
                <div className="animate-spin w-10 h-10 border-4 border-rose-200 border-t-rose-500 rounded-full mx-auto mb-4" />
                <p className="text-slate-600 font-medium">AI-Wego 英语教师正在批改...</p>
                <p className="text-xs text-slate-400 mt-1">正在从内容、语言、结构、高级表达四个维度评分</p>
              </div>
            )}

            {reviewResult && !loading && (
              <div className="space-y-4">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Sparkles className="w-5 h-5 text-rose-500" /> AI老师详批</h2>
                    {phase === 'final' && improvement && (
                      <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> 提升 {improvement.afterScore - improvement.beforeScore} 分
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <ScoreCard label="内容" score={reviewResult.content.score} max={20} color="bg-blue-500" />
                    <ScoreCard label="语言" score={reviewResult.language.score} max={20} color="bg-green-500" />
                    <ScoreCard label="结构" score={reviewResult.structure.score} max={20} color="bg-purple-500" />
                    <ScoreCard label="高级表达" score={reviewResult.advanced.score} max={20} color="bg-amber-500" />
                  </div>

                  <div className="text-center p-4 rounded-xl bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-100">
                    <div className="text-3xl font-bold bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">
                      {reviewResult.total}/{reviewResult.maxTotal}
                    </div>
                    <div className={`text-sm font-medium mt-1 ${getOverallGrade(reviewResult.total / reviewResult.maxTotal).color}`}>
                      {getOverallGrade(reviewResult.total / reviewResult.maxTotal).label}
                    </div>
                    <p className="text-sm text-slate-600 mt-2">{reviewResult.comment}</p>
                  </div>

                  {reviewResult.language.details && reviewResult.language.details.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-sm font-semibold text-slate-700 mb-2">语言问题修改</h3>
                      <div className="space-y-2">
                        {reviewResult.language.details.map((d, i) => (
                          <div key={i} className="p-3 rounded-xl bg-red-50 border border-red-100">
                            <div className="text-xs text-red-500 mb-1">{d.issue}</div>
                            <div className="text-sm text-slate-500 line-through">{d.original}</div>
                            <div className="text-sm text-green-600 font-medium">{d.corrected}</div>
                            <div className="text-xs text-slate-400 mt-1">{d.note}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {reviewResult.content.details && reviewResult.content.details.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-sm font-semibold text-slate-700 mb-2">内容问题修改</h3>
                      <div className="space-y-2">
                        {reviewResult.content.details.map((d, i) => (
                          <div key={i} className="p-3 rounded-xl bg-blue-50 border border-blue-100">
                            <div className="text-xs text-blue-500 mb-1">{d.issue}</div>
                            <div className="text-sm text-slate-500 line-through">{d.original}</div>
                            <div className="text-sm text-green-600 font-medium">{d.corrected}</div>
                            <div className="text-xs text-slate-400 mt-1">{d.note}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {suggestions.length > 0 && (phase === 'result' || phase === 'revising' || phase === 'final') && (
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                    <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><ListChecks className="w-5 h-5 text-indigo-500" /> AI修改建议</h2>
                    <p className="text-xs text-slate-400 mb-3">点击优化句可直接替换到文中</p>
                    <div className="space-y-3">
                      {suggestions.map((s, i) => (
                        <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                          <div className="flex items-start gap-2">
                            <span className="text-xs font-bold text-slate-400 mt-1">{i + 1}</span>
                            <div className="flex-1">
                              <div className="text-sm text-slate-500 line-through">{s.original}</div>
                              <div className="flex items-center gap-2 my-1">
                                <ArrowDown className="w-4 h-4 text-green-500" />
                                <span className="text-xs text-green-600 font-medium">{s.note}</span>
                              </div>
                              <div
                                className="text-sm text-green-700 font-medium bg-green-50 px-3 py-1.5 rounded-lg cursor-pointer hover:bg-green-100 transition-colors inline-block"
                                onClick={() => { navigator.clipboard?.writeText(s.optimized) }}
                              >
                                {s.optimized}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 教师点评区 */}
                {showTeacherPanel && (
                  <div className="bg-amber-50 rounded-xl border border-amber-200 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="w-4 h-4 text-amber-600" />
                      <h3 className="text-sm font-semibold text-amber-800">教师点评</h3>
                    </div>
                    <textarea
                      value={teacherComment}
                      onChange={e => { setTeacherComment(e.target.value); localStorage.setItem('writing_teacher_comment', e.target.value) }}
                      placeholder="在此为学生补充点评...&#10;例：结构完整，注意一般将来时的使用。"
                      className="w-full h-24 p-3 rounded-lg border border-amber-200 bg-white text-sm outline-none focus:border-amber-400 resize-y"
                    />
                    {teacherComment && (
                      <div className="mt-2 p-3 rounded-lg bg-white border border-amber-100">
                        <p className="text-xs text-amber-700 font-medium mb-1">预览：</p>
                        <p className="text-sm text-slate-700 whitespace-pre-wrap">{teacherComment}</p>
                      </div>
                    )}
                  </div>
                )}

                {phase === 'result' && (
                  <div className="flex gap-3">
                    <button onClick={handleRevise} className="flex-1 py-3 rounded-xl text-white font-medium bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4" /> 修改后再次提交
                    </button>
                    <button onClick={handleNewTask} className="flex-1 py-3 rounded-xl text-slate-600 font-medium bg-white border border-slate-200 hover:border-slate-300 transition-all flex items-center justify-center gap-2">
                      <PenLine className="w-4 h-4" /> 写下一篇
                    </button>
                  </div>
                )}

                {phase === 'revising' && (
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-bold text-slate-800">修改稿</h2>
                      <span className="text-xs text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full">二次提交</span>
                    </div>
                    <textarea
                      value={content}
                      onChange={e => setContent(e.target.value)}
                      placeholder="根据AI建议修改你的作文..."
                      className="w-full h-64 p-4 rounded-xl border border-slate-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none resize-y text-base leading-relaxed text-slate-700 placeholder:text-slate-300"
                    />
                    <div className="flex items-center justify-between mt-3">
                      <span className={`text-sm font-medium ${wordCount > (task?.maxWords || 999) ? 'text-red-500' : 'text-green-500'}`}>
                        {wordCount} / {task?.maxWords || 150} 词
                      </span>
                      <button
                        onClick={handleResubmit}
                        disabled={!content.trim() || loading}
                        className="px-6 py-2.5 rounded-xl text-white font-medium bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg shadow-indigo-200 hover:shadow-xl disabled:opacity-50 transition-all flex items-center gap-2"
                      >
                        {loading ? <><RefreshCw className="w-4 h-4 animate-spin" /> 提交中...</> : <><Send className="w-4 h-4" /> 提交修改稿</>}
                      </button>
                    </div>
                    {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
                  </div>
                )}

                {phase === 'final' && improvement && (
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                    <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-green-500" /> 成长对比</h2>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
                        <div className="text-xs text-slate-500 mb-1">初稿</div>
                        <div className="text-2xl font-bold text-slate-400">{improvement.beforeScore}</div>
                        <div className="text-xs text-slate-400">语言准确率 {Math.round(improvement.languageAccuracyBefore / 20 * 100)}%</div>
                      </div>
                      <div className="p-4 rounded-xl bg-green-50 border border-green-100 text-center">
                        <div className="text-xs text-green-600 mb-1">修改稿</div>
                        <div className="text-2xl font-bold text-green-600">{improvement.afterScore}</div>
                        <div className="text-xs text-green-500">语言准确率 {Math.round(improvement.languageAccuracyAfter / 20 * 100)}%</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-center gap-2 p-4 rounded-xl bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-100">
                      <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                      <span className="text-lg font-bold text-amber-700">+{improvement.growthPoints} WEGO</span>
                      <span className="text-xs text-amber-500">成长值</span>
                    </div>

                    <div className="mt-4 space-y-2">
                      {improvement.details.map((d, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-slate-600">
                          <CheckCircle2 className="w-4 h-4 text-green-500" /> {d}
                        </div>
                      ))}
                    </div>

                    <button onClick={handleNewTask} className="mt-4 w-full py-3 rounded-xl text-white font-medium bg-gradient-to-r from-green-500 to-emerald-600 shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2">
                      <PenLine className="w-5 h-5" /> 继续下一篇
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function ScoreCard({ label, score, max, color }: { label: string; score: number; max: number; color: string }) {
  const pct = score / max
  return (
    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
      <div className="text-xs text-slate-500 mb-1">{label}</div>
      <div className="text-2xl font-bold text-slate-800">{score}<span className="text-sm text-slate-400">/{max}</span></div>
      <div className="mt-2 h-1.5 rounded-full bg-slate-200 overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct * 100}%` }} />
      </div>
    </div>
  )
}

interface ChipGroup { label: string; items: string[] }

const THEME_TOOLKITS: Record<string, ChipGroup[]> = {
  '天气': [
    { label: '🌤 动词短语', items: ['go swimming', 'stay at home', 'go outside', 'read books', 'help with housework', 'drink tea', 'take a walk', 'play indoors', 'do housework', 'eat cold desserts'] },
    { label: '🎯 形容词', items: ['sunny', 'rainy', 'windy', 'hot', 'warm', 'cool', 'strong (wind)', 'terrible', 'lovely', 'fine', 'comfortable'] },
    { label: '📝 经典句式', items: [
      'In _____, the weather is usually _____ and _____.',
      'When it is _____, I like to _____.',
      'On _____ days, I often _____.',
      'It is _____ today, so I _____.',
      'Sometimes it is _____, and I have to _____.',
      'I enjoy _____ because _____.',
      'My favorite weather is _____ because _____.',
    ]},
  ],
  '书籍': [
    { label: '📖 动词短语', items: ['read a book', 'finish reading', 'borrow from library', 'buy at bookstore', 'recommend to others', 'write a book report'] },
    { label: '🎯 形容词', items: ['interesting', 'exciting', 'moving', 'meaningful', 'educational', 'popular', 'famous', 'wonderful'] },
    { label: '📝 经典句式', items: [
      'I have already read a book called _____.',
      'This book tells a story about _____.',
      'The book teaches me that _____.',
      'My favorite character is _____ because _____.',
      'I learned _____ from this book.',
      'I would recommend this book to _____ because _____.',
    ]},
  ],
  '朋友': [
    { label: '👫 动词短语', items: ['make friends', 'spend time together', 'share secrets', 'help each other', 'talk about', 'play together', 'study together'] },
    { label: '🎯 形容词', items: ['kind', 'friendly', 'honest', 'helpful', 'funny', 'outgoing', 'hard-working', 'popular'] },
    { label: '📝 经典句式', items: [
      'My best friend is _____.',
      'I like him/her because _____.',
      'We have known each other for _____.',
      'We often _____ together.',
      'A true friend should be _____.',
      'I feel happy when I ____ with my friend.',
    ]},
  ],
  '爱好': [
    { label: '🎨 动词短语', items: ['spend time on', 'be interested in', 'be good at', 'practice every day', 'enjoy doing', 'start doing', 'keep doing'] },
    { label: '🎯 形容词', items: ['relaxing', 'interesting', 'fun', 'exciting', 'challenging', 'creative', 'enjoyable'] },
    { label: '📝 经典句式', items: [
      'My hobby is _____.',
      'I like to _____ in my free time.',
      'I started _____ when I was _____ years old.',
      'It makes me feel _____.',
      'I spend _____ hours on _____ every week.',
      'I have learned _____ from my hobby.',
    ]},
  ],
  '学习': [
    { label: '📚 动词短语', items: ['study hard', 'do homework', 'take notes', 'review lessons', 'prepare for exams', 'ask for help', 'learn by heart', 'practice speaking'] },
    { label: '🎯 形容词', items: ['difficult', 'important', 'useful', 'interesting', 'boring', 'easy', 'challenging', 'necessary'] },
    { label: '📝 经典句式', items: [
      'My favorite subject is _____ because _____.',
      'I study _____ every day.',
      'I want to improve my _____.',
      'I find it _____ to learn _____.',
      'I have learned a lot from _____.',
      'I hope to become better at _____.',
    ]},
  ],
  '旅行': [
    { label: '✈️ 动词短语', items: ['go on a trip', 'visit a place', 'take photos', 'buy souvenirs', 'try local food', 'stay at a hotel', 'travel with family'] },
    { label: '🎯 形容词', items: ['beautiful', 'amazing', 'exciting', 'interesting', 'crowded', 'peaceful', 'unforgettable', 'wonderful'] },
    { label: '📝 经典句式', items: [
      'I have been to _____ with my _____.',
      'I want to visit _____ because _____.',
      'The best thing about the trip was _____.',
      'I learned _____ during my trip.',
      'The scenery there was _____.',
      'I will never forget _____ about the trip.',
    ]},
  ],
  '运动': [
    { label: '⚽ 动词短语', items: ['play sports', 'do exercise', 'keep fit', 'join a team', 'win a game', 'take part in', 'warm up', 'practice hard'] },
    { label: '🎯 形容词', items: ['energetic', 'exciting', 'competitive', 'strong', 'active', 'fit', 'healthy', 'fun'] },
    { label: '📝 经典句式', items: [
      'My favorite sport is _____.',
      'I play _____ with my friends every _____.',
      'Doing sports keeps me _____.',
      'I like _____ because it is _____.',
      'I want to be good at _____.',
      'It is important to _____ every day.',
    ]},
  ],
  '家人': [
    { label: '👨‍👩‍👧‍👦 动词短语', items: ['spend time with', 'look after', 'take care of', 'help with housework', 'have dinner together', 'go shopping with', 'share stories with'] },
    { label: '🎯 形容词', items: ['kind', 'caring', 'supportive', 'hard-working', 'brave', 'loving', 'patient', 'strict'] },
    { label: '📝 经典句式', items: [
      'There are _____ people in my family.',
      'I love my family because _____.',
      'My _____ is a _____ person.',
      'We like to _____ together.',
      'My family supports me when _____.',
      'I look up to my _____ because _____.',
    ]},
  ],
  '健康': [
    { label: '💪 动词短语', items: ['keep fit', 'do exercise', 'eat well', 'stay healthy', 'get enough sleep', 'have a balanced diet', 'take a walk', 'drink more water'] },
    { label: '🎯 形容词', items: ['healthy', 'fit', 'energetic', 'strong', 'fresh', 'natural', 'important', 'necessary'] },
    { label: '📝 经典句式', items: [
      'It is important to _____.',
      'I exercise every day by _____.',
      'A healthy lifestyle helps me _____.',
      'I try to eat _____ every day.',
      'Health is more important than _____.',
      'We should _____ to keep fit.',
    ]},
  ],
  '环保': [
    { label: '🌱 动词短语', items: ['protect the environment', 'save water', 'sort the garbage', 'plant trees', 'turn off the lights', 'reduce waste', 'ride a bike', 'recycle paper'] },
    { label: '🎯 形容词', items: ['important', 'necessary', 'serious', 'green', 'clean', 'responsible', 'environmentally friendly'] },
    { label: '📝 经典句式', items: [
      'We should _____ to protect the environment.',
      'Everyone can help by _____.',
      'It is our duty to _____.',
      'Small actions can make a big difference.',
      'If we do not act now,_____ will be _____.',
      'I think _____ is important because _____.',
    ]},
  ],
  '梦想': [
    { label: '🌟 动词短语', items: ['achieve my dream', 'work hard', 'keep trying', 'never give up', 'believe in myself', 'study hard', 'make my dream come true'] },
    { label: '🎯 形容词', items: ['hard-working', 'confident', 'determined', 'hopeful', 'bright', 'meaningful', 'possible'] },
    { label: '📝 经典句式', items: [
      'My dream is to become a _____.',
      'I want to be a _____ when I grow up.',
      'I will _____ to achieve my dream.',
      'This dream started when _____.',
      'I believe I can _____ if I keep trying.',
      'Nothing is impossible if you _____.',
    ]},
  ],
  '节日': [
    { label: '🎉 动词短语', items: ['celebrate the festival', 'get together', 'have a big dinner', 'give gifts', 'say wishes', 'wear new clothes', 'visit relatives'] },
    { label: '🎯 形容词', items: ['traditional', 'important', 'happy', 'joyful', 'delicious', 'wonderful', 'meaningful', 'special'] },
    { label: '📝 经典句式', items: [
      'My favorite festival is _____.',
      'During _____, we usually _____.',
      'People _____ on that day.',
      'I like _____ because _____.',
      'We spend time with _____ on this day.',
      'The best part of the festival is _____.',
    ]},
  ],
  '食物': [
    { label: '🍕 动词短语', items: ['eat out', 'try new food', 'cook a meal', 'order food', 'share a meal', 'taste good', 'have breakfast/lunch/dinner'] },
    { label: '🎯 形容词', items: ['delicious', 'tasty', 'spicy', 'sweet', 'salty', 'fresh', 'healthy', 'popular', 'special'] },
    { label: '📝 经典句式', items: [
      'My favorite food is _____.',
      'It tastes _____.',
      'It is a traditional food from _____.',
      'I like it because _____.',
      'I often eat _____ for _____.',
      'You should try _____ because _____.',
    ]},
  ],
  '活动': [
    { label: '🏆 动词短语', items: ['take part in', 'join in', 'hold an event', 'have a party', 'go on a trip', 'do volunteer work', 'organize a show', 'attend a meeting'] },
    { label: '🎯 形容词', items: ['meaningful', 'interesting', 'exciting', 'successful', 'enjoyable', 'active', 'colorful', 'wonderful'] },
    { label: '📝 经典句式', items: [
      'Last _____, we _____ together.',
      'We took part in _____ last _____ .',
      'It was a _____ experience.',
      'I learned _____ from this activity.',
      'We all had a great time because _____.',
      'I hope we can _____ again next time.',
    ]},
  ],
}

// 主题匹配键和对应 toolkit key（支持一个 key 映射到另一个 toolkit）
const THEME_ALIAS: Record<string, string> = {
  '音乐': '爱好',
  '唱歌': '爱好',
  '画画': '爱好',
  '未来': '梦想',
  '理想': '梦想',
  '体育': '运动',
  '饮食': '食物',
  '美食': '食物',
  '我的家庭': '家人',
  '父母': '家人',
  '气候': '天气',
  '晴天': '天气',
  '下雨天': '天气',
  '刮风天': '天气',
  '阴天': '天气',
  '雪天': '天气',
  '天气': '天气',
}

// 常见要点类型的专用提示词
const POINT_CHIPS: Record<string, ChipGroup[]> = {
  '你的选择': [
    { label: '🎯 表达选择', items: [
      'I would like to choose', 'I prefer', 'I am most interested in',
      'My favorite is', 'I think _____ is the best choice',
      'Among all the options, I like _____ best',
    ]},
  ],
  '选择理由': [
    { label: '💡 陈述理由', items: [
      'The reason is that', 'First of all, _____ is very',
      'What\'s more', 'Also, I can learn a lot from',
      'It not only ... but also ...',
      'For one thing ... for another ...',
    ]},
  ],
  '你的期待': [
    { label: '🌟 表达期待', items: [
      'I hope', 'I can\'t wait to', 'I am looking forward to',
      'I believe it will be', 'It would be a wonderful experience to',
      'I expect that',
    ]},
  ],
  '项目目前得票情况': [
    { label: '📊 描述数据', items: [
      'Currently, _____ is in the lead with', 'The votes show that',
      'According to the voting result', 'So far, _____ has received',
      'The top two are _____ and _____',
    ]},
  ],
  '你选择的地点': [
    { label: '📍 描述地点', items: [
      'I would like to visit', 'The place I want to go to most is',
      'I am attracted by', 'There are many interesting things to see',
      'I can experience', 'It offers a great chance to',
    ]},
  ],
  '你的理由': [
    { label: '💡 陈述理由', items: [
      'First of all', 'The main reason is that',
      'Besides', 'What\'s more', 'Last but not least',
      'For example', 'For one thing ... for another ...',
    ]},
  ],
  '你的建议': [
    { label: '📝 提出建议', items: [
      'I suggest that', 'It would be a good idea to',
      'Why not', 'You\'d better', 'I recommend that',
      'It is helpful to',
    ]},
  ],
  '活动安排': [
    { label: '📅 描述安排', items: [
      'The activity will be held on', 'We plan to',
      'First, we will', 'Then', 'After that', 'Finally',
      'The event starts at', 'It will last for',
    ]},
  ],
  '时间和地点': [
    { label: '🕐 时间', items: [
      'It happened on', 'It took place in', 'last summer',
      'during the winter holiday', 'on a sunny morning',
      'three years ago', 'when I was in grade',
    ]},
    { label: '📍 地点', items: [
      'I went to', 'We visited', 'The trip was to',
      'located in', 'a small town called',
      'It is in the _____ of', 'on the way to',
    ]},
  ],
  '旅行中做了什么': [
    { label: '🎒 活动描述', items: [
      'We climbed the mountain', 'visited the museum',
      'took a lot of photos', 'tried local food',
      'went shopping', 'played games together',
      'enjoyed the beautiful scenery',
    ]},
  ],
  '为什么难忘': [
    { label: '💭 表达感受', items: [
      'What made it unforgettable was', 'I will never forget',
      'It was the first time I had ever',
      'The most exciting part was',
      'I learned a lot from this trip',
      'The experience taught me',
    ]},
  ],
  '书名和作者': [
    { label: '📖 介绍书', items: [
      'The book is called', 'It was written by',
      'The author of the book is', 'The book tells a story about',
      'It is a book about', 'This book is very popular among',
    ]},
  ],
  '主要内容': [
    { label: '📝 概括内容', items: [
      'The story is about', 'It mainly talks about',
      'The main character is', 'The book tells us that',
      'It starts with', 'In the story',
      'At the end of the book',
    ]},
  ],
  '你的推荐理由': [
    { label: '⭐ 推荐理由', items: [
      'I recommend this book because', 'This book is worth reading',
      'It not only ... but also ...',
      'I have learned a lot from',
      'The book is so _____ that',
      'Everyone should read it because',
    ]},
  ],
  '作息方面': [
    { label: '🌙 作息建议', items: [
      'You should go to bed early', 'Try to sleep at least 8 hours',
      'Don\'t stay up too late', 'Keep a regular sleep schedule',
      'Take a nap at noon', 'Get up early in the morning',
    ]},
  ],
  '饮食方面': [
    { label: '🥗 饮食建议', items: [
      'You should eat more vegetables and fruit',
      'Drink enough water every day',
      'Don\'t eat too much junk food',
      'Eat three meals on time',
      'Have a balanced diet',
      'Eat less sugar and salt',
    ]},
  ],
  '运动方面': [
    { label: '🏃 运动建议', items: [
      'You should do exercise regularly',
      'Try to run for 30 minutes every day',
      'Playing ball games is good for your health',
      'Take a walk after dinner',
      'Join a sports club',
      'Exercise makes you stronger',
    ]},
  ],
  '地理位置和自然环境': [
    { label: '📍 地理位置', items: [
      'My hometown is located in', 'It lies in the _____ of',
      'It is a _____ city/town', 'It has a population of',
    ]},
    { label: '🌳 自然环境', items: [
      'There are many trees and flowers',
      'The air is fresh and clean',
      'The scenery is very beautiful',
      'It is famous for its natural beauty',
      'surrounded by mountains',
      'near the river/sea',
    ]},
  ],
  '特色食物或景点': [
    { label: '🍜 特色食物', items: [
      'The most famous food is', 'You must try',
      'It tastes delicious', 'It is made of/with',
      'People here like to eat',
    ]},
    { label: '🏛️ 景点', items: [
      'There are many places of interest',
      'The most popular place is',
      'You can visit', 'It is well worth visiting',
      'has a history of _____ years',
    ]},
  ],
  '你对家乡的感情': [
    { label: '💖 表达感情', items: [
      'I love my hometown very much',
      'I am proud of my hometown',
      'No matter where I go, I will never forget',
      'My hometown is the best place in the world',
      'It is where I grew up',
      'I miss my hometown so much',
    ]},
  ],
  '你的看法': [
    { label: '💭 表达看法', items: [
      'In my opinion', 'I think that', 'From my point of view',
      'As far as I am concerned', 'Personally, I believe',
      'It seems to me that',
    ]},
  ],
  '你的想法': [
    { label: '💭 表达想法', items: [
      'I think', 'I believe', 'In my opinion',
      'As for me', 'My view is that',
      'I agree that', 'I don\'t think',
    ]},
  ],
}

function genContentChips(line: string): ChipGroup[] {
  const colonIdx = line.indexOf('：')
  let topic = colonIdx >= 0 ? line.substring(0, colonIdx).trim() : ''
  topic = topic.replace(/^[✅☀️🌧️🌤️💨•●▶▪\-]\s*/, '').trim()
  const details = colonIdx >= 0 ? line.substring(colonIdx + 1).trim() : line.trim()

  // 匹配常见要点类型（优先）
  for (const [key, chips] of Object.entries(POINT_CHIPS)) {
    if (topic.includes(key)) return chips
  }

  // 提取英文关键词（只在括号内提取）
  const engWords: string[] = []
  const parenEng = details.match(/[（(]([A-Za-z][A-Za-z\s]+)[)）]/g)
  if (parenEng) for (const p of parenEng) engWords.push(p.replace(/[（）()]/g, '').trim())
  const uniqueEng = [...new Set(engWords)].filter(Boolean)

  // 匹配主题
  let toolkit: ChipGroup[] | null = null
  if (topic) toolkit = THEME_TOOLKITS[topic]
  if (!toolkit) toolkit = THEME_TOOLKITS[THEME_ALIAS[topic]]
  if (!toolkit) {
    const matchedKey = Object.keys(THEME_TOOLKITS).find(k => line.includes(k))
    if (matchedKey) toolkit = THEME_TOOLKITS[matchedKey]
  }

  if (!toolkit) {
    // 无匹配主题：只给过渡词 + 通用句式
    return [
      { label: '📝 句式', items: [
        'I think _____ is _____.',
        'I want to talk about _____.',
        'The reason is that _____.',
        'It is _____ for me to _____.',
        'From my point of view, _____.',
      ]},
    ]
  }

  // 克隆 toolkit，如果有英文关键词则追加相关句式
  const result: ChipGroup[] = toolkit.map(g => ({ ...g, items: [...g.items] }))
  if (uniqueEng.length > 0) {
    const engFrames = result.find(g => g.label.includes('句式'))
    if (engFrames) {
      for (const w of uniqueEng.slice(0, 3)) {
        engFrames.items.push(`We have _____ like "${w}" in Shantou.`)
        engFrames.items.push(`The _____ can be very _____ (like ${w}) in summer.`)
      }
    }
  }

  return result
}

function buildScaffold(task: WritingTask | null) {
  if (!task) return { sections: [] as any[], initials: {} as Record<string, string> }
  const desc = stripTemplateFromDesc(task.description || '')
  const bulletMatch = [...desc.matchAll(/[•●▶▪]\s*([^\n]+)/g)]
  // 只抓"内容包括"之后的编号行，忽略"注意"之后的（那些是要求不是要点）
  const contentSection = desc.match(/内容[包括：:][^]*?(?=注意[：:])/)?.[0] || desc
  const numMatch = [...contentSection.matchAll(/\((\d+)\)\s*([^\n]+)/g)]
  const colonMatch = desc.match(/(?:内容提示|内容包括|提示如下)[：:]\s*$/m)
  let contentLines: string[] = []
  if (bulletMatch.length > 0) contentLines = bulletMatch.map(m => m[1].trim()).slice(0, 8)
  else if (numMatch.length > 0) contentLines = numMatch.map(m => m[2].trim()).slice(0, 8)
  else {
    const hintIdx = desc.indexOf('内容提示')
    const fallbackIdx = hintIdx >= 0 ? hintIdx : desc.indexOf('提示如下')
    if (fallbackIdx >= 0) {
      const after = desc.substring(fallbackIdx + 4).replace(/^[：:（(][^）)]*[）)]?[：:]?\s*/, '').trim()
      contentLines = after.split(/[；\n]/).map(l => l.replace(/^[✅☀️🌧️🌤️💨•●▶▪\-]\s*/, '').trim()).filter(Boolean).slice(0, 8)
    }
  }

  // 如果没有抓到要点（无bullet/无编号/无内容提示），从描述中按行抓取含冒号的内容行
  if (contentLines.length === 0) {
    const lines = desc.split('\n').map(l => l.trim()).filter(Boolean)
    const skipHeaders = ['开头', '开头：', '注意', '注意：', '假设你']
    contentLines = lines.filter(l =>
      l.includes('：') && !skipHeaders.some(h => l.startsWith(h))
        && !l.startsWith('(') && !l.startsWith('（')
    ).slice(0, 6)
  }

  // 过滤掉要求/注意事项行（含不能照抄、语句连贯、词数、可适当拓展、不出现真实等关键词）
  const skipPatterns = [
    /不能照抄/i, /不(得|能)出现真实/i, /不计入总词数/i,
    /语句连贯/i, /行文连贯/i,
    /词数\s*\d/, /词数\d/,   // 匹配"词数100"或"词数 100"
    /可适当拓展/i, /适当增加细节/i,
    /开头[和与]结尾/, /开头已给出/, /结尾已给出/,
    /注意[：:]/,
  ]
  contentLines = contentLines.filter(l => !skipPatterns.some(p => p.test(l)))

  const splitOpening = (task.opening || '').split('\n')
  const salutation = splitOpening.length > 1 ? splitOpening[0] : ''
  const openingBody = splitOpening.length > 1 ? splitOpening.slice(1).join('\n').trim() : (task.opening || '')
  const isLetter = task.type?.includes('书信') || task.opening?.startsWith('Dear')

  const sharedGroup: ChipGroup = { label: '🔗 过渡词', items: ['First of all', 'Secondly', 'What is more', 'Besides', 'In addition', 'For example', 'As a result', 'In my opinion', 'I believe that', 'It is important to'] }

  let sections: any[] = []
  let initials: Record<string, string> = {}

  // 手动配置的精品脚手架
  if (task.id === 'j8') {
    sections = [
      { id: 's_intro', label: '开头', tip: '已给出', rows: 1 },
      { id: 's_method', label: '1. 我的英语学习方法', chips: ['listen to English songs and watch movies', 'read English books every day', 'keep an English diary', 'practice speaking with friends', 'memorize new words by making cards'], rows: 4 },
      { id: 's_diff', label: '2. 遇到困难时如何克服', chips: ['I found it hard to remember new words', 'I was afraid of speaking English in public', 'I made word cards and reviewed them every morning', 'I asked my teacher for help after class'], rows: 4 },
      { id: 's_sug', label: '3. 给同学们的建议', chips: ['practice speaking English as much as possible', 'never be afraid of making mistakes', 'watch English movies and listen to English songs', 'practice makes perfect'], rows: 4 },
      { id: 's_end', label: '结尾', rows: 2 },
    ]
    return { sections, initials: { s_intro: 'Hello everyone! I\'m Li Hua. Today I\'m glad to share my experience in learning English with you.' } }
  }

  if (task.type === '读后续写') {
    sections = [
      { id: 'p_review', label: '读前回顾', tip: '回顾原文情节，理清人物关系', rows: 3 },
      { id: 'p_para1', label: '续写第一段', chips: ['Without hesitation', 'He/She could not help doing', 'Tears streaming down', 'At that moment', 'To his/her surprise', 'As if awakened from a dream'], rows: 5 },
      { id: 'p_para2', label: '续写第二段', chips: ['From that day on', 'Never would he/she forget', 'As time went by', 'In the end', 'It dawned on him/her that'], rows: 5 },
      { id: 'p_feel', label: '感悟升华', chips: ['What I learned from this is', 'This experience taught me that', 'It reminds us that'], rows: 3 },
    ]
    return { sections, initials: {} }
  }

  if (isLetter) {
    sections = [
      { id: 'l_call', label: '称呼', tip: 'Dear...', rows: 1 },
      { id: 'l_intro', label: '开头引言', tip: '写信目的', chips: [
        'I am writing to', 'I am glad to hear that', 'Thank you for your letter',
        'I am happy to receive your letter', 'How are you doing?',
        'I hope this letter finds you well', 'I am sorry for not writing earlier',
        'I have been thinking about you lately',
      ], rows: 3 },
      ...(contentLines.length > 0
        ? contentLines.map((line, i) => {
            const short = line.length > 25 ? line.substring(0, 25) + '...' : line
            return { id: `l_body${i+1}`, label: `要点${i+1}：${short}`, chipGroups: [sharedGroup, ...genContentChips(line)], rows: 4 }
          })
        : [
            { id: 'l_body1', label: '正文要点1', chipGroups: [sharedGroup], rows: 4 },
            { id: 'l_body2', label: '正文要点2', chipGroups: [sharedGroup], rows: 4 },
          ]
      ),
      { id: 'l_close', label: '结尾', chips: [
        'I am looking forward to your reply', 'Best wishes', 'Yours sincerely',
        'I hope to hear from you soon', 'Keep in touch', 'Write back soon',
        'Take care', 'All the best',
      ], rows: 2 },
    ]
    initials = { l_call: salutation, l_intro: openingBody, l_close: task.closing || '' }
    return { sections, initials }
  }

  // 通用：从内容要点生成
  sections = [
    { id: 'g_intro', label: '开头', tip: '引入话题、亮明观点', chips: [
      'Nowadays', 'With the development of', 'As we all know',
      'There is no doubt that', 'It is widely believed that',
      'Recently', 'In recent years', 'More and more people',
    ], rows: 3 },
      ...(contentLines.length > 0
      ? contentLines.map((line, i) => {
          const short = line.length > 25 ? line.substring(0, 25) + '...' : line
          return { id: `g_body${i+1}`, label: `要点${i+1}：${short}`, chipGroups: [sharedGroup, ...genContentChips(line)], rows: 4 }
        })
      : [
          { id: 'g_body1', label: '第一要点', chipGroups: [sharedGroup], rows: 4 },
          { id: 'g_body2', label: '第二要点', chipGroups: [sharedGroup], rows: 4 },
          { id: 'g_body3', label: '第三要点', chipGroups: [sharedGroup], rows: 4 },
        ]
    ),
    { id: 'g_end', label: '结尾总结', chips: [
      'In conclusion', 'To sum up', 'All in all', 'In a word',
      'To draw a conclusion', 'In short', 'Therefore', 'As a result',
    ], rows: 3 },
  ]
  return { sections, initials: { g_intro: task.opening || '' } }
}

function WritingScaffold({ task, content, onContentChange, onBack, onSubmit, loading, error, minWords, maxWords }: {
  task: WritingTask | null; content: string; onContentChange: (v: string) => void
  onBack: () => void; onSubmit: () => void; loading: boolean; error: string | null
  minWords: number; maxWords: number
}) {
  const { sections: sectionsDef, initials } = buildScaffold(task)

  const [sections, setSections] = useState<Record<string, string>>(() => ({ ...initials }))

  useEffect(() => {
    const combined = sectionsDef.map(s => sections[s.id] || '').filter(Boolean).join('\n\n')
    onContentChange(combined)
  }, [sections])

  const wordCount = getWordCount(content)
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const textareaRefs = useRef<Record<string, HTMLTextAreaElement | null>>({})

  function setSection(id: string, val: string) {
    setSections(prev => ({ ...prev, [id]: val }))
  }

  function insertChip(sectionId: string, chip: string) {
    setSections(prev => {
      const cur = prev[sectionId] || ''
      const sep = cur && !cur.endsWith('\n') && !cur.endsWith(' ') ? ' ' : ''
      return { ...prev, [sectionId]: cur + sep + chip }
    })
    setTimeout(() => textareaRefs.current[sectionId]?.focus(), 50)
  }

  const conjunctions = [
    { group: '顺序', items: ['First of all', 'Firstly', 'Secondly', 'Thirdly', 'Finally', 'Last but not least'] },
    { group: '递进', items: ['Besides', 'What is more', 'In addition', 'Moreover', 'Furthermore', 'Not only...but also'] },
    { group: '转折', items: ['However', 'On the other hand', 'Although', 'Nevertheless', 'In contrast', 'On the contrary'] },
    { group: '因果', items: ['Therefore', 'As a result', 'Because of', 'Thanks to', 'Due to', 'Thus', 'Consequently'] },
    { group: '举例', items: ['For example', 'For instance', 'Such as', 'Like', 'In particular'] },
    { group: '总结', items: ['In conclusion', 'To sum up', 'All in all', 'In a word', 'Generally speaking'] },
  ]

  const sentenceUpgrades = [
    { desc: '用定语从句合并', pattern: '..., which/who/that...', example: 'I read a book. → I read a book which changed my view.' },
    { desc: '用状语从句', pattern: 'When/While/Because/Although...', example: 'I was scared. → When I first tried, I was scared.' },
    { desc: '用非谓语开头', pattern: 'Having done..., ...ing, ...ed', example: 'I finished homework. → Having finished my homework, I went out.' },
    { desc: '用同位语补充', pattern: '..., a/an + n. + that...', example: 'Beijing is my city. → Beijing, a city that never sleeps, is my hometown.' },
  ]

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
      <div className="flex items-center justify-between p-4 border-b border-slate-100">
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-bold text-slate-800">{task?.title}</h2>
          <p className="text-xs text-slate-400 mt-0.5 truncate">{stripTemplateFromDesc(task?.description || '')}</p>
        </div>
        <button onClick={onBack} className="text-xs text-slate-400 hover:text-slate-600 ml-3 shrink-0">取消</button>
      </div>
      <div className="flex flex-col lg:flex-row gap-0">
        {/* 左：编辑区 */}
        <div className="flex-1 p-4 space-y-4 border-b lg:border-b-0 lg:border-r border-slate-100">
          {sectionsDef.map(sec => (
            <div key={sec.id}>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">{sec.label}</label>
                {sec.tip && <span className="text-[10px] text-slate-400">{sec.tip}</span>}
              </div>
              <textarea
                ref={el => textareaRefs.current[sec.id] = el}
                value={sections[sec.id] || ''}
                onChange={e => setSection(sec.id, e.target.value)}
                onFocus={() => setActiveSection(sec.id)}
                placeholder={`在此填写${sec.label}...`}
                rows={sec.rows || 3}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 resize-y leading-relaxed placeholder:text-slate-300"
              />
              {sec.chipGroups && sec.chipGroups.length > 0 && sec.chipGroups.map((group, gi) => (
                <div className="mt-1.5" key={gi}>
                  <p className="text-[10px] text-slate-400 mb-1">{group.label}</p>
                  <div className="flex flex-wrap gap-1">
                    {group.items.map((chip, i) => (
                      <button key={i} type="button" onClick={() => insertChip(sec.id, chip)}
                        className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 transition-colors">
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              {!sec.chipGroups && sec.chips && sec.chips.length > 0 && (
                <div className="mt-1.5">
                  <p className="text-[10px] text-slate-400 mb-1">点击插入提示词：</p>
                  <div className="flex flex-wrap gap-1">
                    {sec.chips.map((chip, i) => (
                      <button key={i} type="button" onClick={() => insertChip(sec.id, chip)}
                        className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 transition-colors">
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* 连词工具箱 */}
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-xs font-semibold text-amber-800">🔗 连词工具箱</span>
              <span className="text-[10px] text-amber-500">点击插入当前编辑区</span>
            </div>
            <div className="space-y-1.5">
              {conjunctions.map(group => (
                <div key={group.group}>
                  <span className="text-[10px] text-amber-600 font-medium">{group.group} </span>
                  <div className="inline-flex flex-wrap gap-1">
                    {group.items.map(item => (
                      <button key={item} type="button" onClick={() => { if (activeSection) insertChip(activeSection, item) }}
                        className="text-xs px-2 py-0.5 rounded bg-white text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors">
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 句式升级 + 亮点词汇 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200">
              <p className="text-xs font-semibold text-indigo-800 mb-1.5">📐 句式升级</p>
              <div className="space-y-1.5">
                {sentenceUpgrades.map((s, i) => (
                  <div key={i} className="text-[11px] text-indigo-700">
                    <span className="font-medium">{s.desc}</span>
                    <span className="text-indigo-400"> {s.pattern}</span>
                    <div className="text-[10px] text-indigo-400">例：{s.example}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-purple-50 border border-purple-200">
              <p className="text-xs font-semibold text-purple-800 mb-1.5">✨ 亮点词汇替换</p>
              <div className="space-y-1">
                <div className="text-[10px] text-purple-500">避免总是用同一个词：</div>
                <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-[11px]">
                  <span className="text-purple-400">good →</span> <span className="text-purple-700">excellent, great, wonderful, fantastic</span>
                </div>
                <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-[11px]">
                  <span className="text-purple-400">important →</span> <span className="text-purple-700">significant, essential, vital, crucial</span>
                </div>
                <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-[11px]">
                  <span className="text-purple-400">like →</span> <span className="text-purple-700">enjoy, be fond of, be keen on, adore</span>
                </div>
                <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-[11px]">
                  <span className="text-purple-400">think →</span> <span className="text-purple-700">believe, suppose, hold the view that, as far as I am concerned</span>
                </div>
              </div>
            </div>
          </div>

          {/* 句式多样化：避免全用 I 开头 */}
          <div className="p-3 rounded-xl bg-green-50 border border-green-200">
            <p className="text-xs font-semibold text-green-800 mb-1.5">🔄 句式多样化（避免全用 I 开头）</p>
            <div className="space-y-1 text-[11px] text-green-700">
              <div><span className="text-green-500">❌</span> I went to... I saw... I thought...</div>
              <div className="flex flex-wrap gap-x-2">
                <span className="text-green-500">✅</span>
                <span><b>介词开头：</b>In the morning, ... / After school, ... / With the help of...</span>
              </div>
              <div className="flex flex-wrap gap-x-2">
                <span className="text-green-500">✅</span>
                <span><b>分词开头：</b>Having finished... / Feeling nervous... / Encouraged by...</span>
              </div>
              <div className="flex flex-wrap gap-x-2">
                <span className="text-green-500">✅</span>
                <span><b>形式主语：</b>It is + adj. + for me to... / It is said that...</span>
              </div>
              <div className="flex flex-wrap gap-x-2">
                <span className="text-green-500">✅</span>
                <span><b>倒装强调：</b>Only by doing... / Not until... / So + adj. + that...</span>
              </div>
              <div className="flex flex-wrap gap-x-2">
                <span className="text-green-500">✅</span>
                <span><b>谚语点睛：</b>As the saying goes, "Practice makes perfect." / "Where there is a will, there is a way." / "Actions speak louder than words."</span>
              </div>
            </div>
            <div className="mt-1.5">
              <p className="text-[10px] text-green-500 mb-0.5">点击插入谚语：</p>
              <div className="flex flex-wrap gap-1">
                {["Practice makes perfect", "Where there is a will, there is a way", "Actions speak louder than words", "Every coin has two sides", "Nothing is impossible to a willing heart", "Rome was not built in a day"].map(s => (
                  <button key={s} type="button" onClick={() => { if (activeSection) insertChip(activeSection, s) }}
                    className="text-xs px-2 py-0.5 rounded bg-white text-green-700 border border-green-200 hover:bg-green-100 transition-colors">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 右：实时预览 */}
        <div className="w-full lg:w-80 xl:w-96 p-4 bg-slate-50/50 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-slate-400" /> 实时预览
            </h3>
            <span className={`text-xs font-medium ${wordCount > maxWords ? 'text-red-500' : wordCount < minWords ? 'text-amber-500' : 'text-green-500'}`}>
              {wordCount} / {maxWords} 词
            </span>
          </div>
          <div className="flex-1 min-h-[300px] p-4 rounded-xl bg-white border border-slate-200 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
            {content || <span className="text-slate-300 italic">填写左侧内容，作文会自动拼合...</span>}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between p-4 border-t border-slate-100">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>推荐词数：{minWords}-{maxWords}</span>
        </div>
        <button onClick={onSubmit} disabled={!content.trim() || loading}
          className="px-6 py-2.5 rounded-xl text-white font-medium bg-gradient-to-r from-rose-500 to-pink-500 shadow-lg shadow-rose-200 hover:shadow-xl disabled:opacity-50 transition-all flex items-center gap-2">
          {loading ? <><RefreshCw className="w-4 h-4 animate-spin" /> 提交中...</> : <><Send className="w-4 h-4" /> 提交作文</>}
        </button>
      </div>
      {error && <p className="px-4 pb-4 text-sm text-red-500">{error}</p>}
    </div>
  )
}

function TeacherView({ grade }: { grade: 'junior' | 'senior' }) {
  const [submissions, setSubmissions] = useState<any[]>([])
  const [stats, setStats] = useState({
    totalSubmissions: 0,
    avgScore: 0,
    commonErrors: [] as { error: string; count: number }[],
    topTasks: [] as { title: string; count: number }[],
  })

  useEffect(() => {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEYS.submissions) || '[]')
      const gradeData = data.filter((s: any) => s.grade === grade)
      setSubmissions(gradeData)

      if (gradeData.length > 0) {
        const totalScore = gradeData.reduce((sum: number, s: any) => sum + (s.scores?.total || 0), 0)
        const avg = Math.round(totalScore / gradeData.length)

        const taskCounts: Record<string, number> = {}
        gradeData.forEach((s: any) => {
          const t = s.taskTitle || '未知'
          taskCounts[t] = (taskCounts[t] || 0) + 1
        })
        const topTitles = Object.entries(taskCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([title, count]) => ({ title, count }))

        const errors: Record<string, number> = {}
        gradeData.forEach((s: any) => {
          const details = s.scores?.language?.details || s.scores?.content?.details || []
          details.forEach((d: any) => {
            if (d.issue) {
              const key = d.issue.substring(0, 20)
              errors[key] = (errors[key] || 0) + 1
            }
          })
        })
        const topErrors = Object.entries(errors)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([error, count]) => ({ error, count }))

        setStats({
          totalSubmissions: gradeData.length,
          avgScore: avg,
          commonErrors: topErrors,
          topTasks: topTitles,
        })
      }
    } catch {}
  }, [grade])

  const gc = GRADE_COLORS[grade]

  return (
    <div className={`bg-white rounded-2xl shadow-sm border ${gc.border} p-6`}>
      <div className="flex items-center gap-2 mb-4">
        <Users className={`w-5 h-5 ${gc.text}`} />
        <h3 className="font-semibold text-slate-800">教师端 - 班级数据看板</h3>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
          <div className="text-xs text-slate-500">提交总数</div>
          <div className="text-xl font-bold text-slate-800">{stats.totalSubmissions}</div>
        </div>
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
          <div className="text-xs text-slate-500">平均分</div>
          <div className="text-xl font-bold text-slate-800">{stats.avgScore}</div>
        </div>
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
          <div className="text-xs text-slate-500">优秀率</div>
          <div className="text-xl font-bold text-slate-800">{stats.totalSubmissions > 0 ? Math.round(submissions.filter(s => (s.scores?.total || 0) >= 64).length / stats.totalSubmissions * 100) : 0}%</div>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <h4 className="text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1"><BarChart3 className="w-3 h-3" /> 本周热门题目</h4>
          {stats.topTasks.length === 0 ? (
            <p className="text-xs text-slate-400 italic">暂无数据</p>
          ) : (
            <div className="space-y-1">
              {stats.topTasks.map((t, i) => (
                <div key={i} className="flex items-center justify-between text-xs text-slate-600">
                  <span>{t.title}</span>
                  <span className="text-slate-400">{t.count}次</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h4 className="text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1"><Award className="w-3 h-3" /> 学生常见错误</h4>
          {stats.commonErrors.length === 0 ? (
            <p className="text-xs text-slate-400 italic">暂无数据</p>
          ) : (
            <div className="space-y-1">
              {stats.commonErrors.map((e, i) => (
                <div key={i} className="flex items-center justify-between text-xs text-slate-600">
                  <span>{e.error}...</span>
                  <span className="text-red-500 font-medium">{e.count}次</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
