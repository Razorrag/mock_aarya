'use client';

import React, { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Mail, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { apiFetch } from '../../../lib/api';

export default function ForgotPasswordOTPPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setStatus('');

    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      const query = new URLSearchParams({
        identifier: email.trim(),
        otp_type: 'EMAIL',
      });
      await apiFetch(`/api/v1/auth/forgot-password-otp?${query.toString()}`, {
        method: 'POST',
      });
      setStatus('OTP sent. Check your email.');
    } catch (err) {
      setError(err.message || 'Failed to send OTP.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-[480px] lg:max-w-[520px] xl:max-w-[560px] flex flex-col items-center">
      {/* LOGO */}
      <div className="flex flex-col items-center mb-8 sm:mb-10 md:mb-12 lg:mb-14 animate-fade-in-up">
        <img 
          src="/logo.png" 
          alt="Aarya" 
          className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-36 lg:h-36 object-contain drop-shadow-[0_0_15px_rgba(242,194,154,0.2)]"
        />
      </div>

      {/* HEADER */}
      <div className="text-center mb-10 lg:mb-12 space-y-2 animate-fade-in-up-delay">
        <h2 className="text-2xl sm:text-3xl md:text-4xl text-white/90" style={{ fontFamily: 'Playfair Display, serif' }}>
          Forgot Password
        </h2>
        <p className="text-[#8A6A5C] text-xs sm:text-sm md:text-base uppercase tracking-[0.2em] font-light">
          Enter your email to receive OTP
        </p>
      </div>

      {/* FORM */}
      <form className="w-full space-y-5 sm:space-y-6 md:space-y-7 animate-fade-in-up-delay" onSubmit={handleSubmit}>
        {/* Email */}
        <div className="luxury-input-wrapper h-14 sm:h-16 md:h-18 rounded-2xl relative group flex items-center px-5 sm:px-6">
          <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-[#B76E79] group-focus-within:text-[#F2C29A] transition-colors duration-300" />
          <Input 
            type="email" 
            placeholder="Email Address" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-full pl-4 sm:pl-5 text-[#EAE0D5] placeholder:text-[#8A6A5C] text-base sm:text-lg md:text-xl" 
          />
        </div>

        {/* Info Text */}
        <p className="text-xs sm:text-sm md:text-base text-[#6E5E58] text-center">
          We'll send a one-time password (OTP) to your email address for password reset.
        </p>

        {/* LUXURY BUTTON */}
        <Button 
          type="submit"
          disabled={isSubmitting}
          className="w-full h-14 sm:h-16 md:h-18 mt-6 sm:mt-8 relative overflow-hidden rounded-2xl bg-transparent border border-[#B76E79]/40 group transition-all duration-500 hover:border-[#F2C29A]/60 hover:shadow-[0_0_30px_rgba(183,110,121,0.3)]"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#7A2F57]/80 via-[#B76E79]/70 to-[#2A1208]/80 opacity-90"></div>
          <div className="animate-sheen"></div>
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#F2C29A]/70 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#B76E79]/50 to-transparent"></div>

          <span className="relative z-10 text-[#F2C29A] font-serif tracking-[0.1em] sm:tracking-[0.15em] text-lg sm:text-xl md:text-2xl group-hover:text-white transition-colors" style={{ fontFamily: 'Cinzel, serif' }}>
            {isSubmitting ? 'SENDING...' : 'SEND OTP'}
          </span>
          <ArrowRight className="relative z-10 ml-2 w-5 h-5 sm:w-6 sm:h-6 text-[#F2C29A] group-hover:text-white transition-colors" />
        </Button>

        {(error || status) && (
          <div className="text-center text-xs sm:text-sm md:text-base">
            {error && <p className="text-red-300">{error}</p>}
            {!error && status && <p className="text-[#C27A4E]">{status}</p>}
          </div>
        )}
      </form>

      {/* BACK TO LOGIN */}
      <div className="w-full mt-10 sm:mt-12 md:mt-14">
        <Link href="/auth/login" className="text-[#8A6A5C] hover:text-[#F2C29A] transition-colors text-sm sm:text-base md:text-lg tracking-wide uppercase text-xs sm:text-sm md:text-base font-bold tracking-widest">
          ← Back to Sign In
        </Link>
      </div>
    </div>
  );
}
