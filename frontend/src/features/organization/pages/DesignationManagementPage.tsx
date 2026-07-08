import React, { useState, useEffect } from 'react';
import organizationService, { Designation, Dept } from '../../../services/organizationService';
import {
  Key,
  Plus,
  Trash2,
  Edit,
  Loader2,
  CheckCircle2,
  ShieldAlert,
  Award,
  Layers,
} from 'lucide-react';

export const DesignationManagementPage: React.FC = () => {
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [departments, setDepartments] = useState<Dept[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deptId, setDeptId] = useState('');
  const [title, setTitle] = useState('');
  const [grade, setGrade] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const desList = await organizationService.getDesignations();
      setDesignations(desList);

      const deptList = await organizationService.getDepts();
      setDepartments(deptList);
    } catch (err: any) {
      setError(err.message || 'Failed to load designations directory.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const payload = {
        deptId,
        title,
        grade: grade || undefined,
      };

      if (editingId) {
        await organizationService.updateDesignation(editingId, payload);
        setSuccess('Designation updated successfully.');
      } else {
        await organizationService.createDesignation(payload);
        setSuccess('New designation created successfully.');
      }

      setDeptId('');
      setTitle('');
      setGrade('');
      setEditingId(null);

      const desList = await organizationService.getDesignations();
      setDesignations(desList);
    } catch (err: any) {
      setError(err.message || 'Failed to save designation details.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (des: Designation) => {
    setEditingId(des._id);
    setDeptId(des.deptId?._id || '');
    setTitle(des.title);
    setGrade(des.grade || '');
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this corporate designation?')) return;
    setError(null);
    setSuccess(null);
    try {
      await organizationService.deleteDesignation(id);
      setSuccess('Designation deleted successfully.');
      setDesignations(designations.filter((d) => d._id !== id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete designation.');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="animate-spin text-indigo-500" size={32} />
        <p className="text-slate-400 text-sm font-medium">Fetching designations directory...</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-slate-300 to-indigo-300">
          Designation Management
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Structure career ladders, configure grade levels, and map roles to their departments.
        </p>
      </div>

      {/* Message alerts */}
      {error && (
        <div className="p-4 bg-rose-600/10 border border-rose-500/20 text-rose-400 rounded-xl text-sm flex items-center gap-3">
          <ShieldAlert size={18} />
          <p className="font-medium">{error}</p>
        </div>
      )}
      {success && (
        <div className="p-4 bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-sm flex items-center gap-3">
          <CheckCircle2 size={18} />
          <p className="font-medium">{success}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form panel */}
        <div className="lg:col-span-1">
          <form onSubmit={handleSave} className="bg-slate-900/30 border border-slate-800/80 p-6 rounded-2xl space-y-6 backdrop-blur-md shadow-xl">
            <h3 className="text-md font-bold text-slate-200 border-b border-slate-800 pb-3 flex items-center gap-2">
              <Key size={18} className="text-indigo-400" />
              {editingId ? 'Edit Designation' : 'Create Designation'}
            </h3>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-slate-400 text-xs font-semibold uppercase">Department</label>
                <select
                  required
                  value={deptId}
                  onChange={(e) => setDeptId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="">Select Department</option>
                  {departments.map((d) => (
                    <option key={d._id} value={d._id} className="bg-slate-950">
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 text-xs font-semibold uppercase">Role Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Lead Software Engineer"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 text-xs font-semibold uppercase">Grade / Level (Optional)</label>
                <input
                  type="text"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  placeholder="e.g. L5, Senior"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                <span>{editingId ? 'Update Role' : 'Add Role'}</span>
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setDeptId('');
                    setTitle('');
                    setGrade('');
                  }}
                  className="px-4 py-2.5 bg-slate-855 hover:bg-slate-800 rounded-xl text-xs font-bold text-slate-400 cursor-pointer"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* List panel */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-md font-bold text-slate-400 flex items-center gap-2">
            <Layers size={18} /> Structured Career Hierarchy
          </h3>

          {designations.length === 0 ? (
            <div className="text-center py-20 bg-slate-900/20 border border-slate-800/40 rounded-2xl">
              <p className="text-slate-500 text-xs">No designations defined yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {designations.map((des) => (
                <div key={des._id} className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-2xl flex flex-col justify-between shadow-lg hover:border-indigo-500/20 transition-all duration-200">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <div className="font-extrabold text-slate-200 text-base">{des.title}</div>
                      {des.grade && (
                        <span className="px-2 py-0.5 rounded bg-violet-950/60 border border-violet-500/20 text-violet-400 font-mono text-[10px] font-bold">
                          {des.grade}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
                      <Award size={14} className="text-slate-500" />
                      <span>Dept: {des.deptId?.name || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-4 border-t border-slate-850/80 mt-4">
                    <button
                      onClick={() => handleEdit(des)}
                      className="p-2 bg-slate-950 border border-slate-850 hover:border-slate-700 text-slate-400 hover:text-slate-200 rounded-lg transition-colors"
                      title="Edit Role"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(des._id)}
                      className="p-2 bg-slate-950 border border-slate-850 hover:border-slate-700 text-rose-500 hover:text-rose-450 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DesignationManagementPage;
