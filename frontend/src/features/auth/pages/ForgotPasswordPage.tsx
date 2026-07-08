import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, Loader2, ShieldAlert, CheckCircle2, ArrowLeft } from 'lucide-react';
import { forgotPasswordApi, resetPasswordApi } from '../services/authService';

const emailStepSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
});

const passwordStepSchema = z.object({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long'),
  confirmPassword: z
    .string()
    .min(8, 'Confirm password must be at least 8 characters long'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type EmailStepValues = z.infer<typeof emailStepSchema>;
type PasswordStepValues = z.infer<typeof passwordStepSchema>;

export function ForgotPasswordPage() {
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);
  const [resetToken, setResetToken] = useState<string | null>(null);

  // Form for Email Step
  const emailForm = useForm<EmailStepValues>({
    resolver: zodResolver(emailStepSchema),
    defaultValues: { email: '' },
  });

  // Form for Password Step
  const passwordForm = useForm<PasswordStepValues>({
    resolver: zodResolver(passwordStepSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const onEmailSubmit = async (values: EmailStepValues) => {
    setApiError(null);
    setSuccessMsg(null);
    setIsSubmitting(true);
    try {
      const response = await forgotPasswordApi(values.email);
      if (response.status === 'success' && response.data?.resetToken) {
        setVerifiedEmail(values.email);
        setResetToken(response.data.resetToken);
        setSuccessMsg('Account verified. Please set your new password below.');
      } else {
        setApiError(response.message || 'Verification failed. Try again.');
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Email address not found or connection lost.';
      setApiError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onPasswordSubmit = async (values: PasswordStepValues) => {
    if (!resetToken) return;
    setApiError(null);
    setSuccessMsg(null);
    setIsSubmitting(true);
    try {
      const response = await resetPasswordApi(resetToken, values.password);
      if (response.status === 'success') {
        setSuccessMsg('Password reset successful! Redirecting to login...');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        setApiError(response.message || 'Reset failed. Please try again.');
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to reset password. Token might be expired.';
      setApiError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-slate-950 overflow-hidden font-sans p-4">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-violet-600/10 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md z-10">
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center p-3 bg-gradient-to-tr from-indigo-500 to-violet-500 rounded-xl shadow-lg shadow-indigo-500/20 mb-2">
              <span className="text-white font-extrabold text-2xl tracking-wider">WFM</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">
              {resetToken ? 'Set New Password' : 'Reset Password'}
            </h1>
            <p className="text-slate-400 text-sm">
              {resetToken
                ? `Provide the new login credentials for ${verifiedEmail}`
                : 'Enter your work email to verify and directly update your password.'}
            </p>
          </div>

          {apiError && (
            <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 flex items-start gap-3 animate-shake">
              <ShieldAlert className="text-rose-400 shrink-0 mt-0.5" size={18} />
              <div className="text-rose-300 text-sm font-medium">{apiError}</div>
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex items-start gap-3">
              <CheckCircle2 className="text-emerald-400 shrink-0 mt-0.5" size={18} />
              <div className="text-emerald-300 text-sm font-medium">{successMsg}</div>
            </div>
          )}

          {!resetToken ? (
            /* Step 1: Input email */
            <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-5">
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
                    {...emailForm.register('email')}
                  />
                </div>
                {emailForm.formState.errors.email && (
                  <p className="text-rose-400 text-xs mt-1 font-medium">{emailForm.formState.errors.email.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full relative flex items-center justify-center py-3 px-4 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-500/10 transition-all duration-300 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={18} />
                    <span>Verifying Account...</span>
                  </>
                ) : (
                  <span>Verify Account</span>
                )}
              </button>

              <div className="text-center pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-200 text-xs font-semibold transition-colors"
                >
                  <ArrowLeft size={14} />
                  Back to Sign In
                </Link>
              </div>
            </form>
          ) : (
            /* Step 2: Input new password directly on-screen */
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-slate-300 text-xs font-semibold uppercase tracking-wider block">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    disabled={isSubmitting}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all disabled:opacity-50"
                    placeholder="••••••••"
                    {...passwordForm.register('password')}
                  />
                </div>
                {passwordForm.formState.errors.password && (
                  <p className="text-rose-400 text-xs mt-1 font-medium">{passwordForm.formState.errors.password.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 text-xs font-semibold uppercase tracking-wider block">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    disabled={isSubmitting}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all disabled:opacity-50"
                    placeholder="••••••••"
                    {...passwordForm.register('confirmPassword')}
                  />
                </div>
                {passwordForm.formState.errors.confirmPassword && (
                  <p className="text-rose-400 text-xs mt-1 font-medium">{passwordForm.formState.errors.confirmPassword.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full relative flex items-center justify-center py-3 px-4 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-500/10 transition-all duration-300 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={18} />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <span>Update Password</span>
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setResetToken(null);
                    setSuccessMsg(null);
                    setApiError(null);
                  }}
                  className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-200 text-xs font-semibold transition-colors"
                >
                  <ArrowLeft size={14} />
                  Back to Email Step
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
