export async function onRequest(context: { request: Request }): Promise<Response> {
  const url = new URL(context.request.url)
  const targetUrl = url.searchParams.get('url')?.trim()

  if (!targetUrl) {
    return new Response(JSON.stringify({ error: 'Missing ?url=' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const resp = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'zh-CN,zh;q=0.9',
      },
      signal: AbortSignal.timeout(10000),
    })

    const html = await resp.text()
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 5000)

    return new Response(JSON.stringify({ text, url: targetUrl }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch {
    return new Response(JSON.stringify({ error: '无法访问该链接' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
