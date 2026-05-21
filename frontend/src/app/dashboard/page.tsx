'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { 
  Zap, CheckCircle2, AlertTriangle, Cpu, Sparkles, 
  ArrowRight, Plus, RefreshCw, Layers, ExternalLink 
} from 'lucide-react';
import { useStore } from '../../store/useStore';

// Dynamically import Recharts to prevent hydration errors during Next.js SSR
const ResponsiveContainer = dynamic(() => import('recharts').then(m => m.ResponsiveContainer), { ssr: false });
const AreaChart = dynamic(() => import('recharts').then(m => m.AreaChart), { ssr: false });
const Area = dynamic(() => import('recharts').then(m => m.Area), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(m => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(m => m.YAxis), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(m => m.Tooltip), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then(m => m.CartesianGrid), { ssr: false });

export default function DashboardPage() {
  const router = useRouter();
  const token = useStore((state) => state.token);
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/analytics', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const resData = await res.json();
      if (res.ok) {
        setData(resData);
      }
    } catch (err) {
      console.error('Failed to fetch analytics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [token]);

  const handleCreateNewWorkflow = () => {
    router.push('/dashboard/workflows');
  };

  if (loading || !data) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
          <span className="text-zinc-500 text-xs">Loading dashboard analytics...</span>
        </div>
      </div>
    );
  }

  const { summary, recentExecutions, chartData } = data;

  const stats = [
    { name: 'Total Automations', value: summary.totalWorkflows, desc: 'Created in this workspace', icon: Layers, color: 'text-indigo-400', bg: 'bg-indigo-500/5' },
    { name: 'Active Agents', value: summary.totalAgents, desc: 'Configured LLM workers', icon: Cpu, color: 'text-purple-400', bg: 'bg-purple-500/5' },
    { name: 'Workflow Runs', value: summary.totalExecutions.toLocaleString(), desc: 'Total triggered nodes', icon: Zap, color: 'text-cyan-400', bg: 'bg-cyan-500/5' },
    { name: 'Execution Success Rate', value: `${summary.successRate}%`, desc: 'Average running health', icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/5' }
  ];

  const templates = [
    { title: 'Email Summarizer & Slack Dispatcher', description: 'Gmail trigger + AI agent summary + Slack channel post.', difficulty: 'Easy' },
    { title: 'Stripe Webhook Database Sync', description: 'Stripe webhook + DB insert action + Whatsapp confirmation.', difficulty: 'Medium' },
    { title: 'Google Sheets Lead Enricher', description: 'New row trigger + Custom GPT prompt + Sheet cell updates.', difficulty: 'Advanced' }
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            Dashboard Overview <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
          </h2>
          <p className="text-zinc-500 text-xs mt-1">Real-time logs, AI utilization, and active system operations.</p>
        </div>
        <button
          onClick={handleCreateNewWorkflow}
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/10"
        >
          <Plus className="w-4 h-4" />
          <span>New Workflow</span>
        </button>
      </div>

      {/* Grid of Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="p-6 rounded-2xl border border-zinc-900 bg-zinc-950/40 backdrop-blur-xl flex flex-col justify-between hover:border-zinc-800 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-zinc-500 font-semibold">{stat.name}</span>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${stat.bg} ${stat.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
                <p className="text-[10px] text-zinc-500 font-light">{stat.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recharts Analytics Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 p-6 rounded-2xl border border-zinc-900 bg-zinc-950/40 backdrop-blur-xl flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="text-sm font-bold text-white">Execution Metrics</h4>
              <p className="text-[10px] text-zinc-500">Run count performance for the past 7 days</p>
            </div>
            <button 
              onClick={fetchDashboardData}
              className="p-1.5 rounded-lg border border-zinc-850 hover:bg-zinc-900 text-zinc-400 hover:text-white"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorExecutions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#18181b" />
                <XAxis dataKey="date" stroke="#52525b" fontSize={9} tickLine={false} />
                <YAxis stroke="#52525b" fontSize={9} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '8px' }}
                  labelStyle={{ color: '#a1a1aa', fontSize: '10px', fontWeight: 'bold' }}
                  itemStyle={{ fontSize: '10px' }}
                />
                <Area type="monotone" dataKey="executions" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorExecutions)" name="Total Runs" />
                <Area type="monotone" dataKey="success" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorSuccess)" name="Success Runs" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Templates Panel */}
        <div className="p-6 rounded-2xl border border-zinc-900 bg-zinc-950/40 backdrop-blur-xl flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-white mb-1">Workflow Templates</h4>
            <p className="text-[10px] text-zinc-500 mb-6">Boot your automation speed with visual models</p>

            <div className="space-y-4">
              {templates.map((tpl, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-zinc-900 bg-zinc-950/40 hover:border-zinc-800 transition-colors cursor-pointer group">
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <h5 className="text-xs font-bold text-white group-hover:text-indigo-400 transition-colors truncate w-44">{tpl.title}</h5>
                    <span className="text-[9px] px-2 py-0.5 rounded-full border border-zinc-800 bg-zinc-900 text-zinc-400 font-medium">
                      {tpl.difficulty}
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-500 leading-normal truncate">{tpl.description}</p>
                </div>
              ))}
            </div>
          </div>

          <button 
            onClick={handleCreateNewWorkflow}
            className="w-full py-2.5 rounded-xl border border-zinc-900 hover:bg-zinc-900 text-zinc-300 font-semibold text-xs flex items-center justify-center gap-2 group transition-all"
          >
            <span>Explore Library</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>

      {/* Recent Executions Audit Log Table */}
      <div className="p-6 rounded-2xl border border-zinc-900 bg-zinc-950/40 backdrop-blur-xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h4 className="text-sm font-bold text-white">Recent Automation Activity</h4>
            <p className="text-[10px] text-zinc-500">Live transaction logs of workflow nodes execution</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-900 text-zinc-500 uppercase tracking-widest text-[9px] font-bold">
                <th className="pb-3 pr-4">Execution ID</th>
                <th className="pb-3 px-4">Workflow Name</th>
                <th className="pb-3 px-4">Status</th>
                <th className="pb-3 px-4">Run Speed</th>
                <th className="pb-3 pl-4 text-right">Trigger Time</th>
              </tr>
            </thead>
            <tbody>
              {recentExecutions.map((log: any) => (
                <tr key={log.id} className="border-b border-zinc-900/60 hover:bg-zinc-900/10 transition-colors">
                  <td className="py-4 pr-4 font-mono text-[10px] text-zinc-500">
                    {log.id.substring(0, 8)}...
                  </td>
                  <td className="py-4 px-4 font-bold text-white">
                    {log.workflowName || 'Custom API Webhook'}
                  </td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[9px] font-semibold uppercase ${
                      log.status === 'SUCCESS'
                        ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400'
                        : 'border-red-500/20 bg-red-500/5 text-red-400'
                    }`}>
                      <span className={`w-1 h-1 rounded-full ${log.status === 'SUCCESS' ? 'bg-emerald-400' : 'bg-red-400'}`} />
                      {log.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-mono text-[10px] text-zinc-400">
                    {log.duration}ms
                  </td>
                  <td className="py-4 pl-4 text-right text-zinc-500 text-[10px]">
                    {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
