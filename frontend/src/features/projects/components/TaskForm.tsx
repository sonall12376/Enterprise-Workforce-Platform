import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Loader2 } from 'lucide-react';
import { Task, Assignee } from '../types/taskTypes';

const taskFormSchema = z.object({
  title: z.string().min(2, 'Task title must be at least 2 characters').trim(),
  description: z.string().optional().default(''),
  priority: z.enum(['Low', 'Medium', 'High', 'Critical']),
  status: z.enum(['Todo', 'InProgress', 'Review', 'Done']),
  assignedToId: z.string().optional().or(z.literal('')),
  dueDate: z.string().optional().or(z.literal('')),
});

type TaskFormData = z.infer<typeof taskFormSchema>;

interface TaskFormProps {
  task?: Task | null;
  members: Assignee[];
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  isLoading: boolean;
  projectEndDate?: string; // Optional parent project boundary check on client side
}

export const TaskForm: React.FC<TaskFormProps> = ({
  task,
  members,
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  projectEndDate,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setError,
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'Medium',
      status: 'Todo',
      assignedToId: '',
      dueDate: '',
    },
  });

  useEffect(() => {
    if (task) {
      reset({
        title: task.title,
        description: task.description || '',
        priority: task.priority,
        status: task.status,
        assignedToId: task.assignedToId ? task.assignedToId._id : '',
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      });
    } else {
      reset({
        title: '',
        description: '',
        priority: 'Medium',
        status: 'Todo',
        assignedToId: '',
        dueDate: '',
      });
    }
  }, [task, reset, isOpen]);

  if (!isOpen) return null;

  const onFormSubmit = async (data: TaskFormData) => {
    // Client-side date limit check against project boundary
    if (data.dueDate && projectEndDate) {
      const taskDate = new Date(data.dueDate);
      const projDate = new Date(projectEndDate);
      if (taskDate > projDate) {
        setError('dueDate', {
          type: 'manual',
          message: `Due date cannot exceed project end date (${projDate.toLocaleDateString()})`,
        });
        return;
      }
    }

    const payload = {
      ...data,
      assignedToId: data.assignedToId || undefined,
      dueDate: data.dueDate || undefined,
    };
    await onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-800/80">
          <h2 className="text-xl font-bold text-slate-100">{task ? 'Edit Task' : 'Create New Task'}</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-all duration-150 cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onFormSubmit)} className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-300">Task Title</label>
            <input
              type="text"
              placeholder="e.g. Implement middleware checks"
              {...register('title')}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/80 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200"
            />
            {errors.title && <p className="text-xs text-rose-400 font-medium">{errors.title.message}</p>}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-300">Description</label>
            <textarea
              rows={3}
              placeholder="Explain the scope and details of this task..."
              {...register('description')}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/80 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200 resize-none"
            />
            {errors.description && <p className="text-xs text-rose-400 font-medium">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Priority */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-300">Priority</label>
              <select
                {...register('priority')}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/80 text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200"
              >
                <option value="Low" className="bg-slate-900">
                  Low
                </option>
                <option value="Medium" className="bg-slate-900">
                  Medium
                </option>
                <option value="High" className="bg-slate-900">
                  High
                </option>
                <option value="Critical" className="bg-slate-900">
                  Critical
                </option>
              </select>
              {errors.priority && <p className="text-xs text-rose-400 font-medium">{errors.priority.message}</p>}
            </div>

            {/* Status */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-300">Status</label>
              <select
                {...register('status')}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/80 text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200"
              >
                <option value="Todo" className="bg-slate-900">
                  Todo
                </option>
                <option value="InProgress" className="bg-slate-900">
                  InProgress
                </option>
                <option value="Review" className="bg-slate-900">
                  Review
                </option>
                <option value="Done" className="bg-slate-900">
                  Done
                </option>
              </select>
              {errors.status && <p className="text-xs text-rose-400 font-medium">{errors.status.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Assignee */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-300">Assign To</label>
              <select
                {...register('assignedToId')}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/80 text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200"
              >
                <option value="" className="bg-slate-900 text-slate-500">
                  Unassigned
                </option>
                {members.map((member) => (
                  <option key={member._id} value={member._id} className="bg-slate-900 text-slate-200">
                    {member.name} ({member.role})
                  </option>
                ))}
              </select>
              {errors.assignedToId && (
                <p className="text-xs text-rose-400 font-medium">{errors.assignedToId.message}</p>
              )}
            </div>

            {/* Due Date */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-300">Due Date</label>
              <input
                type="date"
                {...register('dueDate')}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/80 text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200"
              />
              {errors.dueDate && <p className="text-xs text-rose-400 font-medium">{errors.dueDate.message}</p>}
            </div>
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
              {task ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
