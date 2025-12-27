import { Eye, EyeOff, Lock, Mail, Phone } from 'lucide-react';

interface LoginViewProps {
  darkMode: boolean;
  loginMethod: 'email' | 'phone';
  setLoginMethod: (method: 'email' | 'phone') => void;
  loginInput: string;
  setLoginInput: (input: string) => void;
  password: string;
  setPassword: (password: string) => void;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  rememberMe: boolean;
  setRememberMe: (remember: boolean) => void;
  acceptedTerms: boolean;
  setAcceptedTerms: (accepted: boolean) => void;
  handleLogin: (e: React.FormEvent) => void;
  setAuthMode: (mode: 'login' | 'signup' | 'otp-verify' | 'signup-details') => void;
}

export function LoginView({
  darkMode,
  loginMethod,
  setLoginMethod,
  loginInput,
  setLoginInput,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  rememberMe,
  setRememberMe,
  acceptedTerms,
  setAcceptedTerms,
  handleLogin,
  setAuthMode,
}: LoginViewProps) {
  return (
    <div className={`w-full max-w-md ${darkMode ? 'bg-[#2A2B30]' : 'bg-white'} rounded-2xl shadow-lg p-8 md:p-10 transition-colors duration-300`}>
      <div className="mb-8">
        <h2 className={`text-2xl mb-2 ${darkMode ? 'text-white' : 'text-[#1E1F24]'}`}>Welcome Back</h2>
        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Sign in to your account</p>
      </div>

      <div className="space-y-6">
        {/* Login Method Toggle */}
        <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <button
            type="button"
            onClick={() => setLoginMethod('email')}
            className={`flex-1 py-2 px-4 rounded-md text-sm transition-all ${
              loginMethod === 'email'
                ? darkMode
                  ? 'bg-[#2A2B30] text-white shadow-md'
                  : 'bg-white text-[#1E1F24] shadow-md'
                : darkMode
                ? 'text-gray-400 hover:text-gray-300'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Email
          </button>
          <button
            type="button"
            onClick={() => setLoginMethod('phone')}
            className={`flex-1 py-2 px-4 rounded-md text-sm transition-all ${
              loginMethod === 'phone'
                ? darkMode
                  ? 'bg-[#2A2B30] text-white shadow-md'
                  : 'bg-white text-[#1E1F24] shadow-md'
                : darkMode
                ? 'text-gray-400 hover:text-gray-300'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Phone
          </button>
        </div>

        {/* Email/Phone Field */}
        <div>
          <label htmlFor="login-input" className={`block text-sm mb-2 ${darkMode ? 'text-gray-300' : 'text-[#1E1F24]'}`}>
            {loginMethod === 'email' ? 'Email Address' : 'Phone Number'}
          </label>
          <div className="relative group">
            {loginMethod === 'email' ? (
              <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'} group-focus-within:text-[#3A7DFF] transition-colors`} />
            ) : (
              <Phone className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'} group-focus-within:text-[#3A7DFF] transition-colors`} />
            )}
            <input
              id="login-input"
              type={loginMethod === 'email' ? 'email' : 'tel'}
              value={loginInput}
              onChange={(e) => setLoginInput(e.target.value)}
              placeholder={loginMethod === 'email' ? 'you@example.com' : '+1 (555) 000-0000'}
              required
              className={`w-full pl-12 pr-4 py-3.5 border-2 ${
                darkMode 
                  ? 'bg-[#2A2B30] border-gray-700 text-white placeholder-gray-500' 
                  : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
              } rounded-xl focus:outline-none focus:border-[#3A7DFF] focus:ring-4 focus:ring-[#3A7DFF]/10 transition-all`}
            />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <label htmlFor="password" className={`block text-sm mb-2 ${darkMode ? 'text-gray-300' : 'text-[#1E1F24]'}`}>
            Password
          </label>
          <div className="relative group">
            <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'} group-focus-within:text-[#3A7DFF] transition-colors`} />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className={`w-full pl-12 pr-12 py-3.5 border-2 ${
                darkMode 
                  ? 'bg-[#2A2B30] border-gray-700 text-white placeholder-gray-500' 
                  : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
              } rounded-xl focus:outline-none focus:border-[#3A7DFF] focus:ring-4 focus:ring-[#3A7DFF]/10 transition-all`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={`absolute right-4 top-1/2 -translate-y-1/2 ${darkMode ? 'text-gray-500 hover:text-gray-400' : 'text-gray-400 hover:text-gray-600'} transition-colors p-1`}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className={`w-5 h-5 text-[#3A7DFF] border-2 ${darkMode ? 'border-gray-600 bg-[#2A2B30]' : 'border-gray-300 bg-white'} rounded-md focus:ring-2 focus:ring-[#3A7DFF] cursor-pointer`}
              />
            </div>
            <span className={`text-sm ${darkMode ? 'text-gray-300 group-hover:text-white' : 'text-[#1E1F24] group-hover:text-gray-900'} transition-colors`}>Remember me</span>
          </label>
          <a href="#" className="text-sm text-[#3A7DFF] hover:text-[#18C7B9] transition-colors hover:underline">
            Forgot password?
          </a>
        </div>

        {/* Terms & Conditions */}
        <label className="flex items-start gap-2 cursor-pointer group">
          <div className="relative mt-0.5">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className={`w-5 h-5 text-[#3A7DFF] border-2 ${darkMode ? 'border-gray-600 bg-[#2A2B30]' : 'border-gray-300 bg-white'} rounded-md focus:ring-2 focus:ring-[#3A7DFF] cursor-pointer`}
            />
          </div>
          <span className={`text-sm ${darkMode ? 'text-gray-300 group-hover:text-white' : 'text-[#1E1F24] group-hover:text-gray-900'} transition-colors`}>
            I agree to the{' '}
            <a href="#" className="text-[#3A7DFF] hover:text-[#18C7B9] hover:underline">
              Terms & Conditions
            </a>
            {' '}and{' '}
            <a href="#" className="text-[#3A7DFF] hover:text-[#18C7B9] hover:underline">
              Privacy Policy
            </a>
          </span>
        </label>

        {/* Sign In Button */}
        <button
          onClick={handleLogin}
          className="w-full py-4 bg-gradient-to-r from-[#3A7DFF] to-[#18C7B9] text-white rounded-xl hover:shadow-lg hover:shadow-[#3A7DFF]/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
        >
          Sign In
        </button>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className={`w-full border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className={`px-4 ${darkMode ? 'bg-[#2A2B30] text-gray-400' : 'bg-white text-gray-500'}`}>Or continue with</span>
          </div>
        </div>

        {/* Google Login Button */}
        <button
          type="button"
          className={`w-full py-3.5 px-4 border-2 ${
            darkMode 
              ? 'border-gray-700 hover:bg-[#2A2B30]' 
              : 'border-gray-200 hover:bg-gray-50'
          } rounded-xl hover:border-gray-300 hover:shadow-md transition-all duration-200 flex items-center justify-center gap-3 group`}
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span className={`${darkMode ? 'text-gray-300 group-hover:text-white' : 'text-gray-700 group-hover:text-gray-900'} transition-colors`}>Continue with Google</span>
        </button>

        {/* Sign Up Link */}
        <p className={`text-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} pt-4`}>
          Don&apos;t have an account?{' '}
          <button 
            type="button"
            onClick={() => setAuthMode('signup')}
            className="text-[#3A7DFF] hover:text-[#18C7B9] hover:underline transition-all"
          >
            Sign up for free
          </button>
        </p>
      </div>
    </div>
  );
}