import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import Home from './pages/Home'
import { InstallPrompt, OfflineBanner, UpdateToast } from './pwa/PwaUi'

// Home ships in the main bundle; every other page loads on demand to keep first paint light.
const Story = lazy(() => import('./pages/Story'))
const Initiatives = lazy(() => import('./pages/Initiatives'))
const InitiativeDetail = lazy(() => import('./pages/InitiativeDetail'))
const Apply = lazy(() => import('./pages/Apply'))
const ApplyDone = lazy(() => import('./pages/ApplyDone'))
const Support = lazy(() => import('./pages/Support'))
const ThankYou = lazy(() => import('./pages/ThankYou'))
const Impact = lazy(() => import('./pages/Impact'))
const Media = lazy(() => import('./pages/Media'))
const GetInvolved = lazy(() => import('./pages/GetInvolved'))
const Privacy = lazy(() => import('./pages/Privacy'))
const Offline = lazy(() => import('./pages/Offline'))
const NotFound = lazy(() => import('./pages/NotFound'))
const Admin = lazy(() => import('./admin/Admin'))

function PageFallback() {
  return <div className="min-h-[60vh] grid place-items-center text-muted text-sm">Loading…</div>
}

export default function App() {
  return (
    <>
    <UpdateToast />
    <OfflineBanner />
    <InstallPrompt />
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route path="/admin/*" element={<Admin />} />
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="story" element={<Story />} />
          <Route path="initiatives" element={<Initiatives />} />
          <Route path="initiatives/:slug" element={<InitiativeDetail />} />
          <Route path="apply" element={<Apply />} />
          <Route path="apply/done" element={<ApplyDone />} />
          <Route path="support" element={<Support />} />
          <Route path="thank-you" element={<ThankYou />} />
          <Route path="impact" element={<Impact />} />
          <Route path="media" element={<Media />} />
          <Route path="get-involved" element={<GetInvolved />} />
          <Route path="privacy" element={<Privacy />} />
          <Route path="offline" element={<Offline />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
    </>
  )
}
