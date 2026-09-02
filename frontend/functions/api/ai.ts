/* ============================================================
 * English Growth Hub · AI 自动批改（Cloudflare Pages Functions）
 *
 *   POST /api/ai  { action:'grade' }        调用大模型批改一份作业
 *   POST /api/ai  { action:'saveConfig' }   保存该工作区的 AI 配置到 KV
 *   POST /api/ai  { action:'getConfig' }    读取配置（密钥只回掩码）
 *   POST /api/ai  { action:'test' }         测试模型连通性
 *
 * 密钥优先取工作区配置（cfg:<key>），其次取站点环境变量 AI_API_KEY / AI_BASE_URL / AI_MODEL。
 * 学生端不需要任何配置：批改在服务端完成，密钥不会下发到浏览器。
 * ============================================================ */

const ALLOWED_ORIGINS = [
  'https://ai-wego.top',
  'https://www.ai-wego.top',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
]

function corsHeaders(origin: string) {
  const allow = ALLOWED_ORIGINS.includes(origin) ? origin : 'https://ai-wego.top'
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, x-growth-key',
    'Access-Control-Max-Age': '86400',
    'Cache-Control': 'no-store',
  }
}

function json(data: unknown, headers: Record<string, string>, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  })
}

interface AiCfg {
  baseUrl: string
  apiKey: string
  model: string
}

const DEFAULT_BASE = 'https://api.deepseek.com/v1'
const DEFAULT_MODEL = 'deepseek-chat'

function mask(k: string): string {
  if (!k) return ''
  if (k.length <= 8) return '****'
  return `${k.slice(0, 4)}****${k.slice(-4)}`
}

async function readCfg(env: any, key: string): Promise<AiCfg | null> {
  if (key && env.GROWTH_DB) {
    const raw = await env.GROWTH_DB.get('cfg:' + key).catch(() => null)
    if (raw) {
      try {
        const o = JSON.parse(raw) as Partial<AiCfg>
        if (o.apiKey) {
          return {
            baseUrl: o.baseUrl || DEFAULT_BASE,
            apiKey: o.apiKey,
            model: o.model || DEFAULT_MODEL,
          }
        }
      } catch {
        /* ignore */
      }
    }
  }
  const envKey = (env.AI_API_KEY as string) || ''
  if (envKey) {
    return {
      baseUrl: (env.AI_BASE_URL as string) || DEFAULT_BASE,
      apiKey: envKey,
      model: (env.AI_MODEL as string) || DEFAULT_MODEL,
    }
  }
  return null
}

/* ------------------- 提示词 ------------------- */

interface GradePayload {
  studentName?: string
  title?: string
  unit?: string
  type?: string
  desc?: string
  answerKey?: string
  content?: string
}

function buildPrompt(p: GradePayload): string {
  return [
    '你是中国初中八年级英语教师，正在批改一份学生作业。',
    '',
    `作业标题：${p.title || '未命名作业'}`,
    `所属单元：${p.unit || '未标注'}`,
    `作业类型：${p.type === 'advanced' ? '提升作业（鼓励表达）' : '基础作业（全体完成）'}`,
    p.desc ? `作业要求：${p.desc}` : '',
    p.answerKey ? `参考答案 / 评分要点：${p.answerKey}` : '',
    '',
    '学生提交内容：',
    '"""',
    (p.content || '').slice(0, 4000) || '（学生未填写内容）',
    '"""',
    '',
    '请按八年级英语水平批改，给出鼓励为主、具体可操作的反馈。',
    '只输出一个 JSON 对象，不要任何解释文字和代码块标记，结构如下：',
    '{"score":0-100的整数,"correctRate":0-100的整数,"grade":"A+|A|B|C|D 之一","comment":"60字以内的中文评语，先肯定再提改进",',
    '"summary":"一句话总体评价","highlights":["亮点1","亮点2"],',
    '"mistakes":[{"text":"原句或原词","type":"语法|拼写|用词|句型|时态|其他","fix":"修改后的正确写法","why":"10字以内的中文说明"}],',
    '"suggestion":"20字以内的下一步改进建议"}',
    '评分尺度：90-100 优秀(A+)，80-89 良好(A)，70-79 达标(B)，60-69 需要订正(C)，60 以下需要辅导(D)。',
    '若学生未填写内容或内容明显无效，score 给 0-20，grade 给 D，comment 提醒补交。',
  ]
    .filter(Boolean)
    .join('\n')
}

const SYSTEM =
  'You are a strict but encouraging middle-school English teacher. Always answer with a single valid JSON object, no markdown fences.'

/** 从模型输出中抠出 JSON 对象 */
function extractJson(text: string): any | null {
  const cleaned = text.replace(/```json/gi, '```').replace(/```/g, '')
  try {
    return JSON.parse(cleaned)
  } catch {
    /* continue */
  }
  const start = cleaned.indexOf('{')
  const end = cleaned.lastIndexOf('}')
  if (start >= 0 && end > start) {
    try {
      return JSON.parse(cleaned.slice(start, end + 1))
    } catch {
      return null
    }
  }
  return null
}

function normalize(o: any): any {
  const num = (v: unknown, def: number) => {
    const n = Number(v)
    return Number.isFinite(n) ? Math.max(0, Math.min(100, Math.round(n))) : def
  }
  const score = num(o?.score, 0)
  const correctRate = num(o?.correctRate, score)
  let grade = String(o?.grade ?? '').trim()
  if (!['A+', 'A', 'B', 'C', 'D'].includes(grade)) {
    grade = score >= 90 ? 'A+' : score >= 80 ? 'A' : score >= 70 ? 'B' : score >= 60 ? 'C' : 'D'
  }
  const arr = (v: unknown): string[] =>
    Array.isArray(v) ? v.map((x) => String(x)).filter(Boolean).slice(0, 6) : []
  const mistakes = Array.isArray(o?.mistakes)
    ? o.mistakes.slice(0, 8).map((m: any) => ({
        text: String(m?.text ?? '').slice(0, 120),
        type: String(m?.type ?? '其他'),
        fix: String(m?.fix ?? '').slice(0, 120),
        why: String(m?.why ?? '').slice(0, 60),
      }))
    : []
  return {
    score,
    correctRate,
    grade,
    comment: String(o?.comment ?? '').slice(0, 200),
    summary: String(o?.summary ?? '').slice(0, 200),
    highlights: arr(o?.highlights),
    mistakes,
    suggestion: String(o?.suggestion ?? '').slice(0, 120),
  }
}

async function callLLM(cfg: AiCfg, prompt: string, maxTokens = 900): Promise<{ ok: boolean; data?: any; error?: string }> {
  const base = (cfg.baseUrl || DEFAULT_BASE).replace(/\/+$/, '')
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 45000)
  try {
    const res = await fetch(`${base}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cfg.apiKey}`,
      },
      body: JSON.stringify({
        model: cfg.model || DEFAULT_MODEL,
        messages: [
          { role: 'system', content: SYSTEM },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
        max_tokens: maxTokens,
      }),
      signal: ctrl.signal,
    })
    const txt = await res.text()
    if (!res.ok) return { ok: false, error: `模型返回 ${res.status}: ${txt.slice(0, 160)}` }
    let parsed: any
    try {
      parsed = JSON.parse(txt)
    } catch {
      return { ok: false, error: '模型返回内容无法解析' }
    }
    const content: string =
      parsed?.choices?.[0]?.message?.content ?? parsed?.choices?.[0]?.text ?? ''
    const obj = extractJson(content)
    if (!obj) return { ok: false, error: '模型未返回可解析的 JSON' }
    return { ok: true, data: normalize(obj) }
  } catch (e) {
    return { ok: false, error: (e as Error).message || '模型调用失败' }
  } finally {
    clearTimeout(timer)
  }
}

/* ------------------- 路由 ------------------- */

export async function onRequest(context: { request: Request; env: Record<string, any> }): Promise<Response> {
  const { request, env } = context
  const origin = request.headers.get('Origin') || ''
  const h = corsHeaders(origin)

  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: h })
  if (request.method !== 'POST') return json({ error: 'method not allowed' }, h, 405)

  const key = (request.headers.get('x-growth-key') || '').trim()
  let body: any = {}
  try {
    body = await request.json()
  } catch {
    return json({ error: 'invalid json' }, h, 400)
  }
  const action = String(body?.action || '')

  if (action === 'getConfig') {
    const cfg = await readCfg(env, key)
    return json(
      {
        ok: true,
        configured: !!cfg,
        baseUrl: cfg?.baseUrl ?? DEFAULT_BASE,
        model: cfg?.model ?? DEFAULT_MODEL,
        masked: mask(cfg?.apiKey ?? ''),
        source: cfg ? 'workspace' : 'none',
      },
      h,
    )
  }

  if (action === 'saveConfig') {
    if (!key) return json({ error: 'missing key' }, h, 400)
    if (!env.GROWTH_DB) return json({ error: 'KV_NOT_BOUND' }, h, 500)
    const incoming: AiCfg = {
      baseUrl: String(body.baseUrl || DEFAULT_BASE).trim() || DEFAULT_BASE,
      apiKey: String(body.apiKey || '').trim(),
      model: String(body.model || DEFAULT_MODEL).trim() || DEFAULT_MODEL,
    }
    if (!incoming.apiKey) {
      // 清空配置
      await env.GROWTH_DB.delete('cfg:' + key).catch(() => {})
      return json({ ok: true, configured: false }, h)
    }
    await env.GROWTH_DB.put('cfg:' + key, JSON.stringify({ ...incoming, updatedAt: Date.now() }))
    return json({ ok: true, configured: true, masked: mask(incoming.apiKey) }, h)
  }

  if (action === 'test') {
    const cfg = await readCfg(env, key)
    if (!cfg) return json({ ok: false, error: '尚未配置 AI 模型密钥' }, h, 200)
    const r = await callLLM(cfg, '请只回复：{"ok":true,"model":"' + cfg.model + '"}', 60)
    if (!r.ok) return json({ ok: false, error: r.error }, h, 200)
    return json({ ok: true, model: cfg.model, masked: mask(cfg.apiKey) }, h)
  }

  if (action === 'grade') {
    const cfg = await readCfg(env, key)
    if (!cfg) return json({ ok: false, error: 'NO_AI_CONFIG' }, h, 200)
    const content = String(body.content ?? '')
    const r = await callLLM(cfg, buildPrompt(body as GradePayload))
    if (!r.ok) return json({ ok: false, error: r.error }, h, 200)
    return json(
      {
        ok: true,
        engine: 'ai',
        model: cfg.model,
        gradedAt: new Date().toISOString(),
        ...r.data,
      },
      h,
    )
  }

  return json({ error: 'unknown action' }, h, 400)
}
