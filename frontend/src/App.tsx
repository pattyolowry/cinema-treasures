import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './layout/AppLayout';
import { CTCSTMScalePage } from './pages/ctcstm-scale';
import { LandingPage } from './pages/landing';
import { HistoryPage } from './pages/history';
import { TreasureTrovePage } from './pages/treasure-trove';
import { AwardsPage } from './pages/awards';
import { AboutPage } from './pages/about';
import { ScrollToTop } from './components/ScrollToTop';

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="treasure-trove" element={<TreasureTrovePage />} />
          <Route path="ctcstm-scale" element={<CTCSTMScalePage />} />
          <Route path="awards" element={<AwardsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
