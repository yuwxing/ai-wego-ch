// ── Teaching workflow: lesson plans, exercises, essay grading ──

import { TeacherAI } from './TeacherAI'

// ── Lesson Plan ──
export interface LessonStep {
  type: 'intro' | 'explain' | 'example' | 'exercise' | 'summary'
  title: string
  content: string
  duration: number  // seconds
}

export interface LessonPlan {
  topic: string
  steps: LessonStep[]
}

export class TeachingWorkflow {
  private ai: TeacherAI
  private currentLesson: LessonPlan | null = null
  private currentStep = 0

  constructor(ai: TeacherAI) {
    this.ai = ai
  }

  /** Generate a lesson plan for a topic */
  async createLesson(topic: string): Promise<LessonPlan> {
    const prompt = `请为英语语法「${topic}」设计一个教学计划，包含以下步骤：
1. 引入（介绍这个语法点的用途和重要性）
2. 讲解（核心规则和公式）
3. 例句（3个典型例句）
4. 练习（一个填空题）
5. 总结

请用中文回答，每部分用 【】 标记。`

    const reply = await this.ai.send(prompt)
    const steps = this.parseSteps(reply, topic)
    this.currentLesson = { topic, steps }
    this.currentStep = 0
    return this.currentLesson
  }

  private parseSteps(reply: string, topic: string): LessonStep[] {
    const sections = reply.split(/【([^】]+)】/).filter(Boolean)
    const steps: LessonStep[] = []
    const typeMap: Record<string, LessonStep['type']> = {
      '引入': 'intro', '导入': 'intro',
      '讲解': 'explain', '核心规则': 'explain',
      '例句': 'example', '例子': 'example',
      '练习': 'exercise', '习题': 'exercise',
      '总结': 'summary', '小结': 'summary',
    }

    for (let i = 0; i < sections.length - 1; i += 2) {
      const title = sections[i].trim()
      const content = (sections[i + 1] || '').trim()
      const type = typeMap[title] || 'explain'
      steps.push({ type, title, content, duration: type === 'exercise' ? 30 : 20 })
    }

    if (steps.length === 0) {
      steps.push({ type: 'explain', title: topic, content: reply, duration: 30 })
    }

    return steps
  }

  getCurrentLesson() { return this.currentLesson }
  getCurrentStep() { return this.currentStep }

  nextStep(): LessonStep | null {
    if (!this.currentLesson) return null
    this.currentStep++
    if (this.currentStep >= this.currentLesson.steps.length) {
      this.currentStep = this.currentLesson.steps.length - 1
      return null
    }
    return this.currentLesson.steps[this.currentStep]
  }

  prevStep(): LessonStep | null {
    if (!this.currentLesson) return null
    this.currentStep = Math.max(0, this.currentStep - 1)
    return this.currentLesson.steps[this.currentStep]
  }

  isComplete(): boolean {
    return !this.currentLesson || this.currentStep >= this.currentLesson.steps.length - 1
  }

  /** Generate a practice question */
  async generateQuestion(topic: string, difficulty: 'easy' | 'medium' | 'hard' = 'medium'): Promise<string> {
    const prompt = `请出一道关于英语语法「${topic}」的${difficulty === 'easy' ? '简单' : difficulty === 'medium' ? '中等' : '困难'}难度的练习题。
要求：
- 包含题目和选项（如果是选择题）
- 给出正确答案
- 简单解析原因`
    return this.ai.send(prompt)
  }

  /** Grade an essay (delegates to DeepSeek) */
  async gradeEssay(text: string, prompt?: string): Promise<string> {
    const gradingPrompt = `请对以下英语作文进行评分和批改（满分15分）：
1. 总评分及档次
2. 分项评分：内容(5分)、语言(5分)、结构(5分)
3. 具体问题标注
4. 修改建议
5. 范文片段参考

作文题目：${prompt || '未指定'}
作文内容：
${text}`
    return this.ai.send(gradingPrompt)
  }

  /** Generate a structured lesson (returns markdown-like text) */
  async teachTopic(topic: string): Promise<string> {
    const prompt = `请以英语数字教师的身份，系统讲解「${topic}」：
一、基本概念和定义
二、核心规则（用公式表达）
三、典型例句（3-5个，带中文翻译）
四、常见错误
五、练习题（3道，含答案和解析）`
    return this.ai.send(prompt)
  }
}
