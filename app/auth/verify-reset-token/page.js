'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Lock, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { apiFetch } from '../../../lib/api';

// Loading skeleton
function VerifyResetTokenLoadingSkeleton() {
  return (
    <div className="w-full max-w-[420px] flex flex-col items-center">
      <div className="animate-pulse w-20 h-20 sm:w-24 sm:h-24 bg-[#B76E79]/20 rounded-full mb-8" />
      <div className="animate-pulse h-8 w-48 bg-[#B76E79]/20 rounded mb-4" />
      <div className="w-full space-y-4">
        <div className="animate-pulse h-12 bg-[#B76E79]/10 rounded-2xl" />
        <div className="animate-pulse h-12 bg-[#B76E79]/10 rounded-2xl" />
        <div className="animate-pulse h-12 bg-[#B76E79]/10 rounded-2xl" />
      </div>
    </div>
  );
}

// Main content component
function VerifyResetTokenContent() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam) setToken(tokenParam);
  }, [searchParams]);

  // Password validation
  const passwordRequirements = [
    { label: 'At least 8 characters', test: (p) => p.length >= 8 },
    { label: 'One uppercase letter', test: (p) => /[A-Z]/.test(p) },
    { label: 'One lowercase letter', test: (p) => /[a-z]/.test(p) },
    { label: 'One number', test: (p) => /\d/.test(p) },
  ];

  const passwordsMatch = password && confirmPassword && password === confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setStatus('');

    if (!token) {
      setError('Reset token is required.');
      return;
    }
    if (!passwordsMatch) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiFetch(`/api/v1/auth/verify-reset-token/${encodeURIComponent(token)}`);
      await apiFetch('/api/v1/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, new_password: password }),
      });
      setStatus('Password reset successfully.');
      router.push('/auth/login');
    } catch (err) {
      setError(err.message || 'Failed to reset password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-[420px] flex flex-col items-center">
      {/* LOGO */}
      <div className="flex flex-col items-center mb-8 sm:mb-10 md:mb-12 animate-fade-in-up">
        <img 
          src="/logo.png" 
          alt="Aarya" 
          className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 object-contain drop-shadow-[0_0_15px_rgba(242,194,154,0.2)]"
        />
      </div>

      {/* HEADER */}
      <div className="text-center mb-10 space-y-2 animate-fade-in-up-delay">
        <h2 className="text-2xl text-white/90" style={{ fontFamily: 'Playfair Display, serif' }}>
          Verify Reset Token
        </h2>
        <p className="text-[#8A6A5C] text-xs uppercase tracking-[0.2em] font-light">
          Enter token and new password
        </p>
      </div>

      {/* FORM */}
      <form className="w-full space-y-4 sm:space-y-5 md:space-y-6 animate-fade-in-up-delay" onSubmit={handleSubmit}>
        {/* Reset Token */}
        <div className="luxury-input-wrapper h-12 sm:h-14 rounded-2xl relative group flex items-center px-4 sm:px-5">
          <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-[#B76E79] group-focus-within:text-[#F2C29A] transition-colors duration-300" />
          <Input 
            type="text" 
            placeholder="Reset Token" 
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="h-full pl-3 sm:pl-4 text-[#EAE0D5] placeholder:text-[#8A6A5C] text-sm sm:text-base" 
          />
        </div>

        {/* New Password */}
        <div className="luxury-input-wrapper h-12 sm:h-14 rounded-2xl relative group flex items-center px-4 sm:px-5">
          <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-[#B76E79] group-focus-within:text-[#F2C29A] transition-colors duration-300" />
          <Input 
            type={showPassword ? "text" : "password"} 
            placeholder="New Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-full pl-3 sm:pl-4 pr-10 text-[#EAE0D5] placeholder:text-[#8A6A5C] text-sm sm:text-base" 
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 text-[#8A6A5C] hover:text-[#F2C29A] transition-colors"
          >
            {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>
        </div>

        {/* Confirm Password */}
        <div className="luxury-input-wrapper h-12 sm:h-14 rounded-2xl relative group flex items-center px-4 sm:px-5">
          <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-[#B76E79] group-focus-within:text-[#F2C29A] transition-colors duration-300" />
          <Input 
            type={showConfirmPassword ? "text" : "password"} 
            placeholder="Confirm New Password" 
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="h-full pl-3 sm:pl-4 pr-10 text-[#EAE0D5] placeholder:text-[#8A6A5C] text-sm sm:text-base" 
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-4 text-[#8A6A5C] hover:text-[#F2C29A] transition-colors"
          >
            {showConfirmPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>
        </div>

        {/* Password Requirements */}
        <div className="text-[10px] text-white/60 space-y-1">
          <p>Password must contain:</p>
          <ul className="space-y-0.5 ml-2">
            {passwordRequirements.map((req, index) => (
              <li key={index} className="flex items-center gap-2">
                {req.test(password) ? (
                  <CheckCircle className="w-3 h-3 text-[#C27A4E]" />
                ) : (
                  <XCircle className="w-3 h-3 text-[#6E5E58]" />
                )}
                <span className={req.test(password) ? 'text-[#C27A4E]' : ''}>{req.label}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Password Match Indicator */}
        {confirmPassword && (
          <div className="flex items-center gap-2 text-[10px]">
            {passwordsMatch ? (
              <>
                <CheckCircle className="w-3 h-3 text-[#C27A4E]" />
                <span className="text-[#C27A4E]">Passwords match</span>
              </>
            ) : (
              <>
                <XCircle className="w-3 h-3 text-[#6E5E58]" />
                <span className="text-[#6E5E58]">Passwords do not match</span>
              </>
            )}
          </div>
        )}

        {/* LUXURY BUTTON */}
        <Button 
          type="submit"
          disabled={isSubmitting}
          className="w-full h-12 sm:h-14 mt-4 sm:mt-6 relative overflow-hidden rounded-2xl bg-transparent border border-[#B76E79]/40 group transition-all duration-500 hover:border-[#F2C29A]/60 hover:shadow-[0_0_30px_rgba(183,110,121,0.3)]"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#7A2F57]/80 via-[#B76E79]/70 to-[#2A1208]/80 opacity-90"></div>
          <div className="animate-sheen"></div>
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#F2C29A]/70 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#B76E79]/50 to-transparent"></div>

          <span className="relative z-10 text-[#F2C29A] font-serif tracking-[0.1em] sm:tracking-[0.15em] text-base sm:text-lg group-hover:text-white transition-colors" style={{ fontFamily: 'Cinzel, serif' }}>
            {isSubmitting ? 'RESETTING...' : 'VERIFY & RESET'}
          </span>
        </Button>

        {(error || status) && (
          <div className="text-center text-[10px]">
            {error && <p className="text-red-300">{error}</p>}
            {!error && status && <p className="text-[#C27A4E]">{status}</p>}
          </div>
        )}
      </form>

      {/* BACK TO LOGIN */}
      <div className="w-full mt-8 sm:mt-10 md:mt-12">
        <Link href="/auth/login" className="text-[#8A6A5C] hover:text-[#F2C29A] transition-colors text-xs sm:text-sm tracking-wide uppercase text-[10px] sm:text-xs font-bold tracking-widest">
          ← Back to Sign In
        </Link>
      </div>
    </div>
  );
}

// Default export with Suspense wrapper
export default function VerifyResetTokenPage() {
  return (
    <Suspense fallback={<VerifyResetTokenLoadingSkeleton />}>
      <VerifyResetTokenContent />
    </Suspense>
  );
}
