// src/app/login/page.tsx
"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // For a simple auth system, we'll use Supabase's email/password auth
      const { error } = await supabase.auth.signInWithPassword({
        email: username,
        password,
      });

      if (error) {
        throw error;
      }

      toast.success('Welcome back, Patricia!');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side - Stunning gradient background with branding */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-brand-blue to-brand-blue-light p-8 text-white flex-col justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-brand-orange"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <circle cx="12" cy="12" r="9" />
              <line x1="8" y1="7" x2="8" y2="17" />
              <line x1="16" y1="7" x2="16" y2="17" />
              <line x1="7" y1="10.5" x2="17" y2="10.5" />
              <line x1="7" y1="13.5" x2="17" y2="13.5" />
              <line x1="8" y1="7" x2="16" y2="17" />
            </svg>
          </div>
          <div className="text-xl font-bold">You-First Loans</div>
        </div>

        <div className="space-y-8 max-w-md">
          <h1 className="text-4xl font-bold leading-tight">
            Professional Loan Management System
          </h1>
          <p className="text-lg text-white/80">
            Streamline your loan operations, track payments, and gain valuable insights with our comprehensive loan management solution.
          </p>
          
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="bg-white/10 p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>Easy customer management</div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="bg-white/10 p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>Automated payment schedules</div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="bg-white/10 p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>Comprehensive analytics dashboard</div>
            </div>
          </div>
        </div>

        <div className="text-sm text-white/60">
          © {new Date().getFullYear()} You-First Loans. All rights reserved.
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center md:hidden mb-10">
            <div className="inline-flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-brand-blue flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <circle cx="12" cy="12" r="9" />
                  <line x1="8" y1="7" x2="8" y2="17" />
                  <line x1="16" y1="7" x2="16" y2="17" />
                  <line x1="7" y1="10.5" x2="17" y2="10.5" />
                  <line x1="7" y1="13.5" x2="17" y2="13.5" />
                  <line x1="8" y1="7" x2="16" y2="17" />
                </svg>
              </div>
              <div className="text-xl font-bold">You-First Loans</div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Loan Management System</h2>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-card">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
              <p className="text-gray-600 mt-2">Please sign in to your account</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-colors"
                  placeholder="Enter your username"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-colors"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-brand-blue to-brand-blue-light text-white py-3 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <LogIn size={20} />
                      <span>Sign In</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}