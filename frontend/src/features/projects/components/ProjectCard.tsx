import React from 'react';
import { Calendar, Edit, Trash2, Tag, ListTodo } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Project } from '../types/projectTypes';

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
  userRole?: string | null;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onEdit,
  onDelete,
  userRole,
}) => {
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Planning':
        return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      case 'Active':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'Completed':
        return 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20';
      case 'OnHold':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
    }
  };

  const formatDate = (dateStr: string) => {
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

  const canEdit = ['SuperAdmin', 'OrgAdmin', 'Manager'].includes(userRole || '');
  const canDelete = ['SuperAdmin', 'OrgAdmin'].includes(userRole || '');

  return (
    <div className="relative group overflow-hidden bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800/80 hover:border-violet-500/40 p-6 flex flex-col justify-between hover:-translate-y-1 hover:shadow-2xl hover:shadow-violet-950/20 transition-all duration-300">
      {/* Background glow ornament */}
      <div className="absolute -right-16 -top-16 w-32 h-32 bg-violet-600/10 rounded-full blur-3xl group-hover:bg-violet-600/20 transition-all duration-500" />

      <div>
        <div className="flex justify-between items-start gap-4 mb-4">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide bg-slate-800/80 text-slate-300 border border-slate-700/60">
            <Tag size={12} className="text-violet-400" />
            {project.code}
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(project.status)}`}>
            {project.status}
          </span>
        </div>

        <Link to={`/projects/${project._id}/tasks`} className="block hover:underline decoration-violet-500/40">
          <h3 className="text-xl font-bold text-slate-100 group-hover:text-violet-300 transition-colors duration-300 line-clamp-1 mb-2">
            {project.name}
          </h3>
        </Link>

        <div className="space-y-3.5 my-6 text-slate-400 text-sm">
          <div className="flex items-center gap-2.5">
            <Calendar size={16} className="text-slate-500" />
            <span>
              {formatDate(project.startDate)}
              {project.endDate ? ` — ${formatDate(project.endDate)}` : ' (No End Date)'}
            </span>
          </div>

          <div className="flex items-center gap-3 pt-3 border-t border-slate-800/60">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-md">
              {project.managerId ? getInitials(project.managerId.name) : 'M'}
            </div>
            <div>
              <p className="text-slate-200 font-medium text-xs">
                {project.managerId ? project.managerId.name : 'Unassigned'}
              </p>
              <p className="text-[10px] text-slate-500 font-normal">
                {project.managerId ? 'Project Manager' : 'No manager designated'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2.5 pt-4 border-t border-slate-800/40 w-full font-sans">
        <Link
          to={`/projects/${project._id}/tasks`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-violet-600/10 hover:bg-violet-600/20 text-violet-400 border border-violet-500/20 hover:border-violet-500/30 transition-all duration-200 cursor-pointer"
        >
          <ListTodo size={14} />
          View Tasks
        </Link>

        <div className="flex items-center gap-2">
          {canEdit && (
            <button
              onClick={() => onEdit(project)}
              className="p-2 bg-slate-800/50 hover:bg-violet-600/20 text-slate-400 hover:text-violet-300 rounded-lg border border-slate-700/40 hover:border-violet-500/30 transition-all duration-200 cursor-pointer"
              title="Edit Project"
            >
              <Edit size={15} />
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => onDelete(project._id)}
              className="p-2 bg-slate-800/50 hover:bg-rose-600/20 text-slate-400 hover:text-rose-400 rounded-lg border border-slate-700/40 hover:border-rose-500/30 transition-all duration-200 cursor-pointer"
              title="Delete Project"
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
