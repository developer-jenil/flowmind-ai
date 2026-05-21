'use client';

import React, { useState } from 'react';
import { 
  Settings, User, Key, CreditCard, Shield, 
  Check, RefreshCw, AlertCircle, Trash2 
} from 'lucide-react';
import { useStore } from '../../../store/useStore';

export default function SettingsPage() {
  const token = useStore((state) => state.token);
  const user = useStore((state) => state.user);
  const setAuth = useStore((state) => state.setAuth);

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [openaiKey, setOpenaiKey] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    setLoading(true);

    try {
      // Simulate API update request
      await new Promise(resolve => setTimeout(resolve, 600));
      if (token && user) {
        setAuth(token, { ...user, name, email });
        setSuccessMsg('Profile settings updated successfully!');
      }
    } catch (err) {
      setErrorMsg('Failed to update profile settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveApiKeys = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    setLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setSuccessMsg('API Key configuration encrypted and stored.');
      setOpenaiKey('');
    } catch (err) {
      setErrorMsg('Failed to save API credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          Settings <Settings className="w-5 h-5 text-indigo-400" />
        </h2>
        <p className="text-zinc-500 text-xs mt-1">Configure profile details, API integrations, and account billing options.</p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-xs flex items-center gap-3">
          <Check className="w-4 h-4" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 text-xs flex items-center gap-3">
          <AlertCircle className="w-4 h-4" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Forms */}
        <div className="md:col-span-2 space-y-8">
          {/* Profile Form */}
          <div className="p-6 rounded-2xl border border-zinc-900 bg-zinc-950/40 backdrop-blur-xl">
            <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
              <User className="w-4.5 h-4.5 text-indigo-400" />
              <span>Workspace Profile</span>
            </h3>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">Display Name</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-850 bg-zinc-900/50 text-white text-xs focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">Email Address</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-850 bg-zinc-900/50 text-white text-xs focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-indigo-600/10"
                >
                  {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>Save Profile</span>
                </button>
              </div>
            </form>
          </div>

          {/* Encryption keys form */}
          <div className="p-6 rounded-2xl border border-zinc-900 bg-zinc-950/40 backdrop-blur-xl">
            <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
              <Key className="w-4.5 h-4.5 text-indigo-400" />
              <span>AI Secret Credentials</span>
            </h3>

            <form onSubmit={handleSaveApiKeys} className="space-y-4">
              <div>
                <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">OpenAI Secret API Key</label>
                <input 
                  type="password" 
                  placeholder="sk-proj-••••••••••••••••"
                  value={openaiKey}
                  onChange={(e) => setOpenaiKey(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-850 bg-zinc-900/50 text-white text-xs focus:border-indigo-500 focus:outline-none font-mono"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-indigo-600/10"
                >
                  {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>Save Keys</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Billing Widget */}
        <div className="space-y-8">
          <div className="p-6 rounded-2xl border border-zinc-900 bg-zinc-950/40 backdrop-blur-xl flex flex-col justify-between h-full min-h-[300px]">
            <div>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h4 className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Billing Tier</h4>
                  <h3 className="text-lg font-bold text-white mt-1">FlowMind Pro</h3>
                </div>
                <span className="text-[9px] px-2 py-0.5 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-indigo-400 font-bold uppercase tracking-wider">
                  Active
                </span>
              </div>

              <div className="space-y-4 mb-8">
                <div>
                  <div className="flex justify-between text-xs text-zinc-400 mb-1">
                    <span>Workflow Runs</span>
                    <span className="font-semibold text-white">1,420 / 50,000</span>
                  </div>
                  <div className="h-2 rounded-full bg-zinc-900 overflow-hidden border border-zinc-850">
                    <div className="h-full bg-indigo-600 rounded-full" style={{ width: '2.8%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-zinc-400 mb-1">
                    <span>AI Agent Allocations</span>
                    <span className="font-semibold text-white">3 / Unlimited</span>
                  </div>
                  <div className="h-2 rounded-full bg-zinc-900 overflow-hidden border border-zinc-850">
                    <div className="h-full bg-indigo-600 rounded-full" style={{ width: '30%' }} />
                  </div>
                </div>
              </div>

              <div className="text-[10px] text-zinc-500 border-t border-zinc-900 pt-4 flex justify-between items-center">
                <span>Renewal Date</span>
                <span className="font-mono text-zinc-400">June 21, 2026</span>
              </div>
            </div>

            <button 
              className="w-full py-2.5 rounded-xl border border-zinc-850 hover:bg-zinc-900 text-zinc-300 font-semibold text-xs transition-colors flex items-center justify-center gap-2 mt-8"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Update Billing</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
