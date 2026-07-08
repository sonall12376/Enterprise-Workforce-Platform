import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Loader2 } from 'lucide-react';
import { Asset } from '../types/assetTypes';

const assetFormSchema = z.object({
  name: z.string().min(2, 'Asset name must be at least 2 characters').trim(),
  serialNumber: z.string().min(2, 'Serial number must be at least 2 characters').trim(),
  type: z.enum(['Hardware', 'Software', 'Furniture']),
  status: z.enum(['Available', 'Assigned', 'Maintenance', 'Retired']),
});

type AssetFormData = z.infer<typeof assetFormSchema>;

interface AssetFormProps {
  asset?: Asset | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  isLoading: boolean;
}

export const AssetForm: React.FC<AssetFormProps> = ({ asset, isOpen, onClose, onSubmit, isLoading }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AssetFormData>({
    resolver: zodResolver(assetFormSchema),
    defaultValues: {
      name: '',
      serialNumber: '',
      type: 'Hardware',
      status: 'Available',
    },
  });

  useEffect(() => {
    if (asset) {
      reset({
        name: asset.name,
        serialNumber: asset.serialNumber,
        type: asset.type,
        status: asset.status,
      });
    } else {
      reset({
        name: '',
        serialNumber: '',
        type: 'Hardware',
        status: 'Available',
      });
    }
  }, [asset, reset, isOpen]);

  if (!isOpen) return null;

  const onFormSubmit = async (data: AssetFormData) => {
    await onSubmit(data);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl relative flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-800/80">
          <h2 className="text-xl font-bold text-slate-100">{asset ? 'Edit Asset' : 'Register New Asset'}</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-all duration-150 cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-4">
          {/* Asset Name */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-300">Asset Name</label>
            <input
              type="text"
              placeholder="e.g. MacBook Pro M3"
              {...register('name')}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/80 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200"
            />
            {errors.name && <p className="text-xs text-rose-400 font-medium">{errors.name.message}</p>}
          </div>

          {/* Serial Number */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-300">Serial Number</label>
            <input
              type="text"
              placeholder="e.g. SN-8927B-X"
              {...register('serialNumber')}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/80 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200"
            />
            {errors.serialNumber && <p className="text-xs text-rose-400 font-medium">{errors.serialNumber.message}</p>}
          </div>

          {/* Asset Type */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-300">Type</label>
            <select
              {...register('type')}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/80 text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200"
            >
              <option value="Hardware" className="bg-slate-900">
                Hardware (Laptops, Screens)
              </option>
              <option value="Software" className="bg-slate-900">
                Software (Licenses, SaaS)
              </option>
              <option value="Furniture" className="bg-slate-900">
                Furniture (Desks, Chairs)
              </option>
            </select>
            {errors.type && <p className="text-xs text-rose-400 font-medium">{errors.type.message}</p>}
          </div>

          {/* Asset Status */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-300">Status</label>
            <select
              {...register('status')}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/80 text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200"
            >
              <option value="Available" className="bg-slate-900">
                Available
              </option>
              <option value="Assigned" className="bg-slate-900" disabled={!asset}>
                Assigned (Managed via allocation flow)
              </option>
              <option value="Maintenance" className="bg-slate-900">
                Maintenance
              </option>
              <option value="Retired" className="bg-slate-900">
                Retired
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
              {asset ? 'Save Changes' : 'Register Asset'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
