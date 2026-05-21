'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { 
  BarChart3, RefreshCw, Sparkles, TrendingUp, 
  Activity, Zap, Clock, ShieldCheck, Terminal
} from 'lucide-react';
import { useStore } from '../../../store/useStore';

// Dynamic Recharts to prevent SSR hydration crashes
const ResponsiveContainer = dynamic(() => import('recharts').then(m => m.ResponsiveContainer), { ssr: false });
const BarChart = dynamic(() => import('recharts').then(m => m.BarChart), { ssr: false });
const Bar = dynamic(() => import('recharts').then(m => m.Bar), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(m => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(m => m.YAxis), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(m => m.Tooltip), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then(m => m.CartesianGrid), { ssr: false });

export default function AnalyticsPage() {
  const token = useStore((state) => state.token);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
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
    fetchAnalytics();
  }, [token]);

  if (loading || !data) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
          <span className="text-zinc-500 text-xs">Loading analytics data...</span>
        </div>
      </div>
    );
  }

  const { summary, recentExecutions, chartData, heatmap } = data;

  const performanceCards = [
    { label: 'Uptime', value: '99.98%', desc: 'SLA standard guaranteed', icon: ShieldCheck, color: 'text-indigo-400' },
    { label: 'Avg Execution Delay', value: '1.48s', desc: 'Node processing throughput', icon: Clock, color: 'text-cyan-400' },
    { label: 'AI Prompt Success Rate', value: '98.5%', desc: 'Correct agent parser completions', icon: Sparkles, color: 'text-purple-400' },
    { label: 'Active Webhook Sockets', value: '2', desc: 'Listening to client integrations', icon: Activity, color: 'text-rose-400' }
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            Performance Analytics <BarChart3 className="w-5 h-5 text-indigo-400" />
          </h2>
          <p className="text-zinc-500 text-xs mt-1">Audit execution speeds, agent tokens, and system health benchmarks.</p>
        </div>

        <button 
          onClick={fetchAnalytics}
          className="p-2 rounded-lg border border-zinc-850 hover:bg-zinc-900 text-zinc-400 hover:text-white"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Grid of SLA health indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {performanceCards.map((c, idx) => {
          const Icon = c.icon;
          return (
            <div key={idx} className="p-6 rounded-2xl border border-zinc-900 bg-zinc-950/40 backdrop-blur-xl hover:border-zinc-850 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <Icon className={`w-5 h-5 ${c.color}`} />
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">{c.label}</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">{c.value}</h3>
              <p className="text-[10px] text-zinc-500 font-light">{c.desc}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Token allocation chart */}
        <div className="md:col-span-2 p-6 rounded-2xl border border-zinc-900 bg-zinc-950/40 backdrop-blur-xl flex flex-col">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h4 className="text-sm font-bold text-white">AI Credit Allocation</h4>
              <p className="text-[10px] text-zinc-500">Token logs consumed per agent trigger daily</p>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold bg-emerald-500/5 px-2 py-0.5 border border-emerald-500/10 rounded-full">
              <TrendingUp className="w-3 h-3" />
              <span>+14.2% usage</span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#18181b" />
                <XAxis dataKey="date" stroke="#52525b" fontSize={9} tickLine={false} />
                <YAxis stroke="#52525b" fontSize={9} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '8px' }}
                  labelStyle={{ color: '#a1a1aa', fontSize: '10px', fontWeight: 'bold' }}
                  itemStyle={{ fontSize: '10px' }}
                />
                <Bar dataKey="aiTokens" fill="#a855f7" radius={[4, 4, 0, 0]} name="Token Credits" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Heatmap summary */}
        <div className="p-6 rounded-2xl border border-zinc-900 bg-zinc-950/40 backdrop-blur-xl flex flex-col">
          <h4 className="text-sm font-bold text-white mb-1">Weekly Activity Heatmap</h4>
          <p className="text-[10px] text-zinc-500 mb-6 font-light">Execution frequency aggregated by hour block</p>

          <div className="flex-1 flex flex-col justify-between">
            <div className="space-y-3.5">
              {heatmap.map((h: any, idx: number) => {
                const total = h.morning + h.afternoon + h.evening + h.night;
                // Determine opacity color mapping
                let fillClass = 'bg-zinc-900';
                if (total > 60) fillClass = 'bg-indigo-500/40 border-indigo-500/20';
                else if (total > 40) fillClass = 'bg-indigo-500/20 border-indigo-500/10';
                else if (total > 20) fillClass = 'bg-indigo-500/10 border-indigo-500/5';

                return (
                  <div key={idx} className="flex items-center gap-3.5">
                    <span className="text-[10px] text-zinc-500 font-mono w-8">{h.name}</span>
                    <div className="flex-1 h-3 rounded-md bg-zinc-900/60 relative overflow-hidden border border-zinc-850">
                      <div className={`h-full rounded-md ${fillClass}`} style={{ width: `${Math.min((total / 140) * 100, 100)}%` }} />
                    </div>
                    <span className="text-[10px] text-zinc-400 font-mono w-6 text-right">{total}</span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-[8px] text-zinc-500 uppercase tracking-widest pt-4 border-t border-zinc-900/80 font-bold mt-4">
              <span>Low Activity</span>
              <span>High Activity</span>
            </div>
          </div>
        </div>
      </div>

      {/* Execution Logs Terminal list */}
      <div className="p-6 rounded-2xl border border-zinc-900 bg-zinc-950/40 backdrop-blur-xl">
        <div className="flex items-center gap-2 mb-6">
          <Terminal className="w-4 h-4 text-indigo-400" />
          <h4 className="text-sm font-bold text-white">Full Transaction Logs</h4>
        </div>

        <div className="space-y-3">
          {recentExecutions.map((log: any) => (
            <div 
              key={log.id}
              className="p-4 rounded-xl border border-zinc-900 bg-zinc-950/40 flex flex-col sm:flex-row justify-between sm:items-center gap-3 text-[11px]"
            >
              <div className="flex items-center gap-4">
                <span className={`w-2 h-2 rounded-full ${log.status === 'SUCCESS' ? 'bg-emerald-400' : 'bg-red-400'}`} />
                <span className="font-mono text-zinc-500">ID: {log.id.substring(0, 8)}...</span>
                <span className="font-bold text-white">{log.workflowName || 'Custom Event Dispatcher'}</span>
              </div>

              <div className="flex items-center gap-6 font-mono text-[10px] text-zinc-500 ml-6 sm:ml-0">
                <span>Speed: <span className="text-zinc-400">{log.duration}ms</span></span>
                <span>Time: <span className="text-zinc-400">{new Date(log.createdAt).toLocaleString()}</span></span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
