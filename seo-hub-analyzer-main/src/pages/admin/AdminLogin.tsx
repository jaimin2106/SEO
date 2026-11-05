// src/pages/admin/AdminLogin.tsx
// Dedicated admin login page at /admin/login.
// Completely separate from the user auth flow.

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { motion } from 'framer-motion';

const AdminLogin: React.FC = () => {
  const { signInAdmin, isAdminAuthenticated, isLoading } = useAdminAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Already authenticated → go straight to dashboard
  useEffect(() => {
    if (!isLoading && isAdminAuthenticated) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAdminAuthenticated, isLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const { error: loginError } = await signInAdmin(email.trim(), password);
      if (loginError) {
        setError(loginError);
      } else {
        navigate('/admin/dashboard', { replace: true });
      }
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Unable to sign in. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-[#f5f4ed] flex flex-col items-center justify-center px-4"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 16, filter: 'blur(8px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0)' }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm"
      >
        {/* Logo mark */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 rounded-xl bg-[#c96442] flex items-center justify-center mb-4 shadow-[0_8px_24px_rgba(201,100,66,0.25)]">
            <Shield className="h-6 w-6 text-white" strokeWidth={2} />
          </div>
          <h1
            className="text-[24px] text-[#141413] tracking-tight"
            style={{ fontFamily: "'Georgia', serif", fontWeight: 400 }}
          >
            Admin Console
          </h1>
          <p className="text-[13px] text-[#87867f] mt-1">Sign in to your admin account</p>
        </div>

        {/* Form card */}
        <div className="bg-[#faf9f5] rounded-2xl border border-[#e8e6dc] p-6 shadow-[0_2px_20px_rgba(20,20,19,0.06)]">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-[12px] font-semibold text-[#141413] mb-1.5 tracking-wide">
                Email address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full px-3.5 py-2.5 bg-[#f5f4ed] border border-[#e8e6dc] rounded-lg text-[14px] text-[#141413] placeholder:text-[#87867f] outline-none focus:border-[#c96442] focus:ring-2 focus:ring-[#c96442]/10 transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-[12px] font-semibold text-[#141413] mb-1.5 tracking-wide">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 pr-10 bg-[#f5f4ed] border border-[#e8e6dc] rounded-lg text-[14px] text-[#141413] placeholder:text-[#87867f] outline-none focus:border-[#c96442] focus:ring-2 focus:ring-[#c96442]/10 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#87867f] hover:text-[#141413] transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-3.5 py-2.5">
                <p className="text-[13px] text-red-600 font-medium">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#141413] text-white text-[14px] font-medium rounded-lg hover:bg-[#1f1e1a] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isSubmitting ? (
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Sign in to Admin
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer note */}
        <p className="text-center text-[11px] text-[#87867f] mt-6">
          Restricted access — authorised personnel only.
        </p>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
