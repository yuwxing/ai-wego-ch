const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, '..', 'word');
const OUT_DIR = path.join(__dirname, '..', 'frontend', 'src', 'data');

// Strip page number suffix like "  p.12" or "  p.1"
function stripPage(s) {
  return s.replace(/\s{2,}p\.\d+(\s*$|$)/, '').trim();
}

// Parse "/phonetic/" + meaning from rest
function parseRest(s) {
  s = s.trim();
  const m = s.match(/^(\/.+?\/)\s*(.*)$/);
  if (m) return { phonetic: m[1], meaning: m[2].trim() };
  return { phonetic: '', meaning: s };
}

// --- Bullet format: - **word** /phonetic/ pos meaning  p.X ---
function parseBullet(line) {
  line = stripPage(line);
  const m = line.match(/^-\s+\*\*(.+?)\*\*\s*(.*)$/);
  if (!m) return null;
  const word = m[1].trim();
  return { word, ...parseRest(m[2]) };
}

// --- Table format: | seq | word | /phonetic/ | pos | meaning | changes | ---
function parseTable(line) {
  if (!line.startsWith('|')) return null;
  let l = line.replace(/^\|/, '').replace(/\|$/, '').trim();
  const cols = l.split('|').map(c => c.trim());
  if (cols.length < 4) return null;
  const word = cols[1];
  const phonetic = cols[2] || '';
  const pos = cols[3] || '';
  const def = cols[4] || '';
  const changes = cols[5] || '';
  let meaning = [pos, def, changes].filter(Boolean).join(' ').replace(/\s{2,}/g, ' ');
  return { word, phonetic, meaning };
}

// --- Plain format: word /phonetic/ pos meaning  p.X ---
function parsePlain(line) {
  line = stripPage(line);
  if (!line) return null;
  // Skip if starts with a POS continuation marker like "n.", "v.", "adj." after a blank line
  // word /phonetic/ rest...
  const m = line.match(/^(.+?)\s+(\/.+?\/)\s*(.*)$/);
  if (m) return { word: m[1].trim(), phonetic: m[2], meaning: m[3].trim() };
  // No phonetic: "word meaning"
  const si = line.indexOf(' ');
  if (si > 0) {
    const word = line.substring(0, si).trim();
    const rest = line.substring(si + 1).trim();
    if (rest) return { word, phonetic: '', meaning: rest };
  }
  return line ? { word: line, phonetic: '', meaning: '' } : null;
}

// Check if line looks like a POS continuation (continuation line for a multi-line entry)
function isPosContinuation(line) {
  return /^(n\.|v\.|adj\.|adv\.|pron\.|prep\.|conj\.|interj\.|modal\s|art\.|num\.|phr\.)/.test(line.trim());
}

// Parse a sections-based file
function parseFile(text, { bulletStyle, tableStyle, headers }) {
  const rawLines = text.split('\n');
  const sections = [];
  let currentTitle = null;
  let currentWords = [];
  let prevHadWord = false;

  const flush = () => {
    if (currentTitle && currentWords.length) sections.push({ title: currentTitle, words: currentWords });
    currentTitle = null;
    currentWords = [];
    prevHadWord = false;
  };

  const addWord = (entry) => {
    if (entry && entry.word) {
      currentWords.push(entry);
      prevHadWord = true;
    }
  };

  for (let i = 0; i < rawLines.length; i++) {
    let line = rawLines[i].trimRight();
    const trimmed = line.trim();

    if (!trimmed || trimmed === '---') continue;

    // Section header?
    let headerMatch = null;
    for (const h of headers) {
      if (h === '###' && trimmed.startsWith('### ')) { headerMatch = trimmed.slice(4).trim(); break; }
      if (h === '##' && trimmed.startsWith('## ') && !trimmed.startsWith('###')) { headerMatch = trimmed.slice(3).trim(); break; }
    }
    if (!headerMatch) {
      // Try bold header: **Unit X**
      const bm = trimmed.match(/^\*\*(.+?)\*\*\s*$/);
      if (bm) headerMatch = bm[1].trim();
    }

    if (headerMatch) {
      flush();
      currentTitle = headerMatch;
      prevHadWord = false;
      continue;
    }

    if (!currentTitle) continue;

    // Check for continuation (POS tag following a word entry, after blank line)
    if (isPosContinuation(trimmed) && prevHadWord) {
      // This is a continuation of the previous word's meaning
      if (currentWords.length > 0) {
        const last = currentWords[currentWords.length - 1];
        const continuation = stripPage(trimmed);
        if (continuation) last.meaning += '；' + continuation;
      }
      continue;
    }

    let entry = null;
    if (bulletStyle && trimmed.startsWith('- **')) {
      entry = parseBullet(line);
    } else if (tableStyle && trimmed.startsWith('|') && !trimmed.match(/^\|\s*序号\s*\|/) && !trimmed.match(/^\|\s*-+\s*\|/)) {
      entry = parseTable(line);
    } else if (!bulletStyle || !trimmed.startsWith('- ')) {
      // Skip header-like lines
      if (trimmed.startsWith('#')) continue;
      if (trimmed.match(/^\d+、/)) continue;
      // Skip table header row
      if (trimmed.match(/^\|?\s*序号\s*\|/)) continue;
      if (trimmed.match(/^\|?\s*-+\s*\|/)) continue;
      // Skip page number only lines
      if (trimmed.match(/^p\.\d+$/)) continue;
      
      entry = parsePlain(line);
    }

    if (entry) {
      addWord(entry);
    } else {
      prevHadWord = false;
    }
  }

  flush();
  return sections;
}

// --- File Configs ---
const FILES = [
  {
    grade: 7, file: '七上词汇.txt', label: '七年级上册',
    opts: { bulletStyle: true, tableStyle: false, headers: ['###'] }
  },
  {
    grade: 8, file: '七下词汇.txt', label: '七年级下册',
    opts: { bulletStyle: false, tableStyle: true, headers: ['##'] }
  },
  {
    grade: 9, file: '八上词汇.txt', label: '八年级上册',
    opts: { bulletStyle: true, tableStyle: false, headers: ['##', '###'] }
  },
  {
    grade: 10, file: '八下词汇.txt', label: '八年级下册',
    opts: { bulletStyle: false, tableStyle: false, headers: ['##', '###'] }
  },
];

const allGrades = {};

for (const { grade, file, label, opts } of FILES) {
  const fullPath = path.join(SRC_DIR, file);
  if (!fs.existsSync(fullPath)) { console.error(`Missing: ${fullPath}`); continue; }
  const text = fs.readFileSync(fullPath, 'utf-8');
  let sections = parseFile(text, opts);

  // Merge left/right page sections into adjacent Unit sections (八上/八下)
  // A section whose title contains "左侧" or "右侧" or lacks "Unit" gets merged
  // into the nearest "Unit" section
  if ([9, 10].includes(grade)) {
    const merged = [];
    for (const s of sections) {
      const isUnit = /Unit/i.test(s.title);
      const isSide = /左侧|右侧|页面/.test(s.title);
      if (isUnit || !isSide) {
        merged.push({ ...s });
      } else if (merged.length > 0) {
        // Merge into last unit section
        const last = merged[merged.length - 1];
        if (/Unit/i.test(last.title)) {
          last.words.push(...s.words);
        } else {
          merged.push({ ...s });
        }
      } else {
        merged.push({ ...s });
      }
    }
    // Also merge standalone 右侧 sections into the last Unit
    sections = merged;
  }

  // Build unit names and word data
  const unitNames = sections.map(s => s.title);
  const wordData = [];
  sections.forEach((s, si) => {
    s.words.forEach(w => {
      wordData.push({ word: w.word, phonetic: w.phonetic, meaning: w.meaning, unit: si });
    });
  });

  allGrades[grade] = { label, unitNames, wordData };

  console.log(`\nGrade ${grade} (${label}): ${wordData.length} words in ${unitNames.length} sections`);
  unitNames.forEach((u, i) => {
    const cnt = wordData.filter(w => w.unit === i).length;
    console.log(`  [${i}] ${u}: ${cnt} words`);
  });
}

// Generate TypeScript
let ts = `// Auto-generated by parse-vocab.js
export interface Word {
  word: string;
  phonetic: string;
  meaning: string;
  unit: number;
}

export interface GradeConfig {
  label: string;
  units: string[];
}

export const GRADE_CONFIG: Record<number, GradeConfig> = {\n`;

for (const g of [7, 8, 9, 10]) {
  const gc = allGrades[g];
  ts += `  ${g}: { label: '${gc.label}', units: ${JSON.stringify(gc.unitNames)} },\n`;
}

ts += `};

export const WORD_DATA: Record<number, Word[]> = {\n`;
for (const g of [7, 8, 9, 10]) {
  ts += `  ${g}: ${JSON.stringify(allGrades[g].wordData, null, 2)},\n`;
}
ts += `};\n`;

fs.writeFileSync(path.join(OUT_DIR, 'wordData.ts'), ts, 'utf-8');
console.log('\nDone!');
