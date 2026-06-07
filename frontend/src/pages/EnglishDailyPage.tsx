import WegCoin from '../components/WegCoin';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import toast from 'react-hot-toast';
import { usersAPI } from '../utils/supabase';

// Types
interface Vocabulary {
  word: string;
  phonetic: string;
  meaning: string;
  example: string;
}

interface Grammar {
  topic: string;
  rules: string[];
  examples: string[];
}

interface ReadingQuestion {
  question: string;
  options: string[];
  answer: string;
}

interface Writing {
  topic: string;
  requirements: string[];
  tips: string[];
  word_range: string;
}

interface EnglishDaily {
  date: string;
  title_cn: string;
  title_en: string;
  source: string;
  article: string;
  translation: string;
  vocabulary: Vocabulary[];
  grammar: Grammar;
  reading_questions: ReadingQuestion[];
  writing: Writing;
}

export default function EnglishDailyPage() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [hasPet, setHasPet] = useState<boolean | null>(null);
  const [data, setData] = useState<EnglishDaily | null>(null);

  useEffect(() => {
    const pet = localStorage.getItem('adoptedPet')
    if (!pet) { setHasPet(false); return }
    try { setHasPet(!!JSON.parse(pet)) } catch { setHasPet(false) }
  }, [])
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTranslation, setShowTranslation] = useState(false);
  const [expandedVocab, setExpandedVocab] = useState<number | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [claimLoading, setClaimLoading] = useState(false);
  const [writingText, setWritingText] = useState('');
  const [writingScore, setWritingScore] = useState<{ score: number; feedback: string; wordCount: number; usedVocab: string[] } | null>(null);
  const [writingSubmitted, setWritingSubmitted] = useState(false);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    setLoading(true);
    setError(null);
    try {
      // 直接从 Supabase tasks 表读取（不经过 Worker，避免 Worker 不可达问题）
      const SUPABASE_URL = 'https://mzjmfyoemcsoqzoooiej.supabase.co/rest/v1/';
      const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16am1meW9lbWNzb3F6b29vaWVqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzQ5MDgwMCwiZXhwIjoyMDkzMDY2ODAwfQ.BaovYmOpmOANyo6fmSPKV1FwNwLWlkVVSa7r8KsaMtM';
      
      // 获取今天的英语内容
      const today = new Date().toISOString().slice(0, 10);
      const resp = await fetch(
        `${SUPABASE_URL}tasks?status=eq.english_daily_middle&select=id,title,description&order=id.desc&limit=1`,
        {
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const rows = await resp.json();
      
      if (rows.length > 0) {
        const content = JSON.parse(rows[0].description);
        setData(content);
      } else {
        setError('暂无今日英语内容');
      }
    } catch (e) {
      setError('网络错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (qIndex: number, optionLetter: string) => {
    if (submitted) return;
    setSelectedAnswers(prev => ({ ...prev, [qIndex]: optionLetter }));
  };

  const handleSubmitAnswers = () => {
    setSubmitted(true);
    let correct = 0;
    if (data) {
      data.reading_questions.forEach((q, i) => {
        if (selectedAnswers[i] === q.answer) correct++;
      });
    }
    toast.success(`答对 ${correct}/4 题！`);
  };

  const handleClaimReward = async () => {
    if (!user?.id) {
      toast.error('请先登录');
      return;
    }
    if (!submitted) {
      toast.error('请先完成答题再领取奖励');
      return;
    }

    setClaimLoading(true);
    try {
      const r = await usersAPI.addBalance(user.id, 30, '完成每日英语学习');
      if (r.success) {
        toast.success('获得 30 积分奖励！');
      } else {
        toast.error('奖励发放失败');
      }
    } catch (e) {
      toast.error('奖励发放失败');
    } finally {
      setClaimLoading(false);
    }
  };

  const handleSubmitWriting = () => {
    if (!writingText.trim()) {
      toast.error('请先完成写作');
      return;
    }
    const words = writingText.trim().split(/\s+/);
    const wordCount = words.length;
    const range = data?.writing.word_range || '';
    const match = range.match(/(\d+)/g);
    const minWords = match ? parseInt(match[0]) : 60;
    const maxWords = match && match[1] ? parseInt(match[1]) : 120;

    const vocabWords = data?.vocabulary.map(v => v.word.toLowerCase()) || [];
    const usedVocab = vocabWords.filter(v => writingText.toLowerCase().includes(v));

    let score = 0;
    const feedbacks: string[] = [];

    if (wordCount >= minWords) { score += 30; } else { feedbacks.push(`字数不足 ${minWords} 词（当前 ${wordCount} 词）`); }
    if (wordCount <= maxWords) { score += 20; } else { feedbacks.push(`超出建议字数 ${maxWords} 词`); }

    const sentences = writingText.split(/[.!?]+/).filter(s => s.trim().length > 0);
    if (sentences.length >= 3) { score += 15; } else { feedbacks.push(`建议写至少 3 个句子（当前 ${sentences.length} 句）`); }

    const uniqueWords = new Set(words.map(w => w.toLowerCase().replace(/[^a-z]/g, '')));
    const vocabBonus = Math.min(usedVocab.length * 5, 20);
    score += vocabBonus;
    if (usedVocab.length > 0) feedbacks.push(`使用了 ${usedVocab.length} 个本课词汇 (+${vocabBonus}分)`);

    const avgWordLen = words.reduce((sum, w) => sum + w.length, 0) / words.length;
    if (avgWordLen >= 4) { score += 10; } else { feedbacks.push('建议使用更丰富的词汇'); }

    if (writingText[0] === writingText[0]?.toUpperCase()) { score += 5; } else { feedbacks.push('首字母需大写'); }

    score = Math.min(score, 100);

    setWritingScore({ score, feedback: feedbacks.join('；') || '写作质量良好！', wordCount, usedVocab: usedVocab.map(v => v) });
    setWritingSubmitted(true);
    toast.success(`写作评分完成：${score} 分`);
    if (score >= 70 && user?.id) {
      usersAPI.addBalance(user.id, 5).then(r => { if (r.success) toast.success('优秀写作 +5 积分奖励！'); });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-[#A8E6CF] border-t-[#2D6A4F] animate-spin mx-auto mb-4" />
          <p className="text-[#636E72]">正在生成今日英语内容...</p>
          <p className="text-[#B2BEC3] text-sm mt-2">AI 正在准备学习材料</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-3xl p-8 shadow-lg max-w-sm">
          <div className="text-5xl mb-4">😢</div>
          <h2 className="text-xl font-bold text-[#2D6A4F] mb-2">加载失败</h2>
          <p className="text-[#636E72] mb-6">{error}</p>
          <button
            onClick={fetchContent}
            className="px-6 py-3 bg-gradient-to-r from-[#2D6A4F] to-[#40916C] text-white rounded-xl font-bold hover:opacity-90 transition-opacity"
          >
            重新加载
          </button>
        </div>
      </div>
    );
  }

  if (hasPet === false) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-3xl p-8 shadow-lg max-w-sm">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-4xl">🐾</div>
          <h2 className="text-xl font-bold text-[#2D6A4F] mb-2">先领养一只学习精灵</h2>
          <p className="text-[#636E72] mb-6">每日英语需要学习精灵的陪伴才能开始哦！<br />领养一只属于你的宠物，一起学习吧。</p>
          <div className="flex gap-3">
            <button onClick={() => navigate('/adopt')} className="flex-1 px-5 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-bold hover:shadow-lg transition-all">
              去领养
            </button>
            <button onClick={() => navigate('/learn')} className="flex-1 px-5 py-3 rounded-xl border border-slate-200 text-slate-500 font-medium hover:bg-slate-50 transition-all">
              稍后再说
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#2D6A4F] to-[#40916C] px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/benefits')}
            className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white"
          >
            ←
          </button>
          <div className="flex-1">
            <h1 className="text-white font-bold text-lg">每日英语训练</h1>
            <p className="text-white/70 text-xs">{data.date} · {data.source}</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4 max-w-2xl mx-auto">
        {/* Title */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#A8E6CF]/30">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-[#2D6A4F] mb-1">{data.title_cn}</h2>
            <p className="text-[#40916C] text-lg">{data.title_en}</p>
          </div>
        </div>

        {/* Section 1: Reading */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#A8E6CF]/30">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">📰</span>
            <h3 className="font-bold text-[#2D6A4F] text-lg">今日阅读</h3>
          </div>
          <div className="prose prose-green max-w-none">
            <div className="bg-[#F8FAF9] rounded-xl p-4 mb-4">
              <p className="text-[#2D6A4F] leading-relaxed whitespace-pre-wrap">{data.article}</p>
            </div>
            <button
              onClick={() => setShowTranslation(!showTranslation)}
              className="text-sm text-[#40916C] hover:text-[#2D6A4F] flex items-center gap-1"
            >
              {showTranslation ? '🔼 隐藏翻译' : '🔽 显示中文翻译'}
            </button>
            {showTranslation && (
              <div className="bg-[#FFF9E6] rounded-xl p-4 mt-3 border border-[#F0E68C]">
                <p className="text-[#636E72] leading-relaxed whitespace-pre-wrap">{data.translation}</p>
              </div>
            )}
          </div>
        </div>

        {/* Section 2: Vocabulary */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#A8E6CF]/30">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🔤</span>
            <h3 className="font-bold text-[#2D6A4F] text-lg">核心词汇</h3>
            <span className="text-xs text-[#636E72] bg-[#E8F5E9] px-2 py-1 rounded-full ml-auto">{data.vocabulary.length}个</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {data.vocabulary.map((v, i) => (
              <div
                key={i}
                className={`bg-[#F8FAF9] rounded-xl p-3 cursor-pointer transition-all ${expandedVocab === i ? 'ring-2 ring-[#40916C]' : ''}`}
                onClick={() => setExpandedVocab(expandedVocab === i ? null : i)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-bold text-[#2D6A4F]">{v.word}</span>
                    <span className="text-[#B2BEC3] text-xs ml-1">{v.phonetic}</span>
                  </div>
                  <span className="text-[#40916C]">{expandedVocab === i ? '🔼' : '🔽'}</span>
                </div>
                <p className="text-[#636E72] text-sm mt-1">{v.meaning}</p>
                {expandedVocab === i && (
                  <div className="mt-2 pt-2 border-t border-[#E0E0E0]">
                    <p className="text-[#40916C] text-xs italic">"{v.example}"</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Grammar */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#A8E6CF]/30">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">📝</span>
            <h3 className="font-bold text-[#2D6A4F] text-lg">语法讲解</h3>
            <span className="text-xs text-[#636E72] bg-[#E8F5E9] px-2 py-1 rounded-full ml-auto">{data.grammar.topic}</span>
          </div>
          <div className="bg-[#F8FAF9] rounded-xl p-4">
            <h4 className="font-bold text-[#40916C] mb-3">📖 规则说明</h4>
            <ul className="space-y-2">
              {data.grammar.rules.map((rule, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-[#40916C] mt-1">•</span>
                  <span className="text-[#2D6A4F] text-sm">{rule}</span>
                </li>
              ))}
            </ul>
            <h4 className="font-bold text-[#40916C] mb-3 mt-4">💡 例句</h4>
            <div className="space-y-2">
              {data.grammar.examples.map((ex, i) => (
                <div key={i} className="bg-white rounded-lg p-3 text-sm text-[#636E72]">
                  {ex}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section 4: Reading Comprehension */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#A8E6CF]/30">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">📖</span>
            <h3 className="font-bold text-[#2D6A4F] text-lg">阅读理解</h3>
            <span className="text-xs text-white bg-[#40916C] px-2 py-1 rounded-full ml-auto">{data.reading_questions.length}题</span>
          </div>
          <div className="space-y-4">
            {data.reading_questions.map((q, qIndex) => (
              <div key={qIndex} className="bg-[#F8FAF9] rounded-xl p-4">
                <p className="font-medium text-[#2D6A4F] mb-3">
                  {qIndex + 1}. {q.question}
                </p>
                <div className="space-y-2">
                  {q.options.map((opt, oIndex) => {
                    const isSelected = selectedAnswers[qIndex] === opt;
                    const optionLetter = String.fromCharCode(65 + oIndex);
                    let bgClass = 'bg-white hover:bg-[#E8F5E9]';
                    let borderClass = 'border-[#E0E0E0]';
                    let textClass = 'text-[#636E72]';
                    
                    if (submitted) {
                      if (opt === q.answer) {
                        bgClass = 'bg-green-100';
                        borderClass = 'border-green-500';
                        textClass = 'text-green-700';
                      } else if (isSelected && opt !== q.answer) {
                        bgClass = 'bg-red-100';
                        borderClass = 'border-red-500';
                        textClass = 'text-red-700';
                      }
                    } else if (isSelected) {
                      bgClass = 'bg-[#E8F5E9]';
                      borderClass = 'border-[#40916C]';
                      textClass = 'text-[#2D6A4F]';
                    }
                    
                    return (
                      <button
                        key={oIndex}
                        onClick={() => handleAnswerSelect(qIndex, optionLetter)}
                        disabled={submitted}
                        className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${bgClass} ${borderClass} ${textClass}`}
                      >
                        <span className="font-medium">{optionLetter}.</span> {opt}
                      </button>
                    );
                  })}
                </div>
                {submitted && (
                  <p className="mt-2 text-sm text-[#40916C]">
                    ✓ 正确答案: {q.answer}
                  </p>
                )}
              </div>
            ))}
          </div>
          {!submitted && (
            <button
              onClick={handleSubmitAnswers}
              disabled={Object.keys(selectedAnswers).length < data.reading_questions.length}
              className={`w-full mt-4 py-3 rounded-xl font-bold text-white transition-all ${
                Object.keys(selectedAnswers).length < data.reading_questions.length
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#2D6A4F] to-[#40916C] hover:opacity-90'
              }`}
            >
              提交答案
            </button>
          )}
          {submitted && (
            <div className="mt-4 p-3 bg-[#E8F5E9] rounded-xl text-center">
              <p className="text-[#2D6A4F] font-medium">
                得分: {data.reading_questions.filter((q, i) => selectedAnswers[i] === q.answer).length} / {data.reading_questions.length}
              </p>
            </div>
          )}
        </div>

        {/* Section 5: Writing */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#A8E6CF]/30">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">✍️</span>
            <h3 className="font-bold text-[#2D6A4F] text-lg">写作训练</h3>
          </div>
          <div className="bg-[#F8FAF9] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">📝</span>
              <span className="font-bold text-[#40916C]">题目</span>
            </div>
            <p className="text-[#2D6A4F] text-lg mb-4">{data.writing.topic}</p>
            
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">✅</span>
                <span className="font-bold text-[#40916C]">要求</span>
              </div>
              <ul className="space-y-1">
                {data.writing.requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-2 text-[#636E72] text-sm">
                    <span className="text-[#40916C]">•</span>
                    {req}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-[#FFF9E6] rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">💡</span>
                <span className="font-bold text-[#40916C]">写作提示</span>
              </div>
              <ul className="space-y-1">
                {data.writing.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-[#636E72] text-sm">
                    <span className="text-[#F59E0B]">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-[#636E72]">字数要求:</span>
              <span className="bg-[#E8F5E9] text-[#40916C] px-3 py-1 rounded-full font-medium">
                {data.writing.word_range} 词
              </span>
            </div>
          </div>

          {/* Writing Input */}
          <div className="mt-4">
            <textarea
              value={writingText}
              onChange={e => setWritingText(e.target.value)}
              disabled={writingSubmitted}
              placeholder="在这里写下你的作文..."
              className="w-full h-40 p-4 rounded-xl border border-[#E0E0E0] focus:border-[#40916C] focus:ring-2 focus:ring-[#A8E6CF]/30 resize-none text-sm text-[#2D6A4F] placeholder:text-[#B2BEC3] transition-all disabled:bg-slate-50 disabled:text-slate-500"
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-[#B2BEC3]">{writingText.trim() ? writingText.trim().split(/\s+/).length : 0} 词</span>
              {!writingSubmitted ? (
                <button onClick={handleSubmitWriting} className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#2D6A4F] to-[#40916C] text-white text-sm font-medium hover:opacity-90 transition-all shadow-md">
                  提交批改
                </button>
              ) : (
                <button onClick={() => { setWritingSubmitted(false); setWritingScore(null); }} className="px-4 py-2 rounded-xl border border-[#E0E0E0] text-sm text-[#636E72] hover:bg-slate-50 transition-colors">
                  重新写作
                </button>
              )}
            </div>
          </div>

          {/* Writing Score */}
          {writingScore && (
            <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-[#E8F5E9] to-[#F1F8E9] border border-[#A8E6CF]/50">
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-[#2D6A4F]">批改结果</span>
                <span className={`text-2xl font-bold ${writingScore.score >= 70 ? 'text-[#2D6A4F]' : writingScore.score >= 50 ? 'text-[#F59E0B]' : 'text-[#EF5350]'}`}>
                  {writingScore.score} 分
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-[#636E72] mb-2">
                <span>字数：{writingScore.wordCount} 词</span>
                {writingScore.usedVocab.length > 0 && (
                  <span>使用词汇：{writingScore.usedVocab.join(', ')}</span>
                )}
              </div>
              {writingScore.feedback && (
                <p className="text-sm text-[#636E72] leading-relaxed">{writingScore.feedback}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E0E0E0] p-4">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={handleClaimReward}
            disabled={claimLoading || !user?.id}
            className={`w-full py-4 rounded-2xl font-bold text-white text-lg transition-all flex items-center justify-center gap-2 ${
              claimLoading || !user?.id
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-gradient-to-r from-[#2D6A4F] to-[#40916C] hover:opacity-90 shadow-lg'
            }`}
          >
            {claimLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                领取中...
              </>
            ) : (
              <>
                🎁 完成学习 · 领取 30 <WegCoin size={14} />
              </>
            )}
          </button>
          {!user?.id && (
            <p className="text-center text-xs text-[#B2BEC3] mt-2">登录后可领取奖励</p>
          )}
        </div>
      </div>
    </div>
  );
}
