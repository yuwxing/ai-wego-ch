export async function onRequest(context: { request: Request }): Promise<Response> {
  const url = new URL(context.request.url)
  const query = url.searchParams.get('q')?.trim()

  if (!query) {
    return new Response(JSON.stringify({ error: 'Missing ?q=' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const engines = [
    { name: 'bing', fn: () => searchBing(query) },
    { name: 'ddg', fn: () => searchDuckDuckGo(query) },
  ]

  for (const engine of engines) {
    try {
      const results = await engine.fn()
      if (results.length > 0) {
        return new Response(JSON.stringify({ results }), {
          headers: { 'Content-Type': 'application/json' },
        })
      }
    } catch {}
  }

  return new Response(JSON.stringify({ error: '未搜索到结果' }), {
    status: 404,
    headers: { 'Content-Type': 'application/json' },
  })
}

async function searchBing(query: string) {
  const resp = await fetch(
    `https://cn.bing.com/search?q=${encodeURIComponent(query)}&count=15`,
    {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Referer': 'https://cn.bing.com/',
      },
      signal: AbortSignal.timeout(12000),
    },
  )

  const html = await resp.text()
  const results: { title: string; url: string; snippet: string }[] = []

  const liRegex = /<li class="b_algo"[^>]*>([\s\S]*?)<\/li>/gi
  let m
  while ((m = liRegex.exec(html)) !== null) {
    const item = m[1]

    const titleMatch = item.match(/<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i)
    if (!titleMatch) continue
    let href = titleMatch[1].trim()
    if (!href.startsWith('http')) continue

    const title = titleMatch[2].replace(/<[^>]+>/g, '').trim()
    if (!title) continue

    const snippetMatch = item.match(/<p[^>]*>([\s\S]*?)<\/p>/i)
    const snippet = snippetMatch ? snippetMatch[1].replace(/<[^>]+>/g, '').trim() : ''

    href = decodeDdgUrl(href)

    results.push({ title, url: href, snippet })
    if (results.length >= 10) break
  }

  return results
}

async function searchDuckDuckGo(query: string) {
  const resp = await fetch(
    `https://lite.duckduckgo.com/lite/?q=${encodeURIComponent(query)}`,
    {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html',
        'Accept-Language': 'zh-CN,zh;q=0.9',
      },
      signal: AbortSignal.timeout(10000),
    },
  )

  const html = await resp.text()
  const results: { title: string; url: string; snippet: string }[] = []

  const trRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi
  let m
  while ((m = trRegex.exec(html)) !== null) {
    const tr = m[1]
    const linkMatch = tr.match(/<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i)
    if (!linkMatch) continue
    let href = linkMatch[1].trim()
    if (href.startsWith('//')) href = 'https:' + href
    if (!href.startsWith('http')) continue
    const title = linkMatch[2].replace(/<[^>]+>/g, '').trim()
    if (!title) continue
    results.push({ title, url: decodeDdgUrl(href), snippet: '' })
  }

  const snippetRegex = /<td[^>]*class="result-snippet"[^>]*>([\s\S]*?)<\/td>/gi
  let si = 0
  while ((m = snippetRegex.exec(html)) !== null && si < results.length) {
    results[si].snippet = m[1].replace(/<[^>]+>/g, '').trim()
    si++
  }

  return results.filter(r => r.url)
}

function decodeDdgUrl(url: string): string {
  const match = url.match(/uddg=([^&]+)/)
  if (match) return decodeURIComponent(match[1])
  return url
}
