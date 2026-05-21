'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, Workflow, Cpu, Database, BarChart3, 
  Settings, Bell, LogOut, Search, User, Menu, X, Sparkles
} from 'lucide-react';
import { useStore } from '../../store/useStore';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const token = useStore((state) => state.token);
  const user = useStore((state) => state.user);
  const logout = useStore((state) => state.logout);
  const notifications = useStore((state) => state.notifications);
  const fetchNotifications = useStore((state) => state.fetchNotifications);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  // Authenticated route guard
  useEffect(() => {
    if (!token) {
      router.push('/login');
    } else {
      fetchNotifications();
    }
  }, [token, router, fetchNotifications]);

  if (!token) {
    return (
      <div className="min-h-screen bg-[#030303] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { name: 'Workflows', icon: Workflow, href: '/dashboard/workflows' },
    { name: 'AI Agents', icon: Cpu, href: '/dashboard/agents' },
    { name: 'Integrations', icon: Database, href: '/dashboard/integrations' },
    { name: 'Analytics', icon: BarChart3, href: '/dashboard/analytics' },
    { name: 'Settings', icon: Settings, href: '/dashboard/settings' },
  ];

  return (
    <div className="min-h-screen bg-[#030303] text-zinc-100 flex overflow-hidden">
      {/* LEFT SIDEBAR (Desktop) */}
      <aside className="w-64 border-r border-zinc-900 bg-zinc-950/40 backdrop-blur-xl hidden md:flex flex-col flex-shrink-0 z-20">
        {/* Brand header */}
        <div className="h-16 px-6 border-b border-zinc-900 flex items-center gap-3">
          <div className="w-7 h-7 rounded bg-indigo-600 flex items-center justify-center">
            <Workflow className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-white tracking-tight">FlowMind AI</span>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={`w-full px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3.5 transition-all group ${
                  isActive 
                    ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 shadow-lg shadow-indigo-500/5' 
                    : 'text-zinc-400 hover:text-white border border-transparent hover:bg-zinc-900/50'
                }`}
              >
                <Icon className={`w-4 h-4 transition-transform group-hover:scale-105 ${isActive ? 'text-indigo-400' : 'text-zinc-400 group-hover:text-white'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Card */}
        <div className="p-4 border-t border-zinc-900 bg-zinc-950/60">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-zinc-900 flex items-center justify-center border border-zinc-800 text-indigo-400 font-bold uppercase text-sm">
              {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </div>
            <div className="overflow-hidden">
              <h4 className="text-xs font-bold text-white truncate">{user?.name || 'Developer'}</h4>
              <h5 className="text-[10px] text-zinc-500 truncate">{user?.email || 'admin@flowmind.ai'}</h5>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full px-3 py-2 rounded-lg border border-zinc-900 hover:border-red-500/20 hover:bg-red-500/5 text-zinc-500 hover:text-red-400 text-xs font-bold transition-all flex items-center justify-center gap-2"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* RIGHT BODY WRAPPER */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* HEADER BAR */}
        <header className="h-16 px-6 border-b border-zinc-900 bg-zinc-950/15 backdrop-blur-md flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-lg border border-zinc-800 text-zinc-400 hover:text-white"
            >
              <Menu className="w-4 h-4" />
            </button>
            <h1 className="text-sm font-bold text-white uppercase tracking-wider hidden sm:block">
              {menuItems.find(m => pathname === m.href || (m.href !== '/dashboard' && pathname.startsWith(m.href)))?.name || 'Workspace'}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Quick command search indicator */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-900 bg-zinc-900/20 text-zinc-500 font-mono text-[10px] select-none hover:border-zinc-800 transition-colors">
              <Search className="w-3.5 h-3.5" />
              <span>Search Command</span>
              <kbd className="px-1 rounded bg-zinc-900 border border-zinc-800">⌘K</kbd>
            </div>

            {/* Notification trigger */}
            <button 
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative p-2 rounded-lg border border-zinc-850 hover:bg-zinc-900/50 text-zinc-400 hover:text-white transition-colors"
            >
              <Bell className="w-4.5 h-4.5" />
              {notifications.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              )}
            </button>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto relative p-6 bg-dot-cyber">
          {children}
        </main>
      </div>

      {/* MOBILE DRAWER MENU */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black z-30 md:hidden"
            />
            <motion.aside 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.2 }}
              className="fixed inset-y-0 left-0 w-64 bg-zinc-950 border-r border-zinc-900 z-45 flex flex-col p-6 md:hidden justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-2.5">
                    <Workflow className="w-5 h-5 text-indigo-500" />
                    <span className="font-bold text-white text-lg">FlowMind AI</span>
                  </div>
                  <button onClick={() => setMobileMenuOpen(false)} className="p-1 rounded-lg border border-zinc-800 text-zinc-400">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <nav className="space-y-1">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link 
                        key={item.name} 
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`w-full px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 transition-colors ${
                          isActive 
                            ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/15' 
                            : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <div className="border-t border-zinc-900 pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-sm">
                    {user?.email?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{user?.name || 'Developer'}</h4>
                    <h5 className="text-[10px] text-zinc-500 truncate w-36">{user?.email}</h5>
                  </div>
                </div>
                <button 
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className="w-full py-2.5 rounded-xl border border-zinc-800 hover:border-red-500/20 hover:bg-red-500/5 text-zinc-400 hover:text-red-400 text-xs font-bold transition-all flex items-center justify-center gap-2"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* NOTIFICATION PANEL DRAWER */}
      <AnimatePresence>
        {notifOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              exit={{ opacity: 0 }}
              onClick={() => setNotifOpen(false)}
              className="fixed inset-0 bg-black z-30"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.2 }}
              className="fixed inset-y-0 right-0 w-80 bg-zinc-950/95 backdrop-blur-xl border-l border-zinc-900 z-45 p-6 flex flex-col"
            >
              <div className="flex items-center justify-between mb-6 border-b border-zinc-900 pb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
                  <h3 className="font-bold text-white text-sm">Activity Notifications</h3>
                </div>
                <button onClick={() => setNotifOpen(false)} className="p-1 rounded-lg border border-zinc-800 text-zinc-500 hover:text-zinc-200">
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto">
                {notifications.map((n) => (
                  <div key={n.id} className="p-4 rounded-xl border border-zinc-900 bg-zinc-900/20 hover:border-zinc-800 transition-colors">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="text-xs font-bold text-white">{n.title}</h4>
                      <span className="text-[10px] text-zinc-600 font-mono">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-normal">{n.text}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
