import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Check, X, ChevronRight } from 'lucide-react';

interface Question {
  id: number;
  unit: number;
  sentence: string;
  hint: string;
  answer: string;
}

const ALL_QUESTIONS: Question[] = [
  {id:1,unit:1,sentence:"I'd like to order two ______ (汉堡) with fish and chips.",hint:"汉堡",answer:"hamburgers"},
  {id:2,unit:1,sentence:"Elephants are still in ______ (处于危险中).",hint:"处于危险中",answer:"danger"},
  {id:3,unit:1,sentence:"______ (青少年) should do more exercise.",hint:"青少年",answer:"Teenagers"},
  {id:4,unit:1,sentence:"My mother often buys some ______ (草莓) in the shop.",hint:"草莓",answer:"strawberries"},
  {id:5,unit:1,sentence:"Lucy wants to buy some ______ (梨子) for her mother.",hint:"梨子",answer:"pears"},
  {id:6,unit:1,sentence:"If we are ______ (友好的) to others, we can make more friends.",hint:"友好的",answer:"friendly"},
  {id:7,unit:1,sentence:"Kate likes ______ (狐狸) because she thinks they are very smart.",hint:"狐狸",answer:"foxes"},
  {id:8,unit:1,sentence:"People get up early to watch the raising of the ______ (国家的) flag.",hint:"国家的",answer:"national"},
  {id:9,unit:1,sentence:"The party was so ______ (热闹的) with music and dancing.",hint:"热闹的",answer:"lively"},
  {id:10,unit:1,sentence:"About 2,000 years ago, the ______ (古代的) Silk Road connected Eurasian countries.",hint:"古代的",answer:"ancient"},
  {id:11,unit:1,sentence:"There are new ______ (叶子) growing out on the old tree.",hint:"叶子",answer:"leaves"},
  {id:12,unit:1,sentence:"Students always find ______ (创造性的) ways to save their seat.",hint:"创造性的",answer:"creative"},
  {id:13,unit:2,sentence:"Mr. Li asks us to read the book ______ (安静地) in the library.",hint:"安静地",answer:"quietly"},
  {id:14,unit:2,sentence:"Look! There is a school ______ (制服) on the playground.",hint:"制服",answer:"uniform"},
  {id:15,unit:2,sentence:"You should be ______ (礼貌的) to your teachers.",hint:"礼貌的",answer:"polite"},
  {id:16,unit:2,sentence:"Tom, your room is so ______ (不整洁的). Please clean it now.",hint:"不整洁的",answer:"untidy"},
  {id:17,unit:2,sentence:"It's important to respect the ______ (精神) of the craftspeople.",hint:"精神",answer:"spirit"},
  {id:18,unit:2,sentence:"______ (一切) is perfect in my new school.",hint:"一切",answer:"Everything"},
  {id:19,unit:2,sentence:"You can't ______ (喂养) your dog chocolate.",hint:"喂养",answer:"feed"},
  {id:20,unit:2,sentence:"I ______ (尊重) my form teacher so much.",hint:"尊重",answer:"respect"},
  {id:21,unit:2,sentence:"The train ______ (到达) in Chongqing at 2:00 p.m.",hint:"到达",answer:"arrives"},
  {id:22,unit:2,sentence:"I ______ (借) two books from the library yesterday.",hint:"借",answer:"borrowed"},
  {id:23,unit:2,sentence:"Andy, you were ______ (缺席的) from the math class yesterday.",hint:"缺席的",answer:"absent"},
  {id:24,unit:2,sentence:"Don't be ______ (吵闹的) in the library.",hint:"吵闹的",answer:"noisy"},
  {id:25,unit:3,sentence:"Mary ______ (很少) eats chocolates.",hint:"很少",answer:"seldom"},
  {id:26,unit:3,sentence:"A little bit of ______ (进步) will get you to move.",hint:"进步",answer:"progress"},
  {id:27,unit:3,sentence:"Jack usually plays ______ (棒球) with his friends.",hint:"棒球",answer:"baseball"},
  {id:28,unit:3,sentence:"Once I set up a ______ (目标), I won't give it up.",hint:"目标",answer:"goal"},
  {id:29,unit:3,sentence:"This volleyball must ______ (属于) Carla.",hint:"属于",answer:"belong to"},
  {id:30,unit:3,sentence:"We win or lose as a ______ (团队).",hint:"团队",answer:"team"},
  {id:31,unit:3,sentence:"Whose tennis ______ (球拍) is it?",hint:"球拍",answer:"racket"},
  {id:32,unit:3,sentence:"The bus ______ (车站) is not far from my home.",hint:"车站",answer:"station"},
  {id:33,unit:3,sentence:"They often go to the park by ______ (小船).",hint:"小船",answer:"boat"},
  {id:34,unit:3,sentence:"The ______ (村民) here are very friendly.",hint:"村民",answer:"villagers"},
  {id:35,unit:3,sentence:"There is a new ______ (桥) over the river.",hint:"桥",answer:"bridge"},
  {id:36,unit:3,sentence:"You can make healthy meals ______ (代替).",hint:"代替",answer:"instead"},
  {id:37,unit:4,sentence:"He is full of ______ (精力、能量) every day.",hint:"精力、能量",answer:"energy"},
  {id:38,unit:4,sentence:"We have some ______ (共同的) hobbies.",hint:"共同的",answer:"common"},
  {id:39,unit:4,sentence:"To ______ (改善) your English, you should speak more.",hint:"改善",answer:"improve"},
  {id:40,unit:4,sentence:"Reading English every morning is a good ______ (习惯).",hint:"习惯",answer:"habit"},
  {id:41,unit:4,sentence:"I am always full of ______ (能量) after I do sports.",hint:"能量",answer:"energy"},
  {id:42,unit:4,sentence:"These children are ______ (渴求的) for knowledge.",hint:"渴求的",answer:"thirsty"},
  {id:43,unit:4,sentence:"I like chicken, fish and ______ (西瓜) juice.",hint:"西瓜",answer:"watermelon"},
  {id:44,unit:4,sentence:"There is a special ______ (菜肴) in the restaurant.",hint:"菜肴",answer:"dish"},
  {id:45,unit:4,sentence:"Everyone is excited about the ______ (结果) of the show.",hint:"结果",answer:"result"},
  {id:46,unit:4,sentence:"It can make you feel ______ (困倦的).",hint:"困倦的",answer:"sleepy"},
  {id:47,unit:4,sentence:"My mother thinks fruit ______ (色拉) is healthy.",hint:"色拉",answer:"salad"},
  {id:48,unit:4,sentence:"It's difficult to understand this ______ (文章).",hint:"文章",answer:"article"},
  {id:49,unit:5,sentence:"On sunny days, the sun is shining ______ (明亮地).",hint:"明亮地",answer:"brightly"},
  {id:50,unit:5,sentence:"My father will be back in a ______ (片刻).",hint:"片刻",answer:"moment"},
  {id:51,unit:5,sentence:"What ______ (节日) is the greatest in China?",hint:"节日",answer:"festival"},
  {id:52,unit:5,sentence:"My brother's ______ (视力) is very good.",hint:"视力",answer:"eyesight"},
  {id:53,unit:5,sentence:"Can I take a ______ (信息) for you?",hint:"信息",answer:"message"},
  {id:54,unit:5,sentence:"I am working on something ______ (重要的).",hint:"重要的",answer:"important"},
  {id:55,unit:5,sentence:"Could you please help me ______ (洗) the clothes?",hint:"洗",answer:"wash"},
  {id:56,unit:5,sentence:"The car is climbing the mountain ______ (缓慢地).",hint:"缓慢地",answer:"slowly"},
  {id:57,unit:5,sentence:"Let's have a(n) ______ (考试). Please close your books.",hint:"考试",answer:"exam"},
  {id:58,unit:5,sentence:"Now a lot of people like shopping ______ (在线的).",hint:"在线的",answer:"online"},
  {id:59,unit:5,sentence:"Bob enjoys ______ (踢) a ball in his free time.",hint:"踢",answer:"kicking"},
  {id:60,unit:5,sentence:"Li Ming, please ______ (解释) the meaning of the word.",hint:"解释",answer:"explain"},
  {id:61,unit:6,sentence:"We are playing at the ______ (海滩) in Sanya.",hint:"海滩",answer:"beach"},
  {id:62,unit:6,sentence:"The ______ (温度) is around 10\u2103 now.",hint:"温度",answer:"temperature"},
  {id:63,unit:6,sentence:"They don't really enjoy this ______ (经历) in Mount Huangshan.",hint:"经历",answer:"experience"},
  {id:64,unit:6,sentence:"My sister makes great ______ (进步) in English.",hint:"进步",answer:"progress"},
  {id:65,unit:6,sentence:"We are eating something nice at a rest ______ (区域).",hint:"区域",answer:"area"},
  {id:66,unit:6,sentence:"Many areas are ______ (干旱) in Xinjiang.",hint:"干旱",answer:"dry"},
  {id:67,unit:6,sentence:"Don't let others ______ (影响) your study.",hint:"影响",answer:"affect"},
  {id:68,unit:6,sentence:"In the ______ of Beijing is the Palace Museum.",hint:"中心",answer:"center"},
  {id:69,unit:6,sentence:"The morning ______ (阳光) flooded into the room!",hint:"阳光",answer:"sunlight"},
  {id:70,unit:6,sentence:"He lost his balance and fell to the ______ (地面).",hint:"地面",answer:"ground"},
  {id:71,unit:6,sentence:"The man is making a ______ (雪人).",hint:"雪人",answer:"snowman"},
  {id:72,unit:6,sentence:"You can find it at the ______ (末尾) of the street.",hint:"末尾",answer:"end"},
  {id:73,unit:7,sentence:"How to use this new washing ______ (机器) is a problem.",hint:"机器",answer:"machine"},
  {id:74,unit:7,sentence:"We put up ______ (帐篷) and made a fire.",hint:"帐篷",answer:"tent"},
  {id:75,unit:7,sentence:"Please ______ (移开) your hand from my book.",hint:"移开",answer:"remove"},
  {id:76,unit:7,sentence:"We visited the ______ (博物馆) and saw many old things.",hint:"博物馆",answer:"museum"},
  {id:77,unit:7,sentence:"There is a book ______ (展览) on the playground.",hint:"展览",answer:"exhibition"},
  {id:78,unit:7,sentence:"He walked ______ (直接) into the meeting room.",hint:"直接",answer:"directly"},
  {id:79,unit:7,sentence:"Which ______ (方向) are you facing?",hint:"方向",answer:"direction"},
  {id:80,unit:7,sentence:"Eleanor began to keep a ______ (日记).",hint:"日记",answer:"diary"},
  {id:81,unit:7,sentence:"It was late when we ______ (终于) arrived.",hint:"终于",answer:"finally"},
  {id:82,unit:7,sentence:"Did you always want to be an ______ (演员)?",hint:"演员",answer:"actor"},
  {id:83,unit:7,sentence:"I want to learn how ______ (宇航员) live and work.",hint:"宇航员",answer:"astronauts"},
  {id:84,unit:7,sentence:"We should have some life ______ (技能).",hint:"技能",answer:"skills"},
  {id:85,unit:8,sentence:"I saw a beautiful white ______ (天鹅) swim across the lake.",hint:"天鹅",answer:"swan"},
  {id:86,unit:8,sentence:"Do you think she's telling the ______ (真相)?",hint:"真相",answer:"truth"},
  {id:87,unit:8,sentence:"My ______ (邻居) is a very friendly person.",hint:"邻居",answer:"neighbor"},
  {id:88,unit:8,sentence:"My friends give me a big ______ (惊喜).",hint:"惊喜",answer:"surprise"},
  {id:89,unit:8,sentence:"His job was to give advice to the ______ (皇帝).",hint:"皇帝",answer:"emperor"},
  {id:90,unit:8,sentence:"The lion is the ______ (国王) of the jungle.",hint:"国王",answer:"king"},
  {id:91,unit:8,sentence:"Why do you ask him such a ______ (愚蠢的) question?",hint:"愚蠢的",answer:"stupid"},
  {id:92,unit:8,sentence:"She was ______ (害怕) of the dark.",hint:"害怕",answer:"afraid"},
  {id:93,unit:8,sentence:"He always gives us ______ (明智的) advice.",hint:"明智的",answer:"wise"},
  {id:94,unit:8,sentence:"The genie looks ______ (丑陋的) when it becomes angry.",hint:"丑陋的",answer:"ugly"},
  {id:95,unit:8,sentence:"I want to be an ______ (艺术家) when I grow up.",hint:"艺术家",answer:"artist"},
  {id:96,unit:8,sentence:"The lion is a ______ (强大的) animal.",hint:"强大的",answer:"powerful"},
  {id:97,unit:8,sentence:"You're going to be a very ______ (富有的) man.",hint:"富有的",answer:"rich"},
  {id:98,unit:8,sentence:"Why do you ______ (相信) him so much?",hint:"相信",answer:"believe"},
  {id:99,unit:8,sentence:"The idiom is related to a famous ______ (战争) in ancient times.",hint:"战争",answer:"war"},
  {id:100,unit:8,sentence:"Jenny's parents ______ (承诺) to take her to the Expo.",hint:"承诺",answer:"promise"},
];

const UNIT_LABELS = ['Unit 1', 'Unit 2', 'Unit 3', 'Unit 4', 'Unit 5', 'Unit 6', 'Unit 7', 'Unit 8'];

export default function HanToEngPage() {
  const navigate = useNavigate();
  const [unit, setUnit] = useState(1);
  const [index, setIndex] = useState(0);
  const [answered, setAnswered] = useState<Record<number, { user: string; correct: boolean }>>({});
  const [input, setInput] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const questions = useMemo(() => ALL_QUESTIONS.filter(q => q.unit === unit), [unit]);
  const current = questions[index];
  const total = questions.length;
  const done = Object.keys(answered).filter(k => questions.find(q => q.id === Number(k))).length;
  const unitComplete = done === total && total > 0;

  const sentenceParts = useMemo(() => {
    if (!current) return { before: '', hint: '', after: '' };
    const m = current.sentence.match(/^(.*?)______\s*\((.+?)\)\s*(.*)$/);
    if (m) return { before: m[1], hint: m[2], after: m[3] };
    const m2 = current.sentence.match(/^(.*?)______\s*(.*)$/);
    if (m2) return { before: m2[1], hint: '', after: m2[2] };
    return { before: current.sentence, hint: '', after: '' };
  }, [current]);

  useEffect(() => {
    setIndex(0); setSubmitted(false); setInput(''); setShowAll(false);
  }, [unit]);

  useEffect(() => {
    setInput(''); setSubmitted(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [index]);

  const handleSubmit = useCallback(() => {
    if (!current || submitted) return;
    const userAns = input.trim();
    const isCorrect = userAns.toLowerCase() === current.answer.toLowerCase();
    setAnswered(prev => ({ ...prev, [current.id]: { user: userAns, correct: isCorrect } }));
    setSubmitted(true);
  }, [current, input, submitted]);

  const handleNext = useCallback(() => {
    if (index + 1 >= total) { setShowAll(true); return; }
    setIndex(i => i + 1);
  }, [index, total]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (!submitted) handleSubmit();
      else if (!showAll) handleNext();
    }
    if (e.key === 'Escape') { setInput(''); setSubmitted(false); }
  }, [submitted, showAll, handleSubmit, handleNext]);

  // Answer summary for completed unit
  const answeredList = questions.filter(q => answered[q.id] !== undefined);

  // Styles
  const s = (sel: string) => {
    const st: Record<string, React.CSSProperties> = {
      page: { minHeight: '100vh', background: 'linear-gradient(135deg,#f0f4ff 0%,#fdf2f8 50%,#f0fdf4 100%)' },
      container: { maxWidth: 640, margin: '0 auto', padding: '16px' },
      header: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 },
      backBtn: { padding: 8, borderRadius: 12, border: 'none', background: 'rgba(255,255,255,0.8)', cursor: 'pointer', display: 'flex', backdropFilter: 'blur(8px)' },
      title: { fontSize: 20, fontWeight: 700, color: '#1e293b', flex: 1 },
      unitNav: { display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' as const },
      unitBtn: (active: boolean, completed: boolean): React.CSSProperties => ({
        padding: '6px 14px', borderRadius: 20, border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer',
        background: active ? '#6366f1' : completed ? '#d1fae5' : '#fff',
        color: active ? '#fff' : completed ? '#065f46' : '#64748b',
        boxShadow: active ? '0 2px 8px rgba(99,102,241,0.3)' : '0 1px 2px rgba(0,0,0,0.06)',
      }),
      progressRow: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 },
      progressBar: { flex: 1, height: 6, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden' },
      progressFill: (p: number): React.CSSProperties => ({ height: '100%', borderRadius: 3, background: 'linear-gradient(90deg,#6366f1,#a855f7)', width: `${p}%`, transition: 'width 0.3s' }),
      progressLabel: { fontSize: 11, color: '#94a3b8', whiteSpace: 'nowrap' as const, fontWeight: 500 },
      card: { background: '#fff', borderRadius: 20, padding: '28px 24px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' },
      qNum: { fontSize: 12, color: '#94a3b8', marginBottom: 12 },
      sentence: { fontFamily: '"Times New Roman", serif', fontSize: 20, lineHeight: 2, color: '#1e293b', marginBottom: 20 },
      blank: { display: 'inline-block', minWidth: 120, borderBottom: '2px solid #6366f1', textAlign: 'center' as const, color: 'transparent' },
      hint: { color: '#f59e0b', fontWeight: 600 },
      input: { width: '100%', padding: '10px 16px', borderRadius: 10, border: '2px solid #e2e8f0', fontSize: 16, outline: 'none', boxSizing: 'border-box' as const, textAlign: 'center' as const },
      btnRow: { display: 'flex', gap: 10, marginTop: 16 },
      submitBtn: { flex: 1, padding: '12px 0', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg,#6366f1,#a855f7)', cursor: 'pointer', fontWeight: 600, fontSize: 14, color: '#fff' },
      nextBtn: { flex: 1, padding: '12px 0', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg,#22c55e,#16a34a)', cursor: 'pointer', fontWeight: 600, fontSize: 14, color: '#fff' },
      fb: { marginTop: 14, padding: '12px 16px', borderRadius: 10, fontSize: 14, fontWeight: 500 },
      correct: { background: '#f0fdf4', color: '#065f46', border: '1px solid #bbf7d0' },
      wrong: { background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' },
      summaryItem: (correct: boolean): React.CSSProperties => ({ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, marginBottom: 6, background: correct ? '#f0fdf4' : '#fef2f2', border: `1px solid ${correct ? '#bbf7d0' : '#fecaca'}` }),
      summaryWord: { fontWeight: 600, color: '#1e293b', fontSize: 14, minWidth: 100 },
      summaryAns: { fontSize: 13, color: '#64748b', flex: 1 },
      summaryIcon: { flexShrink: 0 },
    };
    return st[sel] as React.CSSProperties;
  };

  const getUnitDone = (u: number) => {
    const qs = ALL_QUESTIONS.filter(q => q.unit === u);
    return qs.length > 0 && qs.every(q => answered[q.id] !== undefined);
  };

  return (
    <div style={s('page')}>
      <div style={s('container')}>
        <div style={s('header')}>
          <button onClick={() => navigate(-1)} style={s('backBtn')}><ChevronLeft size={20} color="#475569" /></button>
          <h1 style={s('title')}>汉译英填空</h1>
          <span style={{ fontSize: 11, color: '#94a3b8', background: '#f1f5f9', padding: '4px 10px', borderRadius: 20 }}>Units 1-8</span>
        </div>

        <div style={s('unitNav')}>
          {UNIT_LABELS.map((l, i) => {
            const u = i + 1;
            return (
              <button key={u} onClick={() => setUnit(u)} style={s('unitBtn')(unit === u, getUnitDone(u))}>
                {l} {getUnitDone(u) ? '✓' : ''}
              </button>
            );
          })}
        </div>

        <div style={s('progressRow')}>
          <div style={s('progressBar')}>
            <div style={s('progressFill')(total > 0 ? (done / total) * 100 : 0)} />
          </div>
          <span style={s('progressLabel')}>{done}/{total}</span>
        </div>

        {!current ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8', fontSize: 14 }}>暂无题目</div>
        ) : showAll && unitComplete ? (
          /* Unit complete - show all answers */
          <div>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <Check size={40} color="#22c55e" style={{ margin: '0 auto 12px' }} />
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b' }}>{UNIT_LABELS[unit - 1]} 完成！</h2>
              <p style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>
                正确 {answeredList.filter(a => a.correct).length}/{total}
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {answeredList.map(a => {
                const q = questions.find(q => q.id === Object.keys(answered).find(k => Number(k) === a.user ? false : true));
                return null;
              })}
              {questions.map(q => {
                const a = answered[q.id];
                if (!a) return null;
                return (
                  <div key={q.id} style={s('summaryItem')(a.correct)}>
                    <span style={s('summaryIcon')}>{a.correct ? <Check size={16} color="#22c55e" /> : <X size={16} color="#ef4444" />}</span>
                    <span style={s('summaryWord')}>{q.answer}</span>
                    <span style={s('summaryAns')}>{q.hint}</span>
                    {!a.correct && <span style={{ fontSize: 12, color: '#94a3b8' }}>你的答案：{a.user}</span>}
                  </div>
                );
              })}
            </div>
            <button onClick={() => { setUnit(unit < 8 ? unit + 1 : 1); setShowAll(false); }}
              style={{ width: '100%', padding: '12px 0', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg,#6366f1,#a855f7)', cursor: 'pointer', fontWeight: 600, fontSize: 14, color: '#fff', marginTop: 16 }}>
              {unit < 8 ? `继续 ${UNIT_LABELS[unit]}` : '返回 Unit 1'}
            </button>
          </div>
        ) : (
          /* Question card */
          <div style={s('card')}>
            <div style={s('qNum')}>第 {index + 1} / {total} 题 (Unit {unit})</div>
            <div style={s('sentence')}>
              {sentenceParts.before}
              <span style={s('blank')}>{'\u00A0'}</span>
              {sentenceParts.after && <span> {sentenceParts.after}</span>}
            </div>
            <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 12 }}>
              提示：<span style={s('hint')}>{sentenceParts.hint || current.hint}</span>
            </div>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入英文单词..."
              style={{
                ...s('input'),
                borderColor: submitted ? (answered[current.id]?.correct ? '#22c55e' : '#ef4444') : '#e2e8f0',
                background: submitted ? (answered[current.id]?.correct ? '#f0fdf4' : '#fef2f2') : '#fff',
              } as React.CSSProperties}
              disabled={submitted}
              autoFocus
            />
            {submitted && (
              <div style={{ ...s('fb'), ...(answered[current.id]?.correct ? s('correct') : s('wrong')) } as React.CSSProperties}>
                {answered[current.id]?.correct
                  ? '✅ 正确！'
                  : `❌ 错误！正确答案：${current.answer}`}
              </div>
            )}
            <div style={s('btnRow')}>
              {!submitted ? (
                <button onClick={handleSubmit} disabled={!input.trim()}
                  style={{ ...s('submitBtn'), opacity: input.trim() ? 1 : 0.5 } as React.CSSProperties}>
                  提交答案 (Enter)
                </button>
              ) : (
                <button onClick={handleNext} style={s('nextBtn')}>
                  {index + 1 >= total ? '查看答案总结 →' : '下一题 (Enter)  '}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Quick stats footer */}
        {!showAll && done > 0 && (
          <div style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: '#94a3b8' }}>
            已答 {done} 题，正确 {answeredList.filter(a => a.correct).length} 题
          </div>
        )}
      </div>
    </div>
  );
}
