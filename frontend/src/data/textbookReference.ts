// 新人教七年级下册晨读背记核心知识汇总

export interface WordEntry {
  word: string
  pos: string
  meaning: string
}

export interface PhraseEntry {
  phrase: string
  meaning: string
}

export interface SentenceEntry {
  sentence: string
  translation: string
}

export interface SectionContent {
  label: string
  words?: WordEntry[]
  wordForms?: { from: string; to: string }[]
  phrases?: PhraseEntry[]
  sentences?: SentenceEntry[]
}

export interface UnitReference {
  id: number
  name: string
  sections: SectionContent[]
  essay?: { title: string; content: string }
}

const u1: UnitReference = {
  id: 1, name: 'Unit 1 Animal Friends',
  sections: [
    { label: 'Section A 重点单词',
      words: [
        { word: 'giraffe', pos: 'n.', meaning: '长颈鹿' }, { word: 'eagle', pos: 'n.', meaning: '雕;鹰' },
        { word: 'penguin', pos: 'n.', meaning: '企鹅' }, { word: 'snake', pos: 'n.', meaning: '蛇' },
        { word: 'neck', pos: 'n.', meaning: '脖子' }, { word: 'guess', pos: 'v.', meaning: '猜测;估计' },
        { word: 'shark', pos: 'n.', meaning: '鲨鱼' }, { word: 'whale', pos: 'n.', meaning: '鲸' },
        { word: 'huge', pos: 'adj.', meaning: '巨大的;极多的' },
      ]
    },
    { label: 'Section A 词形变换',
      wordForms: [
        { from: 'fox', to: 'foxes(复数)' }, { from: 'wolf', to: 'wolves(复数)' },
        { from: 'care', to: 'careful adj.小心的;细致的' }, { from: 'sandwich', to: 'sandwiches(复数)' },
        { from: 'scary', to: 'scared adj.感到害怕的' }, { from: 'dangerous', to: 'danger n.危险' },
      ]
    },
    { label: 'Section A 重点短语',
      phrases: [
        { phrase: 'take good care of', meaning: '好好照顾;妥善处理' }, { phrase: 'so much', meaning: '如此;非常' },
        { phrase: 'stand close together', meaning: '紧挨着站在一起' }, { phrase: 'keep warm', meaning: '保暖' },
        { phrase: 'so smart', meaning: '如此聪明' }, { phrase: 'give sb sth / give sth to sb', meaning: '给某人某物' },
        { phrase: 'be (not) good for', meaning: '对...(没)有好处' }, { phrase: 'look like', meaning: '看起来像' },
        { phrase: 'live in the sea', meaning: '生活在海里' }, { phrase: 'black and white', meaning: '黑白相间的;黑白的' },
      ]
    },
    { label: 'Section A 重点句子',
      sentences: [
        { sentence: 'Yes, they look lovely.', translation: '是的,它们看起来很可爱。' },
        { sentence: "They can't fly like other birds, but they can swim fast.", translation: '它们不能像其他鸟类那样飞,但能游得很快。' },
        { sentence: "Don't give them your sandwich!", translation: '不要把你的三明治给它们!' },
        { sentence: 'What does it look like? / How does it look?', translation: '它看起来是什么样子的?' },
        { sentence: "- Why don't you like snakes? - Because they're really scary.", translation: '-为什么你不喜欢蛇? -因为它们真的很吓人。' },
      ]
    },
    { label: 'Section A 小学词汇',
      words: [
        { word: 'lion', pos: 'n.', meaning: '狮子' }, { word: 'tiger', pos: 'n.', meaning: '老虎' },
        { word: 'monkey', pos: 'n.', meaning: '猴子' }, { word: 'should', pos: 'modal v.', meaning: '应该;应当' },
        { word: 'cool', pos: 'adj.', meaning: '妙极的;酷的' }, { word: 'lovely', pos: 'adj.', meaning: '优美的;迷人的' },
        { word: 'cold', pos: 'adj.', meaning: '寒冷的' }, { word: 'stand', pos: 'v.', meaning: '站立' },
        { word: 'close', pos: 'adv./adj.', meaning: '紧挨着;靠近;亲密的' }, { word: 'warm', pos: 'adj.', meaning: '温暖的;暖和的' },
        { word: 'sea', pos: 'n.', meaning: '海;海洋' }, { word: 'mouse', pos: 'n.', meaning: '老鼠' },
        { word: 'bear', pos: 'n./v.', meaning: '熊;承受;容忍' }, { word: 'tail', pos: 'n.', meaning: '尾巴' },
      ]
    },
    { label: 'Section B 重点单词',
      words: [
        { word: 'save', pos: 'v.', meaning: '救;储蓄;保存' }, { word: 'trunk', pos: 'n.', meaning: '象鼻' },
        { word: 'pick', pos: 'v.', meaning: '捡;摘' }, { word: 'carry', pos: 'v.', meaning: '拿;提' },
        { word: 'culture', pos: 'n.', meaning: '文化;文明' }, { word: 'however', pos: 'adv.', meaning: '然而;不过' },
        { word: 'danger', pos: 'n.', meaning: '危险' }, { word: 'forest', pos: 'n.', meaning: '森林' },
        { word: 'kill', pos: 'v.', meaning: '杀死;弄死' }, { word: 'ivory', pos: 'n.', meaning: '象牙' },
        { word: 'quite', pos: 'adv.', meaning: '相当;完全' }, { word: 'fur', pos: 'n.', meaning: '(动物浓厚的)软毛' },
        { word: 'blind', pos: 'adj.', meaning: '瞎的;失明的' },
      ]
    },
    { label: 'Section B 词形变换',
      wordForms: [
        { from: 'luck', to: 'lucky adj.幸运的 → luckily adv.幸运地' },
        { from: 'Thai', to: 'Thailand n.泰国' },
        { from: 'playful', to: 'play v.玩' },
        { from: 'swimmer', to: 'swim v.游泳' },
        { from: 'friendly', to: 'friend n.朋友' },
        { from: 'hearing', to: 'hear v.听见' },
      ]
    },
    { label: 'Section B 重点短语',
      phrases: [
        { phrase: 'a symbol of good luck', meaning: '好运的象征' }, { phrase: 'pick up', meaning: '拿起;举起' },
        { phrase: 'carry heavy things with...', meaning: '用......提重物' }, { phrase: 'in some ways', meaning: '在某些方面' },
        { phrase: 'one another', meaning: '互相' }, { phrase: 'look after', meaning: '照顾' },
        { phrase: 'in danger', meaning: '处于危险之中' }, { phrase: 'cut down', meaning: '砍伐;减少' },
        { phrase: 'too many', meaning: '太多' }, { phrase: 'kill...for...', meaning: '为了......而杀死......' },
        { phrase: 'made of', meaning: '由......制成的' }, { phrase: 'quite a', meaning: '相当;非常' },
        { phrase: 'not...at all', meaning: '一点也不;完全不' },
      ]
    },
    { label: 'Section B 重点句子',
      sentences: [
        { sentence: 'For example, they can remember one another and places with food and water after many years.', translation: '例如,多年后它们还能记住其他大象以及有食物和水的地方。' },
        { sentence: "They look after other elephants when they don't feel well.", translation: '当其他大象感觉不舒服时,它们会照顾它们。' },
        { sentence: 'However, they are in danger.', translation: '不过,它们处于危险之中。' },
        { sentence: "Let's save the forests and not buy things made of ivory.", translation: '让我们拯救森林,并且不要买象牙制品。' },
        { sentence: 'She is quite a big dog, but she is not scary at all!', translation: '她是一只体型相当大的狗,但一点也不可怕!' },
        { sentence: 'She helps me find my way around.', translation: '她帮助我找到路。' },
      ]
    },
  ],
  essay: { title: 'My Favourite Animal', content: 'My favourite animal is the whale, because whales are friendly and lovely. They usually live in the sea and they like to eat small sea life. Whales are large and strong with huge tails. They are very good at swimming.\n\nHowever, some whales are in great danger now. Bad people kill them for their oil. Also, the environment in the sea is not as good as before, so they\'re losing their homes.\n\nWhales play an important part in the sea, so we should work together to keep them safe.' }
}

const u2: UnitReference = {
  id: 2, name: 'Unit 2 No Rules, No Order',
  sections: [
    { label: 'Section A 重点单词',
      words: [
        { word: 'rule', pos: 'n.', meaning: '规则;规章' }, { word: 'order', pos: 'n./v.', meaning: '秩序;命令;点菜' },
        { word: 'follow', pos: 'v.', meaning: '遵循;跟随' }, { word: 'arrive', pos: 'v.', meaning: '到达' },
        { word: 'hallway', pos: 'n.', meaning: '走廊' }, { word: 'uniform', pos: 'n.', meaning: '校服;制服' },
        { word: 'litter', pos: 'v./n.', meaning: '乱扔;垃圾' }, { word: 'respect', pos: 'n.&v.', meaning: '尊敬' },
        { word: 'if', pos: 'conj.', meaning: '如果' }, { word: 'everything', pos: 'pron.', meaning: '每件事;一切' },
        { word: 'lend', pos: 'v.', meaning: '借给;借出' }, { word: 'queue', pos: 'n.', meaning: '队' },
        { word: 'feed', pos: 'v.', meaning: '喂养;饲养' }, { word: 'leave', pos: 'v.', meaning: '离开;留下' },
      ]
    },
    { label: 'Section A 词形变换',
      wordForms: [
        { from: 'polite', to: 'impolite(反义词)' }, { from: 'treat', to: 'treatment n.待遇;治疗' },
        { from: 'absent', to: 'absence n.缺席' }, { from: 'quietly', to: 'quiet adj.安静的' },
        { from: 'noise', to: 'noisy adj.吵闹的' },
      ]
    },
    { label: 'Section A 重点短语',
      phrases: [
        { phrase: 'follow rules', meaning: '遵守规则' }, { phrase: 'be/arrive late for', meaning: '迟到' },
        { phrase: 'on time', meaning: '准时' }, { phrase: 'wear the school uniform', meaning: '穿校服' },
        { phrase: 'treat sb with respect', meaning: '尊重某人' }, { phrase: 'put up sb\'s hand', meaning: '举手' },
        { phrase: 'have to', meaning: '不得不' }, { phrase: 'lend sb sth / lend sth to sb', meaning: '借出某物给某人' },
        { phrase: 'mobile phone', meaning: '手机' }, { phrase: 'turn off', meaning: '关掉(水、电或煤气)' },
        { phrase: 'jump the queue', meaning: '插队' }, { phrase: 'wait sb\'s turn', meaning: '等待某人的轮次' },
        { phrase: 'keep quiet', meaning: '保持安静' }, { phrase: 'make noise', meaning: '制造噪声' },
      ]
    },
    { label: 'Section A 重点句子',
      sentences: [
        { sentence: 'No rules, no order.', translation: '没有规则就没有秩序。' },
        { sentence: "Don't be late for school.", translation: '上学不要迟到。' },
        { sentence: 'Put up your hand if you want to ask your teacher a question.', translation: '如果你想问老师问题,请举手。' },
        { sentence: "Sally mustn't wear her own jacket at school. She has to wear the uniform.", translation: '萨莉在学校不能穿她自己的夹克。她必须穿校服。' },
      ]
    },
    { label: 'Section B 重点单词/短语/句子',
      phrases: [
        { phrase: "make sb's/the bed", meaning: '整理床铺;铺床' }, { phrase: 'hurry to sp', meaning: '匆忙赶到某处' },
        { phrase: 'hang out (with sb)', meaning: '(与某人一起)闲逛' }, { phrase: 'on weekdays', meaning: '在工作日' },
        { phrase: 'focus on', meaning: '集中(注意力等)于' }, { phrase: 'build school spirit', meaning: '树立校风' },
        { phrase: 'too many rules', meaning: '太多规则' }, { phrase: 'practise the violin', meaning: '练习小提琴' },
        { phrase: 'walk the dog', meaning: '遛狗' },
      ],
      sentences: [
        { sentence: "When I'm at school, I mustn't use my phone in class either.", translation: '当我在学校的时候,我也不能在课堂上使用手机。' },
        { sentence: "I know it's hard, but rules can help to make the world better.", translation: '我知道这很难,但规则能帮助让世界变得更美好。' },
      ]
    },
  ],
  essay: { title: 'Rules in My Life', content: 'Rules are everywhere in our lives. I have to follow many rules both at home and at school.\n\nAt home, I have to get up early to read for half an hour before going to school. It\'s tiring but useful. Also, I can\'t watch TV on school nights. I don\'t like this rule because I think watching TV is a good way for me to relax. At school, I can\'t use my mobile phone. It\'s a good rule because it helps me to focus on learning.\n\nI know it\'s hard to follow all the rules, but I will try my best.' }
}

const u3: UnitReference = {
  id: 3, name: 'Unit 3 Keep Fit',
  sections: [
    { label: 'Section A 重点单词',
      words: [
        { word: 'fit', pos: 'adj./v.', meaning: '健康的;适合' }, { word: 'baseball', pos: 'n.', meaning: '棒球(运动)' },
        { word: 'glove', pos: 'n.', meaning: '(手指分开的)手套' }, { word: 'rope', pos: 'n.', meaning: '绳子;粗绳' },
        { word: 'racket', pos: 'n.', meaning: '(网球等的)球拍' }, { word: 'hardly', pos: 'adv.', meaning: '几乎不' },
        { word: 'ever', pos: 'adv.', meaning: '在任何时候;从来' }, { word: 'seldom', pos: 'adv.', meaning: '很少;不常' },
        { word: 'badminton', pos: 'n.', meaning: '羽毛球运动' }, { word: 'practice', pos: 'n.', meaning: '练习;实践' },
        { word: 'perfect', pos: 'adj.', meaning: '完美的;极好的' },
      ]
    },
    { label: 'Section A 词形变换',
      wordForms: [
        { from: 'once', to: 'one(基数词)' }, { from: 'twice', to: 'two(基数词)' },
        { from: 'mine', to: 'my(形容词性物主代词)' }, { from: 'hers', to: 'her(形容词性物主代词)' },
        { from: 'theirs', to: 'their(形容词性物主代词)' },
      ]
    },
    { label: 'Section A 重点短语',
      phrases: [
        { phrase: 'keep fit', meaning: '保持健康' }, { phrase: 'do sport/exercise', meaning: '做运动' },
        { phrase: 'baseball glove', meaning: '棒球手套' }, { phrase: 'jump rope', meaning: '跳绳' },
        { phrase: 'ping-pong bat', meaning: '乒乓球拍' }, { phrase: 'hardly ever', meaning: '几乎从不' },
        { phrase: 'three times a week', meaning: '一周三次' }, { phrase: 'play doubles', meaning: '打双打' },
        { phrase: 'go swimming/jogging', meaning: '去游泳/慢跑' },
      ]
    },
    { label: 'Section A 重点句子',
      sentences: [
        { sentence: '- How often do you play ping-pong? - I play it three times a week.', translation: '-你多久打一次乒乓球? -我每周打三次。' },
        { sentence: '- There is a ping-pong bat here. Is it yours? - No, it isn\'t mine.', translation: '-这里有一个乒乓球拍。是你的吗? -不,它不是我的。' },
        { sentence: 'Practice makes perfect.', translation: '熟能生巧。' },
      ]
    },
    { label: 'Section B 重点',
      phrases: [
        { phrase: 'encourage sb to do sth', meaning: '鼓励某人做某事' }, { phrase: 'work out', meaning: '锻炼' },
        { phrase: 'play many matches', meaning: '打许多比赛' }, { phrase: 'build team spirit', meaning: '培养团队精神' },
        { phrase: 'work as a team', meaning: '团队合作' },
      ],
      sentences: [
        { sentence: 'My skateboard is really cool, and so are theirs.', translation: '我的滑板真的很酷,他们的也是。' },
        { sentence: 'Some tricks are difficult, but once you succeed, you feel great!', translation: '有些技巧很难,但一旦你成功了,你会感觉很棒!' },
        { sentence: 'We work as a team, and we win or lose as a team.', translation: '我们团队合作,无论输赢都共同承担。' },
      ]
    },
  ],
  essay: { title: 'My Favourite Way to Keep Fit', content: "My favourite way to keep fit is to go swimming. I often swim at the gym near my home. Each time, I swim for about an hour with my brother.\n\nI love swimming because it is not only fun, but it also helps me keep strong and healthy. Also, I feel very relaxed when I stay in the water. I think it's a great way to relax my body and mind.\n\nLet's exercise more and make it a part of our lives." }
}

const u4: UnitReference = {
  id: 4, name: 'Unit 4 Eat Well',
  sections: [
    { label: 'Section A 重点单词',
      words: [
        { word: 'watermelon', pos: 'n.', meaning: '西瓜' }, { word: 'cabbage', pos: 'n.', meaning: '卷心菜' },
        { word: 'mutton', pos: 'n.', meaning: '羊肉' }, { word: 'cookie', pos: 'n.', meaning: '曲奇饼' },
        { word: 'onion', pos: 'n.', meaning: '洋葱;葱头' }, { word: 'dumpling', pos: 'n.', meaning: '饺子' },
        { word: 'coffee', pos: 'n.', meaning: '咖啡' }, { word: 'salad', pos: 'n.', meaning: '沙拉' },
        { word: 'porridge', pos: 'n.', meaning: '粥;麦片粥' }, { word: 'taste', pos: 'v./n.', meaning: '有...味道;尝;味道' },
        { word: 'dish', pos: 'n.', meaning: '一道菜;盘子' }, { word: 'menu', pos: 'n.', meaning: '菜单' },
        { word: 'customer', pos: 'n.', meaning: '顾客' },
      ]
    },
    { label: 'Section A 重点短语/句子',
      phrases: [
        { phrase: 'would like to do sth', meaning: '想要做某事' }, { phrase: 'fish and chips', meaning: '炸鱼薯条' },
        { phrase: 'What/How about...?', meaning: '......怎么样?' }, { phrase: 'Beijing roast duck', meaning: '北京烤鸭' },
        { phrase: 'hot pot', meaning: '火锅' }, { phrase: 'go with', meaning: '搭配;相配' },
        { phrase: 'too much', meaning: '太多' },
      ],
      sentences: [
        { sentence: 'What do you usually have for breakfast/lunch/dinner?', translation: '你早餐/午餐/晚餐通常吃什么?' },
        { sentence: 'Which soup would you like, chicken or fish?', translation: '您想要哪种汤,鸡汤还是鱼汤?' },
        { sentence: 'Here is a menu for you.', translation: '这是给您的菜单。' },
      ]
    },
    { label: 'Section B 重点',
      words: [
        { word: 'habit', pos: 'n.', meaning: '习惯' }, { word: 'cause', pos: 'v.', meaning: '造成;导致' },
        { word: 'result', pos: 'n.', meaning: '后果;结果' }, { word: 'enough', pos: 'adj./adv.', meaning: '足够的;足够地' },
      ],
      phrases: [
        { phrase: 'make healthy eating choices', meaning: '做出健康的饮食选择' },
        { phrase: "improve sb's eating habits", meaning: '改善某人的饮食习惯' },
        { phrase: 'put on weight', meaning: '增加体重' }, { phrase: 'fast food', meaning: '快餐' },
        { phrase: 'all kinds of', meaning: '各种各样的' },
      ],
      sentences: [
        { sentence: 'Both what we eat and how we eat are important!', translation: '我们吃什么和怎么吃都很重要!' },
        { sentence: 'After all, an apple a day keeps the doctor away.', translation: '毕竟,一天一苹果,医生远离我。' },
      ]
    },
  ],
  essay: { title: 'My Eating Habits', content: "Eating habits are important for our health, and I have some good eating habits.\n\nI have a big breakfast every day and it gives me enough energy for the morning study. At lunch, I eat rice, some vegetables and a little meat. I never eat too much because it's bad for my health. Also, I try to drink water instead of soft drinks when I get thirsty. However, I sometimes eat fast food like hamburgers. I know it's not healthy, but it's really delicious.\n\nTo keep healthy, I should stick to my good eating habits and try to improve the bad ones." }
}

const u5: UnitReference = {
  id: 5, name: 'Unit 5 Here and Now',
  sections: [
    { label: 'Section A 重点单词',
      words: [
        { word: 'moment', pos: 'n.', meaning: '某个时刻;片刻' }, { word: 'festival', pos: 'n.', meaning: '节日' },
        { word: 'hold', pos: 'v.', meaning: '拿着;抓住' }, { word: 'voice', pos: 'n.', meaning: '嗓音;声音' },
        { word: 'race', pos: 'n.', meaning: '比赛;竞赛' }, { word: 'message', pos: 'n.', meaning: '消息;信息' },
        { word: 'online', pos: 'adj.', meaning: '在线的' }, { word: 'forward', pos: 'adv.', meaning: '向前' },
      ]
    },
    { label: 'Section A 重点短语',
      phrases: [
        { phrase: 'right now', meaning: '现在;立刻' }, { phrase: 'of course', meaning: '当然' },
        { phrase: 'work on', meaning: '做;从事' }, { phrase: 'hold on', meaning: '别挂断电话;等一等' },
        { phrase: 'answer the phone', meaning: '接听电话' }, { phrase: 'take a message', meaning: '捎个口信' },
        { phrase: 'leave a message', meaning: '留个口信' }, { phrase: 'call sb back', meaning: '给某人回电话' },
        { phrase: 'look forward to (doing) sth', meaning: '期盼(做)某事' },
      ]
    },
    { label: 'Section A 重点句子',
      sentences: [
        { sentence: "Sorry, he/she is out at the moment.", translation: '抱歉,他/她现在不在。' },
        { sentence: 'Would you like to leave a message?', translation: '您要留个口信吗?' },
        { sentence: '- What are you doing right now? - I\'m doing my homework.', translation: '-你现在在做什么? -我在写作业。' },
      ]
    },
    { label: 'Section B 重点',
      words: [
        { word: 'happen', pos: 'v.', meaning: '发生' }, { word: 'shine', pos: 'v.', meaning: '发光;照耀' },
        { word: 'market', pos: 'n.', meaning: '市场' }, { word: 'subway', pos: 'n.', meaning: '地铁' },
        { word: 'passenger', pos: 'n.', meaning: '乘客' },
      ],
      phrases: [
        { phrase: 'around the world', meaning: '世界各地' }, { phrase: 'rush to do sth', meaning: '急着做某事' },
        { phrase: 'such as', meaning: '例如' }, { phrase: 'take part in', meaning: '参加' },
        { phrase: 'side by side', meaning: '并排;并肩地' }, { phrase: 'rush hour', meaning: '交通高峰期' },
      ],
      sentences: [
        { sentence: 'What is happening in different time zones around the world right now?', translation: '现在世界各地不同时区正在发生什么?' },
        { sentence: 'Bright yellow taxis are picking up and dropping off passengers.', translation: '明黄色的出租车正在接送乘客。' },
      ]
    },
  ],
  essay: { title: 'A Morning in the Park', content: "It's half past eight in the morning. The weather is sunny and warm. I'm jogging with my sister in the Central Park.\n\nThere are many people in the park and they are doing different things at the moment. Some people are doing exercise, and others are talking on the phone while walking. Look! What's that girl doing? She is taking photos of the lovely ducks in the lake.\n\nWhat a nice morning! People there look like they are having a great time." }
}

const u6: UnitReference = {
  id: 6, name: 'Unit 6 Rain or Shine',
  sections: [
    { label: 'Section A 重点单词/短语',
      words: [
        { word: 'affect', pos: 'v.', meaning: '影响' }, { word: 'dry', pos: 'adj.', meaning: '干的;干旱的' },
        { word: 'lightning', pos: 'n.', meaning: '闪电' }, { word: 'temperature', pos: 'n.', meaning: '温度' },
        { word: 'freezing', pos: 'adj.', meaning: '极冷的;冰冻的' },
      ],
      phrases: [
        { phrase: 'rain or shine', meaning: '不论是雨或是晴;不管发生什么事' },
        { phrase: 'stay in', meaning: '待在家里;没有外出' }, { phrase: 'water flowers', meaning: '浇花' },
        { phrase: 'build a snowman', meaning: '堆雪人' }, { phrase: 'take photos', meaning: '拍照' },
      ],
      sentences: [
        { sentence: "What's the weather like at Grandpa's place?", translation: '爷爷那里的天气怎么样?' },
        { sentence: "How's your holiday going?", translation: '你假期过得怎么样?' },
        { sentence: "- How's the weather? - It's cold and snowy.", translation: '-天气怎么样? -天气寒冷,还下着雪。' },
      ]
    },
    { label: 'Section B 重点单词/短语/句子',
      words: [
        { word: 'although', pos: 'conj.', meaning: '虽然;尽管' }, { word: 'experience', pos: 'n./v.', meaning: '经历;经验;经历' },
        { word: 'through', pos: 'prep.', meaning: '穿过;凭借' }, { word: 'mountain', pos: 'n.', meaning: '山;高山' },
        { word: 'storm', pos: 'n.', meaning: '暴风雨;暴风雪' },
      ],
      phrases: [
        { phrase: 'because of', meaning: '因为' }, { phrase: 'feel like', meaning: '感觉像' },
        { phrase: 'in high spirits', meaning: '情绪高涨;兴高采烈' }, { phrase: 'make good progress', meaning: '取得不错的进展' },
        { phrase: 'pour down', meaning: '(雨)倾盆而下' },
      ],
      sentences: [
        { sentence: 'Although the weather is bad, many people here are still in high spirits.', translation: '虽然天气不好,但这里的许多人仍然情绪高涨。' },
        { sentence: "I'm tired and hungry, but it feels good to be at the top!", translation: '我又累又饿,但站在山顶感觉很不错!' },
      ]
    },
  ],
  essay: { title: 'A Sudden Rain', content: "Today is Sunday. I'm walking in the street to buy books when the weather suddenly turns bad. The sky is getting dark and strong winds are blowing hard. Soon, heavy rain is pouring down.\n\nPeople are hurrying in the street. Some are running into nearby shops, and others are trying to call a taxi. I am putting my bag on my head and running to the bookshop. The rain is so heavy that my shoes are all wet!\n\nAfter a few minutes, the rain stops and the sky looks bright." }
}

const u7: UnitReference = {
  id: 7, name: 'Unit 7 A Day to Remember',
  sections: [
    { label: 'Section A 重点单词/短语',
      words: [
        { word: 'museum', pos: 'n.', meaning: '博物馆' }, { word: 'exhibition', pos: 'n.', meaning: '展览' },
        { word: 'direction', pos: 'n.', meaning: '方向' }, { word: 'trip', pos: 'n.', meaning: '旅行' },
        { word: 'machine', pos: 'n.', meaning: '机器' }, { word: 'terrible', pos: 'adj.', meaning: '糟糕的' },
        { word: 'realize', pos: 'v.', meaning: '认识到;实现' },
      ],
      phrases: [
        { phrase: 'meet up with friends', meaning: '与朋友碰头、相聚' }, { phrase: 'give directions', meaning: '指示方向' },
        { phrase: 'go on a trip', meaning: '去旅行' }, { phrase: 'too...to do sth', meaning: '太......以至于不能做某事' },
        { phrase: 'used to do sth', meaning: '过去常常做某事' },
      ],
      sentences: [
        { sentence: 'We saw the plant make dirty water clean again.', translation: '我们看到工厂把脏水又变干净了。' },
        { sentence: 'It was a day to remember, and it made me want to work hard for a better future too.', translation: '这是一个值得铭记的日子,并且它也让我想要为更美好的未来而努力奋斗。' },
      ]
    },
    { label: 'Section B 重点',
      words: [
        { word: 'explore', pos: 'v.', meaning: '探索' }, { word: 'tent', pos: 'n.', meaning: '帐篷' },
        { word: 'fresh', pos: 'adj.', meaning: '新鲜的' }, { word: 'diary', pos: 'n.', meaning: '日记;日记本' },
      ],
      phrases: [
        { phrase: 'keep a diary', meaning: '写日记' }, { phrase: 'write down', meaning: '写下;记下' },
        { phrase: 'get straight to work', meaning: '直接去干活' },
      ],
      sentences: [
        { sentence: 'The farmer told us about how these fruits and vegetables go from the fields to our tables.', translation: '农民告诉我们这些水果和蔬菜是如何从田地里到我们的餐桌上的。' },
        { sentence: 'Every grain comes from hard work.', translation: '粒粒皆辛苦。' },
        { sentence: 'What a day!', translation: '多么(难忘的)一天啊!' },
      ]
    },
  ],
  essay: { title: 'A School Trip', content: "Last weekend we went on a school trip to the art museum. It was sunny and we were all excited. Our teacher showed us around and told us stories behind some famous paintings. I took many photos of the beautiful works.\n\nWe also took part in a drawing activity for students. To my surprise, the teacher praised my work. At noon, we had lunch together in the museum's garden and shared snacks. We left the museum at three in the afternoon.\n\nThe trip was a little tiring but interesting. What a great day to remember!" }
}

const u8: UnitReference = {
  id: 8, name: 'Unit 8 Once upon a Time',
  sections: [
    { label: 'Section A 重点单词/短语',
      words: [
        { word: 'upon', pos: 'prep.', meaning: '在......上' }, { word: 'net', pos: 'n.', meaning: '网;网状物' },
        { word: 'promise', pos: 'v./n.', meaning: '承诺;保证;诺言' }, { word: 'war', pos: 'n.', meaning: '战争' },
        { word: 'neighbour', pos: 'n.', meaning: '邻居' }, { word: 'wise', pos: 'adj.', meaning: '明智的;高明的' },
        { word: 'emperor', pos: 'n.', meaning: '皇帝' }, { word: 'pretend', pos: 'v.', meaning: '假装' },
        { word: 'silly', pos: 'adj.', meaning: '愚蠢的;傻的' }, { word: 'truth', pos: 'n.', meaning: '真相;事实' },
      ],
      phrases: [
        { phrase: 'once upon a time', meaning: '从前;很久以前' }, { phrase: 'tell the truth', meaning: '说实话' },
        { phrase: 'long ago', meaning: '很久以前' }, { phrase: 'decide to do sth', meaning: '决定做某事' },
        { phrase: 'pretend to do sth', meaning: '假装做某事' }, { phrase: 'be afraid to do sth', meaning: '害怕做某事' },
      ],
      sentences: [
        { sentence: 'What lovely clothes!', translation: '多么美丽的衣服啊!' },
        { sentence: 'We can make a lot of money by lying to the emperor.', translation: '我们可以通过向皇帝撒谎来赚很多钱。' },
        { sentence: "That can't be true!", translation: '那不可能是真的!' },
      ]
    },
    { label: 'Section B 重点单词/短语',
      words: [
        { word: 'ugly', pos: 'adj.', meaning: '丑陋的' }, { word: 'swan', pos: 'n.', meaning: '天鹅' },
        { word: 'feather', pos: 'n.', meaning: '羽毛' }, { word: 'fisherman', pos: 'n.', meaning: '渔夫' },
        { word: 'genie', pos: 'n.', meaning: '妖怪;鬼' }, { word: 'rich', pos: 'adj.', meaning: '富有的' },
        { word: 'powerful', pos: 'adj.', meaning: '强大的;有影响力的' },
      ],
      phrases: [
        { phrase: 'laugh at sb', meaning: '嘲笑某人' }, { phrase: 'search for', meaning: '寻找' },
        { phrase: 'set...free', meaning: '释放' }, { phrase: "to sb's surprise", meaning: '出乎某人的意料' },
        { phrase: 'succeed in doing sth', meaning: '成功做成某事' },
      ],
      sentences: [
        { sentence: 'What an ugly duckling!', translation: '多么丑的小鸭子啊!' },
        { sentence: 'If anyone set me free, I would kill them instead of giving them anything.', translation: '若有谁放了我,我非但不会给他们任何东西,反而会杀了他们。' },
      ]
    },
  ],
  essay: { title: 'The Fisherman and the Genie', content: "The fisherman felt scared but quickly calmed down. \"Wait a minute!\" he said. \"The bottle is so small - How could a big genie like you fit inside it?\"\n\nThe genie laughed and shouted, \"Watch this!\" He turned back into a cloud and fit into the bottle. Before he could come out again, the fisherman picked up the bottle and closed it tightly.\n\n\"Now you can stay in the bottle forever!\" the fisherman said. The genie asked the fisherman to set him free and promised to make him rich, but the fisherman didn't believe him anymore. He just threw the bottle back into the sea." }
}

export const UNIT_REFERENCES: UnitReference[] = [u1, u2, u3, u4, u5, u6, u7, u8]
