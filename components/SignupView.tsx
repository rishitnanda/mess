import { Eye, EyeOff, Lock, Mail, Phone, User, Calendar, GraduationCap, Shield } from 'lucide-react';

interface SignupViewProps {
  darkMode: boolean;
  authMode: 'login' | 'signup' | 'otp-verify' | 'signup-details';
  setAuthMode: (mode: 'login' | 'signup' | 'otp-verify' | 'signup-details') => void;
  signUpMethod: 'email' | 'phone' | 'google';
  setSignUpMethod: (method: 'email' | 'phone' | 'google') => void;
  signUpEmail: string;
  setSignUpEmail: (email: string) => void;
  signUpPhone: string;
  setSignUpPhone: (phone: string) => void;
  signUpPassword: string;
  setSignUpPassword: (password: string) => void;
  confirmPassword: string;
  setConfirmPassword: (password: string) => void;
  showSignUpPassword: boolean;
  setShowSignUpPassword: (show: boolean) => void;
  showConfirmPassword: boolean;
  setShowConfirmPassword: (show: boolean) => void;
  acceptedTerms: boolean;
  setAcceptedTerms: (accepted: boolean) => void;
  passwordError: string;
  otp: string;
  setOtp: (otp: string) => void;
  name: string;
  setName: (name: string) => void;
  age: string;
  setAge: (age: string) => void;
  collegeEmail: string;
  setCollegeEmail: (email: string) => void;
  handleSignUp: (e: React.FormEvent) => void;
  handleGoogleSignUp: () => void;
  handleVerifyOtp: (e: React.FormEvent) => void;
  handleResendOtp: () => void;
  handleCompleteSignUp: (e: React.FormEvent) => void;
}

export function SignupView({
  darkMode,
  authMode,
  setAuthMode,
  signUpMethod,
  setSignUpMethod,
  signUpEmail,
  setSignUpEmail,
  signUpPhone,
  setSignUpPhone,
  signUpPassword,
  setSignUpPassword,
  confirmPassword,
  setConfirmPassword,
  showSignUpPassword,
  setShowSignUpPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  acceptedTerms,
  setAcceptedTerms,
  passwordError,
  otp,
  setOtp,
  name,
  setName,
  age,
  setAge,
  collegeEmail,
  setCollegeEmail,
  handleSignUp,
  handleGoogleSignUp,
  handleVerifyOtp,
  handleResendOtp,
  handleCompleteSignUp,
}: SignupViewProps) {
  
  // Sign Up View (Step 1)
  if (authMode === 'signup') {
    return (
      <div className={`w-full max-w-md ${darkMode ? 'bg-[#2A2B30]' : 'bg-white'} rounded-2xl shadow-lg p-8 md:p-10 transition-colors duration-300`}>
        <div className="mb-8">
          <h2 className={`text-2xl mb-2 ${darkMode ? 'text-white' : 'text-[#1E1F24]'}`}>Create Account</h2>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Sign up to get started</p>
        </div>

        <div className="space-y-6">
          {/* Sign Up Method Toggle */}
          <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <button
              type="button"
              onClick={() => setSignUpMethod('email')}
              className={`flex-1 py-2 px-3 rounded-md text-sm transition-all ${
                signUpMethod === 'email'
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
              onClick={() => setSignUpMethod('phone')}
              className={`flex-1 py-2 px-3 rounded-md text-sm transition-all ${
                signUpMethod === 'phone'
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

          {signUpMethod === 'email' && (
            <>
              {/* Email Field */}
              <div>
                <label htmlFor="signup-email" className={`block text-sm mb-2 ${darkMode ? 'text-gray-300' : 'text-[#1E1F24]'}`}>
                  Email Address
                </label>
                <div className="relative group">
                  <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'} group-focus-within:text-[#3A7DFF] transition-colors`} />
                  <input
                    id="signup-email"
                    type="email"
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    placeholder="you@example.com"
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
                <label htmlFor="signup-password" className={`block text-sm mb-2 ${darkMode ? 'text-gray-300' : 'text-[#1E1F24]'}`}>
                  Password
                </label>
                <div className="relative group">
                  <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'} group-focus-within:text-[#3A7DFF] transition-colors`} />
                  <input
                    id="signup-password"
                    type={showSignUpPassword ? 'text' : 'password'}
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    placeholder="Create a password"
                    required
                    className={`w-full pl-12 pr-12 py-3.5 border-2 ${
                      darkMode 
                        ? 'bg-[#2A2B30] border-gray-700 text-white placeholder-gray-500' 
                        : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                    } rounded-xl focus:outline-none focus:border-[#3A7DFF] focus:ring-4 focus:ring-[#3A7DFF]/10 transition-all`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                    className={`absolute right-4 top-1/2 -translate-y-1/2 ${darkMode ? 'text-gray-500 hover:text-gray-400' : 'text-gray-400 hover:text-gray-600'} transition-colors p-1`}
                  >
                    {showSignUpPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirm-password" className={`block text-sm mb-2 ${darkMode ? 'text-gray-300' : 'text-[#1E1F24]'}`}>
                  Confirm Password
                </label>
                <div className="relative group">
                  <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'} group-focus-within:text-[#3A7DFF] transition-colors`} />
                  <input
                    id="confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    required
                    className={`w-full pl-12 pr-12 py-3.5 border-2 ${
                      darkMode 
                        ? 'bg-[#2A2B30] border-gray-700 text-white placeholder-gray-500' 
                        : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                    } rounded-xl focus:outline-none focus:border-[#3A7DFF] focus:ring-4 focus:ring-[#3A7DFF]/10 transition-all`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className={`absolute right-4 top-1/2 -translate-y-1/2 ${darkMode ? 'text-gray-500 hover:text-gray-400' : 'text-gray-400 hover:text-gray-600'} transition-colors p-1`}
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {passwordError && (
                  <p className="text-red-500 text-xs mt-1">{passwordError}</p>
                )}
                <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Min. 8 characters with 1 letter and 1 number/special character
                </p>
              </div>
            </>
          )}

          {signUpMethod === 'phone' && (
            <>
              {/* Phone Field */}
              <div>
                <label htmlFor="signup-phone" className={`block text-sm mb-2 ${darkMode ? 'text-gray-300' : 'text-[#1E1F24]'}`}>
                  Phone Number
                </label>
                <div className="relative group">
                  <Phone className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'} group-focus-within:text-[#3A7DFF] transition-colors`} />
                  <input
                    id="signup-phone"
                    type="tel"
                    value={signUpPhone}
                    onChange={(e) => setSignUpPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
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
                <label htmlFor="signup-password" className={`block text-sm mb-2 ${darkMode ? 'text-gray-300' : 'text-[#1E1F24]'}`}>
                  Password
                </label>
                <div className="relative group">
                  <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'} group-focus-within:text-[#3A7DFF] transition-colors`} />
                  <input
                    id="signup-password"
                    type={showSignUpPassword ? 'text' : 'password'}
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    placeholder="Create a password"
                    required
                    className={`w-full pl-12 pr-12 py-3.5 border-2 ${
                      darkMode 
                        ? 'bg-[#2A2B30] border-gray-700 text-white placeholder-gray-500' 
                        : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                    } rounded-xl focus:outline-none focus:border-[#3A7DFF] focus:ring-4 focus:ring-[#3A7DFF]/10 transition-all`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                    className={`absolute right-4 top-1/2 -translate-y-1/2 ${darkMode ? 'text-gray-500 hover:text-gray-400' : 'text-gray-400 hover:text-gray-600'} transition-colors p-1`}
                  >
                    {showSignUpPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirm-password" className={`block text-sm mb-2 ${darkMode ? 'text-gray-300' : 'text-[#1E1F24]'}`}>
                  Confirm Password
                </label>
                <div className="relative group">
                  <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'} group-focus-within:text-[#3A7DFF] transition-colors`} />
                  <input
                    id="confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    required
                    className={`w-full pl-12 pr-12 py-3.5 border-2 ${
                      darkMode 
                        ? 'bg-[#2A2B30] border-gray-700 text-white placeholder-gray-500' 
                        : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                    } rounded-xl focus:outline-none focus:border-[#3A7DFF] focus:ring-4 focus:ring-[#3A7DFF]/10 transition-all`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className={`absolute right-4 top-1/2 -translate-y-1/2 ${darkMode ? 'text-gray-500 hover:text-gray-400' : 'text-gray-400 hover:text-gray-600'} transition-colors p-1`}
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </>
          )}

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

          {/* Sign Up Button */}
          <button
            onClick={handleSignUp}
            className="w-full py-4 bg-gradient-to-r from-[#3A7DFF] to-[#18C7B9] text-white rounded-xl hover:shadow-lg hover:shadow-[#3A7DFF]/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            Continue
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className={`w-full border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className={`px-4 ${darkMode ? 'bg-[#2A2B30] text-gray-400' : 'bg-white text-gray-500'}`}>Or sign up with</span>
            </div>
          </div>

          {/* Google Sign Up Button */}
          <button
            type="button"
            onClick={handleGoogleSignUp}
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

          {/* Login Link */}
          <p className={`text-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} pt-4`}>
            Already have an account?{' '}
            <button 
              type="button"
              onClick={() => setAuthMode('login')}
              className="text-[#3A7DFF] hover:text-[#18C7B9] hover:underline transition-all"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    );
  }

  // OTP Verification View (Step 2)
  if (authMode === 'otp-verify') {
    return (
      <div className={`w-full max-w-md ${darkMode ? 'bg-[#2A2B30]' : 'bg-white'} rounded-2xl shadow-lg p-8 md:p-10 transition-colors duration-300`}>
        <div className="mb-8">
          <h2 className={`text-2xl mb-2 ${darkMode ? 'text-white' : 'text-[#1E1F24]'}`}>Verify OTP</h2>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Enter the OTP sent to your {signUpMethod === 'email' ? 'email' : 'phone'}</p>
        </div>

        <div className="space-y-6">
          {/* OTP Field */}
          <div>
            <label htmlFor="otp" className={`block text-sm mb-2 ${darkMode ? 'text-gray-300' : 'text-[#1E1F24]'}`}>
              OTP
            </label>
            <div className="relative group">
              <Shield className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'} group-focus-within:text-[#3A7DFF] transition-colors`} />
              <input
                id="otp"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                required
                className={`w-full pl-12 pr-4 py-3.5 border-2 ${
                  darkMode 
                    ? 'bg-[#2A2B30] border-gray-700 text-white placeholder-gray-500' 
                    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                } rounded-xl focus:outline-none focus:border-[#3A7DFF] focus:ring-4 focus:ring-[#3A7DFF]/10 transition-all`}
              />
            </div>
          </div>

          {/* Verify OTP Button */}
          <button
            onClick={handleVerifyOtp}
            className="w-full py-4 bg-gradient-to-r from-[#3A7DFF] to-[#18C7B9] text-white rounded-xl hover:shadow-lg hover:shadow-[#3A7DFF]/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            Verify OTP
          </button>

          {/* Resend OTP Link */}
          <p className={`text-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} pt-4`}>
            <button 
              type="button"
              onClick={handleResendOtp}
              className="text-[#3A7DFF] hover:text-[#18C7B9] hover:underline transition-all"
            >
              Resend OTP
            </button>
          </p>

          {/* Back Link */}
          <p className={`text-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} pt-4`}>
            <button 
              type="button"
              onClick={() => setAuthMode('signup')}
              className="text-[#3A7DFF] hover:text-[#18C7B9] hover:underline transition-all"
            >
              ← Go back
            </button>
          </p>
        </div>
      </div>
    );
  }

  // Sign Up Details View (Step 3)
  return (
    <div className={`w-full max-w-md ${darkMode ? 'bg-[#2A2B30]' : 'bg-white'} rounded-2xl shadow-lg p-8 md:p-10 transition-colors duration-300`}>
      <div className="mb-8">
        <h2 className={`text-2xl mb-2 ${darkMode ? 'text-white' : 'text-[#1E1F24]'}`}>Complete Your Profile</h2>
        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Tell us a bit more about yourself</p>
      </div>

      <div className="space-y-6">
        {/* Name Field */}
        <div>
          <label htmlFor="name" className={`block text-sm mb-2 ${darkMode ? 'text-gray-300' : 'text-[#1E1F24]'}`}>
            Full Name
          </label>
          <div className="relative group">
            <User className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'} group-focus-within:text-[#3A7DFF] transition-colors`} />
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              required
              className={`w-full pl-12 pr-4 py-3.5 border-2 ${
                darkMode 
                  ? 'bg-[#2A2B30] border-gray-700 text-white placeholder-gray-500' 
                  : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
              } rounded-xl focus:outline-none focus:border-[#3A7DFF] focus:ring-4 focus:ring-[#3A7DFF]/10 transition-all`}
            />
          </div>
        </div>

        {/* Age Field */}
        <div>
          <label htmlFor="age" className={`block text-sm mb-2 ${darkMode ? 'text-gray-300' : 'text-[#1E1F24]'}`}>
            Age
          </label>
          <div className="relative group">
            <Calendar className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'} group-focus-within:text-[#3A7DFF] transition-colors`} />
            <input
              id="age"
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="18"
              min="13"
              max="120"
              required
              className={`w-full pl-12 pr-4 py-3.5 border-2 ${
                darkMode 
                  ? 'bg-[#2A2B30] border-gray-700 text-white placeholder-gray-500' 
                  : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
              } rounded-xl focus:outline-none focus:border-[#3A7DFF] focus:ring-4 focus:ring-[#3A7DFF]/10 transition-all`}
            />
          </div>
        </div>

        {/* College Email Field */}
        <div>
          <label htmlFor="college-email" className={`block text-sm mb-2 ${darkMode ? 'text-gray-300' : 'text-[#1E1F24]'}`}>
            College Email ID
          </label>
          <div className="relative group">
            <GraduationCap className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'} group-focus-within:text-[#3A7DFF] transition-colors`} />
            <input
              id="college-email"type="email"
              value={collegeEmail}
              onChange={(e) => setCollegeEmail(e.target.value)}
              placeholder="you@university.edu"
              required
              className={`w-full pl-12 pr-4 py-3.5 border-2 ${
                darkMode 
                  ? 'bg-[#2A2B30] border-gray-700 text-white placeholder-gray-500' 
                  : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
              } rounded-xl focus:outline-none focus:border-[#3A7DFF] focus:ring-4 focus:ring-[#3A7DFF]/10 transition-all`}
            />
          </div>
        </div>

        {/* Complete Sign Up Button */}
        <button
          onClick={handleCompleteSignUp}
          className="w-full py-4 bg-gradient-to-r from-[#3A7DFF] to-[#18C7B9] text-white rounded-xl hover:shadow-lg hover:shadow-[#3A7DFF]/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
        >
          Complete Sign Up
        </button>

        {/* Back Link */}
        <p className={`text-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} pt-4`}>
          <button 
            type="button"
            onClick={() => setAuthMode('login')}
            className="text-[#3A7DFF] hover:text-[#18C7B9] hover:underline transition-all"
          >
            ← Back to Login
          </button>
        </p>
      </div>
    </div>
  );
}