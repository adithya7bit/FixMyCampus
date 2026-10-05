import { RequireAuth, RedirectIfAuthed } from "@/components/guards";
import { ThemeProvider } from "@/components/theme";
import { Toasts } from "@/components/ui";
import { AdminLayout } from "@/layouts/AdminLayout";
import { StudentLayout } from "@/layouts/StudentLayout";
import { StoreProvider, useStore } from "@/lib/store";
import { AdminDashboard } from "@/pages/admin/Dashboard";
import { AdminInbox } from "@/pages/admin/Inbox";
import { AdminMapPage, HygienePage, ReportsPage, SettingsPage, WorkersPage } from "@/pages/admin/Ops";
import { AdminReview } from "@/pages/admin/Review";
import { AdminLogin, ForgotPassword, StudentLogin, StudentSignup } from "@/pages/auth";
import { Landing } from "@/pages/Landing";
import { StudentHome, StudentList } from "@/pages/student/Dashboard";
import { StudentDetail } from "@/pages/student/Detail";
import { StudentMapPage, StudentNotifications, StudentProfile } from "@/pages/student/More";
import { Report } from "@/pages/student/Report";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

function Toaster() {
  const { toasts, dismissToast } = useStore();
  return <Toasts items={toasts} onDismiss={dismissToast} />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />

      <Route
        path="/student/login"
        element={
          <RedirectIfAuthed portal="student">
            <StudentLogin />
          </RedirectIfAuthed>
        }
      />
      <Route
        path="/student/signup"
        element={
          <RedirectIfAuthed portal="student">
            <StudentSignup />
          </RedirectIfAuthed>
        }
      />
      <Route path="/student/forgot-password" element={<ForgotPassword />} />
      <Route
        path="/admin/login"
        element={
          <RedirectIfAuthed portal="admin">
            <AdminLogin />
          </RedirectIfAuthed>
        }
      />

      <Route
        path="/student"
        element={
          <RequireAuth roles={["student"]}>
            <StudentLayout />
          </RequireAuth>
        }
      >
        <Route index element={<StudentHome />} />
        <Route path="complaints" element={<StudentList />} />
        <Route path="complaints/:id" element={<StudentDetail />} />
        <Route path="report" element={<Report />} />
        <Route path="map" element={<StudentMapPage />} />
        <Route path="profile" element={<StudentProfile />} />
        <Route path="notifications" element={<StudentNotifications />} />
      </Route>

      <Route
        path="/admin"
        element={
          <RequireAuth roles={["admin", "super_admin"]}>
            <AdminLayout />
          </RequireAuth>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="inbox" element={<AdminInbox />} />
        <Route path="inbox/:id" element={<AdminReview />} />
        <Route path="map" element={<AdminMapPage />} />
        <Route path="workers" element={<WorkersPage />} />
        <Route path="hygiene" element={<HygienePage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

import { AskAIWidget } from "@/components/AskAIWidget";

export default function App() {
  return (
    <ThemeProvider>
      <StoreProvider>
        <BrowserRouter>
          <AppRoutes />
          <AskAIWidget />
          <Toaster />
        </BrowserRouter>
      </StoreProvider>
    </ThemeProvider>
  );
}
