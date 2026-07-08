import React, { useState, useEffect } from 'react';
import organizationService, { Org, OfficeLocation, WorkShift, Holiday } from '../../../services/organizationService';
import {
  Building,
  MapPin,
  Clock,
  Calendar,
  Save,
  Plus,
  Trash2,
  Edit,
  Loader2,
  CheckCircle2,
  ShieldAlert,
  Globe,
  Settings,
} from 'lucide-react';

export const OrganizationSettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'locations' | 'shifts' | 'holidays'>('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // States for list models
  const [org, setOrg] = useState<Org | null>(null);
  const [locations, setLocations] = useState<OfficeLocation[]>([]);
  const [shifts, setShifts] = useState<WorkShift[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);

  // State for forms
  const [orgName, setOrgName] = useState('');
  const [orgDomain, setOrgDomain] = useState('');
  const [orgLogo, setOrgLogo] = useState('');
  const [orgAddress, setOrgAddress] = useState('');

  // Location form state
  const [editingLocId, setEditingLocId] = useState<string | null>(null);
  const [locName, setLocName] = useState('');
  const [locTz, setLocTz] = useState('Asia/Kolkata');
  const [locLat, setLocLat] = useState('0');
  const [locLng, setLocLng] = useState('0');
  const [locRadius, setLocRadius] = useState(100);

  // Shift form state
  const [editingShiftId, setEditingShiftId] = useState<string | null>(null);
  const [shiftName, setShiftName] = useState('');
  const [shiftStart, setShiftStart] = useState('09:00');
  const [shiftEnd, setShiftEnd] = useState('18:00');
  const [shiftGrace, setShiftGrace] = useState(15);

  // Holiday form state
  const [editingHolidayId, setEditingHolidayId] = useState<string | null>(null);
  const [holidayName, setHolidayName] = useState('');
  const [holidayDate, setHolidayDate] = useState('');
  const [holidayOptional, setHolidayOptional] = useState(false);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const orgs = await organizationService.getOrgs();
      if (orgs && orgs.length > 0) {
        const primaryOrg = orgs[0];
        setOrg(primaryOrg);
        setOrgName(primaryOrg.name);
        setOrgDomain(primaryOrg.domain);
        setOrgLogo(primaryOrg.logoUrl || '');
        setOrgAddress(primaryOrg.address || '');
      }

      const locList = await organizationService.getLocations();
      setLocations(locList);

      const shiftList = await organizationService.getShifts();
      setShifts(shiftList);

      const holidayList = await organizationService.getHolidays();
      setHolidays(holidayList);
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve organization settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!org) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const updated = await organizationService.updateOrg(org._id, {
        name: orgName,
        domain: orgDomain,
        logoUrl: orgLogo,
        address: orgAddress,
      });
      setOrg(updated);
      setSuccess('Organization details updated successfully.');
    } catch (err: any) {
      setError(err.message || 'Failed to save organization changes.');
    } finally {
      setSaving(false);
    }
  };

  // Location CRUD operations
  const handleSaveLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const payload = {
        name: locName,
        timezone: locTz,
        coordinates: {
          latitude: parseFloat(locLat) || 0,
          longitude: parseFloat(locLng) || 0,
        },
        geofenceRadius: locRadius,
      };

      if (editingLocId) {
        await organizationService.updateLocation(editingLocId, payload);
        setSuccess('Location updated successfully.');
      } else {
        await organizationService.createLocation(payload);
        setSuccess('New location created successfully.');
      }

      setLocName('');
      setLocRadius(100);
      setEditingLocId(null);
      const locList = await organizationService.getLocations();
      setLocations(locList);
    } catch (err: any) {
      setError(err.message || 'Failed to save location details.');
    } finally {
      setSaving(false);
    }
  };

  const handleEditLocation = (loc: OfficeLocation) => {
    setEditingLocId(loc._id);
    setLocName(loc.name);
    setLocTz(loc.timezone);
    setLocLat(loc.coordinates?.latitude?.toString() || '0');
    setLocLng(loc.coordinates?.longitude?.toString() || '0');
    setLocRadius(loc.geofenceRadius);
  };

  const handleDeleteLocation = async (id: string) => {
    if (!window.confirm('Delete this location workspace?')) return;
    setError(null);
    setSuccess(null);
    try {
      await organizationService.deleteLocation(id);
      setSuccess('Location deleted successfully.');
      setLocations(locations.filter((l) => l._id !== id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete location.');
    }
  };

  // Shift CRUD operations
  const handleSaveShift = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const payload = {
        name: shiftName,
        startTime: shiftStart,
        endTime: shiftEnd,
        gracePeriodMins: shiftGrace,
      };

      if (editingShiftId) {
        await organizationService.updateShift(editingShiftId, payload);
        setSuccess('Shift updated successfully.');
      } else {
        await organizationService.createShift(payload);
        setSuccess('New work shift created successfully.');
      }

      setShiftName('');
      setShiftStart('09:00');
      setShiftEnd('18:00');
      setShiftGrace(15);
      setEditingShiftId(null);
      const shiftList = await organizationService.getShifts();
      setShifts(shiftList);
    } catch (err: any) {
      setError(err.message || 'Failed to save shift details.');
    } finally {
      setSaving(false);
    }
  };

  const handleEditShift = (shift: WorkShift) => {
    setEditingShiftId(shift._id);
    setShiftName(shift.name);
    setShiftStart(shift.startTime);
    setShiftEnd(shift.endTime);
    setShiftGrace(shift.gracePeriodMins);
  };

  const handleDeleteShift = async (id: string) => {
    if (!window.confirm('Delete this work shift?')) return;
    setError(null);
    setSuccess(null);
    try {
      await organizationService.deleteShift(id);
      setSuccess('Work shift deleted successfully.');
      setShifts(shifts.filter((s) => s._id !== id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete shift.');
    }
  };

  // Holiday CRUD operations
  const handleSaveHoliday = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const payload = {
        name: holidayName,
        date: holidayDate,
        isOptional: holidayOptional,
      };

      if (editingHolidayId) {
        await organizationService.updateHoliday(editingHolidayId, payload);
        setSuccess('Holiday updated successfully.');
      } else {
        await organizationService.createHoliday(payload);
        setSuccess('New holiday created successfully.');
      }

      setHolidayName('');
      setHolidayDate('');
      setHolidayOptional(false);
      setEditingHolidayId(null);
      const holidayList = await organizationService.getHolidays();
      setHolidays(holidayList);
    } catch (err: any) {
      setError(err.message || 'Failed to save holiday details.');
    } finally {
      setSaving(false);
    }
  };

  const handleEditHoliday = (hol: Holiday) => {
    setEditingHolidayId(hol._id);
    setHolidayName(hol.name);
    setHolidayDate(new Date(hol.date).toISOString().split('T')[0]);
    setHolidayOptional(hol.isOptional);
  };

  const handleDeleteHoliday = async (id: string) => {
    if (!window.confirm('Delete this calendar holiday?')) return;
    setError(null);
    setSuccess(null);
    try {
      await organizationService.deleteHoliday(id);
      setSuccess('Holiday deleted successfully.');
      setHolidays(holidays.filter((h) => h._id !== id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete holiday.');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="animate-spin text-indigo-500" size={32} />
        <p className="text-slate-400 text-sm font-medium">Fetching organization control settings...</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-slate-300 to-indigo-300">
          Organization Settings
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Configure multi-tenant structures, office geofence locations, default shifts, and regional holidays.
        </p>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-slate-800/80 gap-2 pb-px overflow-x-auto scrollbar-none">
        {[
          { key: 'profile', label: 'Company Profile', icon: Building },
          { key: 'locations', label: 'Office Locations', icon: MapPin },
          { key: 'shifts', label: 'Work Shifts', icon: Clock },
          { key: 'holidays', label: 'Holiday Calendar', icon: Calendar },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key as any);
                setError(null);
                setSuccess(null);
              }}
              className={`flex items-center gap-2 px-5 py-3 border-b-2 font-bold text-sm transition-all duration-205 cursor-pointer whitespace-nowrap ${
                activeTab === tab.key
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
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

      {/* Tab Panels */}
      <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-6 md:p-8 shadow-xl backdrop-blur-md">
        
        {/* Tab 1: Organization Profile */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSaveOrg} className="space-y-6">
            <h3 className="text-lg font-bold text-slate-200 border-b border-slate-800 pb-3 flex items-center gap-2">
              <Settings size={18} className="text-indigo-400" /> General Company details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-slate-400 text-xs font-semibold uppercase">Organization Name</label>
                <input
                  type="text"
                  required
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 text-xs font-semibold uppercase">Primary Domain</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Globe size={16} />
                  </div>
                  <input
                    type="text"
                    required
                    value={orgDomain}
                    onChange={(e) => setOrgDomain(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 text-xs font-semibold uppercase">Company Logo URL</label>
                <input
                  type="text"
                  value={orgLogo}
                  onChange={(e) => setOrgLogo(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 text-xs font-semibold uppercase">Registered Address</label>
                <input
                  type="text"
                  value={orgAddress}
                  onChange={(e) => setOrgAddress(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500 text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-950/20 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              <span>Save Profile</span>
            </button>
          </form>
        )}

        {/* Tab 2: Locations */}
        {activeTab === 'locations' && (
          <div className="space-y-8">
            <form onSubmit={handleSaveLocation} className="space-y-6 bg-slate-950/30 p-6 rounded-2xl border border-slate-800/80">
              <h4 className="text-sm font-bold uppercase tracking-wider text-indigo-400">
                {editingLocId ? 'Edit Location' : 'Add New Location Office'}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-400 text-xs font-semibold">Office Name</label>
                  <input
                    type="text"
                    required
                    value={locName}
                    onChange={(e) => setLocName(e.target.value)}
                    placeholder="e.g. Bangalore Headquarters"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-slate-400 text-xs font-semibold">Timezone</label>
                  <input
                    type="text"
                    required
                    value={locTz}
                    onChange={(e) => setLocTz(e.target.value)}
                    placeholder="e.g. Asia/Kolkata"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-slate-400 text-xs font-semibold">Latitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    required
                    value={locLat}
                    onChange={(e) => setLocLat(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-slate-400 text-xs font-semibold">Longitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    required
                    value={locLng}
                    onChange={(e) => setLocLng(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-slate-400 text-xs font-semibold">Geofence Radius (meters)</label>
                  <input
                    type="number"
                    required
                    value={locRadius}
                    onChange={(e) => setLocRadius(parseInt(e.target.value) || 100)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Plus size={14} />
                  <span>{editingLocId ? 'Update' : 'Add Location'}</span>
                </button>
                {editingLocId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingLocId(null);
                      setLocName('');
                    }}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold text-slate-300 cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>

            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-400">Office Workspaces Registry</h4>
              {locations.length === 0 ? (
                <p className="text-xs text-slate-500">No locations added yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {locations.map((loc) => (
                    <div key={loc._id} className="bg-slate-950/60 p-4 border border-slate-800/80 rounded-xl flex items-center justify-between">
                      <div>
                        <div className="font-bold text-sm text-slate-200">{loc.name}</div>
                        <div className="text-xs text-slate-400 mt-1">TZ: {loc.timezone} | Radius: {loc.geofenceRadius}m</div>
                        <div className="text-xs text-slate-500 font-mono mt-0.5">Lat: {loc.coordinates?.latitude}, Lng: {loc.coordinates?.longitude}</div>
                      </div>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleEditLocation(loc)}
                          className="p-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteLocation(loc._id)}
                          className="p-1.5 bg-slate-900 border border-slate-800 rounded-lg text-rose-500 hover:text-rose-450 transition-colors"
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
        )}

        {/* Tab 3: Shifts */}
        {activeTab === 'shifts' && (
          <div className="space-y-8">
            <form onSubmit={handleSaveShift} className="space-y-6 bg-slate-950/30 p-6 rounded-2xl border border-slate-800/80">
              <h4 className="text-sm font-bold uppercase tracking-wider text-indigo-400">
                {editingShiftId ? 'Edit Work Shift' : 'Add New Work Shift'}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-400 text-xs font-semibold">Shift Name</label>
                  <input
                    type="text"
                    required
                    value={shiftName}
                    onChange={(e) => setShiftName(e.target.value)}
                    placeholder="e.g. Standard Morning Shift"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-slate-400 text-xs font-semibold">Start Time (HH:MM)</label>
                  <input
                    type="text"
                    required
                    value={shiftStart}
                    onChange={(e) => setShiftStart(e.target.value)}
                    placeholder="09:00"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-slate-400 text-xs font-semibold">End Time (HH:MM)</label>
                  <input
                    type="text"
                    required
                    value={shiftEnd}
                    onChange={(e) => setShiftEnd(e.target.value)}
                    placeholder="18:00"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-slate-400 text-xs font-semibold">Grace Period (Minutes)</label>
                  <input
                    type="number"
                    required
                    value={shiftGrace}
                    onChange={(e) => setShiftGrace(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Plus size={14} />
                  <span>{editingShiftId ? 'Update' : 'Add Shift'}</span>
                </button>
                {editingShiftId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingShiftId(null);
                      setShiftName('');
                    }}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold text-slate-300 cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>

            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-400">Work Shifts List</h4>
              {shifts.length === 0 ? (
                <p className="text-xs text-slate-500">No shifts created yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {shifts.map((s) => (
                    <div key={s._id} className="bg-slate-950/60 p-4 border border-slate-800/80 rounded-xl flex items-center justify-between">
                      <div>
                        <div className="font-bold text-sm text-slate-200">{s.name}</div>
                        <div className="text-xs text-slate-400 mt-1">Time: {s.startTime} - {s.endTime}</div>
                        <div className="text-xs text-slate-500 mt-0.5">Grace Period: {s.gracePeriodMins} minutes</div>
                      </div>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleEditShift(s)}
                          className="p-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteShift(s._id)}
                          className="p-1.5 bg-slate-900 border border-slate-800 rounded-lg text-rose-500 hover:text-rose-450 transition-colors"
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
        )}

        {/* Tab 4: Holidays */}
        {activeTab === 'holidays' && (
          <div className="space-y-8">
            <form onSubmit={handleSaveHoliday} className="space-y-6 bg-slate-950/30 p-6 rounded-2xl border border-slate-800/80">
              <h4 className="text-sm font-bold uppercase tracking-wider text-indigo-400">
                {editingHolidayId ? 'Edit Holiday' : 'Add New Corporate Holiday'}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-400 text-xs font-semibold">Holiday Name</label>
                  <input
                    type="text"
                    required
                    value={holidayName}
                    onChange={(e) => setHolidayName(e.target.value)}
                    placeholder="e.g. Independence Day"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-slate-400 text-xs font-semibold">Holiday Date</label>
                  <input
                    type="date"
                    required
                    value={holidayDate}
                    onChange={(e) => setHolidayDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none cursor-pointer"
                  />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="isOptional"
                    checked={holidayOptional}
                    onChange={(e) => setHolidayOptional(e.target.checked)}
                    className="w-4 h-4 rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <label htmlFor="isOptional" className="text-slate-300 text-sm font-medium cursor-pointer">
                    Is Optional / Restricted Holiday
                  </label>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Plus size={14} />
                  <span>{editingHolidayId ? 'Update' : 'Add Holiday'}</span>
                </button>
                {editingHolidayId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingHolidayId(null);
                      setHolidayName('');
                    }}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold text-slate-300 cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>

            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-400">Corporate Holidays Calendar</h4>
              {holidays.length === 0 ? (
                <p className="text-xs text-slate-500">No holidays added yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {holidays.map((h) => (
                    <div key={h._id} className="bg-slate-950/60 p-4 border border-slate-800/80 rounded-xl flex items-center justify-between">
                      <div>
                        <div className="font-bold text-sm text-slate-200">{h.name}</div>
                        <div className="text-xs text-indigo-400 mt-1 font-bold">{new Date(h.date).toLocaleDateString()}</div>
                        {h.isOptional && (
                          <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-950 border border-amber-500/20 text-amber-400">
                            Optional Holiday
                          </span>
                        )}
                      </div>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleEditHoliday(h)}
                          className="p-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteHoliday(h._id)}
                          className="p-1.5 bg-slate-900 border border-slate-800 rounded-lg text-rose-500 hover:text-rose-450 transition-colors"
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
        )}

      </div>
    </div>
  );
};

export default OrganizationSettingsPage;
