'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Workflow, Sparkles, AlertCircle } from 'lucide-react';
import { useStore } from '../../store/useStore';

export default function SignupPage() {
  const router = useRouter();
  const setAuth = useStore((state) => state.setAuth);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Signup failed. Please try again.');
      }

      setAuth(data.token, data.user);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMockGoogleLogin = () => {
    setAuth('mock-jwt-token-google-auth-2026', {
      id: 'demo-user-id',
      email: 'hackathon-judge@flowmind.ai',
      name: 'Judge Reviewer'
    });
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#030303] text-zinc-100 flex items-center justify-center p-6 relative overflow-hidden bg-dot-cyber">
      {/* Background Glows */}
      <div className="absolute top-[20%] left-[20%] w-[40%] h-[40%] mesh-glow-1 pointer-events-none rounded-full" />
      <div className="absolute bottom-[20%] right-[20%] w-[45%] h-[45%] mesh-glow-2 pointer-events-none rounded-full" />

      <div 
        className="w-full max-w-md p-8 rounded-2xl border border-zinc-800 bg-zinc-950/75 shadow-2xl glass-card relative z-10"
      >
        {/* Branding header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/20">
            <Workflow className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Create your account</h2>
          <p className="text-zinc-500 text-xs mt-1">Start building AI agent workflows</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 text-xs flex items-center gap-3">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Full Name</label>
            <input 
              type="text" 
              required
              placeholder="Sarah Connor" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-zinc-800 bg-zinc-900/50 text-white text-sm focus:border-indigo-500 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Email Address</label>
            <input 
              type="email" 
              required
              placeholder="sarah@company.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-zinc-800 bg-zinc-900/50 text-white text-sm focus:border-indigo-500 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Password</label>
            <input 
              type="password" 
              required
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-zinc-800 bg-zinc-900/50 text-white text-sm focus:border-indigo-500 focus:outline-none transition-colors"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition-colors shadow-lg shadow-white/5 flex items-center justify-center"
          >
            {loading ? 'Registering...' : 'Get Started'}
          </button>
        </form>

        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-850" />
          </div>
          <span className="relative px-3 text-[10px] uppercase text-zinc-500 bg-[#030303]">or continue with</span>
        </div>

        {/* Demo Google signup */}
        <button 
          onClick={handleMockGoogleLogin}
          className="w-full py-3 rounded-xl border border-zinc-800 bg-zinc-900/35 hover:bg-zinc-900 text-zinc-200 font-semibold text-xs transition-colors flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4.5 h-4.5 text-indigo-400" />
          <span>Instant Hackathon Login</span>
        </button>

        <p className="text-center text-xs text-zinc-500 mt-8">
          Already have an account?{' '}
          <Link href="/login" className="text-indigo-400 font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
