import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import CapabilityRoute from './CapabilityRoute'
import AppLayout from '@/layouts/AppLayout'
import AuthLayout from '@/layouts/AuthLayout'
import FullPageSpinner from '@/components/feedback/FullPageSpinner'
import { useNotificationRealtime } from '@/features/notifications/hooks/useNotificationRealtime'

const LoginPage = lazy(() => import('@/pages/auth/LoginPage'))
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('@/pages/auth/ResetPasswordPage'))
const DashboardPage = lazy(() => import('@/pages/dashboard/DashboardPage'))
const ProjectsPage = lazy(() => import('@/pages/projects/ProjectsPage'))
const ProjectDetailPage = lazy(() => import('@/pages/projects/ProjectDetailPage'))
const TasksPage = lazy(() => import('@/pages/tasks/TasksPage'))
const TaskDetailPage = lazy(() => import('@/pages/tasks/TaskDetailPage'))
const WorkloadPage = lazy(() => import('@/pages/workforce/WorkloadPage'))
const MemberWorkloadDetailPage = lazy(() => import('@/pages/workforce/MemberWorkloadDetailPage'))
const MembersPage = lazy(() => import('@/pages/members/MembersPage'))
const UserProfilePage = lazy(() => import('@/pages/members/UserProfilePage'))
const SettingsPage = lazy(() => import('@/pages/settings/SettingsPage'))
const NotificationsPage = lazy(() => import('@/pages/notifications/NotificationsPage'))
const NotFoundPage = lazy(() => import('@/pages/errors/NotFoundPage'))

function NotificationRealtimeBridge() {
  useNotificationRealtime()
  return null
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <NotificationRealtimeBridge />
      <Suspense fallback={<FullPageSpinner />}>
        <Routes>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route element={<CapabilityRoute capability="projects" />}>
                <Route path="/projects" element={<ProjectsPage />} />
                <Route path="/projects/:id" element={<ProjectDetailPage />} />
              </Route>
              <Route element={<CapabilityRoute capability="tasks" />}>
                <Route path="/tasks" element={<TasksPage />} />
                <Route path="/tasks/:id" element={<TaskDetailPage />} />
              </Route>
              <Route element={<CapabilityRoute capability="workload" />}>
                <Route path="/workforce" element={<WorkloadPage />} />
                <Route path="/workforce/members/:userId" element={<MemberWorkloadDetailPage />} />
              </Route>
              <Route path="/members" element={<MembersPage />} />
              <Route path="/users/:id" element={<UserProfilePage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
