import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ReportProvider } from '@/store/reportStore'
import Layout from '@/components/Layout'
import Import from '@/pages/Import'
import Overview from '@/pages/Overview'
import Activity from '@/pages/Activity'
import Authors from '@/pages/Authors'
import Files from '@/pages/Files'
import Lines from '@/pages/Lines'
import Tags from '@/pages/Tags'

export default function App() {
  return (
    <ReportProvider>
      <BrowserRouter>
        <Routes>
          {/* Landing / import page — no sidebar */}
          <Route path="/import" element={<Import />} />

          {/* Analytics dashboard — requires a loaded report */}
          <Route element={<Layout />}>
            <Route index element={<Overview />} />
            <Route path="activity" element={<Activity />} />
            <Route path="authors" element={<Authors />} />
            <Route path="files" element={<Files />} />
            <Route path="lines" element={<Lines />} />
            <Route path="tags" element={<Tags />} />
          </Route>

          {/* Catch-all → import */}
          <Route path="*" element={<Navigate to="/import" replace />} />
        </Routes>
      </BrowserRouter>
    </ReportProvider>
  )
}
