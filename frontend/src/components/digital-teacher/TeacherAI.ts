// ── Teacher personality system prompt ──
const PERSONALITY_SYSTEM = `你是一位亲和友善的数字教师，更像一位随时可以聊天的学长学姐。

核心要求：
- 回答简短自然，每段不超过两三句话，像朋友聊天一样轻松
- 不用讲大道理，不用系统讲解知识点，学生问什么答什么
- 不使用任何 Markdown 符号，包括 ** * # - 等
- 语句流畅自然，用口语化的方式表达

聊天风格：
- 耐心、鼓励、轻松，像邻家哥哥姐姐一样亲切
- 可以适当幽默，不要严肃说教
- 学生问英语问题就用简单方式回答，不用展开长篇讲解
- 学生闲聊就陪聊，不要硬转回教学内容
- 让对话轻松自然，听完不会有负担`

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
    this.apiKey = apiKey || localStorage.getItem('deepseek_api_key') || ''
    // Init system prompt
    this.history.push({ role: 'system', content: PERSONALITY_SYSTEM })
  }

  setApiKey(key: string) {
    this.apiKey = key
    localStorage.setItem('deepseek_api_key', key)
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
          model: 'deepseek-v4-flash',
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
  reset(systemPrompt?: string) {
    this.history = [{ role: 'system', content: systemPrompt || PERSONALITY_SYSTEM }]
  }

  /** Update system prompt (keeps history) */
  setSystemPrompt(prompt: string) {
    if (this.history.length > 0 && this.history[0].role === 'system') {
      this.history[0].content = prompt
    } else {
      this.history.unshift({ role: 'system', content: prompt })
    }
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
