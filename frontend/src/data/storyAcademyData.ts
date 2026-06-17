// 故事学院 — 新人教七年级下册 晨读背记

export interface WordEntry {
  word: string
  meaning: string
  example: string
}

export interface WordFormEntry {
  from: string
  meaning: string
  forms: { form: string; pos: string }[]
}

export interface PhraseScenario {
  phrase: string
  meaning: string
  scenario: string
  correct: string
  wrong: string
}

export interface SentenceEntry {
  sentence: string
  translation: string
}

export interface StoryPage {
  text: string
  image?: string
}

export interface ClozeTest {
  sentence: string
  blank: string
  options: string[]
  correct: number
}

export interface UnitStoryData {
  id: number
  name: string
  emoji: string
  words: WordEntry[]
  wordForms: WordFormEntry[]
  phrases: PhraseScenario[]
  sentences: SentenceEntry[]
  story: { title: string; pages: StoryPage[] }
  clozeTests: ClozeTest[]
}

const units: UnitStoryData[] = [
  {
    id: 1, name: 'Unit 1 Animal Friends', emoji: '🐾',
    words: [
      { word: 'giraffe', meaning: '长颈鹿', example: 'The giraffe has a long neck.' },
      { word: 'eagle', meaning: '雕;鹰', example: 'The eagle can fly very high.' },
      { word: 'penguin', meaning: '企鹅', example: 'Penguins live in cold places.' },
      { word: 'snake', meaning: '蛇', example: 'The snake is long and thin.' },
      { word: 'shark', meaning: '鲨鱼', example: 'The shark is a dangerous fish.' },
      { word: 'whale', meaning: '鲸', example: 'The whale is the biggest animal.' },
      { word: 'fox', meaning: '狐狸', example: 'The fox is very clever.' },
      { word: 'wolf', meaning: '狼', example: 'The wolf lives in the forest.' },
      { word: 'neck', meaning: '脖子', example: 'The giraffe has a long neck.' },
      { word: 'huge', meaning: '巨大的', example: 'An elephant is a huge animal.' },
      { word: 'guess', meaning: '猜测', example: 'Can you guess what it is?' },
      { word: 'save', meaning: '救;节约', example: 'We should save the animals.' },
      { word: 'trunk', meaning: '象鼻', example: 'The elephant uses its trunk.' },
    ],
    wordForms: [
      { from: 'fox', meaning: '狐狸', forms: [{ form: 'fox', pos: '单数' }, { form: 'foxes', pos: '复数' }] },
      { from: 'wolf', meaning: '狼', forms: [{ form: 'wolf', pos: '单数' }, { form: 'wolves', pos: '复数' }] },
      { from: 'care', meaning: '关心;照顾', forms: [{ form: 'care', pos: 'v.' }, { form: 'careful', pos: 'adj.小心的' }, { form: 'carefully', pos: 'adv.小心地' }] },
      { from: 'scary', meaning: '吓人的', forms: [{ form: 'scary', pos: 'adj.' }, { form: 'scared', pos: 'adj.感到害怕的' }] },
      { from: 'danger', meaning: '危险', forms: [{ form: 'danger', pos: 'n.' }, { form: 'dangerous', pos: 'adj.' }] },
      { from: 'luck', meaning: '幸运', forms: [{ form: 'luck', pos: 'n.' }, { form: 'lucky', pos: 'adj.' }, { form: 'luckily', pos: 'adv.' }] },
      { from: 'play', meaning: '玩', forms: [{ form: 'play', pos: 'v.' }, { form: 'playful', pos: 'adj.爱嬉戏的' }] },
      { from: 'swim', meaning: '游泳', forms: [{ form: 'swim', pos: 'v.' }, { form: 'swimmer', pos: 'n.游泳者' }] },
      { from: 'friend', meaning: '朋友', forms: [{ form: 'friend', pos: 'n.' }, { form: 'friendly', pos: 'adj.友好的' }] },
      { from: 'hear', meaning: '听见', forms: [{ form: 'hear', pos: 'v.' }, { form: 'hearing', pos: 'n.听力;听觉' }] },
    ],
    phrases: [
      { phrase: 'take good care of', meaning: '好好照顾', scenario: '你的朋友生病了,你会怎么做?', correct: 'take good care of her', wrong: 'play with her' },
      { phrase: 'look like', meaning: '看起来像', scenario: '看到一朵云像一只猫,你会说:', correct: 'It looks like a cat', wrong: 'It is a cat' },
      { phrase: 'in danger', meaning: '处于危险中', scenario: '很多动物面临灭绝,它们', correct: 'in danger', wrong: 'safe' },
      { phrase: 'cut down', meaning: '砍伐', scenario: '为了造纸,人们______树木', correct: 'cut down', wrong: 'plant' },
      { phrase: 'made of', meaning: '由……制成', scenario: '这张桌子是木头______的', correct: 'made of', wrong: 'made from' },
      { phrase: 'pick up', meaning: '拿起;捡起', scenario: '地上有张纸,你应该', correct: 'pick it up', wrong: 'step on it' },
      { phrase: 'look after', meaning: '照顾', scenario: '妈妈不在家,你______妹妹', correct: 'look after', wrong: 'shout at' },
      { phrase: 'one another', meaning: '互相', scenario: '朋友之间应该______帮助', correct: 'one another', wrong: 'never' },
      { phrase: 'not...at all', meaning: '一点也不', scenario: '我______喜欢蛇,它们很可怕', correct: "don't like snakes at all", wrong: 'like snakes' },
      { phrase: 'a symbol of', meaning: '……的象征', scenario: '龙是中国文化的象征', correct: 'a symbol of Chinese culture', wrong: 'an animal from China' },
    ],
    sentences: [
      { sentence: "Don't give them your sandwich!", translation: '不要把你的三明治给它们!' },
      { sentence: 'What does it look like?', translation: '它看起来是什么样子的?' },
      { sentence: "Why don't you like snakes? Because they're really scary.", translation: '你为什么不喜欢蛇?因为它们真的很吓人。' },
      { sentence: 'For example, they can remember one another after many years.', translation: '例如,多年后它们还能记住彼此。' },
      { sentence: "Let's save the forests and not buy things made of ivory.", translation: '让我们拯救森林,并且不要买象牙制品。' },
    ],
    story: {
      title: 'My Favourite Animal',
      pages: [
        { text: 'My favourite animal is the whale.' },
        { text: 'Whales are friendly and lovely.' },
        { text: 'They usually live in the sea.' },
        { text: 'They like to eat small sea life.' },
        { text: 'Whales are large and strong with huge tails.' },
        { text: 'However, some whales are in great danger now.' },
        { text: 'Bad people kill them for their oil.' },
        { text: "We should work together to keep them safe." },
      ],
    },
    clozeTests: [
      { sentence: 'My favourite animal ___ the whale.', blank: 'is', options: ['is', 'are', 'am', 'be'], correct: 0 },
      { sentence: 'Whales are ___ and lovely.', blank: 'friendly', options: ['friendly', 'friend', 'friends', 'unfriendly'], correct: 0 },
      { sentence: 'They usually ___ in the sea.', blank: 'live', options: ['live', 'lives', 'lived', 'living'], correct: 0 },
      { sentence: 'Some whales are in great ___ now.', blank: 'danger', options: ['danger', 'dangerous', 'endangered', 'safe'], correct: 0 },
      { sentence: 'We should work ___ to keep them safe.', blank: 'together', options: ['together', 'alone', 'each', 'other'], correct: 0 },
    ],
  },
  {
    id: 2, name: 'Unit 2 No Rules, No Order', emoji: '📏',
    words: [
      { word: 'rule', meaning: '规则', example: 'We must follow the school rules.' },
      { word: 'follow', meaning: '遵循', example: 'Follow me, please.' },
      { word: 'arrive', meaning: '到达', example: 'I arrive at school at 7:30.' },
      { word: 'uniform', meaning: '校服', example: 'We wear uniforms every day.' },
      { word: 'litter', meaning: '乱扔垃圾', example: "Don't litter everywhere." },
      { word: 'respect', meaning: '尊敬', example: 'We should respect our teachers.' },
      { word: 'polite', meaning: '有礼貌的', example: 'Be polite to others.' },
      { word: 'queue', meaning: '队伍', example: 'Please stand in the queue.' },
      { word: 'noise', meaning: '噪音', example: "Don't make noise in class." },
      { word: 'feed', meaning: '喂养', example: "Don't feed the animals." },
      { word: 'leave', meaning: '离开;留下', example: 'Please leave the room clean.' },
      { word: 'lend', meaning: '借出', example: 'Can you lend me your pen?' },
      { word: 'absent', meaning: '缺席的', example: 'He is absent from school today.' },
    ],
    wordForms: [
      { from: 'polite', meaning: '有礼貌的', forms: [{ form: 'polite', pos: 'adj.' }, { form: 'impolite', pos: 'adj.不礼貌的' }, { form: 'politely', pos: 'adv.有礼貌地' }] },
      { from: 'noise', meaning: '噪音', forms: [{ form: 'noise', pos: 'n.' }, { form: 'noisy', pos: 'adj.吵闹的' }, { form: 'noisily', pos: 'adv.吵闹地' }] },
      { from: 'treat', meaning: '对待', forms: [{ form: 'treat', pos: 'v.' }, { form: 'treatment', pos: 'n.待遇' }] },
      { from: 'quiet', meaning: '安静的', forms: [{ form: 'quiet', pos: 'adj.' }, { form: 'quietly', pos: 'adv.安静地' }] },
      { from: 'happy', meaning: '快乐的', forms: [{ form: 'happy', pos: 'adj.' }, { form: 'unhappy', pos: 'adj.不快乐的' }, { form: 'happily', pos: 'adv.快乐地' }] },
    ],
    phrases: [
      { phrase: 'have to', meaning: '不得不', scenario: '下雨了,你没带伞,你______跑回家', correct: 'have to', wrong: 'choose to' },
      { phrase: 'on time', meaning: '准时', scenario: '上课铃响前到教室,就是', correct: 'on time', wrong: 'late' },
      { phrase: 'turn off', meaning: '关掉', scenario: '离开房间时应该______灯', correct: 'turn off the lights', wrong: 'turn on the lights' },
      { phrase: 'be late for', meaning: '迟到', scenario: '如果早上起晚了,你会______上学', correct: 'be late for', wrong: 'be early for' },
      { phrase: 'put up your hand', meaning: '举手', scenario: '想要回答问题时应该', correct: 'put up your hand', wrong: 'shout out loud' },
      { phrase: 'focus on', meaning: '集中注意力', scenario: '上课时你应该______学习', correct: 'focus on your study', wrong: 'look out the window' },
      { phrase: 'jump the queue', meaning: '插队', scenario: '排队时有人插队,这是不礼貌的', correct: "don't jump the queue", wrong: "it's OK to jump" },
      { phrase: 'keep quiet', meaning: '保持安静', scenario: '在图书馆里要', correct: 'keep quiet', wrong: 'make noise' },
    ],
    sentences: [
      { sentence: 'No rules, no order.', translation: '没有规矩,不成方圆。' },
      { sentence: "Don't be late for school.", translation: '上学不要迟到。' },
      { sentence: 'Put up your hand if you want to ask a question.', translation: '如果你想问问题,请举手。' },
      { sentence: "Sally mustn't wear her own jacket. She has to wear the uniform.", translation: '萨莉不能穿自己的夹克,她必须穿校服。' },
    ],
    story: {
      title: 'Rules in My Life',
      pages: [
        { text: 'Rules are everywhere in our lives.' },
        { text: 'I have to follow many rules at home and at school.' },
        { text: 'At home, I have to get up early to read for half an hour.' },
        { text: "It's tiring but useful." },
        { text: "At school, I can't use my mobile phone." },
        { text: "It helps me to focus on learning." },
        { text: "I know it's hard, but I will try my best." },
      ],
    },
    clozeTests: [
      { sentence: 'No ___, no order.', blank: 'rules', options: ['rules', 'rule', 'ruling', 'rulers'], correct: 0 },
      { sentence: "Don't ___ late for school.", blank: 'be', options: ['be', 'is', 'are', 'am'], correct: 0 },
      { sentence: "She ___ to wear the uniform.", blank: 'has', options: ['has', 'have', 'had', 'having'], correct: 0 },
      { sentence: "Put ___ your hand if you want to ask.", blank: 'up', options: ['up', 'down', 'on', 'off'], correct: 0 },
      { sentence: "It helps me to ___ on learning.", blank: 'focus', options: ['focus', 'follow', 'find', 'finish'], correct: 0 },
    ],
  },
  {
    id: 3, name: 'Unit 3 Keep Fit', emoji: '💪',
    words: [
      { word: 'fit', meaning: '健康的;适合', example: 'Running keeps you fit.' },
      { word: 'baseball', meaning: '棒球', example: 'He plays baseball every Sunday.' },
      { word: 'glove', meaning: '手套', example: 'Put on your baseball glove.' },
      { word: 'racket', meaning: '球拍', example: 'This is my tennis racket.' },
      { word: 'hardly', meaning: '几乎不', example: 'I hardly ever eat fast food.' },
      { word: 'ever', meaning: '从来', example: 'Have you ever been to Beijing?' },
      { word: 'seldom', meaning: '很少', example: 'I seldom play computer games.' },
      { word: 'practice', meaning: '练习', example: 'Practice makes perfect.' },
      { word: 'perfect', meaning: '完美的', example: 'You did a perfect job.' },
      { word: 'progress', meaning: '进步', example: 'I am making great progress.' },
      { word: 'team', meaning: '团队', example: 'We work as a team.' },
      { word: 'encourage', meaning: '鼓励', example: 'We encourage each other.' },
      { word: 'succeed', meaning: '成功', example: 'You will succeed if you try.' },
    ],
    wordForms: [
      { from: 'one', meaning: '一', forms: [{ form: 'one', pos: '基数词' }, { form: 'once', pos: 'adv.一次' }, { form: 'first', pos: '序数词' }] },
      { from: 'two', meaning: '二', forms: [{ form: 'two', pos: '基数词' }, { form: 'twice', pos: 'adv.两次' }, { form: 'second', pos: '序数词' }] },
      { from: 'my', meaning: '我的', forms: [{ form: 'my', pos: 'adj.' }, { form: 'mine', pos: 'pron.我的(所有物)' }] },
      { from: 'her', meaning: '她的', forms: [{ form: 'her', pos: 'adj.' }, { form: 'hers', pos: 'pron.她的(所有物)' }] },
      { from: 'their', meaning: '他们的', forms: [{ form: 'their', pos: 'adj.' }, { form: 'theirs', pos: 'pron.他们的(所有物)' }] },
      { from: 'practise', meaning: '练习', forms: [{ form: 'practise', pos: 'v.' }, { form: 'practice', pos: 'n.' }] },
    ],
    phrases: [
      { phrase: 'keep fit', meaning: '保持健康', scenario: '每天跑步可以帮你______', correct: 'keep fit', wrong: 'keep quiet' },
      { phrase: 'hardly ever', meaning: '几乎从不', scenario: '我______吃垃圾食品', correct: 'hardly ever eat junk food', wrong: 'always eat junk food' },
      { phrase: 'three times a week', meaning: '一周三次', scenario: '我______去打篮球', correct: 'go three times a week', wrong: 'go every day' },
      { phrase: 'work out', meaning: '锻炼', scenario: '去健身房______', correct: 'work out', wrong: 'work on' },
      { phrase: 'belong to', meaning: '属于', scenario: '这本书______我', correct: 'belongs to me', wrong: 'is belong to me' },
      { phrase: 'build team spirit', meaning: '培养团队精神', scenario: '打球可以______', correct: 'build team spirit', wrong: 'play alone' },
    ],
    sentences: [
      { sentence: 'How often do you play ping-pong? — Three times a week.', translation: '你多久打一次乒乓球? — 一周三次。' },
      { sentence: 'Practice makes perfect.', translation: '熟能生巧。' },
      { sentence: 'Whose T-shirt is this? It belongs to Tom.', translation: '这件T恤是谁的? 它是汤姆的。' },
      { sentence: 'We work as a team, and we win or lose as a team.', translation: '我们团队合作,无论输赢都共同承担。' },
    ],
    story: {
      title: 'My Favourite Way to Keep Fit',
      pages: [
        { text: 'My favourite way to keep fit is to go swimming.' },
        { text: 'I often swim at the gym near my home.' },
        { text: 'I swim for about an hour with my brother.' },
        { text: 'I love swimming because it helps me keep strong.' },
        { text: 'I feel very relaxed when I stay in the water.' },
        { text: "Let's exercise more and make it a part of our lives." },
      ],
    },
    clozeTests: [
      { sentence: 'How ___ do you play ping-pong?', blank: 'often', options: ['often', 'long', 'many', 'much'], correct: 0 },
      { sentence: 'Practice makes ___.', blank: 'perfect', options: ['perfect', 'progress', 'fit', 'great'], correct: 0 },
      { sentence: 'It belongs ___ Tom.', blank: 'to', options: ['to', 'with', 'for', 'of'], correct: 0 },
      { sentence: 'We work ___ a team.', blank: 'as', options: ['as', 'in', 'on', 'for'], correct: 0 },
      { sentence: 'Let\'s ___ more.', blank: 'exercise', options: ['exercise', 'exercises', 'exercised', 'exercising'], correct: 0 },
    ],
  },
  {
    id: 4, name: 'Unit 4 Eat Well', emoji: '🍎',
    words: [
      { word: 'watermelon', meaning: '西瓜', example: 'Watermelon is sweet and juicy.' },
      { word: 'cabbage', meaning: '卷心菜', example: 'Cabbage is good for health.' },
      { word: 'dumpling', meaning: '饺子', example: 'We eat dumplings on New Year.' },
      { word: 'taste', meaning: '味道;品尝', example: 'The soup tastes delicious.' },
      { word: 'menu', meaning: '菜单', example: 'Let me look at the menu.' },
      { word: 'customer', meaning: '顾客', example: 'The customer wants a coffee.' },
      { word: 'habit', meaning: '习惯', example: 'Eating well is a good habit.' },
      { word: 'cause', meaning: '导致', example: 'Too much sugar causes problems.' },
      { word: 'enough', meaning: '足够的', example: 'We need enough vegetables.' },
      { word: 'salad', meaning: '沙拉', example: 'I like fruit salad.' },
      { word: 'porridge', meaning: '粥', example: 'I have porridge for breakfast.' },
      { word: 'choice', meaning: '选择', example: 'Make a healthy choice.' },
      { word: 'result', meaning: '结果', example: 'A balanced diet brings good results.' },
    ],
    wordForms: [
      { from: 'waiter', meaning: '男服务员', forms: [{ form: 'waiter', pos: 'n.男服务员' }, { form: 'waitress', pos: 'n.女服务员' }] },
      { from: 'serve', meaning: '服务', forms: [{ form: 'serve', pos: 'v.' }, { form: 'service', pos: 'n.接待;服务' }] },
      { from: 'choose', meaning: '选择', forms: [{ form: 'choose', pos: 'v.' }, { form: 'choice', pos: 'n.选择' }] },
      { from: 'salt', meaning: '盐', forms: [{ form: 'salt', pos: 'n.' }, { form: 'salty', pos: 'adj.咸的' }] },
      { from: 'sleep', meaning: '睡觉', forms: [{ form: 'sleep', pos: 'v.' }, { form: 'sleepy', pos: 'adj.困倦的' }] },
      { from: 'thirst', meaning: '口渴', forms: [{ form: 'thirst', pos: 'n.' }, { form: 'thirsty', pos: 'adj.渴的' }] },
    ],
    phrases: [
      { phrase: 'would like', meaning: '想要', scenario: '去餐厅时对服务员说:我______点菜', correct: 'would like to order', wrong: 'must order' },
      { phrase: 'too much', meaning: '太多', scenario: '吃______糖对牙齿不好', correct: 'too much sugar', wrong: 'too many sugars' },
      { phrase: 'be bad for', meaning: '对……有害', scenario: '吸烟______健康', correct: 'is bad for your health', wrong: 'is good for your health' },
      { phrase: 'put on weight', meaning: '增加体重', scenario: '吃太多快餐会', correct: 'put on weight', wrong: 'keep fit' },
      { phrase: 'after all', meaning: '毕竟', scenario: '______,一天一苹果医生远离我', correct: 'After all', wrong: 'At first' },
    ],
    sentences: [
      { sentence: 'What do you usually have for breakfast?', translation: '你早餐通常吃什么?' },
      { sentence: 'Which soup would you like, chicken or fish?', translation: '您想要哪种汤,鸡汤还是鱼汤?' },
      { sentence: 'Both what we eat and how we eat are important!', translation: '我们吃什么和怎么吃都很重要!' },
      { sentence: 'An apple a day keeps the doctor away.', translation: '一天一苹果,医生远离我。' },
    ],
    story: {
      title: 'My Eating Habits',
      pages: [
        { text: 'Eating habits are important for our health.' },
        { text: 'I have a big breakfast every day.' },
        { text: 'It gives me enough energy for the morning study.' },
        { text: 'At lunch, I eat rice, vegetables and a little meat.' },
        { text: 'I try to drink water instead of soft drinks.' },
        { text: 'To keep healthy, I should stick to my good habits.' },
      ],
    },
    clozeTests: [
      { sentence: 'What do you usually ___ for breakfast?', blank: 'have', options: ['have', 'has', 'had', 'having'], correct: 0 },
      { sentence: 'An apple a day keeps the ___ away.', blank: 'doctor', options: ['doctor', 'teacher', 'friend', 'parent'], correct: 0 },
      { sentence: 'Both what we eat ___ how we eat are important.', blank: 'and', options: ['and', 'but', 'or', 'so'], correct: 0 },
      { sentence: 'Eating habits are ___ for our health.', blank: 'important', options: ['important', 'different', 'difficult', 'interesting'], correct: 0 },
      { sentence: 'I try to drink water ___ of soft drinks.', blank: 'instead', options: ['instead', 'because', 'ahead', 'out'], correct: 0 },
    ],
  },
  {
    id: 5, name: 'Unit 5 Here and Now', emoji: '📍',
    words: [
      { word: 'moment', meaning: '片刻;瞬间', example: 'Wait a moment, please.' },
      { word: 'message', meaning: '消息', example: 'I got your message.' },
      { word: 'race', meaning: '比赛', example: 'We watched the dragon boat race.' },
      { word: 'hold', meaning: '拿着;抓住', example: 'Hold my hand.' },
      { word: 'voice', meaning: '嗓音', example: 'She has a beautiful voice.' },
      { word: 'online', meaning: '在线的', example: 'I take online classes.' },
      { word: 'forward', meaning: '向前', example: "I'm looking forward to it." },
      { word: 'happen', meaning: '发生', example: 'What is happening?' },
      { word: 'shine', meaning: '照耀', example: 'The sun is shining.' },
      { word: 'market', meaning: '市场', example: 'She is shopping at the market.' },
      { word: 'passenger', meaning: '乘客', example: 'The bus has many passengers.' },
      { word: 'rush', meaning: '冲;奔', example: 'People rush to work.' },
      { word: 'explore', meaning: '探索', example: 'Let us explore the city.' },
    ],
    wordForms: [
      { from: 'ride', meaning: '骑', forms: [{ form: 'ride', pos: 'v.' }, { form: 'rider', pos: 'n.骑手' }] },
      { from: 'hope', meaning: '希望', forms: [{ form: 'hope', pos: 'v./n.' }, { form: 'hopeful', pos: 'adj.有希望的' }, { form: 'hopefully', pos: 'adv.有希望地' }] },
      { from: 'bright', meaning: '明亮的', forms: [{ form: 'bright', pos: 'adj.' }, { form: 'brightly', pos: 'adv.明亮地' }] },
      { from: 'centre', meaning: '中心', forms: [{ form: 'centre', pos: 'n.' }, { form: 'central', pos: 'adj.中心的' }] },
      { from: 'tour', meaning: '旅行', forms: [{ form: 'tour', pos: 'v./n.' }, { form: 'tourist', pos: 'n.游客' }] },
    ],
    phrases: [
      { phrase: 'right now', meaning: '现在', scenario: '你正在做什么?______', correct: 'right now', wrong: 'right there' },
      { phrase: 'hold on', meaning: '别挂断', scenario: '打电话时说"请稍等"', correct: 'hold on, please', wrong: 'hang up, please' },
      { phrase: 'take a message', meaning: '捎口信', scenario: '对方不在,你可以说"需要______吗?"', correct: 'take a message', wrong: 'leave a message' },
      { phrase: 'look forward to', meaning: '期待', scenario: '我______见到你', correct: "look forward to seeing you", wrong: "look forward to see you" },
      { phrase: 'rush hour', meaning: '高峰期', scenario: '早上8点路上很堵,因为是', correct: 'rush hour', wrong: 'rest time' },
    ],
    sentences: [
      { sentence: 'Sorry, he is out at the moment.', translation: '抱歉,他现在不在。' },
      { sentence: 'Would you like to leave a message?', translation: '您要留个口信吗?' },
      { sentence: 'What are you doing right now?', translation: '你现在在做什么?' },
      { sentence: 'I am looking forward to seeing you soon!', translation: '我期待快点见到你!' },
    ],
    story: {
      title: 'A Morning in the Park',
      pages: [
        { text: "It's half past eight in the morning." },
        { text: 'The weather is sunny and warm.' },
        { text: "I'm jogging with my sister in the park." },
        { text: 'Many people are doing different things.' },
        { text: 'Some are doing exercise, others are walking.' },
        { text: 'A girl is taking photos of ducks in the lake.' },
        { text: 'What a nice morning!' },
      ],
    },
    clozeTests: [
      { sentence: "Sorry, he is ___ at the moment.", blank: 'out', options: ['out', 'in', 'on', 'off'], correct: 0 },
      { sentence: 'Would you like to ___ a message?', blank: 'leave', options: ['leave', 'live', 'take', 'make'], correct: 0 },
      { sentence: 'What ___ you doing right now?', blank: 'are', options: ['are', 'is', 'am', 'do'], correct: 0 },
      { sentence: "I'm looking forward to ___ you soon.", blank: 'seeing', options: ['seeing', 'see', 'seen', 'saw'], correct: 0 },
      { sentence: 'The sun is ___ brightly.', blank: 'shining', options: ['shining', 'shines', 'shined', 'shine'], correct: 0 },
    ],
  },
  {
    id: 6, name: 'Unit 6 Rain or Shine', emoji: '🌤️',
    words: [
      { word: 'affect', meaning: '影响', example: 'Weather affects my mood.' },
      { word: 'dry', meaning: '干的', example: 'The ground is dry.' },
      { word: 'temperature', meaning: '温度', example: 'The temperature is high today.' },
      { word: 'freezing', meaning: '极冷的', example: 'It is freezing outside.' },
      { word: 'although', meaning: '虽然', example: 'Although it rained, we went out.' },
      { word: 'experience', meaning: '经历', example: 'It was a great experience.' },
      { word: 'mountain', meaning: '山', example: 'We climbed the mountain.' },
      { word: 'storm', meaning: '暴风雨', example: 'The storm is coming.' },
      { word: 'through', meaning: '穿过', example: 'We walked through the forest.' },
      { word: 'spirit', meaning: '精神;情绪', example: 'They are in high spirits.' },
      { word: 'ground', meaning: '地面', example: 'The ground is wet.' },
      { word: 'wet', meaning: '湿的', example: 'My shoes are wet.' },
      { word: 'pour', meaning: '倾倒;下大雨', example: 'The rain is pouring down.' },
    ],
    wordForms: [
      { from: 'storm', meaning: '暴风雨', forms: [{ form: 'storm', pos: 'n.' }, { form: 'stormy', pos: 'adj.有暴风雨的' }] },
      { from: 'cloud', meaning: '云', forms: [{ form: 'cloud', pos: 'n.' }, { form: 'cloudy', pos: 'adj.多云的' }] },
      { from: 'fog', meaning: '雾', forms: [{ form: 'fog', pos: 'n.' }, { form: 'foggy', pos: 'adj.有雾的' }] },
      { from: 'wind', meaning: '风', forms: [{ form: 'wind', pos: 'n.' }, { form: 'windy', pos: 'adj.多风的' }] },
      { from: 'snow', meaning: '雪', forms: [{ form: 'snow', pos: 'n./v.' }, { form: 'snowy', pos: 'adj.下雪的' }, { form: 'snowman', pos: 'n.雪人' }] },
      { from: 'tire', meaning: '疲倦', forms: [{ form: 'tiring', pos: 'adj.令人疲倦的' }, { form: 'tired', pos: 'adj.累的' }] },
    ],
    phrases: [
      { phrase: 'rain or shine', meaning: '不论晴雨', scenario: '______,我都要去上学', correct: 'Rain or shine', wrong: 'Sunny or cloudy' },
      { phrase: 'stay in', meaning: '待在家', scenario: '下雪时我们通常______', correct: 'stay in', wrong: 'go out' },
      { phrase: 'because of', meaning: '因为', scenario: '______大雾,我看不清', correct: 'Because of the fog', wrong: 'Because the fog' },
      { phrase: 'in high spirits', meaning: '情绪高涨', scenario: '虽然天气不好,大家仍然______', correct: 'in high spirits', wrong: 'in low spirits' },
      { phrase: 'pour down', meaning: '倾盆大雨', scenario: '突然大雨______', correct: 'pours down', wrong: 'falls lightly' },
    ],
    sentences: [
      { sentence: "What's the weather like?", translation: '天气怎么样?' },
      { sentence: "How's your holiday going?", translation: '你假期过得怎么样?' },
      { sentence: "We usually stay in when it snows, but now we're building a snowman outside.", translation: '下雪时我们通常待在家,但现在我们在外面堆雪人。' },
      { sentence: 'Although the weather is bad, many people are still in high spirits.', translation: '虽然天气不好,但许多人仍然情绪高涨。' },
    ],
    story: {
      title: 'A Sudden Rain',
      pages: [
        { text: "I'm walking in the street to buy books." },
      ],
    },
  } as UnitStoryData,
]

// Fill remaining units with similar data structure...
// Unit 6 story continuation:
const u6Partial = units[5]
u6Partial.story = {
  title: 'A Sudden Rain',
  pages: [
    { text: "I'm walking in the street to buy books." },
    { text: 'The weather suddenly turns bad.' },
    { text: 'Dark clouds cover the sky.' },
    { text: 'Strong winds are blowing hard.' },
    { text: 'Heavy rain is pouring down!' },
    { text: 'People are running into nearby shops.' },
    { text: 'My shoes are all wet!' },
    { text: 'After a few minutes, the rain stops.' },
    { text: 'The sky looks bright again.' },
  ],
}
u6Partial.clozeTests = [
  { sentence: "What's the weather ___?", blank: 'like', options: ['like', 'look', 'looks', 'likes'], correct: 0 },
  { sentence: "We usually ___ in when it snows.", blank: 'stay', options: ['stay', 'stays', 'stayed', 'staying'], correct: 0 },
  { sentence: 'The rain is pouring ___.', blank: 'down', options: ['down', 'up', 'off', 'out'], correct: 0 },
  { sentence: 'Although the weather is bad, they are in high ___.', blank: 'spirits', options: ['spirits', 'spirit', 'spiriting', 'spirited'], correct: 0 },
  { sentence: "I'm ___ in the street.", blank: 'walking', options: ['walking', 'walk', 'walks', 'walked'], correct: 0 },
]

// Unit 7
units.push({
  id: 7, name: 'Unit 7 A Day to Remember', emoji: '📅',
  words: [
    { word: 'museum', meaning: '博物馆', example: 'We visited the museum yesterday.' },
    { word: 'exhibition', meaning: '展览', example: 'There is an art exhibition.' },
    { word: 'trip', meaning: '旅行', example: 'We went on a school trip.' },
    { word: 'direction', meaning: '方向', example: 'Can you give me directions?' },
    { word: 'realize', meaning: '认识到', example: 'I realized my mistake.' },
    { word: 'terrible', meaning: '糟糕的', example: 'The weather was terrible.' },
    { word: 'explore', meaning: '探索', example: 'We explored the old town.' },
    { word: 'tent', meaning: '帐篷', example: 'We put up the tent.' },
    { word: 'fresh', meaning: '新鲜的', example: 'The air is fresh in the mountains.' },
    { word: 'diary', meaning: '日记', example: 'I keep a diary every day.' },
    { word: 'create', meaning: '创造', example: 'We created a robot model.' },
    { word: 'inside', meaning: '在……里面', example: 'It is warm inside the house.' },
    { word: 'along', meaning: '沿着', example: 'We walked along the river.' },
  ],
  wordForms: [
    { from: 'act', meaning: '扮演', forms: [{ form: 'act', pos: 'v.' }, { form: 'actor', pos: 'n.演员' }, { form: 'action', pos: 'n.行动' }] },
    { from: 'create', meaning: '创造', forms: [{ form: 'create', pos: 'v.' }, { form: 'creative', pos: 'adj.有创造力的' }, { form: 'creation', pos: 'n.创造' }] },
    { from: 'teach', meaning: '教', forms: [{ form: 'teach', pos: 'v.' }, { form: 'teacher', pos: 'n.教师' }, { form: 'taught', pos: '过去式' }] },
    { from: 'final', meaning: '最终的', forms: [{ form: 'final', pos: 'adj.' }, { form: 'finally', pos: 'adv.终于' }] },
    { from: 'agree', meaning: '同意', forms: [{ form: 'agree', pos: 'v.' }, { form: 'disagree', pos: 'v.不同意' }, { form: 'agreement', pos: 'n.同意' }] },
  ],
  phrases: [
    { phrase: 'meet up with', meaning: '碰头;相聚', scenario: '周末我和朋友______', correct: 'meet up with friends', wrong: 'break up with friends' },
    { phrase: 'go on a trip', meaning: '去旅行', scenario: '上周我们学校______', correct: 'went on a trip', wrong: 'went on working' },
    { phrase: 'used to do', meaning: '过去常常', scenario: '我______认为英语很难', correct: 'used to think', wrong: 'use to think' },
    { phrase: 'write down', meaning: '写下', scenario: '请把你的想法______', correct: 'write down', wrong: 'throw away' },
    { phrase: 'keep a diary', meaning: '写日记', scenario: '我每天都有______的习惯', correct: 'keeping a diary', wrong: 'keeping a secret' },
  ],
  sentences: [
    { sentence: 'We saw the factory make dirty water clean again.', translation: '我们看到工厂把脏水又变干净了。' },
    { sentence: 'It was a day to remember.', translation: '这是一个值得铭记的日子。' },
    { sentence: 'Every grain comes from hard work.', translation: '粒粒皆辛苦。' },
    { sentence: 'What a day!', translation: '多么(难忘的)一天啊!' },
  ],
  story: {
    title: 'A School Trip',
    pages: [
      { text: 'Last weekend we went on a school trip to the art museum.' },
      { text: 'It was sunny and we were all excited.' },
      { text: 'Our teacher showed us around.' },
      { text: 'She told us stories behind famous paintings.' },
      { text: 'I took many photos of the beautiful works.' },
      { text: 'The trip was tiring but interesting.' },
      { text: 'What a great day to remember!' },
    ],
  },
  clozeTests: [
    { sentence: 'We saw the factory make dirty water ___ again.', blank: 'clean', options: ['clean', 'dirty', 'clear', 'cold'], correct: 0 },
    { sentence: 'It was a day to ___.', blank: 'remember', options: ['remember', 'forget', 'repeat', 'review'], correct: 0 },
    { sentence: 'Every ___ comes from hard work.', blank: 'grain', options: ['grain', 'grass', 'green', 'great'], correct: 0 },
    { sentence: 'What ___ day!', blank: 'a', options: ['a', 'an', 'the', '/'], correct: 0 },
    { sentence: 'We went on a school ___ to the museum.', blank: 'trip', options: ['trip', 'tip', 'train', 'tree'], correct: 0 },
  ],
})

// Unit 8
units.push({
  id: 8, name: 'Unit 8 Once upon a Time', emoji: '📖',
  words: [
    { word: 'upon', meaning: '在……上', example: 'Once upon a time...' },
    { word: 'net', meaning: '网', example: 'The fisherman cast his net.' },
    { word: 'promise', meaning: '承诺', example: 'He promised to help me.' },
    { word: 'war', meaning: '战争', example: 'The two countries were at war.' },
    { word: 'wise', meaning: '明智的', example: 'The wise old man gave advice.' },
    { word: 'emperor', meaning: '皇帝', example: 'The emperor had no clothes on.' },
    { word: 'pretend', meaning: '假装', example: "Don't pretend to be sick." },
    { word: 'silly', meaning: '愚蠢的', example: 'That is a silly idea.' },
    { word: 'truth', meaning: '真相', example: 'Tell the truth!' },
    { word: 'ugly', meaning: '丑陋的', example: 'The ugly duckling became a swan.' },
    { word: 'swan', meaning: '天鹅', example: 'The swan is beautiful.' },
    { word: 'fisherman', meaning: '渔夫', example: 'The fisherman caught a fish.' },
    { word: 'genie', meaning: '妖怪', example: 'The genie came out of the bottle.' },
    { word: 'rich', meaning: '富有的', example: 'The rich man had everything.' },
    { word: 'powerful', meaning: '强大的', example: 'The king was very powerful.' },
    { word: 'smile', meaning: '微笑', example: 'She smiled at me.' },
  ],
  wordForms: [
    { from: 'bite', meaning: '咬', forms: [{ form: 'bite', pos: '现在时' }, { form: 'bit', pos: '过去式' }] },
    { from: 'hunt', meaning: '打猎', forms: [{ form: 'hunt', pos: 'v.' }, { form: 'hunter', pos: 'n.猎人' }] },
    { from: 'lie', meaning: '撒谎', forms: [{ form: 'lie', pos: 'v.' }, { form: 'lying', pos: '现在分词' }, { form: 'lied', pos: '过去式' }] },
    { from: 'decide', meaning: '决定', forms: [{ form: 'decide', pos: 'v.' }, { form: 'decision', pos: 'n.决定' }] },
    { from: 'sudden', meaning: '突然的', forms: [{ form: 'sudden', pos: 'adj.' }, { form: 'suddenly', pos: 'adv.突然地' }] },
    { from: 'true', meaning: '真实的', forms: [{ form: 'true', pos: 'adj.' }, { form: 'truth', pos: 'n.真相' }, { form: 'truly', pos: 'adv.真实地' }] },
    { from: 'die', meaning: '死亡', forms: [{ form: 'die', pos: 'v.' }, { form: 'dead', pos: 'adj.死亡的' }, { form: 'dying', pos: 'adj.垂死的' }] },
  ],
  phrases: [
    { phrase: 'once upon a time', meaning: '从前', scenario: '讲故事时开头常说', correct: 'Once upon a time', wrong: 'Long long after' },
    { phrase: 'tell the truth', meaning: '说实话', scenario: '小明打碎了花瓶。你会:', correct: 'tell the truth', wrong: 'tell a lie' },
    { phrase: 'decide to do sth', meaning: '决定做某事', scenario: '马上考试,你决定更加努力学习。你:', correct: 'decide to study harder', wrong: 'decide to give up' },
    { phrase: 'pretend to do sth', meaning: '假装做某事', scenario: '他______没看见我', correct: 'pretended not to see me', wrong: 'pretended to see me' },
    { phrase: 'be afraid to do sth', meaning: '害怕做某事', scenario: '小女孩______走夜路', correct: 'is afraid to walk alone at night', wrong: 'is happy to walk alone' },
    { phrase: 'set...free', meaning: '释放', scenario: '渔夫决定把鱼______', correct: 'set the fish free', wrong: 'catch the fish' },
    { phrase: 'laugh at', meaning: '嘲笑', scenario: '不要______别人', correct: "laugh at others", wrong: "look at others" },
    { phrase: 'make a lot of money', meaning: '赚很多钱', scenario: '他们想通过撒谎来______', correct: 'make a lot of money', wrong: 'make a lot of friends' },
  ],
  sentences: [
    { sentence: 'Once upon a time, there lived an old fisherman.', translation: '从前,住着一位老渔夫。' },
    { sentence: 'What lovely clothes!', translation: '多么美丽的衣服啊!' },
    { sentence: "That can't be true!", translation: '那不可能是真的!' },
    { sentence: 'What an ugly duckling!', translation: '多么丑的小鸭子啊!' },
  ],
  story: {
    title: 'The Fisherman and the Genie',
    pages: [
      { text: 'The fisherman felt scared.' },
      { text: 'He looked at the bottle in his hands.' },
      { text: '"Wait a minute!" he said.' },
      { text: '"The bottle is so small — How could a big genie fit inside it?"' },
      { text: 'The genie laughed and shouted, "Watch this!"' },
      { text: 'He turned back into a cloud.' },
      { text: 'He fit into the bottle.' },
      { text: 'Before he could come out again, the fisherman closed it tightly.' },
      { text: '"Now you can stay in the bottle forever!"' },
    ],
  },
  clozeTests: [
    { sentence: 'Once upon a ___, there lived a fisherman.', blank: 'time', options: ['time', 'day', 'night', 'week'], correct: 0 },
    { sentence: 'The fisherman felt ___.', blank: 'scared', options: ['scared', 'happy', 'angry', 'excited'], correct: 0 },
    { sentence: '"Wait a ___!" he said.', blank: 'minute', options: ['minute', 'hour', 'day', 'week'], correct: 0 },
    { sentence: 'The genie came out of the ___.', blank: 'bottle', options: ['bottle', 'box', 'bag', 'net'], correct: 0 },
    { sentence: 'The fisherman closed it ___.', blank: 'tightly', options: ['tightly', 'lightly', 'quickly', 'slowly'], correct: 0 },
  ],
})

export const STORY_UNITS = units
