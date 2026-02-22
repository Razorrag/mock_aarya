'use client';

import React, { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Mail, MessageSquare, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { apiFetch } from '../../../lib/api';

export default function VerifyOTPPage() {
  const [otpType, setOtpType] = useState('EMAIL');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [identifier, setIdentifier] = useState('');
  const [canResend, setCanResend] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOtpChange = (index, value) => {
    if (value.length > 1) value = value[0];
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleResend = async () => {
    if (!identifier) {
      setError(`Enter your ${otpType === 'EMAIL' ? 'email' : 'phone number'} first.`);
      return;
    }
    setError('');
    setStatus('');
    setCanResend(false);
    setCountdown(60);
    try {
      await apiFetch('/api/v1/auth/resend-otp', {
        method: 'POST',
        body: JSON.stringify(
          otpType === 'EMAIL'
            ? { email: identifier.trim(), otp_type: 'EMAIL', purpose: 'verification' }
            : { phone: identifier.trim(), otp_type: 'WHATSAPP', purpose: 'verification' }
        ),
      });
      setStatus('OTP resent successfully.');
    } catch (err) {
      setError(err.message || 'Failed to resend OTP.');
    }
    // Start countdown
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setStatus('');

    const otpCode = otp.join('');
    if (!identifier || otpCode.length !== 6) {
      setError('Please enter your identifier and 6-digit OTP.');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiFetch('/api/v1/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify(
          otpType === 'EMAIL'
            ? { email: identifier.trim(), otp_code: otpCode, otp_type: 'EMAIL', purpose: 'verification' }
            : { phone: identifier.trim(), otp_code: otpCode, otp_type: 'WHATSAPP', purpose: 'verification' }
        ),
      });
      setStatus('OTP verified successfully.');
    } catch (err) {
      setError(err.message || 'OTP verification failed.');
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
          Verify OTP
        </h2>
        <p className="text-[#8A6A5C] text-xs uppercase tracking-[0.2em] font-light">
          Enter the 6-digit code
        </p>
      </div>

      {/* FORM */}
      <form className="w-full space-y-4 sm:space-y-5 md:space-y-6 animate-fade-in-up-delay" onSubmit={handleSubmit}>
        {/* OTP Type Selection */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setOtpType('EMAIL')}
            className={`flex-1 h-12 sm:h-14 rounded-2xl relative group flex items-center justify-center gap-2 transition-all duration-300 ${
              otpType === 'EMAIL' 
                ? 'bg-gradient-to-r from-[#7A2F57]/80 via-[#B76E79]/70 to-[#2A1208]/80 border border-[#F2C29A]/50' 
                : 'luxury-input-wrapper border border-transparent'
            }`}
          >
            <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-xs sm:text-sm font-medium">Email</span>
          </button>
          <button
            type="button"
            onClick={() => setOtpType('WHATSAPP')}
            className={`flex-1 h-12 sm:h-14 rounded-2xl relative group flex items-center justify-center gap-2 transition-all duration-300 ${
              otpType === 'WHATSAPP' 
                ? 'bg-gradient-to-r from-[#7A2F57]/80 via-[#B76E79]/70 to-[#2A1208]/80 border border-[#F2C29A]/50' 
                : 'luxury-input-wrapper border border-transparent'
            }`}
          >
            <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-xs sm:text-sm font-medium">WhatsApp</span>
          </button>
        </div>

        {/* Email/Phone Input */}
        <div className="luxury-input-wrapper h-12 sm:h-14 rounded-2xl relative group flex items-center px-4 sm:px-5">
          {otpType === 'EMAIL' ? (
            <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-[#B76E79] group-focus-within:text-[#F2C29A] transition-colors duration-300" />
          ) : (
            <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-[#B76E79] group-focus-within:text-[#F2C29A] transition-colors duration-300" />
          )}
          <Input
            type={otpType === 'EMAIL' ? 'email' : 'tel'}
            placeholder={otpType === 'EMAIL' ? 'Email Address' : 'Phone Number'}
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="h-full pl-3 sm:pl-4 text-[#EAE0D5] placeholder:text-[#8A6A5C] text-sm sm:text-base"
          />
        </div>

        {/* OTP Input */}
        <div className="flex gap-2 sm:gap-3 justify-center">
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-bold luxury-input-wrapper rounded-xl text-[#EAE0D5] focus:outline-none"
            />
          ))}
        </div>

        {/* Resend OTP */}
        <div className="text-center">
          {canResend ? (
            <button
              type="button"
              onClick={handleResend}
              className="text-[10px] sm:text-xs text-[#C27A4E] hover:text-[#F2C29A] transition-colors flex items-center gap-2 mx-auto"
            >
              <RefreshCw className="w-3 h-3" />
              Resend OTP
            </button>
          ) : (
            <p className="text-[10px] text-[#6E5E58]">
              Resend OTP in <span className="text-[#F2C29A]">{countdown}s</span>
            </p>
          )}
        </div>

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
            {isSubmitting ? 'VERIFYING...' : 'VERIFY OTP'}
          </span>
        </Button>

        {(error || status) && (
          <div className="text-center text-[10px] sm:text-xs">
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
