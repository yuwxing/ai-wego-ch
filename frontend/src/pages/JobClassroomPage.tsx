import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Mic, Map, ArrowLeft, Sparkles, Lightbulb, ChevronRight, School, Sun, Cloud } from 'lucide-react';
import { MultiAgentChat, SceneType } from '../components/chat';

const interviewScenarios = [
  {
    id: 'resume' as SceneType,
    icon: <FileText className="w-10 h-10" />,
    title: '简历优化',
    subtitle: 'AI简历师帮你改简历',
    description: '深度分析你的简历内容，给出专业修改建议，优化措辞和结构，提高简历通过率',
    gradient: 'from-sky-400 to-blue-400',
    lightBg: 'bg-sky-50',
    lightIcon: 'text-sky-500',
    features: ['简历诊断', '竞争力分析', '定制优化'],
  },
  {
    id: 'interview' as SceneType,
    icon: <Mic className="w-10 h-10" />,
    title: '模拟面试',
    subtitle: 'AI面试官陪你练习',
    description: '选择目标岗位，AI面试官一对一模拟面试，同学提供参考回答，导师实时点评',
    gradient: 'from-emerald-400 to-teal-400',
    lightBg: 'bg-emerald-50',
    lightIcon: 'text-emerald-500',
    features: ['岗位选择', '实时面试', '反馈复盘'],
  },
  {
    id: 'career' as SceneType,
    icon: <Map className="w-10 h-10" />,
    title: '职业规划',
    subtitle: 'AI导师定制求职路线',
    description: '深度分析你的背景、兴趣和市场需求，定制专属求职路线图，指明发展方向',
    gradient: 'from-violet-400 to-purple-400',
    lightBg: 'bg-violet-50',
    lightIcon: 'text-violet-500',
    features: ['背景分析', '路径规划', '目标拆解'],
  },
];

export const JobClassroomPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeScenario, setActiveScenario] = useState<SceneType | null>(null);

  const handleScenarioClick = (scenario: typeof interviewScenarios[0]) => {
    setActiveScenario(scenario.id);
  };

  const handleBack = () => {
    setActiveScenario(null);
  };

  if (activeScenario) {
    return (
      <div className="fixed inset-0 bg-white z-50">
        <MultiAgentChat scene={activeScenario} onBack={handleBack} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-emerald-50">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 text-sky-200">
          <Cloud className="w-24 h-24 opacity-60" />
        </div>
        <div className="absolute top-40 right-16 text-sky-200">
          <Cloud className="w-16 h-16 opacity-40" />
        </div>
        <div className="absolute bottom-32 left-1/3 text-amber-200">
          <Sun className="w-20 h-20 opacity-50" />
        </div>
      </div>

      <header className="relative z-10 border-b border-sky-100 bg-white/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sky-600 hover:text-sky-700 transition-colors font-medium">
              <ArrowLeft className="w-5 h-5" />
              <span>返回</span>
            </button>
            <h1 className="text-xl font-bold text-sky-800">
              <School className="w-5 h-5 inline mr-1.5 -mt-0.5" />
              求职课堂
            </h1>
            <div className="w-20" />
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-sky-100 rounded-full border border-sky-200 mb-6">
            <Sparkles className="w-4 h-4 text-sky-500" />
            <span className="text-sm text-sky-700 font-medium">AI多智能体陪你练 · DeepSeek驱动</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
            <span className="gradient-text-primary">求职课堂</span>
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">AI面试官 + AI同学 + AI导师，三方协作帮你拿下offer</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {interviewScenarios.map((scenario) => (
            <div key={scenario.id} className="group relative" onClick={() => handleScenarioClick(scenario)}>
              <div className="relative p-8 rounded-3xl bg-white border-2 border-sky-100 shadow-sm cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-sky-200">
                <div className={`w-20 h-20 rounded-2xl ${scenario.lightBg} flex items-center justify-center mb-6 ${scenario.lightIcon} group-hover:scale-110 transition-transform duration-300`}>
                  {scenario.icon}
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2">{scenario.title}</h3>
                <p className="text-slate-500 mb-4 font-medium">{scenario.subtitle}</p>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">{scenario.description}</p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {scenario.features.map((feature) => (
                    <span key={feature} className="px-3 py-1 bg-sky-50 rounded-full text-xs text-sky-600 border border-sky-100 font-medium">{feature}</span>
                  ))}
                </div>
                <div className={`flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r ${scenario.gradient} text-white shadow-sm group-hover:shadow-md transition-all duration-300`}>
                  <span className="font-medium">开始体验</span>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 text-center">
          <h3 className="text-2xl font-bold text-slate-800 mb-8">AI团队阵容</h3>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="p-6 rounded-2xl bg-white border border-sky-100 shadow-sm">
              <div className="w-12 h-12 mx-auto mb-4 bg-rose-50 rounded-xl flex items-center justify-center">
                <Mic className="w-6 h-6 text-rose-400" />
              </div>
              <h4 className="text-lg font-semibold text-slate-800 mb-2">AI面试官（李总）</h4>
              <p className="text-sm text-slate-500">15年招聘经验，模拟真实面试场景，智能提问与追问</p>
            </div>
            <div className="p-6 rounded-2xl bg-white border border-sky-100 shadow-sm">
              <div className="w-12 h-12 mx-auto mb-4 bg-blue-50 rounded-xl flex items-center justify-center">
                <span className="text-lg">👨‍🎓</span>
              </div>
              <h4 className="text-lg font-semibold text-slate-800 mb-2">AI同学（小陈）</h4>
              <p className="text-sm text-slate-500">提供参考回答，给予不同视角，面试技巧分享</p>
            </div>
            <div className="p-6 rounded-2xl bg-white border border-sky-100 shadow-sm">
              <div className="w-12 h-12 mx-auto mb-4 bg-emerald-50 rounded-xl flex items-center justify-center">
                <Lightbulb className="w-6 h-6 text-emerald-400" />
              </div>
              <h4 className="text-lg font-semibold text-slate-800 mb-2">AI导师（张老师）</h4>
              <p className="text-sm text-slate-500">10年职业辅导经验，实时点评指导，面试后评估报告</p>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center">
          <p className="text-slate-400 text-sm">使用 DeepSeek API 驱动，支持多轮对话与深度分析</p>
        </div>
      </main>
    </div>
  );
};

export default JobClassroomPage;
