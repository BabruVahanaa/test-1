import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SettingsProvider } from './contexts/SettingsContext';
import { EventProvider } from './contexts/EventContext';
import { StorefrontProvider } from './contexts/StorefrontContext';
import { CustomerProvider } from './contexts/CustomerContext'; // New import
import MainLayout from './components/layout/MainLayout';
import DashboardPage from './pages/DashboardPage';
import SchedulePage from './pages/SchedulePage';
import EventsPage from './pages/EventsPage';
import CustomersPage from './pages/CustomersPage';
import BundlesPage from './pages/BundlesPage';
import MembershipsPage from './pages/MembershipsPage';
import StorefrontPage from './pages/StorefrontPage';
import PublicStorefrontPage from './pages/PublicStorefrontPage';
import PaymentsPage from './pages/PaymentsPage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import AccountsPage from './pages/AccountsPage';

const App: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

    const AuthenticatedApp = () => (
        <MainLayout>
            <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/schedule" element={<SchedulePage />} />
                <Route path="/events" element={<EventsPage />} />
                <Route path="/customers" element={<CustomersPage />} />
                <Route path="/bundles" element={<BundlesPage />} />
                <Route path="/memberships" element={<MembershipsPage />} />
                <Route path="/storefront" element={<StorefrontPage />} />
                <Route path="/payments" element={<PaymentsPage />} />
                <Route path="/accounts" element={<AccountsPage />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
        </MainLayout>
    );

    return (
        <HashRouter>
            <SettingsProvider>
                <StorefrontProvider>
                    <EventProvider>
                        <CustomerProvider> {/* New Provider */}
                            <Routes>
                                <Route path="/store/:slug" element={<PublicStorefrontPage />} />
                                {isAuthenticated ? (
                                    <Route path="/*" element={<AuthenticatedApp />} />
                                ) : (
                                    <>
                                        <Route path="/login" element={<LoginPage onLogin={() => setIsAuthenticated(true)} />} />
                                        <Route path="/signup" element={<SignUpPage onSignUp={() => setIsAuthenticated(true)} />} />
                                        <Route path="*" element={<Navigate to="/login" replace />} />
                                    </>
                                )}
                            </Routes>
                        </CustomerProvider>
                    </EventProvider>
                </StorefrontProvider>
            </SettingsProvider>
        </HashRouter>
    );
};

export default App;