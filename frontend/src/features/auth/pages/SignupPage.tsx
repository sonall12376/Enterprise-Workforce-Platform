import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Mail, Lock, Phone, Calendar, ArrowLeft, Loader2, ShieldCheck, ShieldAlert } from 'lucide-react';
import { signupApi } from '../services/authService';

const signupFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required').trim(),
  lastName: z.string().min(1, 'Last name is required').trim(),
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  phone: z.string().min(5, 'Phone number must be at least 5 characters').trim(),
  gender: z.enum(['Male', 'Female', 'Other']),
  dob: z.string().min(1, 'Date of birth is required'),
  role: z.enum(['SuperAdmin', 'OrgAdmin', 'HR', 'Manager', 'Employee']),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  confirmPassword: z.string().min(8, 'Confirm password must be at least 8 characters long'),
  emergencyContactName: z.string().min(1, 'Emergency contact name is required').trim(),
  emergencyContactRelationship: z.string().min(1, 'Relationship is required').trim(),
  emergencyContactPhone: z.string().min(5, 'Emergency contact phone is required').trim(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type SignupFormValues = z.infer<typeof signupFormSchema>;

export function SignupPage() {
  const navigate = useNavigate();
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      gender: 'Female', // default
      dob: '',
      role: 'Employee',
      password: '',
      confirmPassword: '',
      emergencyContactName: '',
      emergencyContactRelationship: '',
      emergencyContactPhone: '',
    },
  });

  const onSubmit = async (values: SignupFormValues) => {
    setApiError(null);
    setSuccessMsg(null);
    setIsSubmitting(true);
    try {
      // Map flat form keys to structured schema
      const payload = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phone: values.phone,
        gender: values.gender,
        dob: values.dob,
        role: values.role,
        password: values.password,
        confirmPassword: values.confirmPassword,
        emergencyContact: {
          name: values.emergencyContactName,
          relationship: values.emergencyContactRelationship,
          phone: values.emergencyContactPhone,
        },
      };

      const response = await signupApi(payload);
      if (response.status === 'success') {
        setSuccessMsg(response.message || 'Account registered successfully! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setApiError(response.message || 'Signup failed. Please try again.');
      }
    } catch (error: any) {
      const msg =
        error.response?.data?.message ||
        'Unable to connect to the server. Please check your connection.';
      setApiError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-slate-950 overflow-y-auto font-sans p-6 md:p-12">
      {/* Background blobs */}
      <div className="absolute top-[-25%] left-[-15%] w-[600px] h-[600px] rounded-full bg-indigo-600/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-25%] right-[-15%] w-[600px] h-[600px] rounded-full bg-violet-600/10 blur-[130px] pointer-events-none" />

      <div className="w-full max-w-3xl z-10 py-6">
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl p-8 md:p-10 space-y-6">
          
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center p-3 bg-gradient-to-tr from-indigo-500 to-violet-500 rounded-xl shadow-lg shadow-indigo-500/20 mb-2">
              <span className="text-white font-extrabold text-xl tracking-wider">WFM</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">Create Workspace Account</h1>
            <p className="text-slate-400 text-sm max-w-md mx-auto">
              Fill in your details below to register yourself within the enterprise directory list.
            </p>
          </div>

          {/* Success / Error Boxes */}
          {apiError && (
            <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 flex items-start gap-3 animate-shake">
              <ShieldAlert className="text-rose-400 shrink-0 mt-0.5" size={18} />
              <div className="text-rose-300 text-sm font-medium">{apiError}</div>
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 flex items-start gap-3">
              <ShieldCheck className="text-emerald-400 shrink-0 mt-0.5" size={18} />
              <div className="text-emerald-300 text-sm font-medium">{successMsg}</div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Section 1: Basic Profile */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest border-b border-slate-800/80 pb-2">
                1. Personal Credentials
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-300 text-xs font-semibold uppercase tracking-wider block">First Name</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-3.5 text-slate-500" />
                    <input
                      type="text"
                      disabled={isSubmitting}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                      placeholder="Jane"
                      {...register('firstName')}
                    />
                  </div>
                  {errors.firstName && <p className="text-rose-400 text-xs mt-1">{errors.firstName.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-300 text-xs font-semibold uppercase tracking-wider block">Last Name</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-3.5 text-slate-500" />
                    <input
                      type="text"
                      disabled={isSubmitting}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                      placeholder="Doe"
                      {...register('lastName')}
                    />
                  </div>
                  {errors.lastName && <p className="text-rose-400 text-xs mt-1">{errors.lastName.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-300 text-xs font-semibold uppercase tracking-wider block">Email Address</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-3.5 text-slate-500" />
                    <input
                      type="email"
                      disabled={isSubmitting}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                      placeholder="jane.doe@organization.com"
                      {...register('email')}
                    />
                  </div>
                  {errors.email && <p className="text-rose-400 text-xs mt-1">{errors.email.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-300 text-xs font-semibold uppercase tracking-wider block">Phone Number</label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3.5 top-3.5 text-slate-500" />
                    <input
                      type="text"
                      disabled={isSubmitting}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                      placeholder="+919876543210"
                      {...register('phone')}
                    />
                  </div>
                  {errors.phone && <p className="text-rose-400 text-xs mt-1">{errors.phone.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-300 text-xs font-semibold uppercase tracking-wider block">Gender</label>
                  <select
                    disabled={isSubmitting}
                    className="w-full px-3.5 py-2.5 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                    {...register('gender')}
                  >
                    <option value="Female" className="bg-slate-950 text-slate-300">Female</option>
                    <option value="Male" className="bg-slate-950 text-slate-300">Male</option>
                    <option value="Other" className="bg-slate-950 text-slate-300">Other</option>
                  </select>
                  {errors.gender && <p className="text-rose-400 text-xs mt-1">{errors.gender.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-300 text-xs font-semibold uppercase tracking-wider block">Date of Birth</label>
                  <div className="relative">
                    <Calendar size={16} className="absolute left-3.5 top-3.5 text-slate-500 pointer-events-none" />
                    <input
                      type="date"
                      disabled={isSubmitting}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none"
                      {...register('dob')}
                    />
                  </div>
                  {errors.dob && <p className="text-rose-400 text-xs mt-1">{errors.dob.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-300 text-xs font-semibold uppercase tracking-wider block">Target Role</label>
                  <select
                    disabled={isSubmitting}
                    className="w-full px-3.5 py-2.5 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none"
                    {...register('role')}
                  >
                    <option value="Employee" className="bg-slate-950 text-slate-300">Employee</option>
                    <option value="Manager" className="bg-slate-950 text-slate-300">Manager</option>
                    <option value="HR" className="bg-slate-950 text-slate-300">HR Manager</option>
                    <option value="OrgAdmin" className="bg-slate-950 text-slate-300">Organization Admin</option>
                    <option value="SuperAdmin" className="bg-slate-950 text-slate-300">Super Admin</option>
                  </select>
                  {errors.role && <p className="text-rose-400 text-xs mt-1">{errors.role.message}</p>}
                </div>
              </div>
            </div>

            {/* Section 2: Security */}
            <div className="space-y-4 pt-2">
              <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest border-b border-slate-800/80 pb-2">
                2. Security Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-300 text-xs font-semibold uppercase tracking-wider block">Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-3.5 text-slate-500" />
                    <input
                      type="password"
                      disabled={isSubmitting}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500"
                      placeholder="••••••••"
                      {...register('password')}
                    />
                  </div>
                  {errors.password && <p className="text-rose-400 text-xs mt-1">{errors.password.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-300 text-xs font-semibold uppercase tracking-wider block">Confirm Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-3.5 text-slate-500" />
                    <input
                      type="password"
                      disabled={isSubmitting}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500"
                      placeholder="••••••••"
                      {...register('confirmPassword')}
                    />
                  </div>
                  {errors.confirmPassword && <p className="text-rose-400 text-xs mt-1">{errors.confirmPassword.message}</p>}
                </div>
              </div>
            </div>

            {/* Section 3: Emergency Contact */}
            <div className="space-y-4 pt-2">
              <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest border-b border-slate-800/80 pb-2">
                3. Emergency Contact Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-300 text-xs font-semibold uppercase tracking-wider block">Contact Name</label>
                  <input
                    type="text"
                    disabled={isSubmitting}
                    className="w-full px-4 py-2.5 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-550 text-sm focus:outline-none"
                    placeholder="John Doe"
                    {...register('emergencyContactName')}
                  />
                  {errors.emergencyContactName && <p className="text-rose-400 text-xs mt-1">{errors.emergencyContactName.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-300 text-xs font-semibold uppercase tracking-wider block">Relationship</label>
                  <input
                    type="text"
                    disabled={isSubmitting}
                    className="w-full px-4 py-2.5 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-550 text-sm focus:outline-none"
                    placeholder="Spouse"
                    {...register('emergencyContactRelationship')}
                  />
                  {errors.emergencyContactRelationship && <p className="text-rose-400 text-xs mt-1">{errors.emergencyContactRelationship.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-300 text-xs font-semibold uppercase tracking-wider block">Contact Phone</label>
                  <input
                    type="text"
                    disabled={isSubmitting}
                    className="w-full px-4 py-2.5 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-550 text-sm focus:outline-none"
                    placeholder="+919876543211"
                    {...register('emergencyContactPhone')}
                  />
                  {errors.emergencyContactPhone && <p className="text-rose-400 text-xs mt-1">{errors.emergencyContactPhone.message}</p>}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 border-t border-slate-800/80">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:flex-1 relative flex items-center justify-center py-3 px-4 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-500/10 transition-all duration-300 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={18} />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <span>Register Account</span>
                )}
              </button>
              
              <Link
                to="/login"
                className="w-full sm:w-auto text-center py-3 px-6 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-sm rounded-xl transition-all border border-slate-700 flex items-center justify-center gap-2"
              >
                <ArrowLeft size={16} />
                <span>Return to Login</span>
              </Link>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;
