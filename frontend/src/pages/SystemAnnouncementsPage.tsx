import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Megaphone, Sparkles, Clock, Tag, Info, Gift } from 'lucide-react';

const TABS = [
  { id: 'welcome', label: '欢迎内容', icon: Sparkles },
  { id: 'updates', label: '版本更新', icon: Megaphone },
  { id: 'activities', label: '活动通知', icon: Gift },
  { id: 'system', label: '系统公告', icon: Bell },
];

const WELCOME_CONTENT = `
# 欢迎来到 AI-Wego！

这里是你的AI学习成长平台。我们致力于为你提供最智能、最有趣的学习体验。

## 核心功能
- **学习系统**：单词记忆、听说训练、每日英语，覆盖初中全科
- **菁华大学**：AI导师、虚拟实验室、图书馆，探索知识的边界
- **竞赛中心**：参与白名单竞赛，展示你的才华
- **数字分身**：创建你的AI助手，24小时在线
- **宠物精灵**：领养学习伙伴，陪伴成长

## 开始使用
1. 从首页进入各功能模块
2. 完成每日任务获取经验值
3. 喂养你的宠物精灵
4. 参加竞赛赢得奖励

祝你在AI-Wego学习愉快！🚀
`;

const VERSION_UPDATES = [
  {
    version: 'v3.3.0',
    date: '2026-06-09',
    title: '积分经济体系升级',
    changes: [
      '积分现在可以直接用于 AI 对话、宠物聊天等功能',
      '注册赠送积分调整为 200，每次 AI 对话消耗 10 积分',
      '新增每日签到奖励，连续签到积分递增',
      '免费体验次数调整为 3 次，用完可用积分继续使用',
      '新增「这节课」教师/学生视角叙事游戏',
      '新增「数字班级」养成玩法，体验 150 天班级成长'
    ]
  },
  {
    version: 'v3.2.0',
    date: '2026-05-20',
    title: '求职广场 & 菁华大学改版',
    changes: [
      '新增求职广场页面，实时推送事业编和实习招聘信息',
      '菁华大学新增求职课堂模块，AI模拟面试助力求职',
      '学习系统AI课堂升级为AI学习助手',
      '竞赛入口移至竞赛中心',
      '宠物精灵互动系统优化'
    ]
  },
  {
    version: 'v3.1.0',
    date: '2026-05-01',
    title: '竞赛中心上线',
    changes: [
      '新增竞赛中心模块，展示白名单竞赛',
      '支持竞赛创建和提交作品',
      '积分经济系统升级，新增等级和经验值',
      '单词卡片内容更新'
    ]
  },
  {
    version: 'v3.0.0',
    date: '2026-04-15',
    title: 'AI-Wego v3 全面升级',
    changes: [
      '全新UI设计，校园清新风格',
      '新增菁华大学模块',
      '数字分身系统升级',
      '学习系统全面重构',
      '宠物精灵系统上线'
    ]
  }
];

const ACTIVITY_NOTICES = [
  {
    id: 1,
    title: '🎯 每日学习打卡活动',
    date: '长期有效',
    desc: '每天完成学习任务，连续打卡7天可获得额外积分奖励！'
  },
  {
    id: 2,
    title: '🏆 月度竞赛之星',
    date: '每月评选',
    desc: '每月参与竞赛积分最高的前10名用户，获得限定头像框和积分奖励。'
  },
  {
    id: 3,
    title: '🌟 新手成长计划',
    date: '长期有效',
    desc: '新用户完成新手任务，可领取宠物精灵和启动大礼包。'
  }
];

const SYSTEM_NOTICES = [
  {
    id: 1,
    type: 'info',
    title: '系统维护通知',
    date: '每周三凌晨3:00-5:00',
    desc: '每周三凌晨进行系统例行维护，期间部分功能可能暂不可用。'
  },
  {
    id: 2,
    type: 'warning',
    title: '数据备份提醒',
    date: '每日自动',
    desc: '系统每日自动备份学习数据，请放心使用。建议定期检查个人进度。'
  },
  {
    id: 3,
    type: 'info',
    title: '内容更新说明',
    date: '持续更新',
    desc: '单词库和听说训练内容将持续更新，匹配最新教材版本。'
  }
];

const SystemAnnouncementsPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('welcome');

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 pb-12">
      <div className="max-w-3xl mx-auto px-4 pt-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-4 transition-colors">
          <ArrowLeft className="w-5 h-5" /> 返回
        </button>

        <h1 className="text-2xl font-bold text-slate-800 mb-2">系统公告</h1>
        <p className="text-slate-500 mb-6">了解平台动态和最新消息</p>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Welcome Tab */}
        {activeTab === 'welcome' && (
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <div className="prose prose-slate max-w-none">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-6 h-6 text-blue-500" />
                <h2 className="text-xl font-bold text-slate-800 m-0">欢迎来到 AI-Wego</h2>
              </div>
              <div className="space-y-4 text-slate-600 leading-relaxed">
                <p>这是你的AI学习成长平台。我们致力于为你提供最智能、最有趣的学习体验。</p>
                
                <h3 className="text-lg font-semibold text-slate-700">核心功能</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span><strong>学习系统</strong>：单词记忆、听说训练、每日英语，覆盖初中全科</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 mt-1">•</span>
                    <span><strong>菁华大学</strong>：AI导师、虚拟实验室、图书馆，探索知识边界</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 mt-1">•</span>
                    <span><strong>竞赛中心</strong>：参与白名单竞赛，展示你的才华</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span><strong>数字分身</strong>：创建你的AI助手，24小时在线</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-pink-500 mt-1">•</span>
                    <span><strong>宠物精灵</strong>：领养学习伙伴，陪伴成长</span>
                  </li>
                </ul>

                <h3 className="text-lg font-semibold text-slate-700">开始使用</h3>
                <ol className="space-y-1 list-decimal list-inside">
                  <li>从首页进入各功能模块</li>
                  <li>完成每日任务获取经验值</li>
                  <li>喂养你的宠物精灵</li>
                  <li>参加竞赛赢得奖励</li>
                </ol>

                <p className="text-blue-600 font-medium">祝你在AI-Wego学习愉快！</p>
              </div>
            </div>
          </div>
        )}

        {/* Version Updates Tab */}
        {activeTab === 'updates' && (
          <div className="space-y-4">
            {VERSION_UPDATES.map((update, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-slate-800">{update.title}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
                        <Tag className="w-3 h-3" />
                        {update.version}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                        <Clock className="w-3 h-3" />
                        {update.date}
                      </span>
                    </div>
                  </div>
                </div>
                <ul className="space-y-2">
                  {update.changes.map((change, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-slate-600">
                      <span className="text-green-500 mt-1">✓</span>
                      {change}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* Activity Notices Tab */}
        {activeTab === 'activities' && (
          <div className="space-y-4">
            {ACTIVITY_NOTICES.map((notice) => (
              <div key={notice.id} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white flex-shrink-0">
                    <Gift className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-800">{notice.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{notice.date}</p>
                    <p className="text-sm text-slate-600 mt-2">{notice.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* System Notices Tab */}
        {activeTab === 'system' && (
          <div className="space-y-4">
            {SYSTEM_NOTICES.map((notice) => (
              <div key={notice.id} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    notice.type === 'warning'
                      ? 'bg-amber-100 text-amber-600'
                      : 'bg-blue-100 text-blue-600'
                  }`}>
                    <Info className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-slate-800">{notice.title}</h3>
                      {notice.type === 'warning' && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs">注意</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{notice.date}</p>
                    <p className="text-sm text-slate-600 mt-2">{notice.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemAnnouncementsPage;
