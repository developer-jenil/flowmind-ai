'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, Sparkles, Workflow, Cpu, Zap, Database, 
  Mail, MessageSquare, FileText, Check, Play, Shield, Terminal, ArrowUpRight 
} from 'lucide-react';
import { useStore } from '../store/useStore';

export default function LandingPage() {
  const router = useRouter();
  const token = useStore((state) => state.token);
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [simulationLogs, setSimulationLogs] = useState<string[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);

  // Mock simulation for Landing Page Hero
  const startDemoSimulation = async () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setSimulationLogs([]);
    
    const steps = [
      { msg: '📥 Gmail: Polling inbox... New lead received from client.', active: 0 },
      { msg: '🤖 AI Agent: Analyzing lead details & extracting action items...', active: 1 },
      { msg: '💬 Slack: Dispatched alert summary to #sales-leads.', active: 2 },
      { msg: '📊 Google Sheets: Row logged in Spreadsheet.', active: 3 }
    ];

    for (let i = 0; i < steps.length; i++) {
      setActiveStep(steps[i].active);
      setSimulationLogs(prev => [...prev, steps[i].msg]);
      await new Promise(resolve => setTimeout(resolve, 1200));
    }
    
    setActiveStep(null);
    setIsSimulating(false);
  };

  return (
    <div className="relative min-h-screen bg-[#030303] text-zinc-100 overflow-hidden bg-dot-cyber">
      {/* Background Mesh Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] mesh-glow-1 pointer-events-none rounded-full" />
      <div className="absolute top-[30%] right-[-10%] w-[60%] h-[60%] mesh-glow-2 pointer-events-none rounded-full" />
      <div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] mesh-glow-1 pointer-events-none rounded-full" />

      {/* Navigation */}
      <nav className="sticky top-0 z-50 glass-nav">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Workflow className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              FlowMind <span className="text-indigo-400">AI</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm text-zinc-400 font-medium">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#demo" className="hover:text-white transition-colors">Interactive Demo</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </div>

          <div className="flex items-center gap-4">
            {token ? (
              <button 
                onClick={() => router.push('/dashboard')}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-all flex items-center gap-2 hover:shadow-lg hover:shadow-indigo-600/20"
              >
                Dashboard <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <>
                <Link href="/login" className="text-sm font-semibold text-zinc-400 hover:text-white transition-colors">
                  Sign In
                </Link>
                <Link 
                  href="/signup"
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-all hover:shadow-lg hover:shadow-indigo-600/20"
                >
                  Start Building
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-indigo-300 text-xs font-medium mb-6 shadow-sm shadow-indigo-500/5 animate-fade-in"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>The Next Generation of Workflow Automation</span>
        </div>

        <h1
          className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight max-w-5xl leading-[1.08] mb-8"
        >
          Automate Your Entire Business With{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-500 bg-clip-text text-transparent">
            AI Agents
          </span>
        </h1>

        <p
          className="text-zinc-400 text-base sm:text-xl max-w-3xl mb-10 leading-relaxed font-light"
        >
          Build intelligent workflows, AI-driven automations, and self-improving agents. Connect all your apps and automate operations in minutes.
        </p>

        <div
          className="flex flex-col sm:flex-row items-center gap-4 mb-20"
        >
          <button 
            onClick={() => router.push(token ? '/dashboard' : '/signup')}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white text-black font-semibold hover:bg-zinc-100 transition-all flex items-center justify-center gap-2 hover:shadow-xl hover:shadow-white/10"
          >
            Start Building Free <ArrowRight className="w-4 h-4" />
          </button>
          <a
            href="#demo"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 font-semibold hover:bg-zinc-800 hover:text-white transition-all flex items-center justify-center gap-2"
          >
            Watch Demo
          </a>
        </div>

        {/* Live Interactive Workflow Builder Demo */}
        <div
          id="demo"
          className="w-full max-w-5xl rounded-2xl border border-zinc-800 bg-zinc-950/70 shadow-2xl overflow-hidden glass-card"
        >
          {/* Header Panel */}
          <div className="px-6 py-4 border-b border-zinc-900 flex items-center justify-between bg-zinc-950/90">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500/60" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/60" />
              <span className="w-3 h-3 rounded-full bg-green-500/60" />
              <span className="text-xs text-zinc-500 ml-2 font-mono">demo_workflow.json</span>
            </div>
            <button
              onClick={startDemoSimulation}
              disabled={isSimulating}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
                isSimulating 
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/10'
              }`}
            >
              <Play className="w-3 h-3 fill-white" />
              {isSimulating ? 'Running Simulation...' : 'Simulate Run'}
            </button>
          </div>

          {/* Editor Canvas Area */}
          <div className="p-10 relative min-h-[300px] flex flex-col md:flex-row items-center justify-between gap-8 bg-grid-cyber">
            {/* Connection Glow Line */}
            <div className="absolute top-[50%] left-[10%] right-[10%] h-[2px] bg-zinc-800 hidden md:block z-0 pointer-events-none" />

            {/* Node 1: Gmail Trigger */}
            <div className={`relative z-10 p-5 rounded-xl border w-full md:w-56 transition-all duration-500 ${
              activeStep === 0 
                ? 'border-cyan-500 bg-cyan-950/20 shadow-[0_0_20px_rgba(6,182,212,0.25)] scale-105' 
                : 'border-zinc-800 bg-zinc-900/50'
            }`}>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs text-zinc-400 uppercase tracking-widest font-bold">Trigger</h4>
                  <h3 className="text-sm font-semibold">Gmail Email</h3>
                </div>
              </div>
              <p className="text-xs text-zinc-500 mt-1">Check lead subjects</p>
            </div>

            {/* Node 2: AI Agent */}
            <div className={`relative z-10 p-5 rounded-xl border w-full md:w-56 transition-all duration-500 ${
              activeStep === 1 
                ? 'border-purple-500 bg-purple-950/20 shadow-[0_0_20px_rgba(168,85,247,0.25)] scale-105' 
                : 'border-zinc-800 bg-zinc-900/50'
            }`}>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs text-zinc-400 uppercase tracking-widest font-bold">AI Agent</h4>
                  <h3 className="text-sm font-semibold">LLM Summary</h3>
                </div>
              </div>
              <p className="text-xs text-zinc-500 mt-1">Extract lead telemetry</p>
            </div>

            {/* Node 3: Slack Alert */}
            <div className={`relative z-10 p-5 rounded-xl border w-full md:w-56 transition-all duration-500 ${
              activeStep === 2 
                ? 'border-pink-500 bg-pink-950/20 shadow-[0_0_20px_rgba(236,72,153,0.25)] scale-105' 
                : 'border-zinc-800 bg-zinc-900/50'
            }`}>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-400">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs text-zinc-400 uppercase tracking-widest font-bold">Action</h4>
                  <h3 className="text-sm font-semibold">Slack Message</h3>
                </div>
              </div>
              <p className="text-xs text-zinc-500 mt-1">Post to #sales-leads</p>
            </div>

            {/* Node 4: Google Sheets */}
            <div className={`relative z-10 p-5 rounded-xl border w-full md:w-56 transition-all duration-500 ${
              activeStep === 3 
                ? 'border-green-500 bg-green-950/20 shadow-[0_0_20px_rgba(34,197,94,0.25)] scale-105' 
                : 'border-zinc-800 bg-zinc-900/50'
            }`}>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-400">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs text-zinc-400 uppercase tracking-widest font-bold">Action</h4>
                  <h3 className="text-sm font-semibold">Google Sheets</h3>
                </div>
              </div>
              <p className="text-xs text-zinc-500 mt-1">Append new logs</p>
            </div>
          </div>

          {/* Console Log Panel */}
          <div className="border-t border-zinc-900 bg-zinc-950 p-4 font-mono text-left max-h-[140px] overflow-y-auto">
            <div className="flex items-center gap-2 mb-2 text-zinc-500 text-xs uppercase tracking-wider font-bold">
              <Terminal className="w-3.5 h-3.5" />
              <span>Real-Time Logs</span>
            </div>
            {simulationLogs.length === 0 ? (
              <p className="text-zinc-600 text-xs">Console idle. Click "Simulate Run" above to activate flow.</p>
            ) : (
              simulationLogs.map((log, idx) => (
                <p 
                  key={idx} 
                  className="text-xs text-indigo-300 mb-1 animate-fade-in"
                >
                  {log}
                </p>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 border-t border-zinc-900 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3">Infinite Capabilities</h2>
            <h3 className="text-3xl sm:text-5xl font-extrabold tracking-tight">Features Built for Billion-Dollar Startups</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-2xl border border-zinc-800 bg-zinc-900/20 hover:border-indigo-500/30 transition-all duration-300 group hover:shadow-xl hover:shadow-indigo-500/20">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-110 transition-transform">
                <Cpu className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold mb-2">Autonomous AI Agents</h4>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Build dedicated agents trained with custom directives and short-term memory that can reason, filter and generate output.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-2xl border border-zinc-800 bg-zinc-900/20 hover:border-purple-500/30 transition-all duration-300 group hover:shadow-xl hover:shadow-purple-500/20">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 mb-6 group-hover:scale-110 transition-transform">
                <Workflow className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold mb-2">Drag-and-Drop Workflow Builder</h4>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Connect nodes, configure conditions, write Custom GPT rules, or route API data endpoints on an infinite canvas with seamless navigation.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-2xl border border-zinc-800 bg-zinc-900/20 hover:border-cyan-500/30 transition-all duration-300 group hover:shadow-xl hover:shadow-cyan-500/20">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold mb-2">Instant AI Generation</h4>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Describe your desired logic in plain English (e.g. "poll Slack alerts for error codes and update Postgres"). AI builds it instantly.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-8 rounded-2xl border border-zinc-800 bg-zinc-900/20 hover:border-pink-500/30 transition-all duration-300 group hover:shadow-xl hover:shadow-pink-500/20">
              <div className="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-400 mb-6 group-hover:scale-110 transition-transform">
                <Database className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold mb-2">Multi-App Integrations</h4>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Fully mapped integrations for Slack, Gmail, Notion, Discord, GitHub, Stripe, and Google Sheets, toggled on and off with one click.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-8 rounded-2xl border border-zinc-800 bg-zinc-900/20 hover:border-emerald-500/30 transition-all duration-300 group hover:shadow-xl hover:shadow-emerald-500/20">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
                <Terminal className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold mb-2">Real-Time Event Logs</h4>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Audit every execution step. Receive real-time telemetry inputs and outputs of each action node through custom WebSocket channels.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-8 rounded-2xl border border-zinc-800 bg-zinc-900/20 hover:border-rose-500/30 transition-all duration-300 group hover:shadow-xl hover:shadow-rose-500/20">
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-400 mb-6 group-hover:scale-110 transition-transform">
                <Shield className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold mb-2">Production Grade Security</h4>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Industry standard JWT token authorizations, salted bcrypt passwords, encrypted API connections, and strict secure API structures.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6 border-t border-zinc-900 relative bg-zinc-950/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3">Transparent Plans</h2>
            <h3 className="text-3xl sm:text-5xl font-extrabold tracking-tight">Flexible SaaS Pricing</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-5xl mx-auto">
            {/* Plan 1 */}
            <div className="p-8 rounded-2xl border border-zinc-800 bg-zinc-950/60 flex flex-col justify-between">
              <div>
                <h4 className="text-zinc-400 text-sm uppercase tracking-widest font-bold mb-2">Starter</h4>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-extrabold">$0</span>
                  <span className="text-zinc-500 text-sm">/mo</span>
                </div>
                <ul className="space-y-4 mb-8 text-sm text-zinc-400">
                  <li className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-indigo-400" />
                    <span>1,000 runs per month</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-indigo-400" />
                    <span>3 active workflows</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-indigo-400" />
                    <span>Standard agent reasoning</span>
                  </li>
                </ul>
              </div>
              <button 
                onClick={() => router.push(token ? '/dashboard' : '/signup')}
                className="w-full py-3 rounded-xl border border-zinc-800 hover:bg-zinc-900 text-white font-semibold text-xs transition-all"
              >
                Get Started
              </button>
            </div>

            {/* Plan 2 */}
            <div className="p-8 rounded-2xl border border-indigo-500/40 bg-zinc-950/60 flex flex-col justify-between relative shadow-xl shadow-indigo-500/5">
              <div className="absolute top-0 right-6 transform -translate-y-1/2 px-3 py-1 rounded-full bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider">
                Popular
              </div>
              <div>
                <h4 className="text-indigo-400 text-sm uppercase tracking-widest font-bold mb-2">Pro</h4>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-extrabold">$29</span>
                  <span className="text-zinc-500 text-sm">/mo</span>
                </div>
                <ul className="space-y-4 mb-8 text-sm text-zinc-300">
                  <li className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-indigo-400" />
                    <span>50,000 runs per month</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-indigo-400" />
                    <span>Unlimited active workflows</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-indigo-400" />
                    <span>Advanced agent configuration</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-indigo-400" />
                    <span>Priority WebSocket channels</span>
                  </li>
                </ul>
              </div>
              <button 
                onClick={() => router.push(token ? '/dashboard' : '/signup')}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-lg shadow-indigo-600/10"
              >
                Upgrade to Pro
              </button>
            </div>

            {/* Plan 3 */}
            <div className="p-8 rounded-2xl border border-zinc-800 bg-zinc-950/60 flex flex-col justify-between">
              <div>
                <h4 className="text-zinc-400 text-sm uppercase tracking-widest font-bold mb-2">Enterprise</h4>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-extrabold">Custom</span>
                </div>
                <ul className="space-y-4 mb-8 text-sm text-zinc-400">
                  <li className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-indigo-400" />
                    <span>Unlimited runs & memory</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-indigo-400" />
                    <span>Dedicated server instances</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-indigo-400" />
                    <span>SLA uptime guarantee</span>
                  </li>
                </ul>
              </div>
              <button 
                onClick={() => router.push(token ? '/dashboard' : '/signup')}
                className="w-full py-3 rounded-xl border border-zinc-800 hover:bg-zinc-900 text-white font-semibold text-xs transition-all"
              >
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-900 py-16 px-6 bg-black relative">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <div>
            <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
              <div className="w-6 h-6 rounded bg-indigo-600 flex items-center justify-center">
                <Workflow className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold text-white">FlowMind AI</span>
            </div>
            <p className="text-zinc-500 text-xs max-w-xs">
              Autonomous AI Agent orchestration for modern startups and hackathons.
            </p>
          </div>

          <div className="text-zinc-500 text-xs font-mono">
            &copy; 2026 FlowMind AI Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
