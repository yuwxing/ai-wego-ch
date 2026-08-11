import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import FolderView from './pages/FolderView'
import UnitView from './pages/UnitView'
import ReviewCenter from './pages/ReviewCenter'
import Search from './pages/Search'

export default function App() {
  return (
    <BrowserRouter>
      <div style={{
        minHeight: '100vh', background: '#f8fafc', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/grade/:gradeId" element={<FolderView />} />
          <Route path="/grade/:gradeId/unit/:unitId" element={<UnitView />} />
          <Route path="/review" element={<ReviewCenter />} />
          <Route path="/search" element={<Search />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
