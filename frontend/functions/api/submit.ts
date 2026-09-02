/* ============================================================
 * English Growth Hub · 作业增量同步（Cloudflare Pages Functions）
 *
 *   POST /api/submit  { action:'submit' }  学生提交作业（增量写入，不覆盖整库）
 *   POST /api/submit  { action:'grade'  }  写回批改结果
 *   GET  /api/submit?assignmentId=xxx      教师端收取该作业的提交（不覆盖整库）
 *   GET  /api/submit                      返回该工作区全部提交记录
 *
 * 为什么不用整库 PUT：多学生同时提交会互相覆盖。
 * 这里在服务端做「读-改-写」的单条更新，多人并发也只影响各自那一条。
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

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

async function loadDb(env: any, key: string): Promise<any | null> {
  if (!env.GROWTH_DB) return null
  const raw = await env.GROWTH_DB.get('ws:' + key).catch(() => null)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

async function saveDb(env: any, key: string, db: any): Promise<void> {
  await env.GROWTH_DB.put('ws:' + key, JSON.stringify(db))
}

function upsertSubmission(db: any, input: any): { sub: any; created: boolean } {
  if (!Array.isArray(db.submissions)) db.submissions = []
  const list = db.submissions
  let sub = list.find(
    (s: any) =>
      s &&
      s.assignmentId === input.assignmentId &&
      (s.studentId === input.studentId ||
        (input.studentName && s.studentName === input.studentName)),
  )
  if (sub) return { sub, created: false }

  // 还没有提交记录（例如教师布置作业后又导入了新学生）：自动补一条
  const assignment = (db.assignments || []).find((a: any) => a.id === input.assignmentId)
  sub = {
    id: input.id || 'SUB' + Math.random().toString(36).slice(2, 9),
    assignmentId: input.assignmentId,
    studentId: input.studentId,
    classId: input.classId || assignment?.classId || '',
    status: 'pending',
    studentName: input.studentName || '',
  }
  list.push(sub)
  return { sub, created: true }
}

export async function onRequest(context: { request: Request; env: Record<string, any> }): Promise<Response> {
  const { request, env } = context
  const url = new URL(request.url)
  const origin = request.headers.get('Origin') || ''
  const h = corsHeaders(origin)

  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: h })

  const key = (request.headers.get('x-growth-key') || '').trim()
  if (!key) return json({ error: 'missing key' }, h, 400)
  if (!env.GROWTH_DB) return json({ error: 'KV_NOT_BOUND' }, h, 500)

  /* ---------------- 教师端：收取提交 ---------------- */
  if (request.method === 'GET') {
    const db = await loadDb(env, key)
    if (!db) return json({ ok: true, empty: true, submissions: [] }, h)
    const assignmentId = url.searchParams.get('assignmentId')
    const subs = (db.submissions || []).filter(
      (s: any) => !assignmentId || s.assignmentId === assignmentId,
    )
    return json({ ok: true, submissions: subs, t: Date.now() }, h)
  }

  /* ---------------- 学生端：提交 / 批改 ---------------- */
  if (request.method === 'POST') {
    let body: any = {}
    try {
      body = await request.json()
    } catch {
      return json({ error: 'invalid json' }, h, 400)
    }

    const db = await loadDb(env, key)
    if (!db) return json({ ok: false, error: 'WORKSPACE_EMPTY', hint: '教师端先同步一次数据到云端' }, h, 200)

    const action = String(body.action || '')

    if (action === 'submit') {
      if (!body.assignmentId || !body.studentId) {
        return json({ ok: false, error: 'missing assignmentId or studentId' }, h, 400)
      }
      const { sub, created } = upsertSubmission(db, body)
      sub.content = String(body.content ?? sub.content ?? '')
      sub.status = 'submitted'
      sub.submittedAt = body.submittedAt || today()
      if (body.studentName) sub.studentName = body.studentName
      if (body.classId) sub.classId = body.classId
      // 拍照/上传的图片（压缩后的 dataURL 数组），仅在传了才更新，避免清掉旧图
      if (Array.isArray(body.images)) sub.images = body.images
      // 重新提交（订正）后清掉旧批改，等待重新批改
      if (!created && body.reresubmit) {
        delete sub.grade
        delete sub.comment
        delete sub.correctRate
        delete sub.score
        delete sub.aiReport
        delete sub.gradedBy
        delete sub.gradedAt
      }
      await saveDb(env, key, db)
      return json({ ok: true, created, submission: sub }, h)
    }

    if (action === 'grade') {
      const { sub } = upsertSubmission(db, body)
      if (body.grade) sub.grade = body.grade
      if (body.comment !== undefined) sub.comment = body.comment
      if (body.correctRate !== undefined) sub.correctRate = Number(body.correctRate)
      if (body.score !== undefined) sub.score = Number(body.score)
      if (body.aiReport !== undefined) sub.aiReport = body.aiReport
      if (body.content !== undefined) sub.content = body.content
      if (Array.isArray(body.images)) sub.images = body.images
      sub.gradedBy = body.gradedBy || 'ai'
      sub.gradedAt = body.gradedAt || new Date().toISOString()
      if (['pending', 'submitted', 'graded', 'revised'].includes(body.status)) sub.status = body.status
      else sub.status = 'graded'
      await saveDb(env, key, db)
      return json({ ok: true, submission: sub }, h)
    }

    return json({ error: 'unknown action' }, h, 400)
  }

  return json({ error: 'method not allowed' }, h, 405)
}
