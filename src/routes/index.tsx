import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import AppLayout from '@/layouts/AppLayout'
import AuthLayout from '@/layouts/AuthLayout'
import FullPageSpinner from '@/components/feedback/FullPageSpinner'

const LoginPage = lazy(() => import('@/pages/auth/LoginPage'))
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('@/pages/auth/ResetPasswordPage'))
const DashboardPage = lazy(() => import('@/pages/dashboard/DashboardPage'))
const ProjectsPage = lazy(() => import('@/pages/projects/ProjectsPage'))
const ProjectDetailPage = lazy(() => import('@/pages/projects/ProjectDetailPage'))
const SprintBoardPage = lazy(() => import('@/pages/sprints/SprintBoardPage'))
const TasksPage = lazy(() => import('@/pages/tasks/TasksPage'))
const TaskDetailPage = lazy(() => import('@/pages/tasks/TaskDetailPage'))
const MyTimeLogsPage = lazy(() => import('@/pages/time-logs/MyTimeLogsPage'))
const WorkloadPage = lazy(() => import('@/pages/workforce/WorkloadPage'))
const SprintRiskPage = lazy(() => import('@/pages/workforce/SprintRiskPage'))
const MemberWorkloadDetailPage = lazy(() => import('@/pages/workforce/MemberWorkloadDetailPage'))
const MembersPage = lazy(() => import('@/pages/members/MembersPage'))
const UserProfilePage = lazy(() => import('@/pages/members/UserProfilePage'))
const SettingsPage = lazy(() => import('@/pages/settings/SettingsPage'))
const NotificationsPage = lazy(() => import('@/pages/notifications/NotificationsPage'))
const NotFoundPage = lazy(() => import('@/pages/errors/NotFoundPage'))

export default function AppRouter() {
  return (
    <BrowserRouter>
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
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/projects/:id" element={<ProjectDetailPage />} />
              <Route path="/sprints/:sprintId?" element={<SprintBoardPage />} />
              <Route path="/tasks" element={<TasksPage />} />
              <Route path="/tasks/:id" element={<TaskDetailPage />} />
              <Route path="/time-logs" element={<MyTimeLogsPage />} />
              <Route path="/workforce" element={<WorkloadPage />} />
              <Route path="/workforce/sprint-risk" element={<SprintRiskPage />} />
              <Route path="/workforce/members/:userId" element={<MemberWorkloadDetailPage />} />
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
