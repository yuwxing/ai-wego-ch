/* ============================================================
 * English Growth Hub · 云同步后端（Cloudflare Pages Functions）
 * 挂在 ai-wego.top/api/*，与前端同源，免跨域。
 *
 *   GET  /api/db      读取整库（按 x-growth-key 分工作区）
 *   PUT  /api/db      写入整库（JSON 文本）
 *   POST /api/db      同上
 *   GET  /api/health  健康检查
 *
 * 整库 JSON 存于 Cloudflare KV（绑定名 GROWTH_DB），按「同步密钥」划分独立工作区。
 * 本地 localStorage 仍为第一数据源（秒开 + 离线可用），云端用于跨设备一致性。
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
    'Access-Control-Allow-Methods': 'GET, PUT, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, x-growth-key',
    'Access-Control-Max-Age': '86400',
    'Cache-Control': 'no-store',
  }
}

function keyOf(request: Request): string {
  return (request.headers.get('x-growth-key') || '').trim()
}

/* 提交记录状态优先级：graded/revised > submitted > pending */
const SUB_RANK: Record<string, number> = { revised: 4, graded: 3, submitted: 2, pending: 1 }
function pickSubmission(a: any, b: any): any {
  if (!a) return b
  if (!b) return a
  const ra = SUB_RANK[a.status] ?? 0
  const rb = SUB_RANK[b.status] ?? 0
  if (ra !== rb) return ra > rb ? a : b
  const ca = a.content ? 1 : 0
  const cb = b.content ? 1 : 0
  if (ca !== cb) return ca > cb ? a : b
  return b // 同状态时云端优先，避免把已提交的覆盖回 pending
}

/**
 * 合并整库：以「教师端为权威」覆盖同 id 记录，但绝不删除云端已有的记录，
 * 这样教师整库推送也不会丢失学生通过 /api/submit 增量提交/批改的作业。
 */
function mergeDb(incoming: any, existing: any): any {
  const out = { ...(existing || {}) }
  if (!incoming || typeof incoming !== 'object') return out
  for (const key of Object.keys(incoming)) {
    const inc = incoming[key]
    const ext = existing?.[key]
    if (Array.isArray(inc)) {
      if (!Array.isArray(ext) || ext.length === 0) {
        out[key] = inc
      } else if (key === 'submissions') {
        const map = new Map<string, any>()
        ext.forEach((r: any) => map.set(r.id, r))
        inc.forEach((r: any) => {
          const cur = map.get(r.id)
          if (!cur) map.set(r.id, r)
          else map.set(r.id, pickSubmission(cur, r))
        })
        out[key] = [...map.values()]
      } else {
        const map = new Map<string, any>()
        ext.forEach((r: any) => map.set(r.id, r))
        inc.forEach((r: any) => {
          if (r && r.id != null) map.set(r.id, r)
        })
        out[key] = [...map.values()]
      }
    } else {
      out[key] = inc
    }
  }
  return out
}

export async function onRequest(context: { request: Request; env: Record<string, any> }): Promise<Response> {
  const { request, env } = context
  const url = new URL(request.url)
  const origin = request.headers.get('Origin') || ''
  const h = corsHeaders(origin)

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: h })
  }

  if (url.pathname === '/api/health') {
    return json({ ok: true, kv: !!env.GROWTH_DB, t: Date.now() }, h)
  }

  if (url.pathname === '/api/db') {
    const key = keyOf(request)
    if (!key) return json({ error: 'missing key' }, h, 400)

    const kv = env.GROWTH_DB as KVNamespace | undefined
    if (!kv) return json({ error: 'KV_NOT_BOUND' }, h, 500)

    const kvKey = 'ws:' + key

    if (request.method === 'GET') {
      const raw = await kv.get(kvKey)
      if (!raw) return json({ empty: true }, h)
      return new Response(raw, { headers: { 'Content-Type': 'application/json', ...h } })
    }

    if (request.method === 'PUT' || request.method === 'POST') {
      const body = await request.text()
      if (!body || body.length < 2) return json({ error: 'empty body' }, h, 400)
      let parsed: any
      try {
        parsed = JSON.parse(body)
      } catch {
        return json({ error: 'invalid json' }, h, 400)
      }
      const existing = await kv.get(kvKey).then((r: string | null) => (r ? JSON.parse(r) : null)).catch(() => null)
      const merged = mergeDb(parsed, existing)
      await kv.put(kvKey, JSON.stringify(merged))
      return json({ ok: true, bytes: body.length, t: Date.now() }, h)
    }

    return json({ error: 'method not allowed' }, h, 405)
  }

  return json({ error: 'not found' }, h, 404)
}

function json(data: unknown, headers: Record<string, string>, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  })
}
