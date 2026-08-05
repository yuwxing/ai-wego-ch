import { Routes, Route, Navigate, useParams } from 'react-router-dom'
// AI-Wego App v3 - Navigation Hub
import Home from './pages/Home'
import LearnHub from './pages/LearnHub'
import WordCardPage from './pages/WordCardPage'
import ListeningSpeakingPage from './pages/ListeningSpeakingPage'
import EnglishDailyPage from './pages/EnglishDailyPage'
import ReadingIntensivePage from './pages/ReadingIntensivePage'
import JobClassroomPage from './pages/JobClassroomPage'
import AIClassroomPage from './pages/AIClassroomPage'
import LearnCompetitions from './pages/LearnCompetitions'

import CompetitionHallPage from './pages/CompetitionHallPage'
import HanToEngPage from './pages/HanToEngPage'
import CompetitionDetailPage from './pages/CompetitionDetailPage'
import CreateCompetitionPage from './pages/CreateCompetitionPage'

import SubmitPage from './pages/SubmitPage'
import ChallengePage from './pages/ChallengePage'
import WegHub from './pages/WegHub'
import XpPage from './pages/XpPage'
import LevelsPage from './pages/LevelsPage'
import BalancePage from './pages/BalancePage'
import RewardsPage from './pages/RewardsPage'
import QinghuaUniversityPage from './pages/QinghuaUniversityPage'
import JinghuaProjects from './pages/JinghuaProjects'
import JinghuaChat from './pages/jinghua/JinghuaChat'
import JobSquarePage from './pages/JobSquarePage'
import ApiKeySettingsPage from './pages/ApiKeySettingsPage'
import SystemAnnouncementsPage from './pages/SystemAnnouncementsPage'
import RulesPage from './pages/RulesPage'
import FeedbackPage from './pages/FeedbackPage'
import NotesPage from './pages/NotesPage'
import RegisterPage from './pages/RegisterPage'
import AdoptPage from './pages/AdoptPage'
import { PetChatPage } from './pages/PetChatPage'
import AvatarChatPage from './pages/AvatarChatPage'

import { useState } from 'react'
import { useUser } from './contexts/UserContext'
import { getApiKey, getSharedApiKey } from './utils/deepseek'
import PetWidget from './components/PetWidget'
import AdminApplications from './pages/admin/Applications'
import AdminFeedback from './pages/admin/Feedback'
import AdminCompensate from './pages/admin/Compensate'
import AdminInspections from './pages/admin/Inspections'
import ListeningSpeakingAdmin from './pages/admin/ListeningSpeakingAdmin'
import DailyEnglishAdmin from './pages/admin/DailyEnglishAdmin'
import JobSquareAdmin from './pages/admin/JobSquareAdmin'
import OnlineClassroom from './pages/OnlineClassroom'
import CreativeWorkshopPage from './pages/CreativeWorkshopPage'
import WritingGrowthPage from './pages/WritingGrowthPage'
import DigitalTeacherPage from './pages/DigitalTeacherPage'
import RobotPage from './pages/RobotPage'
import GardenPage from './pages/GardenPage'
import SequenceTestPage from './pages/SequenceTestPage'
import MathSpeedTestPage from './pages/MathSpeedTestPage'
import IrregularVerbsPage from './pages/IrregularVerbsPage'
import BrainTrainPage from './pages/BrainTrainPage'
import TextbookChallengePage from './pages/TextbookChallengePage'
import StoryAcademyPage from './pages/StoryAcademyPage'
import QuizChallengePage from './pages/QuizChallengePage'
import PsychologyTestPage from './pages/PsychologyTestPage'
import StudyNotesPage from './pages/StudyNotesPage'
import TranslatorPage from './pages/TranslatorPage'
import GradingPage from './pages/GradingPage'
import ShopPage from './pages/ShopPage'
import MultiAgentTeamPage from './pages/MultiAgentTeamPage'
import MathVisualPage from './pages/MathVisualPage'
import WordPassPage from './pages/WordPassPage'
import GrammarQuestPage from './pages/GrammarQuestPage'
import GameCarnivalPage from './pages/GameCarnivalPage'
import LiteraryClubHall from './pages/literature/LiteraryClubHall'
import LiteratureWritePage from './pages/literature/LiteratureWritePage'
import PaperShortWritePage from './pages/literature/PaperShortWritePage'
import NotFound from './pages/NotFound'
import ErrorBoundary from './components/ErrorBoundary'
import { Toaster } from 'react-hot-toast'

function ParamRedirect({ to }: { to: string }) {
  const params = useParams();
  let resolved = to;
  for (const [key, value] of Object.entries(params)) {
    resolved = resolved.replace(`:${key}`, value || '');
  }
  return <Navigate to={resolved} replace />;
}

function KeyPromptBanner() {
  const { user, balance } = useUser()
  const [dismissed, setDismissed] = useState(() => localStorage.getItem('key_banner_dismissed') === 'true')
  const hasKey = !!getApiKey() || !!getSharedApiKey()
  if (!user || user.id <= 0 || dismissed || hasKey || balance <= 0) return null
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
      background: 'linear-gradient(135deg, #f97316, #eab308)',
      color: '#fff', textAlign: 'center', padding: '10px 16px',
      fontSize: 13, fontWeight: 500, fontFamily: '"Noto Serif SC", serif',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    }}>
      <span>💰 已充值成功！别忘了填写 DeepSeek 密钥才能使用 AI 功能 →</span>
      <a href="/settings/api-key"
        style={{ color: '#fff', textDecoration: 'underline', fontWeight: 700, whiteSpace: 'nowrap' }}>
        去填写密钥
      </a>
      <span onClick={() => { setDismissed(true); localStorage.setItem('key_banner_dismissed', 'true'); }}
        style={{ cursor: 'pointer', opacity: 0.7, marginLeft: 8, fontSize: 16 }}>✕</span>
    </div>
  )
}

export default function App() {
  return (
    <>
    <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
    <KeyPromptBanner />
    <PetWidget />
    <Routes>
      {/* Home */}
      <Route path="/" element={<Home />} />

      {/* English Game Carnival */}
      <Route path="/games" element={<GameCarnivalPage />} />

      {/* Learning System */}
      <Route path="/learn" element={<LearnHub />} />
      <Route path="/learn/word-cards" element={<WordCardPage />} />
      <Route path="/dictation" element={<WordCardPage />} />
      <Route path="/test" element={<WordCardPage />} />
      <Route path="/learn/han-to-eng" element={<HanToEngPage />} />
      <Route path="/learn/listening-speaking" element={<ListeningSpeakingPage />} />
      <Route path="/learn/english-daily" element={<EnglishDailyPage />} />
      <Route path="/learn/reading-intensive" element={<ReadingIntensivePage />} />
      <Route path="/learn/irregular-verbs" element={<IrregularVerbsPage />} />
      <Route path="/learn/classroom" element={<AIClassroomPage />} />
      <Route path="/learn/competitions" element={<LearnCompetitions />} />
      <Route path="/learn/online-classroom" element={<OnlineClassroom />} />
      <Route path="/learn/creative-workshop" element={<CreativeWorkshopPage />} />
      <Route path="/learn/writing" element={<WritingGrowthPage />} />
      <Route path="/learn/teacher" element={<DigitalTeacherPage />} />
      <Route path="/learn/robot" element={<RobotPage />} />
      <Route path="/learn/garden" element={<GardenPage />} />
      <Route path="/learn/study-notes" element={<StudyNotesPage />} />
      <Route path="/learn/textbook-challenge" element={<ErrorBoundary><TextbookChallengePage /></ErrorBoundary>} />
      <Route path="/learn/story-academy" element={<StoryAcademyPage />} />
      <Route path="/learn/multi-agent-team" element={<MultiAgentTeamPage />} />
      <Route path="/learn/word-pass" element={<WordPassPage />} />
      <Route path="/learn/grammar" element={<GrammarQuestPage />} />

      {/* WEG Economy */}
      <Route path="/weg" element={<WegHub />} />
      <Route path="/weg/xp" element={<XpPage />} />
      <Route path="/weg/levels" element={<LevelsPage />} />
      <Route path="/weg/balance" element={<BalancePage />} />
      <Route path="/weg/rewards" element={<RewardsPage />} />
      <Route path="/weg/shop" element={<ShopPage />} />

      {/* Jinghua */}
      <Route path="/jinghua" element={<QinghuaUniversityPage />} />
      <Route path="/jinghua/projects" element={<JinghuaProjects />} />
      <Route path="/jinghua/classroom" element={<JobClassroomPage />} />
      <Route path="/jinghua/chat" element={<JinghuaChat />} />
      <Route path="/jinghua/job-square" element={<JobSquarePage />} />

      {/* Competition Center */}
      <Route path="/competitions" element={<CompetitionHallPage />} />

      <Route path="/competitions/:id" element={<ErrorBoundary><CompetitionDetailPage /></ErrorBoundary>} />
      <Route path="/competitions/new" element={<CreateCompetitionPage />} />
      <Route path="/competitions/:id/submit" element={<SubmitPage />} />
      <Route path="/competitions/:id/challenge" element={<ErrorBoundary><ChallengePage /></ErrorBoundary>} />

      {/* 绿草地文学社 */}
      <Route path="/literature" element={<LiteraryClubHall />} />
      <Route path="/literature/write/:storyId" element={<LiteratureWritePage />} />
      <Route path="/literature/paper-short" element={<PaperShortWritePage />} />

      {/* WEG社区 */}
      <Route path="/community/creative-workshop" element={<CreativeWorkshopPage />} />
      <Route path="/community/sequence-test" element={<SequenceTestPage />} />
      <Route path="/community/math-speed" element={<MathSpeedTestPage />} />
      <Route path="/community/quiz/:type" element={<QuizChallengePage />} />
      <Route path="/community/brain-train" element={<BrainTrainPage />} />
      <Route path="/community/math-visual" element={<MathVisualPage />} />
      <Route path="/community/psych-test" element={<PsychologyTestPage />} />

      {/* System */}
      <Route path="/announcements" element={<SystemAnnouncementsPage />} />
      <Route path="/rules" element={<RulesPage />} />
      <Route path="/feedback" element={<FeedbackPage />} />
      <Route path="/settings/api-key" element={<ApiKeySettingsPage />} />
      <Route path="/notes" element={<NotesPage />} />

      {/* Admin */}
      <Route path="/admin/applications" element={<AdminApplications />} />
      <Route path="/admin/feedback" element={<AdminFeedback />} />
      <Route path="/admin/compensate" element={<AdminCompensate />} />
      <Route path="/admin/inspections" element={<AdminInspections />} />
      <Route path="/admin/listening-speaking" element={<ListeningSpeakingAdmin />} />
      <Route path="/admin/daily-english" element={<DailyEnglishAdmin />} />
      <Route path="/admin/job-square" element={<JobSquareAdmin />} />

      {/* Old-to-New Redirects */}
      <Route path="/word-cards" element={<Navigate to="/learn/word-cards" replace />} />
      <Route path="/listening-speaking" element={<Navigate to="/learn/listening-speaking" replace />} />
      <Route path="/english-daily" element={<Navigate to="/learn/english-daily" replace />} />
      <Route path="/reading-intensive" element={<Navigate to="/learn/reading-intensive" replace />} />
      <Route path="/classroom" element={<Navigate to="/learn/classroom" replace />} />

      <Route path="/balance" element={<Navigate to="/weg/balance" replace />} />
      <Route path="/job-square" element={<JobSquarePage />} />
      <Route path="/job-classroom" element={<JobClassroomPage />} />
      <Route path="/benefits" element={<Navigate to="/weg/rewards" replace />} />
      <Route path="/submit-result/:taskId" element={<ParamRedirect to="/competitions/:taskId/submit" />} />

      <Route path="/jinghua/mentors" element={<Navigate to="/jinghua" replace />} />
      <Route path="/jinghua/labs" element={<Navigate to="/jinghua/projects" replace />} />
      <Route path="/jinghua/agents" element={<Navigate to="/jinghua" replace />} />
      <Route path="/jinghua/library" element={<Navigate to="/jinghua" replace />} />
      <Route path="/jinghua/library/:bookId" element={<Navigate to="/jinghua" replace />} />
      <Route path="/create" element={<Navigate to="/" replace />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route path="/join" element={<Navigate to="/" replace />} />
      <Route path="/transactions" element={<Navigate to="/weg" replace />} />
      <Route path="/video-search" element={<Navigate to="/" replace />} />
      <Route path="/aigc-templates" element={<Navigate to="/learn/creative-workshop" replace />} />
      <Route path="/learn/creative-workshop" element={<Navigate to="/community/creative-workshop" replace />} />
      <Route path="/adopt" element={<AdoptPage />} />
      <Route path="/pet-chat/:petId" element={<PetChatPage />} />
      <Route path="/avatar-chat" element={<AvatarChatPage />} />

      {/* Grading */}
      <Route path="/grading" element={<GradingPage />} />

      {/* Tools */}
      <Route path="/tools/translator" element={<TranslatorPage />} />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
    </>
  )
}
