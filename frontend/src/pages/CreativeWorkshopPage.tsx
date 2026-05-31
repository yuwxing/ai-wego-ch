import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Copy, Check, Sparkles, PenTool, Image, Video, Music, Gamepad2 } from 'lucide-react';

type Category = 'teaching' | 'text' | 'image' | 'video' | 'audio' | 'interactive';

interface Template {
  id: string;
  title: string;
  desc?: string;
  prompt: string;
  note?: string;
  gradient: string;
}

const categories: { key: Category; label: string; icon: React.ReactNode; color: string }[] = [
  { key: 'teaching', label: '教学图片生成', icon: <Image className="w-4 h-4" />, color: 'from-emerald-400 to-teal-400' },
  { key: 'text', label: '文字创作', icon: <PenTool className="w-4 h-4" />, color: 'from-violet-400 to-purple-400' },
  { key: 'image', label: '图像创作', icon: <Image className="w-4 h-4" />, color: 'from-pink-400 to-rose-400' },
  { key: 'video', label: '视频动画', icon: <Video className="w-4 h-4" />, color: 'from-blue-400 to-cyan-400' },
  { key: 'audio', label: '音频创作', icon: <Music className="w-4 h-4" />, color: 'from-amber-400 to-orange-400' },
  { key: 'interactive', label: '互动工具', icon: <Gamepad2 className="w-4 h-4" />, color: 'from-red-400 to-pink-400' },
];

const teachingTemplates: Template[] = [
  { id: 't1', title: '教学课件配图', prompt: 'A cute cartoon style illustration for a middle school [subject] class, showing [concept], bright colors, educational, friendly characters, clean white background, 2D flat illustration --ar 16:9 --v 6', gradient: 'from-emerald-400 to-teal-400', note: '把[subject]替换为科目，[concept]替换为知识点' },
  { id: 't2', title: '古诗词意境图', prompt: 'Chinese ink wash painting, misty mountains, ancient pavilion, plum blossoms, moonlit night, poem scene illustration, traditional Chinese art style, soft colors, poetic atmosphere --ar 3:4 --v 6', gradient: 'from-cyan-400 to-blue-400' },
  { id: 't3', title: '英语单词卡片', prompt: 'A cute educational flashcard for the English word "[word]", showing a cartoon illustration of [meaning], bright colorful background, large clear text, kids learning style --ar 3:4 --v 6', gradient: 'from-sky-400 to-indigo-400', note: '把[word]替换为单词，[meaning]替换为对应的图案描述' },
  { id: 't4', title: '历史人物肖像', prompt: 'Portrait of [name], ancient Chinese [dynasty] dynasty, wearing traditional court attire, dignified expression, classical Chinese painting style, subtle colors, historical figure illustration --ar 3:4 --v 6', gradient: 'from-amber-400 to-yellow-400', note: '把[name]和[dynasty]替换为具体人物和朝代' },
  { id: 't5', title: '科学实验示意图', prompt: 'A clear educational diagram showing a [experiment] experiment, laboratory equipment, glass beakers, colorful liquids, step labels, science textbook style, clean white background, isometric view --ar 16:9 --v 6', gradient: 'from-teal-400 to-emerald-400', note: '把[experiment]替换为实验名称' },
  { id: 't6', title: '数学几何图', prompt: 'Abstract geometric shapes, colorful polygons, 3D mathematical forms, platonic solids with gradient colors, educational illustration, clean modern style, glowing edges, dark background --ar 16:9 --v 6', gradient: 'from-purple-400 to-fuchsia-400' },
];

const textTemplates: Template[] = [
  { id: 'text1', title: '奇幻冒险故事', prompt: '请写一个800字的奇幻冒险故事，主角是14岁的初中生，名字叫林小雨。故事发生在暑假的外婆家，主角拥有能听懂动物说话的能力。故事需要包含：1. 一只受伤的狐狸突然开口说话 2. 森林里的古老魔法正在消失 3. 一个会飞的猫头鹰成为向导 4. 主角用勇气拯救了森林。语言风格要活泼有趣，适合中学生阅读。', gradient: 'from-violet-400 to-purple-400' },
  { id: 'text2', title: '毕业季诗歌', prompt: '请写一首16行的现代诗，主题是毕业季。要求：使用教室、黑板、操场、校服的意象，表达不舍与期待的复杂情感，每句7-10字左右，不押韵。', gradient: 'from-fuchsia-400 to-purple-400' },
  { id: 'text3', title: '校园幽默短文', prompt: '请以课间十分钟为背景，写一篇幽默短文，主角是我们班的数学老师。内容要包含：1. 老师被粉笔头砸中 2. 同学们假装认真看书 3. 老师最后也笑了。字数：500字，语言风格：轻松幽默。', gradient: 'from-pink-400 to-rose-400' },
  { id: 'text4', title: '歌词创作', prompt: '请模仿周杰伦的风格，写一首关于青春校园的歌词。结构：主歌1+预副歌+副歌+主歌2+预副歌+副歌+桥段+副歌。语言要青春伤感，适合中学生演唱。', gradient: 'from-indigo-400 to-purple-400' },
];

const imageTemplates: Template[] = [
  { id: 'img1', title: '创意头像', prompt: '一个可爱的魔法少女头像，开心微笑，穿着星星魔法袍，动漫二次元风格，色彩明亮，线条简洁，圆形构图 --ar 1:1 --v 6', gradient: 'from-pink-400 to-rose-400' },
  { id: 'img2', title: '校园活动海报', prompt: '校园运动会宣传海报，画面主体是奔跑的中学生，青春活力风格，主色调为橙色和蓝色，文字区域在上方和下方，适合添加标题和比赛时间 --ar 3:4 --v 6', gradient: 'from-orange-400 to-red-400' },
  { id: 'img3', title: '表情包', prompt: '一只胖橘猫，抱着奶茶一脸满足，Q版卡通风格，暖色调，白色背景，表情包风格，粗黑线条 --ar 1:1 --v 6', gradient: 'from-amber-400 to-yellow-400' },
  { id: 'img4', title: '角色设计', prompt: '16岁的魔法少女，银色长发双马尾，紫色大眼睛，穿着白色魔法裙，手持星星魔法棒，站在星空下的魔法城堡前，动漫二次元风格，光影细腻，细节丰富，全身像 --ar 3:4 --v 6', gradient: 'from-fuchsia-400 to-purple-400' },
  { id: 'img5', title: '幻想场景', prompt: '漂浮的空中岛屿，瀑布从云端倾泻而下，彩虹横跨天际，水晶城堡在阳光下闪耀，奇幻风格，广角镜头，细节丰富，梦幻光线 --ar 16:9 --v 6', gradient: 'from-cyan-400 to-blue-400' },
];

const videoTemplates: Template[] = [
  { id: 'v1', title: '动画短片脚本', prompt: '请生成一段10秒的动画视频画面描述：一只小猫在草地上追蝴蝶，蝴蝶飞到花朵上，小猫轻轻闻了闻花朵。风格：Q版卡通。运镜：缓慢推镜头。背景音乐：轻快的钢琴曲。', gradient: 'from-blue-400 to-cyan-400' },
  { id: 'v2', title: '科普短视频脚本', prompt: '请帮我制作一个关于"为什么天空是蓝色的"的科普短视频脚本，时长30秒。结构：1. 开头（0-5秒）："你有没有想过，为什么天空是蓝色的？" 2. 中间（5-25秒）：分3点讲解光的散射原理 3. 结尾（25-30秒）："现在你知道了吧！你还想知道什么？评论区告诉我！" 语言风格：通俗易懂，活泼有趣。', gradient: 'from-sky-400 to-blue-400' },
  { id: 'v3', title: '创意混剪脚本', prompt: '请帮我把一段校园生活照片和视频素材制作成一个15秒的短视频。要求：添加闪光特效，背景音乐用轻快节奏，卡点剪辑，添加白色字幕。', gradient: 'from-indigo-400 to-violet-400' },
];

const audioTemplates: Template[] = [
  { id: 'a1', title: '治愈配音', prompt: '请用温柔的少女音，朗读以下文字："清晨的阳光透过树叶洒在小路上，鸟儿在枝头唱着歌，空气中弥漫着花香。新的一天开始了，愿你今天也有好心情。" 语速：稍慢，情感：温暖治愈。', gradient: 'from-amber-400 to-orange-400' },
  { id: 'a2', title: '轻音乐创作', prompt: '请创作一首60秒的轻音乐，主题是雨后的校园，情绪：平静清新，乐器：钢琴+小提琴。', gradient: 'from-yellow-400 to-amber-400' },
  { id: 'a3', title: '校园广播稿', prompt: '请用青春活力的声音朗读一段校园广播开场白，语速适中，情感积极向上。内容包含：天气提醒、校园新闻预告、点歌环节介绍。', gradient: 'from-orange-400 to-red-400' },
];

const interactiveTemplates: Template[] = [
  { id: 'i1', title: '学霸同桌AI', prompt: '请你扮演我的学霸同桌，名字叫李明。你的性格是：聪明、耐心、有点毒舌但心地善良。你的爱好是：数学、物理、打篮球。你和我的关系是：最好的朋友，经常帮我补习功课。说话风格：简洁明了，偶尔会吐槽我。记住你的身份，不要说你是AI。', gradient: 'from-red-400 to-pink-400' },
  { id: 'i2', title: '知识点总结', prompt: '请帮我总结八年级物理"光的折射"章节的知识点，要求：1. 分点列出 2. 突出重点和难点 3. 用中学生能理解的语言 4. 最后附上3道典型例题。', gradient: 'from-rose-400 to-pink-400' },
  { id: 'i3', title: '错题分析', prompt: '请帮我分析这道错题：[在此粘贴题目和你的错误答案]。要求：1. 指出错误原因 2. 给出正确的解题步骤 3. 总结这类题的解题技巧 4. 出一道类似的题目让我练习。', gradient: 'from-pink-400 to-fuchsia-400' },
  { id: 'i4', title: '猜成语游戏', prompt: '请帮我设计一个猜成语小游戏，适合中学生玩。游戏名称：成语大挑战。游戏规则：1. 系统随机给出一个成语的意思 2. 玩家在10秒内猜出这个成语 3. 猜对得10分，猜错不扣分。请给出详细的设计方案，包括游戏界面、玩法、得分规则、关卡设置等。', gradient: 'from-red-400 to-rose-400' },
];

const allTemplates: Record<Category, Template[]> = {
  teaching: teachingTemplates,
  text: textTemplates,
  image: imageTemplates,
  video: videoTemplates,
  audio: audioTemplates,
  interactive: interactiveTemplates,
};

export default function CreativeWorkshopPage() {
  const [activeTab, setActiveTab] = useState<Category>('teaching');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {}
  };

  const templates = allTemplates[activeTab];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-indigo-50">
      {/* 顶部 */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white">
        <div className="max-w-5xl mx-auto px-5 pt-8 pb-14">
          <Link to="/" className="inline-flex items-center gap-1.5 text-white/70 hover:text-white mb-4 text-sm">
            <ArrowLeft className="w-4 h-4" /> 返回首页
          </Link>
          <div className="flex items-center gap-2 text-white/70 text-sm mb-2">
            <Sparkles className="w-4 h-4" />
            <span>创作工坊</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-1">创作工坊</h1>
          <p className="text-white/80 text-sm sm:text-base">AI创作 · 复制模板即可使用</p>
        </div>
      </div>

      {/* Tab导航 */}
      <div className="max-w-5xl mx-auto px-4 -mt-6 mb-6">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-1.5 overflow-x-auto">
          <div className="flex gap-1.5">
            {categories.map(cat => (
              <button
                key={cat.key}
                onClick={() => setActiveTab(cat.key)}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap flex-1 justify-center ${
                  activeTab === cat.key
                    ? `bg-gradient-to-r ${cat.color} text-white shadow-md`
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                }`}
              >
                {cat.icon}
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 模板卡片 */}
      <div className="max-w-5xl mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {templates.map(t => (
            <div key={t.id} className="group relative">
              <div className={`absolute -inset-0.5 rounded-2xl bg-gradient-to-r ${t.gradient} opacity-0 group-hover:opacity-20 blur-md transition-opacity duration-500`} />
              <div className="relative bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                {/* 顶部分类色条 */}
                <div className={`h-1.5 bg-gradient-to-r ${t.gradient}`} />
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-slate-800 text-sm">{t.title}</h3>
                    <button
                      onClick={() => handleCopy(t.prompt, t.id)}
                      className={`flex-shrink-0 ml-2 p-1.5 rounded-lg transition-all ${
                        copiedId === t.id
                          ? 'bg-emerald-100 text-emerald-600'
                          : 'bg-slate-100 text-slate-400 hover:bg-indigo-100 hover:text-indigo-600'
                      }`}
                      title="复制模板"
                    >
                      {copiedId === t.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  {t.note && (
                    <p className="text-xs text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg mb-2">{t.note}</p>
                  )}
                  <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100">
                    <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap font-mono">{t.prompt}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 空状态 */}
        {templates.length === 0 && (
          <div className="text-center py-16 text-slate-400">
            <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>暂无模板</p>
          </div>
        )}
      </div>
    </div>
  );
}
