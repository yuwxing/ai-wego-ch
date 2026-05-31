import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Save, Trash2, Edit3, Plus, Eye, Loader2, Check, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { getApiKey } from '../../utils/deepseek';

const SUPABASE_URL = 'https://mzjmfyoemcsoqzoooiej.supabase.co/rest/v1/';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16am1meW9lbWNzb3F6b29vaWVqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzQ5MDgwMCwiZXhwIjoyMDkzMDY2ODAwfQ.BaovYmOpmOANyo6fmSPKV1FwNwLWlkVVSa7r8KsaMtM';

const DEEPSEEK_URL = 'https://api.deepseek.com/v1/chat/completions';

const GRADE_OPTIONS = [
  { value: '7a', label: '七年级上册（新人教2024版）' },
  { value: '7b', label: '七年级下册（新人教2024版）' },
  { value: '8a', label: '八年级上册' },
  { value: '8b', label: '八年级下册' },
  { value: '9', label: '九年级' },
];

const GRADE_UNITS: Record<string, string[]> = {
  '7a': ['Unit 1 You and Me', 'Unit 2 We\'re Family!', 'Unit 3 My School', 'Unit 4 My Favourite Subject', 'Unit 5 Fun Clubs', 'Unit 6 A Day in the Life', 'Unit 7 Happy Birthday!'],
  '7b': ['Unit 1 Animal Friends', 'Unit 2 No Rules, No Order', 'Unit 3 Keep Fit', 'Unit 4 Eat Well', 'Unit 5 Here and Now', 'Unit 6 Rain or Shine', 'Unit 7 A Trip to the Zoo', 'Unit 8 Once Upon a Time'],
  '8a': ['Unit 1 Where did you go on vacation?', 'Unit 2 How often do you exercise?', 'Unit 3 I\'m more outgoing than my sister', 'Unit 4 What\'s the best movie theater?', 'Unit 5 Do you want to watch a game show?', 'Unit 6 I\'m going to study computer science', 'Unit 7 Will people have robots?', 'Unit 8 How do you make a banana milk shake?'],
  '8b': ['Unit 1 What\'s the matter?', 'Unit 2 I\'ll help to clean up the city parks', 'Unit 3 Could you please clean your room?', 'Unit 4 Why don\'t you talk to your parents?', 'Unit 5 What were you doing when the rainstorm came?', 'Unit 6 An old man tried to move the mountains', 'Unit 7 What\'s the highest mountain in the world?', 'Unit 8 Have you read Treasure Island yet?', 'Unit 9 Have you ever been to a museum?', 'Unit 10 I\'ve had this bike for three years'],
  '9': ['Unit 1 How can we become good learners?', 'Unit 2 I think that mooncakes are delicious!', 'Unit 3 Could you please tell me where the restrooms are?', 'Unit 4 I used to be afraid of the dark.', 'Unit 5 What are the shirts made of?', 'Unit 6 When was it invented?', 'Unit 7 Teenagers should be allowed to choose their own clothes.', 'Unit 8 It must belong to Carla.', 'Unit 9 I like music that I can dance to.', 'Unit 10 You\'re supposed to shake hands.'],
};

const DIFFICULTY_LEVELS = ['基础', '中等', '较难'];

interface LSItem {
  id: number;
  title: string;
  description: string;
}

export default function ListeningSpeakingAdmin() {
  const navigate = useNavigate();
  const [items, setItems] = useState<LSItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);

  const [grade, setGrade] = useState('7a');
  const [unit, setUnit] = useState(GRADE_UNITS['7a'][0]);
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('中等');

  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editableContent, setEditableContent] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);

  const loadItems = async () => {
    setLoading(true);
    try {
      const resp = await fetch(`${SUPABASE_URL}tasks?status=eq.ls_daily&select=id,title,description&order=id.desc&limit=50`, {
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
    if (!unit && !topic) { toast.error('请选择单元或输入主题'); return; }
    const apiKey = getApiKey();
    if (!apiKey) { toast.error('请先在"系统中心 → API密钥"中配置DeepSeek API密钥'); setGenerating(false); return; }
    setGenerating(true);
    setGeneratedContent(null);
    try {
      const gradeLabel = GRADE_OPTIONS.find(g => g.value === grade)?.label || grade;
      const prompt = `你是一位广东省初中英语听说训练命题专家。请为${gradeLabel}的"${unit}"生成一套完整的英语听说训练题。

要求：
1. 严格按照广东省新教材中考听说考试题型（Part A-D）
2. 内容难度：${difficulty}
3. 主题关键词：${topic || unit}
4. 所有对话和短文用英文，题目说明用中文

请输出严格的JSON格式，不要包含任何其他文字：
\`\`\`json
{
  "date": "2026-05-27",
  "title_cn": "${unit}",
  "title_en": "${unit.replace('Unit ', 'Unit ')}",
  "source": "${gradeLabel} 听说训练",
  "part_a": {
    "title": "模仿朗读",
    "passage": "一段80-120词的英文短文（与单元主题相关）",
    "pronunciation_tips": ["发音提示1", "发音提示2", "发音提示3", "发音提示4", "发音提示5"],
    "pause_marks": "用/标注重音和停顿的文本"
  },
  "part_b": {
    "title": "听选信息",
    "conversations": [
      {
        "context": "对话场景说明（中文）",
        "dialogue": "英文对话内容",
        "questions": [
          { "question": "英文问题?", "options": ["A选项", "B选项", "C选项", "D选项"], "answer": "A" }
        ]
      }
    ]
  },
  "part_c": {
    "title": "回答问题",
    "description": "听下面一段独白，录音播放两遍。请根据所听内容回答下列问题。",
    "passage": "一段80-120词的英文独白短文（包含所有问题的答案）",
    "questions": [
      { "question": "英文问题?", "en_answer": "英文参考答案" }
    ]
  },
  "part_d": {
    "title": "短文复述及询问信息",
    "topic": "主题",
    "key_points": ["要点1", "要点2", "要点3", "要点4"],
    "sample_answer": "英文范文（80-100词）",
    "scoring": { "pronunciation": 5, "fluency": 5, "content": 5, "grammar": 5, "total": 20 }
  }
}
\`\`\`

注意：part_b 至少包含2段对话，每段对话至少3道题目。
part_c 的passage是一段英文独白短文（包含所有问题的答案），questions为英文题目，至少4道题。
part_d 范文要完整。`;

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
      const label = GRADE_OPTIONS.find(g => g.value === grade)?.label || grade;
      const title = `${label} - ${unit}`;
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
          status: 'ls_daily',
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
      const text = `Part A: ${parsed.part_a?.passage?.substring(0, 50)}...\nPart B: ${parsed.part_b?.conversations?.length || 0}段对话\nPart C: ${parsed.part_c?.questions?.length || 0}道题\nPart D: ${parsed.part_d?.topic || ''}`;
      toast(text, { duration: 5000 });
    } catch {
      toast('无法预览');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pb-20">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* 头部 */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="text-[#64748B] hover:text-[#1E293B] transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-[#1E293B]">听说训练内容管理</h1>
          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">管理员</span>
          <div className="flex-1" />
          <button
            onClick={() => navigate('/admin/daily-english')}
            className="px-3 py-1.5 text-sm bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors font-medium"
          >
            每日英语 →
          </button>
          <button
            onClick={() => navigate('/admin/job-square')}
            className="px-3 py-1.5 text-sm bg-violet-100 text-violet-700 rounded-lg hover:bg-violet-200 transition-colors font-medium"
          >
            求职广场 →
          </button>
        </div>

        {/* 生成区域 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-6">
          <h2 className="font-bold text-[#1E293B] mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            AI 自动生成听说训练题
          </h2>

          <div className="grid grid-cols-4 gap-3 mb-4">
            <div>
              <label className="block text-xs font-medium text-[#64748B] mb-1.5">年级</label>
              <select
                value={grade}
                onChange={e => { setGrade(e.target.value); setUnit(GRADE_UNITS[e.target.value]?.[0] || ''); }}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-purple-300 bg-white"
              >
                {GRADE_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#64748B] mb-1.5">单元</label>
              <select
                value={unit}
                onChange={e => setUnit(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-purple-300 bg-white"
              >
                {GRADE_UNITS[grade]?.map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#64748B] mb-1.5">主题（可选）</label>
              <input
                type="text"
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder="如：My Family"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-purple-300"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#64748B] mb-1.5">难度</label>
              <select
                value={difficulty}
                onChange={e => setDifficulty(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-purple-300 bg-white"
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
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
          >
            {generating ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> AI 生成中...</>
            ) : (
              <><Sparkles className="w-5 h-5" /> 一键生成听说训练题</>
            )}
          </button>
        </div>

        {/* 编辑区域 */}
        {editMode && (
          <div className="bg-white rounded-2xl border border-purple-200 p-5 mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-[#1E293B] flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-purple-500" />
                编辑内容（JSON）
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
                  className="px-4 py-1.5 text-sm bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-1.5"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? '保存中...' : '保存到 Supabase'}
                </button>
              </div>
            </div>
            <textarea
              value={editableContent}
              onChange={e => setEditableContent(e.target.value)}
              className="w-full h-80 px-4 py-3 border border-slate-200 rounded-xl text-sm font-mono outline-none focus:border-purple-300 resize-y"
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
            <button onClick={loadItems} disabled={loading} className="text-xs text-purple-600 hover:text-purple-700 disabled:opacity-50">
              {loading ? '刷新中...' : '刷新'}
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12 text-[#94A3B8] text-sm">
              暂无听说训练内容，点击上方按钮生成
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {items.map((item) => (
                <div key={item.id} className="px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex-1 min-w-0 mr-4">
                    <div className="font-medium text-[#1E293B] text-sm truncate">{item.title}</div>
                    <div className="text-xs text-[#94A3B8] mt-0.5">ID: {item.id}</div>
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
