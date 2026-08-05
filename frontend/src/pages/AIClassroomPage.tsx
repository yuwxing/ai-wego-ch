import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, Sparkles, MessageCircle, PawPrint, Heart, ArrowRight, Star, Zap, BookOpen, Send, X, Loader2, Key } from 'lucide-react';
import { getApiKey, getApiBaseUrl } from '../utils/deepseek';

const AI_ASSISTANTS = [
  {
    id: 'english',
    name: '英语学习助手',
    icon: BookOpen,
    desc: '语法答疑、写作批改、阅读理解辅导',
    color: 'from-blue-500 to-cyan-500',
    prompt: '你是AI英语学习助手，帮助初中生提高英语水平。请用中文回答，耐心解释语法、词汇和写作问题。回答时分点列出，每条用-开头，不要用#和**符号。'
  },
  {
    id: 'math',
    name: '数学解题助手',
    icon: Zap,
    desc: '解题思路、公式推导、错题分析',
    color: 'from-green-500 to-emerald-500',
    prompt: '你是AI数学解题助手，帮助初中生理解数学概念和解题思路。用简单易懂的方式讲解，引导自主思考。回答时分步骤列出，每条用-开头，不要用#和**符号。'
  },
  {
    id: 'study',
    name: '学习规划助手',
    icon: Star,
    desc: '学习计划、时间管理、方法指导',
    color: 'from-purple-500 to-pink-500',
    prompt: '你是AI学习规划助手，帮助初中生制定学习计划，提高学习效率。给出具体可行的建议。回答时分点列出，每条用-开头，不要用#和**符号。'
  }
];

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const generateId = () => Math.random().toString(36).substring(2, 10);

const formatResponse = (text: string) => {
  return text
    .replace(/#{1,6}\s*/g, '')
    .replace(/\*\*/g, '')
    .replace(/\*(?!\s)/g, '• ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

const AIClassroomPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeAssistant, setActiveAssistant] = useState<typeof AI_ASSISTANTS[0] | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading || !activeAssistant) return;
    const userMsg: Message = { id: generateId(), role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const apiKey = getApiKey();
    if (!apiKey) {
      setMessages(prev => [...prev, { id: generateId(), role: 'assistant', content: '请先在"系统中心 → API密钥"中配置你的DeepSeek API密钥后再使用AI助手哦～ 🔑' }]);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: 'deepseek-v4-flash',
          messages: [
            { role: 'system', content: activeAssistant.prompt },
            ...messages.slice(-10).map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: userMsg.content }
          ],
          max_tokens: 800,
          temperature: 0.7
        })
      });
      const data = await res.json();
      const reply = data.choices?.[0]?.message?.content || '抱歉，暂时无法回复。';
      setMessages(prev => [...prev, { id: generateId(), role: 'assistant', content: reply }]);
    } catch {
      setMessages(prev => [...prev, { id: generateId(), role: 'assistant', content: '网络出错了，请稍后重试。' }]);
    }
    setLoading(false);
  };

  const openChat = (assistant: typeof AI_ASSISTANTS[0]) => {
    setActiveAssistant(assistant);
    setMessages([{ id: generateId(), role: 'assistant', content: `你好！我是${assistant.name}，有什么可以帮你的吗？😊` }]);
  };

  const closeChat = () => {
    setActiveAssistant(null);
    setMessages([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 pb-24">
      <div className="max-w-4xl mx-auto px-4 pt-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm mb-4">
            <Sparkles className="w-4 h-4" /> AI学习助手
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">AI课堂</h1>
          <p className="text-slate-500">智能学习助手 · 宠物精灵陪伴 · 互动聊天</p>
        </div>

        <section className="mb-10">
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Bot className="w-6 h-6 text-blue-500" />
            AI学习助手
          </h2>
          <p className="text-slate-500 text-sm mb-5">点击助手卡片，立即连线真人级AI对话</p>
          <div className="grid gap-4 md:grid-cols-3">
            {AI_ASSISTANTS.map((assistant) => {
              const Icon = assistant.icon;
              return (
                <div
                  key={assistant.id}
                  onClick={() => openChat(assistant)}
                  className="group bg-white rounded-2xl p-5 border border-slate-100 hover:shadow-lg transition-all cursor-pointer hover:-translate-y-1"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${assistant.color} flex items-center justify-center mb-4 shadow-sm`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-slate-800 mb-1">{assistant.name}</h3>
                  <p className="text-sm text-slate-500">{assistant.desc}</p>
                  <div className="mt-4 flex items-center gap-1 text-blue-500 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    开始对话 <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <PawPrint className="w-6 h-6 text-purple-500" />
            宠物精灵
          </h2>
          <p className="text-slate-500 text-sm mb-5">领养你的学习伙伴，完成任务喂养它</p>
          <div className="grid gap-4 md:grid-cols-2">
            <div onClick={() => navigate('/adopt')} className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-5 border border-purple-100 hover:shadow-lg transition-all cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl">
                  <Heart className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">领养精灵</h3>
                  <p className="text-sm text-slate-500">选择你的专属学习伙伴</p>
                </div>
              </div>
            </div>
            <div onClick={() => { const p = localStorage.getItem('adoptedPet'); navigate(p ? `/pet-chat/${JSON.parse(p).petId}` : '/adopt'); }} className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 border border-amber-100 hover:shadow-lg transition-all cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white text-2xl">
                  <MessageCircle className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">精灵聊天</h3>
                  <p className="text-sm text-slate-500">和你的宠物精灵对话</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-emerald-500" />
            宠物聊天系统
          </h2>
          <p className="text-slate-500 text-sm mb-5">和AI宠物互动，边学边玩</p>
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-3xl shadow-lg">
                <MessageCircle className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">和你的宠物聊天</h3>
                <p className="text-sm text-slate-500">宠物会回应你的问题，陪你学习成长</p>
              </div>
            </div>
            <button onClick={() => { const p = localStorage.getItem('adoptedPet'); navigate(p ? `/pet-chat/${JSON.parse(p).petId}` : '/adopt'); }} className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2">
              <MessageCircle className="w-5 h-5" />
              开始聊天
            </button>
          </div>
        </section>
      </div>

      {activeAssistant && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 bg-white">
            <button onClick={closeChat} className="p-1 rounded-lg hover:bg-slate-100 transition-colors">
              <X className="w-5 h-5 text-slate-600" />
            </button>
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${activeAssistant.color} flex items-center justify-center`}>
              <activeAssistant.icon className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-800 text-sm">{activeAssistant.name}</h3>
              <p className="text-xs text-slate-500">DeepSeek 实时对话</p>
            </div>
            <button onClick={() => navigate('/settings/api-key')} className="p-2 rounded-lg hover:bg-slate-100 transition-colors" title="配置API密钥">
              <Key className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-gradient-to-b from-sky-50 to-white">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-blue-500 text-white rounded-br-md'
                    : 'bg-white border border-slate-200 text-slate-700 rounded-bl-md shadow-sm'
                }`}>
                  {msg.role === 'assistant' ? formatResponse(msg.content) : msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                  <span className="text-sm text-slate-500">正在思考...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-slate-200 px-4 py-3 bg-white">
            <div className="flex items-end gap-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                placeholder={`向${activeAssistant.name}提问...`}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <button onClick={handleSend} disabled={!input.trim() || loading} className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center disabled:opacity-50 hover:bg-blue-600 transition-colors">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIClassroomPage;
