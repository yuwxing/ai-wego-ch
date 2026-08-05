import { useState } from 'react'
import { Download, Globe, Terminal, Settings, ArrowLeft, Languages, Copy, Check, Loader2, AlertCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getApiKey, getSharedApiKey } from '../utils/deepseek'

const DEEPSEEK_URL = 'https://api.deepseek.com/v1/chat/completions'

const steps = [
  { icon: Download, title: '下载桌面版', desc: '下载下方 ZIP，解压后双击启动，在任何软件中 Ctrl+Alt+T 一键翻译' },
  { icon: Settings, title: '配置 API Key', desc: '在 设置 → API密钥 中配置 DeepSeek Key，在线版和桌面版共用同一个 Key' },
  { icon: Globe, title: '浏览器插件', desc: 'ZIP 中附带 Chrome/Edge 插件，安装后网页输入框自动出现翻译按钮' },
  { icon: Terminal, title: '全局快捷键', desc: '桌面版支持全局 Ctrl+Alt+T，在任何软件中选中文本即可翻译' },
]

export default function TranslatorPage() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [showPreview, setShowPreview] = useState(true)

  const apiKey = getApiKey() || getSharedApiKey()

  const translate = async () => {
    const text = input.trim()
    if (!text) return
    if (!apiKey) {
      setError('请先在 设置 → API密钥 中配置 DeepSeek API Key')
      return
    }
    setLoading(true)
    setError('')
    setShowPreview(false)
    const target = /[\u4e00-\u9fa5]/.test(text) ? 'en' : 'zh'
    try {
      const res = await fetch(DEEPSEEK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: 'deepseek-v4-flash',
          messages: [
            { role: 'system', content: `翻译助手：将${target === 'en' ? '中文' : '英文'}翻译成${target === 'en' ? '英文' : '中文'}，只返回结果不要解释。` },
            { role: 'user', content: text }
          ],
          max_tokens: 2048,
          temperature: 0.3,
        }),
      })
      if (!res.ok) throw new Error(`请求失败 (${res.status})`)
      const data = await res.json()
      setOutput(data.choices?.[0]?.message?.content?.replace(/^["']|["']$/g, '').trim() || '')
    } catch (e: any) {
      setError(e.message || '翻译失败')
    } finally {
      setLoading(false)
    }
  }

  const copyResult = async () => {
    try {
      await navigator.clipboard.writeText(output)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #e6faf7 0%, #f0fdfa 40%, #ffffff 100%)' }}>
      {/* Header */}
      <div className="sticky top-0 z-30 backdrop-blur-md bg-white/80 border-b border-emerald-100">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-emerald-700 hover:text-emerald-900 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-semibold">返回首页</span>
          </Link>
          <span className="text-sm text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">免费 · 开源</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-200">
            <Languages className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-emerald-900 mb-2">AI-Wego 翻译器</h1>
          <p className="text-emerald-700 max-w-lg mx-auto text-sm">
            在线版直接在浏览器中使用 · 桌面版支持全局快捷键和网页插件
          </p>
        </div>

        {/* Online Translator */}
        <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 overflow-hidden mb-8">
          <div className="px-6 py-3.5 bg-gradient-to-r from-emerald-400 to-teal-500 text-white font-medium text-sm flex items-center gap-2">
            <Languages className="w-4 h-4" />
            在线翻译
          </div>
          <div className="p-5 space-y-4">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); translate() } }}
              placeholder="输入中文或英文，按 Enter 翻译..."
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-emerald-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none resize-none text-sm"
            />

            <div className="flex items-center gap-2">
              <button
                onClick={translate}
                disabled={loading || !input.trim()}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 text-white font-medium text-sm shadow-md hover:shadow-lg hover:translate-y-[-1px] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Languages className="w-4 h-4" />}
                {loading ? '翻译中...' : '翻译'}
              </button>
              {!apiKey && (
                <Link to="/settings/api-key" className="text-xs text-amber-600 hover:text-amber-800 underline">
                  未配置 API Key
                </Link>
              )}
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                {error}
              </div>
            )}

            {output && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-emerald-700">翻译结果</span>
                  <button onClick={copyResult} className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-800">
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? '已复制' : '复制'}
                  </button>
                </div>
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-900 whitespace-pre-wrap">
                  {output}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Desktop & Plugin Section */}
        <h2 className="text-xl font-bold text-emerald-900 mb-6">桌面版 &amp; 浏览器插件</h2>
        <div className="grid gap-4 md:grid-cols-2 mb-8">
          {steps.map((s, i) => (
            <div key={i} className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 border border-emerald-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white flex-shrink-0 shadow-sm">
                  <s.icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                    <h3 className="font-semibold text-emerald-900">{s.title}</h3>
                  </div>
                  <p className="text-sm text-emerald-700 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Download */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 border border-emerald-100 shadow-sm text-center mb-8">
          <h2 className="text-xl font-bold text-emerald-900 mb-2">下载桌面版</h2>
          <p className="text-sm text-emerald-600 mb-6">Windows · 需 Python 3.8+ · 含浏览器插件</p>
          <a
            href="/ai-wego-translator.zip"
            download
            className="inline-flex items-center gap-2 px-8 py-3 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-500 text-white font-semibold text-base shadow-lg shadow-emerald-200 hover:shadow-xl hover:translate-y-[-2px] transition-all"
          >
            <Download className="w-5 h-5" />
            下载 (ZIP)
          </a>
        </div>

        {/* Requirements */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-emerald-100 shadow-sm">
          <h3 className="font-semibold text-emerald-900 mb-3">系统要求</h3>
          <ul className="space-y-2 text-sm text-emerald-700">
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />Windows 10/11</li>
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />Python 3.8+</li>
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />DeepSeek API Key（在设置中配置）</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
