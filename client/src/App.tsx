import { Route, Routes } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import SectionPlaceholder from './components/layout/SectionPlaceholder';
import AiDecisionsPage from './features/ai-decisions/AiDecisionsPage';
import AnalyticsPage from './features/analytics/AnalyticsPage';
import OverviewPage from './features/overview/OverviewPage';
import PaymentDetailPage from './features/payments/PaymentDetailPage';
import PaymentsPage from './features/payments/PaymentsPage';
import RecoveryAttemptsPage from './features/recovery-attempts/RecoveryAttemptsPage';
import SettingsPage from './features/settings/SettingsPage';

export default function App() {
    return (
        <Routes>
            <Route element={<AppShell />}>
                <Route index element={<OverviewPage />} />
                <Route
                    path="payments/:paymentId"
                    element={<PaymentDetailPage />}
                />
                <Route path="payments" element={<PaymentsPage />} />
                <Route
                    path="recovery-attempts"
                    element={<RecoveryAttemptsPage />}
                />
                <Route path="ai-decisions" element={<AiDecisionsPage />} />
                <Route path="analytics" element={<AnalyticsPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route
                    path="*"
                    element={<SectionPlaceholder title="Not found" />}
                />
            </Route>
        </Routes>
    );
}
