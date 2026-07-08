import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import LoginPage from '../features/auth/pages/LoginPage';
import AttendancePage from '../features/attendance/pages/AttendancePage';
import LeavePage from '../features/leave/pages/LeavePage';
import PayrollPage from '../features/payroll/pages/PayrollPage';
import PerformancePage from '../features/performance/pages/PerformancePage';
import NotificationPage from '../features/notification/pages/NotificationPage';



import ProjectDashboard from '../features/projects/pages/ProjectDashboard';
import TaskDashboard from '../features/projects/pages/TaskDashboard';
import AssetDashboard from '../features/assets/pages/AssetDashboard';
import SupportCenter from '../features/helpdesk/pages/SupportCenter';
import TicketDetail from '../features/helpdesk/pages/TicketDetail';
import AnalyticsConsole from '../features/reports/pages/AnalyticsConsole';
import AIAssistantConsole from '../features/ai/pages/AIAssistantConsole';

// Employee & Recruitment Pages
import EmployeeDashboard from '../features/employee/pages/EmployeeDashboard';
import EmployeeList from '../features/employee/pages/EmployeeList';
import EmployeeDetails from '../features/employee/pages/EmployeeDetails';
import EmployeeForm from '../features/employee/pages/EmployeeForm';
import CandidateDashboard from '../features/recruitment/pages/CandidateDashboard';
import CandidateList from '../features/recruitment/pages/CandidateList';
import CandidateDetails from '../features/recruitment/pages/CandidateDetails';
import InterviewManagement from '../features/recruitment/pages/InterviewManagement';

// New Pages & Layouts
import DashboardLayout from '../components/layout/DashboardLayout';
import ProtectedRoute from '../components/layout/ProtectedRoute';
import ForgotPasswordPage from '../features/auth/pages/ForgotPasswordPage';
import ResetPasswordPage from '../features/auth/pages/ResetPasswordPage';
import ChangePasswordPage from '../features/auth/pages/ChangePasswordPage';
import UserProfilePage from '../features/employee/pages/UserProfilePage';
import OrganizationSettingsPage from '../features/organization/pages/OrganizationSettingsPage';
import DepartmentManagementPage from '../features/organization/pages/DepartmentManagementPage';
import DesignationManagementPage from '../features/organization/pages/DesignationManagementPage';
import SignupPage from '../features/auth/pages/SignupPage';
import HomeDashboard from '../features/dashboard/pages/HomeDashboard';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/signup',
    element: <SignupPage />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPasswordPage />,
  },
  {
    path: '/reset-password/:token',
    element: <ResetPasswordPage />,
  },
  {
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: '/',
        element: <HomeDashboard />,
      },
      {
        path: '/profile',
        element: <UserProfilePage />,
      },
      {
        path: '/change-password',
        element: <ChangePasswordPage />,
      },
      {
        path: '/attendance',
        element: (
          <ProtectedRoute allowedRoles={['SuperAdmin', 'HR', 'Employee']}>
            <AttendancePage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/leaves',
        element: (
          <ProtectedRoute allowedRoles={['SuperAdmin', 'HR', 'Manager', 'Employee']}>
            <LeavePage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/payroll',
        element: (
          <ProtectedRoute allowedRoles={['SuperAdmin', 'HR', 'Employee']}>
            <PayrollPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/performance',
        element: (
          <ProtectedRoute allowedRoles={['SuperAdmin', 'Manager', 'Employee']}>
            <PerformancePage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/notifications',
        element: <NotificationPage />,
      },
      {
        path: '/projects',
        element: (
          <ProtectedRoute allowedRoles={['SuperAdmin', 'OrgAdmin', 'HR', 'Manager', 'Employee']}>
            <ProjectDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: '/projects/:projectId/tasks',
        element: (
          <ProtectedRoute allowedRoles={['SuperAdmin', 'OrgAdmin', 'HR', 'Manager', 'Employee']}>
            <TaskDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: '/assets',
        element: (
          <ProtectedRoute allowedRoles={['SuperAdmin', 'OrgAdmin']}>
            <AssetDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: '/helpdesk',
        element: <SupportCenter />,
      },
      {
        path: '/helpdesk/tickets/:id',
        element: <TicketDetail />,
      },
      {
        path: '/reports',
        element: (
          <ProtectedRoute allowedRoles={['SuperAdmin', 'OrgAdmin', 'HR', 'Manager']}>
            <AnalyticsConsole />
          </ProtectedRoute>
        ),
      },
      {
        path: '/ai-assistant',
        element: <AIAssistantConsole />,
      },
      {
        path: '/employees',
        element: (
          <ProtectedRoute allowedRoles={['SuperAdmin', 'OrgAdmin', 'HR']}>
            <EmployeeDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: '/employees/directory',
        element: (
          <ProtectedRoute allowedRoles={['SuperAdmin', 'OrgAdmin', 'HR']}>
            <EmployeeList />
          </ProtectedRoute>
        ),
      },
      {
        path: '/employees/new',
        element: (
          <ProtectedRoute allowedRoles={['SuperAdmin', 'OrgAdmin', 'HR']}>
            <EmployeeForm />
          </ProtectedRoute>
        ),
      },
      {
        path: '/employees/edit/:id',
        element: (
          <ProtectedRoute allowedRoles={['SuperAdmin', 'OrgAdmin', 'HR']}>
            <EmployeeForm />
          </ProtectedRoute>
        ),
      },
      {
        path: '/employees/:id',
        element: (
          <ProtectedRoute allowedRoles={['SuperAdmin', 'OrgAdmin', 'HR']}>
            <EmployeeDetails />
          </ProtectedRoute>
        ),
      },
      {
        path: '/recruitment',
        element: (
          <ProtectedRoute allowedRoles={['SuperAdmin', 'OrgAdmin', 'HR', 'Manager']}>
            <CandidateDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: '/candidates',
        element: (
          <ProtectedRoute allowedRoles={['SuperAdmin', 'OrgAdmin', 'HR', 'Manager']}>
            <CandidateList />
          </ProtectedRoute>
        ),
      },
      {
        path: '/candidates/:id',
        element: (
          <ProtectedRoute allowedRoles={['SuperAdmin', 'OrgAdmin', 'HR', 'Manager']}>
            <CandidateDetails />
          </ProtectedRoute>
        ),
      },
      {
        path: '/interviews',
        element: (
          <ProtectedRoute allowedRoles={['SuperAdmin', 'OrgAdmin', 'HR', 'Manager']}>
            <InterviewManagement />
          </ProtectedRoute>
        ),
      },
      {
        path: '/organization/settings',
        element: (
          <ProtectedRoute allowedRoles={['SuperAdmin', 'OrgAdmin']}>
            <OrganizationSettingsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/organization/departments',
        element: (
          <ProtectedRoute allowedRoles={['SuperAdmin', 'OrgAdmin']}>
            <DepartmentManagementPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/organization/designations',
        element: (
          <ProtectedRoute allowedRoles={['SuperAdmin', 'OrgAdmin']}>
            <DesignationManagementPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);

export const AppRouter = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;

