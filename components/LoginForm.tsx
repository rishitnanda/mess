import { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, Phone, User, Calendar, GraduationCap, Shield, FileText } from 'lucide-react';
import { supabase } from '../lib/supabase';
import TermsModal from './TermsModal';

interface LoginFormProps {
  darkMode: boolean;
  onLogin: (user: { id: string; name: string; email: string; is_admin?: boolean }) => void;
}

type AuthMode = 'login' | 'signup' | 'otp-verify' | 'signup-details';
type LoginMethod = 'email' | 'phone';
type SignUpMethod = 'email' | 'phone';

export function LoginForm({ darkMode, onLogin }: LoginFormProps) {
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('email');
  const [signUpMethod, setSignUpMethod] = useState<SignUpMethod>('email');
  
  // Login state
  const [loginInput, setLoginInput] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Sign up state (Step 1)
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPhone, setSignUpPhone] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // OTP verification state
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');

  // Sign up state (Step 2 - Additional Details)
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [collegeEmail, setCollegeEmail] = useState('');

  // Terms and Conditions
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const validatePassword = (pwd: string): boolean => {
    if (pwd.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      return false;
    }
    
    const hasLetter = /[a-zA-Z]/.test(pwd);
    const hasNumberOrSpecial = /[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd);
    
    if (!hasLetter) {
      setPasswordError('Password must contain at least one letter');
      return false;
    }
    
    if (!hasNumberOrSpecial) {
      setPasswordError('Password must contain at least one number or special character');
      return false;
    }
    
    setPasswordError('');
    return true;
  };

  const validatePhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^[\d\s\-\+\(\)]{10,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email: loginMethod === 'email' ? loginInput : `${loginInput}@phone.com`,
        password,
      });

      if (signInError) throw signInError;

      if (authData.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authData.user.id)
          .single();

        if (profileError) throw profileError;

        onLogin({
          id: authData.user.id,
          name: profile.name || '',
          email: profile.email || '',
          is_admin: profile.is_admin || false,
        });
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!acceptedTerms) {
      setError('Please accept the Terms and Conditions to continue');
      return;
    }
    
    if (signUpPassword !== confirmPassword) {
      setError('Passwords do not match!');
      return;
    }

    if (!validatePassword(signUpPassword)) {
      return;
    }

    if (signUpMethod === 'phone' && !validatePhoneNumber(signUpPhone)) {
      setError('Please enter a valid phone number');
      return;
    }
    
    const mockOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(mockOtp);
    console.log('OTP sent (mock):', mockOtp);
    setAuthMode('otp-verify');
  };

  const handleGoogleSignUp = () => {
    console.log('Google sign up clicked');
    setAuthMode('signup-details');
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (otp === generatedOtp) {
      console.log('OTP verified successfully');
      setAuthMode('signup-details');
      setOtp('');
      setError('');
    } else {
      setError('Invalid OTP. Please try again.');
    }
  };

  const handleResendOtp = () => {
    const mockOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(mockOtp);
    console.log('OTP resent (mock):', mockOtp);
    alert('OTP has been resent!');
  };

  const handleCompleteSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: signUpMethod === 'email' ? signUpEmail : `${signUpPhone}@phone.com`,
        password: signUpPassword,
      });

      if (signUpError) throw signUpError;

      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([{
            id: authData.user.id,
            name,
            email: signUpMethod === 'email' ? signUpEmail : collegeEmail,
            phone: signUpMethod === 'phone' ? signUpPhone : '',
          }]);

        if (profileError) throw profileError;

        await supabase.from('user_settings').insert([{ user_id: authData.user.id }]);
        await supabase.from('user_stats').insert([{ user_id: authData.user.id }]);

        alert('Account created successfully! Please login.');
        setAuthMode('login');
        setSignUpEmail('');
        setSignUpPhone('');
        setSignUpPassword('');
        setConfirmPassword('');
        setName('');
        setAge('');
        setCollegeEmail('');
        setAcceptedTerms(false);
      }
    } catch (err: any) {
      console.error('Sign up error:', err);
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Login View
  if (authMode === 'login') {
    return (
      <>
        <div className={`w-full max-w-md ${darkMode ? 'bg-[#2A2B30]' : 'bg-white'} rounded-2xl shadow-lg p-8 md:p-10`}>
          <div className="mb-8">
            <h2 className={`text-2xl mb-2 ${darkMode ? 'text-white' : 'text-[#1E1F24]'}`}>Welcome Back</h2>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Sign in to your account</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-400 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <button
                type="button"
                onClick={() => setLoginMethod('email')}
                className={`flex-1 py-2 px-4 rounded-md text-sm transition-all ${
                  loginMethod === 'email'
                    ? darkMode ? 'bg-[#2A2B30] text-white shadow-md' : 'bg-white text-[#1E1F24] shadow-md'
                    : darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Email
              </button>
              <button
                type="button"
                onClick={() => setLoginMethod('phone')}
                className={`flex-1 py-2 px-4 rounded-md text-sm transition-all ${
                  loginMethod === 'phone'
                    ? darkMode ? 'bg-[#2A2B30] text-white shadow-md' : 'bg-white text-[#1E1F24] shadow-md'
                    : darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Phone
              </button>
            </div>

            <div>
              <label className={`block text-sm mb-2 ${darkMode ? 'text-gray-300' : 'text-[#1E1F24]'}`}>
                {loginMethod === 'email' ? 'Email Address' : 'Phone Number'}
              </label>
              <div className="relative group">
                {loginMethod === 'email' ? (
                  <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                ) : (
                  <Phone className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                )}
                <input
                  type={loginMethod === 'email' ? 'email' : 'tel'}
                  value={loginInput}
                  onChange={(e) => setLoginInput(e.target.value)}
                  placeholder={loginMethod === 'email' ? 'you@example.com' : '+91 XXXXX XXXXX'}
                  required
                  className={`w-full pl-12 pr-4 py-3.5 border-2 ${
                    darkMode ? 'bg-[#2A2B30] border-gray-700 text-white placeholder-gray-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                  } rounded-xl focus:outline-none focus:border-[#3A7DFF] focus:ring-4 focus:ring-[#3A7DFF]/10 transition-all`}
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm mb-2 ${darkMode ? 'text-gray-300' : 'text-[#1E1F24]'}`}>Password</label>
              <div className="relative group">
                <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className={`w-full pl-12 pr-12 py-3.5 border-2 ${
                    darkMode ? 'bg-[#2A2B30] border-gray-700 text-white placeholder-gray-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                  } rounded-xl focus:outline-none focus:border-[#3A7DFF] focus:ring-4 focus:ring-[#3A7DFF]/10 transition-all`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-4 top-1/2 -translate-y-1/2 ${darkMode ? 'text-gray-500' : 'text-gray-400'} p-1`}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-5 h-5 rounded"
                />
                <span className="text-sm">Remember me</span>
              </label>
              <a href="#" className="text-sm text-[#3A7DFF] hover:text-[#18C7B9] hover:underline">
                Forgot password?
              </a>
            </div>

            <div className={`p-3 rounded-lg text-xs ${darkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-50 text-blue-700'}`}>
              💡 By signing in, you acknowledge our{' '}
              <button
                type="button"
                onClick={() => setShowTermsModal(true)}
                className="underline hover:text-blue-600"
              >
                Terms and Conditions
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-[#3A7DFF] to-[#18C7B9] text-white rounded-xl hover:shadow-lg disabled:opacity-50 transition-all"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className={`w-full border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className={`px-4 ${darkMode ? 'bg-[#2A2B30] text-gray-400' : 'bg-white text-gray-500'}`}>Or continue with</span>
              </div>
            </div>

            <button
              type="button"
              className={`w-full py-3.5 px-4 border-2 ${darkMode ? 'border-gray-700 hover:bg-[#2A2B30]' : 'border-gray-200 hover:bg-gray-50'} rounded-xl transition-all flex items-center justify-center gap-3`}
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Continue with Google</span>
            </button>

            <p className={`text-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} pt-4`}>
              Don&apos;t have an account?{' '}
              <button type="button" onClick={() => setAuthMode('signup')} className="text-[#3A7DFF] hover:underline">
                Sign up for free
              </button>
            </p>
          </form>
        </div>

        {showTermsModal && <TermsModal darkMode={darkMode} onClose={() => setShowTermsModal(false)} />}
      </>
    );
  }

  // Sign Up View
  if (authMode === 'signup') {
    return (
      <>
        <div className={`w-full max-w-md ${darkMode ? 'bg-[#2A2B30]' : 'bg-white'} rounded-2xl shadow-lg p-8 md:p-10`}>
          <div className="mb-8">
            <h2 className={`text-2xl mb-2 ${darkMode ? 'text-white' : 'text-[#1E1F24]'}`}>Create Account</h2>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Sign up to get started</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-400 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSignUp} className="space-y-6">
            <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <button
                type="button"
                onClick={() => setSignUpMethod('email')}
                className={`flex-1 py-2 px-3 rounded-md text-sm transition-all ${
                  signUpMethod === 'email'
                    ? darkMode ? 'bg-[#2A2B30] text-white shadow-md' : 'bg-white text-[#1E1F24] shadow-md'
                    : darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                Email
              </button>
              <button
                type="button"
                onClick={() => setSignUpMethod('phone')}
                className={`flex-1 py-2 px-3 rounded-md text-sm transition-all ${
                  signUpMethod === 'phone'
                    ? darkMode ? 'bg-[#2A2B30] text-white shadow-md' : 'bg-white text-[#1E1F24] shadow-md'
                    : darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                Phone
              </button>
            </div>

            {signUpMethod === 'email' ? (
              <div>
                <label className={`block text-sm mb-2 ${darkMode ? 'text-gray-300' : 'text-[#1E1F24]'}`}>Email Address</label>
                <div className="relative">
                  <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                  <input
                    type="email"
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className={`w-full pl-12 pr-4 py-3.5 border-2 ${darkMode ? 'bg-[#2A2B30] border-gray-700 text-white' : 'bg-white border-gray-200'} rounded-xl focus:outline-none focus:border-[#3A7DFF] focus:ring-4 focus:ring-[#3A7DFF]/10`}
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className={`block text-sm mb-2 ${darkMode ? 'text-gray-300' : 'text-[#1E1F24]'}`}>Phone Number</label>
                <div className="relative">
                  <Phone className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                  <input
                    type="tel"
                    value={signUpPhone}
                    onChange={(e) => setSignUpPhone(e.target.value)}
                    placeholder="+91 XXXXX XXXXX"
                    required
                    className={`w-full pl-12 pr-4 py-3.5 border-2 ${darkMode ? 'bg-[#2A2B30] border-gray-700 text-white' : 'bg-white border-gray-200'} rounded-xl focus:outline-none focus:border-[#3A7DFF] focus:ring-4 focus:ring-[#3A7DFF]/10`}
                  />
                </div>
              </div>
            )}

            <div>
              <label className={`block text-sm mb-2 ${darkMode ? 'text-gray-300' : 'text-[#1E1F24]'}`}>Password</label>
              <div className="relative">
                <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                <input
                  type={showSignUpPassword ? 'text' : 'password'}
                  value={signUpPassword}
                  onChange={(e) => setSignUpPassword(e.target.value)}
                  placeholder="Create a password"
                  required
                  className={`w-full pl-12 pr-12 py-3.5 border-2 ${darkMode ? 'bg-[#2A2B30] border-gray-700 text-white' : 'bg-white border-gray-200'} rounded-xl focus:outline-none focus:border-[#3A7DFF] focus:ring-4 focus:ring-[#3A7DFF]/10`}
                />
                <button
                  type="button"
                  onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                  className={`absolute right-4 top-1/2 -translate-y-1/2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}
                >
                  {showSignUpPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className={`block text-sm mb-2 ${darkMode ? 'text-gray-300' : 'text-[#1E1F24]'}`}>Confirm Password</label>
              <div className="relative">
                <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  required
                  className={`w-full pl-12 pr-12 py-3.5 border-2 ${darkMode ? 'bg-[#2A2B30] border-gray-700 text-white' : 'bg-white border-gray-200'} rounded-xl focus:outline-none focus:border-[#3A7DFF] focus:ring-4 focus:ring-[#3A7DFF]/10`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className={`absolute right-4 top-1/2 -translate-y-1/2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {passwordError && <p className="text-red-500 text-xs mt-1">{passwordError}</p>}
              <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Min. 8 characters with 1 letter and 1 number/special character
              </p>
            </div>

            <div className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded"
                />
                <span className="text-sm">
                  I agree to the{' '}
                  <button
                    type="button"
                    onClick={() => setShowTermsModal(true)}
                    className="text-blue-500 hover:text-blue-600 font-medium inline-flex items-center gap-1"
                  >
                    <FileText className="w-3 h-3" />
                    Terms and Conditions
                  </button>
                  {' '}and Privacy Policy
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || !acceptedTerms}
              className="w-full py-4 bg-gradient-to-r from-[#3A7DFF] to-[#18C7B9] text-white rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? 'Creating Account...' : 'Continue'}
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className={`w-full border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className={`px-4 ${darkMode ? 'bg-[#2A2B30] text-gray-400' : 'bg-white text-gray-500'}`}>Or sign up with</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignUp}
              className={`w-full py-3.5 px-4 border-2 ${darkMode ? 'border-gray-700 hover:bg-[#2A2B30]' : 'border-gray-200 hover:bg-gray-50'} rounded-xl transition-all flex items-center justify-center gap-3`}
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.