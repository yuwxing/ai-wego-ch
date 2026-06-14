import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Award, ChevronRight, ExternalLink, Calendar, Star, Clock, Shield, AlertTriangle, BookOpen, Cpu, Palette, Users, GraduationCap, TrendingUp, Trophy, Filter, Search, Sparkles, Heart, CheckCircle, Target, Lightbulb, Zap, Globe, BarChart3, FileText, MessageCircle, Plus, Loader2, X, Send, User, School, Phone } from 'lucide-react';
import { getCompetitions } from '../services/competitionService';
import { useUser } from '../contexts/UserContext';
import toast from 'react-hot-toast';

type Category = 'all' | 'science' | 'humanity' | 'art';
type Level = 'all' | 'primary' | 'junior' | 'senior' | 'vocational';
type TimeFilter = 'all' | 'june' | 'july' | 'august' | 'upcoming';

const ALL_COMPETITIONS = [
  {
    name: '全球发明大会(中国)竞赛活动',
    organizer: '中国友好和平发展基金会',
    levels: ['小学', '初中', '高中', '中职'],
    difficulty: 3,
    status: '报名中',
    deadline: '6月15日',
    matchTime: '7-8月',
    desc: '需提交原创发明项目，包括发明原型或模型、发明日志、查新报告等',
    url: 'https://www.ccpef.org/',
    category: 'science',
    specialty: '发明创造、动手能力',
    suitable: '入门级',
    recommended: true,
    entryLevel: 'junior',
  },
  {
    name: '中华诗词美育大赛',
    organizer: '中华诗词学会',
    levels: ['小学', '初中', '高中', '中职'],
    difficulty: 2,
    status: '报名中',
    deadline: '6月20日',
    matchTime: '7-8月',
    desc: '以中华传统诗词为载体，融合美育教育，展示诗词朗诵、赏析与创作能力',
    url: 'https://www.zhscxh.com/',
    category: 'humanity',
    specialty: '文学、朗诵',
    suitable: '入门级',
    recommended: true,
    entryLevel: 'junior',
  },
  {
    name: '全国青少年红色文化传承大赛',
    organizer: '中国红色文化研究会',
    levels: ['小学', '初中', '高中'],
    difficulty: 2,
    status: '报名中',
    deadline: '6月25日',
    matchTime: '7-8月',
    desc: '围绕红色文化主题，开展演讲、征文、设计等多种形式的比赛',
    url: 'https://www.crct.org.cn/',
    category: 'humanity',
    specialty: '历史、演讲、设计',
    suitable: '入门级',
    recommended: true,
    entryLevel: 'junior',
  },
  {
    name: '全国中小学生海洋文化创意设计大赛',
    organizer: '中国海洋发展基金会',
    levels: ['小学', '初中', '高中', '中职'],
    difficulty: 2,
    status: '报名中',
    deadline: '6月30日',
    matchTime: '7-8月',
    desc: '以海洋文化为主题，涵盖美术设计、创意作品、AIGC创作等多种形式',
    url: 'https://www.codf.cn/',
    category: 'art',
    specialty: '美术、设计、AIGC',
    suitable: '入门级',
    recommended: true,
    entryLevel: 'junior',
  },
  {
    name: '全国青少年禁毒知识竞赛',
    organizer: '国家禁毒委员会办公室',
    levels: ['小学', '初中', '高中', '中职'],
    difficulty: 2,
    status: '即将开始',
    deadline: '11月',
    matchTime: '11月',
    desc: '通过知识竞赛形式普及禁毒知识，增强青少年防毒意识',
    url: 'https://www.626.gov.cn/',
    category: 'humanity',
    specialty: '知识答题',
    suitable: '入门级',
    recommended: true,
    entryLevel: 'junior',
  },
  {
    name: '全国青少年人工智能辅助生成数字艺术大赛',
    organizer: '中国人工智能学会',
    levels: ['初中', '高中'],
    difficulty: 3,
    status: '报名中',
    deadline: '6月20日（省赛）',
    matchTime: '7-8月',
    desc: '利用AI工具辅助创作数字艺术作品，展现技术与创意的结合',
    url: 'https://www.caai.cn/',
    category: 'science',
    specialty: 'AI、美术、创意',
    suitable: '进阶级',
    recommended: true,
    entryLevel: 'junior',
  },
  {
    name: '全国青少年无人机大赛',
    organizer: '中国航空学会',
    levels: ['小学', '初中', '高中', '中职'],
    difficulty: 3,
    status: '即将开始',
    deadline: '各地区自行安排',
    matchTime: '8月10-13日',
    desc: '涵盖无人机操控、编程、团体赛等多个赛项，考验动手与反应能力',
    url: 'https://www.csaa.org.cn/',
    category: 'science',
    specialty: '动手能力、反应敏捷',
    suitable: '进阶级',
    recommended: true,
    entryLevel: 'junior',
  },
  {
    name: '全国青少年航天创新大赛',
    organizer: '中国航天科技国际交流中心',
    levels: ['小学', '初中', '高中', '中职'],
    difficulty: 3,
    status: '报名中',
    deadline: '3月起',
    matchTime: '7-8月',
    desc: '围绕航天主题开展科技创新，包含航天创意、航天科学探究等赛项',
    url: 'https://www.castic.org.cn/',
    category: 'science',
    specialty: '科技、航天、编程',
    suitable: '进阶级',
    recommended: true,
    entryLevel: 'junior',
  },
  {
    name: '全国中学生天文知识竞赛',
    organizer: '中国天文学会',
    levels: ['初中', '高中'],
    difficulty: 4,
    status: '已截止',
    deadline: '每年3月',
    matchTime: '5月',
    desc: '考察天文基础知识和观测技能，培养天文科学兴趣',
    url: 'https://www.cas.cn/',
    category: 'science',
    specialty: '天文、物理',
    suitable: '挑战级',
    recommended: false,
    entryLevel: 'junior',
  },
  {
    name: '全国青少年科技创新大赛',
    organizer: '中国科协',
    levels: ['小学', '初中', '高中'],
    difficulty: 4,
    status: '已截止',
    deadline: '每年4-5月',
    matchTime: '7-8月',
    desc: '全国规模最大的青少年科技竞赛，涵盖工程、科学、技术等多个领域',
    url: 'https://castic.xiaoxiaotong.org/',
    category: 'science',
    specialty: '科技创新、科研',
    suitable: '挑战级',
    recommended: false,
    entryLevel: 'junior',
  },
  {
    name: '五大学科奥林匹克竞赛',
    organizer: '中国科协',
    levels: ['高中'],
    difficulty: 5,
    status: '即将开始',
    deadline: '每年9-10月',
    matchTime: '次年3-8月',
    desc: '数学、物理、化学、生物、信息学五大学科竞赛，顶尖学生选拔',
    url: 'https://www.cyscc.org/',
    category: 'science',
    specialty: '数学、物理、化学、生物、信息学',
    suitable: '挑战级',
    recommended: false,
    entryLevel: 'senior',
  },
  {
    name: '"驾驭未来"全国青少年车辆模型教育竞赛',
    organizer: '中国车辆模型运动协会',
    levels: ['小学', '初中', '高中'],
    difficulty: 3,
    status: '即将开始',
    deadline: '各地区自行安排',
    matchTime: '7月上旬',
    desc: '车辆模型的设计、制作与操控竞赛，培养动手能力和工程思维',
    url: 'https://www.cmva.org.cn/',
    category: 'science',
    specialty: '动手能力、模型制作',
    suitable: '进阶级',
    recommended: false,
    entryLevel: 'junior',
  },
  {
    name: '全国青少年模拟飞行锦标赛',
    organizer: '中国航空运动协会',
    levels: ['小学', '初中', '高中'],
    difficulty: 3,
    status: '即将开始',
    deadline: '各地区自行安排',
    matchTime: '7月中旬',
    desc: '通过模拟飞行软件进行飞行技术竞赛，体验飞行驾驶乐趣',
    url: 'https://www.asfc.org.cn/',
    category: 'science',
    specialty: '模拟飞行、反应能力',
    suitable: '进阶级',
    recommended: false,
    entryLevel: 'junior',
  },
  {
    name: '"我爱祖国海疆"全国青少年航海模型教育竞赛',
    organizer: '中国航海模型运动协会',
    levels: ['小学', '初中', '高中'],
    difficulty: 3,
    status: '即将开始',
    deadline: '各地区自行安排',
    matchTime: '7月下旬',
    desc: '航海模型的设计、制作与航行竞赛，融合科技与海洋教育',
    url: 'https://www.cmma.org.cn/',
    category: 'science',
    specialty: '航海模型、动手能力',
    suitable: '进阶级',
    recommended: false,
    entryLevel: 'junior',
  },
  {
    name: '"飞向北京·飞向太空"全国青少年航空航天模型竞赛',
    organizer: '中国航空运动协会',
    levels: ['小学', '初中', '高中'],
    difficulty: 3,
    status: '即将开始',
    deadline: '各地区自行安排',
    matchTime: '8月中旬',
    desc: '航空航天模型的设计、制作与飞行竞赛，培养航空科技兴趣',
    url: 'https://www.asfc.org.cn/',
    category: 'science',
    specialty: '航空模型、动手能力',
    suitable: '进阶级',
    recommended: false,
    entryLevel: 'junior',
  },
  {
    name: '全国青少年传统体育项目比赛',
    organizer: '中国青少年宫协会',
    levels: ['小学', '初中', '高中'],
    difficulty: 3,
    status: '即将开始',
    deadline: '各地区自行安排',
    matchTime: '8月21-25日',
    desc: '涵盖武术、棋类、传统体育游戏等中华传统体育项目',
    url: 'https://www.cnypa.org/',
    category: 'art',
    specialty: '传统体育、武术、棋类',
    suitable: '进阶级',
    recommended: false,
    entryLevel: 'junior',
  },
];

const CATEGORY_TABS = [
  { id: 'all' as Category, label: '全部赛事' },
  { id: 'science' as Category, label: '自然科学素养类', count: 8 },
  { id: 'humanity' as Category, label: '人文综合素养类', count: 5 },
  { id: 'art' as Category, label: '艺术体育类', count: 3 },
];

const LEVEL_TABS = [
  { id: 'all' as Level, label: '全部' },
  { id: 'primary' as Level, label: '小学' },
  { id: 'junior' as Level, label: '初中' },
  { id: 'senior' as Level, label: '高中' },
  { id: 'vocational' as Level, label: '中职' },
];

const TIME_TABS = [
  { id: 'all' as TimeFilter, label: '全部' },
  { id: 'june' as TimeFilter, label: '6月截止' },
  { id: 'july' as TimeFilter, label: '7月比赛' },
  { id: 'august' as TimeFilter, label: '8月比赛' },
  { id: 'upcoming' as TimeFilter, label: '即将开始' },
];

const SUIJIAN_CALENDAR = [
  { month: '6月', label: '报名冲刺月', events: [
    { date: '6月15日', event: '全球发明大会(中国)竞赛活动 报名截止' },
    { date: '6月20日', event: '中华诗词美育大赛 报名截止' },
    { date: '6月20日', event: '全国青少年AI辅助生成数字艺术大赛 省赛截止' },
    { date: '6月25日', event: '全国青少年红色文化传承大赛 报名截止' },
    { date: '6月30日', event: '全国中小学生海洋文化创意设计大赛 报名截止' },
  ]},
  { month: '7月', label: '比赛集中月', events: [
    { date: '7月上旬', event: '"驾驭未来"全国青少年车辆模型教育竞赛 总决赛' },
    { date: '7月中旬', event: '全国青少年模拟飞行锦标赛 总决赛' },
    { date: '7月下旬', event: '"我爱祖国海疆"全国青少年航海模型教育竞赛 总决赛' },
    { date: '7月全月', event: '全国青少年航天创新大赛 全国总决赛' },
  ]},
  { month: '8月', label: '暑期收官月', events: [
    { date: '8月10-13日', event: '全国青少年无人机大赛 全国总决赛（天津）' },
    { date: '8月中旬', event: '"飞向北京·飞向太空"全国青少年航空航天模型竞赛 总决赛' },
    { date: '8月21-25日', event: '全国青少年传统体育项目比赛 全国总决赛（上海）' },
  ]},
];

const JUNIOR_COMPETITIONS = {
  beginner: ALL_COMPETITIONS.filter(c => c.suitable === '入门级' && c.entryLevel === 'junior'),
  intermediate: ALL_COMPETITIONS.filter(c => c.suitable === '进阶级' && c.entryLevel === 'junior'),
  advanced: ALL_COMPETITIONS.filter(c => c.suitable === '挑战级' && c.entryLevel === 'junior'),
};

function searchUrl(name: string) {
  return `https://www.baidu.com/s?wd=${encodeURIComponent(name + ' 报名')}`;
}

function CompetitionCard({ comp }: { comp: typeof ALL_COMPETITIONS[number] }) {
  const diffStars = Array.from({ length: 5 }, (_, i) => i < comp.difficulty);
  const statusColors: Record<string, string> = {
    '报名中': 'bg-emerald-100 text-emerald-700',
    '即将开始': 'bg-amber-100 text-amber-700',
    '已截止': 'bg-slate-100 text-slate-500',
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="font-bold text-slate-800 text-sm">{comp.name}</h3>
            {comp.recommended && (
              <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">推荐</span>
            )}
          </div>
          <p className="text-xs text-slate-400 mb-2">主办：{comp.organizer}</p>
          <p className="text-xs text-slate-500 mb-3">{comp.desc}</p>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">{comp.levels.join('/')}</span>
            <span className="flex items-center gap-0.5">
              {diffStars.map((filled, i) => (
                <Star key={i} className={`w-3 h-3 ${filled ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
              ))}
            </span>
            <span className={`px-2 py-0.5 rounded-full font-medium ${statusColors[comp.status] || 'bg-slate-100 text-slate-600'}`}>
              {comp.status}{comp.deadline ? `（截止${comp.deadline}）` : ''}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
        <button
          onClick={() => window.open(searchUrl(comp.name), '_blank')}
          className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
        >
          查看详情 <ExternalLink className="w-3 h-3" />
        </button>
        <button
          onClick={() => window.open(searchUrl(comp.name), '_blank')}
          className="text-xs bg-indigo-600 text-white px-3 py-1 rounded-full hover:bg-indigo-700 flex items-center gap-1"
        >
          立即报名 <ExternalLink className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

export default function CompetitionHallPage() {
  const navigate = useNavigate();
  const [category, setCategory] = useState<Category>('all');
  const [level, setLevel] = useState<Level>('all');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [userCompetitions, setUserCompetitions] = useState<any[]>([]);
  const [loadingComp, setLoadingComp] = useState(true);

  const [showRegModal, setShowRegModal] = useState(false);
  const [selectedComp, setSelectedComp] = useState<any>(null);
  const [regName, setRegName] = useState('');
  const [regSchool, setRegSchool] = useState('');
  const [regGrade, setRegGrade] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regSubmitting, setRegSubmitting] = useState(false);
  
  

  useEffect(() => {
    getCompetitions().then(list => {
      // Deduplicate by title - keep first occurrence
      const seen = new Set<string>();
      const deduped = list.filter(comp => {
        const key = comp.title?.trim().toLowerCase() || comp.id;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      setUserCompetitions(deduped);
      setLoadingComp(false);
    }).catch(() => setLoadingComp(false));
  }, []);

  const filtered = ALL_COMPETITIONS.filter(c => {
    if (category !== 'all' && c.category !== category) return false;
    if (level !== 'all' && !c.levels.some(l => {
      const map: Record<string, string> = { primary: '小学', junior: '初中', senior: '高中', vocational: '中职' };
      return l === map[level];
    })) return false;
    if (timeFilter === 'june' && !c.deadline?.includes('6月')) return false;
    if (timeFilter === 'july' && !c.matchTime?.includes('7月')) return false;
    if (timeFilter === 'august' && !c.matchTime?.includes('8月')) return false;
    if (timeFilter === 'upcoming' && c.status !== '即将开始') return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-indigo-50 pb-20">
      {/* ===== 一、横幅大图 ===== */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white">
        <div className="max-w-5xl mx-auto px-5 pt-10 pb-16">
          <div className="flex items-center gap-2 text-white/70 text-sm mb-3">
            <Award className="w-4 h-4" />
            <span>竞赛中心</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">教育部官方认证 · 全国中小学生竞赛白名单</h1>
          <p className="text-white/80 text-sm sm:text-base mb-6">2025-2028学年最新版 | 47项权威赛事 | 全程免费参与</p>
          <div className="flex flex-wrap gap-3">
            <a href="#all-list" className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur px-4 py-2 rounded-full text-sm hover:bg-white/30 transition-colors">
              查看完整白名单 <ChevronRight className="w-4 h-4" />
            </a>
            <a href="#junior" className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur px-4 py-2 rounded-full text-sm hover:bg-white/30 transition-colors">
              初中组赛事汇总 <ChevronRight className="w-4 h-4" />
            </a>
            <a href="#calendar" className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur px-4 py-2 rounded-full text-sm hover:bg-white/30 transition-colors">
              近期赛事日历 <ChevronRight className="w-4 h-4" />
            </a>
            <Link to="/competitions/new" className="inline-flex items-center gap-1.5 bg-white/30 backdrop-blur px-4 py-2 rounded-full text-sm hover:bg-white/40 transition-colors">
              <Plus className="w-4 h-4" /> 创建竞赛
            </Link>
          </div>
        </div>
      </div>

      {/* ===== 核心数据展示区 ===== */}
      <div className="max-w-5xl mx-auto -mt-8 px-4 mb-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: <Award className="w-5 h-5" />, value: '47项', label: '官方认证赛事', color: 'from-indigo-500 to-purple-600' },
            { icon: <Target className="w-5 h-5" />, value: '37项', label: '初中可参加', color: 'from-emerald-500 to-teal-600' },
            { icon: <Calendar className="w-5 h-5" />, value: '12项', label: '6-8月可报名', color: 'from-amber-500 to-orange-600' },
            { icon: <TrendingUp className="w-5 h-5" />, value: '2026年5月', label: '已更新至最新', color: 'from-cyan-500 to-blue-600' },
          ].map((item, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 text-center hover:shadow-md transition-shadow">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white mx-auto mb-2`}>
                {item.icon}
              </div>
              <div className="text-xl font-bold text-slate-800">{item.value}</div>
              <div className="text-xs text-slate-400 mt-0.5">{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== 我创建的竞赛 ===== */}
      {userCompetitions.length > 0 && (
        <div className="max-w-5xl mx-auto px-4 mb-8">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-violet-500" />
            我的竞赛
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {userCompetitions.map((comp) => (
              <div
                key={comp.id}
                onClick={() => { setSelectedComp(comp); setShowRegModal(true); }}
                className="bg-white rounded-2xl border border-violet-200 p-5 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-bold text-slate-800 text-sm">{comp.title}</h3>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        comp.status === 'running' ? 'bg-emerald-100 text-emerald-700' :
                        comp.status === 'ended' ? 'bg-slate-100 text-slate-500' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {comp.status === 'running' ? '进行中' : comp.status === 'ended' ? '已结束' : '即将开始'}
                      </span>
                    </div>
                    {comp.subtitle && <p className="text-xs text-slate-400 mb-2 truncate">{comp.subtitle}</p>}
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="bg-violet-50 text-violet-600 px-2 py-0.5 rounded-full">{comp.category}</span>
                      <span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">{comp.difficulty}</span>
                      <span className="flex items-center gap-1 text-slate-500">
                        <Trophy className="w-3 h-3" />
                        {comp.rewardWEG} 积分
                      </span>
                      <span className="flex items-center gap-1 text-slate-500">
                        <Users className="w-3 h-3" />
                        {comp.participants || 0}人
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== 二、赛事总览 ===== */}
      <div className="max-w-5xl mx-auto px-4 mb-8" id="all-list">
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-500" />
          2025-2028教育部白名单赛事总览
        </h2>

        {/* 筛选栏 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-4 space-y-3">
          <div className="flex flex-wrap gap-2">
            {CATEGORY_TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setCategory(tab.id)}
                className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
                  category === tab.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}{tab.count ? `(${tab.count})` : ''}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-slate-400 mr-1 self-center">学段筛选：</span>
            {LEVEL_TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setLevel(tab.id)}
                className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
                  level === tab.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-slate-400 mr-1 self-center">时间筛选：</span>
            {TIME_TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setTimeFilter(tab.id)}
                className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
                  timeFilter === tab.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* 赛事列表 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map((comp, i) => (
            <CompetitionCard key={i} comp={comp} />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-12 text-slate-400">
              暂无匹配的赛事，请调整筛选条件
            </div>
          )}
        </div>
      </div>

      {/* ===== 三、初中组专属赛事汇总 ===== */}
      <div className="max-w-5xl mx-auto px-4 mb-8" id="junior">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white mb-6">
          <div className="flex items-center gap-2 mb-2">
            <GraduationCap className="w-6 h-6" />
            <h2 className="text-xl font-bold">初中组专属赛事汇总</h2>
          </div>
          <p className="text-white/80 text-sm">重点推荐 · 按难度分级，适合不同水平学生</p>
        </div>

        {/* 入门级 */}
        <div className="mb-6">
          <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            入门级（难度★★☆☆☆，适合初次参赛）
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-100 text-slate-600">
                  <th className="text-left px-3 py-2 rounded-l-lg font-medium">赛事名称</th>
                  <th className="text-left px-3 py-2 font-medium">报名截止</th>
                  <th className="text-left px-3 py-2 font-medium">比赛时间</th>
                  <th className="text-left px-3 py-2 rounded-r-lg font-medium">适合特长</th>
                </tr>
              </thead>
              <tbody>
                {JUNIOR_COMPETITIONS.beginner.map((c, i) => (
                  <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-3 py-2.5 font-medium text-slate-800">{c.name}</td>
                    <td className="px-3 py-2.5 text-slate-600">{c.deadline}</td>
                    <td className="px-3 py-2.5 text-slate-600">{c.matchTime}</td>
                    <td className="px-3 py-2.5 text-slate-600">{c.specialty}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 进阶级 */}
        <div className="mb-6">
          <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-500" />
            进阶级（难度★★★☆☆，适合有一定基础）
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-100 text-slate-600">
                  <th className="text-left px-3 py-2 rounded-l-lg font-medium">赛事名称</th>
                  <th className="text-left px-3 py-2 font-medium">报名截止</th>
                  <th className="text-left px-3 py-2 font-medium">比赛时间</th>
                  <th className="text-left px-3 py-2 rounded-r-lg font-medium">适合特长</th>
                </tr>
              </thead>
              <tbody>
                {JUNIOR_COMPETITIONS.intermediate.map((c, i) => (
                  <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-3 py-2.5 font-medium text-slate-800">{c.name}</td>
                    <td className="px-3 py-2.5 text-slate-600">{c.deadline}</td>
                    <td className="px-3 py-2.5 text-slate-600">{c.matchTime}</td>
                    <td className="px-3 py-2.5 text-slate-600">{c.specialty}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 挑战级 */}
        <div>
          <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-rose-500" />
            挑战级（难度★★★★☆以上，适合特长生）
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-100 text-slate-600">
                  <th className="text-left px-3 py-2 rounded-l-lg font-medium">赛事名称</th>
                  <th className="text-left px-3 py-2 font-medium">报名时间</th>
                  <th className="text-left px-3 py-2 font-medium">比赛时间</th>
                  <th className="text-left px-3 py-2 rounded-r-lg font-medium">适合特长</th>
                </tr>
              </thead>
              <tbody>
                {JUNIOR_COMPETITIONS.advanced.map((c, i) => (
                  <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-3 py-2.5 font-medium text-slate-800">{c.name}</td>
                    <td className="px-3 py-2.5 text-slate-600">{c.deadline}</td>
                    <td className="px-3 py-2.5 text-slate-600">{c.matchTime}</td>
                    <td className="px-3 py-2.5 text-slate-600">{c.specialty}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ===== 四、6-8月赛事日历 ===== */}
      <div className="max-w-5xl mx-auto px-4 mb-8" id="calendar">
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-indigo-500" />
          2026年6-8月赛事日历
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {SUIJIAN_CALENDAR.map((month, mi) => (
            <div key={mi} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className={`px-4 py-3 font-bold text-white text-sm ${
                mi === 0 ? 'bg-rose-500' : mi === 1 ? 'bg-amber-500' : 'bg-indigo-500'
              }`}>
                {month.month} · {month.label}
              </div>
              <div className="p-4 space-y-3">
                {month.events.map((evt, ei) => (
                  <div key={ei} className="flex items-start gap-2">
                    <div className={`text-xs font-bold px-2 py-0.5 rounded-full mt-0.5 whitespace-nowrap ${
                      mi === 0 ? 'bg-rose-100 text-rose-700' : mi === 1 ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'
                    }`}>
                      {evt.date}
                    </div>
                    <span className="text-xs text-slate-600">{evt.event}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== 五、备赛指南 ===== */}
      <div className="max-w-5xl mx-auto px-4 mb-8">
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-amber-500" />
          热门赛事备赛指南
        </h2>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-slate-800 text-sm">2026年6-8月赛事备赛全攻略</h3>
          </div>
          <p className="text-xs text-slate-500 mb-4">针对即将到来的比赛，我们为您准备了详细的备赛计划和核心考点</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {[
              { name: '全球发明大会', desc: '作品制作+查新报告+答辩技巧' },
              { name: '中华诗词美育大赛', desc: '诗词选择+诵读技巧+视频录制指南' },
              { name: '海洋文化创意设计大赛', desc: '主题构思+AIGC创作+作品说明' },
              { name: '无人机大赛', desc: '基础操控+赛项训练+设备保养' },
              { name: '航海/车辆/航空模型竞赛', desc: '模型制作+调试技巧+比赛策略' },
            ].map((guide, i) => (
              <div key={i} className="bg-indigo-50 rounded-xl p-3 border border-indigo-100 hover:shadow-sm transition-shadow">
                <h4 className="font-bold text-indigo-700 text-xs mb-1">{guide.name}</h4>
                <p className="text-xs text-slate-500">{guide.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== 六、参赛须知 ===== */}
      <div className="max-w-5xl mx-auto px-4 mb-8">
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-emerald-500" />
          参赛须知与重要提醒
        </h2>
        <div className="space-y-4">
          <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-5">
            <h3 className="font-bold text-emerald-800 text-sm mb-3 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              官方认证保障
            </h3>
            <ul className="space-y-2">
              {[
                '所有赛事均为教育部2025-2028学年白名单内赛事',
                '全程免费参与，不收取任何报名费用',
                '竞赛结果不得作为中小学招生入学依据，但可丰富综合素质评价档案',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-emerald-700">
                  <CheckCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-rose-50 rounded-2xl border border-rose-200 p-5">
            <h3 className="font-bold text-rose-800 text-sm mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              防诈骗提醒
            </h3>
            <ul className="space-y-2">
              {[
                '警惕任何以"保奖"、"内部名额"、"强制培训"为名的收费行为',
                '所有报名均通过学校统一组织或赛事官方网站进行',
                '如遇可疑情况，请立即向学校或当地教育部门举报',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-rose-700">
                  <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5">
            <h3 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              联系我们
            </h3>
            <p className="text-xs text-slate-500">
              如有疑问，请通过网站客服或邮箱联系我们。我们会持续更新最新的赛事信息和备赛资料。
            </p>
          </div>
        </div>
      </div>

      {/* ===== 报名弹窗 ===== */}
      {showRegModal && selectedComp && (
        <div style={{
          position: 'fixed' as const, inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: '16px',
        }}>
          <div style={{
            backgroundColor: 'white', borderRadius: '20px', padding: '24px',
            maxWidth: '420px', width: '100%', maxHeight: '90vh', overflowY: 'auto' as const,
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1F2937', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award className="w-5 h-5 text-violet-500" />
                竞赛报名
              </h2>
              <button onClick={() => setShowRegModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: '4px' }}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div style={{
              padding: '12px', background: 'linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)',
              borderRadius: '12px', marginBottom: '20px', border: '1px solid #DDD6FE',
            }}>
              <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#6D28D9', marginBottom: '4px' }}>{selectedComp.title}</p>
              <div style={{ display: 'flex', gap: '8px', fontSize: '12px', color: '#7C3AED' }}>
                <span>{selectedComp.category}</span>
                <span>·</span>
                <span>{selectedComp.difficulty}</span>
                <span>·</span>
                <span>{selectedComp.rewardWEG} 积分</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  <User className="w-4 h-4 text-violet-500" />
                  姓名 <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input value={regName} onChange={e => setRegName(e.target.value)}
                  placeholder="输入真实姓名或昵称"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #E5E7EB', fontSize: '14px', color: '#1F2937', outline: 'none' }}
                  maxLength={20} />
              </div>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  <School className="w-4 h-4 text-violet-500" />
                  学校
                </label>
                <input value={regSchool} onChange={e => setRegSchool(e.target.value)}
                  placeholder="输入你的学校名称"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #E5E7EB', fontSize: '14px', color: '#1F2937', outline: 'none' }}
                  maxLength={50} />
              </div>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  <GraduationCap className="w-4 h-4 text-violet-500" />
                  年级 <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <select value={regGrade} onChange={e => setRegGrade(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #E5E7EB', fontSize: '14px', color: '#1F2937', outline: 'none', background: 'white' }}>
                  <option value="">请选择年级</option>
                  <option value="初一">初一</option>
                  <option value="初二">初二</option>
                  <option value="初三">初三</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  <Phone className="w-4 h-4 text-violet-500" />
                  联系方式
                </label>
                <input value={regPhone} onChange={e => setRegPhone(e.target.value)}
                  placeholder="微信或手机号（选填）"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #E5E7EB', fontSize: '14px', color: '#1F2937', outline: 'none' }}
                  maxLength={20} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setShowRegModal(false)}
                style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #E5E7EB', background: 'white', color: '#6B7280', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>
                取消
              </button>
              <button onClick={async () => {
                if (!regName.trim()) { toast.error('请输入姓名'); return; }
                if (!regGrade) { toast.error('请选择年级'); return; }
                setRegSubmitting(true);
                try {
                  const regs = JSON.parse(localStorage.getItem('competition_registrations') || '{}');
                  regs[selectedComp.id] = {
                    name: regName.trim(),
                    school: regSchool.trim(),
                    grade: regGrade,
                    phone: regPhone.trim(),
                    registeredAt: new Date().toISOString(),
                  };
                  localStorage.setItem('competition_registrations', JSON.stringify(regs));
                  toast.success('报名成功！');
                  setShowRegModal(false);
                  navigate(`/competitions/${selectedComp.id}`);
                } catch (e) {
                  toast.error('报名失败，请重试');
                } finally {
                  setRegSubmitting(false);
                }
              }}
                disabled={regSubmitting || !regName.trim() || !regGrade}
                style={{
                  flex: 1, padding: '12px', borderRadius: '12px',
                  background: !regName.trim() || !regGrade ? '#E5E7EB' : 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)',
                  color: !regName.trim() || !regGrade ? '#9CA3AF' : 'white',
                  fontWeight: 600, fontSize: '14px', border: 'none', cursor: !regName.trim() || !regGrade ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                }}>
                {regSubmitting ? '提交中...' : <><Send className="w-4 h-4" /> 确认报名</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

