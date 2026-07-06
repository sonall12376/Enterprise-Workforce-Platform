import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { useTasks } from '../hooks/useTasks';
import { projectService } from '../services/projectService';
import { sprintService } from '../services/sprintService';
import { Project } from '../types/projectTypes';
import { Task, Sprint } from '../types/taskTypes';
import { TaskForm } from '../components/TaskForm';
import { Plus, Search, Filter, ShieldAlert, ArrowLeft, Calendar, Edit, Trash2, Loader2, Flame, X } from 'lucide-react';

export const TaskDashboard: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { user, login } = useAuth();

  const [project, setProject] = useState<Project | null>(null);
  const [projectLoading, setProjectLoading] = useState(true);

  // Sprints state
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [sprintFilter, setSprintFilter] = useState('All');

  // Sprint Creator Form Modal state
  const [isSprintModalOpen, setIsSprintModalOpen] = useState(false);
  const [sprintFormName, setSprintFormName] = useState('');
  const [sprintFormStart, setSprintFormStart] = useState('');
  const [sprintFormEnd, setSprintFormEnd] = useState('');
  const [sprintFormGoal, setSprintFormGoal] = useState('');
  const [sprintFormStatus, setSprintFormStatus] = useState<'Upcoming' | 'Active'>('Upcoming');
  const [sprintFormLoading, setSprintFormLoading] = useState(false);
  const [sprintFormError, setSprintFormError] = useState<string | null>(null);

  // Sprint Completion Modal state
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [sprintToComplete, setSprintToComplete] = useState<Sprint | null>(null);
  const [rolloverSprintId, setRolloverSprintId] = useState('');
  const [completeLoading, setCompleteLoading] = useState(false);
  const [completeError, setCompleteError] = useState<string | null>(null);

  const {
    tasks,
    members,
    isLoading: tasksLoading,
    error,
    addTask,
    editTask,
    changeTaskStatus,
    removeTask,
    refetchTasks,
  } = useTasks(projectId || '');

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Fetch project details
  useEffect(() => {
    const fetchProjectDetails = async () => {
      if (!projectId) return;
      try {
        const proj = await projectService.getProject(projectId);
        setProject(proj);
      } catch (err) {
        console.error('Failed to load project details:', err);
      } finally {
        setProjectLoading(false);
      }
    };
    fetchProjectDetails();
  }, [projectId]);

  // Fetch Sprints details
  const fetchSprintsList = async () => {
    if (!projectId) return;
    try {
      const data = await sprintService.getSprints(projectId);
      setSprints(data);
    } catch (err) {
      console.error('Failed to load sprints:', err);
    }
  };

  useEffect(() => {
    fetchSprintsList();
  }, [projectId]);

  // Fallback dev login
  useEffect(() => {
    if (!user) {
      login('dummy-token', {
        id: '603d2e1b12cf000000000005',
        name: 'Sarah Connor',
        email: 'sarah.connor@wfm.com',
        role: 'OrgAdmin',
        orgId: '603d2e1b12cf000000000001',
      });
    }
  }, [user, login]);

  const handleRoleChange = (role: string) => {
    login('dummy-token', {
      id: '603d2e1b12cf000000000005',
      name: 'Sarah Connor',
      email: 'sarah.connor@wfm.com',
      role: role,
      orgId: '603d2e1b12cf000000000001',
    });
  };

  const handleCreateOpen = () => {
    setSelectedTask(null);
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleEditOpen = (task: Task) => {
    setSelectedTask(task);
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data: any) => {
    setFormLoading(true);
    setFormError(null);
    try {
      if (selectedTask) {
        await editTask(selectedTask._id, data);
      } else {
        await addTask(data);
      }
      setIsFormOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to submit form');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await removeTask(id);
      } catch (err: any) {
        alert(err.message || 'Failed to delete task');
      }
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: any) => {
    try {
      await changeTaskStatus(taskId, newStatus);
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    }
  };

  // Sprint CRUD operations
  const handleSprintSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sprintFormName || !sprintFormStart || !sprintFormEnd) {
      setSprintFormError('Name, start date, and end date are required');
      return;
    }

    if (new Date(sprintFormEnd) < new Date(sprintFormStart)) {
      setSprintFormError('End date cannot fall before start date');
      return;
    }

    setSprintFormLoading(true);
    setSprintFormError(null);
    try {
      await sprintService.createSprint(projectId || '', {
        name: sprintFormName,
        startDate: sprintFormStart,
        endDate: sprintFormEnd,
        goal: sprintFormGoal || undefined,
        status: sprintFormStatus,
      });

      // Clear form and reload
      setSprintFormName('');
      setSprintFormStart('');
      setSprintFormEnd('');
      setSprintFormGoal('');
      setSprintFormStatus('Upcoming');
      setIsSprintModalOpen(false);
      await fetchSprintsList();
    } catch (err: any) {
      setSprintFormError(err.response?.data?.message || err.message || 'Failed to create sprint');
    } finally {
      setSprintFormLoading(false);
    }
  };

  const handleCompleteOpen = (sprint: Sprint) => {
    setSprintToComplete(sprint);
    setRolloverSprintId('');
    setCompleteError(null);
    setIsCompleteModalOpen(true);
  };

  const handleSprintCompleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sprintToComplete) return;

    setCompleteLoading(true);
    setCompleteError(null);
    try {
      await sprintService.completeSprint(
        projectId || '',
        sprintToComplete._id,
        rolloverSprintId || undefined
      );

      setIsCompleteModalOpen(false);
      await fetchSprintsList();
      await refetchTasks();
    } catch (err: any) {
      setCompleteError(err.response?.data?.message || err.message || 'Failed to complete sprint');
    } finally {
      setCompleteLoading(false);
    }
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'All' || task.priority === priorityFilter;

    let matchesSprint = true;
    if (sprintFilter === 'Backlog') {
      matchesSprint = !task.sprintId;
    } else if (sprintFilter !== 'All') {
      matchesSprint = task.sprintId?._id === sprintFilter;
    }

    return matchesSearch && matchesStatus && matchesPriority && matchesSprint;
  });

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'Low':
        return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      case 'Medium':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'High':
        return 'bg-orange-500/10 text-orange-400 border border-orange-500/20';
      case 'Critical':
        return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Todo':
        return 'bg-slate-800 text-slate-300 border-slate-700';
      case 'InProgress':
        return 'bg-blue-600/20 text-blue-400 border border-blue-500/20';
      case 'Review':
        return 'bg-amber-600/20 text-amber-400 border border-amber-500/20';
      case 'Done':
      case 'Completed':
        return 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/20';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'No due date';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const currentRole = user?.role || 'OrgAdmin';
  const canModify = ['SuperAdmin', 'OrgAdmin', 'Manager'].includes(currentRole);

  const totalTasks = tasks.length;
  const todoTasks = tasks.filter((t) => t.status === 'Todo').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'InProgress').length;
  const reviewTasks = tasks.filter((t) => t.status === 'Review').length;
  const doneTasks = tasks.filter((t) => t.status === 'Done' || t.status === 'Completed').length;

  const activeSprint = sprints.find((s) => s.status === 'Active');
  const upcomingSprints = sprints.filter((s) => s.status === 'Upcoming');

  if (projectLoading) {
    return (
      <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-violet-500" size={40} />
        <p className="text-slate-400 text-sm font-medium">Loading project context...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 font-sans p-6 md:p-10">
      {/* Dev Role Switcher */}
      <div className="mb-8 p-4 bg-slate-900/50 border border-slate-800/80 rounded-2xl flex flex-wrap items-center justify-between gap-4 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-violet-500 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">🔧 Dev Sandbox: Role Switcher</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {['SuperAdmin', 'OrgAdmin', 'Manager', 'Employee'].map((role) => (
            <button
              key={role}
              onClick={() => handleRoleChange(role)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-200 cursor-pointer ${
                currentRole === role
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-transparent shadow-lg shadow-violet-950/40'
                  : 'bg-slate-800/60 text-slate-400 border-slate-700/60 hover:text-slate-200'
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* Back navigation & Header */}
      <Link
        to="/projects"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-violet-400 transition-colors duration-150 mb-6 group"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
        Back to Projects
      </Link>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-violet-500/10 text-violet-400 border border-violet-500/20 uppercase">
              {project?.code}
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-100">{project?.name} Tasks</h1>
          </div>
          <p className="text-slate-400 text-sm mt-1.5">
            Create, assign, and track project requirements and tasks completion.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {canModify && (
            <button
              onClick={() => setIsSprintModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-slate-300 hover:text-white bg-slate-800/80 border border-slate-700 hover:bg-slate-700 font-semibold shadow-md transition-all duration-200 hover:-translate-y-0.5 cursor-pointer text-sm"
            >
              <Flame size={16} className="text-violet-400" />
              New Sprint
            </button>
          )}
          {canModify && (
            <button
              onClick={handleCreateOpen}
              className="flex items-center gap-2 px-5 py-3 rounded-xl text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 font-semibold shadow-lg shadow-violet-950/40 hover:shadow-violet-950/60 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer text-sm"
            >
              <Plus size={18} />
              Create Task
            </button>
          )}
        </div>
      </div>

      {/* Active Sprint Banner */}
      {activeSprint && (
        <div className="mb-8 p-6 bg-gradient-to-r from-violet-950/30 to-indigo-950/30 border border-violet-900/40 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 backdrop-blur-md">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-violet-400">
              <Flame size={18} className="animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider">Active Sprint: {activeSprint.name}</span>
            </div>
            {activeSprint.goal && <p className="text-sm font-semibold text-slate-200">Goal: "{activeSprint.goal}"</p>}
            <p className="text-xs text-slate-400">
              Duration: {new Date(activeSprint.startDate).toLocaleDateString()} to{' '}
              {new Date(activeSprint.endDate).toLocaleDateString()}
            </p>
          </div>
          {canModify && (
            <button
              onClick={() => handleCompleteOpen(activeSprint)}
              className="px-4 py-2 text-xs font-bold text-slate-100 bg-violet-600 hover:bg-violet-500 rounded-xl transition-all shadow-md cursor-pointer"
            >
              Complete Sprint
            </button>
          )}
        </div>
      )}

      {/* Stats Board */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
        <div className="bg-slate-900/40 border border-slate-800/60 p-4 rounded-xl">
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Total tasks</p>
          <p className="text-2xl font-bold text-slate-200 mt-1">{totalTasks}</p>
        </div>
        <div className="bg-slate-900/40 border border-slate-800/60 p-4 rounded-xl border-l border-l-slate-600">
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Todo</p>
          <p className="text-2xl font-bold text-slate-300 mt-1">{todoTasks}</p>
        </div>
        <div className="bg-slate-900/40 border border-slate-800/60 p-4 rounded-xl border-l border-l-blue-500">
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">In Progress</p>
          <p className="text-2xl font-bold text-blue-400 mt-1">{inProgressTasks}</p>
        </div>
        <div className="bg-slate-900/40 border border-slate-800/60 p-4 rounded-xl border-l border-l-amber-500">
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">In Review</p>
          <p className="text-2xl font-bold text-amber-400 mt-1">{reviewTasks}</p>
        </div>
        <div className="bg-slate-900/40 border border-slate-800/60 p-4 rounded-xl border-l border-l-emerald-500 col-span-2 lg:col-span-1">
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Completed</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{doneTasks}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-900/50 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 min-w-[480px]">
          {/* Sprint Filter */}
          <div className="relative">
            <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <select
              value={sprintFilter}
              onChange={(e) => setSprintFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/50 border border-slate-800 text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent cursor-pointer appearance-none text-sm"
            >
              <option value="All">All Sprints</option>
              <option value="Backlog">Backlog (No Sprint)</option>
              {sprints.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} ({s.status})
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/50 border border-slate-800 text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent cursor-pointer appearance-none text-sm"
            >
              <option value="All">All Statuses</option>
              <option value="Todo">Todo</option>
              <option value="InProgress">InProgress</option>
              <option value="Review">Review</option>
              <option value="Done">Done</option>
            </select>
          </div>

          <div className="relative">
            <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/50 border border-slate-800 text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent cursor-pointer appearance-none text-sm"
            >
              <option value="All">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {(error || formError) && (
        <div className="mb-8 p-4 bg-rose-600/10 border border-rose-500/20 text-rose-400 rounded-2xl flex items-center gap-3">
          <ShieldAlert size={20} />
          <p className="text-sm font-medium">{error || formError}</p>
        </div>
      )}

      {/* Tasks Table / List */}
      {tasksLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="animate-spin text-violet-500" size={40} />
          <p className="text-slate-400 text-sm font-medium">Querying task records...</p>
        </div>
      ) : filteredTasks.length > 0 ? (
        <div className="overflow-hidden border border-slate-800/80 bg-slate-900/30 backdrop-blur-md rounded-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800/80 bg-slate-900/60 text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Task Details</th>
                  <th className="px-6 py-4">Priority</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Assignee</th>
                  <th className="px-6 py-4">Due Date</th>
                  {canModify && <th className="px-6 py-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 text-sm">
                {filteredTasks.map((task) => (
                  <tr key={task._id} className="hover:bg-slate-800/30 transition-colors duration-150">
                    {/* Task Title & Description */}
                    <td className="px-6 py-4 max-w-sm">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-slate-100 font-semibold">{task.title}</p>
                        {task.sprintId && (
                          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                            <Flame size={10} />
                            {task.sprintId.name}
                          </span>
                        )}
                      </div>
                      {task.description && <p className="text-slate-500 text-xs mt-1 line-clamp-1">{task.description}</p>}
                    </td>

                    {/* Priority */}
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityStyle(task.priority)}`}
                      >
                        {task.priority}
                      </span>
                    </td>

                    {/* Status Select dropdown */}
                    <td className="px-6 py-4">
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task._id, e.target.value)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold focus:outline-none cursor-pointer border ${getStatusColor(
                          task.status
                        )}`}
                      >
                        <option value="Todo" className="bg-slate-900 text-slate-300">
                          Todo
                        </option>
                        <option value="InProgress" className="bg-slate-900 text-blue-400">
                          InProgress
                        </option>
                        <option value="Review" className="bg-slate-900 text-amber-400">
                          Review
                        </option>
                        <option value="Done" className="bg-slate-900 text-emerald-400">
                          Done
                        </option>
                        <option value="Completed" className="bg-slate-900 text-emerald-400">
                          Completed
                        </option>
                      </select>
                    </td>

                    {/* Assignee */}
                    <td className="px-6 py-4">
                      {task.assignedToId ? (
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-violet-600/20 border border-violet-500/20 text-violet-400 flex items-center justify-center font-bold text-xs">
                            {getInitials(task.assignedToId.name)}
                          </div>
                          <div>
                            <p className="text-slate-200 text-xs font-semibold">{task.assignedToId.name}</p>
                            <p className="text-[10px] text-slate-500">{task.assignedToId.role}</p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-600 text-xs italic">Unassigned</span>
                      )}
                    </td>

                    {/* Due date */}
                    <td className="px-6 py-4 text-slate-400 text-xs">
                      <span className="flex items-center gap-1">
                        <Calendar size={13} className="text-slate-500" />
                        {formatDate(task.dueDate)}
                      </span>
                    </td>

                    {/* Actions */}
                    {canModify && (
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex gap-2">
                          <button
                            onClick={() => handleEditOpen(task)}
                            className="p-1.5 bg-slate-800/40 hover:bg-violet-600/20 text-slate-400 hover:text-violet-300 rounded-lg border border-slate-700/20 hover:border-violet-500/20 transition-all cursor-pointer"
                            title="Edit Task"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(task._id)}
                            className="p-1.5 bg-slate-800/40 hover:bg-rose-600/20 text-slate-400 hover:text-rose-400 rounded-lg border border-slate-700/20 hover:border-rose-500/20 transition-all cursor-pointer"
                            title="Delete Task"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-900/20 border border-slate-850 rounded-2xl">
          <p className="text-slate-400 font-medium">No tasks logged yet</p>
          <p className="text-slate-500 text-xs mt-1">Add tasks to set goals and deadlines for the team.</p>
        </div>
      )}

      {/* Task Form Modal */}
      <TaskForm
        isOpen={isFormOpen}
        task={selectedTask}
        members={members}
        sprints={sprints}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        isLoading={formLoading}
        projectEndDate={project?.endDate}
      />

      {/* Sprint Creator Modal */}
      {isSprintModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl relative flex flex-col">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-800/80">
              <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                <Flame size={20} className="text-violet-400" />
                Create New Sprint
              </h2>
              <button
                onClick={() => setIsSprintModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-all duration-150 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSprintSubmit} className="p-6 space-y-4">
              {sprintFormError && (
                <div className="p-3 bg-rose-600/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs">
                  {sprintFormError}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Sprint Name</label>
                <input
                  type="text"
                  placeholder="e.g. Sprint 1"
                  value={sprintFormName}
                  onChange={(e) => setSprintFormName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Start Date</label>
                  <input
                    type="date"
                    value={sprintFormStart}
                    onChange={(e) => setSprintFormStart(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">End Date</label>
                  <input
                    type="date"
                    value={sprintFormEnd}
                    onChange={(e) => setSprintFormEnd(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Sprint Goal</label>
                <textarea
                  placeholder="Summarize the core objectives..."
                  value={sprintFormGoal}
                  onChange={(e) => setSprintFormGoal(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Initial Status</label>
                <select
                  value={sprintFormStatus}
                  onChange={(e) => setSprintFormStatus(e.target.value as any)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
                >
                  <option value="Upcoming" className="bg-slate-900">Upcoming</option>
                  <option value="Active" className="bg-slate-900">Active</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800/80 mt-6">
                <button
                  type="button"
                  onClick={() => setIsSprintModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-300 hover:text-white bg-slate-805 hover:bg-slate-800 text-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sprintFormLoading}
                  className="px-4 py-2 rounded-xl text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-sm font-semibold cursor-pointer disabled:opacity-50"
                >
                  {sprintFormLoading ? 'Creating...' : 'Create Sprint'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sprint Completer Modal */}
      {isCompleteModalOpen && sprintToComplete && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl relative flex flex-col">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-800/80">
              <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                <Flame size={20} className="text-violet-400" />
                Complete Active Sprint
              </h2>
              <button
                onClick={() => setIsCompleteModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-all duration-150 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSprintCompleteSubmit} className="p-6 space-y-4">
              {completeError && (
                <div className="p-3 bg-rose-600/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs">
                  {completeError}
                </div>
              )}

              <p className="text-sm text-slate-300">
                You are about to complete active sprint <strong>{sprintToComplete.name}</strong>.
              </p>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Rollover Unfinished Tasks To</label>
                <select
                  value={rolloverSprintId}
                  onChange={(e) => setRolloverSprintId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
                >
                  <option value="" className="bg-slate-900">Backlog (Unassigned)</option>
                  {upcomingSprints.map((s) => (
                    <option key={s._id} value={s._id} className="bg-slate-900">
                      {s.name} (Upcoming)
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-500 mt-1">
                  Completed tasks will remain associated with this completed sprint for metric logs.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800/80 mt-6">
                <button
                  type="button"
                  onClick={() => setIsCompleteModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-300 hover:text-white bg-slate-805 hover:bg-slate-800 text-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={completeLoading}
                  className="px-4 py-2 rounded-xl text-white bg-violet-600 hover:bg-violet-500 text-sm font-semibold cursor-pointer disabled:opacity-50"
                >
                  {completeLoading ? 'Processing...' : 'Complete Sprint'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskDashboard;
