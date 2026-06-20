import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, NavLink } from 'react-router';
import { registerUser } from '../authSlice';
import { Rocket, Sparkles, User, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { CosmicStyles, CosmicBackground, CursorSmoke } from '../components/CosmicTheme';

const signupSchema = z.object({
  firstName: z.string().min(3, "Minimum character should be 3"),
  emailId: z.string().email("Invalid Email"),
  password: z.string().min(8, "Password is too weak"),
});

function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(signupSchema) });

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = (data) => {
    dispatch(registerUser(data));
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#06060b] text-slate-200 antialiased font-sans flex items-center justify-center p-4">
      <CosmicStyles />
      <CosmicBackground />
      <CursorSmoke />

      {/* Signup Card */}
      <div className="relative z-10 w-full max-w-md">
        <div
          className="rounded-3xl p-px bg-gradient-to-br from-cyan-400/40 via-violet-500/25 to-fuchsia-400/40 shadow-[0_0_90px_-25px_rgba(34,211,238,0.45)] transition-transform duration-500 hover:-translate-y-1"
          style={{ transform: 'perspective(1200px) rotateX(2deg)' }}
        >
          <div className="rounded-3xl bg-[#0b0a18]/90 backdrop-blur-2xl border border-white/[0.06] p-8 sm:p-9">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 via-violet-500 to-fuchsia-400 flex items-center justify-center shadow-[0_0_40px_-8px_rgba(34,211,238,0.6)]">
                <Rocket size={26} className="text-white" />
              </div>
            </div>

            {/* Eyebrow */}
            <div className="flex justify-center mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/10 bg-white/[0.03] text-[11px] tracking-wide uppercase text-slate-400 font-data">
                <Sparkles size={12} className="text-cyan-300" /> Leetcode
              </span>
            </div>

            {/* Title */}
            <h1 className="text-center text-3xl sm:text-4xl font-bold font-display text-white mb-2">
              Create{' '}
              <span className="bg-gradient-to-r from-cyan-300 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                Account
              </span>
            </h1>
            <p className="text-center text-slate-400 text-sm mb-7">
              Start solving, tracking, and leveling up your coding skills
            </p>

            {/* Auth error banner */}
            {error && (
              <div className="mb-5 flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/[0.06] px-3.5 py-2.5 text-sm text-rose-300">
                <AlertCircle size={15} className="shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              {/* First Name */}
              <div>
                <label htmlFor="firstName" className="block text-xs font-medium font-display text-slate-300 mb-1.5">
                  First name
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    id="firstName"
                    type="text"
                    placeholder="John"
                    autoComplete="given-name"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 transition-colors ${
                      errors.firstName
                        ? 'border-rose-500/60 focus:ring-rose-500/20'
                        : 'border-white/10 focus:border-cyan-400/50 focus:ring-cyan-400/20'
                    }`}
                    {...register('firstName')}
                  />
                </div>
                {errors.firstName && (
                  <p className="text-rose-400 text-xs mt-1.5">{errors.firstName.message}</p>
                )}
              </div>

              {/* Email */}
              <div className="mt-5">
                <label htmlFor="emailId" className="block text-xs font-medium font-display text-slate-300 mb-1.5">
                  Email address
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    id="emailId"
                    type="email"
                    placeholder="john@example.com"
                    autoComplete="email"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 transition-colors ${
                      errors.emailId
                        ? 'border-rose-500/60 focus:ring-rose-500/20'
                        : 'border-white/10 focus:border-cyan-400/50 focus:ring-cyan-400/20'
                    }`}
                    {...register('emailId')}
                  />
                </div>
                {errors.emailId && (
                  <p className="text-rose-400 text-xs mt-1.5">{errors.emailId.message}</p>
                )}
              </div>

              {/* Password */}
              <div className="mt-5">
                <label htmlFor="password" className="block text-xs font-medium font-display text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className={`w-full pl-10 pr-11 py-2.5 rounded-xl bg-white/[0.04] border text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 transition-colors ${
                      errors.password
                        ? 'border-rose-500/60 focus:ring-rose-500/20'
                        : 'border-white/10 focus:border-violet-400/50 focus:ring-violet-400/20'
                    }`}
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-cyan-300 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60 rounded"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-rose-400 text-xs mt-1.5">{errors.password.message}</p>
                )}
              </div>

              {/* Button */}
              <div className="mt-7">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-cyan-400 via-violet-500 to-fuchsia-500 text-white text-sm font-semibold font-display shadow-[0_0_35px_-10px_rgba(34,211,238,0.6)] hover:brightness-110 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                      Signing up…
                    </>
                  ) : (
                    'Sign Up'
                  )}
                </button>
              </div>
            </form>

            {/* Login link */}
            <div className="text-center mt-6 text-slate-400 text-sm">
              Already have an account?
              <NavLink
                to="/login"
                className="ml-1.5 text-cyan-300 font-semibold hover:text-cyan-200 transition-colors"
              >
                Login
              </NavLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;
