import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import { Link } from 'react-router-dom';
import { Layers, Laptop, BookOpen, BarChart3, Bot, Users2, Briefcase } from 'lucide-react';

const HomePlaceholder = () => {
  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 font-sans p-6 md:p-12 flex flex-col items-center justify-center">
      <div className="max-w-4xl w-full text-center space-y-8">
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

export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePlaceholder />,
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
]);

export const AppRouter = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;
