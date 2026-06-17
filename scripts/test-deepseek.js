const key = process.env.DEEPSEEK_API_KEY || "";
if (!key) { console.log("KEY NOT SET"); process.exit(1); }

async function main() {
  console.log("1. Sending request to DeepSeek...");
  const resp = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [{ role: "user", content: "Say hello in 5 words" }],
      temperature: 0.3,
      max_tokens: 100
    })
  });
  console.log("2. Status:", resp.status, resp.ok ? "OK" : "FAIL");

  const text = await resp.text();
  console.log("3. Body length:", text.length);
  console.log("4. First 300 chars:", text.slice(0, 300));

  if (!resp.ok) { console.log("5. API ERROR"); return; }

  let data;
  try { data = JSON.parse(text); } catch (e) { console.log("5. JSON PARSE ERROR:", e.message); return; }
  console.log("6. Parse OK");

  const content = data.choices?.[0]?.message?.content;
  if (!content) { console.log("7. NO CONTENT"); return; }
  console.log("8. Content:", content);
}
main().catch(e => console.log("FATAL:", e.message));
