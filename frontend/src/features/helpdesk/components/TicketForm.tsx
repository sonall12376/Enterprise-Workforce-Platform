import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Loader2 } from 'lucide-react';
import { HelpDeskTicket } from '../types/helpDeskTypes';

const ticketFormSchema = z.object({
  subject: z
    .string()
    .min(2, 'Subject must be at least 2 characters')
    .max(150, 'Subject must not exceed 150 characters')
    .trim(),
  description: z.string().min(5, 'Description must be at least 5 characters').trim(),
  category: z.enum(['IT', 'HR', 'Facilities', 'Finance']),
  priority: z.enum(['Low', 'Medium', 'High', 'Urgent']),
});

type TicketFormData = z.infer<typeof ticketFormSchema>;

interface TicketFormProps {
  ticket?: HelpDeskTicket | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  isLoading: boolean;
}

export const TicketForm: React.FC<TicketFormProps> = ({ ticket, isOpen, onClose, onSubmit, isLoading }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TicketFormData>({
    resolver: zodResolver(ticketFormSchema),
    defaultValues: {
      subject: '',
      description: '',
      category: 'IT',
      priority: 'Medium',
    },
  });

  useEffect(() => {
    if (ticket) {
      reset({
        subject: ticket.subject,
        description: ticket.description,
        category: ticket.category,
        priority: ticket.priority,
      });
    } else {
      reset({
        subject: '',
        description: '',
        category: 'IT',
        priority: 'Medium',
      });
    }
  }, [ticket, reset, isOpen]);

  if (!isOpen) return null;

  const onFormSubmit = async (data: TicketFormData) => {
    await onSubmit(data);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl relative flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-800/80">
          <h2 className="text-xl font-bold text-slate-100">{ticket ? 'Edit Support Ticket' : 'Raise Support Ticket'}</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-all duration-150 cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-4">
          {/* Subject */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-300">Subject</label>
            <input
              type="text"
              placeholder="e.g. VPN access not working"
              {...register('subject')}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/80 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200"
            />
            {errors.subject && <p className="text-xs text-rose-400 font-medium">{errors.subject.message}</p>}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-300">Description</label>
            <textarea
              rows={4}
              placeholder="Describe the issue in detail..."
              {...register('description')}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/80 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200 resize-none"
            />
            {errors.description && <p className="text-xs text-rose-400 font-medium">{errors.description.message}</p>}
          </div>

          {/* Category & Priority grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-300">Category</label>
              <select
                {...register('category')}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/80 text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200"
              >
                <option value="IT" className="bg-slate-900">
                  IT
                </option>
                <option value="HR" className="bg-slate-900">
                  HR
                </option>
                <option value="Facilities" className="bg-slate-900">
                  Facilities
                </option>
                <option value="Finance" className="bg-slate-900">
                  Finance
                </option>
              </select>
              {errors.category && <p className="text-xs text-rose-400 font-medium">{errors.category.message}</p>}
            </div>

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
                <option value="Urgent" className="bg-slate-900">
                  Urgent
                </option>
              </select>
              {errors.priority && <p className="text-xs text-rose-400 font-medium">{errors.priority.message}</p>}
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
              {ticket ? 'Save Changes' : 'Open Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
