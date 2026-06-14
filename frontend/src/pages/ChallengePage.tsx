import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Send, Award, Star, Sparkles, Trophy, Loader2, AlertCircle, CheckCircle, BookOpen, Target, TrendingUp, Clock, Zap, RotateCcw, Map, Medal, Gift, User, Lightbulb } from 'lucide-react';
import { tasksAPI, supabaseFetch, usersAPI, xpAPI, SUPABASE_KEY, SUPABASE_URL } from '../utils/supabase';
import { sendToDeepSeekSync } from '../utils/deepseek';
import { useUser } from '../contexts/UserContext';
import toast from 'react-hot-toast';

const API_HEADERS = {
  "apikey": SUPABASE_KEY,
  "Authorization": `Bearer ${SUPABASE_KEY}`,
  "Content-Type": "application/json",
  "Prefer": "return=representation",
};

const GRADING_PROMPT = `你是一位专业的中学英语教师。请对以下学生的英语回答进行评分和批改。

请从以下3个维度评分，每个维度满分5分，总分15分：
1. 语言准确性（Grammar & Vocabulary）：语法和词汇使用是否准确
2. 内容完整性（Content）：是否完整回答了问题
3. 表达流畅度（Fluency）：表达是否自然流畅

请严格按照以下JSON格式回复（不要markdown标记，纯JSON）：
{
  "grammar": { "score": 数字, "comment": "简短评语" },
  "content": { "score": 数字, "comment": "简短评语" },
  "fluency": { "score": 数字, "comment": "简短评语" },
  "total": 数字,
  "feedback": "综合反馈（用中文，鼓励为主，指出具体问题）",
  "improved": "优化后的完整英文答案",
  "tips": ["改进建议1", "改进建议2", "改进建议3"]
}

注意：分数要严格，不虚高。给出具体修改建议。`;

const MISSIONS = [
  { id: "science", icon: "🧠", label: "AI科学任务", desc: "用英语解释一个简单科学现象", example: "Why do we have day and night?", color: "from-cyan-400 to-blue-500", week: 1 },
  { id: "invention", icon: "🌱", label: "未来发明任务", desc: "设计一个帮助人类的AI工具", example: "An AI robot for cleaning classrooms", color: "from-green-400 to-emerald-500", week: 2 },
  { id: "life", icon: "🌍", label: "生活问题任务", desc: "用英语提出解决方案", example: "How to reduce plastic waste in school?", color: "from-amber-400 to-orange-500", week: 3 },
  { id: "story", icon: "🎨", label: "创意故事任务", desc: "用英语写一个短故事", example: "A day when animals can talk", color: "from-pink-400 to-rose-500", week: 4 },
  { id: "ai", icon: "🤖", label: "AI协作任务", desc: "用一句英语提示词让AI帮你生成内容", example: "Create a smart school in the future", color: "from-violet-400 to-fuchsia-500", week: 5 },
];

interface GradingResult {
  grammar: { score: number; comment: string };
  content: { score: number; comment: string };
  fluency: { score: number; comment: string };
  total: number;
  feedback: string;
  improved: string;
  tips: string[];
}

const COMPETITION_PROGRESS_KEY = "aiwego_competition_progress";

function getScoreColor(score: number): string {
  if (score >= 13) return "text-amber-500";
  if (score >= 10) return "text-blue-500";
  if (score >= 7) return "text-green-500";
  return "text-slate-400";
}

export default function ChallengePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useUser();
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [studentName, setStudentName] = useState("");
  const [selectedMission, setSelectedMission] = useState<string>("");
  const [answer, setAnswer] = useState("");
  const [aiHelp, setAiHelp] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<GradingResult | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [pointsAwarded, setPointsAwarded] = useState(0);
  const [xpAwarded, setXpAwarded] = useState(0);
  const [badgeAwarded, setBadgeAwarded] = useState<string | null>(null);
  const [mapUnlocked, setMapUnlocked] = useState(false);
  const [pastSubmissions, setPastSubmissions] = useState<any[]>([]);

  useEffect(() => {
    if (id) fetchTask(parseInt(id));
  }, [id]);

  const fetchTask = async (taskId: number) => {
    try {
      const data = await tasksAPI.getTask(taskId);
      if (!data) { setError("竞赛不存在"); return; }
      setTask(data);
      if (data?.source !== "competition") { setError("这不是一个竞赛任务"); return; }
      if (user?.id) {
        const subs = await supabaseFetch(`deliveries?task_id=eq.${taskId}&agent_id=eq.${user.id}&order=id.desc`);
        setPastSubmissions(subs || []);
      }
    } catch (err) {
      setError("加载竞赛失败");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!studentName.trim()) { toast.error("请先输入你的姓名或昵称"); return; }
    if (!selectedMission) { toast.error("请先选择一个探险任务"); return; }
    if (!answer.trim()) { toast.error("请先输入你的英语回答"); return; }
    if (!task || !id || !user?.id) { toast.error("请先登录"); return; }

    setSubmitting(true);
    setResult(null);
    setSubmitted(false);

    const mission = MISSIONS.find(m => m.id === selectedMission);
    const missionPrompt = mission
      ? `周${mission.week} - ${mission.label}\n任务说明：${mission.desc}\n示例问题：${mission.example}`
      : "";

    try {
      const messages = [
        { role: "system", content: GRADING_PROMPT },
        {
          role: "user",
          content: `竞赛名称：${task.title}\n竞赛描述：${task.description || ""}\n\n选手姓名：${studentName}\n${missionPrompt}\n\n学生的英语回答：\n"""\n${answer}\n"""${aiHelp ? `\n\n学生使用的AI辅助提示词：\n"""\n${aiHelp}\n"""` : ""}`,
        },
      ];

      const aiResponse = await sendToDeepSeekSync(messages);
      let parsed: GradingResult;
      try { parsed = JSON.parse(aiResponse); }
      catch {
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) parsed = JSON.parse(jsonMatch[0]);
        else throw new Error("无法解析AI评分结果");
      }

      setResult(parsed);
      setSubmitted(true);

      // Save submission
      try {
        await fetch(`${SUPABASE_URL}deliveries`, {
          method: "POST", headers: API_HEADERS,
          body: JSON.stringify({
            task_id: parseInt(id), agent_id: user.id,
            content: JSON.stringify({ name: studentName, mission: selectedMission, answer, aiHelp: aiHelp || undefined, result: parsed }),
            status: "submitted",
          }),
        });
        await fetch(`${SUPABASE_URL}tasks?id=eq.${id}`, {
          method: "PATCH", headers: API_HEADERS,
          body: JSON.stringify({ status: "submitted" }),
        });
      } catch { /* silent */ }

      const score = parsed?.total || 0;
      const earnedPoints = Math.max(1, Math.round(score * 1.5));
      const earnedXp = Math.max(5, Math.round(score * 3));
      setPointsAwarded(earnedPoints);
      setXpAwarded(earnedXp);

      // Progress
      const progress = JSON.parse(localStorage.getItem(COMPETITION_PROGRESS_KEY) || "{}");
      const missionKey = `comp_${id}_${selectedMission}`;
      const prevScore = progress[missionKey]?.score || 0;
      if (score > prevScore) {
        progress[missionKey] = { completed: true, score, xpAwarded: !!progress[missionKey]?.xpAwarded, badgeAwarded: !!progress[missionKey]?.badgeAwarded };
      }
      localStorage.setItem(COMPETITION_PROGRESS_KEY, JSON.stringify(progress));

      // XP
      try {
        if (!progress[missionKey]?.xpAwarded) {
          await fetch(`${SUPABASE_URL}xp_transactions`, {
            method: "POST", headers: API_HEADERS,
            body: JSON.stringify({ user_id: user.id, amount: earnedXp, source: "competition", description: `完成竞赛任务: ${selectedMission} - 得分${score}/15` }),
          });
          progress[missionKey].xpAwarded = true;
          localStorage.setItem(COMPETITION_PROGRESS_KEY, JSON.stringify(progress));
        }
      } catch { /* silent */ }

      // Badge
      const completedMissions = Object.values(progress).filter((p: any) => p.completed).length;
      if (completedMissions >= 1 && score >= 10) setBadgeAwarded("🌟 初出茅庐");
      if (completedMissions >= 3) setBadgeAwarded("🏅 竞赛达人");
      if (score >= 13) setBadgeAwarded("🏆 学霸之星");
      if (completedMissions >= 5) setBadgeAwarded("👑 竞赛之王");

      // Map unlock
      if (score >= 10) {
        setMapUnlocked(true);
        const levels = ["青铜", "白银", "黄金", "大师"];
        const curLevel = levels.indexOf(task?.requirements?.[0]?.difficulty || "青铜");
        if (curLevel >= 0 && curLevel < levels.length - 1) {
          const nextLevel = levels[curLevel + 1];
          progress[nextLevel] = { ...progress[nextLevel], unlocked: true };
          localStorage.setItem(COMPETITION_PROGRESS_KEY, JSON.stringify(progress));
        }
      }
    } catch (err: any) {
      toast.error("评分失败：" + (err.message || "请稍后重试"));
    } finally {
      setSubmitting(false);
    }
  };

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-violet-500 mx-auto mb-3" />
          <p className="text-slate-500">加载竞赛中...</p>
        </div>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">加载失败</h2>
          <p className="text-slate-500 mb-6">{error}</p>
          <button onClick={() => navigate(-1)} className="px-6 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors">返回</button>
        </div>
      </div>
    );
  }

  // === RESULTS VIEW ===
  if (submitted && result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50 to-indigo-50">
        <div className="max-w-lg mx-auto px-4 py-6">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-slate-500 hover:text-slate-700 mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> 返回
          </button>
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-slate-800 mb-1">🎉 提交成功！</h1>
            <p className="text-slate-500 text-sm">感谢参与 {studentName}</p>
          </div>
          <div className="flex justify-center mb-6">
            <div className={`w-28 h-28 rounded-full flex items-center justify-center bg-gradient-to-br ${result.total >= 13 ? "from-amber-400 to-orange-500" : result.total >= 10 ? "from-blue-400 to-indigo-500" : result.total >= 7 ? "from-green-400 to-emerald-500" : "from-slate-300 to-slate-400"} shadow-lg`}>
              <div className="text-center">
                <p className="text-3xl font-bold text-white">{result.total}</p>
                <p className="text-[10px] text-white/80">/ 15</p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            {/* Dimension Scores */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200 p-5">
              <h3 className="font-semibold text-slate-700 mb-3 text-sm">评分详情</h3>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "语法词汇", score: result.grammar.score, comment: result.grammar.comment, color: "from-cyan-500 to-blue-600" },
                  { label: "内容完整", score: result.content.score, comment: result.content.comment, color: "from-violet-500 to-purple-600" },
                  { label: "表达流畅", score: result.fluency.score, comment: result.fluency.comment, color: "from-amber-500 to-orange-600" },
                ].map((dim, i) => (
                  <div key={i} className="bg-slate-50 rounded-xl p-3 text-center">
                    <p className="text-[10px] text-slate-500 mb-1">{dim.label}</p>
                    <p className={`text-lg font-bold bg-gradient-to-r ${dim.color} bg-clip-text text-transparent`}>{dim.score}/5</p>
                    <p className="text-[10px] text-slate-400 mt-1 truncate">{dim.comment}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 bg-white rounded-xl p-3">
                <p className="text-sm text-slate-700">{result.feedback}</p>
              </div>
            </div>

            {/* Improved Version */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200 p-5">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                <h3 className="font-semibold text-emerald-800 text-sm">优化版答案</h3>
              </div>
              <div className="bg-white rounded-xl p-3 text-sm text-slate-700 leading-relaxed whitespace-pre-line">{result.improved}</div>
            </div>

            {/* Tips */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200 p-5">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-5 h-5 text-amber-600" />
                <h3 className="font-semibold text-amber-800 text-sm">改进建议</h3>
              </div>
              <ul className="space-y-1.5">
                {result.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                    <span className="text-amber-500 mt-0.5 shrink-0">{i + 1}.</span><span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Rewards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gradient-to-br from-violet-50 to-fuchsia-50 rounded-2xl border border-violet-200 p-4 text-center">
                <Award className="w-6 h-6 text-violet-600 mx-auto mb-1" />
                <p className="text-lg font-bold text-violet-700">+{pointsAwarded}</p>
                <p className="text-[10px] text-slate-500">积分</p>
              </div>
              {xpAwarded > 0 && (
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-200 p-4 text-center">
                  <Zap className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                  <p className="text-lg font-bold text-blue-700">+{xpAwarded}</p>
                  <p className="text-[10px] text-slate-500">经验值</p>
                </div>
              )}
              {badgeAwarded && (
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200 p-4 text-center">
                  <Gift className="w-6 h-6 text-amber-600 mx-auto mb-1" />
                  <p className="text-xs font-bold text-amber-700 truncate">{badgeAwarded}</p>
                  <p className="text-[10px] text-slate-500">徽章</p>
                </div>
              )}
            </div>

            {/* Map Unlock */}
            {mapUnlocked && (
              <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl border border-emerald-200 p-4 flex items-center gap-3">
                <Map className="w-8 h-8 text-emerald-600 flex-shrink-0" />
                <div>
                  <p className="font-bold text-emerald-800 text-sm">🎉 新关卡已解锁！</p>
                  <p className="text-xs text-emerald-600">得分达10+，可以挑战更高难度了！</p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button onClick={() => { setSubmitted(false); setResult(null); setAnswer(""); setSelectedMission(""); setAiHelp(""); }}
                className="flex-1 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-50 transition-colors">
                <RotateCcw className="w-4 h-4 inline mr-1" /> 再写一次
              </button>
              <Link to={`/competitions/${id}`}
                className="flex-1 py-3 bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white rounded-xl font-semibold text-sm text-center hover:opacity-90 transition-opacity">
                返回竞赛
              </Link>
            </div>

            {mapUnlocked && (
              <Link to="/competitions"
                className="block w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold text-sm text-center hover:opacity-90 transition-opacity shadow-lg shadow-emerald-500/25">
                <Map className="w-4 h-4 inline mr-1" /> 探索更高难度关卡
              </Link>
            )}

            <Link to={`/competitions`}
              className="block w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-semibold text-sm text-center hover:opacity-90 transition-opacity shadow-lg shadow-amber-500/25">
              <Trophy className="w-4 h-4 inline mr-1" /> 返回竞赛大厅
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // === MAIN CHALLENGE VIEW ===
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50 to-indigo-50">
      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-5">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-slate-500 hover:text-slate-700 transition-colors">
            <ArrowLeft className="w-4 h-4" /> 返回
          </button>
          <h1 className="text-lg font-bold text-slate-800 truncate ml-2">{task?.title || "竞赛挑战"}</h1>
          <div className="w-12" />
        </div>

        <div className="flex items-center justify-center gap-1 mb-6">
          {[1, 2, 3, 4].map((step) => (
            <React.Fragment key={step}>
              <div className={`w-2 h-2 rounded-full ${step <= 2 ? "bg-violet-500" : "bg-slate-200"}`} />
              {step < 4 && <div className={`h-[3px] w-8 ${step < 2 ? "bg-violet-300" : "bg-slate-200"}`} />}
            </React.Fragment>
          ))}
        </div>

        {/* Name */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 mb-4">
          <label className="flex items-center gap-2 font-semibold text-slate-700 mb-3">
            <User className="w-4 h-4 text-violet-500" />
            👤 姓名 / 昵称 <span className="text-red-400">*</span>
          </label>
          <input type="text" value={studentName} onChange={(e) => setStudentName(e.target.value)}
            placeholder="输入你的姓名或昵称"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-transparent transition-all"
            maxLength={30} />
        </div>

        {/* Mission Selector */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 mb-4">
          <label className="flex items-center gap-2 font-semibold text-slate-700 mb-3">
            <Target className="w-4 h-4 text-violet-500" />
            🎯 选择探险任务（五周挑战） <span className="text-red-400">*</span>
          </label>
          <div className="grid grid-cols-1 gap-2.5">
            {MISSIONS.map((mission) => (
              <button key={mission.id} onClick={() => setSelectedMission(mission.id)}
                className={`relative flex items-start gap-3 p-3.5 rounded-xl border-2 text-left transition-all ${
                  selectedMission === mission.id
                    ? "border-violet-500 bg-violet-50 shadow-sm"
                    : "border-slate-100 bg-slate-50 hover:border-violet-200 hover:bg-violet-50/50"
                }`}>
                <span className="text-2xl shrink-0">{mission.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-400">第{mission.week}周</span>
                    <span className={`text-sm font-semibold ${selectedMission === mission.id ? "text-violet-700" : "text-slate-700"}`}>
                      {mission.label}
                    </span>
                    {selectedMission === mission.id && <CheckCircle className="w-4 h-4 text-violet-500 shrink-0 ml-auto" />}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{mission.desc}</p>
                  <p className="text-[11px] text-slate-400 mt-1 italic">💡 示例: {mission.example}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Answer */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 mb-4">
          <label className="flex items-center gap-2 font-semibold text-slate-700 mb-3">
            <BookOpen className="w-4 h-4 text-violet-500" />
            ✏️ 你的英语回答 <span className="text-red-400">*</span>
          </label>
          <textarea value={answer} onChange={(e) => setAnswer(e.target.value)}
            placeholder={selectedMission ? "用英语回答..." : "请先选择一个任务类型"}
            rows={8}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-transparent transition-all resize-none"
            maxLength={2000} />
          <div className="flex justify-end mt-1">
            <span className="text-[11px] text-slate-400">{answer.length}/2000</span>
          </div>
        </div>

        {/* AI Help */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 mb-4">
          <label className="flex items-center gap-2 font-semibold text-slate-700 mb-3">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            💡 AI辅助提示（可选）
          </label>
          <p className="text-xs text-slate-400 mb-2">想让AI帮你扩展思路？在这里输入提示词：</p>
          <textarea value={aiHelp} onChange={(e) => setAiHelp(e.target.value)}
            placeholder='例如：Help me write about why the sky is blue'
            rows={3}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent transition-all resize-none"
            maxLength={500} />
        </div>

        {/* Submit */}
        <button onClick={handleSubmit}
          disabled={submitting || !studentName.trim() || !selectedMission || !answer.trim()}
          className={`w-full py-4 rounded-xl font-bold text-base transition-all shadow-lg ${
            submitting || !studentName.trim() || !selectedMission || !answer.trim()
              ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
              : "bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white hover:opacity-90 shadow-violet-500/25"
          }`}>
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              AI评分中...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Send className="w-5 h-5" />
              提交评分
            </span>
          )}
        </button>

        {/* Past Submissions */}
        {pastSubmissions.length > 0 && (
          <div className="mt-6 bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              历史提交记录
            </h3>
            <div className="space-y-2">
              {pastSubmissions.slice(0, 5).map((sub, i) => {
                let subContent: any = {};
                try { subContent = typeof sub.content === "string" ? JSON.parse(sub.content) : sub.content; }
                catch { subContent = {}; }
                const missionLabel = MISSIONS.find(m => m.id === subContent.mission)?.label || subContent.mission;
                return (
                  <div key={i} className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-xl text-sm">
                    <span className="text-slate-600 truncate">{missionLabel}</span>
                    <span className={`text-xs font-bold shrink-0 ${(subContent.result?.total || 0) >= 10 ? "text-green-600" : "text-slate-400"}`}>
                      {subContent.result?.total || "?"}/15
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="mt-6 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
          <div className="flex items-start gap-2">
            <Sparkles className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-blue-800">💡 如何获得高分？</p>
              <ul className="text-xs text-blue-600 mt-1.5 space-y-1">
                <li>• 使用丰富的词汇和句型</li>
                <li>• 回答要完整、有逻辑</li>
                <li>• 注意语法正确性</li>
                <li>• 可以先用中文构思，再翻译成英文</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
