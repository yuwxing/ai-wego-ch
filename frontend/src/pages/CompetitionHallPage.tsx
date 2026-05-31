import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BookOpen, Cpu, Users, Star, ChevronRight, Award, Target, Sparkles, CheckCircle, Shield, Lightbulb, TrendingUp, Heart, GraduationCap, FileText, MessageCircle, Zap, Globe, BarChart3, Clock, Trophy } from 'lucide-react';
import { getCompetitions } from '../services/competitionService';
import type { Competition } from '../services/competitionService';

const CATEGORIES = [
  {
    id: 'writing',
    icon: <BookOpen className="w-6 h-6" />,
    title: '作文 / 英语类竞赛',
    color: 'from-indigo-500 to-purple-600',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    textColor: 'text-indigo-700',
    desc: '练表达能力，容易获奖（尤其校级/区级），适合普通学生积累"证书"',
    competitions: [
      {
        name: '创新作文大赛',
        icon: <FileText className="w-5 h-5" />,
        desc: '全国性作文竞赛，题材广泛，评审注重创意和表达',
        level: '校级 → 区级 → 省级 → 全国',
        advantage: '选题自由，容易上手，获奖面较宽',
      },
      {
        name: '"叶圣陶杯"作文比赛',
        icon: <Star className="w-5 h-5" />,
        desc: '传统作文赛事，以著名教育家叶圣陶命名，认可度高',
        level: '校级 → 省级 → 全国',
        advantage: '多省白名单赛事，学校统一组织',
      },
      {
        name: '外研社英语能力活动',
        icon: <Globe className="w-5 h-5" />,
        desc: '英语阅读、写作、演讲综合能力展示活动',
        level: '校级 → 地区 → 全国',
        advantage: '英语能力展示，非应试型评价',
      },
    ],
  },
  {
    id: 'tech',
    icon: <Cpu className="w-6 h-6" />,
    title: '科技体验类竞赛',
    color: 'from-cyan-500 to-blue-600',
    bg: 'bg-cyan-50',
    border: 'border-cyan-200',
    textColor: 'text-cyan-700',
    desc: '偏"项目展示"，不是硬核竞赛算法，做个小作品就能参与',
    competitions: [
      {
        name: '青少年科技创新活动（基础组）',
        icon: <Lightbulb className="w-5 h-5" />,
        desc: '展示你的小发明、小创造，注重创意和过程而非技术深度',
        level: '区级 → 市级 → 省级',
        advantage: '门槛低，做个小项目就能参加',
      },
      {
        name: '简单机器人 / 编程入门比赛',
        icon: <Zap className="w-5 h-5" />,
        desc: '图形化编程、简单机器人搭建，零基础也能参与',
        level: '校级 → 区级 → 市级',
        advantage: '学校社团通常有培训，容易入门',
      },
      {
        name: '人工智能体验类竞赛',
        icon: <BarChart3 className="w-5 h-5" />,
        desc: 'AI应用展示、智能硬件创意，可结合日常生活问题',
        level: '区级 → 省级',
        advantage: '展示AI应用能力，紧跟时代趋势',
      },
    ],
  },
  {
    id: 'practice',
    icon: <Users className="w-6 h-6" />,
    title: '综合实践类',
    color: 'from-emerald-500 to-teal-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    textColor: 'text-emerald-700',
    desc: '基本"参与就有收获"，用于综合素质评价',
    competitions: [
      {
        name: '社会实践报告比赛',
        icon: <FileText className="w-5 h-5" />,
        desc: '记录你的社会调查、志愿服务经历，形成实践报告',
        level: '校级 → 区级',
        advantage: '结合真实经历，言之有物',
      },
      {
        name: '演讲比赛',
        icon: <MessageCircle className="w-5 h-5" />,
        desc: '主题演讲、即兴演讲，锻炼表达能力和自信心',
        level: '校级 → 区级 → 市级',
        advantage: '提升口语表达，对面试有帮助',
      },
      {
        name: '研究性学习展示',
        icon: <GraduationCap className="w-5 h-5" />,
        desc: '学校组织的研究课题展示，团队合作完成',
        level: '校级展示',
        advantage: '学校统一组织，参与就有综评加分',
      },
    ],
  },
];

const FEATURES = [
  { icon: <Shield className="w-5 h-5" />, text: '门槛低，大部分学校都能参加' },
  { icon: <Heart className="w-5 h-5" />, text: '不需要天赋型竞赛能力' },
  { icon: <TrendingUp className="w-5 h-5" />, text: '更偏"展示型成果"' },
  { icon: <Users className="w-5 h-5" />, text: '一般学校统一组织报名' },
];

const BENEFITS = [
  { icon: <Award className="w-6 h-6" />, title: '丰富综合素质评价', desc: '充实综评档案，为升学增加亮点' },
  { icon: <Target className="w-6 h-6" />, title: '特色班 / 校内推荐', desc: '可能用于特色班选拔和校内推荐机会' },
  { icon: <TrendingUp className="w-6 h-6" />, title: '提升核心能力', desc: '锻炼表达、组织、创新等综合能力' },
];



export default function CompetitionHallPage() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const [competitions] = useState<Competition[]>(() => getCompetitions());

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-indigo-50 pb-20">
      {/* 顶部横幅 */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white">
        <div className="max-w-4xl mx-auto px-5 pt-10 pb-12">
          <div className="flex items-center gap-2 text-white/70 text-sm mb-3">
            <Award className="w-4 h-4" />
            <span>竞赛中心</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">竞赛中心</h1>
          <p className="text-white/80 text-lg">参加竞赛 · AI创作</p>
        </div>
      </div>

      {/* 竞赛活动内容 */}
      {/* 适合人群 */}
      <div className="max-w-4xl mx-auto -mt-6 px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-indigo-100 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-5 h-5 text-indigo-500" />
            <h2 className="font-bold text-[#1E293B]">适合谁？</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { icon: <BarChart3 className="w-4 h-4" />, text: '成绩中等或中等偏上' },
              { icon: <FileText className="w-4 h-4" />, text: '想让简历"有内容"' },
              { icon: <Heart className="w-4 h-4" />, text: '不打算冲顶级名校竞赛路线' },
              { icon: <Star className="w-4 h-4" />, text: '希望提升综合能力' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2.5 bg-indigo-50 rounded-xl px-4 py-3">
                <div className="text-indigo-500">{item.icon}</div>
                <span className="text-sm text-[#1E293B] font-medium">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 三大竞赛类别 */}
      <div className="max-w-4xl mx-auto mt-6 px-4">
        <h2 className="text-lg font-bold text-[#1E293B] mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-500" />
          常见竞赛类型
        </h2>

        <div className="space-y-4">
          {CATEGORIES.map((cat) => (
            <div key={cat.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              {/* 类别头部 */}
              <button
                onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
                className="w-full flex items-center gap-4 p-5 hover:bg-slate-50 transition-colors text-left"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-white shadow-sm flex-shrink-0`}>
                  {cat.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-[#1E293B]">{cat.title}</h3>
                  <p className="text-[#94A3B8] text-sm mt-0.5">{cat.desc}</p>
                </div>
                <ChevronRight className={`w-5 h-5 text-[#CBD5E1] transition-transform ${activeCategory === cat.id ? 'rotate-90' : ''}`} />
              </button>

              {/* 展开的竞赛列表 */}
              {activeCategory === cat.id && (
                <div className="px-5 pb-5 space-y-3 border-t border-slate-100 pt-4">
                  {cat.competitions.map((comp, i) => (
                    <div key={i} className={`${cat.bg} rounded-xl p-4 border ${cat.border}`}>
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-lg ${cat.bg} flex items-center justify-center ${cat.textColor} flex-shrink-0 border ${cat.border}`}>
                          {comp.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-bold text-[#1E293B] text-sm">{comp.name}</h4>
                            <span className="text-[10px] bg-white px-2 py-0.5 rounded-full text-[#64748B] border border-slate-200">{comp.level}</span>
                          </div>
                          <p className="text-[#64748B] text-xs mt-1">{comp.desc}</p>
                          <div className="mt-2 flex items-center gap-1.5 text-xs">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-emerald-700">{comp.advantage}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 现实作用 */}
      <div className="max-w-4xl mx-auto mt-6 px-4">
        <h2 className="text-lg font-bold text-[#1E293B] mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-indigo-500" />
          现实作用
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {BENEFITS.map((b, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 text-center hover:shadow-sm transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center mx-auto mb-3 text-indigo-600">
                {b.icon}
              </div>
              <h3 className="font-bold text-[#1E293B] text-sm mb-1">{b.title}</h3>
              <p className="text-[#94A3B8] text-xs">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 底部说明 */}
      <div className="max-w-4xl mx-auto mt-6 px-4">
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 p-5 text-center">
          <p className="text-[#64748B] text-sm">
            白名单比赛让学校、教师、学生、家长都了解，自愿参赛
          </p>
          <p className="text-[#94A3B8] text-xs mt-2">
            每学期关注学校通知，选择适合自己的比赛参与
          </p>
        </div>
      </div>
    </div>
  );
}
