import { lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "../components/layout/AppLayout";
const LoginPage = lazy(() =>
  import("../pages/auth/LoginPage").then((module) => ({
    default: module.LoginPage,
  })),
);
const DashboardPage = lazy(() =>
  import("../pages/dashboard/DashboardPage").then((module) => ({
    default: module.DashboardPage,
  })),
);
const TasksPage = lazy(() =>
  import("../pages/tasks/TasksPage").then((module) => ({
    default: module.TasksPage,
  })),
);
const TaskFormPage = lazy(() =>
  import("../pages/tasks/TaskFormPage").then((module) => ({
    default: module.TaskFormPage,
  })),
);
const TaskDetailPage = lazy(() =>
  import("../pages/tasks/TaskDetailPage").then((module) => ({
    default: module.TaskDetailPage,
  })),
);
const TouristAttentionPage = lazy(() =>
  import("../pages/tourists/TouristAttentionPage").then((module) => ({
    default: module.TouristAttentionPage,
  })),
);
const TouristAttentionFormPage = lazy(() =>
  import("../pages/tourists/TouristAttentionFormPage").then((module) => ({
    default: module.TouristAttentionFormPage,
  })),
);
const TouristAttentionDetailPage = lazy(() =>
  import("../pages/tourists/TouristAttentionDetailPage").then((module) => ({
    default: module.TouristAttentionDetailPage,
  })),
);
const MaintenancePage = lazy(() =>
  import("../pages/maintenance/MaintenancePage").then((module) => ({
    default: module.MaintenancePage,
  })),
);
const MaintenanceFormPage = lazy(() =>
  import("../pages/maintenance/MaintenanceFormPage").then((module) => ({
    default: module.MaintenanceFormPage,
  })),
);
const MaintenanceDetailPage = lazy(() =>
  import("../pages/maintenance/MaintenanceDetailPage").then((module) => ({
    default: module.MaintenanceDetailPage,
  })),
);
const HeritagePage = lazy(() =>
  import("../pages/heritage/HeritagePage").then((module) => ({
    default: module.HeritagePage,
  })),
);
const HeritageFormPage = lazy(() =>
  import("../pages/heritage/HeritageFormPage").then((module) => ({
    default: module.HeritageFormPage,
  })),
);
const HeritageDetailPage = lazy(() =>
  import("../pages/heritage/HeritageDetailPage").then((module) => ({
    default: module.HeritageDetailPage,
  })),
);
const SpeciesPage = lazy(() =>
  import("../pages/species/SpeciesPage").then((module) => ({
    default: module.SpeciesPage,
  })),
);
const SpeciesFormPage = lazy(() =>
  import("../pages/species/SpeciesFormPage").then((module) => ({
    default: module.SpeciesFormPage,
  })),
);
const SpeciesDetailPage = lazy(() =>
  import("../pages/species/SpeciesDetailPage").then((module) => ({
    default: module.SpeciesDetailPage,
  })),
);
const WellMonitoringPage = lazy(() =>
  import("../pages/well/WellMonitoringPage").then((module) => ({
    default: module.WellMonitoringPage,
  })),
);
const ReportsPage = lazy(() =>
  import("../pages/reports/ReportsPage").then((module) => ({
    default: module.ReportsPage,
  })),
);
const ProfilePage = lazy(() =>
  import("../pages/profile/ProfilePage").then((module) => ({
    default: module.ProfilePage,
  })),
);
const UnauthorizedPage = lazy(() =>
  import("../pages/system/UnauthorizedPage").then((module) => ({
    default: module.UnauthorizedPage,
  })),
);
const NotFoundPage = lazy(() =>
  import("../pages/system/NotFoundPage").then((module) => ({
    default: module.NotFoundPage,
  })),
);
import { ProtectedRoute } from "./ProtectedRoute";
import { useAuth } from "../hooks/useAuth";
const GuideDashboardPage = lazy(() =>
  import("../pages/dashboard/GuideDashboardPage").then((module) => ({
    default: module.GuideDashboardPage,
  })),
);

function DashboardEntryPage() {
  const { can } = useAuth();
  return can("tour.view") ? <GuideDashboardPage /> : <DashboardPage />;
}

function IncidentEntryPage() {
  const { can } = useAuth();
  return can("incident.view_own") ? (
    <GuideDashboardPage section="incidents" />
  ) : (
    <DashboardPage section="incidents" />
  );
}

function TouristListEntryPage() {
  const { can } = useAuth();
  return can("visitor_group.view") ? (
    <GuideDashboardPage section="visitors" />
  ) : (
    <TouristAttentionPage />
  );
}

function TouristCreateEntryPage() {
  const { can } = useAuth();
  return can("visitor_group.create") ? (
    <GuideDashboardPage section="visitors" />
  ) : (
    <TouristAttentionFormPage />
  );
}

function TouristDetailEntryPage() {
  const { can } = useAuth();
  return can("visitor_group.view") ? (
    <GuideDashboardPage section="visitors" />
  ) : (
    <TouristAttentionDetailPage />
  );
}

function TouristEditEntryPage() {
  const { can } = useAuth();
  return can("visitor_group.update_own") ? (
    <GuideDashboardPage section="visitors" />
  ) : (
    <TouristAttentionFormPage />
  );
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute permission="dashboard.view">
                <DashboardEntryPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/tours"
            element={
              <ProtectedRoute permission="tour.view">
                <GuideDashboardPage section="tours" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/visitors"
            element={
              <ProtectedRoute permission="visitor_group.view">
                <GuideDashboardPage section="visitors" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/park-info"
            element={
              <ProtectedRoute permission="park_info.view">
                <GuideDashboardPage section="info" />
              </ProtectedRoute>
            }
          />

          <Route
            path="/tasks"
            element={
              <ProtectedRoute permission="task.view">
                <TasksPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tasks/new"
            element={
              <ProtectedRoute permission="task.create">
                <TaskFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tasks/:id"
            element={
              <ProtectedRoute permission="task.view">
                <TaskDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tasks/:id/edit"
            element={
              <ProtectedRoute permission="task.edit">
                <TaskFormPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/tourists"
            element={
              <ProtectedRoute permission="tourist.view">
                <TouristListEntryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tourists/new"
            element={
              <ProtectedRoute permission="tourist.create">
                <TouristCreateEntryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tourists/:id"
            element={
              <ProtectedRoute permission="tourist.view">
                <TouristDetailEntryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tourists/:id/edit"
            element={
              <ProtectedRoute
                permissions={["tourist.edit", "tourist.update_own"]}
              >
                <TouristEditEntryPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/maintenance"
            element={
              <ProtectedRoute permission="maintenance.view">
                <MaintenancePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/maintenance/new"
            element={
              <ProtectedRoute permission="maintenance.create">
                <MaintenanceFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/maintenance/:id"
            element={
              <ProtectedRoute permission="maintenance.view">
                <MaintenanceDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/maintenance/:id/edit"
            element={
              <ProtectedRoute permission="maintenance.edit">
                <MaintenanceFormPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/heritage"
            element={
              <ProtectedRoute permission="heritage.view">
                <HeritagePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/heritage/new"
            element={
              <ProtectedRoute permission="heritage.create">
                <HeritageFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/heritage/:id"
            element={
              <ProtectedRoute permission="heritage.view">
                <HeritageDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/heritage/:id/edit"
            element={
              <ProtectedRoute permission="heritage.edit">
                <HeritageFormPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/species"
            element={
              <ProtectedRoute permission="species.view">
                <SpeciesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/species/new"
            element={
              <ProtectedRoute permission="species.create">
                <SpeciesFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/species/:id"
            element={
              <ProtectedRoute permission="species.view">
                <SpeciesDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/species/:id/edit"
            element={
              <ProtectedRoute permission="species.edit">
                <SpeciesFormPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/well-monitoring"
            element={
              <ProtectedRoute permission="well.view">
                <WellMonitoringPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute permission="reports.view">
                <ReportsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/incidents"
            element={
              <ProtectedRoute
                permissions={["incident.view", "incident.view_own"]}
              >
                <IncidentEntryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute permission="users.view">
                <DashboardPage section="users" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <ProtectedRoute permissions={["chat.group", "chat.direct_admin"]}>
                <DashboardPage section="chat" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute permission="profile.view">
                <ProfilePage />
              </ProtectedRoute>
            }
          />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
