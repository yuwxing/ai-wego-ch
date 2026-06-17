import React, { useState, useCallback, useEffect } from 'react'

interface Attrs {
  教学: number; 科研: number; 班主任年限: number; 支教: number
  职称积分: number; 精力: number; 家庭幸福: number; 网络热度: number
}

interface Option {
  label: string; effects: Partial<Attrs>; comment: string
}

interface Stage {
  id: number; title: string; event: string
  options: Option[]; random_events: string[]
}

interface RandomEvent {
  id: string; name: string; chance: number
  effects: Partial<Attrs>; comment: string
}

interface Ending {
  title: string; condition: Partial<Attrs>; comment: string
}

const DATA: { stages: Stage[]; random_events_pool: RandomEvent[]; endings: Ending[] } = {
  stages: [
    {
      id: 1, title: '入职第一年：模板与理想',
      event: '教研组发来文件：《最新最规范最终版.docx》',
      options: [
        { label: 'A. 精心原创备课', effects: { 教学: 10, 精力: -20 }, comment: '你写的是教学设计，他们看的是格式统一。' },
        { label: 'B. 模板微调', effects: { 教学: 5, 职称积分: 5 }, comment: '教育创新的第一步：别乱动模板。' },
        { label: 'C. 参考优秀课改写', effects: { 教学: 8, 科研: 2 }, comment: '优秀课的定义：去年优秀的人还在讲。' },
        { label: 'D. 简单应付', effects: { 精力: 10, 教学: -10 }, comment: '你学会了生存优先。' },
      ],
      random_events: ['R3', 'R6'],
    },
    {
      id: 2, title: '班主任开始：群聊时代',
      event: '凌晨11:48，家长群发来消息：\n"老师在吗？"',
      options: [
        { label: 'A. 逐条回复', effects: { 班主任年限: 1, 精力: -20 }, comment: '你不是老师，是情绪客服。' },
        { label: 'B. 模板回复', effects: { 班主任年限: 1, 家庭幸福: -5 }, comment: '标准化沟通提升效率。' },
        { label: 'C. 次日回复', effects: { 精力: 10, 网络热度: 5 }, comment: '你赢得了睡眠，但输了舆情控制权。' },
        { label: 'D. 不回复', effects: { 精力: 20 }, comment: '沉默，是一种高级教育方式。' },
      ],
      random_events: ['R2', 'R1'],
    },
    {
      id: 3, title: '第一次公开课：表演开始',
      event: '校长、教研员、摄像师同时出现在教室后排。',
      options: [
        { label: 'A. 按预设流程走', effects: { 教学: 8, 职称积分: 10, 精力: -15 }, comment: '安全第一，创新第二。' },
        { label: 'B. 临场发挥互动', effects: { 教学: 15, 网络热度: 5, 精力: -25 }, comment: '真实是最好的剧本——也是最危险的。' },
        { label: 'C. 让学生提前排练', effects: { 教学: 3, 职称积分: 12, 精力: -5 }, comment: '公开课的艺术：把排练演成即兴。' },
        { label: 'D. 录像回看改进', effects: { 科研: 10, 教学: 5, 精力: -10 }, comment: '你看着屏幕里的自己，像在看一个陌生人上课。' },
      ],
      random_events: ['R5', 'R4'],
    },
    {
      id: 4, title: '支教 vs 评职称',
      event: '教育局通知：有支教名额，评职称可加分。\n但要去偏远山区一学期。',
      options: [
        { label: 'A. 报名支教', effects: { 支教: 1, 职称积分: 20, 家庭幸福: -20, 精力: -30 }, comment: '你去支教了，回来发现职称名额已经满了。' },
        { label: 'B. 写支教申请但不去', effects: { 职称积分: 5, 科研: -5 }, comment: '纸面上的支教经历，也是经历。' },
        { label: 'C. 放弃名额', effects: { 家庭幸福: 10, 精力: 10 }, comment: '你选择了生活，系统选择了别人。' },
        { label: 'D. 推荐同事去', effects: { 网络热度: 10, 职称积分: -5 }, comment: '你成了办公室最受欢迎的人。' },
      ],
      random_events: ['R4', 'R6'],
    },
    {
      id: 5, title: '论文发表：学术修罗场',
      event: '杂志社回复："建议修改后重投。"\n这是你第3次收到同样的回复。',
      options: [
        { label: 'A. 继续修改再投', effects: { 科研: 15, 精力: -25, 家庭幸福: -10 }, comment: '学术界最稳定的结论：建议修改后另投。' },
        { label: 'B. 花钱发普刊', effects: { 科研: 5, 职称积分: 10, 精力: -5 }, comment: '你花钱买了职称的入场券。' },
        { label: 'C. 放弃论文', effects: { 精力: 15, 家庭幸福: 5 }, comment: '你放弃了论文，等于放弃了评副高。' },
        { label: 'D. 找同事挂名', effects: { 科研: 8, 职称积分: 8, 网络热度: -5 }, comment: '学术共同体，重在共同。' },
      ],
      random_events: ['R4', 'R1'],
    },
    {
      id: 6, title: '年度考核：数据人生',
      event: '年终考核表需要填写：\n教学成绩、获奖情况、论文数量、学生评价……',
      options: [
        { label: 'A. 如实填写', effects: { 教学: 5, 职称积分: 5, 精力: -10 }, comment: '诚实是最佳策略——如果你的数据够好看。' },
        { label: 'B. 适当美化', effects: { 职称积分: 15, 网络热度: -5, 精力: -5 }, comment: '美化是教育行业的第二语言。' },
        { label: 'C. AI生成总结', effects: { 职称积分: 10, 精力: 5, 科研: -5 }, comment: 'AI比你更懂怎么写你的工作总结。' },
        { label: 'D. 不交', effects: { 精力: 15, 职称积分: -20 }, comment: '不交考核表，也是一种态度。' },
      ],
      random_events: ['R3', 'R6'],
    },
    {
      id: 7, title: '评职称答辩：最后的表演',
      event: '答辩现场，评委问："请用三分钟说明你的教育理念。"\n你准备了三年，只有三分钟。',
      options: [
        { label: 'A. 背诵准备稿', effects: { 职称积分: 15, 教学: 5, 精力: -15 }, comment: '你背得很好，评委在翻手机。' },
        { label: 'B. 真情实感分享', effects: { 教学: 10, 职称积分: 10, 网络热度: 10, 精力: -20 }, comment: '你说到支教学生哭了，评委说"控制情绪"。' },
        { label: 'C. 展示数据报表', effects: { 科研: 10, 职称积分: 12, 精力: -10 }, comment: '数据不会说谎，但会让人打瞌睡。' },
        { label: 'D. 用AI生成演讲稿', effects: { 职称积分: 8, 精力: 5 }, comment: 'AI写的比你好，但评委看得出来。' },
      ],
      random_events: ['R5', 'R2'],
    },
  ],
  random_events_pool: [
    { id: 'R1', name: '学生突发打架', chance: 5, effects: { 精力: -15, 班主任年限: -0.5 }, comment: '和平不是教育的默认设置。' },
    { id: 'R2', name: '家长群凌晨轰炸', chance: 10, effects: { 精力: -10, 家庭幸福: -5 }, comment: '教师的夜生活，从来不属于自己。' },
    { id: 'R3', name: '打印机罢工', chance: 7, effects: { 精力: -5, 职称积分: -3 }, comment: '它坏得很准时，像年度考核一样。' },
    { id: 'R4', name: '论文退稿', chance: 15, effects: { 科研: -10, 精力: -10 }, comment: '学术界最稳定的结论：建议修改后另投。' },
    { id: 'R5', name: '公开课被拍视频', chance: 8, effects: { 网络热度: 10, 精力: -5 }, comment: '你在上课，他们在剪视频。' },
    { id: 'R6', name: '临时检查', chance: 6, effects: { 精力: -10, 教学: 5 }, comment: '没有准备的检查，才叫真正的检查。' },
  ],
  endings: [
    { title: '副高通过 🎉', condition: { 职称积分: 100, 教学: 90, 科研: 80, 支教: 1 }, comment: '你达标了，但系统说这是"综合评价结果"。' },
    { title: '材料齐全未晋升', condition: { 职称积分: 70 }, comment: '你没失败，只是排序靠后。明年再来吧。' },
    { title: '教学型赢家 🌟', condition: { 教学: 85, 班主任年限: 8 }, comment: '系统不记录感动，但学生记得。' },
    { title: '生活平衡型 💚', condition: { 家庭幸福: 70 }, comment: '你没有通关，但生活通了。' },
  ],
}

const SAVE_KEY = 'title_evaluation_save'

const defaultAttrs: Attrs = {
  教学: 50, 科研: 40, 班主任年限: 0, 支教: 0,
  职称积分: 0, 精力: 100, 家庭幸福: 80, 网络热度: 0,
}

function checkEnding(attrs: Attrs): { title: string; comment: string } {
  for (const e of DATA.endings) {
    if (Object.keys(e.condition).every(k => attrs[k as keyof Attrs] >= e.condition[k as keyof Attrs]!)) {
      return e
    }
  }
  return { title: '普通结局', comment: '人生无法用数据完全评估。' }
}

export default function TitleEvaluationGame({ onBack }: { onBack: () => void }) {
  const saved = (() => { try { const r = localStorage.getItem(SAVE_KEY); return r ? JSON.parse(r) : null } catch { return null } })()
  const [attrs, setAttrs] = useState<Attrs>(saved?.attrs || defaultAttrs)
  const [stageIdx, setStageIdx] = useState(saved?.finished ? 0 : (saved?.stageIdx || 0))
  const [showResult, setShowResult] = useState(false)
  const [alertMsg, setAlertMsg] = useState<string | null>(null)
  const [finished, setFinished] = useState(saved?.finished || false)
  const [log, setLog] = useState<string[]>(saved?.log || [])

  // Auto-save progress
  useEffect(() => {
    localStorage.setItem(SAVE_KEY, JSON.stringify({ attrs, stageIdx, log, finished }))
  }, [attrs, stageIdx, log, finished])

  const stage = DATA.stages[stageIdx]

  const handleOption = useCallback((opt: Option) => {
    const newAttrs = { ...attrs }
    for (const [k, v] of Object.entries(opt.effects)) {
      if (k in newAttrs) {
        (newAttrs as any)[k] += v!
      }
    }

    // Random events
    const triggered: string[] = []
    for (const reid of stage.random_events) {
      const re = DATA.random_events_pool.find(e => e.id === reid)
      if (re && Math.random() * 100 < re.chance) {
        for (const [k, v] of Object.entries(re.effects)) {
          if (k in newAttrs) (newAttrs as any)[k] += v!
        }
        triggered.push(`${re.name}: ${re.comment}`)
      }
    }

    setAttrs(newAttrs)
    setLog(prev => [`${stage.title} → ${opt.label}: ${opt.comment}`, ...prev].slice(0, 20))

    if (triggered.length > 0) {
      setAlertMsg(triggered.join('\n\n'))
    }

    if (stageIdx >= DATA.stages.length - 1) {
      setFinished(true)
    } else {
      setStageIdx((i: number) => i + 1)
    }
    setShowResult(true)
  }, [attrs, stage, stageIdx])

  if (finished) {
    const ending = checkEnding(attrs)
    return (
      <div style={{
        width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #1a1a2e, #16213e)', color: '#e0d8c8',
        fontFamily: '"Noto Serif SC", serif', padding: 20,
      }}>
        <div style={{ fontSize: 64, marginBottom: 12 }}>📜</div>
        <h1 style={{ fontSize: 24, color: '#f5e8c8', marginBottom: 4 }}>游戏结束</h1>
        <h2 style={{ fontSize: 20, color: '#4fc3f7', marginBottom: 12 }}>{ending.title}</h2>
        <p style={{ color: '#aaa', fontSize: 13, textAlign: 'center', maxWidth: 320, marginBottom: 20 }}>{ending.comment}</p>
        <div style={{
          background: 'rgba(255,255,255,0.06)', padding: '16px 24px', borderRadius: 8,
          marginBottom: 20, minWidth: 220,
        }}>
          <p style={{ fontSize: 11, color: '#888', marginBottom: 8 }}>📊 最终属性</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 20px', fontSize: 12 }}>
            {Object.entries(attrs).map(([k, v]) => (
              <React.Fragment key={k}>
                <span style={{ color: '#888' }}>{k}</span>
                <span style={{ color: '#4fc3f7', fontWeight: 600, textAlign: 'right' }}>{Math.round(v)}</span>
              </React.Fragment>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => { localStorage.removeItem(SAVE_KEY); window.location.reload() }} style={{
            background: '#222', border: '1px solid #333', color: '#888', padding: '10px 32px',
            borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600,
            fontFamily: '"Noto Serif SC", serif',
          }}>重新开始</button>
          <button onClick={onBack} style={{
            background: '#4fc3f7', border: 'none', color: '#0a0a1a', padding: '10px 32px',
            borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600,
            fontFamily: '"Noto Serif SC", serif',
          }}>返回</button>
        </div>
      </div>
    )
  }

  const stageTitle = `第${stageIdx + 1}阶段：${stage.title}`

  return (
    <div style={{
      width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden',
      background: 'linear-gradient(180deg, #0f1923 0%, #1a2838 100%)',
      fontFamily: '"Noto Serif SC", serif', color: '#e0d8c8',
    }}>
      {/* Top bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(15,25,35,0.92)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '10px 16px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: 12 }}>← 返回</button>
        <span style={{ fontSize: 13, color: '#4fc3f7', fontWeight: 600 }}>{stageTitle}</span>
        <span style={{ fontSize: 11, color: '#666' }}>{stageIdx + 1}/{DATA.stages.length}</span>
      </div>

      {/* Stats */}
      <div style={{
        position: 'absolute', top: 44, left: 0, right: 0, zIndex: 100,
        background: 'rgba(15,25,35,0.9)', padding: '6px 16px',
        display: 'flex', gap: 12, fontSize: 10, color: '#888', borderBottom: '1px solid rgba(255,255,255,0.04)',
        flexWrap: 'wrap',
      }}>
        {Object.entries(attrs).map(([k, v]) => (
          <span key={k}>
            {k === '教学' ? '📖' : k === '科研' ? '🔬' : k === '班主任年限' ? '👨‍🏫' :
             k === '支教' ? '🌄' : k === '职称积分' ? '📊' : k === '精力' ? '⚡' :
             k === '家庭幸福' ? '💚' : '🔥'} {k}:{Math.round(v)}
          </span>
        ))}
      </div>

      {/* Main */}
      <div style={{
        position: 'absolute', top: 80, bottom: 0, left: 0, right: 0,
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '0 20px',
      }}>
        <div style={{
          maxWidth: 500, margin: '0 auto', width: '100%',
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 8, padding: '24px 20px',
        }}>
          <h3 style={{ fontSize: 14, color: '#f5e8c8', marginBottom: 12 }}>{stage.event.split('\n').map((l, i) => <span key={i}>{l}<br /></span>)}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {stage.options.map((opt, i) => (
              <button key={i} onClick={() => handleOption(opt)} style={{
                background: 'rgba(79,195,247,0.06)', border: '1px solid rgba(79,195,247,0.2)',
                color: '#e0d8c8', padding: '10px 14px', borderRadius: 6, cursor: 'pointer',
                fontSize: 12, textAlign: 'left', fontFamily: '"Noto Serif SC", serif',
                transition: 'background 0.15s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(79,195,247,0.15)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(79,195,247,0.06)'}
              >
                <span style={{ color: '#4fc3f7', fontWeight: 600, marginRight: 6 }}>{opt.label[0]}</span>
                {opt.label.slice(3)}
              </button>
            ))}
          </div>
        </div>

        {/* Alert overlay */}
        {alertMsg && (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.6)',
          }}>
            <div style={{
              background: '#1a2a3a', border: '1px solid #ffab40', borderRadius: 8,
              padding: '20px 24px', maxWidth: 360, textAlign: 'center',
            }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>⚡</div>
              <h3 style={{ color: '#ffab40', fontSize: 14, marginBottom: 8 }}>随机事件触发！</h3>
              <p style={{ color: '#ccc', fontSize: 12, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{alertMsg}</p>
              <button onClick={() => setAlertMsg(null)} style={{
                marginTop: 12, background: '#ffab40', border: 'none', color: '#0a0a1a',
                padding: '8px 24px', borderRadius: 6, cursor: 'pointer', fontSize: 12,
                fontFamily: '"Noto Serif SC", serif',
              }}>知道了</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
