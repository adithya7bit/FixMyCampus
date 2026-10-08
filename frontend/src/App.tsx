import { RequireAuth, RedirectIfAuthed } from "@/components/guards";
import { ThemeProvider } from "@/components/theme";
import { Toasts } from "@/components/ui";
import { AdminLayout } from "@/layouts/AdminLayout";
import { StudentLayout } from "@/layouts/StudentLayout";
import { StoreProvider, useStore } from "@/lib/store";
import { AdminDashboard } from "@/pages/admin/Dashboard";
import { AdminInbox } from "@/pages/admin/Inbox";
import { AdminMapPage, SettingsPage } from "@/pages/admin/Ops";
import { OperationsPage } from "@/pages/admin/Operations";
import { TechniciansPage } from "@/pages/admin/Technicians";
import { AnalyticsPage } from "@/pages/admin/Analytics";
import { SLAManagementPage } from "@/pages/admin/SLA";
import { AdminNotificationsPage } from "@/pages/admin/Notifications";
import { AdminReview } from "@/pages/admin/Review";
import { PdfReport } from "@/pages/admin/PdfReport";
import { AdminLogin, ForgotPassword, StudentLogin, StudentSignup } from "@/pages/auth";
import { Landing } from "@/pages/Landing";
import { StudentHome, StudentList } from "@/pages/student/Dashboard";
import { StudentDetail } from "@/pages/student/Detail";
import { StudentMapPage, StudentNotifications, StudentProfile } from "@/pages/student/More";
import { CampusIssuesPage } from "@/pages/student/Issues";
import { StudentImpactPage } from "@/pages/student/Impact";
import { Report } from "@/pages/student/Report";
import { AskAIWidget } from "@/components/AskAIWidget";
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

      {/* Student Protected Routes (Section 52) */}
      <Route
        path="/student"
        element={
          <RequireAuth roles={["student"]}>
            <StudentLayout />
          </RequireAuth>
        }
      >
        <Route index element={<StudentHome />} />
        <Route path="report" element={<Report />} />
        <Route path="reports" element={<StudentList />} />
        <Route path="reports/:id" element={<StudentDetail />} />
        <Route path="complaints" element={<Navigate to="/student/reports" replace />} />
        <Route path="complaints/:id" element={<StudentDetail />} />
        <Route path="issues" element={<CampusIssuesPage />} />
        <Route path="map" element={<StudentMapPage />} />
        <Route path="notifications" element={<StudentNotifications />} />
        <Route path="impact" element={<StudentImpactPage />} />
        <Route path="profile" element={<StudentProfile />} />
      </Route>

      {/* Admin Protected Routes (Section 52) */}
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
        <Route path="inbox/:id/pdf" element={<PdfReport />} />
        <Route path="map" element={<AdminMapPage />} />
        <Route path="operations" element={<OperationsPage />} />
        <Route path="technicians" element={<TechniciansPage />} />
        <Route path="workers" element={<Navigate to="/admin/technicians" replace />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="reports" element={<Navigate to="/admin/analytics" replace />} />
        <Route path="sla" element={<SLAManagementPage />} />
        <Route path="notifications" element={<AdminNotificationsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

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
