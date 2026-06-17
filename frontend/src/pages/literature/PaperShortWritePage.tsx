import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Heart, Send, Sparkles, Loader2, Clock } from 'lucide-react'
import { sharedStoryAPI } from '../../utils/supabase'
import { useUser } from '../../contexts/UserContext'

const STORY_CODE = 'paper_short'

const BLOCKED_PATTERNS = [
  /[捅砍杀操干艹草死搞]你[妈娘全家祖宗]/,
  /[傻煞]逼|草泥马|去死|滚蛋|脑残|智障|白痴|废物|垃圾|恶心|去你[妈娘]的/,
  /\d{11,}/,
  /1[3-9]\d{9}/,
]

const SUSPICIOUS_PATTERNS = [
  /[^。，！？\n]*[老班主班主][任?]?[^。，！？\n]*[太真好很更][^。，！？\n]*[坏差烂恶毒死]/,
  /[^。，！？\n]*[同学同座同位][^。，！？\n]*[太真好很更][^。，！？\n]*[坏差烂恶毒]/,
  /[^。，！？\n]*[某这那][^。，！？\n]*(?:同学|老师|主任|校长)[^。，！？\n]*[太真好很更][^。，！？\n]*[坏差烂恶毒]/,
  /(?:真名|实名|真实姓名|本名)/,
  /微信号|QQ号|手机号|电话|地址|门牌/,
]

function reviewContent(text: string): { ok: boolean; message: string } {
  for (const p of BLOCKED_PATTERNS) {
    if (p.test(text)) {
      return { ok: false, message: '内容包含不文明用语，请修改后重新提交' }
    }
  }
  for (const p of SUSPICIOUS_PATTERNS) {
    if (p.test(text)) {
      return { ok: false, message: '请勿出现真实姓名或针对老师/同学的攻击性内容，保持纯文学创作' }
    }
  }
  return { ok: true, message: '' }
}

export default function PaperShortWritePage() {
  const navigate = useNavigate()
  const { user } = useUser()
  const [content, setContent] = useState('')
  const [authorName, setAuthorName] = useState('')
  const [submissions, setSubmissions] = useState<any[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [reviewError, setReviewError] = useState('')

  const chineseCount = (content.match(/[\u4e00-\u9fff]/g) || []).length
  const totalCount = content.replace(/\s/g, '').length

  useEffect(() => {
    const init = async () => {
      try {
        const data = await sharedStoryAPI.fetchByStory(STORY_CODE)
        setSubmissions(data || [])
      } catch {}
      setLoading(false)
    }
    init()
  }, [])

  const handleSubmit = async () => {
    if (!content.trim() || chineseCount < 300) return
    const review = reviewContent(content)
    if (!review.ok) {
      setReviewError(review.message)
      return
    }
    setReviewError('')
    setSubmitting(true)
    try {
      const name = authorName.trim() || (user?.name ? `${user.name}` : user?.id ? `用户${user.id}` : '匿名')
      const firstLine = content.trim().split('\n')[0]?.replace(/^[""「」\s]+/, '').trim() || '心事'
      await sharedStoryAPI.add({
        chapter_title: firstLine.length > 30 ? firstLine.slice(0, 30) + '…' : firstLine,
        content: content,
        author_name: name,
        score: 0,
        passed: true,
        code: STORY_CODE,
        timestamp: Date.now(),
      })
      setSubmitted(true)
    } catch {}
    setSubmitting(false)
  }

  if (submitted) {
    return (
      <div className="page-wrapper min-h-screen flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="glass-card rounded-2xl p-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-pink-400 to-rose-400 rounded-full flex items-center justify-center shadow-md">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">已发布！</h2>
            <p className="text-slate-500 mb-6">你的心事已经悄悄放进树洞里了</p>
            <div className="space-y-3">
              <button onClick={() => { setSubmitted(false); setContent('') }}
                className="w-full py-3 btn-gradient-primary rounded-xl font-bold text-sm">
                再写一篇
              </button>
              <button onClick={() => navigate('/literature')}
                className="w-full py-3 rounded-xl border border-slate-200 text-slate-600 font-medium text-sm hover:bg-slate-50">
                返回文学社
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-wrapper min-h-screen flex flex-col">
      <header className="bg-white/80 backdrop-blur-md border-b border-pink-100/50 px-4 py-3 flex items-center gap-3 flex-shrink-0">
        <button onClick={() => navigate('/literature')} className="p-1.5 rounded-lg hover:bg-pink-50 text-slate-500">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-pink-400 to-rose-400 flex items-center justify-center">
          <Heart className="w-4 h-4 text-white" />
        </div>
        <span className="text-sm font-semibold text-slate-700">纸短情长</span>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-4">
          <div className="glass-card rounded-2xl p-5">
            <h2 className="text-base font-bold text-slate-700 mb-1">写下你的心事</h2>
            <p className="text-xs text-slate-400 mb-4">纸短情长，见字如面。至少 300 个汉字。<br/>请勿出现真实姓名或攻击性内容，保持纯文学创作</p>
            <input type="text" value={authorName} onChange={e => setAuthorName(e.target.value)}
              placeholder="你的名字（选填，默认匿名）" maxLength={20}
              className="w-full mb-3 px-4 py-2.5 rounded-xl bg-white/70 border border-slate-200 text-sm text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent"
            />
            <textarea value={content} onChange={e => setContent(e.target.value)}
              placeholder="在这里写下你想说的话……" rows={8}
              className="w-full p-4 bg-white/70 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent resize-y leading-relaxed"
            />
            <div className="flex items-center justify-between mt-3">
              <span className={`text-xs ${chineseCount >= 300 ? 'text-emerald-500' : 'text-amber-500'}`}>
                汉字：{chineseCount}{chineseCount < 300 ? `/300` : ''}
                {chineseCount >= 300 && ` · 共${totalCount}字`}
              </span>
              <button onClick={handleSubmit} disabled={submitting || chineseCount < 300}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white text-sm font-bold hover:shadow-lg transition-all disabled:opacity-50">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {submitting ? '发布中...' : '发布到树洞'}
              </button>
            </div>
            {reviewError && (
              <p className="text-xs text-red-500 mt-2 flex items-center gap-1"><span>⚠</span> {reviewError}</p>
            )}
            {chineseCount > 0 && chineseCount < 300 && (
              <p className="text-xs text-amber-500 mt-2 flex items-center gap-1">至少需要 300 个汉字才能发布</p>
            )}
          </div>

          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-pink-500" />
              <span className="text-sm font-semibold text-slate-700">树洞里的心事</span>
              <span className="text-xs text-slate-400 ml-auto">{submissions.length} 篇</span>
            </div>
            {loading ? (
              <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-slate-300" /></div>
            ) : submissions.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">还没有人写过心事，来当第一个吧</p>
            ) : (
              <div className="space-y-3">
                {[...submissions].reverse().map((s, i) => (
                  <div key={s.id || i} className="bg-white/60 rounded-xl p-4 border border-pink-100/50">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-medium text-pink-600">{s.author_name || '匿名'}</span>
                      <span className="text-[10px] text-slate-300">·</span>
                      <span className="text-[10px] text-slate-400">{s.chapter_title}</span>
                      <span className="ml-auto text-[10px] text-slate-300">
                        {s.timestamp ? new Date(s.timestamp).toLocaleDateString() : ''}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 leading-7 whitespace-pre-wrap">{s.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
