import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, Eye, EyeOff, Loader2, ShieldAlert, ArrowRight, Bot, Briefcase, Users, Sparkles } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { loginApi } from '../services/authService';

const loginFormSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long'),
  role: z
    .enum(['SuperAdmin', 'OrgAdmin', 'HR', 'Manager', 'Employee'], { required_error: 'Role is required' }),
  rememberMe: z.boolean().default(false),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);

  // If already authenticated, redirect to home page
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
      role: 'Employee',
      rememberMe: false,
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setApiError(null);
    setIsSubmitting(true);
    try {
      const response = await loginApi(values.email, values.password, values.role);
      if (response.status === 'success' && response.data) {
        // Save auth data using Context Provider
        login(response.data.accessToken, response.data.user, response.data.refreshToken);
        navigate('/');
      } else {
        setApiError(response.message || 'Login failed. Please try again.');
      }
    } catch (error: any) {
      // Handle Axios or network error
      const msg =
        error.response?.data?.message ||
        'Unable to connect to the authentication server. Please check your connection.';
      setApiError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!showLoginForm) {
    return (
      <div className="min-h-screen relative flex items-center justify-center bg-slate-950 overflow-hidden font-sans p-4 md:p-8">
        {/* Decorative Background Elements */}
        <div className="absolute top-[-25%] left-[-15%] w-[600px] h-[600px] rounded-full bg-indigo-600/10 blur-[130px] pointer-events-none" />
        <div className="absolute bottom-[-25%] right-[-15%] w-[600px] h-[600px] rounded-full bg-violet-600/10 blur-[130px] pointer-events-none" />

        <div className="max-w-4xl w-full z-10 space-y-10 animate-fade-in text-center md:text-left">
          {/* Brand Header */}
          <div className="flex flex-col md:flex-row items-center justify-between border-b border-slate-800/80 pb-6 gap-4">
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center justify-center p-2.5 bg-gradient-to-tr from-indigo-500 to-violet-500 rounded-xl shadow-lg shadow-indigo-500/20">
                <span className="text-white font-extrabold text-xl tracking-wider">WFM</span>
              </div>
              <span className="text-lg font-black tracking-wider text-slate-100 uppercase">Enterprise WFM</span>
            </div>
            <div className="text-xs text-slate-400 font-bold bg-slate-900/60 border border-slate-800 px-3 py-1.5 rounded-full backdrop-blur-md">
              Platform Release v1.4.2
            </div>
          </div>

          {/* Hero Content */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-7 space-y-5">
              <h1 className="text-4xl md:text-5xl font-black text-slate-100 leading-tight">
                Enterprise Workforce <br />
                <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-300 bg-clip-text text-transparent">
                  Management Platform
                </span>
              </h1>
              <p className="text-slate-400 text-sm leading-relaxed text-justify max-w-xl">
                The next-generation unified workspace controller. Seamlessly orchestrate employee lifecycles, geofenced shift attendance check-ins, automated leave approval pipelines, candidate funnel boards, support ticketing, and cognitive AI assistant operations.
              </p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2">
                <button
                  onClick={() => setShowLoginForm(true)}
                  className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-white bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 font-bold shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 transition-all duration-300 active:scale-[0.98] cursor-pointer text-sm"
                >
                  Launch Workspace Console
                  <ArrowRight size={16} />
                </button>
                <Link
                  to="/signup"
                  className="px-6 py-3.5 rounded-xl text-slate-300 hover:text-white bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 font-bold transition-all duration-300 text-sm"
                >
                  Register Organization
                </Link>
              </div>
            </div>

            {/* Feature Modules Grid */}
            <div className="md:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 bg-slate-900/40 backdrop-blur-xl border border-slate-850 rounded-2xl hover:border-indigo-500/20 transition-all duration-300 group">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                  <Bot size={20} />
                </div>
                <h3 className="font-bold text-slate-200 text-sm">AI Operations</h3>
                <p className="text-slate-500 text-[11px] mt-1.5 leading-relaxed text-justify">
                  Smart policy search, resume suitability matrix & transcripts compiler.
                </p>
              </div>

              <div className="p-5 bg-slate-900/40 backdrop-blur-xl border border-slate-850 rounded-2xl hover:border-indigo-500/20 transition-all duration-300 group">
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20 flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                  <Briefcase size={20} />
                </div>
                <h3 className="font-bold text-slate-200 text-sm">Recruitment Pool</h3>
                <p className="text-slate-500 text-[11px] mt-1.5 leading-relaxed text-justify">
                  Screen candidates, schedule tech rounds, and auto-convert to employee.
                </p>
              </div>

              <div className="p-5 bg-slate-900/40 backdrop-blur-xl border border-slate-850 rounded-2xl hover:border-indigo-500/20 transition-all duration-300 group">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                  <Users size={20} />
                </div>
                <h3 className="font-bold text-slate-200 text-sm">Directory Control</h3>
                <p className="text-slate-500 text-[11px] mt-1.5 leading-relaxed text-justify">
                  Manage department designations, shifts mapping & emergency logs.
                </p>
              </div>

              <div className="p-5 bg-slate-900/40 backdrop-blur-xl border border-slate-850 rounded-2xl hover:border-indigo-500/20 transition-all duration-300 group">
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20 flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                  <Sparkles size={20} />
                </div>
                <h3 className="font-bold text-slate-200 text-sm">Payroll & Attendance</h3>
                <p className="text-slate-500 text-[11px] mt-1.5 leading-relaxed text-justify">
                  Verified check-in tolerances, leave approvals & detailed payslips history.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-slate-950 overflow-hidden font-sans p-4">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-violet-600/10 blur-[120px] pointer-events-none" />
      
      {/* Login Card */}
      <div className="w-full max-w-md z-10">
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl p-8 space-y-6 transform transition-all duration-300 hover:border-indigo-500/30">
          
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center p-3 bg-gradient-to-tr from-indigo-500 to-violet-500 rounded-xl shadow-lg shadow-indigo-500/20 mb-2">
              <span className="text-white font-extrabold text-2xl tracking-wider">WFM</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">
              Welcome Back
            </h1>
            <p className="text-slate-400 text-sm">
              Enter your credentials to access the WFM platform.
            </p>
          </div>

          {/* API Error Box */}
          {apiError && (
            <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 flex items-start gap-3 animate-shake">
              <ShieldAlert className="text-rose-400 shrink-0 mt-0.5" size={18} />
              <div className="text-rose-300 text-sm font-medium">{apiError}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-slate-300 text-xs font-semibold uppercase tracking-wider block">
                Work Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  disabled={isSubmitting}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all disabled:opacity-50"
                  placeholder="employee@organization.com"
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="text-rose-400 text-xs mt-1 font-medium">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-slate-300 text-xs font-semibold uppercase tracking-wider block">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  disabled={isSubmitting}
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all disabled:opacity-50"
                  placeholder="••••••••••••"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-rose-400 text-xs mt-1 font-medium">{errors.password.message}</p>
              )}
            </div>

            {/* Role Selection Field */}
            <div className="space-y-1.5">
              <label className="text-slate-300 text-xs font-semibold uppercase tracking-wider block">
                Access Role
              </label>
              <select
                disabled={isSubmitting}
                className="w-full px-3 py-2.5 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all disabled:opacity-50 appearance-none cursor-pointer"
                {...register('role')}
              >
                <option value="Employee" className="bg-slate-950 text-slate-300">Employee (Staff Self-Service)</option>
                <option value="Manager" className="bg-slate-950 text-slate-300">Manager (Team Approval & Sprints)</option>
                <option value="HR" className="bg-slate-950 text-slate-300">HR Manager (Employee Lifecycle)</option>
                <option value="OrgAdmin" className="bg-slate-950 text-slate-300">Organization Admin (Tenant Operations)</option>
                <option value="SuperAdmin" className="bg-slate-950 text-slate-300">Super Admin (Platform Operator)</option>
              </select>
              {errors.role && (
                <p className="text-rose-400 text-xs mt-1 font-medium">{errors.role.message}</p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer group select-none">
                <input
                  type="checkbox"
                  disabled={isSubmitting}
                  className="w-4 h-4 rounded border-slate-800 bg-slate-950/50 text-indigo-600 focus:ring-0 focus:ring-offset-0 focus:outline-none transition-all disabled:opacity-50"
                  {...register('rememberMe')}
                />
                <span className="text-slate-400 text-xs group-hover:text-slate-300 transition-colors">
                  Remember this device
                </span>
              </label>
              <Link
                to="/forgot-password"
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full relative flex items-center justify-center py-3 px-4 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-500/10 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={18} />
                  <span>Signing In...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>

            {/* Signup Link */}
            <div className="text-center text-xs text-slate-400 pt-1">
              New user?{' '}
              <Link
                to="/signup"
                className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
              >
                Create an account
              </Link>
            </div>

            {/* Back button */}
            <div className="text-center text-[11px] text-slate-500 pt-2 border-t border-slate-800/80 mt-2">
              <button
                type="button"
                onClick={() => setShowLoginForm(false)}
                className="hover:text-slate-300 transition-colors cursor-pointer font-bold uppercase tracking-wider"
              >
                ← Back to Welcome Screen
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
