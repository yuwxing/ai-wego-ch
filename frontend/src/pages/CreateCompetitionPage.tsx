import WegCoin from '../components/WegCoin';
// Updated - 能力选择器升级为AI智能推荐 + 文件上传支持
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { 
  ArrowLeft, Plus, Trash2, AlertCircle, List, Info, Lightbulb, 
  Sparkles, ChevronRight, CheckCircle, Clock, DollarSign, Target, 
  Award, X, Wand2, RefreshCw, Zap, Search, PenTool, BarChart3, 
  Languages, GraduationCap, Bot, AlertTriangle, Coins, Wallet, Users,
  Upload, FileText, Image as ImageIcon, Music, Link as LinkIcon, Loader2,
  BookOpen, Globe, Trophy
} from 'lucide-react';
import { Card } from '../components/ui';
import toast from 'react-hot-toast';
import { tasksAPI, usersAPI, transactionsAPI, supabaseFetch, workerTokenAPI, agentsAPI, storageAPI, getFileType } from '../utils/supabase';
import { saveCompetition } from '../services/competitionService';
import type { User } from '../types';

// 竞赛科目
const COMPETITION_CATEGORIES = [
  { id: '英语', name: '英语', icon: Languages, color: 'from-blue-500 to-cyan-500', desc: '英语写作、演讲、综合能力' },
  { id: '数学', name: '数学', icon: BarChart3, color: 'from-green-500 to-emerald-500', desc: '解题思维、建模、逻辑推理' },
  { id: '编程', name: '编程', icon: Bot, color: 'from-violet-500 to-fuchsia-600', desc: '算法、项目开发、AI应用' },
  { id: 'AI', name: 'AI', icon: Zap, color: 'from-amber-500 to-orange-500', desc: 'AI创意、智能体协作、提示工程' },
  { id: '阅读', name: '阅读', icon: BookOpen, color: 'from-pink-500 to-rose-500', desc: '阅读理解、文学鉴赏、知识拓展' },
];

// 竞赛类型
const COMPETITION_TYPES = [
  { id: '每日挑战', name: '每日挑战', icon: Zap, desc: '每天一道题，轻松积累' },
  { id: '周赛', name: '周赛', icon: Clock, desc: '每周一赛，系统训练' },
  { id: '月赛', name: '月赛', icon: Award, desc: '月度比拼，综合考验' },
  { id: '全国活动', name: '全国活动', icon: Globe, desc: '面向全国的大型竞赛' },
];

// 难度等级
const DIFFICULTY_LEVELS = [
  { id: '青铜', name: '青铜', color: 'from-amber-600 to-yellow-500', desc: '入门友好' },
  { id: '白银', name: '白银', color: 'from-slate-400 to-gray-300', desc: '基础巩固' },
  { id: '黄金', name: '黄金', color: 'from-yellow-500 to-orange-400', desc: '进阶挑战' },
  { id: '大师', name: '大师', color: 'from-red-500 to-purple-600', desc: '极限突破' },
];

// 关键词到能力的映射
const KEYWORD_TO_CAPABILITIES: Record<string, string[]> = {
  "求职|简历|面试|招聘|岗位": ["简历优化", "面试准备", "岗位搜索"],
  "人才引进|事业编|编制|公考": ["岗位搜索", "政策解读", "报名指导"],
  "协作|团队|多智能体|多人": ["任务拆解", "团队协作", "质量把控"],
  "追踪|监控|定时|持续|推送": ["定时监控", "信息追踪", "变更通知"],
  "自动执行|自动|批量|定时任务": ["自动执行", "批量处理", "结果验收"],
  "Logo|图标|UI|界面": ["UI设计", "视觉品质", "配色方案", "风格统一"],
  "视频|剪辑|BGM|配乐": ["视频剪辑", "BGM创作", "音效设计"],
  "文章|写作|文案|内容": ["文案撰写", "内容创作", "语言精炼"],
  "数据分析|报告|统计": ["数据分析", "数据可视化", "报告生成"],
  "代码|编程|开发|API": ["Python开发", "前端开发", "API集成"],
  "学习|课件|教学|考试": ["学科辅导", "课件制作", "知识点拆解"],
  "设计|海报|图片|画": ["视觉设计", "画面构图", "色彩搭配"],
  "配音|语音|朗读|TTS": ["角色配音", "语音克隆", "多音色切换"],
  "PPT|演示|汇报": ["产品设计", "视觉叙事", "内容整合"],
  "网站|网页|前端|后端": ["前端开发", "后端开发", "全栈开发"],
  "APP|移动端|小程序": ["前端开发", "UI设计", "响应式设计"],
  "电商|店铺|商品": ["文案撰写", "数据分析", "内容策划"],
  "营销|推广|运营": ["内容策划", "数据分析", "市场调研"],
  "翻译|中英|多语言": ["翻译校对", "语言精炼", "专业术语"],
  "音乐|歌曲|作曲": ["BGM创作", "旋律创作", "音效设计"],
  "动画|分镜|剧本": ["分镜脚本", "剧情分镜", "角色设定"],
  "调研|问卷|访谈": ["市场调研", "用户洞察", "需求分析"],
  "合同|协议|法律": ["文档编写", "需求分析", "专业术语"],
  "游戏|角色|场景": ["角色设定", "世界观构建", "场景绘制"],
  "短剧|段子|脚本": ["短剧剧本", "剧情节奏", "台词打磨"],
  "诗词|古风|文学": ["诗词创作", "古风剧本", "世界观构建"],
  "产品|原型|PRD": ["产品设计", "原型设计", "需求分析"],
  "架构|系统|设计": ["系统设计", "技术选型", "架构分析"],
  "测试|自动化|脚本": ["自动化测试", "自动化脚本", "代码审查"],
  "部署|云服务|Docker": ["Docker容器", "云服务部署", "部署运维"],
  "绘画|插画|立绘": ["人物设计", "角色立绘", "光影渲染"],
  "头像|壁纸|海报": ["头像构图", "壁纸构图", "色彩搭配"],
  "修图|调色|画质": ["色彩调性", "画质提升", "高清画质"],
  "Stable Diffusion|SD|ComfyUI": ["Stable Diffusion", "提示词工程", "提示词优化"],
  "Suno|ACE-Step|音乐生成": ["Suno", "旋律创作", "BGM创作"],
  "TTS|语音合成|配音": ["火山引擎TTS", "语音克隆", "多音色切换"],
};

// 能力分类颜色
const CAPABILITY_COLORS: Record<string, { bg: string; text: string }> = {
  "编程开发": { bg: 'bg-blue-100', text: 'text-blue-700' },
  "写作创作": { bg: 'bg-purple-100', text: 'text-purple-700' },
  "视觉设计": { bg: 'bg-pink-100', text: 'text-pink-700' },
  "数据分析": { bg: 'bg-emerald-100', text: 'text-violet-700' },
  "视频制作": { bg: 'bg-orange-100', text: 'text-orange-700' },
  "音频制作": { bg: 'bg-cyan-100', text: 'text-cyan-700' },
  "AI工具": { bg: 'bg-violet-100', text: 'text-violet-700' },
  "教育辅导": { bg: 'bg-teal-100', text: 'text-teal-700' },
  "项目管理": { bg: 'bg-amber-100', text: 'text-violet-700' },
  "信息搜索": { bg: 'bg-slate-100', text: 'text-slate-700' },
  "求职服务": { bg: 'bg-violet-100', text: 'text-violet-700' },
  "长期追踪": { bg: 'bg-rose-100', text: 'text-rose-700' },
  "智能协作": { bg: 'bg-violet-100', text: 'text-violet-700' },
};

// 能力到分类的映射
const CAPABILITY_CATEGORY: Record<string, string> = {
  // 编程开发
  "Python开发": "编程开发", "前端开发": "编程开发", "后端开发": "编程开发",
  "全栈开发": "编程开发", "API集成": "编程开发",
  // 写作创作
  "文案撰写": "写作创作", "内容创作": "写作创作", "内容策划": "写作创作",
  "语言精炼": "写作创作", "需求分析": "项目管理",
  // 视觉设计
  "UI设计": "视觉设计", "视觉品质": "视觉设计", "配色方案": "视觉设计",
  "风格统一": "视觉设计", "视觉叙事": "视觉设计", "画面构图": "视觉设计",
  "色彩搭配": "视觉设计", "高清画质": "视觉设计", "画质提升": "视频制作",
  "色彩调性": "视觉设计",
  // 数据分析
  "数据分析": "数据分析", "数据可视化": "数据分析", "报告生成": "数据分析",
  "市场调研": "数据分析",
  // 视频制作
  "视频剪辑": "视频制作", "BGM创作": "音频制作", "音效设计": "音频制作",
  // 音频制作
  "角色配音": "音频制作", "语音克隆": "音频制作", "多音色切换": "音频制作",
  // AI工具
  "Stable Diffusion": "AI工具", "提示词工程": "AI工具", "提示词优化": "AI工具",
  // 教育辅导
  "学科辅导": "教育辅导", "课件制作": "教育辅导", "知识点拆解": "教育辅导",
  // 其他
  "原型设计": "视觉设计", "产品设计": "视觉设计",
  // 求职服务
  "简历优化": "求职服务", "面试准备": "求职服务", "岗位搜索": "求职服务",
  "政策解读": "求职服务", "报名指导": "求职服务",
  // 长期追踪
  "定时监控": "长期追踪", "信息追踪": "长期追踪", "变更通知": "长期追踪",
  // 智能协作
  "任务拆解": "智能协作", "团队协作": "智能协作", "质量把控": "智能协作",
  "自动执行": "智能协作", "批量处理": "智能协作", "结果验收": "智能协作",
};

// 获取能力颜色
const getCapabilityColor = (cap: string) => {
  const category = CAPABILITY_CATEGORY[cap] || "信息搜索";
  return CAPABILITY_COLORS[category] || CAPABILITY_COLORS["信息搜索"];
};

// 根据文本分析推荐能力
const analyzeCapabilities = (text: string): string[] => {
  if (!text) return [];
  
  const recommended: Set<string> = new Set();
  const lowerText = text.toLowerCase();
  
  for (const [keywords, caps] of Object.entries(KEYWORD_TO_CAPABILITIES)) {
    const keywordList = keywords.split('|');
    const hasMatch = keywordList.some(kw => lowerText.includes(kw.toLowerCase()));
    if (hasMatch) {
      caps.forEach(cap => recommended.add(cap));
    }
  }
  
  // 默认添加一些基础能力
  if (recommended.size === 0 && text.length > 10) {
    if (/[\u4e00-\u9fa5]/.test(text)) {
      recommended.add("内容策划");
      recommended.add("需求分析");
    }
  }
  
  return Array.from(recommended);
};

// 能力推荐标签组件
interface CapabilityTagProps {
  capability: string;
  onRemove?: () => void;
  showRemove?: boolean;
}

const CapabilityTag: React.FC<CapabilityTagProps> = ({ 
  capability, 
  onRemove, 
  showRemove = true 
}) => {
  const colors = getCapabilityColor(capability);
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-medium ${colors.bg} ${colors.text}`}>
      {capability}
      {showRemove && onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-0.5 hover:bg-black/10 rounded-full p-0.5 transition-colors"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
};

// 能力要求项组件
interface RequirementItemProps {
  description: string;
  minLevel: number;
  onDescriptionChange: (desc: string) => void;
  onMinLevelChange: (level: number) => void;
  onRemove: () => void;
}

const RequirementItem: React.FC<RequirementItemProps> = ({
  description,
  minLevel,
  onDescriptionChange,
  onMinLevelChange,
  onRemove,
}) => {
  const [isEditing, setIsEditing] = useState(!description);
  
  // 根据描述自动推荐能力
  const recommendedCapabilities = useMemo(() => {
    return analyzeCapabilities(description);
  }, [description]);
  
  return (
    <div className="p-4 bg-gradient-to-br from-violet-50/50 to-fuchsia-50/50 rounded-xl border border-violet-100 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-500" />
          <span className="text-sm font-medium text-slate-700">需求描述</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRemove}
            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* 描述输入框 */}
      <textarea
        value={description}
        onChange={(e) => onDescriptionChange(e.target.value)}
        onFocus={() => setIsEditing(true)}
        placeholder="用自然语言描述您的需求，例如：帮我写一份产品经理简历、设计一个Logo、剪辑一段短视频..."
        rows={2}
        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all resize-none placeholder:text-slate-400"
      />
      
      {/* 智能推荐 */}
      {recommendedCapabilities.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Wand2 className="w-3.5 h-3.5 text-indigo-500" />
            <span>根据您的描述，智能推荐以下能力（可删除不想要的）</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {recommendedCapabilities.map(cap => (
              <CapabilityTag
                key={cap}
                capability={cap}
                onRemove={() => {}}
                showRemove={false}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* 等级选择 */}
      <div className="flex items-center gap-3 pt-1">
        <span className="text-sm text-slate-600 whitespace-nowrap">最低等级:</span>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map(level => (
            <button
              key={level}
              type="button"
              onClick={() => onMinLevelChange(level)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                minLevel === level
                  ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-md'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              Lv.{level}+
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const exampleTasks = [
  { 
    title: 'AI创意写作大赛 — 用智能体写科幻故事', 
    description: '使用AI智能体创作一篇2000字以内的科幻短篇故事，主题为"未来的学校"，要求有完整的故事情节和人物设定', 
    budget: 500,
    requirements: [{ description: '创作科幻短篇，主题"未来的学校"，2000字以内', min_level: 3 }]
  },
  { 
    title: '数学解题挑战赛 — 趣味数学题', 
    description: '设计并解答5道趣味数学题，涵盖几何、代数、逻辑推理，难度对应初中水平', 
    budget: 300,
    requirements: [{ description: '设计5道趣味数学题并附解答', min_level: 4 }]
  },
];

// 新的需求结构
interface TaskRequirement {
  description: string;
  min_level: number;
  // 存储推荐的能力标签
  capabilities: string[];
}

export const CreateTaskPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // 当前用户ID（默认18=yuwxing）
  const { user } = useUser();
  const currentUserId = user?.id || parseInt(searchParams.get('userId') || '18', 10);
  
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showExamples, setShowExamples] = useState(false);
  const [formStep] = useState(1);
  const [lastAnalyzedText, setLastAnalyzedText] = useState('');
  const [userBalance, setUserBalance] = useState<number>(0); // 当前用户余额
  const [balanceLoading, setBalanceLoading] = useState(true); // 余额加载状态

  // 文件上传相关
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{name: string; url: string; type: string}[]>([]);
  const [manualLinks, setManualLinks] = useState<string[]>([]); // 手动输入的链接

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'AI',
    competitionType: '每日挑战',
    difficulty: '青铜',
    publisher_id: currentUserId,
    reward: 50,
    startTime: '',
    endTime: '',
    requirements: [] as TaskRequirement[],
    maxClaimants: 1,
  });

  // 自动分析任务描述并推荐能力
  useEffect(() => {
    const textToAnalyze = formData.description || formData.title;
    if (textToAnalyze && textToAnalyze !== lastAnalyzedText) {
      setLastAnalyzedText(textToAnalyze);
      const capabilities = analyzeCapabilities(textToAnalyze);
      
      if (capabilities.length > 0 && formData.requirements.length === 0) {
        setFormData(prev => ({
          ...prev,
          requirements: [{
            description: textToAnalyze,
            min_level: 5,
            capabilities
          }]
        }));
      }
    }
  }, [formData.description, formData.title]);

  useEffect(() => {
    fetchUsers();
    fetchUserBalance();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await usersAPI.listUsers();
      setUsers(data);
    } catch (err) {
      console.error('获取用户列表失败', err);
    }
  };

  // 获取当前用户余额
  const fetchUserBalance = async () => {
    try {
      setBalanceLoading(true);
      const userData = await usersAPI.getUser(currentUserId);
      if (userData) {
        setUserBalance(userData.token_balance);
        // 如果发布者ID是当前用户，确保同步
        if (formData.publisher_id === currentUserId || formData.publisher_id === 1) {
          setFormData(prev => ({ ...prev, publisher_id: currentUserId }));
        }
      }
    } catch (err) {
      console.error('获取用户余额失败', err);
    } finally {
      setBalanceLoading(false);
    }
  };

  // 文件上传处理
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`${file.name} 超过10MB限制`);
          continue;
        }
        const url = await storageAPI.uploadFile(file);
        const fileType = getFileType(url);
        setUploadedFiles(prev => [...prev, { name: file.name, url, type: fileType }]);
        toast.success(`已上传: ${file.name}`);
      }
    } catch (err) {
      toast.error('上传失败: ' + (err instanceof Error ? err.message : '未知错误'));
    } finally {
      setUploading(false);
      // 清空input以允许重复选择同一文件
      e.target.value = '';
    }
  };

  // 删除已上传文件
  const removeUploadedFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // 添加手动链接
  const addManualLink = () => {
    setManualLinks(prev => [...prev, '']);
  };

  // 更新手动链接
  const updateManualLink = (index: number, value: string) => {
    setManualLinks(prev => prev.map((link, i) => i === index ? value : link));
  };

  // 删除手动链接
  const removeManualLink = (index: number) => {
    setManualLinks(prev => prev.filter((_, i) => i !== index));
  };

  // 获取所有附件链接（上传文件 + 手动输入）
  const getAllAttachments = (): string[] => {
    const links = [...uploadedFiles.map(f => f.url), ...manualLinks.filter(l => l.trim())];
    return links;
  };

  const addRequirement = () => {
    setFormData(prev => ({
      ...prev,
      requirements: [...prev.requirements, { description: '', min_level: 5, capabilities: [] }],
    }));
  };

  const removeRequirement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index),
    }));
  };

  const updateRequirementDescription = (index: number, description: string) => {
    const capabilities = analyzeCapabilities(description);
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.map((req, i) =>
        i === index ? { ...req, description, capabilities } : req
      ),
    }));
  };

  const updateRequirementLevel = (index: number, min_level: number) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.map((req, i) =>
        i === index ? { ...req, min_level } : req
      ),
    }));
  };

  const applyExample = (example: typeof exampleTasks[0]) => {
    setFormData(prev => ({
      ...prev,
      title: example.title,
      description: example.description,
      reward: example.budget, // 使用示例的budget作为reward
      requirements: example.requirements.map(r => ({
        ...r,
        capabilities: analyzeCapabilities(r.description)
      })),
    }));
    setShowExamples(false);
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('请输入竞赛标题');
      return false;
    }
    if (formData.title.length < 5) {
      setError('竞赛标题至少需要5个字符');
      return false;
    }
    if (!formData.startTime) {
      setError('请选择开始时间');
      return false;
    }
    if (!formData.endTime) {
      setError('请选择截止时间');
      return false;
    }
    if (formData.startTime >= formData.endTime) {
      setError('截止时间必须晚于开始时间');
      return false;
    }
    if (formData.reward < 10) {
      setError('竞赛奖金至少10 积分');
      return false;
    }
    if (formData.reward > userBalance) {
      setError(`余额不足！当前余额 ${userBalance} 积分，竞赛奖金 ${formData.reward} 积分`);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;

    try {
      setLoading(true);
      
      const submitData = {
        ...formData,
        endTime: formData.endTime ? new Date(formData.endTime).toISOString() : undefined,
        startTime: formData.startTime ? new Date(formData.startTime).toISOString() : undefined,
      };
      
      // 计算含8%手续费的总额
      const platformFee = Math.floor(submitData.reward * 0.08);
      const totalCost = submitData.reward + platformFee;
      
      // 检查余额是否足够（含手续费）
      if (userBalance < totalCost) {
        setError(`余额不足！当前余额 ${userBalance} <WegCoin size={14} />，发布任务需要 ${totalCost} 积分（含8%手续费${platformFee} 积分）`);
        setLoading(false);
        return;
      }
      
      // 使用Supabase API发布任务（含8%手续费）
      try {
        // 1. 计算含手续费的总额
        const platformFee = Math.floor(submitData.reward * 0.08);
        const totalCost = submitData.reward + platformFee;
        
        // 2. 先扣用户余额（含手续费）
        const deductResult = await usersAPI.deductBalance(currentUserId, totalCost);
        if (!deductResult.success) {
          throw new Error(deductResult.error || '余额扣款失败');
        }
        
        // 3. 创建竞赛任务（不匹配智能体，作为学生挑战赛）
        const attachments = getAllAttachments();
        const result = await tasksAPI.createTask({
          title: submitData.title,
          description: submitData.description,
          publisher_id: currentUserId,
          budget: submitData.reward,
          deadline: submitData.endTime,
          requirements: [
            ...(submitData.requirements || []),
            { _competition_meta: true, category: submitData.category, type: submitData.competitionType, difficulty: submitData.difficulty, organizer: user?.username || 'AI-WEGO' },
          ],
          status: 'open',
          matched_agent_id: null,
          source: 'competition',
          max_claimants: submitData.maxClaimants,
          claimed_by: [],
        });
        
        const taskId = Array.isArray(result) ? result[0]?.id : result?.id;
        if (!taskId) throw new Error('竞赛创建失败');
        
        if (attachments.length > 0) {
          await tasksAPI.updateTask(taskId, { attachments: attachments });
        }
        
        await transactionsAPI.createTransaction({
          from_id: currentUserId,
          from_type: 'user',
          to_id: taskId,
          to_type: 'task',
          amount: totalCost,
          task_id: taskId,
          type: 'task_payment',
          description: `发布竞赛「${submitData.title}」，扣除 ${totalCost} 积分（含手续费${platformFee}）`,
        });
        
        setUserBalance(deductResult.newBalance || 0);
        
        saveCompetition({
          id: String(taskId),
          title: submitData.title,
          subtitle: submitData.description?.slice(0, 80),
          category: submitData.category as '英语' | '数学' | '编程' | 'AI' | '阅读',
          type: submitData.competitionType as '每日挑战' | '周赛' | '月赛' | '全国活动',
          difficulty: submitData.difficulty as '青铜' | '白银' | '黄金' | '大师',
          description: submitData.description,
          organizer: user?.username || 'AI-WEGO',
          publisher_id: currentUserId,
          startTime: submitData.startTime || new Date().toISOString(),
          endTime: submitData.endTime || new Date(Date.now() + 7*86400000).toISOString(),
          rewardWEG: submitData.reward || 0,
          participants: 0,
          status: 'running',
          createdAt: new Date().toISOString(),
        });
        toast.success(`竞赛「${submitData.title}」已发布！`, { duration: 3000 });
        navigate('/competitions', { replace: true });
        return;
      } catch (err) {
        console.error('发布任务失败:', err);
        setError(err instanceof Error ? err.message : '发布任务失败，请重试');
        // 重新获取余额
        fetchUserBalance();
        setLoading(false);
        return;
      }
      
    } catch (err) {
      console.error('发布任务失败:', err);
      setError(err instanceof Error ? err.message : '发布任务失败，请重试');
      // 重新获取余额
      fetchUserBalance();
    } finally {
      setLoading(false);
    }
  };

  // 计算所有推荐的能力标签
  const allRecommendedCapabilities = useMemo(() => {
    const caps: Record<string, boolean> = {};
    formData.requirements.forEach(req => {
      req.capabilities.forEach(cap => {
        caps[cap] = true;
      });
    });
    return Object.keys(caps);
  }, [formData.requirements]);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* 返回按钮 */}
      <button
        onClick={() => navigate('/competitions')}
        className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
         返回竞赛列表
      </button>

      {/* 页面标题 */}
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-2xl flex items-center justify-center shadow-lg">
          <List className="w-7 h-7 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">创建竞赛活动</h1>
          <p className="text-slate-500 mt-1">设定竞赛主题、科目和规则，吸引参与者挑战</p>
        </div>
      </div>

      {/* 进度指示 */}
      <Card className="!p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
              formStep >= 1 ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white' : 'bg-slate-200 text-slate-500'
            }`}>
              {formStep > 1 ? <CheckCircle className="w-5 h-5" /> : '1'}
            </div>
            <span className={`font-medium ${formStep >= 1 ? 'text-slate-900' : 'text-slate-400'}`}>基本信息</span>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-300" />
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
              formStep >= 2 ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white' : 'bg-slate-200 text-slate-500'
            }`}>
              {formStep > 2 ? <CheckCircle className="w-5 h-5" /> : '2'}
            </div>
            <span className={`font-medium ${formStep >= 2 ? 'text-slate-900' : 'text-slate-400'}`}>能力要求</span>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-300" />
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
              formStep >= 3 ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white' : 'bg-slate-200 text-slate-500'
            }`}>
              3
            </div>
            <span className={`font-medium ${formStep >= 3 ? 'text-slate-900' : 'text-slate-400'}`}>完成</span>
          </div>
        </div>
      </Card>

      {/* 错误提示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {/* 示例提示 */}
      <Card className="!p-4 bg-gradient-to-r from-violet-50 to-fuchsia-50 border-violet-200">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-violet-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-violet-900">不知道怎么写？</h4>
              <p className="text-sm text-violet-700 mt-1">参考以下示例快速创建竞赛</p>
            </div>
          </div>
          <button
            onClick={() => setShowExamples(!showExamples)}
            className="text-violet-600 hover:text-violet-700 text-sm font-medium"
          >
            {showExamples ? '收起' : '查看示例'}
          </button>
        </div>
        
        {showExamples && (
          <div className="mt-4 space-y-3">
            {exampleTasks.map((example, idx) => (
              <button
                key={idx}
                onClick={() => applyExample(example)}
                className="w-full text-left p-4 bg-white rounded-xl border border-violet-200 hover:border-violet-400 hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-slate-900">{example.title}</span>
                  <span className="text-purple-600 font-bold"><img src="/weg-coin.png" alt="积分" style={{width:16,height:16,display:"inline-block",verticalAlign:"middle",marginRight:4,borderRadius:"50%"}} />{example.budget}</span>
                </div>
                <p className="text-sm text-slate-500 line-clamp-2">{example.description}</p>
              </button>
            ))}
          </div>
        )}
      </Card>

      {/* 表单 */}
      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 竞赛科目 */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              竞赛科目 <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
              {COMPETITION_CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isSelected = formData.category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, category: cat.id }))}
                    className={`p-4 rounded-xl border-2 transition-all text-center ${
                      isSelected 
                        ? `border-transparent bg-gradient-to-br ${cat.color} text-white shadow-lg` 
                        : 'border-slate-200 bg-white hover:border-indigo-300'
                    }`}
                  >
                    <Icon className={`w-6 h-6 mx-auto mb-2 ${isSelected ? 'text-white' : cat.color.split(' ')[0].replace('from-', 'text-')}`} />
                    <div className={`font-medium text-sm ${isSelected ? 'text-white' : 'text-slate-700'}`}>{cat.name}</div>
                    <div className={`text-xs mt-1 ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>{cat.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 竞赛类型 + 难度 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">竞赛类型 <span className="text-red-500">*</span></label>
              <div className="flex gap-2 flex-wrap">
                {COMPETITION_TYPES.map((t) => {
                  const Icon = t.icon;
                  const isSelected = formData.competitionType === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, competitionType: t.id }))}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all ${
                        isSelected
                          ? 'border-violet-500 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-md'
                          : 'border-slate-200 bg-white hover:border-violet-300 text-slate-600'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{t.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">难度等级 <span className="text-red-500">*</span></label>
              <div className="flex gap-2">
                {DIFFICULTY_LEVELS.map((d) => {
                  const isSelected = formData.difficulty === d.id;
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, difficulty: d.id }))}
                      className={`flex-1 px-3 py-2.5 rounded-xl border-2 transition-all text-center ${
                        isSelected
                          ? `border-transparent bg-gradient-to-br ${d.color} text-white shadow-md`
                          : 'border-slate-200 bg-white hover:border-violet-300 text-slate-600'
                      }`}
                    >
                      <div className="text-sm font-medium">{d.name}</div>
                      <div className={`text-xs ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>{d.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 竞赛标题 */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              竞赛标题 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="例如：AI创意写作大赛 — 用智能体写一篇科幻故事"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all text-base"
              maxLength={200}
            />
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <Info className="w-3 h-3" />
              一个有吸引力的标题能让更多人参与
            </p>
          </div>

          {/* 竞赛描述 */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              竞赛描述
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="详细描述竞赛规则、评审标准、提交要求..."
              rows={4}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all text-base"
            />
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <Info className="w-3 h-3" />
              清晰的规则和标准能让参赛者更好地准备
            </p>
          </div>

          {/* 附件上传区域 */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              附件资料
              <span className="text-xs text-slate-400 font-normal ml-2">（图片/音频/文档，最多10MB）</span>
            </label>
            
            {/* 上传按钮 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <label
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 20px',
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                  color: '#fff',
                  borderRadius: 12,
                  cursor: uploading ? 'wait' : 'pointer',
                  fontSize: 14,
                  fontWeight: 500,
                  boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
                  opacity: uploading ? 0.7 : 1,
                }}
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4" style={{ animation: 'spin 1s linear infinite' }} />
                    上传中...
                  </>
                ) : (
                  <>
                    📎 选择文件
                  </>
                )}
                <input
                  type="file"
                  multiple
                  accept="image/*,audio/*,.pdf,.doc,.docx,.ppt,.pptx,.xlsx,.xls,.txt"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                  disabled={uploading}
                />
              </label>
              <button
                type="button"
                onClick={addManualLink}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '10px 16px',
                  background: 'rgba(139, 92, 246, 0.1)',
                  color: '#7c3aed',
                  border: '1px dashed #c4b5fd',
                  borderRadius: 12,
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 500,
                }}
              >
                <LinkIcon className="w-4 h-4" />
                添加链接
              </button>
              <span style={{ fontSize: 12, color: '#9ca3af' }}>支持拖拽</span>
            </div>

            {/* 已上传文件列表 */}
            {uploadedFiles.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                {uploadedFiles.map((file, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '10px 14px',
                      background: '#f9fafb',
                      border: '1px solid #e5e7eb',
                      borderRadius: 10,
                      marginBottom: 8,
                    }}
                  >
                    {file.type === 'image' && <ImageIcon className="w-5 h-5" style={{ color: '#10b981' }} />}
                    {file.type === 'audio' && <Music className="w-5 h-5" style={{ color: '#f59e0b' }} />}
                    {(file.type === 'document' || file.type === 'other') && <FileText className="w-5 h-5" style={{ color: '#6366f1' }} />}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 14, color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</p>
                      <p style={{ fontSize: 11, color: '#9ca3af', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.url}</p>
                    </div>
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#8b5cf6', fontSize: 12, marginRight: 8 }}
                    >
                      预览
                    </a>
                    <button
                      type="button"
                      onClick={() => removeUploadedFile(index)}
                      style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: 'none',
                        borderRadius: 6,
                        padding: '4px 8px',
                        cursor: 'pointer',
                        color: '#ef4444',
                        fontSize: 12,
                      }}
                    >
                      删除
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* 手动输入链接 */}
            {manualLinks.map((link, index) => (
              <div
                key={`link-${index}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 8,
                }}
              >
                <input
                  type="url"
                  value={link}
                  onChange={(e) => updateManualLink(index, e.target.value)}
                  placeholder="输入附件链接（URL）"
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    border: '1px solid #e5e7eb',
                    borderRadius: 10,
                    fontSize: 14,
                    outline: 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={() => removeManualLink(index)}
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: 'none',
                    borderRadius: 8,
                    padding: '8px 12px',
                    cursor: 'pointer',
                    color: '#ef4444',
                  }}
                >
                  ✕
                </button>
              </div>
            ))}

            <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>
              💡 上传文件或输入链接，方便智能体获取参考材料
            </p>
          </div>

          {/* 竞赛奖金和余额 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-violet-50 to-fuchsia-50 border border-violet-200 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-xl flex items-center justify-center">
                  <Coins className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-violet-600 font-medium">当前余额</p>
                  {balanceLoading ? (
                    <div className="w-16 h-6 bg-violet-200/50 rounded animate-pulse" />
                  ) : (
                    <p className="text-2xl font-bold text-violet-700">{userBalance.toLocaleString()} <span className="text-sm font-normal">积分</span></p>
                  )}
                </div>
              </div>
              {formData.reward > userBalance && !balanceLoading && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                  <AlertCircle className="w-4 h-4" />
                  <span>余额不足以支付竞赛奖金</span>
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                <Trophy className="w-4 h-4 inline mr-1" />
                竞赛奖金 (积分) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.reward}
                  onChange={(e) => { const parsed = parseFloat(e.target.value); setFormData(prev => ({ ...prev, reward: isNaN(parsed) ? 50 : parsed })); }}
                  min={10}
                  max={10000}
                  step={10}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-violet-500 transition-all text-base ${
                    formData.reward > userBalance && !balanceLoading 
                      ? 'border-red-300 focus:ring-red-500 bg-red-50' 
                      : 'border-slate-200 focus:ring-violet-500'
                  }`}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"><img src="/weg-coin.png" alt="积分" style={{width:16,height:16,display:"inline-block",verticalAlign:"middle",marginRight:4,borderRadius:"50%"}} /></span>
              </div>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                <Info className="w-3 h-3" />
                最低10 积分，最高10000 积分
              </p>
              <div className="flex gap-2 mt-2">
                {[10, 50, 100, 200].map(amount => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, reward: amount }))}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      formData.reward === amount
                        ? 'bg-violet-500 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {amount}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 竞赛时间 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                开始时间 <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={formData.startTime}
                onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                截止时间 <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={formData.endTime}
                onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all text-base"
              />
            </div>
          </div>

          {/* 参与人数限制 */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              <Users className="w-4 h-4 inline mr-1" />
              参赛人数上限 <span className="text-red-500">*</span>
            </label>
            <div className="relative w-full md:w-1/3">
              <input
                type="number"
                id="maxClaimants-input"
                value={formData.maxClaimants}
                onChange={(e) => { 
                  const val = e.target.value;
                  const parsed = parseInt(val, 10); 
                  setFormData(prev => ({ 
                    ...prev, 
                    maxClaimants: isNaN(parsed) ? 1 : Math.max(1, Math.min(100, parsed)) 
                  })); 
                }}
                min={1}
                max={100}
                className="w-full px-4 py-3 pr-12 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all text-base"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">人</span>
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <Info className="w-3 h-3" />
              1-100人，设置参赛人数上限
            </p>
          </div>

          {/* 能力要求 - AI智能推荐版 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-slate-700">
                <Sparkles className="w-4 h-4 inline mr-1 text-indigo-500" />
                能力要求
                {allRecommendedCapabilities.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-violet-100 text-violet-600 text-xs rounded-full">
                    已智能匹配 {allRecommendedCapabilities.length} 项
                  </span>
                )}
              </label>
              <button
                type="button"
                onClick={addRequirement}
                className="inline-flex items-center gap-1 text-sm text-violet-600 hover:text-violet-700 font-medium"
              >
                <Plus className="w-4 h-4" />
                添加额外需求
              </button>
            </div>
            
            {/* 智能推荐提示 */}
            {allRecommendedCapabilities.length > 0 && (
              <div className="mb-3 p-3 bg-gradient-to-r from-violet-50 to-fuchsia-50 rounded-xl border border-violet-100">
                <div className="flex items-center gap-2 mb-2">
                  <Wand2 className="w-4 h-4 text-indigo-500" />
                  <span className="text-sm font-medium text-violet-700">智能匹配的能力标签</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {allRecommendedCapabilities.map(cap => (
                    <CapabilityTag key={cap} capability={cap} showRemove={false} />
                  ))}
                </div>
              </div>
            )}
            
            <div className="space-y-3">
              {formData.requirements.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                  <div className="w-16 h-16 bg-gradient-to-br from-violet-100 to-fuchsia-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Wand2 className="w-8 h-8 text-indigo-500" />
                  </div>
                  <p className="text-slate-500 font-medium">智能能力匹配已开启</p>
                  <p className="text-xs text-slate-400 mt-1">
                    填写上方任务描述后，系统会自动分析并推荐所需能力
                  </p>
                  <button
                    type="button"
                    onClick={addRequirement}
                    className="mt-3 px-4 py-2 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white rounded-lg text-sm font-medium hover:from-violet-600 hover:to-fuchsia-600 transition-all shadow-md"
                  >
                    手动添加需求
                  </button>
                </div>
              ) : (
                formData.requirements.map((req, index) => (
                  <RequirementItem
                    key={index}
                    description={req.description}
                    minLevel={req.min_level}
                    onDescriptionChange={(desc) => updateRequirementDescription(index, desc)}
                    onMinLevelChange={(level) => updateRequirementLevel(index, level)}
                    onRemove={() => removeRequirement(index)}
                  />
                ))
              )}
            </div>

            {/* 说明 */}
            <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-slate-400 mt-0.5" />
                <p className="text-xs text-slate-500 leading-relaxed">
                  系统会根据您填写的任务描述自动分析并匹配最合适的能力标签。您也可以添加多个额外需求来补充要求。
                  设置合理的等级要求，既能保证任务质量，又能让更多智能体参与竞争。
                </p>
              </div>
            </div>
          </div>

          {/* 提交按钮 */}
          <div className="space-y-3 pt-4">
            {/* 审核提示 */}
            <div className="p-3 bg-gradient-to-r from-violet-50 to-fuchsia-50 border border-violet-200 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-violet-600" />
                  <span className="text-sm text-violet-700">发布即同意平台治理规则</span>
                </div>
                <a href="#/rules" className="text-sm text-violet-600 underline hover:text-violet-800">查看详情 →</a>
              </div>
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate('/competitions')}
                className="px-6 py-3 text-slate-600 hover:text-slate-900 font-medium"
              >
                取消
              </button>
              
              {/* 余额不足提示 */}
              {formData.reward > userBalance && !balanceLoading && (
                <div className="flex items-center gap-2 px-4 py-3 bg-red-50 text-red-600 rounded-xl">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-medium">余额不足，请先充值</span>
                </div>
              )}
              
              <button
                type="submit"
                disabled={loading || balanceLoading || formData.reward > userBalance}
                className="px-8 py-3 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white rounded-xl hover:from-violet-600 hover:to-fuchsia-600 transition-all font-semibold shadow-lg shadow-violet-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-slate-400 disabled:hover:to-slate-500 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    创建中...
                  </>
                ) : balanceLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    加载中...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    发布竞赛（-{formData.reward} 积分）
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CreateTaskPage;
