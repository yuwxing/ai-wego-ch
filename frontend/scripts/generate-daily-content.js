// 每日英语 & 听说内容自动生成脚本
// 由 GitHub Action 定时触发，每日自动运行
// 使用 DeepSeek API 生成内容，写入 Supabase

const SUPABASE_URL = "https://mzjmfyoemcsoqzoooiej.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16am1meW9lbWNzb3F6b29vaWVqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzQ5MDgwMCwiZXhwIjoyMDkzMDY2ODAwfQ.BaovYmOpmOANyo6fmSPKV1FwNwLWlkVVSa7r8KsaMtM";
const DEEPSEEK_KEY = process.env.DEEPSEEK_API_KEY || "";
const PUBLISHER_ID = 18;

async function deepseek(prompt, schema) {
  const resp = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${DEEPSEEK_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: "You are an English education content generator. Generate content in the exact JSON format specified. Use appropriate content for Chinese middle/high school students. All English text must be natural and correct." },
        { role: "user", content: `${prompt}\n\nReturn ONLY valid JSON matching this structure:\n${JSON.stringify(schema, null, 2)}` }
      ],
      temperature: 0.8,
      max_tokens: 4096
    })
  });
  if (!resp.ok) throw new Error(`DeepSeek API error: ${resp.status} ${await resp.text()}`);
  const data = await resp.json();
  const text = data.choices[0].message.content;
  const json = text.replace(/```(?:json)?\s*/gi, "").trim();
  return JSON.parse(json);
}

async function insertTask(status, title, description) {
  const resp = await fetch(`${SUPABASE_URL}/rest/v1/tasks`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      title,
      status,
      description: JSON.stringify(description),
      publisher_id: PUBLISHER_ID,
      source: status === "english_daily" ? "每日自动生成" : "中考听说训练",
      budget: 0,
      requirements: []
    })
  });
  if (!resp.ok) throw new Error(`Supabase insert error: ${resp.status} ${await resp.text()}`);
  return resp.json();
}

async function checkBalance() {
  const resp = await fetch("https://api.deepseek.com/user/balance", {
    headers: { Authorization: `Bearer ${DEEPSEEK_KEY}` }
  });
  if (!resp.ok) return { error: `Balance check failed: ${resp.status}` };
  return resp.json();
}

const today = () => new Date().toISOString().slice(0, 10);

const englishDailySchema = {
  date: "2026-05-25",
  title_cn: "中文标题",
  title_en: "English Title",
  source: "高考英语",
  article: "English passage about the topic (150-200 words)",
  translation: "中文翻译",
  vocabulary: [
    { word: "word", phonetic: "/fəˈnetɪk/", meaning: "中文释义", example: "Example sentence." }
  ],
  grammar: {
    topic: "语法点名称",
    rules: ["规则1", "规则2"],
    examples: ["示例1", "示例2"]
  },
  reading_questions: [
    { question: "Question?", options: ["A. Option A", "B. Option B", "C. Option C", "D. Option D"], answer: "A" }
  ],
  writing: {
    topic: "写作题目",
    requirements: ["要求1", "要求2"],
    tips: ["提示1", "提示2"],
    word_range: "100"
  }
};

const listeningDailySchema = {
  date: "2026-05-25",
  title_cn: "中文标题",
  title_en: "English Title",
  source: "中考听说训练",
  part_a: {
    title: "朗读短文",
    passage: "English passage for reading practice (100-150 words)",
    pronunciation_tips: ["发音提示1", "发音提示2", "发音提示3"],
    pause_marks: "Sentence with || pause markers"
  },
  part_b: {
    title: "听选信息",
    conversations: [
      {
        context: "对话场景描述",
        dialogue: "A: Line 1\nB: Line 2",
        questions: [
          { question: "Question?", options: ["A. Opt A", "B. Opt B", "C. Opt C"], answer: "A" }
        ]
      }
    ]
  },
  part_c: {
    title: "情景对话",
    situation: "场景描述",
    role: "你的角色",
    questions: [
      { cn_question: "中文问题", en_answer: "English answer" }
    ]
  },
  part_d: {
    title: "口头作文",
    topic: "作文题目",
    key_points: ["要点1", "要点2", "要点3"],
    sample_answer: "Sample English answer (80-120 words)",
    scoring: { pronunciation: 5, fluency: 5, content: 5, grammar: 5, total: 20 }
  }
};

async function main() {
  console.log(`=== AI-Wego Daily Content Generator ===`);
  console.log(`Date: ${today()}`);
  console.log(`Checking DeepSeek balance...`);

  const balance = await checkBalance();
  if (balance.error) {
    console.error(`BALANCE CHECK FAILED: ${balance.error}`);
  } else {
    const cny = balance.balance_infos?.[0];
    if (cny) {
      const bal = parseFloat(cny.total_balance);
      console.log(`Balance: ${bal} CNY`);
      if (bal < 5) {
        console.log(`::warning title=LowBalance::DeepSeek balance is low: ${bal} CNY. Please recharge soon.`);
      }
      if (bal < 1) {
        console.log(`::error title=CriticalBalance::DeepSeek balance exhausted! Content generation may fail.`);
      }
    }
  }

  console.log(`\n--- Generating English Daily content... ---`);
  try {
    const englishPrompt = `Generate today's English learning content for Chinese students (high school level). 
    Date: ${today()}.
    Topic: Choose a different everyday topic each day (technology, environment, culture, health, education, travel, etc.).
    Requirements:
    - article: 150-200 words English passage
    - vocabulary: 8 words with phonetic, Chinese meaning, example sentence
    - grammar: Pick ONE grammar point, explain in Chinese, give 2-4 English examples
    - reading_questions: 4 multiple-choice questions with 4 options each
    - writing: A writing topic in Chinese, 3 requirements, 2 tips, word_range "100"
    - Make questions realistic for exam prep`;

    const englishContent = await deepseek(englishPrompt, englishDailySchema);
    englishContent.date = today();
    englishContent.source = englishContent.source || "高考英语";

    const englishTitle = `${today().replace(/-/g, "")} ${englishContent.source}`;
    const inserted = await insertTask("english_daily", englishTitle, englishContent);
    console.log(`✅ English Daily created: ${englishTitle} (id: ${inserted?.id || "unknown"})`);
  } catch (e) {
    console.error(`❌ English Daily failed: ${e.message}`);
  }

  console.log(`\n--- Generating Listening & Speaking content... ---`);
  try {
    const lsPrompt = `Generate today's Listening & Speaking training content for Chinese middle school students (中考 level).
    Date: ${today()}.
    Topic: School life, family, friends, hobbies, travel, food, health, etc. (different each day).
    Requirements:
    - part_a: Reading passage 100-150 words, with 3 pronunciation tips in Chinese, and pause marks using ||
    - part_b: 2-3 conversations, each 4-6 dialogue lines, 2 questions per conversation (3 options each)
    - part_c: 1 situation scenario in Chinese, 5 questions in Chinese with English reference answers
    - part_d: Speaking topic in Chinese, 3 key points, sample answer 80-120 words, scoring out of 20`;

    const lsContent = await deepseek(lsPrompt, listeningDailySchema);
    lsContent.date = today();
    lsContent.source = lsContent.source || "中考听说训练";

    const lsTitle = `${today().slice(5).replace("-", "")} 听说每日训练`;
    const inserted = await insertTask("ls_daily", lsTitle, lsContent);
    console.log(`✅ Listening & Speaking created: ${lsTitle} (id: ${inserted?.id || "unknown"})`);
  } catch (e) {
    console.error(`❌ Listening & Speaking failed: ${e.message}`);
  }

  console.log(`\n--- Generating 外刊精读 content... ---`);
  try {
    const rdPrompt = `Generate a simplified adapted reading passage based on The Economist (Science & Tech) or Scientific American style.
Date: ${today()}.
Topic: Choose a science/technology topic each day (AI, climate, space, biotech, neuroscience, energy, computing, medicine, etc.) - DIFFERENT topic every day.

Requirements:
- article: 280-450 words adapted English passage (simplified for high school students, natural and engaging)
- translation: Full Chinese translation
- source: Either "经济学人·科技版" or "科学美国人" - alternate each day
- long_sentences: Pick 2-3 complex sentences from the article for deep parsing:
  * The original sentence
  * Chinese translation
  * Structure analysis (主谓宾定状补 breakdown in Chinese)
  * Key grammar points (定语从句、分词作状语、倒装、虚拟语气、强调句等)
  * Word-by-word/phrase breakdown explaining each component's role
- discourse_analysis:
  * text_type: 说明文/议论文/科技报道
  * structure: Overall text structure analysis in Chinese
  * main_idea: Main idea in Chinese
  * key_transitions: Important linking words and their functions
  * paragraph_flow: How each paragraph connects to the next
  * author_attitude: Author's stance/attitude
- reading_questions: 4-5 questions including:
  * 1 main idea question
  * 1-2 detail questions targeting complex sentences
  * 1 inference question
  * 1 discourse logic question (衔接、指代、逻辑关系)
  Each with 4 options and answer, labeled by type.`;

    const rdSchema = {
      date: today(),
      title_cn: "中文标题（10字以内）",
      title_en: "English Title",
      source: "经济学人·科技版 / 科学美国人",
      article: "Adapted passage 280-450 words",
      translation: "全文中文翻译",
      long_sentences: [
        {
          sentence: "Original complex sentence...",
          translation: "中文翻译",
          structure: "主谓宾定状补结构分析",
          grammar_points: ["定语从句", "现在分词作状语"],
          breakdown: [
            { part: "主句", detail: "The core..." },
            { part: "从句", detail: "Modifies..." }
          ]
        }
      ],
      discourse_analysis: {
        text_type: "说明文",
        structure: "总-分-总结构，第一段引出话题，中间三段从不同角度论证...",
        main_idea: "文章讨论了...",
        key_transitions: [
          { word: "However", function: "转折，引出相反观点" },
          { word: "Furthermore", function: "递进，补充论据" }
        ],
        paragraph_flow: ["段落一：引出话题...", "段落二：...", "段落三：..."],
        author_attitude: "客观中立，倾向于支持..."
      },
      questions: [
        { question: "Question?", options: ["A.", "B.", "C.", "D."], answer: "A", type: "main_idea | detail | inference | discourse" }
      ]
    };

    const rdContent = await deepseek(rdPrompt, rdSchema);
    rdContent.date = today();

    const rdTitle = `${today().replace(/-/g, "")} 外刊精读 · ${rdContent.source || "经济学人"}`;
    const inserted = await insertTask("reading_intensive", rdTitle, rdContent);
    console.log(`✅ 外刊精读 created: ${rdTitle} (id: ${inserted?.id || "unknown"})`);
  } catch (e) {
    console.error(`❌ 外刊精读 failed: ${e.message}`);
  }

  console.log(`\n=== Done ===`);
}

main().catch(e => {
  console.error(`FATAL: ${e.message}`);
  process.exit(1);
});
