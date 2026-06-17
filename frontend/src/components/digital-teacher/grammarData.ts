export interface GrammarModule {
  id: string
  title: string
  color: string
  content: string
  danmaku: string[]
  details: string[]
}

const GRAMMAR_MODULES: GrammarModule[] = [
  {
    id: 'overview',
    title: '初中英语语法总口诀',
    color: '#a78bfa',
    content: `词法八类先分清，
句子成分要认明；
时态语态是核心，
从句非谓是难点。`,
    danmaku: [
      '💬 词法八类先分清',
      '💬 句子成分要认明',
      '💬 时态语态是核心',
      '💬 从句非谓是难点',
    ],
    details: [
      '中考语法三大板块：词法、句法、时态',
      '词法：名代动形副介连感叹',
      '句法：简单句、复合句、并列句',
      '时态：六种时态 + 被动语态',
    ],
  },
  {
    id: 'noun',
    title: '一、名词',
    color: '#60a5fa',
    content: `人和物，叫名词；
一个单，多个复；
可数不可数要分清。

考点：
名词单复数
不规则复数
名词所有格`,
    danmaku: [
      '💬 一个单，多个复',
      '💬 复数别忘s',
      '💬 谁的东西加\'s',
      '💬 child→children',
      '💬 sheep→sheep',
      '💬 不可数：water, news',
    ],
    details: [
      '规则复数：+s / +es',
      '不规则：man→men, foot→feet',
      '所有格：Tom\'s book',
      '双重所有格：a friend of mine',
    ],
  },
  {
    id: 'pronoun',
    title: '二、代词',
    color: '#34d399',
    content: `主格做主语，
宾格做宾语；
形代后跟名，
名代单独立。

I → me → my → mine
he → him → his → his`,
    danmaku: [
      '💬 主语用主格',
      '💬 介词后宾格',
      '💬 名前形代词',
      '💬 名代单独用',
      '💬 I→me→my→mine',
      '💬 物主代词分两种',
    ],
    details: [
      '主格：I, you, he, she, it, we, they',
      '宾格：me, you, him, her, it, us, them',
      '形代：my, your, his, her, its, our, their',
      '名代：mine, yours, his, hers, its, ours, theirs',
    ],
  },
  {
    id: 'article',
    title: '三、冠词',
    color: '#f472b6',
    content: `泛指a和an，
特指要用the；
唯一最高级，
前面都加the。`,
    danmaku: [
      '💬 第一次a',
      '💬 特指用the',
      '💬 最高级the',
      '💬 元音前用an',
      '💬 a university / an hour',
    ],
    details: [
      '不定冠词：a/an（可数单数前）',
      '定冠词：the（双方都知道的）',
      '零冠词：球类、三餐、学科',
      '固定搭配：have a cold, in the morning',
    ],
  },
  {
    id: 'adj-adv',
    title: '四、形容词副词',
    color: '#fb923c',
    content: `形容词修名词，
副词专修动。

比较级最高级：
-er / -est
more / most`,
    danmaku: [
      '💬 形修名',
      '💬 副修动',
      '💬 比较级加er',
      '💬 最高级加est',
      '💬 多音节用more',
    ],
    details: [
      '形容词：修饰名词（a beautiful girl）',
      '副词：修饰动词（run quickly）',
      '比较级： taller, more beautiful',
      '最高级： tallest, most beautiful',
      '不规则：good→better→best',
    ],
  },
  {
    id: 'verb',
    title: '五、动词',
    color: '#a78bfa',
    content: `句中必须有谓语；
他她它后加s。

情态动词要记牢：
can, may, must, should`,
    danmaku: [
      '💬 句子必须有动词',
      '💬 单三加s/es',
      '💬 can后跟原形',
      '💬 must表必须',
    ],
    details: [
      '实义动词：run, eat, study',
      '系动词：be, look, feel, sound',
      '情态动词：can, may, must, should',
      '助动词：do, does, did, have, has',
      '第三人称单数：+s/es（he runs）',
    ],
  },
  {
    id: 'tenses',
    title: '六、时态（中考核心）',
    color: '#f59e0b',
    content: `经常现在，昨天过去；
明天将来，现在进行；
过去进行，完成联系。

一般现在时：always/often/every day
一般过去时：yesterday/last week/ago
一般将来时：tomorrow/next week/soon
现在进行时：now/look/listen
现在完成时：already/yet/since/for
过去进行时：was/were doing`,
    danmaku: [
      '💬 经常现在',
      '💬 昨天过去',
      '💬 明天将来will',
      '💬 现在进行be doing',
      '💬 完成have done',
      '💬 过去进行was/were doing',
      '💬 since+过去时间点',
      '💬 for+时间段',
    ],
    details: [
      '一般现在：do/does（习惯、真理）',
      '一般过去：did（已发生）',
      '一般将来：will do / be going to',
      '现在进行：am/is/are doing',
      '现在完成：have/has done',
      '过去进行：was/were doing',
      '主将从现：If it rains, I will stay',
    ],
  },
  {
    id: 'passive',
    title: '七、被动语态',
    color: '#ec4899',
    content: `主动看谁做，
被动看谁被做。

结构：be + done

时态变化：
is done（现在）
was done（过去）
will be done（将来）
have been done（完成）`,
    danmaku: [
      '💬 被动：be done',
      '💬 现在：is done',
      '💬 过去：was done',
      '💬 将来：will be done',
      '💬 完成：have been done',
    ],
    details: [
      '被动语态由"be+过去分词"构成',
      '时态体现在be动词上',
      'by+动作执行者',
      '不及物动词无被动（happen, rise）',
    ],
  },
  {
    id: 'non-predicate',
    title: '八、非谓语动词',
    color: '#2dd4bf',
    content: `to do表将来；
doing表进行；
done表完成。

中考高频：
want to do
like doing
finish doing
keep doing`,
    danmaku: [
      '💬 to后原形',
      '💬 介词后doing',
      '💬 want to do',
      '💬 enjoy doing',
      '💬 finish doing',
    ],
    details: [
      '不定式：to do（目的、将来）',
      '动名词：doing（习惯、爱好）',
      '分词：doing（主动）/ done（被动）',
      '固定搭配：stop to do / stop doing 不同',
    ],
  },
  {
    id: 'simple-sentence',
    title: '九、简单句',
    color: '#818cf8',
    content: `主谓宾最常见；
主系表也重要。

I love English.
I am happy.

五种基本句型：
1. SV（主谓）
2. SVO（主谓宾）
3. SVP（主系表）
4. SVOO（主谓双宾）
5. SVOC（主谓宾补）`,
    danmaku: [
      '💬 主谓宾最常见',
      '💬 主系表也重要',
      '💬 I love English',
      '💬 I am happy',
      '💬 五种基本句型',
    ],
    details: [
      'S+V: The sun rises.',
      'S+V+O: I like apples.',
      'S+V+P: She is a teacher.',
      'S+V+IO+DO: He gave me a book.',
      'S+V+O+C: We call him Tom.',
    ],
  },
  {
    id: 'object-clause',
    title: '十、宾语从句',
    color: '#c084fc',
    content: `陈述语序永不变；
时态呼应看主句。

连接词：
that（陈述）
if/whether（是否）
wh-（特殊疑问）

例句：
I think that he is right.
He asked if I was free.
Do you know where he lives?`,
    danmaku: [
      '💬 从句不倒装',
      '💬 that可以省略',
      '💬 if表是否',
      '💬 时态要呼应',
      '💬 真理用一般现在',
    ],
    details: [
      '陈述语序：主+谓+宾',
      '连接词that可省略（除介词后）',
      'if/whether可互换（except or not）',
      '主过从过（主句过去，从句过去）',
      '真理永现在：He said the earth is round.',
    ],
  },
  {
    id: 'attributive-clause',
    title: '十一、定语从句',
    color: '#f87171',
    content: `人用who；
物用which；
that两边都能指。

关系代词：
who（人，主）
whom（人，宾）
which（物）
that（人+物）
whose（谁的）

例句：
The boy who is reading is Tom.
The book which I bought is interesting.`,
    danmaku: [
      '💬 人who',
      '💬 物which',
      '💬 that万能',
      '💬 whose表所属',
      '💬 先行词是关键',
    ],
    details: [
      '关系代词充当从句主语/宾语',
      'who/that指人，which/that指物',
      '介词+which/whom（正式）',
      '限制性 vs 非限制性定语从句',
      '只用that的情况：最高级、序数词、不定代词后',
    ],
  },
  {
    id: 'adverbial-clause',
    title: '十二、状语从句',
    color: '#22d3ee',
    content: `中考只记：
if 如果
because 因为
when 当……时候

口诀：
主将从现最常考。

If it rains tomorrow,
I will stay at home.

时间：when, while, as, before, after
原因：because, since, as
条件：if, unless
让步：although, though`,
    danmaku: [
      '💬 主将从现',
      '💬 If + 一般现在',
      '💬 when + 时间点',
      '💬 because表原因',
      '💬 although让步',
      '💬 unless = if not',
    ],
    details: [
      '时间状语从句：when/while/as',
      '条件状语从句：if/unless',
      '原因状语从句：because/since/as',
      '让步状语从句：although/though',
      '主将从现：主句将来，从句一般现在',
      'If it rains, we will stay at home.',
    ],
  },
]

export default GRAMMAR_MODULES
