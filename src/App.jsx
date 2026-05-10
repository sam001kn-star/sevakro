import React from 'react';
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { useRoleManifest } from '@/hooks/useRoleManifest';
import { useReminderScheduler } from '@/hooks/useReminderScheduler';
import PageNotFound from './lib/PageNotFound';
import { CustomAuthProvider, useCustomAuth } from '@/lib/CustomAuthContext';
import AuthScreen from '@/components/auth/AuthScreen';
import StaffAuthScreen from '@/components/auth/StaffAuthScreen';
import DoctorAuthScreen from '@/components/auth/DoctorAuthScreen';

// Layouts
import UserLayout from '@/components/layout/UserLayout';

// User pages
import Home from '@/pages/Home';
import Bookings from '@/pages/Bookings';
import WalletPage from '@/pages/WalletPage';
import Profile from '@/pages/Profile';
import LocationSearch from '@/pages/LocationSearch';
import Doctors from '@/pages/Doctors';
import BookService from '@/pages/BookService';
import FamilyMembers from '@/pages/FamilyMembers';
import SavedAddresses from '@/pages/SavedAddresses';
import NotificationsPage from '@/pages/NotificationsPage';
import PrivacyPage from '@/pages/PrivacyPage';
import HelpPage from '@/pages/HelpPage';

// Staff & Doctor portals
import StaffPortal from '@/pages/staff/StaffPortal';
import DoctorPortal from '@/pages/doctor/DoctorPortal';

// Admin
import AdminDashboard from '@/pages/admin/AdminDashboard';
import VerifyEmail from '@/pages/VerifyEmail';

const AppRoutes = () => {
  const { user, isLoading } = useCustomAuth();
  const location = useLocation();
  useRoleManifest();
  useReminderScheduler(user?.role === 'admin');

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <p className="text-sm text-muted-foreground font-medium">PulseCare</p>
        </div>
      </div>
    );
  }

  const isStaffRoute = location.pathname === '/staff-portal';
  const isDoctorRoute = location.pathname === '/doctor-portal';

  // Allow email verification link to work even without login
  if (location.pathname === '/verify-email') return <VerifyEmail />;

  if (!user) {
    if (isStaffRoute) return <StaffAuthScreen />;
    if (isDoctorRoute) return <DoctorAuthScreen />;
    return <AuthScreen />;
  }

  // Role-based access: staff/doctor can only access their own portal
  if (isStaffRoute && user.role !== 'staff' && user.role !== 'admin') return <StaffAuthScreen />;
  if (isDoctorRoute && user.role !== 'doctor' && user.role !== 'admin') return <DoctorAuthScreen />;

  return (
    <Routes>
      {/* User Portal with bottom nav */}
      <Route element={<UserLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/bookings" element={<Bookings />} />
        <Route path="/wallet" element={<WalletPage />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      {/* Standalone pages (no bottom nav) */}
      <Route path="/location" element={<LocationSearch />} />
      <Route path="/doctors" element={<Doctors />} />
      <Route path="/book/:serviceId" element={<BookService />} />
      <Route path="/family" element={<FamilyMembers />} />
      <Route path="/addresses" element={<SavedAddresses />} />
      <Route path="/notifications" element={<NotificationsPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/help" element={<HelpPage />} />

      {/* Staff Portal */}
      <Route path="/staff-portal" element={<StaffPortal />} />

      {/* Doctor Portal */}
      <Route path="/doctor-portal" element={<DoctorPortal />} />

      {/* Admin Dashboard */}
      <Route path="/admin" element={<AdminDashboard />} />

      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <CustomAuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AppRoutes />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </CustomAuthProvider>
  );
}

export default App;