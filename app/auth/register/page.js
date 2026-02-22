'use client';

import React, { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Mail, Lock, User, Eye, EyeOff, Phone } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiFetch } from '../../../lib/api';

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setStatus('');

    if (!fullName || !username || !email || !password) {
      setError('Please fill in all required fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiFetch('/api/v1/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          full_name: fullName.trim(),
          username: username.trim(),
          email: email.trim(),
          phone: phone.trim() || null,
          password,
          role: 'customer',
        }),
      });

      await apiFetch('/api/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          username: email.trim(),
          password,
          remember_me: false,
        }),
      });

      setStatus('Account created. Redirecting...');
      router.push('/');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
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
          Join AARYA
        </h2>
        <p className="text-white/80 text-xs sm:text-sm md:text-base uppercase tracking-[0.2em] font-light">
          Create your account to begin
        </p>
      </div>

      {/* FORM */}
      <form className="w-full space-y-5 sm:space-y-6 md:space-y-7 animate-fade-in-up-delay" onSubmit={handleSubmit}>
        {/* Full Name */}
        <div className="luxury-input-wrapper h-14 sm:h-16 md:h-18 rounded-2xl relative group flex items-center px-5 sm:px-6">
          <User className="w-5 h-5 sm:w-6 sm:h-6 text-[#B76E79] group-focus-within:text-[#F2C29A] transition-colors duration-300" />
          <Input 
            type="text" 
            placeholder="Full Name" 
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="h-full pl-4 sm:pl-5 text-[#EAE0D5] placeholder:text-[#8A6A5C] text-base sm:text-lg md:text-xl" 
          />
        </div>

        {/* Username */}
        <div className="luxury-input-wrapper h-14 sm:h-16 md:h-18 rounded-2xl relative group flex items-center px-5 sm:px-6">
          <User className="w-5 h-5 sm:w-6 sm:h-6 text-[#B76E79] group-focus-within:text-[#F2C29A] transition-colors duration-300" />
          <Input 
            type="text" 
            placeholder="Username" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="h-full pl-4 sm:pl-5 text-[#EAE0D5] placeholder:text-[#8A6A5C] text-base sm:text-lg md:text-xl" 
          />
        </div>

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

        {/* Phone (Optional) */}
        <div className="luxury-input-wrapper h-14 sm:h-16 md:h-18 rounded-2xl relative group flex items-center px-5 sm:px-6">
          <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-[#B76E79] group-focus-within:text-[#F2C29A] transition-colors duration-300" />
          <Input 
            type="tel" 
            placeholder="Phone Number (Optional)" 
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
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

        {/* Confirm Password */}
        <div className="luxury-input-wrapper h-14 sm:h-16 md:h-18 rounded-2xl relative group flex items-center px-5 sm:px-6">
          <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-[#B76E79] group-focus-within:text-[#F2C29A] transition-colors duration-300" />
          <Input 
            type={showConfirmPassword ? "text" : "password"} 
            placeholder="Confirm Password" 
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="h-full pl-4 sm:pl-5 pr-12 text-[#EAE0D5] placeholder:text-[#8A6A5C] text-base sm:text-lg md:text-xl" 
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-5 sm:right-6 text-[#8A6A5C] hover:text-[#F2C29A] transition-colors"
          >
            {showConfirmPassword ? <EyeOff className="w-5 h-5 sm:w-6 sm:h-6" /> : <Eye className="w-5 h-5 sm:w-6 sm:h-6" />}
          </button>
        </div>

        {/* Password Requirements */}
        <div className="text-xs sm:text-sm md:text-base text-white/60 space-y-1">
          <p>Password must contain:</p>
          <ul className="list-disc list-inside space-y-0.5 ml-2">
            <li>At least 8 characters</li>
            <li>One uppercase letter</li>
            <li>One lowercase letter</li>
            <li>One number</li>
          </ul>
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

          <span className="relative z-10 text-[#F2C29A] font-serif tracking-[0.1em] sm:tracking-[0.15em] text-lg sm:text-xl md:text-2xl group-hover:text-white transition-colors" style={{ fontFamily: 'Cinzel, serif' }}>
            {isSubmitting ? 'CREATING...' : 'SIGN UP'}
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
        <p className="text-center text-white/70 text-sm sm:text-base md:text-lg tracking-wide">
          Already a member?{" "}
          <Link href="/auth/login" className="text-[#C27A4E] hover:text-[#F2C29A] transition-colors ml-1 uppercase text-xs sm:text-sm md:text-base font-bold tracking-widest">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
