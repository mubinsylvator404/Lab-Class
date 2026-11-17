/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { ToastContainer } from './components/common/ToastContainer';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import { AdminAnalyticsPage } from './pages/admin/AdminAnalyticsPage';
import { AdminApplicationsPage } from './pages/admin/AdminApplicationsPage';
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminProjectsPage } from './pages/admin/AdminProjectsPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { ClientApplicationsPage } from './pages/client/ClientApplicationsPage';
import { ClientDashboardPage } from './pages/client/ClientDashboardPage';
import { ClientProfilePage } from './pages/client/ClientProfilePage';
import { ClientProjectDetailPage } from './pages/client/ClientProjectDetailPage';
import { ClientProjectFormPage } from './pages/client/ClientProjectFormPage';
import { ClientProjectsPage } from './pages/client/ClientProjectsPage';
import { ClientRecommendedStudentsPage } from './pages/client/ClientRecommendedStudentsPage';
import { AboutPage } from './pages/public/AboutPage';
import { ExploreProjectsPage } from './pages/public/ExploreProjectsPage';
import { HowItWorksPage } from './pages/public/HowItWorksPage';
import { LandingPage } from './pages/public/LandingPage';
import { LoginPage } from './pages/public/LoginPage';
import { ProjectDetailPage } from './pages/public/ProjectDetailPage';
import { PublicClientProfilePage } from './pages/public/PublicClientProfilePage';
import { PublicStudentProfilePage } from './pages/public/PublicStudentProfilePage';
import { RegisterPage } from './pages/public/RegisterPage';
import { StudentApplicationsPage } from './pages/student/StudentApplicationsPage';
import { StudentBrowseProjectsPage } from './pages/student/StudentBrowseProjectsPage';
import { StudentDashboardPage } from './pages/student/StudentDashboardPage';
import { NotificationsPage } from './pages/student/StudentNotificationsPage';
import { StudentPortfolioPage } from './pages/student/StudentPortfolioPage';
import { StudentProfilePage } from './pages/student/StudentProfilePage';
import { StudentRecommendationsPage } from './pages/student/StudentRecommendationsPage';
import { AccountSettingsPage } from './pages/student/StudentSettingsPage';
import { StudentSkillsPage } from './pages/student/StudentSkillsPage';
import { ProtectedRoute } from './routes/ProtectedRoute';

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

export default function App() {
  return (
    <AppProvider>
      <AuthProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/explore" element={<ExploreProjectsPage />} />
            <Route path="/projects/:id" element={<ProjectDetailPage />} />
            <Route path="/students/:id" element={<PublicStudentProfilePage />} />
            <Route path="/clients/:id" element={<PublicClientProfilePage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Student Protected Routes */}
            <Route
              path="/student/dashboard"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/profile"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/skills"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentSkillsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/portfolio"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentPortfolioPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/browse"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentBrowseProjectsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/recommendations"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentRecommendationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/applications"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentApplicationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/notifications"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <NotificationsPage role="student" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/settings"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <AccountSettingsPage role="student" />
                </ProtectedRoute>
              }
            />

            {/* Client Protected Routes */}
            <Route
              path="/client/dashboard"
              element={
                <ProtectedRoute allowedRoles={['client']}>
                  <ClientDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/client/projects"
              element={
                <ProtectedRoute allowedRoles={['client']}>
                  <ClientProjectsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/client/projects/new"
              element={
                <ProtectedRoute allowedRoles={['client']}>
                  <ClientProjectFormPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/client/projects/:id/edit"
              element={
                <ProtectedRoute allowedRoles={['client']}>
                  <ClientProjectFormPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/client/projects/:id"
              element={
                <ProtectedRoute allowedRoles={['client']}>
                  <ClientProjectDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/client/applications"
              element={
                <ProtectedRoute allowedRoles={['client']}>
                  <ClientApplicationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/client/recommended-students"
              element={
                <ProtectedRoute allowedRoles={['client']}>
                  <ClientRecommendedStudentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/client/profile"
              element={
                <ProtectedRoute allowedRoles={['client']}>
                  <ClientProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/client/notifications"
              element={
                <ProtectedRoute allowedRoles={['client']}>
                  <NotificationsPage role="client" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/client/settings"
              element={
                <ProtectedRoute allowedRoles={['client']}>
                  <AccountSettingsPage role="client" />
                </ProtectedRoute>
              }
            />

            {/* Admin Protected Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminUsersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/projects"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminProjectsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/applications"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminApplicationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/categories"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminCategoriesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/analytics"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminAnalyticsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminSettingsPage />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <ToastContainer />
        </BrowserRouter>
      </AuthProvider>
    </AppProvider>
  );
}
