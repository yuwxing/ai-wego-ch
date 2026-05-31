import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Sparkles, ArrowLeft, LogIn, User, Bot, CheckCircle, AlertCircle, MessageCircle, Sun, BookOpen, Target, Gift } from 'lucide-react';
import { Card } from '../components/ui';
import { usersAPI } from '../utils/supabase';
import { useUser } from '../contexts/UserContext';
import type { User as UserType } from '../types';

const HUMAN_BONUS = 5000;

const themes = [
  { icon: Heart, label: '陪伴', desc: 'AI伙伴，随叫随到', color: 'text-rose-500', bg: 'bg-rose-50' },
  { icon: Sun, label: '成长', desc: '每日进步，看得见', color: 'text-amber-500', bg: 'bg-amber-50' },
  { icon: BookOpen, label: '记忆', desc: '记住你的每一件事', color: 'text-blue-500', bg: 'bg-blue-50' },
  { icon: Target, label: '任务', desc: '一起完成任务挑战', color: 'text-emerald-500', bg: 'bg-emerald-50' },
  { icon: Gift, label: '成就', desc: '解锁专属成就徽章', color: 'text-purple-500', bg: 'bg-purple-50' },
];

const adoptablePets = [
  { petId: 'duo', name: '嘟嘟', personality: '学霸型', desc: '温柔爱学习的猫头鹰', color: '#34D399', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  { petId: 'junie', name: '朱妮', personality: '正义型', desc: '冷静又温暖的兔警官', color: '#A78BFA', bg: 'bg-violet-50', border: 'border-violet-200' },
  { petId: 'kebo', name: '考比', personality: '专注型', desc: '紫色考拉，理财小达人', color: '#C084FC', bg: 'bg-purple-50', border: 'border-purple-200' },
  { petId: 'beier', name: '铃铃', personality: '甜美型', desc: '粉红狐狸，甜美可爱', color: '#F9A8D4', bg: 'bg-pink-50', border: 'border-pink-200' },
];

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, loginAsGuest } = useUser();
  const [activeTab, setActiveTab] = useState<'human' | 'login'>('human');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [registeredUser, setRegisteredUser] = useState<UserType | null>(null);

  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [adoptPet, setAdoptPet] = useState(false);
  const [selectedPet, setSelectedPet] = useState<string | null>(null);
  const [petName, setPetName] = useState('');

  const validate = () => {
    if (!form.username.trim()) { setError('请输入用户名'); return false; }
    if (form.username.length < 2) { setError('用户名至少需要2个字符'); return false; }
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { setError('请输入有效的邮箱地址'); return false; }
    if (adoptPet && !selectedPet) { setError('请选择一个AI伙伴'); return false; }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validate()) return;

    try {
      setLoading(true);
      const email = form.email.trim() || `${form.username.trim().toLowerCase()}@guest.aiwego`;
      const result = await usersAPI.createUser({
        username: form.username,
        email,
        password: form.password || undefined,
        user_type: 'human',
      });
      const userData = Array.isArray(result) ? result[0] : result;
      setRegisteredUser(userData);
      if (userData) login({ id: userData.id, username: userData.username, email: userData.email });

      if (adoptPet && selectedPet) {
        const petInfo = adoptablePets.find(p => p.petId === selectedPet);
        if (petInfo) {
          localStorage.setItem('adoptedPet', JSON.stringify({
            petId: petInfo.petId,
            name: petName || petInfo.name,
            personality: petInfo.personality,
            desc: petInfo.desc,
            color: petInfo.color,
          }));
        }
      }
      setSuccess(true);
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      const msg = err instanceof Error ? err.message : '注册失败';
      if (msg.includes('duplicate key') || msg.includes('ix_users_email')) setError('该邮箱已注册');
      else if (msg.includes('ix_users_username')) setError('该用户名已被占用');
      else setError(msg.includes('注册') ? msg : '注册失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const input = form.email.trim();
    if (!input) { setError('请输入用户名或邮箱'); return; }
    setLoading(true);
    try {
      const isEmail = input.includes('@');
      const emailToQuery = isEmail ? input : `${input.toLowerCase()}@guest.aiwego`;
      let users: any[] = [];
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const controller = new AbortController();
          setTimeout(() => controller.abort(), 15000);
          const res = await fetch(`https://mzjmfyoemcsoqzoooiej.supabase.co/rest/v1/users?${isEmail ? 'email' : 'username'}=eq.${encodeURIComponent(isEmail ? input : input)}&select=id,username,email,token_balance`, {
            headers: {
              'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16am1meW9lbWNzb3F6b29vaWVqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzQ5MDgwMCwiZXhwIjoyMDkzMDY2ODAwfQ.BaovYmOpmOANyo6fmSPKV1FwNwLWlkVVSa7r8KsaMtM',
              'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16am1meW9lbWNzb3F6b29vaWVqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzQ5MDgwMCwiZXhwIjoyMDkzMDY2ODAwfQ.BaovYmOpmOANyo6fmSPKV1FwNwLWlkVVSa7r8KsaMtM',
            },
            signal: controller.signal,
          });
          users = await res.json();
          if (!isEmail && (!users || users.length === 0)) {
            const res2 = await fetch(`https://mzjmfyoemcsoqzoooiej.supabase.co/rest/v1/users?email=eq.${encodeURIComponent(emailToQuery)}&select=id,username,email,token_balance`, {
              headers: {
                'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16am1meW9lbWNzb3F6b29vaWVqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzQ5MDgwMCwiZXhwIjoyMDkzMDY2ODAwfQ.BaovYmOpmOANyo6fmSPKV1FwNwLWlkVVSa7r8KsaMtM',
                'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16am1meW9lbWNzb3F6b29vaWVqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzQ5MDgwMCwiZXhwIjoyMDkzMDY2ODAwfQ.BaovYmOpmOANyo6fmSPKV1FwNwLWlkVVSa7r8KsaMtM',
              },
            });
            users = await res2.json();
          }
          break;
        } catch { if (attempt < 2) await new Promise(r => setTimeout(r, 1000)); else throw it; }
      }
      if (!users || users.length === 0) { setError('用户名/邮箱未注册'); setLoading(false); return; }
      login({ id: users[0].id, username: users[0].username, email: users[0].email });
      navigate('/');
    } catch { setError('登录失败，请检查网络'); } finally { setLoading(false); }
  };

  if (success && registeredUser) {
    return (
      <div className="max-w-md mx-auto space-y-6">
        <button onClick={() => navigate('/')} className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors">
          <ArrowLeft className="w-5 h-5" /> 返回首页
        </button>
        <Card className="!p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">欢迎加入！</h2>
          <p className="text-slate-600 mb-6">开启你的AI陪伴之旅</p>
          <div className="bg-gradient-to-r from-rose-50 via-amber-50 to-emerald-50 rounded-xl p-5 mb-6">
            <div className="flex items-center justify-center gap-4">
              <div className="flex -space-x-1">
                {[Heart, Sun, BookOpen, Target, Gift].map((Icon, i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center border border-slate-100">
                    <Icon className="w-4 h-4 text-slate-500" />
                  </div>
                ))}
              </div>
              <div className="text-left">
                <p className="text-xs text-slate-500">注册奖励</p>
                <p className="text-2xl font-bold bg-gradient-to-r from-rose-500 to-amber-500 bg-clip-text text-transparent">
                  +{HUMAN_BONUS.toLocaleString()} 积分
                </p>
              </div>
            </div>
          </div>
          {adoptPet && selectedPet && (
            <div className="bg-slate-50 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-300 to-purple-300 flex items-center justify-center text-2xl">
                  🐾
                </div>
                <div className="text-left">
                  <p className="font-medium text-slate-900">{petName || adoptablePets.find(p => p.petId === selectedPet)?.name}</p>
                  <p className="text-xs text-slate-500">已领养 · 随时可以找TA聊天</p>
                </div>
              </div>
            </div>
          )}
          <div className="flex gap-3">
            <button onClick={() => navigate('/')} className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors">
              开始探索
            </button>
            {adoptPet && selectedPet && (
              <button onClick={() => navigate(`/pet-chat/${selectedPet}`)} className="flex-1 py-3 bg-gradient-to-r from-rose-400 to-purple-500 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2">
                <MessageCircle className="w-4 h-4" /> 找伙伴聊天
              </button>
            )}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <button onClick={() => navigate('/')} className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors">
        <ArrowLeft className="w-5 h-5" /> 返回首页
      </button>

      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-900 mb-3">
          开启你的 <span className="bg-gradient-to-r from-rose-500 to-amber-500 bg-clip-text text-transparent">AI陪伴</span> 之旅
        </h1>
        <div className="flex flex-wrap justify-center gap-2 mb-3">
          {themes.map(t => (
            <span key={t.label} className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${t.bg} ${t.color}`}>
              <t.icon className="w-3 h-3" /> {t.label}
            </span>
          ))}
        </div>
        <p className="text-slate-500 text-sm">注册即送 {HUMAN_BONUS.toLocaleString()} 积分，还可领养专属AI伙伴</p>
      </div>

      <div className="flex gap-1.5 p-1.5 bg-slate-100 rounded-2xl">
        <button onClick={() => { setActiveTab('human'); setError(null); }} className={`flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl font-medium transition-all text-sm ${activeTab === 'human' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>
          <User className="w-4 h-4" /> 注册
        </button>
        <button onClick={() => { setActiveTab('login'); setError(null); }} className={`flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl font-medium transition-all text-sm ${activeTab === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>
          <LogIn className="w-4 h-4" /> 登录
        </button>
      </div>

      {activeTab !== 'login' && (
        <div className="bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-400 rounded-2xl p-5 text-white">
          <div className="flex items-center gap-4">
            <div className="flex -space-x-1.5">
              {themes.map((t, i) => (
                <div key={i} className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <t.icon className="w-4 h-4" />
                </div>
              ))}
            </div>
            <div>
              <p className="text-white/80 text-sm">注册即送</p>
              <p className="text-2xl font-bold">+{HUMAN_BONUS.toLocaleString()} 积分</p>
            </div>
          </div>
        </div>
      )}

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
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none transition-all"
                placeholder="输入用户名或邮箱" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-rose-400 to-amber-500 text-white rounded-xl font-bold text-lg hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50">
              {loading ? '登录中...' : '登录'}
            </button>
            <div className="text-center text-sm text-slate-400">
              还没有账号？<button type="button" onClick={() => { setActiveTab('human'); setError(null); }} className="text-rose-500 hover:text-rose-600 font-medium">去注册</button>
            </div>
          </form>
        </Card>
      ) : (
        <Card className="!p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">用户名</label>
              <input type="text" value={form.username} onChange={(e) => setForm(prev => ({ ...prev, username: e.target.value }))}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none transition-all"
                placeholder="给自己取个名字" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">邮箱 <span className="text-slate-400 font-normal">(可选)</span></label>
              <input type="email" value={form.email} onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none transition-all"
                placeholder="没有可不填" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">密码 <span className="text-slate-400 font-normal">(可选)</span></label>
              <input type="password" value={form.password} onChange={(e) => setForm(prev => ({ ...prev, password: e.target.value }))}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none transition-all"
                placeholder="设置密码（可选）" />
            </div>

            <div className="border-t border-slate-100 pt-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-semibold text-slate-800">领养AI伙伴 <span className="text-slate-400 font-normal text-sm">(可选)</span></h3>
                  <p className="text-xs text-slate-400 mt-0.5">陪伴你学习、成长、完成任务的专属AI伙伴</p>
                </div>
                <button type="button" onClick={() => { setAdoptPet(!adoptPet); if (!adoptPet) { setSelectedPet(null); setPetName(''); } }}
                  className={`text-sm px-3 py-1.5 rounded-full font-medium transition-all ${adoptPet ? 'bg-rose-100 text-rose-600 border border-rose-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 border border-slate-200'}`}>
                  {adoptPet ? '取消领养' : '我要领养'}
                </button>
              </div>

              {adoptPet && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {adoptablePets.map(pet => (
                      <button key={pet.petId} type="button" onClick={() => { setSelectedPet(pet.petId); if (!petName) setPetName(pet.name); }}
                        className={`relative p-4 rounded-xl text-left transition-all ${selectedPet === pet.petId ? `${pet.bg} border-2` : 'bg-slate-50 border-2 border-transparent hover:border-slate-200'}`}
                        style={selectedPet === pet.petId ? { borderColor: pet.color } : {}}>
                        <div className={`w-10 h-10 rounded-xl ${pet.bg} flex items-center justify-center text-lg mb-2`}>
                          🐾
                        </div>
                        <p className="text-sm font-semibold text-slate-800">{pet.name}</p>
                        <p className="text-xs text-slate-400">{pet.personality}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{pet.desc}</p>
                        {selectedPet === pet.petId && (
                          <div className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: pet.color }}>
                            <span className="text-white text-xs">✓</span>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>

                  {selectedPet && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">给伙伴起个名字</label>
                      <input type="text" value={petName} onChange={(e) => setPetName(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-none transition-all"
                        placeholder="给它取个名字吧" />
                    </div>
                  )}
                </div>
              )}
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-rose-400 to-amber-500 text-white rounded-xl font-bold text-lg hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? '注册中...' : adoptPet && selectedPet ? '注册并领养伙伴' : '立即注册'}
            </button>
          </form>
        </Card>
      )}

      <div className="text-center">
        <button onClick={() => { loginAsGuest(); navigate('/'); }} className="px-6 py-2.5 rounded-xl border-2 border-dashed border-slate-300 text-slate-500 text-sm font-medium hover:border-rose-300 hover:text-rose-500 hover:bg-rose-50 transition-all">
          先逛逛，稍后再来 →
        </button>
      </div>

      <div className="text-center text-sm text-slate-400">
        <p>注册即表示同意服务条款和隐私政策</p>
      </div>
    </div>
  );
};

export default RegisterPage;
