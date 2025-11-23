import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { MainLayout } from './components/MainLayout'
import { LandingPage } from './pages/LandingPage'
import { CasesPage } from './pages/CasesPage'
import { CaseDetailPage } from './pages/CaseDetailPage'
import { CaseContactsPage } from './pages/CaseContactsPage'
import { CaseReportPage } from './pages/CaseReportPage'
import { ContactsPage } from './pages/ContactsPage'
import { Toaster } from './components/ui/sonner'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="/cases" replace />} />
          <Route path="landing" element={<LandingPage />} />
          <Route path="cases" element={<CasesPage />} />
          <Route path="cases/:id" element={<CaseDetailPage />} />
          <Route path="cases/:id/contacts" element={<CaseContactsPage />} />
          <Route path="cases/:id/report" element={<CaseReportPage />} />
          <Route path="contacts" element={<ContactsPage />} />
        </Route>
      </Routes>
      <Toaster />
    </BrowserRouter>
  )
}

export default App
