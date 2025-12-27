import { useState } from 'react';
import { LoginView } from './LoginView.tsx';
import { SignupView } from './SignupView.tsx';

interface LoginFormProps {
  darkMode: boolean;
  onLogin: (user: { id: string; name: string; email: string }) => void;
}

type AuthMode = 'login' | 'signup' | 'otp-verify' | 'signup-details';
type LoginMethod = 'email' | 'phone';
type SignUpMethod = 'email' | 'phone' | 'google';

export function LoginForm({ darkMode, onLogin }: LoginFormProps) {
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('email');
  const [signUpMethod, setSignUpMethod] = useState<SignUpMethod>('email');
  
  // Login state
  const [loginInput, setLoginInput] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loginAcceptedTerms, setLoginAcceptedTerms] = useState(false);

  // Sign up state (Step 1)
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPhone, setSignUpPhone] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [signupAcceptedTerms, setSignupAcceptedTerms] = useState(false);

  // OTP verification state
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');

  // Sign up state (Step 2 - Additional Details)
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [collegeEmail, setCollegeEmail] = useState('');

  // Password validation
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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginAcceptedTerms) {
      alert('Please accept the Terms & Conditions to continue');
      return;
    }

    console.log('Login attempted with:', { 
      method: loginMethod,
      loginInput, 
      password, 
      rememberMe 
    });

    onLogin({ 
      id: `user_${Date.now()}`,
      name: loginInput,
      email: loginMethod === 'email' ? loginInput : `${loginInput}@phone.com`
    });
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signupAcceptedTerms) {
      alert('Please accept the Terms & Conditions to continue');
      return;
    }

    if (signUpPassword !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    if (!validatePassword(signUpPassword)) {
      return;
    }

    if (signUpMethod === 'phone' && !validatePhoneNumber(signUpPhone)) {
      alert('Please enter a valid phone number');
      return;
    }
    
    const mockOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(mockOtp);
    
    console.log('Sign up attempted with:', { 
      method: signUpMethod,
      email: signUpEmail,
      phone: signUpPhone,
    });
    console.log('OTP sent (mock):', mockOtp);
    
    setAuthMode('otp-verify');
  };

  const handleGoogleSignUp = () => {
    if (!signupAcceptedTerms) {
      alert('Please accept the Terms & Conditions to continue');
      return;
    }
    console.log('Google sign up clicked');
    setAuthMode('signup-details');
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (otp === generatedOtp) {
      console.log('OTP verified successfully');
      setAuthMode('signup-details');
      setOtp('');
    } else {
      alert('Invalid OTP. Please try again.');
    }
  };

  const handleResendOtp = () => {
    const mockOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(mockOtp);
    console.log('OTP resent (mock):', mockOtp);
    alert('OTP has been resent!');
  };

  const handleCompleteSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Sign up completed with details:', {
      name,
      age,
      collegeEmail,
    });
    setAuthMode('login');
    alert('Account created successfully! Please login.');
  };

  if (authMode === 'login') {
    return (
      <LoginView
        darkMode={darkMode}
        loginMethod={loginMethod}
        setLoginMethod={setLoginMethod}
        loginInput={loginInput}
        setLoginInput={setLoginInput}
        password={password}
        setPassword={setPassword}
        showPassword={showPassword}
        setShowPassword={setShowPassword}
        rememberMe={rememberMe}
        setRememberMe={setRememberMe}
        acceptedTerms={loginAcceptedTerms}
        setAcceptedTerms={setLoginAcceptedTerms}
        handleLogin={handleLogin}
        setAuthMode={setAuthMode}
      />
    );
  }

  return (
    <SignupView
      darkMode={darkMode}
      authMode={authMode}
      setAuthMode={setAuthMode}
      signUpMethod={signUpMethod}
      setSignUpMethod={setSignUpMethod}
      signUpEmail={signUpEmail}
      setSignUpEmail={setSignUpEmail}
      signUpPhone={signUpPhone}
      setSignUpPhone={setSignUpPhone}
      signUpPassword={signUpPassword}
      setSignUpPassword={setSignUpPassword}
      confirmPassword={confirmPassword}
      setConfirmPassword={setConfirmPassword}
      showSignUpPassword={showSignUpPassword}
      setShowSignUpPassword={setShowSignUpPassword}
      showConfirmPassword={showConfirmPassword}
      setShowConfirmPassword={setShowConfirmPassword}
      acceptedTerms={signupAcceptedTerms}
      setAcceptedTerms={setSignupAcceptedTerms}
      passwordError={passwordError}
      otp={otp}
      setOtp={setOtp}
      name={name}
      setName={setName}
      age={age}
      setAge={setAge}
      collegeEmail={collegeEmail}
      setCollegeEmail={setCollegeEmail}
      handleSignUp={handleSignUp}
      handleGoogleSignUp={handleGoogleSignUp}
      handleVerifyOtp={handleVerifyOtp}
      handleResendOtp={handleResendOtp}
      handleCompleteSignUp={handleCompleteSignUp}
    />
  );
}