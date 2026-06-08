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
import CompetitionDetailPage from './pages/CompetitionDetailPage'
import CreateCompetitionPage from './pages/CreateCompetitionPage'

import SubmitPage from './pages/SubmitPage'
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
import QuizChallengePage from './pages/QuizChallengePage'

import LiteraryClubHall from './pages/literature/LiteraryClubHall'
import LiteratureWritePage from './pages/literature/LiteratureWritePage'
import PaperShortWritePage from './pages/literature/PaperShortWritePage'
import NotFound from './pages/NotFound'

function ParamRedirect({ to }: { to: string }) {
  const params = useParams();
  let resolved = to;
  for (const [key, value] of Object.entries(params)) {
    resolved = resolved.replace(`:${key}`, value || '');
  }
  return <Navigate to={resolved} replace />;
}

export default function App() {
  return (
    <>
    <PetWidget />
    <Routes>
      {/* Home */}
      <Route path="/" element={<Home />} />

      {/* Learning System */}
      <Route path="/learn" element={<LearnHub />} />
      <Route path="/learn/word-cards" element={<WordCardPage />} />
      <Route path="/learn/listening-speaking" element={<ListeningSpeakingPage />} />
      <Route path="/learn/english-daily" element={<EnglishDailyPage />} />
      <Route path="/learn/reading-intensive" element={<ReadingIntensivePage />} />
      <Route path="/learn/classroom" element={<AIClassroomPage />} />
      <Route path="/learn/competitions" element={<LearnCompetitions />} />
      <Route path="/learn/online-classroom" element={<OnlineClassroom />} />
      <Route path="/learn/creative-workshop" element={<CreativeWorkshopPage />} />
      <Route path="/learn/writing" element={<WritingGrowthPage />} />
      <Route path="/learn/teacher" element={<DigitalTeacherPage />} />
      <Route path="/learn/robot" element={<RobotPage />} />
      <Route path="/learn/garden" element={<GardenPage />} />

      {/* WEG Economy */}
      <Route path="/weg" element={<WegHub />} />
      <Route path="/weg/xp" element={<XpPage />} />
      <Route path="/weg/levels" element={<LevelsPage />} />
      <Route path="/weg/balance" element={<BalancePage />} />
      <Route path="/weg/rewards" element={<RewardsPage />} />

      {/* Jinghua */}
      <Route path="/jinghua" element={<QinghuaUniversityPage />} />
      <Route path="/jinghua/projects" element={<JinghuaProjects />} />
      <Route path="/jinghua/classroom" element={<JobClassroomPage />} />
      <Route path="/jinghua/chat" element={<JinghuaChat />} />
      <Route path="/jinghua/job-square" element={<JobSquarePage />} />

      {/* Competition Center */}
      <Route path="/competitions" element={<CompetitionHallPage />} />

      <Route path="/competitions/:id" element={<CompetitionDetailPage />} />
      <Route path="/competitions/new" element={<CreateCompetitionPage />} />
      <Route path="/competitions/:id/submit" element={<SubmitPage />} />

      {/* 绿草地文学社 */}
      <Route path="/literature" element={<LiteraryClubHall />} />
      <Route path="/literature/write/:storyId" element={<LiteratureWritePage />} />
      <Route path="/literature/paper-short" element={<PaperShortWritePage />} />

      {/* WEG社区 */}
      <Route path="/community/creative-workshop" element={<CreativeWorkshopPage />} />
      <Route path="/community/sequence-test" element={<SequenceTestPage />} />
      <Route path="/community/math-speed" element={<MathSpeedTestPage />} />
      <Route path="/community/quiz/:type" element={<QuizChallengePage />} />

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

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
    </>
  )
}
