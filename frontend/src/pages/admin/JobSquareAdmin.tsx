import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Save, Trash2, Edit3, Eye, Loader2, Check, AlertCircle, ChevronLeft, Sparkles, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { getApiKey } from '../../utils/deepseek';

const SUPABASE_URL = 'https://mzjmfyoemcsoqzoooiej.supabase.co/rest/v1/';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16am1meW9lbWNzb3F6b29vaWVqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzQ5MDgwMCwiZXhwIjoyMDkzMDY2ODAwfQ.BaovYmOpmOANyo6fmSPKV1FwNwLWlkVVSa7r8KsaMtM';

const DEEPSEEK_URL = 'https://api.deepseek.com/v1/chat/completions';

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

export default function JobSquareAdmin() {
  const navigate = useNavigate();
  const [items, setItems] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<Omit<JobListing, 'id'>>({ ...emptyForm });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [generating, setGenerating] = useState(false);

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

  const generateWithAI = async () => {
    const apiKey = getApiKey();
    if (!apiKey) { toast.error('请先在"系统中心 → API密钥"中配置DeepSeek API密钥'); setGenerating(false); return; }
    setGenerating(true);
    try {
      const prompt = `你是一个广东省人才引进/实习招聘信息编辑。请生成一条真实的招聘信息 JSON。

要求：
- 工作地点在广东省内
- 如果是人才引进(talent)：偏向事业编制、高校、国企、政府单位
- 如果是实习招聘(internship)：偏向互联网大厂、知名企业
- deadline 必须在未来（${new Date().toISOString().slice(0, 10)} 之后一个月内）
- description 60-120 字，说明招聘条件
- tags 从以下选择：编制、硕士、博士、本科、专科、大厂、央国企、可转正、免笔试、远程、教师、公务员、金融、技术岗、产品、管培、电力、云计算、省属、计算机
- is_hot 为 true 或 false

输出严格 JSON，不要其他文字：

{
  "type": "talent",
  "title": "招聘公告标题",
  "organization": "单位名称",
  "location": "城市名",
  "salary": "薪资描述（如：事业编制 / 面议 / 15k-25k）",
  "deadline": "2026-XX-XX",
  "url": "https://...",
  "description": "招聘条件描述",
  "tags": ["标签1", "标签2"],
  "is_hot": false
}`;

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
          max_tokens: 2048,
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
      const parsed = JSON.parse(raw);

      setForm({
        type: parsed.type || 'talent',
        title: parsed.title || '',
        organization: parsed.organization || '',
        location: parsed.location || '广州',
        salary: parsed.salary || '',
        deadline: parsed.deadline || '',
        url: parsed.url || '',
        description: parsed.description || '',
        tags: parsed.tags || [],
        is_hot: parsed.is_hot || false,
        published_at: new Date().toISOString().slice(0, 10),
      });
      setEditingId(null);
      setShowForm(true);
      toast.success('AI 生成成功，请检查并保存');
    } catch (e: any) {
      toast.error('生成失败: ' + e.message);
    } finally {
      setGenerating(false);
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
            onClick={generateWithAI}
            disabled={generating}
            className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium flex items-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all"
          >
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {generating ? '生成中...' : 'AI 智能生成'}
          </button>
        </div>

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
