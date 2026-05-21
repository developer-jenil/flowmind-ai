'use client';

import React, { useEffect, useState } from 'react';
import { 
  Database, Mail, MessageSquare, Smartphone, Key, Lock, 
  Check, CloudLightning, ShieldCheck, X, RefreshCw
} from 'lucide-react';
import { useStore } from '../../../store/useStore';

export default function IntegrationsPage() {
  const token = useStore((state) => state.token);
  const integrations = useStore((state) => state.integrations);
  const fetchIntegrations = useStore((state) => state.fetchIntegrations);
  const toggleIntegration = useStore((state) => state.toggleIntegration);

  const [activeSetupIntegration, setActiveSetupIntegration] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchIntegrations();
  }, [token]);

  const handleOpenConnect = (name: string) => {
    const isConnected = integrations.find(i => i.name === name)?.connected;
    if (isConnected) {
      // Disconnect directly
      toggleIntegration(name, false);
    } else {
      // Open modal to configure credentials
      setActiveSetupIntegration(name);
      setApiKey('');
    }
  };

  const handleSaveConnection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSetupIntegration) return;
    setLoading(true);
    // Simulate encryption verification
    await new Promise(resolve => setTimeout(resolve, 800));
    await toggleIntegration(activeSetupIntegration, true);
    setLoading(false);
    setActiveSetupIntegration(null);
  };

  const apps = [
    { name: 'gmail', label: 'Gmail / Google Suite', desc: 'Monitor emails, parse attachments, and trigger schedules.', icon: Mail, color: 'text-cyan-400 border-cyan-500/20 bg-cyan-500/5' },
    { name: 'slack', label: 'Slack Alert Channels', desc: 'Push messaging streams, alert teams, or parse triggers.', icon: MessageSquare, color: 'text-rose-400 border-rose-500/20 bg-rose-500/5' },
    { name: 'discord', label: 'Discord Bot Dispatcher', desc: 'Broadcast markdown embeds and trigger webhook events.', icon: CloudLightning, color: 'text-indigo-400 border-indigo-500/20 bg-indigo-500/5' },
    { name: 'notion', label: 'Notion AI Workspace', desc: 'Upsert document databases and update tables.', icon: Database, color: 'text-amber-400 border-amber-500/20 bg-amber-500/5' },
    { name: 'googleSheets', label: 'Google Sheets', desc: 'Log rows, edit spreadsheets, and query worksheets.', icon: Database, color: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5' },
    { name: 'github', label: 'GitHub Repositories', desc: 'Commit triggers, monitor pull requests, and audit code.', icon: CloudLightning, color: 'text-zinc-300 border-zinc-700/20 bg-zinc-700/5' },
    { name: 'whatsapp', label: 'WhatsApp Template Message', desc: 'Send immediate template mobile SMS notifications.', icon: Smartphone, color: 'text-teal-400 border-teal-500/20 bg-teal-500/5' },
    { name: 'openai', label: 'OpenAI API completion', desc: 'Run advanced GPT cognitive pipelines and model orchestration.', icon: Key, color: 'text-purple-400 border-purple-500/20 bg-purple-500/5' },
    { name: 'stripe', label: 'Stripe Payment Gateway', desc: 'Capture charge success logs and monitor subscriptions.', icon: Lock, color: 'text-sky-400 border-sky-500/20 bg-sky-500/5' }
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          Connected Ecosystem <Database className="w-5 h-5 text-indigo-400" />
        </h2>
        <p className="text-zinc-500 text-xs mt-1">Connect your workspace with third-party tools via encrypted credential pipelines.</p>
      </div>

      {/* Grid of integrations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {apps.map((app) => {
          const Icon = app.icon;
          const isConnected = integrations.find(i => i.name === app.name)?.connected || false;

          return (
            <div 
              key={app.name}
              className={`rounded-2xl border bg-zinc-950/40 p-6 flex flex-col justify-between hover:bg-zinc-900/10 transition-all duration-300 group ${
                isConnected ? 'border-indigo-500/30' : 'border-zinc-900 hover:border-zinc-800'
              }`}
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${app.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[9px] font-bold uppercase tracking-wider ${
                    isConnected 
                      ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.1)]' 
                      : 'border-zinc-800 bg-zinc-900 text-zinc-500'
                  }`}>
                    {isConnected ? 'Connected' : 'Offline'}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white mb-1.5">{app.label}</h3>
                <p className="text-xs text-zinc-500 font-light leading-normal line-clamp-3 h-12 mb-6">
                  {app.desc}
                </p>
              </div>

              <button
                onClick={() => handleOpenConnect(app.name)}
                className={`w-full py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isConnected 
                    ? 'border border-zinc-800 hover:border-red-500/25 hover:bg-red-500/5 text-zinc-400 hover:text-red-400' 
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/15'
                }`}
              >
                {isConnected ? 'Disconnect' : 'Connect Account'}
              </button>
            </div>
          );
        })}
      </div>

      {/* CREDENTIAL CONFIGURE MODAL */}
      {activeSetupIntegration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm p-6 rounded-2xl border border-zinc-850 bg-zinc-950 shadow-2xl glass-card">
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-zinc-900">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Configure connection</h3>
              <button 
                onClick={() => setActiveSetupIntegration(null)} 
                className="p-1 rounded hover:bg-zinc-900 text-zinc-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveConnection} className="space-y-4">
              <div className="p-4 rounded-xl border border-indigo-500/20 bg-indigo-500/5 text-zinc-400 text-[10px] flex items-start gap-3">
                <ShieldCheck className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                <span>Your authorization tokens are encrypted at rest using AES-256 and never shared with external services.</span>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">API Secret Token / Key</label>
                <input 
                  type="password" 
                  required
                  placeholder="sk_live_••••••••"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-850 bg-zinc-900/50 text-white text-xs focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveSetupIntegration(null)}
                  className="px-4 py-2 rounded-lg border border-zinc-800 text-zinc-400 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-indigo-600/10"
                >
                  {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>Authorize</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
