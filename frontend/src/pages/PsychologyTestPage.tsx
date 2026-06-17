import { useState, useMemo } from 'react'
import { ArrowLeft, RefreshCw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface QItem { q: string; opts: string[]; scores: number[] }
interface PsychTest {
  id: string; title: string; emoji: string; desc: string; color: string; questions: QItem[]
  getResult: (s: number) => { label: string; desc: string; emoji: string }
}

function shuffleArr<T>(a: T[]): T[] {
  const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]] }; return b
}

const OPTS = ['不同意', '不太同意', '有点同意', '同意']
const OPTS_FREQ = ['从不', '偶尔', '经常', '总是']
const OPTS_AGREE = ['非常不符合', '比较不符合', '比较符合', '非常符合']
const OPTS_YESNO = ['不会', '可能会', '会', '一定会']

function t(id: string, title: string, emoji: string, desc: string, color: string, questions: QItem[], getResult: (s: number) => { label: string; desc: string; emoji: string }): PsychTest {
  return { id, title, emoji, desc, color, questions: shuffleArr(questions), getResult }
}

const TESTS: PsychTest[] = [
  t('values', '价值观测试', '⚖️', '12个道德困境，揭示你内心深处的道德哲学倾向', '#6366f1', [
    { q: '一辆失控的电车即将撞死五个人，你可以扳动道岔让电车转向只有一个人的轨道。你会？', opts: ['什么都不做', '扳动道岔', '把胖子推下天桥', '喊他们快跑'], scores: [0, 3, 2, 1] },
    { q: '你的好朋友犯了罪，你是唯一知道真相的人。法-官问你时，你会？', opts: ['如实说出', '说不知道', '帮他隐瞒', '劝他自首'], scores: [1, 2, 0, 3] },
    { q: '一个AI可以优化资源分配，让社会总幸福度提升30%，但需要完全剥夺个人隐私。你支持吗？', opts: ['坚决反对', '部分支持', '全力支持', '看情况'], scores: [0, 2, 3, 1] },
    { q: '你发现公司的一项政策虽然合法，但会伤害弱势群体。你会？', opts: ['照做不误', '内部举报', '公开曝光', '辞职抗议'], scores: [3, 2, 1, 0] },
    { q: '为了拯救一万个病人，是否应该强制一个人捐献器官（即使他不同意）？', opts: ['不应该', '应该', '看具体情况', '投票决定'], scores: [0, 3, 1, 2] },
    { q: '你捡到一个钱包，里面有一大笔钱和失主的身份证。附近没人看到。你会？', opts: ['交给警察', '联系失主', '据为己有', '捐给慈善'], scores: [2, 3, 0, 1] },
    { q: '你的国家正在打仗，你收到征召令但可以用钱买通免除兵役。你会？', opts: ['应征入伍', '买通免役', '离开国家', '抗议战争'], scores: [3, 1, 0, 2] },
    { q: '一个濒-临倒闭的工厂里有500名工人。工厂的污染正在让附近居民生病。你会？', opts: ['关停工厂', '继续运营', '逐步整改', '搬迁工厂'], scores: [1, 3, 2, 0] },
    { q: '你知道同事在背后说了你的坏话，但他最近家里出了大事。你会？', opts: ['表示关心', '假装不知', '当面对质', '以牙还牙'], scores: [2, 1, 3, 0] },
    { q: '你的孩子偷了东西，你是家长。你会？', opts: ['严厉惩罚', '讲道理', '帮他善后', '让他自己处理'], scores: [1, 2, 0, 3] },
    { q: '一个绝症病人请求你协助他结束生命以减轻痛苦。你会？', opts: ['帮助他', '拒绝他', '劝他等待', '报告医生'], scores: [2, 0, 1, 3] },
    { q: '你中了彩票，但你知道最好的朋友急需这笔钱救命。你会？', opts: ['全部给他', '借给他一半', '只给一部分', '留着自己用'], scores: [2, 3, 1, 0] },
  ], s => {
    if (s >= 28) return { label: '功利主义倾向', desc: '你倾向于以结果衡量行为的道德性，追求最大化总体幸福。你相信"为最多人谋取最大利益"是道德的核心。', emoji: '📊' }
    if (s >= 18) return { label: '义务论倾向', desc: '你注重行为本身的对错，认为某些原则不应被打破。你相信规则和职责比结果更重要。', emoji: '⚖️' }
    return { label: '关怀伦理倾向', desc: '你注重具体情境中的人际关系，认为道德源于关爱与同理心。你倾向于具体情况具体分析。', emoji: '💝' }
  }),

  t('spiritual', '精神需求测试', '✨', '12道情境题，揭示你内心最渴望被满足的核心精神需求', '#8b5cf6', [
    { q: '周末一个人在家，你最想做的是？', opts: ['规划下周计划', '约朋友聚餐', '学习新技能', '冥想放松'], scores: [2, 1, 3, 0] },
    { q: '工作/学习中，最让你有成就感的是？', opts: ['完成任务', '被表扬', '学到新东西', '帮到别人'], scores: [1, 3, 2, 0] },
    { q: '和朋友吵架后，你最需要的是？', opts: ['冷静独处', '对方主动道歉', '分析谁对谁错', '朋友的理解'], scores: [3, 1, 2, 0] },
    { q: '你更害怕失去什么？', opts: ['稳定的工作', '亲密的友谊', '自由的时间', '人生的方向'], scores: [1, 2, 3, 0] },
    { q: '做决定时，你最看重的是？', opts: ['安全性', '他人意见', '自主选择', '长远意义'], scores: [1, 0, 3, 2] },
    { q: '你最容易感到焦虑的是？', opts: ['未来不确定', '被孤立', '被限制', '生活无意义'], scores: [1, 2, 3, 0] },
    { q: '收到礼物时，你更在意的是？', opts: ['实用价值', '送礼的心意', '是否是自己想要的', '礼物的寓意'], scores: [1, 3, 2, 0] },
    { q: '你更羡慕哪种人？', opts: ['生活安稳的人', '朋友众多的人', '自由自在的人', '找到使命的人'], scores: [0, 1, 3, 2] },
    { q: '当你遇到困难时，你第一时间会？', opts: ['自己想办法', '找人帮忙', '先放一放', '想为什么是我'], scores: [1, 2, 3, 0] },
    { q: '你在社交场合中最在意的是？', opts: ['是否安全', '是否被接纳', '是否自在', '是否有意义'], scores: [0, 2, 3, 1] },
    { q: '你更愿意把钱花在？', opts: ['保险/储蓄', '聚会/社交', '旅行/体验', '学习/成长'], scores: [1, 0, 3, 2] },
    { q: '你的座右铭更接近？', opts: ['安全第一', '众人拾柴', '随心所欲', '活出意义'], scores: [1, 0, 3, 2] },
  ], s => {
    if (s >= 28) return { label: '自由感主导', desc: '你内心深处最渴望的是自主选择和独立空间。你反感被束缚，追求探索和弹性生活。让你感到窒息的是限制，让你绽放的是自由。', emoji: '🕊️' }
    if (s >= 18) return { label: '认同感主导', desc: '你渴望被认可、被尊重。成就和地位对你很重要，你希望自己的价值被他人看见。适度的赞扬是你前进的动力。', emoji: '🏆' }
    return { label: '归属感主导', desc: '对你来说，爱与被爱、陪伴和理解是最重要的。你重视人际关系，善于共情，但也容易因为他人的态度而情绪波动。', emoji: '🤗' }
  }),

  t('attachment', '依恋类型测试', '💕', '15道情境题，揭示你在亲密关系中的依恋模式', '#ec4899', [
    { q: '伴侣半天没回消息，你的第一反应是？', opts: ['ta在忙吧', 'ta是不是生气了', '无所谓', '有点担心但先等等'], scores: [0, 3, 1, 2] },
    { q: '和伴侣吵架后，你通常会？', opts: ['主动沟通解决问题', '等对方来找我', '需要一个人静一静', '害怕ta会离开我'], scores: [0, 2, 3, 1] },
    { q: '伴侣说需要更多个人空间，你的感受是？', opts: ['理解和支持', '感到不安', '松了一口气', '怀疑自己做错了什么'], scores: [0, 3, 1, 2] },
    { q: '当你情绪低落时，你更倾向于？', opts: ['告诉伴侣寻求安慰', '自己消化', '不想让伴侣担心', '测试伴侣是否关心我'], scores: [1, 3, 2, 0] },
    { q: '你对亲密关系的看法是？', opts: ['亲密很自然', '渴望但害怕受伤', '保持距离更安全', '既想靠近又怕靠近'], scores: [0, 2, 3, 1] },
    { q: '伴侣和朋友走得很近，你会？', opts: ['为他们高兴', '有点吃醋但不说', '感到威胁', '完全信任'], scores: [2, 1, 3, 0] },
    { q: '你过去的感情经历中，常见模式是？', opts: ['稳定长久', '总是爱上不该爱的人', '对方说我太冷漠', '经常担心被甩'], scores: [0, 2, 3, 1] },
    { q: '伴侣忘记了一个重要纪念日，你会？', opts: ['提醒ta下次记住', '默默生气', '觉得无所谓', '怀疑ta不在乎我'], scores: [2, 1, 0, 3] },
    { q: '你如何看待依赖伴侣这件事？', opts: ['很正常', '我害怕依赖别人', '我渴望依赖但不敢', '依赖是可耻的'], scores: [0, 3, 2, 1] },
    { q: '伴侣批评你时，你的第一反应是？', opts: ['理性思考', '感觉很受伤', '关闭自己', '过度道歉'], scores: [1, 3, 2, 0] },
    { q: '你更常经历哪种情绪？', opts: ['平静安心', '焦虑不安', '疏离冷漠', '矛盾混乱'], scores: [0, 3, 2, 1] },
    { q: '面对分手，你通常会？', opts: ['难过但能接受', '拼命挽回', '很快走出来', '表面无所谓内心崩溃'], scores: [0, 3, 1, 2] },
    { q: '在关系中，你更害怕？', opts: ['失去自我', '被抛弃', '被控制', '不被理解'], scores: [1, 3, 2, 0] },
    { q: '你对说出"我爱你"的态度是？', opts: ['自然地说', '需要很大的勇气', '很少说', '等对方先说'], scores: [1, 3, 0, 2] },
    { q: '你的理想关系是？', opts: ['亲密又独立', '时刻黏在一起', '各自有充分空间', '心有灵犀但不必常联系'], scores: [0, 2, 3, 1] },
  ], s => {
    if (s >= 32) return { label: '焦虑型依恋', desc: '你在关系中容易患得患失，渴望亲密又害怕被抛弃。你需要大量的确认和回应来获得安全感。', emoji: '😰' }
    if (s >= 18) return { label: '安全型依恋', desc: '你在关系中能够舒适地享受亲密，也能保持独立性。你信任伴侣，也能表达自己的需求，是最健康的依恋模式。', emoji: '😊' }
    return { label: '回避型依恋', desc: '你倾向于保持情感距离，强调独立自主。亲密让你感到不适，你更喜欢保持一定的空间和自由。', emoji: '🧊' }
  }),

  t('stress', '压力应对测试', '🌊', '测你的压力应对风格：积极面对、情绪宣泄还是回避逃离', '#06b6d4', [
    { q: '重要的考试/工作截止日期临近，你会？', opts: ['制定计划执行', '焦虑但拖延', '找人倾诉', '告诉自己无所谓'], scores: [3, 1, 2, 0] },
    { q: '被领导/老师当众批评后，你会？', opts: ['反思改进', '郁闷好几天', '找朋友吐槽', '觉得对方有问题'], scores: [3, 1, 2, 0] },
    { q: '遇到无法解决的难题时，你通常？', opts: ['分解问题逐一攻克', '先放一放再说', '请教有经验的人', '换个方向试试'], scores: [3, 1, 2, 0] },
    { q: '做错了一件事，你的第一反应是？', opts: ['想办法弥补', '自责很久', '说出来求安慰', '尽量不让别人知道'], scores: [3, 1, 2, 0] },
    { q: '压力大的时候，你的身体反应是？', opts: ['没什么特别', '失眠/食欲改变', '头痛/胃痛', '容易感冒'], scores: [3, 1, 2, 0] },
    { q: '面对突发事件，你的心态是？', opts: ['冷静处理', '先慌一阵', '马上求助', '先观察再说'], scores: [3, 1, 2, 0] },
    { q: '你通常会用什么方式减压？', opts: ['运动/爱好', '吃/购物/游戏', '找人聊天', '睡觉/发呆'], scores: [3, 0, 2, 1] },
    { q: '当朋友向你倾诉烦恼时，你通常会？', opts: ['给建议', '陪着一起焦虑', '认真倾听', '转移话题'], scores: [2, 1, 3, 0] },
    { q: '你觉得自己抗压能力如何？', opts: ['很强', '一般般', '比较差', '时好时坏'], scores: [3, 2, 0, 1] },
    { q: '连续遇到几个不顺心的事，你会？', opts: ['调整心态继续', '情绪崩溃', '找人喝酒/倾诉', '摆烂一阵'], scores: [3, 0, 2, 1] },
  ], s => {
    if (s >= 24) return { label: '积极应对型', desc: '你倾向于直面压力，主动寻求解决方案。你拥有良好的抗压能力和情绪调节能力，是压力管理的高手。', emoji: '💪' }
    if (s >= 14) return { label: '情绪宣泄型', desc: '你通过表达和倾诉来释放压力。这种方式有其价值，但也可能陷入情绪循环。适当地结合行动会更有帮助。', emoji: '🗣️' }
    return { label: '回避逃离型', desc: '面对压力时你倾向于暂时回避或转移注意力。这可以给你缓冲时间，但如果长期逃避会积累更多压力。', emoji: '🏃' }
  }),

  t('empathy', '共情能力测试', '💗', '12道情境题，评估你感受与理解他人情感的能力', '#f43f5e', [
    { q: '朋友在电话里哭了，你会？', opts: ['安静地听ta哭', '说"别哭了"', '问发生了什么', '帮ta分析问题'], scores: [2, 0, 3, 1] },
    { q: '看到流浪动物受伤，你的感受是？', opts: ['心疼想帮忙', '有点难过但不管', '正常自然现象', '觉得很可怜'], scores: [3, 1, 0, 2] },
    { q: '同事被领导冤枉了，你会？', opts: ['替同事说话', '私下安慰同事', '事不关己', '帮同事找证据'], scores: [2, 3, 0, 1] },
    { q: '朋友分享了开心的事，你虽然心情不好也会？', opts: ['真心为ta高兴', '假装开心恭喜', '说自己的烦心事', '等心情好了再回应'], scores: [3, 1, 0, 2] },
    { q: '看影视作品时，你？', opts: ['很容易代入角色', '比较冷静', '只在感人处有反应', '觉得都是假的'], scores: [3, 1, 2, 0] },
    { q: '有人在你面前摔倒受伤了，你的第一反应是？', opts: ['马上扶起来', '问有没有事', '有点想笑', '看别人怎么做'], scores: [3, 2, 0, 1] },
    { q: '朋友做了让你生气的决定，你会？', opts: ['理解ta的立场', '生闷气', '换位思考后释然', '坚持自己是对的'], scores: [2, 1, 3, 0] },
    { q: '你能察觉到别人没说出口的情绪吗？', opts: ['经常能', '偶尔能', '很少', '完全不会'], scores: [3, 2, 1, 0] },
    { q: '别人遭遇不幸时，你更容易？', opts: ['感同身受', '理性安慰', '不知所措', '觉得和自己无关'], scores: [3, 2, 1, 0] },
    { q: '你曾经因为别人的遭遇而自己哭过吗？', opts: ['经常', '有过几次', '很少', '从来没有'], scores: [3, 2, 1, 0] },
    { q: '朋友找你吐槽伴侣，你会？', opts: ['共情倾听', '一起骂对方', '给实际建议', '劝分'], scores: [3, 2, 1, 0] },
    { q: '你觉得"我理解你的感受"这句话？', opts: ['很有力量', '要看情况', '说了也没用', '敷衍的话'], scores: [3, 2, 1, 0] },
  ], s => {
    if (s >= 28) return { label: '高共情者', desc: '你有极强的同理心，能够敏锐地感知他人的情绪并产生共鸣。你是天生的倾听者和支持者，但也要注意保护自己的情绪能量。', emoji: '💖' }
    if (s >= 16) return { label: '中等共情者', desc: '你有正常的共情能力，能在需要时理解他人的感受。你的理性和感性取得了不错的平衡。', emoji: '💗' }
    return { label: '低共情者', desc: '你偏向理性思考，不易被他人情绪影响。这在某些场合是优势，但也要注意不要显得冷漠。', emoji: '🧊' }
  }),

  t('ocd', '强迫症测试', '🔂', '科学测量你的强迫症指数：你到底有多强迫？', '#f97316', [
    { q: '出门后总怀疑门没锁/煤气没关，要回去检查？', opts: ['从不', '偶尔', '经常', '每次都要'], scores: [0, 1, 2, 3] },
    { q: '桌上的东西必须摆放整齐，歪了会难受？', opts: ['完全不会', '有点在意', '必须摆正', '会一直在意'], scores: [0, 1, 2, 3] },
    { q: '反复洗手或消毒，觉得手不干净？', opts: ['从不', '偶尔', '经常', '每天很多次'], scores: [0, 1, 2, 3] },
    { q: '做事情必须按照固定流程，打乱了会重来？', opts: ['没有这种习惯', '有一点偏好', '会比较不舒服', '一定重来'], scores: [0, 1, 2, 3] },
    { q: '脑子里反复出现某个不受欢迎的想法或画面？', opts: ['从不', '偶尔', '经常', '每天都有'], scores: [0, 1, 2, 3] },
    { q: '数字偏好——喜欢双数/特定数字，避开某些数字？', opts: ['没注意过', '有点偏好', '比较在意', '严格遵循'], scores: [0, 1, 2, 3] },
    { q: '发消息前会反复检查措辞，改很多遍？', opts: ['直接发送', '看一遍就够了', '会检查几遍', '改到满意才发'], scores: [0, 1, 2, 3] },
    { q: '衣柜/抽屉整理有强迫症，必须分门别类？', opts: ['比较随意', '大概分类', '整齐排列', '严格分类'], scores: [0, 1, 2, 3] },
    { q: '计数器/进度条必须到整数心里才舒服？', opts: ['无所谓', '有点在意', '会凑整', '必须凑整'], scores: [0, 1, 2, 3] },
    { q: '会因为"不吉利"的想法而做一些仪式性动作？', opts: ['从不', '极少', '有时候', '经常'], scores: [0, 1, 2, 3] },
  ], s => {
    if (s >= 24) return { label: '重度强迫倾向', desc: '你有明显的强迫倾向，这些行为可能已经影响到你的日常生活效率。如果感到困扰，建议寻求专业帮助。', emoji: '⚠️' }
    if (s >= 12) return { label: '中度强迫倾向', desc: '你有一定的强迫特质，对秩序和清洁有较高要求。这让你做事认真细致，但也要注意不要过度消耗精力。', emoji: '📏' }
    return { label: '轻度/无强迫倾向', desc: '你的心态比较放松，不拘泥于细节和流程。适应能力强，不会因为琐事感到焦虑。', emoji: '😌' }
  }),

  t('social', '社恐社牛测试', '🦋', '测你在社恐↔社牛光谱上的精确坐标', '#10b981', [
    { q: '在聚会上你更倾向于？', opts: ['躲在角落', '主动社交', '等别人来找我', '只和熟人聊'], scores: [0, 3, 1, 2] },
    { q: '打电话前你会？', opts: ['紧张很久', '直接拨号', '先打草稿', '尽量发消息代替'], scores: [0, 3, 1, 2] },
    { q: '被要求当众发言时，你的反应是？', opts: ['非常紧张', '从容上台', '有点紧张但能应对', '想办法拒绝'], scores: [1, 3, 2, 0] },
    { q: '和不熟悉的人吃饭，你会？', opts: ['很不自在', '主动找话题', '等对方开口', '专心吃饭'], scores: [0, 3, 2, 1] },
    { q: '路上遇到半生不熟的人，你会？', opts: ['假装没看见', '主动打招呼', '微笑点头', '低头看手机'], scores: [1, 3, 2, 0] },
    { q: '加入一个新群体，你通常？', opts: ['很久才能融入', '很快打成一片', '慢慢观察再融入', '等别人来和我说话'], scores: [0, 3, 2, 1] },
    { q: '陌生人主动和你搭讪，你会？', opts: ['紧张/防备', '热情回应', '礼貌回应', '尴尬'], scores: [1, 3, 2, 0] },
    { q: '你在社交场合耗电还是充电？', opts: ['非常耗电', '极度充电', '看情况', '有点耗电但还行'], scores: [0, 3, 2, 1] },
    { q: '生日时你希望怎么过？', opts: ['几个人小聚', '大型派对', '和亲人过', '一个人就好'], scores: [1, 3, 2, 0] },
    { q: '向陌生人问路/求助时，你？', opts: ['很难开口', '很自然', '有点犹豫', '先查手机'], scores: [1, 3, 2, 0] },
  ], s => {
    if (s >= 26) return { label: '天生社牛', desc: '你天生就是社交达人！在任何场合都能游刃有余，享受与人互动的过程。你是聚会中活跃气氛的那个人。', emoji: '🦁' }
    if (s >= 14) return { label: '中间地带', desc: '你既不是社恐也不是社牛，社交对你来说不困难也不算享受。你能在需要时社交，但也需要独处恢复能量。', emoji: '🐨' }
    return { label: '资深社恐', desc: '社交对你来说是一件消耗能量的事情。你不喜欢成为焦点，独处和深度交流更适合你。这不代表有问题，只是你的特质。', emoji: '🐢' }
  }),

  t('mentalfriction', '精神内耗测试', '💭', '测测你的精神内耗指数：明明什么都没做却感觉身心俱疲', '#a855f7', [
    { q: '晚上躺在床上，脑子里会反复回放白天的事？', opts: ['从不', '偶尔', '经常', '每晚都这样'], scores: [0, 1, 2, 3] },
    { q: '做决定时，你会纠结很久，反复权衡？', opts: ['果断决定', '稍微想想', '纠结一阵', '非常痛苦'], scores: [0, 1, 2, 3] },
    { q: '别人随口说的话，你会反复琢磨ta是什么意思？', opts: ['完全不会', '想一下而已', '会想很久', '反复分析'], scores: [0, 1, 2, 3] },
    { q: '你经常感到"明明没做什么却很累"？', opts: ['从不', '偶尔', '经常', '每天如此'], scores: [0, 1, 2, 3] },
    { q: '犯错后你会反复自责，很长时间走不出来？', opts: ['很快释怀', '会反省但不过度', '自责好几天', '不断回想折磨自己'], scores: [0, 1, 2, 3] },
    { q: '你想做一件事，但会先想到各种坏结果而放弃？', opts: ['不会', '偶尔会', '经常会', '总是这样'], scores: [0, 1, 2, 3] },
    { q: '你在意别人对你的看法吗？', opts: ['不太在意', '有点在意', '很在意', '过度在意'], scores: [0, 1, 2, 3] },
    { q: '你经常同时想好几件事，脑子停不下来？', opts: ['很少', '偶尔', '经常', '一直如此'], scores: [0, 1, 2, 3] },
    { q: '对还没发生的事情，你会提前焦虑？', opts: ['从不', '偶尔', '经常', '总是提前焦虑'], scores: [0, 1, 2, 3] },
    { q: '你觉得自己目前的精神状态？', opts: ['轻松自在', '还行', '有点累', '非常疲惫'], scores: [0, 1, 2, 3] },
  ], s => {
    if (s >= 24) return { label: '重度内耗', desc: '你的内心戏非常丰富，大脑几乎时刻在运转。过度思考和焦虑正在消耗你的能量。建议学习正念冥想，学会让大脑休息。', emoji: '😩' }
    if (s >= 12) return { label: '中度内耗', desc: '你偶尔会陷入过度思考的循环，尤其在面对重要决定或人际冲突时。你已经意识到这个问题，这是改变的第一步。', emoji: '😐' }
    return { label: '轻度内耗', desc: '你的心态比较放松，很少陷入无意义的思考循环。你能较好地活在当下，不轻易被外界影响。', emoji: '😌' }
  }),

  t('glassheart', '玻璃心指数测试', '💔', '测测你的玻璃心指数：别人一句话就能让你碎一地吗？', '#f43f5e', [
    { q: '别人开玩笑说你一句，你会？', opts: ['一笑而过', '有点在意', '默默难过', '当场变脸'], scores: [0, 1, 2, 3] },
    { q: '发消息对方很久没回，你会？', opts: ['等ta有空回', '有点焦虑', '反复看手机', '觉得自己说错话了'], scores: [0, 1, 2, 3] },
    { q: '被人拒绝时，你的感受是？', opts: ['很正常', '有点失落', '很受伤', '觉得是自己不好'], scores: [0, 1, 2, 3] },
    { q: '同事/同学说"你今天的衣服好特别"，你会？', opts: ['谢谢', '觉得是夸奖', '怀疑是讽刺', '很不安'], scores: [0, 1, 2, 3] },
    { q: '被忽视（比如群聊里没人回你），你会？', opts: ['无所谓', '有点尴尬', '撤回消息', '难过一整天'], scores: [0, 1, 2, 3] },
    { q: '别人给你提建议时，你的第一反应是？', opts: ['虚心接受', '有点防御', '觉得被否定', '非常受伤'], scores: [0, 1, 2, 3] },
    { q: '你经常觉得别人话里有话？', opts: ['从不', '偶尔', '经常', '总是'], scores: [0, 1, 2, 3] },
    { q: '看到别人在低声说话，你会觉得在说自己？', opts: ['不会', '有时会', '经常会', '肯定是在说我'], scores: [0, 1, 2, 3] },
    { q: '你多久会因为别人的话而情绪低落？', opts: ['很少', '偶尔', '经常', '几乎每天'], scores: [0, 1, 2, 3] },
    { q: '你觉得自己是一个敏感的人吗？', opts: ['完全不', '有一点', '比较敏感', '非常敏感'], scores: [0, 1, 2, 3] },
  ], s => {
    if (s >= 24) return { label: '水晶玻璃心', desc: '你极度敏感，非常在意他人的看法和评价。别人的一句话可能让你想一整天。建议增强自我认同，学会区分他人评价和事实。', emoji: '🔮' }
    if (s >= 12) return { label: '普通玻璃心', desc: '你有一定的敏感度，在意自己在他人眼中的形象。这让你做事谨慎周到，但也要学会不过度解读。', emoji: '🫙' }
    return { label: '钻石心', desc: '你的心理素质很强，不太在意别人的看法和评价。你很清楚自己的价值，不轻易被外界动摇。', emoji: '💎' }
  }),

  t('peoplepleaser', '讨好型人格测试', '🥺', '测测你的讨好指数：你到底有多在意别人的感受而忽略了自己', '#fb923c', [
    { q: '朋友约你吃饭但你不想去，你会？', opts: ['直接拒绝', '找借口不去', '犹豫后还是去', '硬着头皮去'], scores: [0, 1, 2, 3] },
    { q: '你经常说"随便""都行"因为不想表达自己的意见？', opts: ['从不', '偶尔', '经常', '总是'], scores: [0, 1, 2, 3] },
    { q: '和人聊天时，即使不同意也会点头附和？', opts: ['不会', '偶尔会', '经常会', '总是这样'], scores: [0, 1, 2, 3] },
    { q: '你做错事后会过度道歉？', opts: ['正常道歉', '有点过度', '一直道歉', '为所有事道歉'], scores: [0, 1, 2, 3] },
    { q: '你害怕让别人失望吗？', opts: ['不太怕', '有点怕', '很怕', '最怕的事'], scores: [0, 1, 2, 3] },
    { q: '别人请你帮忙，即使你很忙也会答应？', opts: ['会拒绝', '看情况', '勉强答应', '一定会答应'], scores: [0, 1, 2, 3] },
    { q: '你经常为了和谐而压抑自己的真实感受？', opts: ['不会', '偶尔', '经常', '总是'], scores: [0, 1, 2, 3] },
    { q: '你觉得让别人开心是你的责任？', opts: ['完全不是', '有点', '比较同意', '非常同意'], scores: [0, 1, 2, 3] },
    { q: '你很难对别人说"不"？', opts: ['很容易', '还可以', '比较难', '非常难'], scores: [0, 1, 2, 3] },
    { q: '被表扬时你的反应是？', opts: ['开心接受', '有点不好意思', '觉得是客气', '否认并转移话题'], scores: [0, 1, 2, 3] },
  ], s => {
    if (s >= 24) return { label: '重度讨好倾向', desc: '你几乎把所有人的需求都放在自己之前。你害怕冲突和被讨厌，但这样长期会耗尽自己的能量。你的感受同样重要。', emoji: '😢' }
    if (s >= 12) return { label: '轻度讨好倾向', desc: '你在意他人的感受，有时会牺牲自己的需求。你是一个善良的人，但也要记得照顾好自己。', emoji: '🤗' }
    return { label: '自我坚定型', desc: '你懂得在照顾他人和照顾自己之间取得平衡。你有清晰的边界感，不会为了取悦他人而委屈自己。', emoji: '💪' }
  }),

  t('emo', 'EMO体质测试', '🌧️', '测测你的EMO指数：你到底有多容易陷入低落情绪？', '#6366f1', [
    { q: '你多久会感到莫名的情绪低落？', opts: ['很少', '一周一两次', '两三天一次', '几乎每天'], scores: [0, 1, 2, 3] },
    { q: '夜晚/独处时，你的情绪更容易？', opts: ['平静', '有点伤感', '低落', '崩溃'], scores: [0, 1, 2, 3] },
    { q: '听到伤感歌曲时，你？', opts: ['正常听', '会被触动', '会沉浸其中', '会哭出来'], scores: [0, 1, 2, 3] },
    { q: '面对困难时你更容易？', opts: ['积极应对', '有点沮丧', '消极悲观', '直接放弃'], scores: [0, 1, 2, 3] },
    { q: '你经常有"人间不值得"的想法吗？', opts: ['从不', '偶尔', '经常', '总是这么想'], scores: [0, 1, 2, 3] },
    { q: '过去一个月你哭过几次？', opts: ['0次', '1-2次', '3-5次', '6次以上'], scores: [0, 1, 2, 3] },
    { q: '你觉得自己对负面情绪的感受力？', opts: ['比较钝感', '正常', '比较敏感', '过度敏感'], scores: [0, 1, 2, 3] },
    { q: '看到夕阳/落叶等场景，你会？', opts: ['觉得美', '有点感慨', '莫名伤感', '很想哭'], scores: [0, 1, 2, 3] },
    { q: '你觉得自己的情绪恢复能力？', opts: ['很强', '一般', '比较慢', '很难恢复'], scores: [0, 1, 2, 3] },
    { q: '你觉得自己属于什么气质类型？', opts: ['阳光开朗', '大部分时间好', '忧郁底色', '深沉悲观'], scores: [0, 1, 2, 3] },
  ], s => {
    if (s >= 24) return { label: '重度EMO体质', desc: '你天生对情绪敏感，容易陷入低落和伤感。你的内心世界丰富而深刻，但要小心不要被负面情绪淹没。找信任的人聊聊会有帮助。', emoji: '🌧️' }
    if (s >= 12) return { label: '中度EMO体质', desc: '你偶尔会陷入emo时刻，尤其是在深夜或独处时。你有正常的情感波动，但大多数时候能够自我调节。', emoji: '⛅' }
    return { label: '阳光体质', desc: '你的情绪状态很稳定，不太容易陷入低落。你倾向于以积极的角度看待生活，是身边人的小太阳。', emoji: '☀️' }
  }),
]

export default function PsychologyTestPage() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<'hub' | string>('hub')
  const [qIdx, setQIdx] = useState(0)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)
  const [selectedOpts, setSelectedOpts] = useState<number[]>([])

  const current = TESTS.find(t => t.id === mode)

  const startTest = (id: string) => {
    setMode(id)
    setQIdx(0)
    setScore(0)
    setFinished(false)
    setSelectedOpts([])
  }

  const handleAnswer = (optIdx: number) => {
    if (!current) return
    const pts = current.questions[qIdx].scores[optIdx]
    setScore(s => s + pts)
    setSelectedOpts(prev => [...prev, optIdx])
    if (qIdx + 1 >= current.questions.length) {
      setFinished(true)
    } else {
      setQIdx(i => i + 1)
    }
  }

  const totalScore = current ? current.questions.reduce((s, q) => s + Math.max(...q.scores), 0) : 1
  const percentage = Math.round((score / totalScore) * 100)
  const result = current?.getResult(score)

  if (!current || finished) {
    if (finished && current && result) {
      return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #fef9e7 0%, #fae5d3 25%, #f5cba7 55%, #a9dfbf 85%, #fef9e7 100%)' }}>
          <div style={{ maxWidth: 520, margin: '0 auto', padding: '28px 20px' }}>
            <button onClick={() => { setMode('hub'); setFinished(false) }} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, color: '#4a3728', fontSize: 14, padding: 0, marginBottom: 28 }}>
              <ArrowLeft size={18} /> 返回列表
            </button>
            <div style={{ background: 'rgba(255,248,240,0.85)', borderRadius: 20, padding: '40px 28px', textAlign: 'center', backdropFilter: 'blur(12px)', border: '1px solid rgba(200,170,140,0.3)' }}>
              <div style={{ fontSize: 64, marginBottom: 12 }}>{result.emoji}</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#1a0f08', marginBottom: 6, letterSpacing: 1 }}>{result.label}</div>
              <div style={{ fontSize: 52, fontWeight: 800, color: current.color, margin: '16px 0' }}>{score}</div>
              <div style={{ height: 8, background: 'rgba(200,170,140,0.2)', borderRadius: 4, margin: '0 24px 20px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${percentage}%`, background: current.color, borderRadius: 4, transition: 'width 1s' }} />
              </div>
              <div style={{ fontSize: 14, color: '#2d1f14', lineHeight: 1.8, textAlign: 'left', margin: '0 4px' }}>{result.desc}</div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 28 }}>
                <button onClick={() => startTest(current.id)} style={{ background: `linear-gradient(135deg, ${current.color}, ${current.color}dd)`, border: 'none', color: 'white', padding: '12px 28px', borderRadius: 12, cursor: 'pointer', fontSize: 14, fontWeight: 700 }}>
                  <RefreshCw size={15} style={{ verticalAlign: 'middle', marginRight: 6 }} /> 重新测试
                </button>
                <button onClick={() => setMode('hub')} style={{ background: 'rgba(255,248,240,0.8)', border: '1px solid rgba(200,170,140,0.3)', color: '#2d1f14', padding: '12px 24px', borderRadius: 12, cursor: 'pointer', fontSize: 14, fontWeight: 700 }}>
                  其他测试
                </button>
              </div>
            </div>
          </div>
        </div>
      )
    }
    return mode !== 'hub' ? null : (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #fef9e7 0%, #fae5d3 25%, #f5cba7 55%, #a9dfbf 85%, #fef9e7 100%)' }}>
        <div style={{ maxWidth: 640, margin: '0 auto', padding: '28px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#2d1f14', display: 'flex' }}><ArrowLeft size={22} /></button>
            <span style={{ fontSize: 22, fontWeight: 800, color: '#1a0f08', letterSpacing: 2 }}>心理测试</span>
          </div>
          <div style={{ fontSize: 13, color: '#4a3728', marginBottom: 24, marginLeft: 42 }}>
            探索你的内心世界 · 基于心理学家实证研究
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {TESTS.map(t => (
              <button key={t.id} onClick={() => startTest(t.id)} style={{
                background: 'rgba(255,248,240,0.8)', border: '1px solid rgba(200,170,140,0.25)', borderRadius: 16, padding: '20px 14px', cursor: 'pointer',
                textAlign: 'center', backdropFilter: 'blur(4px)', transition: 'all 0.15s',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,248,240,0.95)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,248,240,0.8)'; e.currentTarget.style.transform = 'translateY(0)' }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>{t.emoji}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#1a0f08', marginBottom: 6 }}>{t.title}</div>
                <div style={{ fontSize: 11, color: '#4a3728', lineHeight: 1.5 }}>{t.desc}</div>
              </button>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 28, fontSize: 12, color: '#4a3728', lineHeight: 1.8 }}>
            测试结果仅供参考，不构成心理诊断。如持续感到困扰，建议寻求专业心理咨询。
          </div>
        </div>
      </div>
    )
  }

  const question = current.questions[qIdx]
  const progress = ((qIdx) / current.questions.length) * 100

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #fef9e7 0%, #fae5d3 25%, #f5cba7 55%, #a9dfbf 85%, #fef9e7 100%)' }}>
      <div style={{ maxWidth: 520, margin: '0 auto', padding: '28px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <button onClick={() => setMode('hub')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#2d1f14', display: 'flex' }}><ArrowLeft size={22} /></button>
          <span style={{ fontSize: 16, fontWeight: 700, color: '#1a0f08' }}>{current.emoji} {current.title}</span>
        </div>
        <div style={{ height: 6, background: 'rgba(200,170,140,0.2)', borderRadius: 3, marginBottom: 28, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progress}%`, background: current.color, borderRadius: 3, transition: 'width 0.3s' }} />
        </div>
        <div style={{ fontSize: 12, color: '#4a3728', marginBottom: 16 }}>第 {qIdx + 1}/{current.questions.length} 题</div>
        <div style={{ background: 'rgba(255,248,240,0.85)', borderRadius: 20, padding: '32px 24px', backdropFilter: 'blur(12px)', border: '1px solid rgba(200,170,140,0.3)', marginBottom: 20 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#1a0f08', lineHeight: 1.7, marginBottom: 28 }}>{question.q}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {question.opts.map((opt, i) => (
              <button key={i} onClick={() => handleAnswer(i)} style={{
                padding: '16px 18px', borderRadius: 14, cursor: 'pointer', fontSize: 15, fontWeight: 600,
                background: selectedOpts.includes(i) ? `${current.color}20` : 'rgba(255,248,240,0.5)',
                border: `2px solid ${selectedOpts.includes(i) ? current.color : 'rgba(200,170,140,0.2)'}`,
                color: selectedOpts.includes(i) ? current.color : '#1a0f08',
                textAlign: 'left',
                transition: 'all 0.15s',
              }}>{opt}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
