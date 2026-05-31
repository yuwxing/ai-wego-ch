import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Save, Trash2, Edit3, Eye, Loader2, Check, AlertCircle, ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { getApiKey } from '../../utils/deepseek';

const SUPABASE_URL = 'https://mzjmfyoemcsoqzoooiej.supabase.co/rest/v1/';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16am1meW9lbWNzb3F6b29vaWVqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzQ5MDgwMCwiZXhwIjoyMDkzMDY2ODAwfQ.BaovYmOpmOANyo6fmSPKV1FwNwLWlkVVSa7r8KsaMtM';

const DEEPSEEK_URL = 'https://api.deepseek.com/v1/chat/completions';

const TOPIC_CATEGORIES = [
  {
    name: '人与自我',
    topics: ['个人情况与成长', '家庭与亲友', '学校生活', '兴趣爱好', '情感与压力调节', '计划与愿望', '健康与安全']
  },
  {
    name: '人与社会',
    topics: ['社会交往与公益', '文化习俗与节日', '历史人物与励志', '科技与AI', '家乡与环境保护', '文娱体育', '语言学习']
  },
  {
    name: '人与自然',
    topics: ['天气与季节', '动植物', '环保与低碳', '宇宙与太空探索', '自然灾害与防护', '可持续发展']
  }
];

const DIFFICULTY_LEVELS = ['基础', '中等', '较难'];

interface DailyItem {
  id: number;
  title: string;
  description: string;
  created_at: string;
}

export default function DailyEnglishAdmin() {
  const navigate = useNavigate();
  const [items, setItems] = useState<DailyItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);

  const [topicCategory, setTopicCategory] = useState('人与自我');
  const [topic, setTopic] = useState('个人情况与成长');
  const [difficulty, setDifficulty] = useState('中等');
  const [customTopic, setCustomTopic] = useState('');

  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editableContent, setEditableContent] = useState('');

  const loadItems = async () => {
    setLoading(true);
    try {
      const resp = await fetch(`${SUPABASE_URL}tasks?status=eq.english_daily_middle&select=id,title,description,created_at&order=id.desc&limit=50`, {
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      setItems(data || []);
    } catch (e: any) {
      toast.error('加载失败: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadItems(); }, []);

  const generateContent = async () => {
    const finalTopic = customTopic || topic;
    if (!finalTopic) { toast.error('请选择或输入主题'); return; }
    const apiKey = getApiKey();
    if (!apiKey) { toast.error('请先在"系统中心 → API密钥"中配置你自己的DeepSeek API密钥'); setGenerating(false); return; }
    setGenerating(true);
    setGeneratedContent(null);
    try {
      const prompt = `你是一名广东省初中英语教研员，精通中考命题。请以 China Daily / 21st Century 风格，为初中生生成一份"每日英语"学习材料。

主题类别：${topicCategory}
具体主题：${finalTopic}
难度：${difficulty}
话题范围：${topicCategory === '人与自我' ? '个人成长、家庭、学校、兴趣、情感、健康等' : topicCategory === '人与社会' ? '社会文化、科技、历史、环保、体育等' : '自然环境、生态保护、宇宙探索等'}
素材风格：借鉴 China Daily 和 21st Century 的短篇新闻报道，语言地道、贴近中考阅读

请输出严格 JSON 格式，不要包含其他文字，确保内容适合广东省中考英语难度：

\`\`\`json
{
  "date": "${new Date().toISOString().slice(0, 10)}",
  "title_cn": "中文标题（与${finalTopic}相关）",
  "title_en": "English Title",
  "source": "China Daily / 21st Century",
  "article": "一篇180-250词的英语短文，与主题相关，语言地道，包含中考核心词汇",
  "translation": "上述短文的中文翻译",
  "vocabulary": [
    { "word": "重点词汇1", "phonetic": "/音标/", "meaning": "中文释义", "example": "英文章句" },
    { "word": "重点词汇2", "phonetic": "/音标/", "meaning": "中文释义", "example": "英文章句" },
    { "word": "重点词汇3", "phonetic": "/音标/", "meaning": "中文释义", "example": "英文章句" },
    { "word": "重点词汇4", "phonetic": "/音标/", "meaning": "中文释义", "example": "英文章句" },
    { "word": "重点词汇5", "phonetic": "/音标/", "meaning": "中文释义", "example": "英文章句" },
    { "word": "重点词汇6", "phonetic": "/音标/", "meaning": "中文释义", "example": "英文章句" }
  ],
  "grammar": {
    "topic": "语法点名称（如：一般现在时）",
    "rules": ["规则1", "规则2", "规则3"],
    "examples": ["例句1", "例句2", "例句3"]
  },
  "reading_questions": [
    { "question": "阅读理解题1？", "options": ["A选项", "B选项", "C选项", "D选项"], "answer": "A" },
    { "question": "阅读理解题2？", "options": ["A选项", "B选项", "C选项", "D选项"], "answer": "B" },
    { "question": "阅读理解题3？", "options": ["A选项", "B选项", "C选项", "D选项"], "answer": "C" },
    { "question": "阅读理解题4？", "options": ["A选项", "B选项", "C选项", "D选项"], "answer": "D" }
  ],
  "writing": {
    "topic": "写作题目（与主题相关）",
    "requirements": ["要求1", "要求2", "要求3"],
    "tips": ["写作提示1", "写作提示2", "写作提示3"],
    "word_range": "80-100"
  }
}
\`\`\`

要求：
1. 文章内容积极向上，符合初中生认知水平
2. 阅读理解4道题涵盖主旨大意、细节理解、推理判断、词义猜测
3. 词汇选自广东中考高频词
4. 语法讲解与文章中的语法点一致
5. 写作题目与主题相关，贴近中考题型`;

      const resp = await fetch(DEEPSEEK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.8,
          max_tokens: 4096,
        }),
      });

      if (!resp.ok) {
        const err = await resp.text();
        throw new Error(`API ${resp.status}: ${err}`);
      }

      const json = await resp.json();
      const text = json.choices?.[0]?.message?.content || '';
      const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
      const raw = jsonMatch ? jsonMatch[1].trim() : text.trim();
      JSON.parse(raw);
      setGeneratedContent(raw);
      setEditableContent(raw);
      setEditMode(true);
      toast.success('生成成功，请检查并编辑');
    } catch (e: any) {
      toast.error('生成失败: ' + e.message);
    } finally {
      setGenerating(false);
    }
  };

  const saveContent = async () => {
    let parsed: any;
    try {
      parsed = JSON.parse(editableContent);
    } catch {
      toast.error('JSON 格式错误，无法保存');
      return;
    }
    setSaving(true);
    try {
      const title = `每日英语 - ${topicCategory} - ${customTopic || topic}`;
      const resp = await fetch(`${SUPABASE_URL}tasks`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        },
        body: JSON.stringify({
          title,
          description: JSON.stringify(parsed),
          status: 'english_daily_middle',
          publisher_id: 1,
          budget: 0,
          created_at: new Date().toISOString(),
        }),
      });
      if (!resp.ok) {
        const err = await resp.text();
        throw new Error(`保存失败: ${err}`);
      }
      toast.success('已保存到 Supabase');
      setGeneratedContent(null);
      setEditMode(false);
      loadItems();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteItem = async (id: number) => {
    if (!confirm('确定删除这条内容？')) return;
    try {
      const resp = await fetch(`${SUPABASE_URL}tasks?id=eq.${id}`, {
        method: 'DELETE',
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` },
      });
      if (!resp.ok) throw new Error(`删除失败: HTTP ${resp.status}`);
      toast.success('已删除');
      loadItems();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const previewItem = (desc: string) => {
    try {
      const parsed = JSON.parse(desc);
      toast(
        `标题: ${parsed.title_cn}\n文章: ${parsed.article?.substring(0, 60)}...\n词汇: ${parsed.vocabulary?.length || 0}个\n阅读: ${parsed.reading_questions?.length || 0}题`,
        { duration: 5000 }
      );
    } catch {
      toast('无法预览');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white pb-20">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="text-[#64748B] hover:text-[#1E293B] transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-[#1E293B]">每日英语内容管理</h1>
          <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">管理员</span>
          <div className="flex-1" />
          <button
            onClick={() => navigate('/admin/listening-speaking')}
            className="px-3 py-1.5 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors font-medium"
          >
            听说训练 →
          </button>
          <button
            onClick={() => navigate('/admin/job-square')}
            className="px-3 py-1.5 text-sm bg-violet-100 text-violet-700 rounded-lg hover:bg-violet-200 transition-colors font-medium"
          >
            求职广场 →
          </button>
        </div>

        {/* 生成区域 */}
        <div className="bg-white rounded-2xl border border-emerald-200 p-5 mb-6">
          <h2 className="font-bold text-[#1E293B] mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-500" />
            AI 生成每日英语内容
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div>
              <label className="block text-xs font-medium text-[#64748B] mb-1.5">话题类别</label>
              <select
                value={topicCategory}
                onChange={e => {
                  const cat = e.target.value;
                  setTopicCategory(cat);
                  const first = TOPIC_CATEGORIES.find(c => c.name === cat)?.topics[0] || '';
                  setTopic(first);
                }}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-emerald-300 bg-white"
              >
                {TOPIC_CATEGORIES.map(c => (
                  <option key={c.name} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#64748B] mb-1.5">具体话题</label>
              <select
                value={topic}
                onChange={e => setTopic(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-emerald-300 bg-white"
              >
                {TOPIC_CATEGORIES.find(c => c.name === topicCategory)?.topics.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#64748B] mb-1.5">自定义主题</label>
              <input
                type="text"
                value={customTopic}
                onChange={e => setCustomTopic(e.target.value)}
                placeholder="留空则使用话题"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-emerald-300"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#64748B] mb-1.5">难度</label>
              <select
                value={difficulty}
                onChange={e => setDifficulty(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-emerald-300 bg-white"
              >
                {DIFFICULTY_LEVELS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={generateContent}
            disabled={generating}
            className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
          >
            {generating ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> AI 生成中...</>
            ) : (
              <><Sparkles className="w-5 h-5" /> 一键生成每日英语</>
            )}
          </button>
        </div>

        {/* 编辑区域 */}
        {editMode && (
          <div className="bg-white rounded-2xl border border-emerald-200 p-5 mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-[#1E293B] flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-emerald-500" />
                编辑内容
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => { setEditMode(false); setGeneratedContent(null); }}
                  className="px-3 py-1.5 text-sm text-[#64748B] hover:text-[#1E293B] border border-slate-200 rounded-lg"
                >
                  取消
                </button>
                <button
                  onClick={saveContent}
                  disabled={saving}
                  className="px-4 py-1.5 text-sm bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-1.5"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? '保存中...' : '保存到 Supabase'}
                </button>
              </div>
            </div>
            <textarea
              value={editableContent}
              onChange={e => setEditableContent(e.target.value)}
              className="w-full h-80 px-4 py-3 border border-slate-200 rounded-xl text-sm font-mono outline-none focus:border-emerald-300 resize-y"
            />
            {(() => {
              try { JSON.parse(editableContent); return <div className="mt-2 text-xs text-green-600 flex items-center gap-1"><Check className="w-3 h-3" /> JSON 格式正确</div>; }
              catch { return <div className="mt-2 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> JSON 格式错误，无法保存</div>; }
            })()}
          </div>
        )}

        {/* 已保存内容列表 */}
        <div className="bg-white rounded-2xl border border-slate-200">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-[#1E293B] flex items-center gap-2">
              <Save className="w-4 h-4 text-slate-400" />
              已保存的内容
              <span className="text-xs text-[#94A3B8] font-normal">({items.length} 条)</span>
            </h2>
            <button onClick={loadItems} disabled={loading} className="text-xs text-emerald-600 hover:text-emerald-700 disabled:opacity-50">
              {loading ? '刷新中...' : '刷新'}
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12 text-[#94A3B8] text-sm">
              暂无每日英语内容，点击上方按钮生成
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {items.map((item) => (
                <div key={item.id} className="px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex-1 min-w-0 mr-4">
                    <div className="font-medium text-[#1E293B] text-sm truncate">{item.title}</div>
                    <div className="text-xs text-[#94A3B8] mt-0.5">ID: {item.id} · {item.created_at?.slice(0, 10)}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => previewItem(item.description)}
                      className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-[#64748B] hover:bg-slate-200 transition-colors"
                      title="预览"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-400 hover:bg-red-100 hover:text-red-600 transition-colors"
                      title="删除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
