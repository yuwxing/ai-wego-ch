import React, { useState, useRef, createContext, useContext, ReactNode, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Swords, Heart, Zap, Shield, Star, ChevronRight, BookOpen, RotateCcw } from 'lucide-react'

const SAVE_KEY = 'grammar_quest_progress'

interface SaveData {
  clearedStages: number[]
  completedWorlds: number[]
  xp: number
  level: number
  wrongList: { q: string; a: string; user: string }[]
  totalAnswered: number
  totalCorrect: number
}

function loadSave(): SaveData | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function writeSave(data: SaveData) {
  localStorage.setItem(SAVE_KEY, JSON.stringify(data))
}

/* ========== 游戏状态 Context ========== */
interface GameState {
  xp: number; level: number; combo: number; hp: number; maxHp: number
  wrongList: { q: string; a: string; user: string }[]
  setXp: (v: number) => void; setLevel: (v: number) => void; setCombo: (v: number) => void
  setHp: (v: number) => void; addWrong: (q: string, a: string, user: string) => void; reset: () => void
}
const GameCtx = createContext<GameState>(null!)
function useGame() { return useContext(GameCtx) }

/* ========== 题库 ========== */
interface QItem { q: string; a: string; hint?: string }
interface Stage { id: number; name: string; lesson: string; questions: QItem[] }
interface World { id: number; name: string; icon: string; desc: string; stages: Stage[]; unlockLevel: number }

const grammarData: World[] = [
  {
    id: 1, name: '名词大陆', icon: '🌱', desc: '名词分类·可数与不可数·复数变化·所有格', unlockLevel: 1,
    stages: [
      { id: 1, name: '名词分类', lesson: '专有名词(人名/地名/月份/组织/报刊)首字母大写；普通名词分个体/集体/物质/抽象', questions: [
        { q: 'London 是普通名词还是专有名词？', a: '专有名词' },
        { q: 'water 是什么名词？', a: '物质名词' },
        { q: 'people 是？', a: '集体名词' },
        { q: 'health 是？', a: '抽象名词' },
        { q: '选出不同类: cola / water / rice / juice', a: 'rice' },
      ]},
      { id: 2, name: '可数与不可数', lesson: '可数名词可用how many提问，不可数名词用how much；不可数前不加a/an，用量词表数量', questions: [
        { q: 'How _____ apples do you want?', a: 'many' },
        { q: 'How _____ water do you drink?', a: 'much' },
        { q: 'a cup _____ tea', a: 'of' },
        { q: 'two _____ of bread', a: 'pieces' },
        { q: '选出不可数名词: pet / juice / friend / pear', a: 'juice' },
      ]},
      {
        id: 3, name: '复数变化规则', lesson: '一般+s; s/x/ch/sh+es; 辅音+y变y为i+es; f/fe变v+es; o+es/s特殊; 不规则man-men等',
        questions: [
          { q: 'box 的复数', a: 'boxes' },
          { q: 'baby 的复数', a: 'babies' },
          { q: 'knife 的复数', a: 'knives' },
          { q: 'sheep 的复数', a: 'sheep' },
          { q: 'tomato 的复数', a: 'tomatoes' },
          { q: 'child 的复数', a: 'children' },
          { q: 'foot 的复数', a: 'feet' },
        ]
      },
      {
        id: 4, name: '名词所有格', lesson: "'s有生命; of无生命; 双重所有格a friend of mine; 并列名词共同拥有最后+’s，各自拥有各自+’s",
        questions: [
          { q: 'Tom 和 Jerry 共有的房间 → Tom _____ Jerry', a: 'and' },
          { q: '老师的书 → the _____ book', a: "teacher's" },
          { q: '"我朋友的一本书" 英语', a: "my friend's book" },
          { q: 'the _____ of the hill (山顶)', a: 'top' },
        ]
      },
    ]
  },
  {
    id: 2, name: '词类工厂', icon: '🧃', desc: '冠词·代词·数词·介词·形容词·副词', unlockLevel: 2,
    stages: [
      {
        id: 5, name: '不定冠词 a/an', lesson: 'a+辅音音素开头; an+元音音素开头；5大用法：泛指某类、泛指某个、数量一、每一、固定搭配',
        questions: [
          { q: '___ apple (a/an)', a: 'an' },
          { q: '___ useful book (a/an)', a: 'a' },
          { q: '___ hour (a/an)', a: 'an' },
          { q: '___ university (a/an)', a: 'a' },
          { q: 'I play piano twice ___ week.', a: 'a' },
        ]
      },
      {
        id: 6, name: '定冠词 the', lesson: '特指、上文提过、双方知晓、形容词表一类人、独一无二、姓氏复数表一家人、序数词/最高级前、乐器前、专有名词前',
        questions: [
          { q: '太阳 → ___ sun', a: 'the' },
          { q: '___ Greens live in Beijing.', a: 'the' },
          { q: 'play ___ piano', a: 'the' },
          { q: '___ longest river', a: 'the' },
          { q: '___ young should respect ___ old.', a: 'the; the' },
        ]
      },
      {
        id: 7, name: '零冠词', lesson: '9类不加冠词：人名地名、季节月份星期、称呼头衔、三餐球类棋类、学科语言、指示/物主代词后、by交通方式、复数表一类、固定搭配',
        questions: [
          { q: 'I can play ___ basketball. (填/ /the/an/a)', a: '/' },
          { q: 'in ___ summer', a: '/' },
          { q: 'by ___ bus', a: '/' },
          { q: 'go to ___ school (去上学)', a: '/' },
          { q: 'at ___ table (吃饭)', a: '/' },
        ]
      },
      {
        id: 8, name: '人称代词', lesson: '主格(I/you/he/she/it/we/they)作主语；宾格(me/you/him/her/it/us/them)作宾语；单数排序二三一，复数一二三',
        questions: [
          { q: '___ am a student. (I/Me)', a: 'I' },
          { q: 'Ms. Green teaches ___ (we).', a: 'us' },
          { q: 'Give ___ a book. (I/me)', a: 'me' },
          { q: '___ is cute. (It/Its)', a: 'It' },
        ]
      },
      {
        id: 9, name: '物主代词', lesson: '形容词性(my/your/his/her/its/our/their)+名词；名词性(mine/yours/his/hers/its/ours/theirs)=形物代+名词',
        questions: [
          { q: 'This is ___ book. (I)', a: 'my' },
          { q: 'This pen is ___ (my).', a: 'mine' },
          { q: '___ (he) sister is a doctor.', a: 'his' },
          { q: 'Is this ___ (you)?', a: 'yours' },
        ]
      },
      {
        id: 10, name: '反身代词', lesson: '一二人称形物代+self/selves; 三人称宾格+self/selves; 作宾语/同位语/固定短语( enjoy oneself / by oneself)',
        questions: [
          { q: 'Help ___ to some fish, kids. (you)', a: 'yourselves' },
          { q: 'He said to ___ (he).', a: 'himself' },
          { q: 'The cat hurt ___ (it).', a: 'itself' },
          { q: 'I learnt it by ___ (I).', a: 'myself' },
        ]
      },
      {
        id: 11, name: '指示代词', lesson: 'this(近单)/these(近复); that(远单)/those(远复); 电话中this指自己that指对方',
        questions: [
          { q: '___ is my brother, and ___ name is Bob.', a: 'this; his' },
          { q: 'That is my cat. (改为复数句)', a: 'Those are my cats.' },
          { q: '___ is Mary speaking.', a: 'this' },
        ]
      },
      {
        id: 12, name: '疑问代词', lesson: 'who(谁)/whom(宾格)/whose(谁的)/what(什么)/which(哪个)',
        questions: [
          { q: '___ is your phone number?', a: 'What' },
          { q: '___ is bigger, the sun or the earth?', a: 'Which' },
          { q: '___ book is this? —It\'s mine.', a: 'Whose' },
          { q: '___ do you have lunch with?', a: 'Who/Whom' },
        ]
      },
      {
        id: 13, name: '不定代词', lesson: 'some/any; many/much; both/all; either/neither; few/little; others/another/the other',
        questions: [
          { q: 'Is there ___ orange juice? (some/any)', a: 'any' },
          { q: 'How ___ rabbits? (many/much)', a: 'many' },
          { q: 'I have two books. ___ are English. (both/all)', a: 'Both' },
          { q: 'One is big, ___ is small. (others/another/the other)', a: 'the other' },
          { q: '___ people like it. (Few/A few)', a: 'Few' },
        ]
      },
      {
        id: 14, name: '复合不定代词', lesson: 'some/any/every/no+one/body/thing; 作主语谓语三单; 形容词放后面(something interesting)',
        questions: [
          { q: 'I didn\'t have ___ to say. (something/anything)', a: 'anything' },
          { q: 'Would you like ___ to drink?', a: 'something' },
          { q: 'There isn\'t ___ left.', a: 'anything' },
          { q: 'Everyone ___ (want/wants) to have a holiday.', a: 'wants' },
          { q: 'I want ___ cheap. (something cheap/cheap something)', a: 'something cheap' },
        ]
      },
      {
        id: 15, name: '基数词', lesson: '1-12特殊; 13-19+teen; 20-90+ty; 百千百万十亿; 21-99加连字符; 百位+and',
        questions: [
          { q: '12 英语', a: 'twelve' },
          { q: '20 英语', a: 'twenty' },
          { q: '35 英语', a: 'thirty-five' },
          { q: '108 英语', a: 'one hundred and eight' },
        ]
      },
      {
        id: 16, name: '基数词用法', lesson: '表年龄(years old); 表时刻(past/to); 表编号(Class Three); 表次数(once/twice/数字+times)',
        questions: [
          { q: '7:20 读作 seven ____', a: 'twenty' },
          { q: '8:45 读作 a quarter ___ nine', a: 'to' },
          { q: '10:30 读作 half ___ ten', a: 'past' },
          { q: 'Six times five ___ thirty.', a: 'is' },
        ]
      },
      {
        id: 17, name: '序数词', lesson: 'first/second/third特殊; 4-19+th; 20-90y变ie+th; 几十几只变个位; 口诀：123特殊记，8去t9去e',
        questions: [
          { q: '第一 (英语)', a: 'first' },
          { q: '第二', a: 'second' },
          { q: '第三', a: 'third' },
          { q: '第五', a: 'fifth' },
          { q: '第九', a: 'ninth' },
          { q: '第十二', a: 'twelfth' },
          { q: '第三十', a: 'thirtieth' },
          { q: '第二十一', a: 'twenty-first' },
        ]
      },
      {
        id: 18, name: '序数词用法', lesson: '日期用序数词; the+序数词; 有物主代词不加the; 分数分子基数分母序数(>1+s)',
        questions: [
          { q: 'June ___ (1st / one)', a: '1st / the first' },
          { q: 'my ___ (ten / tenth) birthday', a: 'tenth' },
          { q: '___ fifth lesson = Lesson Five', a: 'The' },
          { q: '1/3 读作 one ___', a: 'third' },
          { q: '2/3 读作 two ___', a: 'thirds' },
        ]
      },
      {
        id: 19, name: '时间介词 in/on/at', lesson: 'in(>一天:年/月/季节/泛指早中晚); on(=一天:星期/日期/特指早中晚); at(<一天:具体时刻/noon/night)',
        questions: [
          { q: '___ summer', a: 'in' },
          { q: '___ Monday', a: 'on' },
          { q: '___ 3:00', a: 'at' },
          { q: '___ Sunday morning', a: 'on' },
          { q: '___ noon', a: 'at' },
          { q: '___ 2024', a: 'in' },
        ]
      },
      {
        id: 20, name: '地点方位介词', lesson: 'in(大)/at(小); above/below(无接触); over/under(正上/下); in front of/before(外部前); in the front of(内部前); between(两者)/among(三者)',
        questions: [
          { q: '___ Beijing', a: 'in' },
          { q: '___ the tree (在树下)', a: 'under' },
          { q: '___ the river (在河上:桥)', a: 'over' },
          { q: 'The shoe store is ___ the hospital and the supermarket.', a: 'between' },
        ]
      },
      {
        id: 21, name: '方式与其他介词', lesson: 'with+工具; in+语言/材料/颜色; by+交通工具/方式; across表面穿过; through内部穿过; along沿着',
        questions: [
          { q: 'cut ___ a knife', a: 'with' },
          { q: 'in ___ English (用英语)', a: '/' },
          { q: 'go ___ bike', a: 'by' },
          { q: 'walk ___ the road (穿过马路)', a: 'across' },
          { q: 'walk ___ the tunnel (穿过隧道)', a: 'through' },
        ]
      },
    ]
  },
  {
    id: 3, name: '句子战场', icon: '⚔️', desc: '形容词·副词·连词·动词·句子成分·句型·There be', unlockLevel: 3,
    stages: [
      {
        id: 22, name: '形容词用法', lesson: '放名词前; 系动词后; 修饰复合不定代词后置; -ed人/-ing物; 排序口诀:美小圆旧黄法国木书房',
        questions: [
          { q: 'something ___ (interesting/ interested)', a: 'interesting' },
          { q: 'I am ___ in the story. (interesting/interested)', a: 'interested' },
          { q: '一件新的蓝色连衣裙 英语', a: 'a new blue dress' },
          { q: 'The film is ___ (excited/exciting).', a: 'exciting' },
        ]
      },
      {
        id: 23, name: '比较级最高级构成', lesson: '一般+er/est; e结尾+r/st; 辅元辅双写; 辅音+y变i+er/est; 多音节more/most; 不规则good-better-best等',
        questions: [
          { q: 'tall 的比较级', a: 'taller' },
          { q: 'big 的比较级', a: 'bigger' },
          { q: 'happy 的比较级', a: 'happier' },
          { q: 'beautiful 的比较级', a: 'more beautiful' },
          { q: 'good 的比较级', a: 'better' },
          { q: 'bad 的比较级', a: 'worse' },
          { q: 'many/much 的比较级', a: 'more' },
          { q: 'little 的比较级', a: 'less' },
        ]
      },
      {
        id: 24, name: '比较级最高级用法', lesson: 'as+原级+as(一样); 比较级+than(更); 比较级+and+比较级(越来越); the+比较级,the+比较级(越…越…); the+最高级+in/of(最)',
        questions: [
          { q: 'as ___ as (一样有趣: interesting)', a: 'interesting' },
          { q: 'This bear is ___ than that one. (fat)', a: 'fatter' },
          { q: 'It gets ___ and ___ (warm) in spring.', a: 'warmer; warmer' },
          { q: '___ more you practice, ___ better you get.', a: 'The; the' },
          { q: 'one of the ___ (tall) boys', a: 'tallest' },
        ]
      },
      {
        id: 25, name: '副词构成', lesson: '原生副词(here/now/never); 形容词+ly(quickly); 辅音+y变i+ly(easily); -le变e为y(gently); 特殊true-truly; good-well',
        questions: [
          { q: 'quick 的副词', a: 'quickly' },
          { q: 'easy 的副词', a: 'easily' },
          { q: 'true 的副词', a: 'truly' },
          { q: 'good 的副词', a: 'well' },
          { q: 'angry 的副词', a: 'angrily' },
        ]
      },
      {
        id: 26, name: '副词用法分类', lesson: '时间(now); 地点(here); 方式(slowly); 程度(very); 频度(always>usually>often>sometimes>hardly>never)(be后实义前); 疑问(where/when/why/how)',
        questions: [
          { q: 'Lily ___ (从来不) late for school.', a: 'is never' },
          { q: '___ are his clothes? —Under the bed.', a: 'Where' },
          { q: '___ do you come to school? —On foot.', a: 'How' },
          { q: 'eat your breakfast ___ (quick)', a: 'quickly' },
        ]
      },
      {
        id: 27, name: '副词比较级', lesson: '一般+er/est; 多音节more/most; 不规则well-better-best; badly-worse-worst; much-more-most; far-farther/further',
        questions: [
          { q: 'fast 的比较级', a: 'faster' },
          { q: 'early 的比较级', a: 'earlier' },
          { q: 'carefully 的比较级', a: 'more carefully' },
          { q: 'well 的比较级', a: 'better' },
          { q: 'badly 的比较级', a: 'worse' },
        ]
      },
      {
        id: 28, name: '副词比较级用法', lesson: 'as+原级+as; 比较级+than; 比较级+and+比较级; the+比较级the+比较级; the+最高级(副词the可省略)',
        questions: [
          { q: 'Jack works ___ (hard) in his class.', a: 'hardest' },
          { q: 'Lucy does her homework ___ (careful) than her sister.', a: 'more carefully' },
          { q: '___ higher you climb, ___ colder it gets.', a: 'The; the' },
          { q: 'She can\'t jump as ___ (far) as I can.', a: 'far' },
        ]
      },
      {
        id: 29, name: '并列连词', lesson: 'and(和); or(否定句中"和"/选择); but(但是); so(所以); both...and; either...or; neither...nor; not only...but also',
        questions: [
          { q: 'Lily is busy ___ she can\'t go. (so/but)', a: 'so' },
          { q: 'Helen couldn\'t see ___ hear. (and/or)', a: 'or' },
          { q: 'I can jump high, ___ I can\'t jump far. (but/so)', a: 'but' },
          { q: 'Neither you ___ Nancy likes bananas.', a: 'nor' },
        ]
      },
      {
        id: 30, name: '从属连词', lesson: 'when/before/after/until(时间); if/unless(条件); though/although(让步不能和but同句); because(原因不能和so同句)',
        questions: [
          { q: '___ it\'s difficult, she never gives up. (Although/Because)', a: 'Although' },
          { q: 'I began to swim ___ I was eight.', a: 'when' },
          { q: '___ you work harder, you\'ll get good grades.', a: 'If' },
          { q: 'He didn\'t come ___ he hurt his leg.', a: 'because' },
        ]
      },
      {
        id: 31, name: '动词分类', lesson: '实义动词(及物+宾语/不及物不加); 系动词(be/感官look/smell/taste/feel/sound/变化become/grow/turn/get); 助动词(be/do/will无实义)',
        questions: [
          { q: 'Look! My sister ___ (play) with toys.', a: 'is playing' },
          { q: 'The soup ___ (尝起来) delicious.', a: 'tastes' },
          { q: '___ Jack like reading? (Do/Does)', a: 'Does' },
          { q: 'Miss White ___ (go) to Nanjing next week.', a: 'will go' },
        ]
      },
      {
        id: 32, name: '情态动词', lesson: 'can(能力/请求); may(许可); must(必须/肯定推测); mustn\'t(禁止); needn\'t(不必); have to(客观不得不); should(应该)',
        questions: [
          { q: '___ I come in? (May/Can)', a: 'May' },
          { q: 'Must I finish now? —No, you ___. (needn\'t/mustn\'t)', a: 'needn\'t' },
          { q: 'She ___ be at home. (must/can: 肯定推测)', a: 'must' },
          { q: 'You ___ swim here. It\'s dangerous. (mustn\'t/needn\'t)', a: 'mustn\'t' },
        ]
      },
      {
        id: 33, name: '动词变化规则', lesson: '三单(+s/+es/变y为i+es/have-has); 现在分词(+ing/去e+ing/ie变y+ing/双写+ing); 过去式(+ed/去e+d/变y为i+ed/双写+ed)',
        questions: [
          { q: 'have 的三单', a: 'has' },
          { q: 'teach 的三单', a: 'teaches' },
          { q: 'make 的现在分词', a: 'making' },
          { q: 'run 的现在分词', a: 'running' },
          { q: 'like 的过去式', a: 'liked' },
          { q: 'try 的过去式', a: 'tried' },
          { q: 'stop 的过去式', a: 'stopped' },
        ]
      },
      {
        id: 34, name: '句子成分', lesson: '主语(动作主体); 谓语(动作); 宾语(动作对象); 表语(系动词后); 定语(修饰名词); 状语(时间/地点/方式); 宾补(补充宾语)',
        questions: [
          { q: '"I like summer best." like 是?', a: '谓语' },
          { q: '"The dress looks beautiful." beautiful 是?', a: '表语' },
          { q: '"Alice doesn\'t like the red bag." red 是?', a: '定语' },
          { q: '"The sun rises in the east." in the east 是?', a: '状语' },
        ]
      },
      {
        id: 35, name: '陈述句', lesson: 'be动词句(主+be+表); 助动词句(主+助+原形); 实义动词句(主+原形/三单); 否定加not/don\'t/doesn\'t/didn\'t',
        questions: [
          { q: 'Alice is swimming. (改为否定句)', a: "Alice isn't swimming." },
          { q: 'Sam likes basketball. (改为否定句)', a: "Sam doesn't like basketball." },
          { q: 'They are listening to music. (翻译)', a: '他们正在听音乐。' },
        ]
      },
      {
        id: 36, name: '一般疑问句', lesson: 'be提前; 实义动词Do/Does/Did+主+原形; 情态动词提前; yes/no回答',
        questions: [
          { q: 'Sam is Alice\'s cousin. (改为一般疑问句)', a: 'Is Sam Alice\'s cousin?' },
          { q: 'Bob can speak English. (改为一般疑问句)', a: 'Can Bob speak English?' },
          { q: 'Kate went to the movies. (改为一般疑问句)', a: 'Did Kate go to the movies?' },
        ]
      },
      {
        id: 37, name: '特殊疑问句', lesson: '疑问词+一般疑问句(提问主语除外:疑问词+谓语); what/who/whom/whose/which/when/where/why/how; how many/much/old/long/far/often',
        questions: [
          { q: '___ did you go? —Beijing.', a: 'Where' },
          { q: '___ did you stay? —Four days.', a: 'How long' },
          { q: '___ do you like pandas? —Because...', a: 'Why' },
          { q: '___ do you write to your pen pal? —Once a week.', a: 'How often' },
          { q: '___ is the weather like? (What/How)', a: 'What' },
        ]
      },
      {
        id: 38, name: '选择·反意疑问句', lesson: '选择疑问句用or连接，直接选答案；反意疑问句前肯后否/前否后肯，按事实回答',
        questions: [
          { q: 'Can you play the piano ___ the violin? (or/and)', a: 'or' },
          { q: 'She goes to school by bike, ___ she?', a: "doesn't" },
          { q: 'Tom never plays computer games, ___ he?', a: 'does' },
        ]
      },
      {
        id: 39, name: '祈使句', lesson: '动词原形开头(请求命令); Let+宾+原形; 否定Don\'t+原形; No+名词/动名词',
        questions: [
          { q: '___ (Don\'t/No) talk in class.', a: "Don't" },
          { q: '___ (No/Don\'t) smoking!', a: 'No' },
          { q: '___ (Let\'s/Let) go home.', a: "Let's" },
          { q: 'Please ___ (open/opens) the door.', a: 'open' },
        ]
      },
      {
        id: 40, name: '感叹句', lesson: 'What a/an+形+单数名词(+主谓)! ; What+形+复数/不可数! ; How+形/副(+主谓)! ; How+主谓!',
        questions: [
          { q: '___ a cute dog! (What/How)', a: 'What' },
          { q: '___ beautiful flowers! (What/How)', a: 'What' },
          { q: '___ fast he runs! (What/How)', a: 'How' },
          { q: '___ funny the book is!', a: 'How' },
        ]
      },
      {
        id: 41, name: 'There be 句型', lesson: '某地有某物; be就近原则; 时态: is/are/was/were/will be/be going to be',
        questions: [
          { q: 'There ___ some water in the cup. (is/are)', a: 'is' },
          { q: 'There ___ a book and some pens. (is/are)', a: 'is' },
          { q: 'There ___ a football match next Friday.', a: 'will be' },
          { q: 'There is a child. (改为复数句)', a: 'There are children.' },
        ]
      },
    ]
  },
  {
    id: 4, name: '时态宇宙', icon: '🚀', desc: '一般现在·一般过去·一般将来·现在进行', unlockLevel: 4,
    stages: [
      {
        id: 42, name: '一般现在时', lesson: '经常性动作/客观真理/当前状态; be动词(am/is/are); 实义动词(原形/三单); 标志:always/often/every day',
        questions: [
          { q: 'My friend often ___ (read) English.', a: 'reads' },
          { q: 'Bob ___ (go) for a walk every day.', a: 'goes' },
          { q: '___ he like hiking? (Does/Do)', a: 'Does' },
          { q: 'The sun ___ (be) bigger than the earth.', a: 'is' },
          { q: 'She doesn\'t ___ (like) playing basketball.', a: 'like' },
        ]
      },
      {
        id: 43, name: '一般过去时', lesson: '过去动作/状态; be用was/were; 实义动词用过去式; 否定didn\'t+原形; 标志:yesterday/last/...ago',
        questions: [
          { q: 'I ___ (take) them yesterday.', a: 'took' },
          { q: 'There ___ (be) no playground three years ago.', a: 'was' },
          { q: '___ you busy yesterday? —Yes, I ___.', a: 'Were; was' },
          { q: 'I didn\'t ___ (ride) a bike yesterday.', a: 'ride' },
          { q: 'My father ___ (walk) to work yesterday.', a: 'walked' },
        ]
      },
      {
        id: 44, name: '一般将来时', lesson: 'will+原形(主观/临时); be going to+原形(计划/迹象); 标志:tomorrow/next/in+将来',
        questions: [
          { q: 'He will ___ (have) an English class.', a: 'have' },
          { q: 'Look at the clouds! It ___ (rain).', a: 'is going to rain' },
          { q: 'There ___ a football match tomorrow. (will be/is going to have)', a: 'will be' },
          { q: '___ he going to Hong Kong next week?', a: 'Is' },
          { q: 'If it ___ rain, I ___ visit the museum.', a: "doesn't; will" },
        ]
      },
      {
        id: 45, name: '现在进行时', lesson: '此刻/现阶段正在做; am/is/are+doing; 标志:now/listen/look; 不能用进行时:love/know/have/感官等',
        questions: [
          { q: 'Listen! Sam ___ (sing).', a: 'is singing' },
          { q: 'The children ___ (dance) on the playground.', a: 'are dancing' },
          { q: '___ the boys singing now? (Is/Are)', a: 'Are' },
          { q: 'I ___ (cook) dinner now.', a: 'am cooking' },
          { q: 'She often ___ (sing), but now she ___ (dance).', a: 'sings; is dancing' },
        ]
      },
    ]
  },
]

/* ========== 子组件 ========== */

function HpBar({ hp, maxHp }: { hp: number; maxHp: number }) {
  const pct = Math.max(0, hp / maxHp * 100)
  return (
    <div className="flex items-center gap-2">
      <Heart className="w-4 h-4 text-red-400" />
      <div className="flex-1 h-2.5 bg-slate-700/50 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-300" style={{
          width: `${pct}%`,
          background: pct > 50 ? '#22c55e' : pct > 25 ? '#f59e0b' : '#ef4444'
        }} />
      </div>
      <span className="text-xs text-slate-400 w-10 text-right">{Math.floor(hp)}/{maxHp}</span>
    </div>
  )
}

function XpBar({ xp, level }: { xp: number; level: number }) {
  const needed = level * 50
  const pct = Math.min(100, xp / needed * 100)
  return (
    <div className="flex items-center gap-2">
      <Zap className="w-4 h-4 text-amber-400" />
      <div className="flex-1 h-2 bg-slate-700/50 rounded-full overflow-hidden">
        <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-300"
          style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-slate-400 w-16 text-right">Lv.{level} {xp}/{needed}</span>
    </div>
  )
}

function StageCard({ stage, onEnter, cleared }: { stage: Stage; onEnter: () => void; cleared: boolean }) {
  return (
    <button onClick={onEnter}
      className={`w-full text-left p-4 rounded-xl border transition-all duration-200
        ${cleared
          ? 'bg-emerald-900/30 border-emerald-600/30 hover:bg-emerald-900/40'
          : 'bg-slate-800/50 border-slate-700/50 hover:bg-slate-700/50 hover:border-indigo-500/50'
        }`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-200">{cleared ? '✅' : '📘'} Day {stage.id} {stage.name}</p>
          <p className="text-xs text-slate-500 mt-1">{stage.questions.length} 题</p>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-500" />
      </div>
    </button>
  )
}

function GameOverScreen({ onRestart, worlds }: { onRestart: () => void; worlds: World[] }) {
  const { xp, level, wrongList, reset } = useGame()
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-800/80 backdrop-blur border border-slate-700/50 rounded-2xl p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-red-400 to-orange-500 flex items-center justify-center">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-slate-100 mb-2">💀 挑战失败</h2>
        <p className="text-slate-400 mb-4">HP 归零，再接再厉！</p>
        <div className="bg-slate-900/50 rounded-xl p-4 mb-4 text-left text-sm space-y-1">
          <p className="text-slate-300">等级: Lv.{level}</p>
          <p className="text-slate-300">总经验: {xp}</p>
          <p className="text-slate-300">错题: {wrongList.length} 题</p>
        </div>
        <button onClick={() => { reset(); onRestart() }}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold text-sm hover:opacity-90 transition-opacity shadow-lg shadow-indigo-500/20">
          重新开始
        </button>
      </div>
    </div>
  )
}

function VictoryScreen({ onRestart, worlds }: { onRestart: () => void; worlds: World[] }) {
  const { xp, level, wrongList, reset } = useGame()
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-800/80 backdrop-blur border border-slate-700/50 rounded-2xl p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center">
          <Star className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-slate-100 mb-2">🎉 恭喜通关！</h2>
        <p className="text-slate-400 mb-4">语法训练营全部完成</p>
        <div className="bg-slate-900/50 rounded-xl p-4 mb-4 text-left text-sm space-y-1">
          <p className="text-slate-300">最终等级: Lv.{level}</p>
          <p className="text-slate-300">总经验: {xp}</p>
          <p className="text-slate-300">错题: {wrongList.length} 题</p>
        </div>
        {wrongList.length > 0 && (
          <div className="bg-red-900/20 border border-red-800/30 rounded-xl p-4 mb-4 text-left text-sm max-h-32 overflow-y-auto">
            <p className="font-semibold text-red-400 mb-1 text-xs">📕 错题本</p>
            {wrongList.map((w, i) => (
              <p key={i} className="text-red-300 text-xs mb-1">{i + 1}. {w.q} → {w.a}</p>
            ))}
          </div>
        )}
        <button onClick={() => { reset(); onRestart() }}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold text-sm hover:opacity-90 transition-opacity shadow-lg shadow-emerald-500/20">
          <RotateCcw className="w-4 h-4 inline mr-1" /> 重新挑战
        </button>
      </div>
    </div>
  )
}

/* ========== 主页面 ========== */
type View = 'map' | 'battle' | 'victory' | 'gameover'

export default function GrammarQuestPage() {
  const saved = useRef(loadSave()).current
  const [view, setView] = useState<View>('map')
  const [currentWorld, setCurrentWorld] = useState<World | null>(null)
  const [currentStage, setCurrentStage] = useState<Stage | null>(null)
  const [clearedStages, setClearedStages] = useState<Set<number>>(
    new Set(saved?.clearedStages ?? [])
  )
  const [completedWorlds, setCompletedWorlds] = useState<Set<number>>(
    new Set(saved?.completedWorlds ?? [])
  )

  /* 游戏状态 */
  const [xp, setXp] = useState(saved?.xp ?? 0)
  const [level, setLevel] = useState(saved?.level ?? 1)
  const [combo, setCombo] = useState(0)
  const [hp, setHp] = useState(100)
  const maxHp = 100
  const [wrongList, setWrongList] = useState<{ q: string; a: string; user: string }[]>(
    saved?.wrongList ?? []
  )
  const [totalAnswered, setTotalAnswered] = useState(saved?.totalAnswered ?? 0)
  const [totalCorrect, setTotalCorrect] = useState(saved?.totalCorrect ?? 0)
  const [stageIndex, setStageIndex] = useState(0)

  /* 自动保存进度 */
  useEffect(() => {
    writeSave({
      clearedStages: [...clearedStages],
      completedWorlds: [...completedWorlds],
      xp, level, wrongList,
      totalAnswered, totalCorrect,
    })
  }, [clearedStages, completedWorlds, xp, level, wrongList, totalAnswered, totalCorrect])

  const resetGame = () => {
    localStorage.removeItem(SAVE_KEY)
    setXp(0); setLevel(1); setCombo(0); setHp(100); setWrongList([])
    setTotalAnswered(0); setTotalCorrect(0); setStageIndex(0)
    setClearedStages(new Set()); setCompletedWorlds(new Set())
    setCurrentWorld(null); setCurrentStage(null); setView('map')
  }

  const gameState: GameState = {
    xp, level, combo, hp, maxHp, wrongList,
    setXp, setLevel, setCombo, setHp,
    addWrong: (q, a, user) => setWrongList(w => [...w, { q, a, user }]),
    reset: resetGame,
  }

  const handleEnterWorld = (w: World) => {
    setCurrentWorld(w)
    setCurrentStage(null)
    setView('map')
  }

  const handleEnterStage = (s: Stage) => {
    setCurrentStage(s)
    setStageIndex(0)
    setHp(100)
    setView('battle')
  }

  const handleAnswer = (answer: string, q: QItem) => {
    const isCorrect = answer.toLowerCase().trim() === q.a.toLowerCase().trim()
    setTotalAnswered(t => t + 1)
    if (isCorrect) {
      setTotalCorrect(t => t + 1)
      const gained = 10 + combo * 2
      setXp(x => x + gained)
      setCombo(c => c + 1)
      setHp(h => Math.min(maxHp, h + 3))
      if (xp + gained >= level * 50) {
        setLevel(l => l + 1)
        setHp(maxHp)
      }
      // next question
      setTimeout(() => {
        if (stageIndex + 1 >= (currentStage?.questions.length || 0)) {
          // stage cleared
          setClearedStages(s => new Set(s).add(currentStage?.id || 0))
          setView('map')
        } else {
          setStageIndex(i => i + 1)
        }
      }, 600)
    } else {
      setCombo(0)
      setHp(h => h - 15)
      gameState.addWrong(q.q, q.a, answer)
      if (hp - 15 <= 0) {
        setView('gameover')
        return
      }
      setTimeout(() => {
        if (stageIndex + 1 >= (currentStage?.questions.length || 0)) {
          setClearedStages(s => new Set(s).add(currentStage?.id || 0))
          setView('map')
        } else {
          setStageIndex(i => i + 1)
        }
      }, 1200)
    }
  }

  return (
    <GameCtx.Provider value={gameState}>
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-slate-200">
        {view === 'map' && (
          currentWorld ? (
            /* World Detail */
            <div className="max-w-lg mx-auto px-4 py-6">
              <button onClick={() => setCurrentWorld(null)}
                className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 mb-4 transition-colors text-sm">
                <ArrowLeft className="w-4 h-4" /> 返回地图
              </button>
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">{currentWorld.icon}</span>
                  <div>
                    <h2 className="text-xl font-bold text-slate-100">{currentWorld.name}</h2>
                    <p className="text-xs text-slate-500">{currentWorld.desc}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-2.5 max-h-[65vh] overflow-y-auto pr-1">
                {currentWorld.stages.map(s => (
                  <StageCard key={s.id} stage={s}
                    cleared={clearedStages.has(s.id)}
                    onEnter={() => handleEnterStage(s)} />
                ))}
              </div>
              {currentWorld.stages.every(s => clearedStages.has(s.id)) && (
                <button onClick={() => {
                  setCompletedWorlds(w => new Set(w).add(currentWorld.id))
                  setView('victory')
                }}
                  className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold text-sm hover:opacity-90 transition-opacity shadow-lg shadow-emerald-500/20">
                  🎉 世界通关！查看成绩
                </button>
              )}
            </div>
          ) : (
            /* Map */
            <div className="max-w-lg mx-auto px-4 py-6">
              <div className="flex items-center justify-between mb-6">
                <Link to="/learn" className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 transition-colors text-sm">
                  <ArrowLeft className="w-4 h-4" /> 返回
                </Link>
                <div className="flex items-center gap-3 text-xs">
                  <HpBar hp={hp} maxHp={maxHp} />
                </div>
              </div>
              <XpBar xp={xp} level={level} />
              <div className="mt-5 mb-6">
                <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
                  <Swords className="w-6 h-6 text-indigo-400" /> 语法训练营
                </h1>
                <p className="text-slate-500 text-xs mt-1">选择关卡，击败语法 Boss！</p>
              </div>
              <div className="grid gap-3">
                {grammarData.map(w => {
                  const unlocked = level >= w.unlockLevel
                  return (
                    <button key={w.id} disabled={!unlocked} onClick={() => handleEnterWorld(w)}
                      className={`p-5 rounded-2xl border text-left transition-all duration-200
                        ${unlocked
                          ? 'bg-slate-800/60 border-slate-700/50 hover:bg-slate-700/60 hover:border-indigo-500/50 cursor-pointer'
                          : 'bg-slate-800/20 border-slate-700/20 opacity-50 cursor-not-allowed'
                        }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{w.icon}</span>
                          <div>
                            <p className="font-semibold text-slate-200">{w.name}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{w.desc}</p>
                            <p className="text-xs text-slate-600 mt-0.5">{w.stages.length} 个关卡 · {w.stages.reduce((a, s) => a + s.questions.length, 0)} 题</p>
                          </div>
                        </div>
                        <div className="text-right">
                          {!unlocked && <span className="text-xs text-slate-500">🔒 Lv.{w.unlockLevel}</span>}
                          {completedWorlds.has(w.id) && <span className="text-xs text-emerald-400">✅ 已通关</span>}
                          {unlocked && !completedWorlds.has(w.id) && <ChevronRight className="w-4 h-4 text-slate-500" />}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )
        )}

        {view === 'battle' && currentStage && (
          <BattleView stage={currentStage} index={stageIndex}
            onAnswer={handleAnswer}
            onBack={() => setView('map')} />
        )}

        {view === 'victory' && (
          <VictoryScreen onRestart={resetGame} worlds={grammarData} />
        )}

        {view === 'gameover' && (
          <GameOverScreen onRestart={resetGame} worlds={grammarData} />
        )}
      </div>
    </GameCtx.Provider>
  )
}

function BattleView({ stage, index, onAnswer, onBack }: {
  stage: Stage; index: number; onAnswer: (answer: string, q: QItem) => void; onBack: () => void
}) {
  const { hp, maxHp, combo, xp, level } = useGame()
  const q = stage.questions[index]
  const [input, setInput] = useState('')
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null)
  const [showNext, setShowNext] = useState(false)

  if (!q) return null

  const handleSubmit = () => {
    if (!input.trim()) return
    const isCorrect = input.trim().toLowerCase() === q.a.toLowerCase()
    setResult(isCorrect ? 'correct' : 'wrong')
    setShowNext(true)
    onAnswer(input.trim(), q)
  }

  const handleNext = () => {
    setInput('')
    setResult(null)
    setShowNext(false)
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      {/* Battle Header */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={onBack}
          className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" /> 退出
        </button>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1"><Zap className="w-4 h-4 text-amber-400" /> x{combo}</span>
          <span className="px-2 py-0.5 rounded-full bg-indigo-600/40 text-indigo-300 text-xs font-semibold">Lv.{level}</span>
        </div>
      </div>

      <HpBar hp={hp} maxHp={maxHp} />
      <XpBar xp={xp} level={level} />

      {/* Boss Area */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6 mt-4 text-center">
        <div className="text-5xl mb-3">👾</div>
        <p className="text-sm text-slate-500">
          第 {index + 1} / {stage.questions.length} 题 · Day {stage.id}
        </p>
        <p className="text-lg font-bold text-slate-100 mt-2">{stage.name} Boss</p>
      </div>

      {/* Question */}
      <div className="bg-slate-800/40 border border-slate-700/30 rounded-2xl p-5 mt-4">
        <p className="text-base text-slate-200 leading-relaxed">{q.q}</p>
        {q.hint && <p className="text-xs text-slate-500 mt-2">💡 {q.hint}</p>}
      </div>

      {/* Answer Input */}
      <div className="mt-4">
        <input type="text" value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { if (!showNext) handleSubmit(); else handleNext() } }}
          placeholder="输入答案..."
          className="w-full px-4 py-3 bg-slate-800/60 border border-slate-700/50 rounded-xl text-sm text-slate-200 outline-none focus:border-indigo-500 placeholder-slate-500"
          autoFocus disabled={showNext} />
      </div>

      {!showNext ? (
        <button onClick={handleSubmit}
          className="w-full mt-3 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold text-sm hover:opacity-90 transition-opacity shadow-lg shadow-indigo-500/20">
          ⚡ 出招！
        </button>
      ) : (
        <button onClick={handleNext}
          className={`w-full mt-3 py-3 rounded-xl text-white font-semibold text-sm transition-opacity shadow-lg
            ${result === 'correct'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 shadow-emerald-500/20'
              : 'bg-gradient-to-r from-red-500 to-orange-600 shadow-red-500/20'
            }`}>
          {result === 'correct' ? '✅ 正确！继续' : '❌ 下一题'}
        </button>
      )}

      {result && (
        <div className={`mt-3 p-3 rounded-xl text-sm font-medium text-center
          ${result === 'correct' ? 'bg-emerald-900/30 text-emerald-300 border border-emerald-700/30' : 'bg-red-900/30 text-red-300 border border-red-700/30'}`}>
          {result === 'correct'
            ? `✔ 正确！ Combo x${combo} +${10 + (combo - 1) * 2} XP`
            : `✘ 错误！ 正确答案：${q.a}`}
        </div>
      )}
    </div>
  )
}
