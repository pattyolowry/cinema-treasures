import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './layout/AppLayout';
import { CTCSTMScalePage } from './pages/ctcstm-scale';
import { LandingPage } from './pages/landing';
import { HistoryPage } from './pages/history';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<LandingPage />} />
        <Route path="history" element={<HistoryPage />} />
        <Route path="ctcstm-scale" element={<CTCSTMScalePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
