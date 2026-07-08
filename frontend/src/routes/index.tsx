import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoginPage from '../features/auth/pages/LoginPage';
import AttendancePage from '../features/attendance/pages/AttendancePage';
import LeavePage from '../features/leave/pages/LeavePage';
import PayrollPage from '../features/payroll/pages/PayrollPage';
import PerformancePage from '../features/performance/pages/PerformancePage';
import NotificationPage from '../features/notification/pages/NotificationPage';

import { Link } from 'react-router-dom';
import { Layers, Laptop, BookOpen, BarChart3, Bot, Users2, Briefcase, Clock, Calendar, DollarSign, Award, Bell } from 'lucide-react';

const HomePlaceholder = () => {
  const { user, logout, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 font-sans p-6 md:p-12 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-violet-600/10 blur-[120px] pointer-events-none" />

      <div className="max-w-4xl w-full text-center space-y-8 z-10">
        {/* User Profile / Logged In Info Bar */}
        {user && (
          <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl gap-4 text-left shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
                {user.name ? user.name.substring(0, 2).toUpperCase() : 'US'}
              </div>
              <div>
                <div className="text-slate-200 font-bold">{user.name}</div>
                <div className="text-slate-400 text-xs flex items-center gap-2">
                  <span>{user.email}</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    Role: {user.role}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={logout}
              className="py-1.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-xs rounded-xl transition-all active:scale-[0.98] cursor-pointer border border-slate-700 shadow-md"
            >
              Sign Out
            </button>
          </div>
        )}

        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-indigo-400 to-sky-400">
            Enterprise Workforce Platform
          </h1>
          <p className="text-slate-400 mt-2 text-sm max-w-xl mx-auto">
            Select any of the completed modules below to access project workspaces, device registries, support desks, and analytics consoles.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
          <Link
            to="/projects"
            className="p-6 bg-slate-900/40 border border-slate-800/80 rounded-2xl hover:border-violet-500/50 hover:bg-slate-900/60 transition-all duration-300 text-left group shadow-lg cursor-pointer"
          >
            <Layers className="text-violet-400 mb-4 group-hover:scale-110 transition-transform" size={28} />
            <h3 className="text-base font-bold text-slate-200 group-hover:text-violet-400 transition-colors">
              Project Dashboard
            </h3>
            <p className="text-slate-400 text-xs mt-2 leading-relaxed">
              Manage workspaces, configure sprint timelines, and view the interactive Kanban Board.
            </p>
          </Link>

          <Link
            to="/assets"
            className="p-6 bg-slate-900/40 border border-slate-800/80 rounded-2xl hover:border-sky-500/50 hover:bg-slate-900/60 transition-all duration-300 text-left group shadow-lg cursor-pointer"
          >
            <Laptop className="text-sky-400 mb-4 group-hover:scale-110 transition-transform" size={28} />
            <h3 className="text-base font-bold text-slate-200 group-hover:text-sky-400 transition-colors">
              Asset Registry
            </h3>
            <p className="text-slate-400 text-xs mt-2 leading-relaxed">
              Track organization inventory items, allocate hardware to staff, and process device returns.
            </p>
          </Link>

          <Link
            to="/helpdesk"
            className="p-6 bg-slate-900/40 border border-slate-800/80 rounded-2xl hover:border-emerald-500/50 hover:bg-slate-900/60 transition-all duration-300 text-left group shadow-lg cursor-pointer"
          >
            <BookOpen className="text-emerald-400 mb-4 group-hover:scale-110 transition-transform" size={28} />
            <h3 className="text-base font-bold text-slate-200 group-hover:text-emerald-400 transition-colors">
              Support Center
            </h3>
            <p className="text-slate-400 text-xs mt-2 leading-relaxed">
              Raise IT and HR support requests, check ticket details, and update assignment status.
            </p>
          </Link>

          <Link
            to="/reports"
            className="p-6 bg-slate-900/40 border border-slate-800/80 rounded-2xl hover:border-amber-500/50 hover:bg-slate-900/60 transition-all duration-300 text-left group shadow-lg cursor-pointer"
          >
            <BarChart3 className="text-amber-400 mb-4 group-hover:scale-110 transition-transform" size={28} />
            <h3 className="text-base font-bold text-slate-200 group-hover:text-amber-400 transition-colors">
              Analytics Console
            </h3>
            <p className="text-slate-400 text-xs mt-2 leading-relaxed">
              View aggregate metric summaries and review responsive SVG visual charts.
            </p>
          </Link>

          <Link
            to="/ai-assistant"
            className="p-6 bg-slate-900/40 border border-slate-800/80 rounded-2xl hover:border-pink-500/50 hover:bg-slate-900/60 transition-all duration-300 text-left group shadow-lg cursor-pointer"
          >
            <Bot className="text-pink-400 mb-4 group-hover:scale-110 transition-transform" size={28} />
            <h3 className="text-base font-bold text-slate-200 group-hover:text-pink-400 transition-colors">
              AI Operations
            </h3>
            <p className="text-slate-400 text-xs mt-2 leading-relaxed">
              Access the chat assistant, policy vector search queries, and resume match analyzer.
            </p>
          </Link>

          <Link
            to="/employees"
            className="p-6 bg-slate-900/40 border border-slate-800/80 rounded-2xl hover:border-indigo-500/50 hover:bg-slate-900/60 transition-all duration-300 text-left group shadow-lg cursor-pointer"
          >
            <Users2 className="text-indigo-400 mb-4 group-hover:scale-110 transition-transform" size={28} />
            <h3 className="text-base font-bold text-slate-200 group-hover:text-indigo-400 transition-colors">
              Employee Directory
            </h3>
            <p className="text-slate-400 text-xs mt-2 leading-relaxed">
              Onboard new employees, manage active directories, shifts, managers, and career timelines.
            </p>
          </Link>

          <Link
            to="/recruitment"
            className="p-6 bg-slate-900/40 border border-slate-800/80 rounded-2xl hover:border-rose-500/50 hover:bg-slate-900/60 transition-all duration-300 text-left group shadow-lg cursor-pointer"
          >
            <Briefcase className="text-rose-400 mb-4 group-hover:scale-110 transition-transform" size={28} />
            <h3 className="text-base font-bold text-slate-200 group-hover:text-rose-400 transition-colors">
              Recruitment Board
            </h3>
            <p className="text-slate-400 text-xs mt-2 leading-relaxed">
              Track candidates, schedule interview rounds, score feedback panels, and convert candidates.
            </p>
          </Link>

          <Link
            to="/attendance"
            className="p-6 bg-slate-900/40 border border-slate-800/80 rounded-2xl hover:border-indigo-500/50 hover:bg-slate-900/60 transition-all duration-300 text-left group shadow-lg cursor-pointer"
          >
            <Clock className="text-indigo-400 mb-4 group-hover:scale-110 transition-transform" size={28} />
            <h3 className="text-base font-bold text-slate-200 group-hover:text-indigo-400 transition-colors">
              Attendance Dashboard
            </h3>
            <p className="text-slate-400 text-xs mt-2 leading-relaxed">
              Clock in/out with coordinates geofencing, track active shifts, and request log corrections.
            </p>
          </Link>

          <Link
            to="/leaves"
            className="p-6 bg-slate-900/40 border border-slate-800/80 rounded-2xl hover:border-amber-500/50 hover:bg-slate-900/60 transition-all duration-300 text-left group shadow-lg cursor-pointer"
          >
            <Calendar className="text-amber-400 mb-4 group-hover:scale-110 transition-transform" size={28} />
            <h3 className="text-base font-bold text-slate-200 group-hover:text-amber-400 transition-colors">
              Leave Center
            </h3>
            <p className="text-slate-400 text-xs mt-2 leading-relaxed">
              Apply for vacations, monitor Casual/Sick/Earned balances, and review team approval requests.
            </p>
          </Link>

          <Link
            to="/payroll"
            className="p-6 bg-slate-900/40 border border-slate-800/80 rounded-2xl hover:border-emerald-500/50 hover:bg-slate-900/60 transition-all duration-300 text-left group shadow-lg cursor-pointer"
          >
            <DollarSign className="text-emerald-400 mb-4 group-hover:scale-110 transition-transform" size={28} />
            <h3 className="text-base font-bold text-slate-200 group-hover:text-emerald-400 transition-colors">
              Payroll Hub
            </h3>
            <p className="text-slate-400 text-xs mt-2 leading-relaxed">
              Verify monthly payslips history, configure employee base compensation, and process calculations.
            </p>
          </Link>

          <Link
            to="/performance"
            className="p-6 bg-slate-900/40 border border-slate-800/80 rounded-2xl hover:border-violet-500/50 hover:bg-slate-900/60 transition-all duration-300 text-left group shadow-lg cursor-pointer"
          >
            <Award className="text-violet-400 mb-4 group-hover:scale-110 transition-transform" size={28} />
            <h3 className="text-base font-bold text-slate-200 group-hover:text-violet-400 transition-colors">
              Performance Hub
            </h3>
            <p className="text-slate-400 text-xs mt-2 leading-relaxed">
              Track target milestone OKRs, submit appraisals evaluations, and sign-off feedback logs.
            </p>
          </Link>

          <Link
            to="/notifications"
            className="p-6 bg-slate-900/40 border border-slate-800/80 rounded-2xl hover:border-pink-500/50 hover:bg-slate-900/60 transition-all duration-300 text-left group shadow-lg cursor-pointer"
          >
            <Bell className="text-pink-400 mb-4 group-hover:scale-110 transition-transform" size={28} />
            <h3 className="text-base font-bold text-slate-200 group-hover:text-pink-400 transition-colors">
              Notifications Center
            </h3>
            <p className="text-slate-400 text-xs mt-2 leading-relaxed">
              View system alerts, check unread message notifications, and clear inbox logs.
            </p>
          </Link>
        </div>

        <div className="pt-8 border-t border-slate-800/80 flex flex-wrap justify-center gap-2">
          <span className="px-2.5 py-1 text-xs font-semibold bg-slate-900 text-slate-400 rounded-lg border border-slate-800">Vite</span>
          <span className="px-2.5 py-1 text-xs font-semibold bg-slate-900 text-slate-400 rounded-lg border border-slate-800">React 19</span>
          <span className="px-2.5 py-1 text-xs font-semibold bg-slate-900 text-slate-400 rounded-lg border border-slate-800">Tailwind</span>
          <span className="px-2.5 py-1 text-xs font-semibold bg-slate-900 text-slate-400 rounded-lg border border-slate-800">TypeScript</span>
        </div>
      </div>
    </div>
  );
};

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

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
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
        element: <HomePlaceholder />,
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
        element: <AttendancePage />,
      },
      {
        path: '/leaves',
        element: <LeavePage />,
      },
      {
        path: '/payroll',
        element: <PayrollPage />,
      },
      {
        path: '/performance',
        element: <PerformancePage />,
      },
      {
        path: '/notifications',
        element: <NotificationPage />,
      },
      {
        path: '/projects',
        element: <ProjectDashboard />,
      },
      {
        path: '/projects/:projectId/tasks',
        element: <TaskDashboard />,
      },
      {
        path: '/assets',
        element: <AssetDashboard />,
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
        element: <AnalyticsConsole />,
      },
      {
        path: '/ai-assistant',
        element: <AIAssistantConsole />,
      },
      {
        path: '/employees',
        element: <EmployeeDashboard />,
      },
      {
        path: '/employees/directory',
        element: <EmployeeList />,
      },
      {
        path: '/employees/new',
        element: <EmployeeForm />,
      },
      {
        path: '/employees/edit/:id',
        element: <EmployeeForm />,
      },
      {
        path: '/employees/:id',
        element: <EmployeeDetails />,
      },
      {
        path: '/recruitment',
        element: <CandidateDashboard />,
      },
      {
        path: '/candidates',
        element: <CandidateList />,
      },
      {
        path: '/candidates/:id',
        element: <CandidateDetails />,
      },
      {
        path: '/interviews',
        element: <InterviewManagement />,
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

