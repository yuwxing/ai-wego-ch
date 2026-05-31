import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Sparkles, ArrowLeft, LogIn, User, CheckCircle, AlertCircle, MessageCircle, Sun, BookOpen, Target, Gift, Wand2, Loader2, GraduationCap, School, Building2, HeartHandshake, Briefcase } from 'lucide-react';
import { Card } from '../components/ui';
import { usersAPI, digitalAvatarAPI } from '../utils/supabase';
import { useUser } from '../contexts/UserContext';
import type { User as UserType } from '../types';

const HUMAN_BONUS = 5000;

const themes = [
  { icon: Heart, label: '陪伴', color: 'text-rose-500', bg: 'bg-rose-50' },
  { icon: Sun, label: '成长', color: 'text-amber-500', bg: 'bg-amber-50' },
  { icon: BookOpen, label: '记忆', color: 'text-blue-500', bg: 'bg-blue-50' },
  { icon: Target, label: '任务', color: 'text-emerald-500', bg: 'bg-emerald-50' },
  { icon: Gift, label: '成就', color: 'text-purple-500', bg: 'bg-purple-50' },
];

type UserRole = 'student' | 'teacher' | 'principal';

interface RoleConfig {
  id: UserRole;
  label: string;
  icon: typeof User;
  desc: string;
  companionTitle: string;
  companionDesc: string;
  knows: string[];
  does: string[];
  color: string;
  gradient: string;
  lightBg: string;
}

const roles: RoleConfig[] = [
  {
    id: 'student', label: '学生', icon: GraduationCap, desc: '我需要一个学习教练',
    companionTitle: '我的学习教练',
    companionDesc: '永远陪伴我学习进步',
    knows: ['学习水平', '错题记录', '学习兴趣', '成长轨迹'],
    does: ['定制学习计划', '智能出题练习', '批改分析错题', '追踪进步曲线'],
    color: 'text-emerald-600', gradient: 'from-emerald-400 to-teal-400', lightBg: 'bg-emerald-50',
  },
  {
    id: 'teacher', label: '教师', icon: School, desc: '我需要一个教研助理',
    companionTitle: '我的教研助理',
    companionDesc: '每天帮我备课、出题、写评价',
    knows: ['教学大纲', '学生学情', '教材版本', '考试标准'],
    does: ['智能备课', '自动出题组卷', '生成学生评语', '整理教学反思'],
    color: 'text-blue-600', gradient: 'from-blue-400 to-indigo-400', lightBg: 'bg-blue-50',
  },
  {
    id: 'principal', label: '校长', icon: Building2, desc: '我需要一个管理助手',
    companionTitle: 'AI副校长',
    companionDesc: '每天看数据、写总结、分析课堂',
    knows: ['全校数据', '各科成绩', '师资情况', '教学动态'],
    does: ['数据分析报告', '巡课总结', '教学质量分析', '工作计划起草'],
    color: 'text-purple-600', gradient: 'from-purple-400 to-pink-400', lightBg: 'bg-purple-50',
  },
  {
    id: 'parent', label: '家长', icon: HeartHandshake, desc: '我需要一个家庭教育伙伴',
    companionTitle: '家庭教育助手',
    companionDesc: '陪我一起培养孩子成长',
    knows: ['孩子年龄', '学习阶段', '兴趣爱好', '成长目标'],
    does: ['推荐学习资源', '规划课外活动', '亲子沟通建议', '跟踪成长记录'],
    color: 'text-rose-600', gradient: 'from-rose-400 to-pink-400', lightBg: 'bg-rose-50',
  },
  {
    id: 'professional', label: '职场人士', icon: Briefcase, desc: '我需要一个成长伙伴',
    companionTitle: '我的成长伙伴',
    companionDesc: '陪我一起职业成长',
    knows: ['行业领域', '职业技能', '工作经验', '发展方向'],
    does: ['行业资讯整理', '技能提升建议', '工作复盘分析', '职业规划讨论'],
    color: 'text-sky-600', gradient: 'from-sky-400 to-cyan-400', lightBg: 'bg-sky-50',
  },
];

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, login, loginAsGuest } = useUser();
  const [activeTab, setActiveTab] = useState<'human' | 'login'>('human');
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [registeredUser, setRegisteredUser] = useState<UserType | null>(null);
  const [generated, setGenerated] = useState<{ prompt: string; skills: string[] } | null>(null);

  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [avatar, setAvatar] = useState({ name: '', goal: '' });

  const roleConfig = roles.find(r => r.id === selectedRole);

  const validateRegister = () => {
    if (!form.username.trim()) { setError('请输入用户名'); return false; }
    if (form.username.length < 2) { setError('用户名至少需要2个字符'); return false; }
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { setError('请输入有效的邮箱地址'); return false; }
    return true;
  };

  const validateAvatar = () => {
    if (!avatar.name.trim()) { setError('给伙伴起个名字'); return false; }
    if (!avatar.goal.trim()) { setError('说说你的目标'); return false; }
    return true;
  };

  const handleRegister = async () => {
    setLoading(true);
    try {
      const email = form.email.trim() || `${form.username.trim().toLowerCase()}-${Date.now()}@guest.aiwego`;
      const result = await usersAPI.createUser({
        username: form.username, email, password: form.password || undefined, user_type: 'human',
      });
      const userData = Array.isArray(result) ? result[0] : result;
      setRegisteredUser(userData);
      if (userData) login({ id: userData.id, username: userData.username, email: userData.email });
      setLoading(false);
      setSuccess(true);
    } catch (err) {
      setLoading(false);
      const msg = err instanceof Error ? err.message : '';
      const isVirtualEmail = !form.email.trim();
      if (msg.includes('ix_users_email')) {
        setError(isVirtualEmail ? '该用户名已被注册，换一个吧' : '该邮箱已注册');
      } else if (msg.includes('ix_users_username')) {
        setError('该用户名已被占用，换一个吧');
      } else {
        setError('注册失败，请稍后重试');
      }
    }
  };

  const handleGenerate = async () => {
    if (!validateAvatar()) return;
    setLoading(true);
    const skills = roleConfig?.does || [];
    setGenerated({
      prompt: `你是${avatar.name}，我的${roleConfig?.companionTitle}。` +
        `你了解我的${roleConfig?.knows?.join('、')}。` +
        `每天帮我${roleConfig?.does?.join('、')}。` +
        `目标是${avatar.goal}。用温暖鼓励的语气陪伴我。`,
      skills,
    });
    const avatarData = {
      role: selectedRole, name: avatar.name, goal: avatar.goal,
      companionTitle: roleConfig?.companionTitle, skills,
      prompt: `你是${avatar.name}，我的${roleConfig?.companionTitle}。` +
        `你了解我的${roleConfig?.knows?.join('、')}。` +
        `每天帮我${roleConfig?.does?.join('、')}。` +
        `目标是${avatar.goal}。用温暖鼓励的语气陪伴我。`,
    };
    localStorage.setItem('digitalAvatar', JSON.stringify(avatarData));
    if (user?.id) digitalAvatarAPI.save(user.id, avatarData);
    setLoading(false);
    setStep(3);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setError(null);
    const input = form.email.trim();
    if (!input) { setError('请输入用户名或邮箱'); return; }
    setLoading(true);
    try {
      const isEmail = input.includes('@');
      let users: any[] = [];
      for (let a = 0; a < 3; a++) {
        try {
          const c = new AbortController(); setTimeout(() => c.abort(), 15000);
          const r = await fetch(`https://mzjmfyoemcsoqzoooiej.supabase.co/rest/v1/users?${isEmail ? 'email' : 'username'}=eq.${encodeURIComponent(isEmail ? input : input)}&select=id,username,email,token_balance`, {
            headers: {
              'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16am1meW9lbWNzb3F6b29vaWVqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzQ5MDgwMCwiZXhwIjoyMDkzMDY2ODAwfQ.BaovYmOpmOANyo6fmSPKV1FwNwLWlkVVSa7r8KsaMtM',
              'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16am1meW9lbWNzb3F6b29vaWVqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzQ5MDgwMCwiZXhwIjoyMDkzMDY2ODAwfQ.BaovYmOpmOANyo6fmSPKV1FwNwLWlkVVSa7r8KsaMtM',
            }, signal: c.signal,
          });
          users = await r.json();
          if (!isEmail && (!users || !users.length)) {
            const r2 = await fetch(`https://mzjmfyoemcsoqzoooiej.supabase.co/rest/v1/users?email=eq.${encodeURIComponent(`${input.toLowerCase()}@guest.aiwego`)}&select=id,username,email,token_balance`, {
              headers: {
                'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16am1meW9lbWNzb3F6b29vaWVqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzQ5MDgwMCwiZXhwIjoyMDkzMDY2ODAwfQ.BaovYmOpmOANyo6fmSPKV1FwNwLWlkVVSa7r8KsaMtM',
                'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16am1meW9lbWNzb3F6b29vaWVqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzQ5MDgwMCwiZXhwIjoyMDkzMDY2ODAwfQ.BaovYmOpmOANyo6fmSPKV1FwNwLWlkVVSa7r8KsaMtM',
              },
            });
            users = await r2.json();
          }
          break;
        } catch { if (a < 2) await new Promise(r => setTimeout(r, 1000)); else throw it; }
      }
      if (!users || !users.length) { setError('用户名/邮箱未注册'); setLoading(false); return; }
      login({ id: users[0].id, username: users[0].username, email: users[0].email });
      navigate('/');
    } catch { setError('登录失败'); } finally { setLoading(false); }
  };

  const progressSteps = ['基本信息', '选择身份', '创建分身', '完成'];

  const renderProgress = () => {
    if (activeTab !== 'human') return null;
    const currentMap = [0, 0, 1, 2, 3, 4];
    const idx = Math.min(step, 4);
    return (
      <div className="flex items-center gap-2 mb-6">
        {progressSteps.map((s, i) => (
          <React.Fragment key={s}>
            <div className={`flex items-center gap-1.5 ${i <= idx ? 'text-rose-500' : 'text-slate-300'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i <= idx ? 'bg-rose-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                {i < idx ? '✓' : i + 1}
              </div>
              <span className="text-xs font-medium hidden sm:inline">{s}</span>
            </div>
            {i < progressSteps.length - 1 && <div className={`flex-1 h-0.5 ${i < idx ? 'bg-rose-400' : 'bg-slate-200'}`} />}
          </React.Fragment>
        ))}
      </div>
    );
  };

  if (success && registeredUser) {
    return (
      <div className="max-w-lg mx-auto space-y-6">
        <Card className="!p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">创建完成！</h2>
          <p className="text-slate-500 mb-6">你的AI伙伴已就位，会一直陪着你</p>
          {roleConfig && generated && (
            <div className={`${roleConfig.lightBg} rounded-xl p-5 mb-6 text-left`}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${roleConfig.gradient} flex items-center justify-center text-white text-2xl font-bold shadow-sm`}>
                  {avatar.name[0]}
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-800">{avatar.name}</p>
                  <p className="text-sm text-slate-500">{roleConfig.companionTitle}</p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-500 flex items-center gap-1"><Target className="w-3 h-3" /> 目标</p>
                <p className="text-sm text-slate-600 bg-white rounded-lg px-3 py-2 border border-slate-100">{avatar.goal}</p>
              </div>
            </div>
          )}
          <div className="bg-amber-50 rounded-xl p-4 mb-6 flex items-center justify-center gap-4">
            <div className="flex -space-x-1">
              {themes.map((t, i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center border border-slate-100"><t.icon className="w-4 h-4 text-slate-500" /></div>
              ))}
            </div>
            <div className="text-left"><p className="text-xs text-slate-500">注册奖励</p><p className="text-xl font-bold text-amber-600">+{HUMAN_BONUS.toLocaleString()} 积分</p></div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => navigate('/')} className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors">开始探索</button>
            <button onClick={() => navigate(`/avatar-chat`)} className="flex-1 py-3 bg-gradient-to-r from-rose-400 to-amber-500 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"><MessageCircle className="w-4 h-4" /> 和TA聊天</button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <button onClick={() => navigate('/')} className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"><ArrowLeft className="w-5 h-5" /> 返回</button>

      {activeTab === 'human' && step === 0 && (
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900 mb-3">
            创建你的 <span className="bg-gradient-to-r from-rose-500 to-amber-500 bg-clip-text text-transparent">AI分身</span>
          </h1>
          <div className="flex flex-wrap justify-center gap-2 mb-3">
            {themes.map(t => (
              <span key={t.label} className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${t.bg} ${t.color}`}><t.icon className="w-3 h-3" /> {t.label}</span>
            ))}
          </div>
          <p className="text-slate-500 text-sm">选择身份，创建专属AI伙伴，长期陪伴成长</p>
        </div>
      )}

      <div className="flex gap-1.5 p-1.5 bg-slate-100 rounded-2xl">
        <button onClick={() => { setActiveTab('human'); setStep(0); setError(null); }} className={`flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl font-medium transition-all text-sm ${activeTab === 'human' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>
          <User className="w-4 h-4" /> 创建分身
        </button>
        <button onClick={() => { setActiveTab('login'); setError(null); }} className={`flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl font-medium transition-all text-sm ${activeTab === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>
          <LogIn className="w-4 h-4" /> 登录
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" /> <p>{error}</p>
        </div>
      )}

      {activeTab === 'login' ? (
        <Card className="!p-6">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">用户名或邮箱</label>
              <input type="text" value={form.email} onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none transition-all" placeholder="输入用户名或邮箱" />
            </div>
            <button type="submit" disabled={loading} className="w-full py-4 bg-gradient-to-r from-rose-400 to-amber-500 text-white rounded-xl font-bold text-lg hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50">{loading ? '登录中...' : '登录'}</button>
            <div className="text-center text-sm text-slate-400">还没有账号？<button type="button" onClick={() => { setActiveTab('human'); setStep(0); setError(null); }} className="text-rose-500 hover:text-rose-600 font-medium">去创建分身</button></div>
          </form>
        </Card>
      ) : (
        <>
          {renderProgress()}

          {step === 0 && (
            <Card className="!p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-5">基本信息</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">用户名</label>
                  <input type="text" value={form.username} onChange={(e) => setForm(p => ({ ...p, username: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none transition-all" placeholder="给自己取个名字" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">邮箱 <span className="text-slate-400 font-normal">(可选)</span></label>
                  <input type="email" value={form.email} onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none transition-all" placeholder="没有可不填" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">密码 <span className="text-slate-400 font-normal">(可选)</span></label>
                  <input type="password" value={form.password} onChange={(e) => setForm(p => ({ ...p, password: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none transition-all" placeholder="设置密码（可选）" />
                </div>
                <button type="button" onClick={() => { setError(null); if (!validateRegister()) return; setStep(1); }}
                  className="w-full py-4 bg-gradient-to-r from-rose-400 to-amber-500 text-white rounded-xl font-bold text-lg hover:shadow-lg hover:-translate-y-0.5 transition-all">下一步：选择身份</button>
              </div>
            </Card>
          )}

          {step === 1 && (
            <Card className="!p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-1">你是谁？</h2>
              <p className="text-sm text-slate-400 mb-5">选择你的身份，我们将为你推荐最合适的AI伙伴</p>
              <div className="space-y-3">
                {roles.map(r => (
                  <button key={r.id} type="button" onClick={() => { setSelectedRole(r.id); setAvatar(prev => ({ ...prev, name: r.companionTitle })); }}
                    className={`w-full p-5 rounded-2xl text-left transition-all border-2 ${selectedRole === r.id ? `${r.lightBg} border-current` : 'bg-slate-50 border-transparent hover:border-slate-200'}`}
                    style={selectedRole === r.id ? { borderColor: r.color.replace('text-', '').replace('-600', '-300') } : {}}>
                    <div className="flex items-start gap-4">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${r.gradient} flex items-center justify-center text-white shadow-sm`}>
                        <r.icon className="w-7 h-7" />
                      </div>
                      <div className="flex-1">
                        <p className="text-lg font-bold text-slate-800">{r.label}</p>
                        <p className="text-sm text-slate-500 mt-0.5">{r.desc}</p>
                        <div className="mt-3 grid grid-cols-2 gap-1.5">
                          {r.knows.slice(0, 2).map(k => (
                            <span key={k} className="text-xs text-slate-400 flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-current opacity-40" /> {k}</span>
                          ))}
                        </div>
                      </div>
                      {selectedRole === r.id && (
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${r.gradient}`}>
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
              <div className="flex gap-3 mt-5">
                <button type="button" onClick={() => setStep(0)} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-medium hover:bg-slate-200 transition-all">上一步</button>
                <button type="button" onClick={() => { if (!selectedRole) { setError('请选择你的身份'); return; } setStep(2); }}
                  className="flex-1 py-4 bg-gradient-to-r from-rose-400 to-amber-500 text-white rounded-xl font-bold hover:shadow-lg hover:-translate-y-0.5 transition-all">下一步：创建分身</button>
              </div>
            </Card>
          )}

          {step === 2 && roleConfig && (
            <Card className="!p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-1">{roleConfig.companionTitle}</h2>
              <p className="text-sm text-slate-400 mb-5">{roleConfig.companionDesc}，长期陪伴不换</p>

              <div className={`${roleConfig.lightBg} rounded-2xl p-4 mb-5`}>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 mb-1.5">我了解你的</p>
                    {roleConfig.knows.map(k => (
                      <div key={k} className="flex items-center gap-1.5 text-sm text-slate-600 mb-1"><CheckCircle className={`w-3.5 h-3.5 ${roleConfig.color}`} />{k}</div>
                    ))}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 mb-1.5">我每天帮你</p>
                    {roleConfig.does.map(d => (
                      <div key={d} className="flex items-center gap-1.5 text-sm text-slate-600 mb-1"><Sparkles className={`w-3.5 h-3.5 ${roleConfig.color}`} />{d}</div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">给伙伴起个名字</label>
                  <input type="text" value={avatar.name} onChange={(e) => setAvatar(p => ({ ...p, name: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-none transition-all" placeholder={`如：${roleConfig.companionTitle}`} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">你的目标是什么？</label>
                  <textarea value={avatar.goal} onChange={(e) => setAvatar(p => ({ ...p, goal: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-none transition-all resize-none"
                    rows={2} placeholder={{
    student: '如：英语提高30分',
    teacher: '如：减少备课时间',
    principal: '如：提升全校平均分',
    parent: '如：培养孩子的阅读习惯',
    professional: '如：三年内成为技术 leader',
  }[roleConfig.id] || '说说你的目标'} />
                </div>
              </div>

              <div className="flex gap-3 mt-5">
                <button type="button" onClick={() => setStep(1)} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-medium hover:bg-slate-200 transition-all">上一步</button>
                <button type="button" onClick={handleGenerate} disabled={loading}
                  className="flex-1 py-4 bg-gradient-to-r from-rose-400 to-amber-500 text-white rounded-xl font-bold hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}{loading ? '生成中...' : 'AI 生成'}
                </button>
              </div>
            </Card>
          )}

          {step === 3 && roleConfig && generated && (
            <Card className="!p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-1">{avatar.name} 创建完成！</h2>
              <p className="text-sm text-slate-400 mb-5">你的{roleConfig.companionTitle}已准备好</p>

              <div className={`${roleConfig.lightBg} rounded-2xl p-6 mb-5`}>
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${roleConfig.gradient} flex items-center justify-center text-white text-3xl font-bold shadow-sm`}>
                    {avatar.name[0]}
                  </div>
                  <div>
                    <p className="text-xl font-bold text-slate-800">{avatar.name}</p>
                    <p className="text-sm text-slate-500">{roleConfig.companionTitle}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-slate-400 mb-1.5 flex items-center gap-1"><Target className="w-3 h-3" /> 目标</p>
                    <p className="text-sm text-slate-600 bg-white rounded-lg px-3 py-2 border border-slate-100">{avatar.goal}</p>
                  </div>
                </div>
              </div>

              <button type="button" onClick={handleRegister} disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-rose-400 to-amber-500 text-white rounded-xl font-bold text-lg hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50">
                {loading ? '注册中...' : '确认并注册 →'}
              </button>
            </Card>
          )}
        </>
      )}

      {activeTab === 'human' && step === 0 && (
        <>
          <div className="text-center">
            <button onClick={() => { loginAsGuest(); navigate('/'); }} className="px-6 py-2.5 rounded-xl border-2 border-dashed border-slate-300 text-slate-500 text-sm font-medium hover:border-rose-300 hover:text-rose-500 hover:bg-rose-50 transition-all">先逛逛，稍后再来 →</button>
          </div>
          <div className="text-center text-sm text-slate-400"><p>注册即表示同意服务条款和隐私政策</p></div>
        </>
      )}
    </div>
  );
};

export default RegisterPage;
