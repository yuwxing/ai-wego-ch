import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Volume2, Check, X, RefreshCw, BookOpen, RotateCw, VolumeX, PenLine, ClipboardList, Speaker } from 'lucide-react';
import { GRADE_CONFIG, WORD_DATA, Word } from '../data/wordData';

type Mode = 'learn' | 'wrong' | 'dictation' | 'test';

const STORAGE_KEY = 'wordcard_v2';
const WRONG_BOOK_KEY = 'wrongBook_v2';
const GRADES = [7, 8, 9, 10];

interface SavedState {
  grade: number;
  section: number;
  index: number;
  learned: string[];
  wrong: string[];
}

interface WrongBookEntry {
  word: string;
  phonetic: string;
  meaning: string;
  wrongCount: number;
  grade: number;
  section: number;
}

interface DictationResult {
  word: string;
  correct: boolean;
  userAnswer: string;
}

function loadState(): SavedState | null {
  try { const r = localStorage.getItem(STORAGE_KEY); return r ? JSON.parse(r) : null; } catch { return null; }
}

function saveState(s: SavedState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

function loadWrongBook(): WrongBookEntry[] {
  try { return JSON.parse(localStorage.getItem(WRONG_BOOK_KEY) || '[]'); } catch { return []; }
}

function saveWrongBookEntry(entry: Word, grade: number, section: number) {
  const book = loadWrongBook();
  const exist = book.find(w => w.word === entry.word && w.grade === grade);
  if (exist) { exist.wrongCount += 1; } else { book.push({ ...entry, wrongCount: 1, grade, section }); }
  localStorage.setItem(WRONG_BOOK_KEY, JSON.stringify(book));
}

function speak(text: string) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US'; u.rate = 0.85;
    window.speechSynthesis.speak(u);
  }
}

function shortTitle(t: string) { return t.length > 22 ? t.slice(0, 20) + '…' : t; }

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateOptions(correct: string, allMeanings: string[]): string[] {
  const pool = allMeanings.filter(m => m !== correct);
  const opts = [correct];
  while (opts.length < 4 && pool.length > 0) {
    const r = pool[Math.floor(Math.random() * pool.length)];
    if (!opts.includes(r)) opts.push(r);
  }
  return shuffle(opts);
}

export default function WordCardPage() {
  const navigate = useNavigate();
  const saved = useMemo(loadState, []);
  const answerRef = useRef<HTMLInputElement>(null);

  const [grade, setGrade] = useState(saved?.grade ?? 7);
  const [section, setSection] = useState(saved?.section ?? 0);
  const [mode, setMode] = useState<Mode>('learn');
  const [index, setIndex] = useState(saved?.index ?? 0);
  const [learned, setLearned] = useState<Set<string>>(() => new Set(saved?.learned ?? []));
  const [wrong, setWrong] = useState<Set<string>>(() => new Set(saved?.wrong ?? []));
  const [revealed, setRevealed] = useState(false);
  const [roundDone, setRoundDone] = useState(false);

  // Dictation state
  const [dictAnswer, setDictAnswer] = useState('');
  const [dictFeedback, setDictFeedback] = useState<{ ok: boolean; correct: string } | null>(null);
  const [dictResults, setDictResults] = useState<DictationResult[]>([]);

  // Test state
  const [testOptions, setTestOptions] = useState<string[]>([]);
  const [testFeedback, setTestFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [testScore, setTestScore] = useState(0);
  const [testDone, setTestDone] = useState(false);
  const [testShuffled, setTestShuffled] = useState<Word[]>([]);

  const config = GRADE_CONFIG[grade];
  const wordList = useMemo(() => (WORD_DATA[grade] ?? []).filter(w => w.unit === section), [grade, section]);
  const currentWord = wordList[index];
  const totalWords = wordList.length;
  const learnedCount = wordList.filter(w => learned.has(w.word)).length;
  const wrongCount = wordList.filter(w => wrong.has(w.word)).length;
  const wrongWordsList = useMemo(() => wordList.filter(w => wrong.has(w.word)), [wordList, wrong]);

  // Switch section -> reset to learn mode
  useEffect(() => { setIndex(0); setRevealed(false); setRoundDone(false); setMode('learn'); }, [grade, section]);

  // Auto-switch from wrong mode when empty
  useEffect(() => {
    if (mode === 'wrong' && wrongWordsList.length === 0) setMode('learn');
  }, [mode, wrongWordsList.length]);

  // Save progress
  useEffect(() => {
    saveState({ grade, section, index, learned: Array.from(learned), wrong: Array.from(wrong) });
  });

  // Focus answer input when dictation question appears
  useEffect(() => {
    if (mode === 'dictation' && !dictFeedback) {
      setTimeout(() => answerRef.current?.focus(), 100);
    }
  }, [mode, index, dictFeedback]);

  // ---- Learn Mode ----
  const handleKnow = useCallback(() => {
    if (!currentWord) return;
    setLearned(p => new Set([...p, currentWord.word]));
    setWrong(p => { const n = new Set(p); n.delete(currentWord.word); return n; });
    setRevealed(false);
    if (index + 1 >= totalWords) setRoundDone(true); else setIndex(i => i + 1);
  }, [currentWord, index, totalWords]);

  const handleDontKnow = useCallback(() => {
    if (!currentWord) return;
    setWrong(p => new Set([...p, currentWord.word]));
    setLearned(p => new Set([...p, currentWord.word]));
    setRevealed(false);
    if (index + 1 >= totalWords) setRoundDone(true); else setIndex(i => i + 1);
  }, [currentWord, index, totalWords]);

  const resetSection = useCallback(() => {
    setLearned(new Set()); setWrong(new Set()); setIndex(0); setRevealed(false); setRoundDone(false);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const removeFromWrong = useCallback((word: string) => {
    setWrong(p => { const n = new Set(p); n.delete(word); return n; });
  }, []);

  // ---- Dictation Mode ----
  const startDictation = useCallback(() => {
    setDictAnswer('');
    setDictFeedback(null);
    setDictResults([]);
    setIndex(0);
    setRoundDone(false);
    setMode('dictation');
  }, []);

  const playWord = useCallback((w?: string) => {
    speak(w || currentWord?.word || '');
  }, [currentWord]);

  const submitDictation = useCallback(() => {
    if (!currentWord || dictFeedback) return;
    const ans = dictAnswer.trim().toLowerCase();
    const correct = currentWord.word.toLowerCase();
    const ok = ans === correct;
    if (!ok) {
      saveWrongBookEntry(currentWord, grade, section);
      setWrong(p => new Set([...p, currentWord.word]));
    } else {
      setLearned(p => new Set([...p, currentWord.word]));
    }
    setDictFeedback({ ok, correct: currentWord.word });
    setDictResults(prev => [...prev, { word: currentWord.word, correct: ok, userAnswer: ans }]);
  }, [currentWord, dictAnswer, grade, section]);

  const nextDictation = useCallback(() => {
    setDictAnswer('');
    setDictFeedback(null);
    if (index + 1 >= totalWords) { setRoundDone(true); return; }
    setIndex(i => i + 1);
  }, [index, totalWords]);

  const playDictWord = useCallback((w: string) => {
    speak(w);
  }, []);

  // ---- Test Mode ----
  const startTest = useCallback(() => {
    const shuffled = shuffle(wordList);
    setTestShuffled(shuffled);
    setIndex(0);
    setTestScore(0);
    setTestFeedback(null);
    setTestDone(false);
    setRoundDone(false);
    setMode('test');
  }, [wordList]);

  useEffect(() => {
    if (mode === 'test' && testShuffled[index] && !testFeedback) {
      const allMeanings = wordList.map(w => w.meaning);
      setTestOptions(generateOptions(testShuffled[index].meaning, allMeanings));
    }
  }, [mode, testShuffled, index, testFeedback, wordList]);

  const handleTestAnswer = useCallback((selected: string, correct: string) => {
    if (testFeedback) return;
    if (selected === correct) {
      setTestFeedback('correct');
      setTestScore(s => s + 1);
      setLearned(p => new Set([...p, testShuffled[index].word]));
    } else {
      setTestFeedback('wrong');
      saveWrongBookEntry(testShuffled[index], grade, section);
      setWrong(p => new Set([...p, testShuffled[index].word]));
    }
  }, [testFeedback, testShuffled, index, grade, section]);

  const nextTest = useCallback(() => {
    setTestFeedback(null);
    if (index + 1 >= testShuffled.length) { setTestDone(true); return; }
    setIndex(i => i + 1);
  }, [index, testShuffled.length]);

  const retryTest = useCallback(() => {
    startTest();
  }, [startTest]);

  // ---- Common ----
  const changeMode = useCallback((m: Mode) => {
    setMode(m);
    if (m === 'dictation') {
      setDictFeedback(null); setDictAnswer(''); setDictResults([]);
      if (roundDone) { setIndex(0); setRoundDone(false); }
    }
    if (m === 'test') {
      setTestFeedback(null); setTestDone(false);
    }
  }, [roundDone]);

  // ---- Styles ----
  const s = (sel: string) => {
    const st: Record<string, React.CSSProperties> = {
      page: { minHeight: '100vh', background: 'linear-gradient(135deg,#f0f4ff 0%,#fdf2f8 50%,#f0fdf4 100%)' },
      container: { maxWidth: 480, margin: '0 auto', padding: '16px 16px 32px' },
      header: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 },
      backBtn: { padding: 8, borderRadius: 12, border: 'none', background: 'rgba(255,255,255,0.8)', cursor: 'pointer', display: 'flex', backdropFilter: 'blur(8px)' },
      title: { fontSize: 20, fontWeight: 700, color: '#1e293b', flex: 1 },
      gradeBadge: { fontSize: 11, color: '#94a3b8', background: '#f1f5f9', padding: '4px 10px', borderRadius: 20, whiteSpace: 'nowrap' as const },
      gradeTab: (a: boolean): React.CSSProperties => ({ flex: 1, padding: '8px 0', borderRadius: 10, border: 'none', fontWeight: 600, fontSize: 12, cursor: 'pointer', transition: 'all 0.2s', background: a ? 'linear-gradient(135deg,#6366f1,#a855f7)' : '#fff', color: a ? '#fff' : '#64748b', boxShadow: a ? '0 4px 12px rgba(99,102,241,0.3)' : '0 1px 3px rgba(0,0,0,0.06)' }),
      modeRow: { display: 'flex', gap: 8, marginBottom: 16, alignItems: 'center' },
      modeBtn: (a: boolean, c: string): React.CSSProperties => ({ padding: '6px 10px', border: 'none', fontSize: 11, fontWeight: 600, cursor: 'pointer', background: a ? c : '#fff', color: a ? '#fff' : '#64748b' }),
      select: { flex: 1, padding: '6px 10px', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12, background: '#fff', color: '#334155', outline: 'none', cursor: 'pointer' },
      progressBar: { flex: 1, height: 6, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden' },
      progressFill: (p: number): React.CSSProperties => ({ height: '100%', borderRadius: 3, background: 'linear-gradient(90deg,#6366f1,#a855f7)', width: `${p}%`, transition: 'width 0.3s ease' }),
      progressLabel: { fontSize: 11, color: '#94a3b8', whiteSpace: 'nowrap' as const, fontWeight: 500 },
      card: { background: '#fff', borderRadius: 24, padding: '32px 24px', border: '2px solid #e2e8f0', minHeight: 260, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' as const, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' },
      cardNum: { position: 'absolute' as const, top: 16, right: 20, fontSize: 12, color: '#cbd5e1', fontWeight: 500 },
      word: { fontSize: 32, fontWeight: 700, color: '#1e293b', marginBottom: 8, textAlign: 'center' as const },
      phonetic: { fontSize: 14, color: '#94a3b8' },
      speakBtn: { padding: 6, borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer', display: 'flex' },
      meaning: { fontSize: 20, fontWeight: 600, color: '#4f46e5', textAlign: 'center' as const },
      emptyBox: { textAlign: 'center' as const, padding: 40, color: '#94a3b8' },
      completeBox: { textAlign: 'center' as const, padding: '48px 24px', background: '#fff', borderRadius: 24, border: '1px solid #e2e8f0' },
      wrongItem: { display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: '#fff', borderRadius: 12, border: '1px solid #fecaca' },
      modeWrap: { display: 'flex', borderRadius: 10, overflow: 'hidden', border: '1px solid #e2e8f0', flexShrink: 0 },
      bottomActions: { display: 'flex', justifyContent: 'center', gap: 12, marginTop: 24 },
      actionBtn: (r = false): React.CSSProperties => ({ padding: '8px 16px', borderRadius: 10, border: `1px solid ${r ? '#fecaca' : '#e2e8f0'}`, background: r ? '#fef2f2' : '#fff', cursor: 'pointer', fontSize: 12, color: r ? '#ef4444' : '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }),
      primaryBtn: { padding: '10px 24px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg,#6366f1,#a855f7)', cursor: 'pointer', fontWeight: 600, fontSize: 14, color: '#fff', boxShadow: '0 4px 12px rgba(99,102,241,0.3)', transition: 'all 0.2s' },
      dangerBtn: { padding: '10px 24px', borderRadius: 12, border: 'none', background: '#ef4444', cursor: 'pointer', fontWeight: 600, fontSize: 14, color: '#fff' },
      outlineBtn: { padding: '10px 24px', borderRadius: 12, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 14, color: '#64748b' },
      dictInput: { width: '100%', padding: '12px 16px', borderRadius: 12, border: '2px solid #e2e8f0', fontSize: 18, textAlign: 'center' as const, outline: 'none', boxSizing: 'border-box' as const },
      testOpt: (isSelected: boolean, isCorrect: boolean | null): React.CSSProperties => {
        let bg = '#f8fafc', bd = '#e2e8f0', cl = '#334155';
        if (isCorrect === true) { bg = '#f0fdf4'; bd = '#22c55e'; cl = '#16a34a'; }
        else if (isCorrect === false) { bg = '#fef2f2'; bd = '#ef4444'; cl = '#dc2626'; }
        else if (isSelected) { bg = '#eef2ff'; bd = '#6366f1'; cl = '#4f46e5'; }
        return { width: '100%', padding: '14px 16px', borderRadius: 12, border: `2px solid ${bd}`, background: bg, color: cl, cursor: 'pointer', fontSize: 14, fontWeight: 600, textAlign: 'left' as const, transition: 'all 0.15s' };
      },
      feedbackRow: { display: 'flex', gap: 8, marginTop: 12, justifyContent: 'center' },
      playBig: { width: 64, height: 64, borderRadius: 32, border: 'none', background: 'linear-gradient(135deg,#6366f1,#a855f7)', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 4px 16px rgba(99,102,241,0.4)' },
    };
    return st[sel] as React.CSSProperties;
  };

  // ---- Title map ----
  const modeTitle: Record<Mode, string> = { learn: '背单词', wrong: '错词本', dictation: 'AI听写', test: '单元测试' };
  const modeColors: Record<Mode, string> = { learn: '#6366f1', wrong: '#ef4444', dictation: '#f59e0b', test: '#22c55e' };
  const modeList: Mode[] = ['learn', 'dictation', 'test', 'wrong'];

  return (
    <div style={s('page')}>
      <div style={s('container')}>
        <div style={s('header')}>
          <button onClick={() => navigate(-1)} style={s('backBtn')}><ChevronLeft size={20} color="#475569" /></button>
          <h1 style={s('title')}>{modeTitle[mode]}</h1>
          <span style={s('gradeBadge')}>{GRADE_CONFIG[grade]?.label ?? ''}</span>
        </div>

        <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
          {GRADES.map(g => {
            const gConfig = GRADE_CONFIG[g];
            return (
            <button key={g} onClick={() => { setGrade(g); setSection(0); }} style={s('gradeTab')(grade === g)}>
              {gConfig?.label?.replace(/[上下]册$/, '') ?? g + '年级'}
            </button>
            );
          })}
        </div>

        <div style={s('modeRow')}>
          <div style={s('modeWrap')}>
            {modeList.map(m => (
              <button key={m} onClick={() => changeMode(m)} style={s('modeBtn')(mode === m, modeColors[m])}>
                {m === 'wrong' ? `错词${wrongCount > 0 ? `(${wrongCount})` : ''}` :
                 m === 'learn' ? '学习' :
                 m === 'dictation' ? '听写' : '测试'}
              </button>
            ))}
          </div>
          <select value={section} onChange={e => setSection(Number(e.target.value))} style={s('select')}>
            {config?.units?.map((u, i) => <option key={i} value={i}>{shortTitle(u)}</option>) ?? null}
          </select>
        </div>

        {/* ========== WRONG MODE ========== */}
        {mode === 'wrong' && (
          wrongWordsList.length === 0 ? (
            <div style={s('emptyBox')}>
              <Check size={40} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
              <p style={{ fontSize: 14 }}>没有错词，太棒了！</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {wrongWordsList.map(w => (
                <div key={w.word} style={s('wrongItem')}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 15, color: '#1e293b' }}>{w.word}</div>
                    {w.phonetic && <div style={{ fontSize: 12, color: '#94a3b8' }}>{w.phonetic}</div>}
                    <div style={{ fontSize: 13, color: '#475569', marginTop: 2 }}>{w.meaning}</div>
                  </div>
                  <button onClick={() => speak(w.word)} style={s('speakBtn')}><Volume2 size={16} color="#64748b" /></button>
                  <button onClick={() => removeFromWrong(w.word)} style={{ padding: 6, borderRadius: 8, border: '1px solid #fecaca', background: '#fef2f2', cursor: 'pointer', display: 'flex' }}>
                    <Check size={16} color="#ef4444" />
                  </button>
                </div>
              ))}
            </div>
          )
        )}

        {/* ========== LEARN MODE ========== */}
        {mode === 'learn' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={s('progressBar')}>
                <div style={s('progressFill')(totalWords > 0 ? (learnedCount / totalWords) * 100 : 0)} />
              </div>
              <span style={s('progressLabel')}>{learnedCount}/{totalWords}</span>
            </div>

            {roundDone ? (
              <div style={s('completeBox')}>
                <Check size={48} color="#22c55e" style={{ margin: '0 auto 16px' }} />
                <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>本节学习完成！</h2>
                <p style={{ fontSize: 14, color: '#64748b', marginBottom: 4 }}>共 {totalWords} 个单词</p>
                <p style={{ fontSize: 14, color: '#64748b', marginBottom: 24 }}>错词 {wrongCount} 个</p>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                  <button onClick={resetSection} style={s('outlineBtn')}>重新学习</button>
                  {wrongCount > 0 && <button onClick={() => setMode('wrong')} style={s('dangerBtn')}>复习错词 ({wrongCount})</button>}
                </div>
              </div>
            ) : !currentWord ? (
              <div style={s('emptyBox')}>
                <BookOpen size={40} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                <p style={{ fontSize: 14 }}>这个章节没有单词</p>
              </div>
            ) : (
              <>
                <div onClick={() => !revealed && setRevealed(true)} style={s('card')}>
                  <span style={s('cardNum')}>{index + 1}/{totalWords}</span>
                  <h2 style={s('word')}>{currentWord.word}</h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
                    <span style={s('phonetic')}>{currentWord.phonetic || '/.../'}</span>
                    <button onClick={e => { e.stopPropagation(); speak(currentWord.word); }} style={s('speakBtn')}><Volume2 size={14} color="#64748b" /></button>
                  </div>
                  <div style={{ width: 40, height: 2, background: '#e2e8f0', borderRadius: 1, marginBottom: 16 }} />
                  {!revealed ? (
                    <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>
                      <RotateCw size={20} style={{ margin: '0 auto 8px' }} />
                      <p>点击卡片查看释义</p>
                    </div>
                  ) : (
                    <p style={s('meaning')}>{currentWord.meaning}</p>
                  )}
                  {wrong.has(currentWord.word) && revealed && <span style={{ position: 'absolute', bottom: 16, left: 20, fontSize: 11, color: '#ef4444', background: '#fef2f2', padding: '2px 10px', borderRadius: 20 }}>曾出错</span>}
                </div>
                {revealed ? (
                  <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
                    <button onClick={handleDontKnow} style={{ flex: 1, padding: '14px 0', borderRadius: 14, border: '2px solid #fca5a5', background: '#fef2f2', cursor: 'pointer', fontWeight: 600, fontSize: 15, color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                      <X size={20} /> 不认识
                    </button>
                    <button onClick={handleKnow} style={{ flex: 1, padding: '14px 0', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg,#22c55e,#16a34a)', cursor: 'pointer', fontWeight: 600, fontSize: 15, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 12px rgba(34,197,94,0.3)' }}>
                      <Check size={20} /> 认识
                    </button>
                  </div>
                ) : (
                  <p style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: '#cbd5e1' }}>👆 点击卡片查看释义</p>
                )}
              </>
            )}
            <div style={s('bottomActions')}>
              <button onClick={resetSection} style={s('actionBtn')(false)}><RefreshCw size={14} /> 重置</button>
            </div>
          </>
        )}

        {/* ========== DICTATION MODE ========== */}
        {mode === 'dictation' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={s('progressBar')}>
                <div style={s('progressFill')(totalWords > 0 ? (dictResults.length / totalWords) * 100 : 0)} />
              </div>
              <span style={s('progressLabel')}>{dictResults.filter(r => r.correct).length}/{totalWords}</span>
            </div>

            {roundDone ? (
              <div style={s('completeBox')}>
                <PenLine size={40} color="#f59e0b" style={{ margin: '0 auto 16px' }} />
                <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>听写完成！</h2>
                <p style={{ fontSize: 14, color: '#64748b', marginBottom: 4 }}>总词数：{dictResults.length}</p>
                <p style={{ fontSize: 14, color: '#64748b', marginBottom: 4 }}>错误：{dictResults.filter(r => !r.correct).length}</p>
                {(() => {
                  const score = dictResults.length > 0 ? Math.round(dictResults.filter(r => r.correct).length / dictResults.length * 100) : 0;
                  return <p style={{ fontSize: 24, fontWeight: 700, color: score >= 80 ? '#22c55e' : score >= 60 ? '#f59e0b' : '#ef4444', margin: '12px 0' }}>{score} 分</p>;
                })()}
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 8 }}>
                  <button onClick={startDictation} style={s('outlineBtn')}>重新听写</button>
                  <button onClick={startTest} style={s('primaryBtn')}>📝 开始测试</button>
                </div>
              </div>
            ) : !currentWord ? (
              <div style={s('emptyBox')}>
                <p style={{ fontSize: 14 }}>请先选择有单词的章节</p>
                <button onClick={startDictation} style={{ ...s('primaryBtn'), marginTop: 16 }}>开始听写</button>
              </div>
            ) : (
              <>
                <div style={s('card')}>
                  <span style={s('cardNum')}>{index + 1}/{totalWords}</span>
                  <button onClick={() => playWord(currentWord.word)} style={s('playBig')}>
                    <Speaker size={28} />
                  </button>
                  <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 16 }}>
                    {dictFeedback ? '发音已播放，请核对你的拼写' : '点击🎤播放单词，然后输入拼写'}
                  </p>
                  <div style={{ width: '100%' }}>
                    <input
                      ref={answerRef}
                      value={dictAnswer}
                      onChange={e => setDictAnswer(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && !dictFeedback) submitDictation(); if (e.key === 'Enter' && dictFeedback) nextDictation(); }}
                      placeholder="输入单词拼写..."
                      style={{
                        ...s('dictInput'),
                        borderColor: dictFeedback ? (dictFeedback.ok ? '#22c55e' : '#ef4444') : '#e2e8f0',
                        background: dictFeedback ? (dictFeedback.ok ? '#f0fdf4' : '#fef2f2') : '#fff',
                      } as React.CSSProperties}
                      disabled={!!dictFeedback}
                    />
                  </div>
                  <div style={s('feedbackRow')}>
                    {dictFeedback && (
                      <span style={{ fontSize: 14, fontWeight: 600, color: dictFeedback.ok ? '#22c55e' : '#ef4444' }}>
                        {dictFeedback.ok ? '✅ 正确！' : `❌ 正确拼写：${dictFeedback.correct}`}
                      </span>
                    )}
                  </div>
                </div>

                {!dictFeedback ? (
                  <button onClick={submitDictation} disabled={!dictAnswer.trim()}
                    style={{
                      width: '100%', padding: '14px 0', borderRadius: 14, border: 'none',
                      background: dictAnswer.trim() ? 'linear-gradient(135deg,#6366f1,#a855f7)' : '#e2e8f0',
                      cursor: dictAnswer.trim() ? 'pointer' : 'default',
                      fontWeight: 600, fontSize: 15, color: '#fff', marginTop: 16,
                      boxShadow: dictAnswer.trim() ? '0 4px 12px rgba(99,102,241,0.3)' : 'none',
                    }}>
                    提交 (Enter)
                  </button>
                ) : (
                  <button onClick={nextDictation}
                    style={{ width: '100%', padding: '14px 0', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg,#6366f1,#a855f7)', cursor: 'pointer', fontWeight: 600, fontSize: 15, color: '#fff', marginTop: 16, boxShadow: '0 4px 12px rgba(99,102,241,0.3)' }}>
                    {index + 1 >= totalWords ? '查看结果 →' : '下一题 →'}
                  </button>
                )}

                <div style={s('bottomActions')}>
                  <button onClick={startDictation} style={s('actionBtn')(false)}><RefreshCw size={14} /> 重新开始</button>
                </div>
              </>
            )}
          </>
        )}

        {/* ========== TEST MODE ========== */}
        {mode === 'test' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={s('progressBar')}>
                <div style={s('progressFill')(testShuffled.length > 0 ? (index / testShuffled.length) * 100 : 0)} />
              </div>
              <span style={s('progressLabel')}>{testScore}/{testShuffled.length}</span>
            </div>

            {testDone ? (
              <div style={s('completeBox')}>
                <ClipboardList size={40} color="#22c55e" style={{ margin: '0 auto 16px' }} />
                <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>单元测试完成</h2>
                {(() => {
                  const total = testShuffled.length;
                  const pct = total > 0 ? Math.round(testScore / total * 100) : 0;
                  return (
                    <>
                      <p style={{ fontSize: 14, color: '#64748b', marginBottom: 4 }}>总题数：{total}</p>
                      <p style={{ fontSize: 14, color: '#64748b', marginBottom: 4 }}>正确：{testScore}/{total}</p>
                      <p style={{ fontSize: 28, fontWeight: 700, color: pct >= 80 ? '#22c55e' : pct >= 60 ? '#f59e0b' : '#ef4444', margin: '12px 0' }}>掌握率：{pct}%</p>
                    </>
                  );
                })()}
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 8 }}>
                  <button onClick={retryTest} style={s('outlineBtn')}>重新测试</button>
                  <button onClick={() => setMode('learn')} style={s('primaryBtn')}>继续学习</button>
                </div>
              </div>
            ) : testShuffled.length === 0 ? (
              <div style={s('emptyBox')}>
                <p style={{ fontSize: 14 }}>请先选择有单词的章节</p>
                <button onClick={startTest} style={{ ...s('primaryBtn'), marginTop: 16 }}>开始测试</button>
              </div>
            ) : !testShuffled[index] ? null : (
              <>
                <div style={s('card')}>
                  <span style={s('cardNum')}>{index + 1}/{testShuffled.length}</span>
                  <h2 style={s('word')}>{testShuffled[index].word}</h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
                    <span style={s('phonetic')}>{testShuffled[index].phonetic || '/.../'}</span>
                    <button onClick={() => speak(testShuffled[index].word)} style={s('speakBtn')}><Volume2 size={14} color="#64748b" /></button>
                  </div>
                  <div style={{ width: 40, height: 2, background: '#e2e8f0', borderRadius: 1, marginBottom: 16 }} />
                  <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 16 }}>选择正确的中文释义</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
                  {testOptions.map((opt, i) => {
                    let isCorrect: boolean | null = null;
                    if (testFeedback) isCorrect = opt === testShuffled[index].meaning;
                    return (
                      <button key={i} onClick={() => handleTestAnswer(opt, testShuffled[index].meaning)} style={s('testOpt')(false, isCorrect)}>
                        <span style={{ display: 'inline-block', width: 24, fontWeight: 700, color: testFeedback ? (isCorrect ? '#22c55e' : '#94a3b8') : '#94a3b8' }}>
                          {String.fromCharCode(65 + i)}.
                        </span>
                        {opt}
                        {testFeedback && isCorrect && <Check size={16} style={{ marginLeft: 8, color: '#22c55e', display: 'inline' }} />}
                      </button>
                    );
                  })}
                </div>

                {testFeedback && (
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
                    <button onClick={nextTest}
                      style={{ width: '100%', padding: '14px 0', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg,#6366f1,#a855f7)', cursor: 'pointer', fontWeight: 600, fontSize: 15, color: '#fff', boxShadow: '0 4px 12px rgba(99,102,241,0.3)' }}>
                      {index + 1 >= testShuffled.length ? '查看结果 →' : '下一题 →'}
                    </button>
                  </div>
                )}

                <div style={s('bottomActions')}>
                  <button onClick={retryTest} style={s('actionBtn')(false)}><RefreshCw size={14} /> 重新测试</button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
