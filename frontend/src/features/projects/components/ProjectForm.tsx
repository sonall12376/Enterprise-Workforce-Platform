import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Loader2 } from 'lucide-react';
import { Project, Manager } from '../types/projectTypes';

const projectFormSchema = z
  .object({
    name: z
      .string()
      .min(2, 'Project name must be at least 2 characters')
      .max(100, 'Project name cannot exceed 100 characters')
      .trim(),
    code: z
      .string()
      .min(2, 'Project code must be at least 2 characters')
      .max(20, 'Project code cannot exceed 20 characters')
      .regex(/^[a-zA-Z0-9_-]+$/, 'Code can only contain letters, numbers, dashes, and underscores')
      .trim()
      .toUpperCase(),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().optional().or(z.literal('')),
    managerId: z.string().min(1, 'Please select a manager'),
    status: z.enum(['Planning', 'Active', 'Completed', 'OnHold']),
  })
  .refine(
    (data) => {
      if (data.endDate && data.startDate > data.endDate) {
        return false;
      }
      return true;
    },
    {
      message: 'End date must be on or after start date',
      path: ['endDate'],
    }
  );

type ProjectFormData = z.infer<typeof projectFormSchema>;

interface ProjectFormProps {
  project?: Project | null;
  managers: Manager[];
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  isLoading: boolean;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({
  project,
  managers,
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: '',
      code: '',
      startDate: '',
      endDate: '',
      managerId: '',
      status: 'Planning',
    },
  });

  // Set default values when editing a project
  useEffect(() => {
    if (project) {
      reset({
        name: project.name,
        code: project.code,
        startDate: new Date(project.startDate).toISOString().split('T')[0],
        endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '',
        managerId: project.managerId ? project.managerId._id : '',
        status: project.status,
      });
    } else {
      reset({
        name: '',
        code: '',
        startDate: '',
        endDate: '',
        managerId: '',
        status: 'Planning',
      });
    }
  }, [project, reset, isOpen]);

  if (!isOpen) return null;

  const onFormSubmit = async (data: ProjectFormData) => {
    const payload = {
      ...data,
      endDate: data.endDate || undefined,
    };
    await onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-800/80">
          <h2 className="text-xl font-bold text-slate-100">{project ? 'Edit Project' : 'Create New Project'}</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-all duration-150 cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onFormSubmit)} className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Project Name */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-300">Project Name</label>
            <input
              type="text"
              placeholder="e.g. Workforce Management Redesign"
              {...register('name')}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/80 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200"
            />
            {errors.name && <p className="text-xs text-rose-400 font-medium">{errors.name.message}</p>}
          </div>

          {/* Project Code */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-300">Project Code</label>
            <input
              type="text"
              placeholder="e.g. WFM-2026"
              disabled={!!project}
              {...register('code')}
              className={`w-full px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/80 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200 ${
                project ? 'opacity-55 cursor-not-allowed' : ''
              }`}
            />
            {errors.code && <p className="text-xs text-rose-400 font-medium">{errors.code.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Start Date */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-300">Start Date</label>
              <input
                type="date"
                {...register('startDate')}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/80 text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200"
              />
              {errors.startDate && <p className="text-xs text-rose-400 font-medium">{errors.startDate.message}</p>}
            </div>

            {/* End Date */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-300">End Date (Optional)</label>
              <input
                type="date"
                {...register('endDate')}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/80 text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200"
              />
              {errors.endDate && <p className="text-xs text-rose-400 font-medium">{errors.endDate.message}</p>}
            </div>
          </div>

          {/* Project Manager */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-300">Project Manager</label>
            <select
              {...register('managerId')}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/80 text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200"
            >
              <option value="" className="bg-slate-900 text-slate-500">
                Select Manager
              </option>
              {managers.map((manager) => (
                <option key={manager._id} value={manager._id} className="bg-slate-900 text-slate-200">
                  {manager.name} ({manager.role})
                </option>
              ))}
            </select>
            {errors.managerId && <p className="text-xs text-rose-400 font-medium">{errors.managerId.message}</p>}
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-300">Status</label>
            <select
              {...register('status')}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/80 text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200"
            >
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
            {errors.status && <p className="text-xs text-rose-400 font-medium">{errors.status.message}</p>}
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-slate-800/80 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-slate-300 hover:text-slate-100 bg-slate-800 hover:bg-slate-700 border border-slate-700/80 font-medium transition-all duration-150 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 rounded-xl text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-950/30 hover:shadow-violet-950/50 font-medium flex items-center gap-2 transition-all duration-200 cursor-pointer disabled:opacity-55 disabled:cursor-not-allowed"
            >
              {isLoading && <Loader2 size={16} className="animate-spin" />}
              {project ? 'Save Changes' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
