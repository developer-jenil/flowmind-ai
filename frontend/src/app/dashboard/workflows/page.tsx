'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, Workflow, Trash2, Calendar, Edit, Sparkles, 
  ArrowRight, Search, Zap, CheckCircle2, ChevronRight, Terminal, Wand2
} from 'lucide-react';
import { useStore } from '../../../store/useStore';

export default function WorkflowsPage() {
  const router = useRouter();
  const token = useStore((state) => state.token);
  const workflows = useStore((state) => state.workflows);
  const fetchWorkflows = useStore((state) => state.fetchWorkflows);
  const createWorkflow = useStore((state) => state.createWorkflow);
  const deleteWorkflow = useStore((state) => state.deleteWorkflow);
  const generateWorkflowFromPrompt = useStore((state) => state.generateWorkflowFromPrompt);

  const [search, setSearch] = useState('');
  const [newWfName, setNewWfName] = useState('');
  const [newWfDesc, setNewWfDesc] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiSuccessMsg, setAiSuccessMsg] = useState('');

  useEffect(() => {
    fetchWorkflows();
  }, [token]);

  const handleCreateWorkflow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWfName) return;
    const wf = await createWorkflow(newWfName, newWfDesc);
    if (wf) {
      setNewWfName('');
      setNewWfDesc('');
      setIsCreating(false);
      router.push(`/dashboard/workflows/${wf.id}`);
    }
  };

  const handleAiGenerate = async () => {
    if (!aiPrompt) return;
    setIsGenerating(true);
    setAiSuccessMsg('');
    const wf = await generateWorkflowFromPrompt(aiPrompt);
    setIsGenerating(false);
    if (wf) {
      setAiPrompt('');
      setAiSuccessMsg('✨ AI Workflow generated successfully! Opening canvas...');
      setTimeout(() => {
        router.push(`/dashboard/workflows/${wf.id}`);
      }, 1000);
    }
  };

  const filteredWorkflows = workflows.filter(wf => 
    wf.name.toLowerCase().includes(search.toLowerCase()) || 
    (wf.description && wf.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            Automations <Workflow className="w-5 h-5 text-indigo-400" />
          </h2>
          <p className="text-zinc-500 text-xs mt-1">Design, activate, and manage your custom visual workflows.</p>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/10"
        >
          <Plus className="w-4 h-4" />
          <span>Create Workflow</span>
        </button>
      </div>

      {/* AI Prompt Input Bar (Magic Panel) */}
      <div className="p-6 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 relative overflow-hidden shadow-lg shadow-indigo-500/5">
        <div className="absolute top-[-20%] right-[-10%] w-[300px] h-[300px] bg-radial from-indigo-500/10 to-transparent pointer-events-none rounded-full" />
        
        <div className="flex items-center gap-2.5 mb-3">
          <Wand2 className="w-4.5 h-4.5 text-indigo-400 animate-pulse" />
          <h3 className="text-sm font-bold text-white">AI Instant Workflow Builder</h3>
        </div>
        <p className="text-xs text-zinc-400 mb-4 font-light">
          Describe the automation scenario in plain English. Our LLM core will generate the visual graph configuration instantly.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <input 
            type="text" 
            placeholder="e.g. When a new email arrives, summarize content with GPT and send alert to Slack"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            disabled={isGenerating}
            className="flex-1 px-4 py-3 rounded-xl border border-zinc-800 bg-zinc-950/70 text-white text-xs focus:border-indigo-500 focus:outline-none disabled:opacity-50"
          />
          <button
            onClick={handleAiGenerate}
            disabled={isGenerating || !aiPrompt}
            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-indigo-600/25 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? 'Orchestrating...' : 'Generate Flow'}
            <Sparkles className="w-3.5 h-3.5" />
          </button>
        </div>
        {aiSuccessMsg && (
          <p className="text-xs text-emerald-400 mt-3 font-medium">{aiSuccessMsg}</p>
        )}
      </div>

      {/* SEARCH AND GRID */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 max-w-md px-3 py-2 rounded-xl border border-zinc-900 bg-zinc-950/40">
          <Search className="w-4 h-4 text-zinc-500" />
          <input 
            type="text" 
            placeholder="Search workflows..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-xs text-white focus:outline-none"
          />
        </div>

        {filteredWorkflows.length === 0 ? (
          <div className="py-20 rounded-2xl border border-zinc-900 bg-zinc-950/20 flex flex-col items-center justify-center text-center">
            <Workflow className="w-10 h-10 text-zinc-600 mb-4" />
            <h3 className="text-sm font-bold text-zinc-400">No workflows found</h3>
            <p className="text-zinc-500 text-xs mt-1 max-w-xs">Create your first custom automation workflow manually or use the AI generator.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredWorkflows.map((wf) => (
              <div 
                key={wf.id}
                className="rounded-2xl border border-zinc-900 bg-zinc-950/40 hover:border-zinc-800 hover:bg-zinc-900/10 transition-all duration-300 p-6 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform">
                      <Workflow className="w-4 h-4" />
                    </div>
                    
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[9px] font-bold uppercase tracking-wider ${
                      wf.active 
                        ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400' 
                        : 'border-zinc-800 bg-zinc-900 text-zinc-500'
                    }`}>
                      {wf.active ? 'Active' : 'Draft'}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors mb-1 truncate">{wf.name}</h3>
                  <p className="text-xs text-zinc-500 font-light leading-normal line-clamp-2 h-8 mb-6">{wf.description || 'No description provided.'}</p>
                </div>

                <div className="border-t border-zinc-900 pt-4 flex items-center justify-between text-[10px] text-zinc-500">
                  <div className="flex items-center gap-1.5 font-mono">
                    <Calendar className="w-3.5 h-3.5 text-zinc-600" />
                    <span>{new Date(wf.updatedAt).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => router.push(`/dashboard/workflows/${wf.id}`)}
                      className="p-1.5 rounded-lg border border-zinc-850 hover:bg-zinc-900 text-zinc-400 hover:text-white"
                      title="Edit Workflow"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteWorkflow(wf.id)}
                      className="p-1.5 rounded-lg border border-zinc-850 hover:border-red-500/20 hover:bg-red-500/5 text-zinc-500 hover:text-red-400"
                      title="Delete Workflow"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CREATE WORKFLOW MODAL DIALOG */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-2xl border border-zinc-850 bg-zinc-950 shadow-2xl glass-card">
            <h3 className="text-lg font-bold text-white mb-4">Create New Workflow</h3>
            
            <form onSubmit={handleCreateWorkflow} className="space-y-4">
              <div>
                <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">Workflow Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Sync Contacts to HubSpot"
                  value={newWfName}
                  onChange={(e) => setNewWfName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900/50 text-white text-xs focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">Description</label>
                <textarea 
                  placeholder="What does this automation workflow solve?"
                  value={newWfDesc}
                  onChange={(e) => setNewWfDesc(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900/50 text-white text-xs focus:border-indigo-500 focus:outline-none resize-none"
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
                  Create Flow
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
