const SUPABASE_URL = "https://mzjmfyoemcsoqzoooiej.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16am1meW9lbWNzb3F6b29vaWVqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzQ5MDgwMCwiZXhwIjoyMDkzMDY2ODAwfQ.BaovYmOpmOANyo6fmSPKV1FwNwLWlkVVSa7r8KsaMtM";
const DEEPSEEK_KEY = process.env.DEEPSEEK_API_KEY || "";
const today = () => new Date().toISOString().slice(0, 10);

async function deepseek() {
  const prompt = `Generate a simplified adapted reading passage based on The Economist (Science & Tech) or Scientific American style.
Date: ${today()}.
Topic: Choose a different science/technology topic each week (AI, climate, space, biotech, neuroscience, energy, computing, medicine, etc.).

Requirements:
- article: 280-450 words adapted English passage (simplified for high school students)
- translation: Full Chinese translation
- source: Alternate between "经济学人·科技版" and "科学美国人"
- long_sentences: Pick 2-3 complex sentences for deep parsing:
  * sentence + translation + structure analysis (主谓宾定状补)
  * grammar_points (定语从句、分词作状语、倒装等)
  * phrase-level breakdown
- discourse_analysis:
  * text_type, structure, main_idea (all in Chinese)
  * key_transitions: linking words with function descriptions
  * paragraph_flow: how paragraphs connect
  * author_attitude
- questions: 4-5 questions (main_idea, detail, inference, discourse types), each with 4 options and answer`;

  const schema = {
    date: today(), title_cn: "中文标题", title_en: "English Title",
    source: "经济学人·科技版", article: "Adapted passage",
    translation: "全文中文翻译",
    long_sentences: [{ sentence: "", translation: "", structure: "", grammar_points: [""], breakdown: [{ part: "", detail: "" }] }],
    discourse_analysis: { text_type: "", structure: "", main_idea: "", key_transitions: [{ word: "", function: "" }], paragraph_flow: [""], author_attitude: "" },
    questions: [{ question: "", options: ["A.", "B.", "C.", "D."], answer: "A", type: "main_idea" }]
  };

  const resp = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${DEEPSEEK_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: "You are an English education content generator. Generate content in exact JSON format. For Chinese high school students." },
        { role: "user", content: `${prompt}\n\nReturn ONLY valid JSON matching this structure:\n${JSON.stringify(schema, null, 2)}` }
      ],
      temperature: 0.7,
      max_tokens: 8192
    })
  });
  if (!resp.ok) { const errText = await resp.text(); throw new Error(`DeepSeek error: ${resp.status} - ${errText.slice(0, 200)}`); }
  const bodyText = await resp.text();
  if (!bodyText.trim()) throw new Error(`Empty body from DeepSeek (status 200)`);
  let data;
  try { data = JSON.parse(bodyText); } catch (e) { throw new Error(`DeepSeek response not JSON: ${bodyText.slice(0, 500)}`); }
  const raw = data.choices[0]?.message?.content || "";
  const text = raw.replace(/```(?:json)?\s*|```/gi, "").trim();
  if (!text) throw new Error(`Empty response from DeepSeek. Raw: ${JSON.stringify(data).slice(0, 300)}`);
  try {
    return JSON.parse(text);
  } catch (e) {
    throw new Error(`JSON parse failed. First 500 chars: ${text.slice(0, 500)}`);
  }
}

async function insertTask(title, content) {
  const resp = await fetch(`${SUPABASE_URL}/rest/v1/tasks`, {
    method: "POST",
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      title, status: "reading_intensive",
      description: JSON.stringify(content),
      publisher_id: 18, source: "每周外刊精读", budget: 0, requirements: []
    })
  });
  if (!resp.ok) throw new Error(`Supabase insert error: ${resp.status}`);
  return resp.json();
}

async function main() {
  console.log(`=== Weekly 外刊精读 Generator ===`);
  console.log(`Date: ${today()}`);

  if (!DEEPSEEK_KEY) {
    console.error("DEEPSEEK_API_KEY not set");
    process.exit(1);
  }

  console.log(`Generating 外刊精读...`);
  const content = await deepseek();
  content.date = today();

  const title = `${today().replace(/-/g, "")} 外刊精读 · ${content.source || "经济学人"}`;
  const inserted = await insertTask(title, content);
  console.log(`Created: ${title} (id: ${inserted?.id || "unknown"})`);
  console.log(`=== Done ===`);
}

main().catch(e => { console.error(`FATAL: ${e.message}`); process.exit(1); });