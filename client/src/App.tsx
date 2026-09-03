import { Route, Routes } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import SectionPlaceholder from './components/layout/SectionPlaceholder';
import OverviewPage from './features/overview/OverviewPage';
import PaymentDetailPage from './features/payments/PaymentDetailPage';
import PaymentsPage from './features/payments/PaymentsPage';
import RecoveryAttemptsPage from './features/recovery-attempts/RecoveryAttemptsPage';

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
                <Route
                    path="ai-decisions"
                    element={<SectionPlaceholder title="AI Decisions" />}
                />
                <Route
                    path="analytics"
                    element={<SectionPlaceholder title="Analytics" />}
                />
                <Route
                    path="settings"
                    element={<SectionPlaceholder title="Settings" />}
                />
                <Route
                    path="*"
                    element={<SectionPlaceholder title="Not found" />}
                />
            </Route>
        </Routes>
    );
}
