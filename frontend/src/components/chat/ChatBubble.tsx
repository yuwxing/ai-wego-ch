// 消息气泡组件
import React from 'react';
import { Message } from '../../utils/deepseek';
import { User, Bot, GraduationCap, Mic, FileText, Map } from 'lucide-react';

interface ChatBubbleProps {
  message: Message;
  isStreaming?: boolean;
}

// AI角色配置
const agentConfig = {
  interviewer: {
    name: '李总',
    role: 'AI面试官',
    icon: Mic,
    color: 'red',
    bgGradient: 'from-red-50 to-orange-50',
    borderColor: 'border-red-200',
    textColor: 'text-slate-700',
    badgeBg: 'bg-slate-700',
  },
  student: {
    name: '小陈',
    role: 'AI同学',
    icon: User,
    color: 'blue',
    bgGradient: 'from-blue-50 to-cyan-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-700',
    badgeBg: 'bg-blue-500',
  },
  mentor: {
    name: '张老师',
    role: 'AI导师',
    icon: GraduationCap,
    color: 'green',
    bgGradient: 'from-emerald-50 to-teal-50',
    borderColor: 'border-emerald-200',
    textColor: 'text-emerald-700',
    badgeBg: 'bg-emerald-500',
  },
  resume: {
    name: '简历师',
    role: 'AI简历师',
    icon: FileText,
    color: 'purple',
    bgGradient: 'from-purple-50 to-pink-50',
    borderColor: 'border-purple-200',
    textColor: 'text-purple-700',
    badgeBg: 'bg-purple-500',
  },
  career: {
    name: '规划师',
    role: 'AI规划师',
    icon: Map,
    color: 'cyan',
    bgGradient: 'from-cyan-50 to-blue-50',
    borderColor: 'border-cyan-200',
    textColor: 'text-cyan-700',
    badgeBg: 'bg-cyan-500',
  },
  user: {
    name: '你',
    role: '求职者',
    icon: User,
    color: 'purple',
    bgGradient: 'from-violet-500 to-purple-600',
    borderColor: 'border-violet-300',
    textColor: 'text-white',
    badgeBg: 'bg-gradient-to-r from-violet-500 to-purple-500',
  },
};

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message, isStreaming }) => {
  const isUser = message.role === 'user';
  const agent = message.agent || 'user';
  const config = agentConfig[agent] || agentConfig.user;
  const Icon = config.icon;

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
      <div className={`flex ${isUser ? 'flex-row-reverse' : 'flex-row'} items-end gap-3 max-w-[85%] md:max-w-[75%]`}>
        {/* 头像 */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-2xl ${
          isUser 
            ? 'bg-gradient-to-br from-violet-500 to-purple-600 shadow-md shadow-violet-200/50' 
            : `bg-gradient-to-br ${config.bgGradient} shadow-md border ${config.borderColor}`
        } flex items-center justify-center ${!isUser ? config.borderColor : ''}`}>
          <Icon className={`w-5 h-5 ${isUser ? 'text-white' : config.textColor}`} />
        </div>

        {/* 消息内容 */}
        <div className="flex flex-col gap-1">
          {/* 名称标签 */}
          <div className={`flex items-center gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
            <span className={`text-sm font-medium ${config.textColor}`}>{config.name}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${config.badgeBg} text-white shadow-sm`}>
              {config.role}
            </span>
          </div>

          {/* 气泡 */}
          <div className={`px-4 py-3 rounded-2xl ${
            isUser
              ? 'bg-gradient-to-br from-violet-600/90 to-purple-600/90 text-white rounded-tr-sm shadow-md shadow-violet-200/40'
              : `bg-gradient-to-br ${config.bgGradient} border ${config.borderColor} ${config.textColor} rounded-tl-sm shadow-md shadow-slate-200/50`
          } ${isStreaming ? 'animate-pulse' : ''}`}>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
            {isStreaming && (
              <span className="inline-block w-2 h-4 ml-1 bg-current animate-pulse" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBubble;
