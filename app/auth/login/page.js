'use client';

import React, { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiFetch } from '../../../lib/api';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setStatus('');

    if (!identifier || !password) {
      setError('Please enter your email/username and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiFetch('/api/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          username: identifier.trim(),
          password,
          remember_me: rememberMe,
        }),
      });
      setStatus('Signed in successfully.');
      router.push('/');
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
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
          Welcome Back
        </h2>
        <p className="text-white/80 text-xs sm:text-sm md:text-base uppercase tracking-[0.2em] font-light">
          Sign in to continue your journey
        </p>
      </div>

      {/* FORM */}
      <form className="w-full space-y-5 sm:space-y-6 md:space-y-7 animate-fade-in-up-delay" onSubmit={handleSubmit}>
        {/* Username/Email */}
        <div className="luxury-input-wrapper h-14 sm:h-16 md:h-18 rounded-2xl relative group flex items-center px-5 sm:px-6">
          <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-[#B76E79] group-focus-within:text-[#F2C29A] transition-colors duration-300" />
          <Input 
            type="text" 
            placeholder="Username or Email" 
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="h-full pl-4 sm:pl-5 text-[#EAE0D5] placeholder:text-[#8A6A5C] text-base sm:text-lg md:text-xl" 
          />
        </div>

        {/* Password */}
        <div className="luxury-input-wrapper h-14 sm:h-16 md:h-18 rounded-2xl relative group flex items-center px-5 sm:px-6">
          <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-[#B76E79] group-focus-within:text-[#F2C29A] transition-colors duration-300" />
          <Input 
            type={showPassword ? "text" : "password"} 
            placeholder="Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-full pl-4 sm:pl-5 pr-12 text-[#EAE0D5] placeholder:text-[#8A6A5C] text-base sm:text-lg md:text-xl" 
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-5 sm:right-6 text-[#8A6A5C] hover:text-[#F2C29A] transition-colors"
          >
            {showPassword ? <EyeOff className="w-5 h-5 sm:w-6 sm:h-6" /> : <Eye className="w-5 h-5 sm:w-6 sm:h-6" />}
          </button>
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-3 cursor-pointer">
            <input 
              type="checkbox" 
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-5 h-5 sm:w-6 sm:h-6"
            />
            <span className="text-xs sm:text-sm md:text-base text-white/80">Remember me</span>
          </label>
          <Link href="/auth/forgot-password" className="text-xs sm:text-sm md:text-base uppercase tracking-widest text-white/80 hover:text-[#F2C29A] transition-colors">
            Forgot Password?
          </Link>
        </div>

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

          <span className="relative z-10 text-white font-serif tracking-[0.1em] sm:tracking-[0.15em] text-lg sm:text-xl md:text-2xl group-hover:text-white transition-colors" style={{ fontFamily: 'Cinzel, serif' }}>
            {isSubmitting ? 'SIGNING IN...' : 'SIGN IN'}
          </span>
        </Button>

        {(error || status) && (
          <div className="text-center text-xs sm:text-sm md:text-base">
            {error && <p className="text-red-300">{error}</p>}
            {!error && status && <p className="text-[#C27A4E]">{status}</p>}
          </div>
        )}
      </form>

      {/* TOGGLE LINK */}
      <div className="w-full mt-10 sm:mt-12 md:mt-14">
        <p className="text-center text-[#8A6A5C] text-sm sm:text-base md:text-lg tracking-wide">
          New here?{" "}
          <Link href="/auth/register" className="text-[#C27A4E] hover:text-[#F2C29A] transition-colors ml-1 uppercase text-xs sm:text-sm md:text-base font-bold tracking-widest">
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
}
