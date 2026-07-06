
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

// Basic landing placeholder
const HomePlaceholder = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-900 font-sans p-6">
      <div className="max-w-md w-full text-center space-y-4 bg-white p-8 rounded-xl shadow-md border border-gray-100">
        <h1 className="text-3xl font-extrabold tracking-tight text-indigo-600">Enterprise WFM</h1>
        <p className="text-gray-600">
          This is the root routing setup. Scaffolded feature modules will plug here.
        </p>
        <div className="pt-4 border-t border-gray-100 flex flex-wrap justify-center gap-2">
          <span className="px-2 py-1 text-xs font-semibold bg-indigo-50 text-indigo-700 rounded-md">Vite</span>
          <span className="px-2 py-1 text-xs font-semibold bg-blue-50 text-blue-700 rounded-md">React 19</span>
          <span className="px-2 py-1 text-xs font-semibold bg-sky-50 text-sky-700 rounded-md">Tailwind</span>
          <span className="px-2 py-1 text-xs font-semibold bg-violet-50 text-violet-700 rounded-md">TypeScript</span>
        </div>
      </div>
    </div>
  );
};

import ProjectDashboard from '../features/projects/pages/ProjectDashboard';
import TaskDashboard from '../features/projects/pages/TaskDashboard';

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
  // Feature page paths will be registered here.
]);

export const AppRouter = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;
