import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import AttendancePage from '../features/attendance/pages/AttendancePage';
import LeavePage from '../features/leave/pages/LeavePage';

// Basic landing placeholder
const HomePlaceholder = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-gray-100 font-sans p-6">
      <div className="max-w-md w-full text-center space-y-4 bg-slate-900 p-8 rounded-xl shadow-md border border-slate-800">
        <h1 className="text-3xl font-extrabold tracking-tight text-indigo-500">Enterprise WFM</h1>
        <p className="text-slate-400">
          This is the root routing setup. Scaffolded feature modules will plug here.
        </p>
        <div className="pt-4 border-t border-slate-800 flex flex-wrap justify-center gap-2">
          <span className="px-2 py-1 text-xs font-semibold bg-indigo-950 text-indigo-400 rounded-md">Vite</span>
          <span className="px-2 py-1 text-xs font-semibold bg-blue-950 text-blue-400 rounded-md">React 19</span>
          <span className="px-2 py-1 text-xs font-semibold bg-sky-950 text-sky-400 rounded-md">Tailwind</span>
          <span className="px-2 py-1 text-xs font-semibold bg-violet-950 text-violet-400 rounded-md">TypeScript</span>
        </div>
        <div className="pt-4 flex flex-col gap-2">
          <a
            href="/attendance"
            className="px-4 py-2 bg-indigo-650 hover:bg-indigo-650/80 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            Go to Attendance Dashboard
          </a>
          <a
            href="/leaves"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            Go to Leave Center
          </a>
        </div>
      </div>
    </div>
  );
};

export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePlaceholder />,
  },
  {
    path: '/attendance',
    element: <AttendancePage />,
  },
  {
    path: '/leaves',
    element: <LeavePage />,
  },
  // Feature page paths will be registered here.
]);

export const AppRouter = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;
