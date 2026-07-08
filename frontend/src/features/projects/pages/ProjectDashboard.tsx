import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useProjects } from '../hooks/useProjects';
import { ProjectCard } from '../components/ProjectCard';
import { ProjectForm } from '../components/ProjectForm';
import { Project } from '../types/projectTypes';
import { Plus, Search, Filter, ShieldAlert, BarChart2, FolderKanban, CheckCircle2, Clock, Loader2 } from 'lucide-react';

export const ProjectDashboard: React.FC = () => {
  const { user, login } = useAuth();
  const {
    projects,
    managers,
    isLoading,
    error,
    addProject,
    editProject,
    removeProject,
  } = useProjects();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Auto-login a default developer user if not logged in
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


  const handleCreateOpen = () => {
    setSelectedProject(null);
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleEditOpen = (project: Project) => {
    setSelectedProject(project);
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data: any) => {
    setFormLoading(true);
    setFormError(null);
    try {
      if (selectedProject) {
        await editProject(selectedProject._id, data);
      } else {
        await addProject(data);
      }
      setIsFormOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to submit form');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await removeProject(id);
      } catch (err: any) {
        alert(err.message || 'Failed to delete project');
      }
    }
  };

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate stats
  const totalProjects = projects.length;
  const activeProjects = projects.filter((p) => p.status === 'Active').length;
  const planningProjects = projects.filter((p) => p.status === 'Planning').length;
  const completedProjects = projects.filter((p) => p.status === 'Completed').length;

  const currentRole = user?.role || 'OrgAdmin';
  const canCreate = ['SuperAdmin', 'OrgAdmin', 'Manager'].includes(currentRole);

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 font-sans p-6 md:p-10">


      {/* Welcome & Action Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-100 via-slate-300 to-indigo-300 bg-clip-text text-transparent">
            Project Dashboard
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage your organization's workspaces, deadlines, and project assignments.
          </p>
        </div>
        {canCreate && (
          <button
            onClick={handleCreateOpen}
            className="flex items-center gap-2 px-5 py-3 rounded-xl text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 font-semibold shadow-lg shadow-violet-950/40 hover:shadow-violet-950/60 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
          >
            <Plus size={18} />
            Create Project
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {/* Total */}
        <div className="bg-slate-900/40 border border-slate-800/60 p-6 rounded-2xl flex items-center gap-4 shadow-xl">
          <div className="p-3.5 bg-violet-600/10 text-violet-400 rounded-xl border border-violet-500/10">
            <FolderKanban size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-100">{totalProjects}</p>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Total Projects</p>
          </div>
        </div>

        {/* Active */}
        <div className="bg-slate-900/40 border border-slate-800/60 p-6 rounded-2xl flex items-center gap-4 shadow-xl">
          <div className="p-3.5 bg-emerald-600/10 text-emerald-400 rounded-xl border border-emerald-500/10">
            <BarChart2 size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-100">{activeProjects}</p>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Active</p>
          </div>
        </div>

        {/* Planning */}
        <div className="bg-slate-900/40 border border-slate-800/60 p-6 rounded-2xl flex items-center gap-4 shadow-xl">
          <div className="p-3.5 bg-blue-600/10 text-blue-400 rounded-xl border border-blue-500/10">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-100">{planningProjects}</p>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Planning</p>
          </div>
        </div>

        {/* Completed */}
        <div className="bg-slate-900/40 border border-slate-800/60 p-6 rounded-2xl flex items-center gap-4 shadow-xl">
          <div className="p-3.5 bg-indigo-600/10 text-indigo-400 rounded-xl border border-indigo-500/10">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-100">{completedProjects}</p>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Completed</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input
            type="text"
            placeholder="Search by project name or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-900/50 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200 animate-none"
          />
        </div>

        {/* Filter Dropdown */}
        <div className="relative min-w-[200px]">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-900/50 border border-slate-800 text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200 appearance-none cursor-pointer"
          >
            <option value="All" className="bg-slate-900">
              All Statuses
            </option>
            <option value="Planning" className="bg-slate-900">
              Planning
            </option>
            <option value="Active" className="bg-slate-900">
              Active
            </option>
            <option value="Completed" className="bg-slate-900">
              Completed
            </option>
            <option value="OnHold" className="bg-slate-900">
              OnHold
            </option>
          </select>
        </div>
      </div>

      {/* Error / Form Error Alert */}
      {(error || formError) && (
        <div className="mb-8 p-4 bg-rose-600/10 border border-rose-500/20 text-rose-400 rounded-2xl flex items-center gap-3">
          <ShieldAlert size={20} />
          <p className="text-sm font-medium">{error || formError}</p>
        </div>
      )}

      {/* Grid List */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="animate-spin text-violet-500" size={40} />
          <p className="text-slate-400 text-sm font-medium">Loading organization workspaces...</p>
        </div>
      ) : filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project._id}
              project={project}
              onEdit={handleEditOpen}
              onDelete={handleDelete}
              userRole={currentRole}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-900/20 border border-slate-800/40 rounded-2xl">
          <p className="text-slate-400 font-medium">No projects found</p>
          <p className="text-slate-500 text-xs mt-1">Try resetting filters or launch a new project space.</p>
        </div>
      )}

      {/* Create / Edit Form Modal */}
      <ProjectForm
        isOpen={isFormOpen}
        project={selectedProject}
        managers={managers}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        isLoading={formLoading}
      />
    </div>
  );
};
export default ProjectDashboard;
