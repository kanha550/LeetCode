import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, NavLink } from 'react-router';
import { registerUser } from '../authSlice';
import { Eye, EyeOff, Code2, Lock, Mail, User, ArrowRight, Sparkles, Rocket } from 'lucide-react';

const signupSchema = z.object({
  firstName: z.string().min(3, "Minimum character should be 3"),
  emailId: z.string().email("Invalid Email"),
  password: z.string().min(8, "Password is too weak")
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-blue-500/20 rounded-full blur-3xl top-0 -left-48 animate-pulse"></div>
        <div className="absolute w-96 h-96 bg-purple-500/20 rounded-full blur-3xl bottom-0 -right-48 animate-pulse delay-700"></div>
        <div className="absolute w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse delay-1000"></div>
      </div>

      {/* Floating code symbols */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
        <div className="absolute top-20 left-20 text-6xl text-blue-400 animate-bounce delay-300">{'{ }'}</div>
        <div className="absolute bottom-32 right-32 text-5xl text-purple-400 animate-bounce delay-700">{'< />'}</div>
        <div className="absolute top-1/3 right-20 text-4xl text-cyan-400 animate-bounce delay-500">{'[ ]'}</div>
        <div className="absolute bottom-1/4 left-1/4 text-3xl text-indigo-400 animate-bounce delay-200">{'( )'}</div>
      </div>

      {/* Signup Card */}
      <div className="relative w-full max-w-md">
        {/* Glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-cyan-600 to-purple-600 rounded-2xl blur-xl opacity-75 animate-pulse"></div>
        
        {/* Main card */}
        <div className="relative bg-slate-800/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700/50 overflow-hidden">
          {/* Top gradient bar */}
          <div className="h-2 bg-gradient-to-r from-blue-500 via-cyan-500 to-purple-500"></div>
          
          <div className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              {/* Logo */}
              <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl shadow-lg shadow-blue-500/50 transform hover:rotate-12 transition-transform duration-300">
                <Code2 className="text-white" size={32} />
              </div>
              
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Join CodingAdda
              </h1>
              
              <p className="text-slate-400 flex items-center justify-center gap-2">
                <Rocket size={16} className="text-yellow-400" />
                Start your coding journey today
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* First Name Input */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-slate-300 font-medium flex items-center gap-2">
                    <User size={16} />
                    First Name
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="John"
                    className={`input w-full bg-slate-900/50 border-slate-600 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 ${
                      errors.firstName ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
                    }`}
                    {...register('firstName')}
                  />
                  {errors.firstName && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    </div>
                  )}
                </div>
                {errors.firstName && (
                  <span className="text-red-400 text-sm mt-2 flex items-center gap-1">
                    <span className="inline-block w-1 h-1 bg-red-400 rounded-full"></span>
                    {errors.firstName.message}
                  </span>
                )}
              </div>

              {/* Email Input */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-slate-300 font-medium flex items-center gap-2">
                    <Mail size={16} />
                    Email Address
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="john@example.com"
                    className={`input w-full bg-slate-900/50 border-slate-600 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 ${
                      errors.emailId ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
                    }`}
                    {...register('emailId')}
                  />
                  {errors.emailId && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    </div>
                  )}
                </div>
                {errors.emailId && (
                  <span className="text-red-400 text-sm mt-2 flex items-center gap-1">
                    <span className="inline-block w-1 h-1 bg-red-400 rounded-full"></span>
                    {errors.emailId.message}
                  </span>
                )}
              </div>

              {/* Password Input */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-slate-300 font-medium flex items-center gap-2">
                    <Lock size={16} />
                    Password
                  </span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className={`input w-full bg-slate-900/50 border-slate-600 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 pr-12 ${
                      errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
                    }`}
                    {...register('password')}
                  />
                  <button
                    type="button"
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-blue-400 transition-colors duration-200"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && (
                  <span className="text-red-400 text-sm mt-2 flex items-center gap-1">
                    <span className="inline-block w-1 h-1 bg-red-400 rounded-full"></span>
                    {errors.password.message}
                  </span>
                )}
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start gap-2 text-sm text-slate-400">
                <input 
                  type="checkbox" 
                  className="checkbox checkbox-sm checkbox-primary mt-0.5" 
                  defaultChecked 
                />
                <span>
                  I agree to the{' '}
                  <button type="button" className="text-blue-400 hover:text-blue-300 transition-colors">
                    Terms of Service
                  </button>
                  {' '}and{' '}
                  <button type="button" className="text-blue-400 hover:text-blue-300 transition-colors">
                    Privacy Policy
                  </button>
                </span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="btn w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 border-0 text-white font-semibold text-base h-12 shadow-lg shadow-blue-500/50 hover:shadow-blue-500/70 transition-all duration-300 group"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="divider text-slate-500 my-8">OR</div>

            {/* Social Signup */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button className="btn btn-outline border-slate-600 text-slate-300 hover:bg-slate-700 hover:border-slate-500">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              </button>
              <button className="btn btn-outline border-slate-600 text-slate-300 hover:bg-slate-700 hover:border-slate-500">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z"/>
                </svg>
              </button>
            </div>

            {/* Login Link */}
            <div className="text-center">
              <p className="text-slate-400">
                Already have an account?{' '}
                <NavLink 
                  to="/login" 
                  className="text-blue-400 hover:text-blue-300 font-semibold transition-colors duration-200"
                >
                  Login
                </NavLink>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom tagline */}
        <div className="text-center mt-6">
          <p className="text-slate-500 text-sm flex items-center justify-center gap-2">
            <Sparkles size={14} className="text-yellow-400" />
            Join 10,000+ developers mastering code at CodingAdda
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;