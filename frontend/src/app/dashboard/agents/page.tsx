'use client';

import React, { useEffect, useState } from 'react';
import { 
  Cpu, Plus, Trash2, MessageSquare, Send, Sparkles, 
  Settings, X, Shield, RefreshCw, Layers, Compass 
} from 'lucide-react';
import { useStore, AIAgent } from '../../../store/useStore';

export default function AgentsPage() {
  const token = useStore((state) => state.token);
  const agents = useStore((state) => state.agents);
  const fetchAgents = useStore((state) => state.fetchAgents);
  const createAgent = useStore((state) => state.createAgent);
  const deleteAgent = useStore((state) => state.deleteAgent);
  const chatWithAgent = useStore((state) => state.chatWithAgent);

  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [model, setModel] = useState('gpt-4o');
  const [prompt, setPrompt] = useState('');
  const [memory, setMemory] = useState('short-term');

  // Chat window state
  const [activeChatAgent, setActiveChatAgent] = useState<AIAgent | null>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  useEffect(() => {
    fetchAgents();
  }, [token]);

  const handleCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !role || !prompt) return;
    await createAgent({ name, role, model, prompt, memory });
    setName('');
    setRole('');
    setPrompt('');
    setIsCreating(false);
  };

  const handleOpenChat = (agent: AIAgent) => {
    setActiveChatAgent(agent);
    setChatHistory([
      { role: 'assistant', content: `Hello! I am your configured AI Agent, "${agent.name}". I am initialized with role details: "${agent.role}". Send me a prompt or command to get started.` }
    ]);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage || !activeChatAgent) return;

    const userMsg = chatMessage;
    setChatMessage('');
    setChatHistory(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsChatLoading(true);

    try {
      // Map history roles
      const apiHistory = chatHistory.map(h => ({
        role: h.role,
        content: h.content
      }));

      const reply = await chatWithAgent(activeChatAgent.id, userMsg, apiHistory);
      setChatHistory(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      console.error('Chat error', err);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto relative h-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            AI Agent Workers <Cpu className="w-5 h-5 text-indigo-400" />
          </h2>
          <p className="text-zinc-500 text-xs mt-1">Configure and direct cognitive agents to automate complex tasks.</p>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/10"
        >
          <Plus className="w-4 h-4" />
          <span>Deploy Agent</span>
        </button>
      </div>

      {/* Agents Grid List */}
      {agents.length === 0 ? (
        <div className="py-20 rounded-2xl border border-zinc-900 bg-zinc-950/20 flex flex-col items-center justify-center text-center">
          <Cpu className="w-10 h-10 text-zinc-650 mb-4" />
          <h3 className="text-sm font-bold text-zinc-400">No active AI agents deployed</h3>
          <p className="text-zinc-500 text-xs mt-1 max-w-xs">Configure your first custom LLM specialist agent to perform reasoning and operations.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <div 
              key={agent.id}
              className="rounded-2xl border border-zinc-900 bg-zinc-950/40 hover:border-zinc-800 hover:bg-zinc-900/10 transition-all duration-300 p-6 flex flex-col justify-between group"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform">
                    <Cpu className="w-4 h-4" />
                  </div>
                  
                  <span className="text-[9px] px-2 py-0.5 rounded-full border border-zinc-800 bg-zinc-900 text-zinc-400 font-semibold font-mono">
                    {agent.model}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors mb-0.5 truncate">{agent.name}</h3>
                <h4 className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wider mb-3">{agent.role}</h4>
                <p className="text-xs text-zinc-500 font-light leading-normal line-clamp-3 h-12 mb-6">
                  {agent.prompt}
                </p>
              </div>

              <div className="border-t border-zinc-900 pt-4 flex items-center justify-between">
                <span className="text-[9px] uppercase font-mono text-zinc-600">Memory: {agent.memory}</span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenChat(agent)}
                    className="px-3 py-1.5 rounded-lg border border-zinc-800 hover:bg-zinc-900 text-zinc-300 text-xs font-semibold flex items-center gap-1.5"
                    title="Chat with Agent"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Converse</span>
                  </button>
                  <button
                    onClick={() => deleteAgent(agent.id)}
                    className="p-1.5 rounded-lg border border-zinc-850 hover:border-red-500/20 hover:bg-red-500/5 text-zinc-500 hover:text-red-400"
                    title="Decommission Agent"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE DEPLOY AGENT SLIDEOUT MODAL */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-2xl border border-zinc-850 bg-zinc-950 shadow-2xl glass-card">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-900">
              <h3 className="text-md font-bold text-white flex items-center gap-2">
                Deploy Agent Worker <Sparkles className="w-4 h-4 text-indigo-400" />
              </h3>
              <button onClick={() => setIsCreating(false)} className="p-1 rounded hover:bg-zinc-900 text-zinc-500">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <form onSubmit={handleCreateAgent} className="space-y-4">
              <div>
                <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">Agent Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Lead Qualification Bot"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900/50 text-white text-xs focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">Role/Specialty</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Sales Specialist"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900/50 text-white text-xs focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">Model Engine</label>
                  <select 
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900/50 text-white text-xs focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="gpt-4o">GPT-4o (Default)</option>
                    <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                    <option value="claude-3">Claude 3 Opus</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">Memory Tier</label>
                  <select 
                    value={memory}
                    onChange={(e) => setMemory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900/50 text-white text-xs focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="none">No Memory</option>
                    <option value="short-term">Short Term</option>
                    <option value="long-term">Long Term Vector</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">System Prompts / Directives</label>
                <textarea 
                  required
                  placeholder="Instruct the agent on how to behave, analyze datasets, filter operations, or make decisions."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900/50 text-white text-xs focus:border-indigo-500 focus:outline-none resize-none font-light leading-normal"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 rounded-lg border border-zinc-800 text-zinc-400 hover:text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/10"
                >
                  Deploy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CHAT WITH AGENT DRAWER */}
      {activeChatAgent && (
        <div className="fixed inset-y-0 right-0 w-full sm:w-[480px] bg-zinc-950 border-l border-zinc-900 z-50 flex flex-col justify-between shadow-2xl glass-card">
          {/* Header */}
          <div className="px-6 py-4 border-b border-zinc-900 flex items-center justify-between bg-zinc-950/90">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20">
                <Cpu className="w-4.5 h-4.5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white">{activeChatAgent.name}</h3>
                <span className="text-[9px] uppercase tracking-wider text-indigo-400 font-bold">{activeChatAgent.role}</span>
              </div>
            </div>
            <button 
              onClick={() => setActiveChatAgent(null)} 
              className="p-1 rounded hover:bg-zinc-900 text-zinc-500 hover:text-zinc-200"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* Conversation Screen */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-dot-cyber flex flex-col">
            {chatHistory.map((item, idx) => {
              const isAssistant = item.role === 'assistant';
              return (
                <div 
                  key={idx}
                  className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                    isAssistant 
                      ? 'bg-zinc-900/60 border border-zinc-900 text-zinc-300 mr-auto text-left' 
                      : 'bg-indigo-600 text-white ml-auto text-right font-medium'
                  }`}
                >
                  {item.content}
                </div>
              );
            })}
            
            {isChatLoading && (
              <div className="bg-zinc-900/60 border border-zinc-900 rounded-2xl p-4 text-xs text-zinc-500 mr-auto text-left flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-purple-400" />
                <span>Agent thinking...</span>
              </div>
            )}
          </div>

          {/* Message Input Form */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-zinc-900 bg-zinc-950/90 flex gap-2">
            <input 
              type="text" 
              placeholder="Ask this agent a query..."
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              disabled={isChatLoading}
              className="flex-1 px-4 py-3 rounded-xl border border-zinc-800 bg-zinc-900/50 text-white text-xs focus:border-indigo-500 focus:outline-none disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isChatLoading || !chatMessage}
              className="w-10 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center transition-colors disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
