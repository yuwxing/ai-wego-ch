// RulesPage.tsx - 平台治理规则页面
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Bot, CheckCircle, Coins, AlertTriangle, FileText } from 'lucide-react';

interface Rule {
  icon: React.ReactNode;
  title: string;
  content: string[];
}

const rules: Rule[] = [
  {
    icon: <Shield className="w-5 h-5 text-purple-500" />,
    title: '一、数字分身使用规范',
    content: [
      '数字分身仅供个人学习、创作和娱乐使用，不得用于违法违规用途',
      '禁止利用数字分身发布虚假信息、诈骗、色情等不良内容',
      '数字分身的对话记录和设置信息仅对本人可见，平台不会泄露',
      '平台不对数字分身生成内容的准确性、合法性做保证',
    ],
  },
  {
    icon: <Bot className="w-5 h-5 text-blue-500" />,
    title: '二、AI 对话使用规范',
    content: [
      'AI 对话功能仅供学习和参考，请理性判断生成内容',
      '禁止利用 AI 生成违法违规、侵权或不良信息',
      'AI 生成的原创性内容，知识产权归用户所有',
      '请勿将 AI 建议作为医疗、法律等专业领域的最终决策依据',
    ],
  },
  {
    icon: <CheckCircle className="w-5 h-5 text-emerald-500" />,
    title: '三、账号安全规范',
    content: [
      '用户须妥善保管账号信息，因账号泄露导致的损失由用户自行承担',
      '禁止恶意注册、批量注册账号',
      '禁止利用平台漏洞获取不当利益',
      '长期未登录的账号，平台有权进行回收处理',
    ],
  },
  {
    icon: <Coins className="w-5 h-5 text-amber-500" />,
    title: '四、积分获取',
    content: [
      '注册奖励：+5,000 积分',
      '每日首次登录：+20 积分',
      '完成每日英语训练：+30 积分',
      '完成听说训练：+30 积分',
      '背单词 50 个：+30 积分',
      '反馈 Bug：+50~500 积分（视严重程度），虚假信息赔付 1,000 积分',
    ],
  },
  {
    icon: <Coins className="w-5 h-5 text-amber-500" />,
    title: '五、积分消耗',
    content: [
      '积分可用于兑换平台内增值服务（即将上线）',
      '积分不可兑换法定货币，仅限平台内部使用',
    ],
  },
  {
    icon: <AlertTriangle className="w-5 h-5 text-rose-500" />,
    title: '六、违规处理',
    content: [
      '首次违规：警告 + 扣除相应积分',
      '二次违规：限制账号功能 7 天',
      '三次违规：永久封禁账号',
      '涉及违法行为的，将移交司法机关处理',
    ],
  },
  {
    icon: <FileText className="w-5 h-5 text-slate-500" />,
    title: '七、免责声明',
    content: [
      '平台不对用户使用数字分身产生的内容及后果承担法律责任',
      '因不可抗力导致的服务中断，平台不承担责任',
      '平台保留对异常积分交易的处理权',
      '规则最终解释权归平台所有',
    ],
  },
];

const RulesPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
      {/* 顶部背景 */}
      <div className="bg-gradient-to-br from-purple-600 via-pink-500 to-rose-500 pt-6 pb-16 px-4 rounded-b-[2rem] shadow-xl">
        {/* 返回按钮 */}
        <div className="flex items-center justify-between mb-6">
          <Link 
            to="/" 
            className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center text-white hover:bg-white/30 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-white font-semibold text-lg">平台规则</h1>
          <div className="w-10" />
        </div>

        {/* 标题 */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur px-4 py-1.5 rounded-full text-white/80 text-sm mb-4">
            <Shield className="w-4 h-4" />
            治理规则
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">平台治理规则</h2>
          <p className="text-white/70 text-sm">请仔细阅读并遵守以下规则</p>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="max-w-xl mx-auto px-4 -mt-6 pb-8">
        <div className="space-y-4">
          {rules.map((rule, index) => (
            <div 
              key={index}
              className="bg-white rounded-2xl shadow-lg p-5 border border-slate-100"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center">
                  {rule.icon}
                </div>
                <h3 className="font-semibold text-slate-800">{rule.title}</h3>
              </div>
              <ul className="space-y-2 ml-3">
                {rule.content.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                    <span className="text-purple-400 mt-1">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* 底部提示 */}
        <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-100">
          <p className="text-sm text-slate-600 text-center">
            平台持续更新规则，请定期查看以获取最新信息
          </p>
        </div>
      </div>
    </div>
  );
};

export default RulesPage;
