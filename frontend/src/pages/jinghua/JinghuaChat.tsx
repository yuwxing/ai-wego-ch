import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Bot, Send, Loader2, Key, Bookmark, BookmarkCheck, GraduationCap } from 'lucide-react';
import { getApiKey, getApiBaseUrl } from '../../utils/deepseek';

const CORE_MENTORS: Record<string, { name: string; prompt: string; color: string }> = {
  'mentor-math': {
    name: '陈景元教授', color: 'from-blue-500 to-cyan-500',
    prompt: '你是菁华大学的AI数学教授，一位严谨精确的学者型导师。用苏格拉底式追问引导思考，鼓励学生自己推导和证明。请用中文回答。'
  },
  'mentor-research': {
    name: '林纳德博士', color: 'from-emerald-500 to-teal-500',
    prompt: '你是菁华大学的AI科研导师，温和而富有启发性。项目驱动，手把手指导。请用中文回答。'
  },
  'mentor-paper': {
    name: '张维真教授', color: 'from-amber-500 to-orange-500',
    prompt: '你是菁华大学的AI论文教练，犀利直接的写作导师。批改式逐句打磨。请用中文回答。'
  },
  'mentor-startup': {
    name: '马云飞导师', color: 'from-rose-500 to-pink-500',
    prompt: '你是菁华大学的AI创业导师，果断务实的商业导师。实战模拟，数据驱动。请用中文回答。'
  },
  'mentor-philosophy': {
    name: '何怀宏教授', color: 'from-violet-500 to-purple-500',
    prompt: '你是菁华大学的AI哲学导师，深邃开放的思辨型导师。对话式追问本质。请用中文回答。'
  }
};

const AI_ASSISTANTS: Record<string, { name: string; prompt: string; color: string }> = {
  'english': {
    name: '英语学习助手', color: 'from-blue-500 to-cyan-500',
    prompt: '你是AI英语学习助手，帮助初中生提高英语水平。请用中文回答，耐心解释语法、词汇和写作问题。'
  },
  'math': {
    name: '数学解题助手', color: 'from-green-500 to-emerald-500',
    prompt: '你是AI数学解题助手，帮助初中生理解数学概念和解题思路。用简单易懂的方式讲解。'
  },
  'study': {
    name: '学习规划助手', color: 'from-purple-500 to-pink-500',
    prompt: '你是AI学习规划助手，帮助初中生制定学习计划，提高学习效率。给出具体可行的建议。'
  }
};

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const generateId = () => Math.random().toString(36).substring(2, 10);

const JinghuaChat: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const mentorId = searchParams.get('mentor');
  const assistantId = searchParams.get('assistant');
  const bookTitle = searchParams.get('book');
  const bookAuthor = searchParams.get('author');
  const bookSummary = searchParams.get('summary');

  const isBookChat = !!(bookTitle && bookAuthor);
  const config = mentorId ? CORE_MENTORS[mentorId] : assistantId ? AI_ASSISTANTS[assistantId] : null;
  const bookPrompt = isBookChat
    ? `你是《${bookTitle}》的作者${bookAuthor}。请以作者本人的身份与读者对话，回答关于这本书的问题，分享创作思路和核心观点。书的内容简介：${bookSummary}`
    : '';
  const systemPrompt = config?.prompt || bookPrompt;
  const title = config?.name || (isBookChat ? bookAuthor : 'AI助手');

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [noKey, setNoKey] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [showSavedToast, setShowSavedToast] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (config) {
      setMessages([{
        id: generateId(), role: 'assistant',
        content: `你好！我是${config.name}，有什么可以帮你的吗？`
      }]);
    } else if (isBookChat) {
      setMessages([{
        id: generateId(), role: 'assistant',
        content: `你好！我是《${bookTitle}》的作者${bookAuthor}，很高兴与你交流这本书的内容！`
      }]);
    }
  }, [config, isBookChat, bookTitle, bookAuthor]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const key = getApiKey();
    if (!key) {
      setNoKey(true);
      setTimeout(() => setNoKey(false), 3000);
      return;
    }
    const userMsg: Message = { id: generateId(), role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(`${getApiBaseUrl()}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            ...(systemPrompt ? [{ role: 'system' as const, content: systemPrompt }] : []),
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

  const saveNote = (content: string, msgId: string) => {
    const notes = JSON.parse(localStorage.getItem('chat_notes') || '[]');
    notes.unshift({ id: Date.now(), content, source: title, timestamp: new Date().toLocaleString('zh-CN') });
    localStorage.setItem('chat_notes', JSON.stringify(notes.slice(0, 100)));
    setSavedId(msgId);
    setShowSavedToast(true);
    setTimeout(() => { setShowSavedToast(false); setSavedId(null); }, 2000);
  };

  const formatContent = (content: string) => {
    const paragraphs = content.split('\n\n').filter(p => p.trim());
    return paragraphs.map((p, i) => (
      <p key={i} className="mb-3 last:mb-0">{p}</p>
    ));
  };

  return (
    <div className="page-wrapper min-h-screen flex flex-col">
      <div className="sticky top-0 z-50 glass-card border-b border-white/90 rounded-none">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-fresh-50 text-slate-500 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${config?.color || 'from-fresh-400 to-sky-500'} flex items-center justify-center shadow-sm`}>
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-800 text-sm truncate">{title}</h3>
            <p className="text-xs text-slate-400">菁华校园 · AI导师对话</p>
          </div>
          <button onClick={() => navigate('/notes')} className="p-2 rounded-lg hover:bg-fresh-50 transition-colors" title="查看笔记">
            <Bookmark className="w-4 h-4 text-slate-400" />
          </button>
          <button onClick={() => navigate('/settings/api-key')} className="p-2 rounded-lg hover:bg-fresh-50 transition-colors" title="设置API密钥">
            <Key className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-5">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in`}>
              <div className="max-w-[80%]">
                <div className={`px-5 py-3.5 text-sm leading-8 rounded-2xl ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-fresh-500 to-fresh-600 text-white rounded-br-md shadow-sm shadow-fresh-200/50'
                    : 'glass-card text-slate-700 rounded-bl-md'
                }`}>
                  {formatContent(msg.content)}
                </div>
                {msg.role === 'assistant' && (
                  <button
                    onClick={() => saveNote(msg.content, msg.id)}
                    className="mt-1.5 ml-2 p-1 rounded-lg hover:bg-fresh-50 transition-colors flex items-center gap-1"
                  >
                    {savedId === msg.id ? (
                      <BookmarkCheck className="w-3.5 h-3.5 text-fresh-500" />
                    ) : (
                      <Bookmark className="w-3.5 h-3.5 text-slate-300" />
                    )}
                    <span className="text-[10px] text-slate-400">{savedId === msg.id ? '已保存' : '保存笔记'}</span>
                  </button>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="glass-card rounded-2xl rounded-bl-md px-5 py-3.5 flex items-center gap-3">
                <Loader2 className="w-4 h-4 text-fresh-500 animate-spin" />
                <span className="text-sm text-slate-400">导师正在思考...</span>
              </div>
            </div>
          )}
          {noKey && (
            <div className="flex justify-center">
              <div className="px-5 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-sm flex items-center gap-2 shadow-sm">
                <Key className="w-4 h-4" />
                请先设置 DeepSeek API 密钥
                <button onClick={() => navigate('/settings/api-key')} className="underline ml-1 font-medium">去设置</button>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="sticky bottom-0 z-40 glass-card border-t border-white/90 rounded-none">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-end gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
              placeholder={`向${title}提问...`}
              className="flex-1 px-4 py-3 rounded-xl bg-white/80 border border-fresh-200 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-fresh-300 focus:border-fresh-400 transition-all shadow-sm"
            />
            <button onClick={handleSend} disabled={!input.trim() || loading} className="w-10 h-10 rounded-xl bg-gradient-to-r from-fresh-500 to-fresh-600 text-white flex items-center justify-center disabled:opacity-50 hover:from-fresh-600 hover:to-fresh-700 transition-all shadow-sm shadow-fresh-200/50">
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-slate-400 text-center mt-2">需先设置 DeepSeek API 密钥才能对话</p>
        </div>
      </div>

      {showSavedToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-fresh-500 text-white text-sm shadow-lg animate-in">
          已保存到笔记
        </div>
      )}

      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes messageIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-in {
          animation: messageIn 0.25s ease-out;
        }
      `}</style>
    </div>
  );
};

export default JinghuaChat;
