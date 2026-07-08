import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import employeeService from '../services/employeeService';
import { Employee } from '../types/employeeTypes';
import { User, Phone, MapPin, ShieldAlert, CheckCircle2, Loader2, Save, Calendar, Landmark, ShieldCheck } from 'lucide-react';

export const UserProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Address and emergency contact editable states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [country, setCountry] = useState('');
  const [ecName, setEcName] = useState('');
  const [ecRel, setEcRel] = useState('');
  const [ecPhone, setEcPhone] = useState('');

  useEffect(() => {
    if (user?.id) {
      loadProfile(user.id);
    }
  }, [user]);

  const loadProfile = async (id: string) => {
    try {
      setLoading(true);
      const data = await employeeService.getEmployee(id);
      setProfile(data);
      setFirstName(data.firstName || '');
      setLastName(data.lastName || '');
      setPhone(data.phone || '');
      setStreet(data.address?.street || '');
      setCity(data.address?.city || '');
      setState(data.address?.state || '');
      setZipCode(data.address?.zipCode || '');
      setCountry(data.address?.country || '');
      setEcName(data.emergencyContact?.name || '');
      setEcRel(data.emergencyContact?.relationship || '');
      setEcPhone(data.emergencyContact?.phone || '');
    } catch (err: any) {
      setError(err.message || 'Failed to load profile details.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setError(null);
    setSuccess(null);
    setSaving(true);
    try {
      const updated = await employeeService.updateEmployee(profile._id, {
        firstName,
        lastName,
        phone,
        address: { street, city, state, zipCode, country },
        emergencyContact: { name: ecName, relationship: ecRel, phone: ecPhone },
      });
      setProfile(updated);
      setSuccess('Profile updated successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to save profile changes.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="animate-spin text-indigo-500" size={32} />
        <p className="text-slate-400 text-sm font-medium">Fetching profile details...</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8">
      {/* Header Profile Summary */}
      <div className="bg-slate-900/40 border border-slate-800/85 p-6 rounded-2xl flex flex-col md:flex-row items-center md:items-start gap-6 backdrop-blur-md shadow-xl">
        <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center font-extrabold text-white text-3xl shadow-xl shadow-indigo-950/40">
          {profile?.name ? profile.name.substring(0, 2).toUpperCase() : 'US'}
        </div>
        <div className="text-center md:text-left space-y-1.5 flex-1">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
            <h1 className="text-2xl font-extrabold text-slate-100">{profile?.name}</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-950 border border-indigo-500/25 text-indigo-400">
              {profile?.role}
            </span>
          </div>
          <p className="text-slate-400 text-sm font-mono text-indigo-300 font-bold">{profile?.employeeId}</p>
          <div className="flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-2 pt-2 text-xs text-slate-400 font-medium">
            <div className="flex items-center gap-1.5">
              <Calendar size={14} className="text-slate-500" />
              Joined {profile?.joiningDate ? new Date(profile.joiningDate).toLocaleDateString() : 'N/A'}
            </div>
            <div className="flex items-center gap-1.5">
              <Landmark size={14} className="text-slate-500" />
              {profile?.employmentType} Employee
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-slate-500" />
              Status: {profile?.status}
            </div>
          </div>
        </div>
      </div>

      {/* Alert boxes */}
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

      {/* Editable details Form */}
      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left column - Personal / Address */}
        <div className="bg-slate-900/30 border border-slate-800/80 p-6 rounded-2xl space-y-6">
          <h3 className="text-md font-bold text-slate-200 border-b border-slate-800 pb-3 flex items-center gap-2">
            <User size={18} className="text-indigo-400" /> Personal & Contact Info
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-slate-400 text-xs font-semibold uppercase">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-slate-400 text-xs font-semibold uppercase">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500 text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-400 text-xs font-semibold uppercase">Phone Number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500 text-sm"
            />
          </div>

          <div className="space-y-1.5 pt-2">
            <label className="text-slate-400 text-xs font-semibold uppercase">Street Address</label>
            <input
              type="text"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-slate-400 text-xs font-semibold uppercase">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-slate-400 text-xs font-semibold uppercase">State / Province</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-slate-400 text-xs font-semibold uppercase">Zip / Postal Code</label>
              <input
                type="text"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-slate-400 text-xs font-semibold uppercase">Country</label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Right column - Emergency Contacts / Org Details */}
        <div className="space-y-6">
          {/* Emergency Contact */}
          <div className="bg-slate-900/30 border border-slate-800/80 p-6 rounded-2xl space-y-6">
            <h3 className="text-md font-bold text-slate-200 border-b border-slate-800 pb-3 flex items-center gap-2">
              <Phone size={18} className="text-rose-400" /> Emergency Contact
            </h3>
            <div className="space-y-1.5">
              <label className="text-slate-400 text-xs font-semibold uppercase">Contact Name</label>
              <input
                type="text"
                value={ecName}
                onChange={(e) => setEcName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-slate-400 text-xs font-semibold uppercase">Relationship</label>
              <input
                type="text"
                value={ecRel}
                onChange={(e) => setEcRel(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-slate-400 text-xs font-semibold uppercase">Contact Phone</label>
              <input
                type="text"
                value={ecPhone}
                onChange={(e) => setEcPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500 text-sm"
              />
            </div>
          </div>

          {/* Org details (Read-only) */}
          <div className="bg-slate-900/30 border border-slate-800/80 p-6 rounded-2xl space-y-4">
            <h3 className="text-md font-bold text-slate-200 border-b border-slate-800 pb-3 flex items-center gap-2">
              <MapPin size={18} className="text-violet-400" /> Organizational Placements
            </h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-500 uppercase tracking-wider block font-bold">Department</span>
                <span className="text-slate-300 font-semibold text-sm mt-0.5 block">{profile?.deptId?.name || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-500 uppercase tracking-wider block font-bold">Designation</span>
                <span className="text-slate-300 font-semibold text-sm mt-0.5 block">{profile?.designationId?.title || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-500 uppercase tracking-wider block font-bold">Work Shift</span>
                <span className="text-slate-300 font-semibold text-sm mt-0.5 block">{profile?.shiftId?.name || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-500 uppercase tracking-wider block font-bold">Office Location</span>
                <span className="text-slate-300 font-semibold text-sm mt-0.5 block">{profile?.locationId?.name || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-950/30 transition-all duration-300 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
          >
            {saving ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                <span>Saving changes...</span>
              </>
            ) : (
              <>
                <Save size={18} />
                <span>Save Profile Details</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserProfilePage;
