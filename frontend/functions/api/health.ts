/* ============================================================
 * English Growth Hub · 健康检查（Cloudflare Pages Functions）
 *
 *   GET /api/health   返回 KV 绑定状态与服务器时间戳
 *
 * 注意：Pages Functions 是按「文件路径」匹配路由的，
 * 所以健康检查必须单独成文件。写在 functions/api/db.ts 里的
 * `url.pathname === '/api/health'` 分支永远不会被执行
 * （该文件只匹配 /api/db），属死代码。
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
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
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

  if (request.method !== 'GET') {
    return json({ error: 'method not allowed' }, h, 405)
  }

  // kv 为 false 说明 Pages 项目里没有绑定 GROWTH_DB，云同步会不可用
  return json({ ok: true, kv: !!env.GROWTH_DB, t: Date.now() }, h)
}
