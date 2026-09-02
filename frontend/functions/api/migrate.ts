/* ============================================================
 * English Growth Hub · 工作区迁移接口
 * 把某个「同步口令」下的整库复制到一个新的口令（便于老师把随机钥匙换成好记的口令，不丢数据）。
 *   POST /api/migrate  body: { from, to }
 * 仅当目标口令为空时才写入，避免覆盖他人数据。
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

function json(data: unknown, headers: Record<string, string>, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  })
}

export async function onRequest(context: { request: Request; env: Record<string, any> }): Promise<Response> {
  const { request, env } = context
  const origin = request.headers.get('Origin') || ''
  const h = corsHeaders(origin)

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: h })
  }
  if (request.method !== 'POST') {
    return json({ error: 'method not allowed' }, h, 405)
  }

  const kv = env.GROWTH_DB as KVNamespace | undefined
  if (!kv) return json({ error: 'KV_NOT_BOUND' }, h, 500)

  let body: any
  try {
    body = await request.json()
  } catch {
    return json({ error: 'invalid json' }, h, 400)
  }

  const from = String(body.from || '').trim().toUpperCase()
  const to = String(body.to || '').trim().toUpperCase()
  if (!from || !to) return json({ error: '缺少源或目标口令' }, h, 400)
  if (from === to) return json({ error: '新旧口令相同' }, h, 400)
  if (to.length < 4) return json({ error: '新口令至少 4 位' }, h, 400)

  const src = await kv.get('ws:' + from)
  if (!src) return json({ error: '源工作区不存在或为空' }, h, 404)

  const dst = await kv.get('ws:' + to)
  if (dst) return json({ error: '目标口令已存在数据，不能覆盖' }, h, 409)

  await kv.put('ws:' + to, src)
  return json({ ok: true }, h)
}
