// ── Teacher personality system prompt ──
const PERSONALITY_SYSTEM = `你是一位专业的 AI 英语数字教师。你的性格特点：
- 耐心、专业、鼓励式教学
- 讲解英语语法时结构清晰，给出例句
- 根据学生水平调整用词难度
- 鼓励学生开口说英语
- 在纠正错误时先肯定再指正

教学风格：
- 用中文讲解，配合英文例句
- 重点语法点会给出公式化总结
- 每讲完一个点主动问学生是否理解
- 适时出小练习检验理解`

// ── Conversation history context ──
const CONTEXT_WINDOW = 6  // Last N exchanges to include

// ── DeepSeek API ──
const API_URL = 'https://api.deepseek.com/v1/chat/completions'

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export class TeacherAI {
  private apiKey: string
  private history: ChatMessage[] = []
  private abortController: AbortController | null = null

  constructor(apiKey?: string) {
    this.apiKey = apiKey || localStorage.getItem('deepseek-api-key') || ''
    // Init system prompt
    this.history.push({ role: 'system', content: PERSONALITY_SYSTEM })
  }

  setApiKey(key: string) {
    this.apiKey = key
    localStorage.setItem('deepseek-api-key', key)
  }

  /** Send a message and get response */
  async send(text: string): Promise<string> {
    if (!this.apiKey) return '⚠️ 请先在设置中输入 DeepSeek API Key'

    this.history.push({ role: 'user', content: text })

    // Trim history to context window (oldest user/assistant pairs)
    if (this.history.length > CONTEXT_WINDOW * 2 + 1) {
      const systemMsg = this.history[0]
      this.history = [
        systemMsg,
        ...this.history.slice(-CONTEXT_WINDOW * 2),
      ]
    }

    this.abortController = new AbortController()

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: this.history,
          temperature: 0.7,
          max_tokens: 1024,
          stream: false,
        }),
        signal: this.abortController.signal,
      })

      if (!res.ok) {
        const err = await res.text()
        throw new Error(`API error ${res.status}: ${err}`)
      }

      const data = await res.json()
      const reply = data.choices?.[0]?.message?.content || '抱歉，我没有理解你的问题。'
      this.history.push({ role: 'assistant', content: reply })
      return reply
    } catch (err: any) {
      if (err.name === 'AbortError') return ''
      return `⚠️ ${err.message}`
    }
  }

  /** Cancel current request */
  cancel() {
    this.abortController?.abort()
  }

  /** Reset conversation */
  reset() {
    this.history = [{ role: 'system', content: PERSONALITY_SYSTEM }]
  }

  /** Get a summary of recent conversation for memory */
  getRecentSummary(): string {
    const recent = this.history.slice(-4)  // Last 2 exchanges
    return recent
      .filter(m => m.role !== 'system')
      .map(m => `${m.role === 'user' ? '学生' : '教师'}: ${m.content.slice(0, 100)}`)
      .join('\n')
  }
}
