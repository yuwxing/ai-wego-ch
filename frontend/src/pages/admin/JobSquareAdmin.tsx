import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Save, Trash2, Edit3, Eye, Loader2, Check, AlertCircle, ChevronLeft, X, Search, Sparkles, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { getApiKey } from '../../utils/deepseek';

const SUPABASE_URL = 'https://mzjmfyoemcsoqzoooiej.supabase.co/rest/v1/';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16am1meW9lbWNzb3F6b29vaWVqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzQ5MDgwMCwiZXhwIjoyMDkzMDY2ODAwfQ.BaovYmOpmOANyo6fmSPKV1FwNwLWlkVVSa7r8KsaMtM';

const LOCATIONS = ['广州', '深圳', '佛山', '珠海', '东莞', '中山', '惠州', '肇庆', '江门', '湛江', '汕头', '韶关', '清远', '茂名', '梅州', '揭阳', '河源', '阳江', '潮州', '云浮', '汕尾', '全国'];

interface JobListing {
  id: number;
  type: 'talent' | 'internship';
  title: string;
  organization: string;
  location: string;
  salary: string;
  deadline: string;
  url?: string;
  description?: string;
  tags: string[];
  is_hot: boolean;
  published_at: string;
}

const emptyForm: Omit<JobListing, 'id'> = {
  type: 'talent',
  title: '',
  organization: '',
  location: '广州',
  salary: '',
  deadline: '',
  url: '',
  description: '',
  tags: [],
  is_hot: false,
  published_at: new Date().toISOString().slice(0, 10),
};

const TAG_OPTIONS = ['编制', '硕士', '博士', '本科', '专科', '大厂', '央国企', '可转正', '免笔试', '远程', '教师', '公务员', '金融', '技术岗', '产品', '管培', '电力', '云计算', '省属', '计算机'];

const DEEPSEEK_URL = 'https://api.deepseek.com/v1/chat/completions';

interface AiJobResult {
  title: string;
  organization: string;
  location: string;
  salary: string;
  deadline: string;
  url: string;
  description: string;
  tags: string[];
  type: 'talent' | 'internship';
  source_url: string;
}

export default function JobSquareAdmin() {
  const navigate = useNavigate();
  const [items, setItems] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<Omit<JobListing, 'id'>>({ ...emptyForm });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [aiSearchOpen, setAiSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('广东 教师 招聘 2026');
  const [searching, setSearching] = useState(false);
  const [aiResults, setAiResults] = useState<AiJobResult[]>([]);
  const [selectedResults, setSelectedResults] = useState<Set<number>>(new Set());
  const [savingAiResults, setSavingAiResults] = useState(false);
  const [bingResults, setBingResults] = useState<{title: string; url: string; snippet: string}[]>([]);
  const [selectedBing, setSelectedBing] = useState<Set<number>>(new Set());
  const [formatting, setFormatting] = useState(false);

  const loadItems = async () => {
    setLoading(true);
    try {
      const resp = await fetch(`${SUPABASE_URL}job_listings?select=*&order=is_hot.desc,published_at.desc&limit=100`, {
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

  const aiSearch = async () => {
    if (!searchQuery.trim()) { toast.error('请输入搜索关键词'); return; }
    setSearching(true);
    setAiResults([]);
    setBingResults([]);
    setSelectedResults(new Set());
    setSelectedBing(new Set());
    try {
      const resp = await fetch(`/api/search-jobs?q=${encodeURIComponent(searchQuery)}`);
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${resp.status}`);
      }
      const data = await resp.json();
      if (!data.results || data.results.length === 0) throw new Error('未搜索到结果');
      setBingResults(data.results);
      setSelectedBing(new Set(data.results.map((_: any, i: number) => i)));
      toast.success(`找到 ${data.results.length} 条搜索结果，选择后用 AI 提取结构化信息`);
    } catch (e: any) {
      toast.error('搜索失败: ' + e.message);
    } finally {
      setSearching(false);
    }
  };

  const formatResults = async () => {
    const selected = bingResults.filter((_, i) => selectedBing.has(i));
    if (selected.length === 0) { toast.error('请至少选择一条搜索结果'); return; }
    const apiKey = getApiKey();
    if (!apiKey) { toast.error('请先在"系统中心 → API密钥"中配置DeepSeek API密钥'); return; }
    setFormatting(true);
    try {
      const context = selected.map(r => `- ${r.title}\n  URL: ${r.url}\n  简介: ${r.snippet}`).join('\n');
      const today = new Date().toISOString().slice(0, 10);
      const prompt = `以下是从互联网搜索到的真实招聘信息，请从中提取结构化数据，返回JSON数组。

搜索关键词：${searchQuery}
当前日期：${today}

原始搜索结果：
${context}

要求：
1. 每条数据基于上述真实搜索结果，title/organization/location 尽量精确
2. type: talent=人才引进/事业单位, internship=实习/企业招聘
3. deadline 格式 YYYY-MM-DD，必须为 ${today} 之后的未来日期
4. tags 从以下选择匹配：${TAG_OPTIONS.join('、')}
5. description 用中文，60-120字，包含招聘岗位、学历要求等真实信息
6. source_url 必须设置为对应搜索结果的真实URL
7. url 字段设置为 source_url 相同，确保是真实可访问的链接
8. ⚠️ 重要：如果原始信息中的报名截止日期已过（早于 ${today}），则不要包含该条数据
9. 如果所有数据都已过期，返回空数组 []

输出JSON数组，不要包含其他文字：
\`\`\`json
[
  {
    "type": "talent",
    "title": "广州市教育局2026年公开招聘教师公告",
    "organization": "广州市教育局",
    "location": "广州",
    "salary": "事业编制",
    "deadline": "2026-07-15",
    "url": "https://www.example.com/real-job-url",
    "source_url": "https://www.example.com/real-job-url",
    "description": "招聘中小学各学科教师若干名，要求本科及以上学历。",
    "tags": ["编制", "教师", "本科"]
  }
]
\`\`\``;

      const resp = await fetch(DEEPSEEK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'deepseek-v4-flash',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
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
      const parsed: AiJobResult[] = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length === 0) throw new Error('提取失败');
      const filtered = parsed.filter(item => item.deadline >= today);
      if (filtered.length === 0) throw new Error('所有招聘信息已过期');
      setAiResults(filtered);
      setSelectedResults(new Set(filtered.map((_, i) => i)));
      toast.success(`提取到 ${filtered.length} 条有效招聘信息（已过滤过期），请核实后保存`);
    } catch (e: any) {
      toast.error('提取失败: ' + e.message);
    } finally {
      setFormatting(false);
    }
  };

  const saveSelectedResults = async () => {
    const toSave = aiResults.filter((_, i) => selectedResults.has(i));
    if (toSave.length === 0) { toast.error('请至少选择一条'); return; }
    const today = new Date().toISOString().slice(0, 10);
    const valid = toSave.filter(item => item.deadline >= today);
    if (valid.length === 0) { toast.error('所有选中招聘信息已过期'); setSavingAiResults(false); return; }
    if (valid.length < toSave.length) toast(`${toSave.length - valid.length} 条已过期已跳过`, { icon: '⚠️' });
    setSavingAiResults(true);
    let saved = 0;
    for (const item of valid) {
      try {
        const resp = await fetch(`${SUPABASE_URL}job_listings`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation',
          },
          body: JSON.stringify({
            type: item.type,
            title: item.title,
            organization: item.organization,
            location: item.location,
            salary: item.salary,
            deadline: item.deadline,
            url: item.url || item.source_url || '',
            description: item.description || '',
            tags: item.tags || [],
            is_hot: false,
            published_at: new Date().toISOString().slice(0, 10),
          }),
        });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        saved++;
      } catch (e: any) {
        toast.error(`保存失败: ${item.title} - ${e.message}`);
      }
    }
    toast.success(`已保存 ${saved}/${toSave.length} 条`);
    setAiSearchOpen(false);
    setAiResults([]);
    loadItems();
    setSavingAiResults(false);
  };

  const resetForm = () => {
    setForm({ ...emptyForm });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (item: JobListing) => {
    setForm({
      type: item.type,
      title: item.title,
      organization: item.organization,
      location: item.location,
      salary: item.salary,
      deadline: item.deadline,
      url: item.url || '',
      description: item.description || '',
      tags: item.tags,
      is_hot: item.is_hot,
      published_at: item.published_at,
    });
    setEditingId(item.id);
    setShowForm(true);
  };

  const toggleTag = (tag: string) => {
    setForm(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const saveItem = async () => {
    if (!form.title || !form.organization || !form.deadline) {
      toast.error('请填写标题、单位和截止日期');
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        const { published_at, ...updateData } = form;
        const resp = await fetch(`${SUPABASE_URL}job_listings?id=eq.${editingId}`, {
          method: 'PATCH',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation',
          },
          body: JSON.stringify(updateData),
        });
        if (!resp.ok) throw new Error(`更新失败: HTTP ${resp.status}`);
        toast.success('已更新');
      } else {
        const resp = await fetch(`${SUPABASE_URL}job_listings`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation',
          },
          body: JSON.stringify(form),
        });
        if (!resp.ok) throw new Error(`创建失败: HTTP ${resp.status}`);
        toast.success('已创建');
      }
      resetForm();
      loadItems();
    } catch (e: any) {
      console.error('保存失败:', e);
      toast.error('保存失败: ' + e.message);
      alert('保存失败: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteItem = async (id: number) => {
    if (!confirm('确定删除这条招聘信息？')) return;
    try {
      const resp = await fetch(`${SUPABASE_URL}job_listings?id=eq.${id}`, {
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



  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-white pb-20">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="text-[#64748B] hover:text-[#1E293B] transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-[#1E293B]">求职广场内容管理</h1>
          <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-medium">管理员</span>
          <div className="flex-1" />
          <button
            onClick={() => navigate('/admin/daily-english')}
            className="px-3 py-1.5 text-sm bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors font-medium"
          >
            每日英语管理 →
          </button>
          <button
            onClick={() => navigate('/admin/listening-speaking')}
            className="px-3 py-1.5 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors font-medium"
          >
            听说训练管理 →
          </button>
        </div>

        {/* 操作栏 */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="px-4 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl font-medium flex items-center gap-2 hover:opacity-90 transition-all"
          >
            <Plus className="w-4 h-4" /> 新增招聘信息
          </button>
          <button
            onClick={() => setAiSearchOpen(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-medium flex items-center gap-2 hover:opacity-90 transition-all"
          >
            <Sparkles className="w-4 h-4" /> AI 搜索招聘信息
          </button>
        </div>

        {/* AI 搜索面板 */}
        {aiSearchOpen && (
          <div className="bg-white rounded-2xl border border-emerald-200 p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-[#1E293B] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-500" />
                AI 搜索真实招聘信息
              </h2>
              <button onClick={() => { setAiSearchOpen(false); setAiResults([]); setBingResults([]); }} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            {bingResults.length === 0 && aiResults.length === 0 ? (
              <>
                <div className="flex gap-3 mb-4">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="输入搜索关键词，如：广东 教师 招聘 2026"
                    className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-emerald-300"
                    onKeyDown={e => e.key === 'Enter' && aiSearch()}
                  />
                  <button
                    onClick={aiSearch}
                    disabled={searching}
                    className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-medium flex items-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all"
                  >
                    {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    {searching ? '搜索中...' : '搜索'}
                  </button>
                </div>
                <p className="text-xs text-[#94A3B8]">通过 Google 搜索真实招聘网站，提取后发布</p>
              </>
            ) : bingResults.length > 0 && aiResults.length === 0 ? (
              <>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-[#64748B]">Google 搜索结果 — 选择后 AI 提取结构化信息</span>
                  <button onClick={() => { setBingResults([]); setAiResults([]); setSearchQuery(''); }} className="text-xs text-emerald-600 hover:underline">
                    重新搜索
                  </button>
                </div>
                <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
                  {bingResults.map((item, i) => (
                    <div
                      key={i}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedBing.has(i) ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200 hover:border-slate-300'
                      }`}
                      onClick={() => {
                        setSelectedBing(prev => {
                          const next = new Set(prev);
                          next.has(i) ? next.delete(i) : next.add(i);
                          return next;
                        });
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                          selectedBing.has(i) ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300'
                        }`}>
                          {selectedBing.has(i) && <Check className="w-3.5 h-3.5 text-white" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <Search className="w-3.5 h-3.5 text-[#94A3B8] flex-shrink-0" />
                            <span className="font-medium text-sm text-[#1E293B] truncate">{item.title}</span>
                          </div>
                          <div className="text-xs text-emerald-600 mt-0.5 truncate">
                            <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:underline inline-flex items-center gap-1" onClick={e => e.stopPropagation()}>
                              <ExternalLink className="w-3 h-3" /> {item.url}
                            </a>
                          </div>
                          <div className="text-xs text-[#94A3B8] mt-1 line-clamp-2">{item.snippet}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#64748B]">已选 {selectedBing.size} / {bingResults.length} 条</span>
                  <button
                    onClick={formatResults}
                    disabled={formatting || selectedBing.size === 0}
                    className="px-4 py-2 text-sm bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {formatting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    {formatting ? '提取中...' : `AI 提取结构化信息`}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-[#64748B]">结构化招聘信息 — 核实后保存到 Supabase</span>
                  <button onClick={() => { setBingResults([]); setAiResults([]); setSearchQuery(''); }} className="text-xs text-emerald-600 hover:underline">
                    重新搜索
                  </button>
                </div>
                <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
                  {aiResults.map((item, i) => (
                    <div
                      key={i}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedResults.has(i) ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200 hover:border-slate-300'
                      }`}
                      onClick={() => {
                        setSelectedResults(prev => {
                          const next = new Set(prev);
                          next.has(i) ? next.delete(i) : next.add(i);
                          return next;
                        });
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                          selectedResults.has(i) ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300'
                        }`}>
                          {selectedResults.has(i) && <Check className="w-3.5 h-3.5 text-white" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                              item.type === 'talent' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                            }`}>
                              {item.type === 'talent' ? '人才引进' : '实习招聘'}
                            </span>
                            <span className="font-medium text-sm text-[#1E293B]">{item.title}</span>
                          </div>
                          <div className="text-xs text-[#64748B] mt-1">
                            {item.organization} · {item.location} · {item.salary}
                          </div>
                          {item.source_url && (
                            <div className="text-xs text-emerald-600 mt-0.5">
                              <a href={item.source_url} target="_blank" rel="noopener noreferrer" className="hover:underline inline-flex items-center gap-1">
                                <ExternalLink className="w-3 h-3" /> {item.source_url}
                              </a>
                            </div>
                          )}
                          <div className="text-xs text-[#94A3B8] mt-1 line-clamp-2">{item.description}</div>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-xs text-[#94A3B8]">截止: {item.deadline}</span>
                            {item.tags?.map(t => (
                              <span key={t} className="px-1.5 py-0.5 text-xs bg-slate-100 text-slate-500 rounded">{t}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#64748B]">已选 {selectedResults.size} / {aiResults.length} 条</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setAiResults([]); setBingResults([]); }}
                      className="px-4 py-2 text-sm text-[#64748B] border border-slate-200 rounded-lg hover:bg-slate-50"
                    >
                      返回搜索结果
                    </button>
                    <button
                      onClick={saveSelectedResults}
                      disabled={savingAiResults || selectedResults.size === 0}
                      className="px-4 py-2 text-sm bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-1.5"
                    >
                      {savingAiResults ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      {savingAiResults ? '保存中...' : `保存选中到 Supabase`}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* 编辑表单 */}
        {showForm && (
          <div className="bg-white rounded-2xl border border-violet-200 p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-[#1E293B] flex items-center gap-2">
                {editingId ? <Edit3 className="w-4 h-4 text-violet-500" /> : <Plus className="w-4 h-4 text-violet-500" />}
                {editingId ? '编辑招聘信息' : '新增招聘信息'}
              </h2>
              <button onClick={resetForm} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-[#64748B] mb-1">标题 *</label>
                <input
                  value={form.title}
                  onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-violet-300"
                  placeholder="如：广州市2026年引进急需人才公告"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#64748B] mb-1">类型</label>
                <select
                  value={form.type}
                  onChange={e => setForm(p => ({ ...p, type: e.target.value as 'talent' | 'internship' }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-violet-300 bg-white"
                >
                  <option value="talent">人才引进</option>
                  <option value="internship">实习招聘</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#64748B] mb-1">单位名称 *</label>
                <input
                  value={form.organization}
                  onChange={e => setForm(p => ({ ...p, organization: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-violet-300"
                  placeholder="如：广州市人社局"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#64748B] mb-1">城市</label>
                <select
                  value={form.location}
                  onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-violet-300 bg-white"
                >
                  {LOCATIONS.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#64748B] mb-1">薪资/编制</label>
                <input
                  value={form.salary}
                  onChange={e => setForm(p => ({ ...p, salary: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-violet-300"
                  placeholder='如：事业编制 / 15k-25k'
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#64748B] mb-1">截止日期 *</label>
                <input
                  type="date"
                  value={form.deadline}
                  onChange={e => setForm(p => ({ ...p, deadline: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-violet-300"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#64748B] mb-1">链接 URL</label>
                <input
                  value={form.url || ''}
                  onChange={e => setForm(p => ({ ...p, url: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-violet-300"
                  placeholder="https://..."
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-[#64748B] mb-1">描述</label>
                <textarea
                  value={form.description || ''}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-violet-300 resize-none"
                  rows={3}
                  placeholder="招聘条件描述（60-120字）"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-[#64748B] mb-1">标签</label>
                <div className="flex flex-wrap gap-2">
                  {TAG_OPTIONS.map(tag => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1 text-xs rounded-lg border transition-all ${
                        form.tags.includes(tag)
                          ? 'bg-violet-100 text-violet-700 border-violet-300'
                          : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_hot"
                  checked={form.is_hot}
                  onChange={e => setForm(p => ({ ...p, is_hot: e.target.checked }))}
                  className="w-4 h-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                />
                <label htmlFor="is_hot" className="text-sm text-[#64748B]">标记为热门</label>
              </div>
            </div>

            <button
              onClick={saveItem}
              disabled={saving}
              className="w-full py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? '保存中...' : editingId ? '更新招聘信息' : '创建招聘信息'}
            </button>
          </div>
        )}

        {/* 列表 */}
        <div className="bg-white rounded-2xl border border-slate-200">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-[#1E293B] flex items-center gap-2">
              <Eye className="w-4 h-4 text-slate-400" />
              招聘信息列表
              <span className="text-xs text-[#94A3B8] font-normal">({items.length} 条)</span>
            </h2>
            <button onClick={loadItems} disabled={loading} className="text-xs text-violet-600 hover:text-violet-700 disabled:opacity-50">
              {loading ? '刷新中...' : '刷新'}
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-violet-400 animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12 text-[#94A3B8] text-sm">
              暂无招聘信息，点击上方按钮新增
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {items.map((item) => (
                <div key={item.id} className="px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex-1 min-w-0 mr-4">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                        item.type === 'talent' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {item.type === 'talent' ? '人才引进' : '实习招聘'}
                      </span>
                      {item.is_hot && <span className="text-xs text-red-500 font-medium">🔥 热门</span>}
                      <span className="font-medium text-[#1E293B] text-sm truncate">{item.title}</span>
                    </div>
                    <div className="text-xs text-[#94A3B8] mt-1">
                      {item.organization} · {item.location} · 截止 {item.deadline}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-[#64748B] hover:bg-slate-200 transition-colors"
                      title="编辑"
                    >
                      <Edit3 className="w-4 h-4" />
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
