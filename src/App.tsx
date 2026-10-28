/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { ProtectedRoute } from './components/auth/RouteGuards';
import { MainLayout } from './components/layout/MainLayout';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { StudentListPage } from './pages/admin/StudentListPage';
import { StudentProfilePage } from './pages/admin/StudentProfilePage';
import { ClassesSectionsPage } from './pages/admin/ClassesSectionsPage';
import { TeachersPage } from './pages/admin/TeachersPage';
import { AttendancePage } from './pages/admin/AttendancePage';
import { FeesPage } from './pages/admin/FeesPage';
import { TimetablePage } from './pages/admin/TimetablePage';
import { ExaminationsPage } from './pages/admin/ExaminationsPage';
import { HomeworkPage } from './pages/admin/HomeworkPage';
import { NoticesEventsPage } from './pages/admin/NoticesEventsPage';
import { LibraryPage } from './pages/admin/LibraryPage';
import { TransportPage } from './pages/admin/TransportPage';
import { LeaveRequestsPage } from './pages/admin/LeaveRequestsPage';
import { TicketsPage } from './pages/admin/TicketsPage';
import { ReportsPage } from './pages/admin/ReportsPage';
import { SettingsPage } from './pages/admin/SettingsPage';

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { StudentProfile } from './pages/student/StudentProfile';
import { StudentAttendance } from './pages/student/StudentAttendance';
import { StudentFees } from './pages/student/StudentFees';
import { StudentTimetable } from './pages/student/StudentTimetable';
import { StudentResults } from './pages/student/StudentResults';
import { StudentHomework } from './pages/student/StudentHomework';
import { StudentNotices } from './pages/student/StudentNotices';
import { StudentLibrary } from './pages/student/StudentLibrary';
import { StudentTransport } from './pages/student/StudentTransport';
import { StudentSupport } from './pages/student/StudentSupport';

const RootRedirect: React.FC = () => {
  const { currentUser, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B1020] text-white">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!currentUser) return <Navigate to="/login" replace />;
  if (currentUser.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/student/dashboard" replace />;
};

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Entry */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/" element={<RootRedirect />} />

              {/* Protected Admin Routes */}
              <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
                <Route element={<MainLayout />}>
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  <Route path="/admin/students" element={<StudentListPage />} />
                  <Route path="/admin/students/:id" element={<StudentProfilePage />} />
                  <Route path="/admin/classes" element={<ClassesSectionsPage />} />
                  <Route path="/admin/teachers" element={<TeachersPage />} />
                  <Route path="/admin/attendance" element={<AttendancePage />} />
                  <Route path="/admin/fees" element={<FeesPage />} />
                  <Route path="/admin/timetable" element={<TimetablePage />} />
                  <Route path="/admin/exams" element={<ExaminationsPage />} />
                  <Route path="/admin/homework" element={<HomeworkPage />} />
                  <Route path="/admin/notices" element={<NoticesEventsPage />} />
                  <Route path="/admin/events" element={<NoticesEventsPage />} />
                  <Route path="/admin/library" element={<LibraryPage />} />
                  <Route path="/admin/transport" element={<TransportPage />} />
                  <Route path="/admin/leaves" element={<LeaveRequestsPage />} />
                  <Route path="/admin/tickets" element={<TicketsPage />} />
                  <Route path="/admin/reports" element={<ReportsPage />} />
                  <Route path="/admin/settings" element={<SettingsPage />} />
                </Route>
              </Route>

              {/* Protected Student Routes */}
              <Route element={<ProtectedRoute allowedRoles={['STUDENT']} />}>
                <Route element={<MainLayout />}>
                  <Route path="/student/dashboard" element={<StudentDashboard />} />
                  <Route path="/student/profile" element={<StudentProfile />} />
                  <Route path="/student/attendance" element={<StudentAttendance />} />
                  <Route path="/student/fees" element={<StudentFees />} />
                  <Route path="/student/timetable" element={<StudentTimetable />} />
                  <Route path="/student/results" element={<StudentResults />} />
                  <Route path="/student/homework" element={<StudentHomework />} />
                  <Route path="/student/notices" element={<StudentNotices />} />
                  <Route path="/student/library" element={<StudentLibrary />} />
                  <Route path="/student/transport" element={<StudentTransport />} />
                  <Route path="/student/support" element={<StudentSupport />} />
                </Route>
              </Route>

              {/* Fallback */}
              <Route path="*" element={<RootRedirect />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
