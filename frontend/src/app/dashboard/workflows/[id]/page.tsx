'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ReactFlow, 
  ReactFlowProvider,
  Background, 
  Controls, 
  useNodesState, 
  useEdgesState, 
  addEdge, 
  Connection, 
  Edge,
  Node,
  useReactFlow,
  Handle,
  Position
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { 
  Mail, MessageSquare, Sparkles, Cpu, Database, Zap, 
  Play, Settings, Terminal, Plus, ArrowLeft, Save, 
  CheckCircle, AlertCircle, RefreshCw, Smartphone, ChevronRight, X 
} from 'lucide-react';
import { useStore, WorkflowNode, WorkflowEdge, ExecutionLog } from '../../../../store/useStore';

// Custom Node Component to display styling and glowing indicators
const CustomWorkflowNode = ({ id, type, data, selected }: any) => {
  const simulationNodes = useStore((state) => state.simulationNodes);
  const status = simulationNodes[id] || 'idle';

  const icons: Record<string, any> = {
    gmailTrigger: Mail,
    webhookTrigger: Zap,
    aiSummarizer: Sparkles,
    gptAgent: Cpu,
    slackMessage: MessageSquare,
    crmUpdate: Cpu,
    googleSheets: Database,
    databaseAction: Database,
    whatsAppMessage: Smartphone,
  };

  const colors: Record<string, string> = {
    gmailTrigger: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
    webhookTrigger: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
    aiSummarizer: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    gptAgent: 'text-pink-400 bg-pink-500/10 border-pink-500/30',
    slackMessage: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
    crmUpdate: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
    googleSheets: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    databaseAction: 'text-sky-400 bg-sky-500/10 border-sky-500/30',
    whatsAppMessage: 'text-teal-400 bg-teal-500/10 border-teal-400/30',
  };

  const Icon = icons[type] || Cpu;
  const colorClass = colors[type] || 'text-zinc-400 bg-zinc-900 border-zinc-800';

  // Determine indicator border glow
  let glowClass = 'border-zinc-800';
  if (selected) glowClass = 'border-indigo-500 ring-1 ring-indigo-500/30';
  if (status === 'running') glowClass = 'border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.4)]';
  if (status === 'success') glowClass = 'border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]';
  if (status === 'error') glowClass = 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]';

  return (
    <div className={`p-4 rounded-xl border bg-zinc-950 text-white min-w-[210px] text-left transition-all ${glowClass}`}>
      <Handle type="target" position={Position.Left} className="w-2.5 h-2.5" />
      
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${colorClass}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold">Node</h4>
          <h3 className="text-xs font-semibold text-zinc-200 truncate">{data.label}</h3>
        </div>

        {/* Live Status indicator */}
        {status === 'running' && (
          <RefreshCw className="w-3.5 h-3.5 text-yellow-400 animate-spin flex-shrink-0" />
        )}
        {status === 'success' && (
          <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
        )}
        {status === 'error' && (
          <AlertCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
        )}
      </div>
      
      {data.config?.channel && (
        <div className="mt-2.5 pt-2 border-t border-zinc-900 text-[10px] text-zinc-500 truncate">
          Chan: <span className="text-zinc-400 font-mono">{data.config.channel}</span>
        </div>
      )}
      {data.config?.prompt && (
        <div className="mt-2.5 pt-2 border-t border-zinc-900 text-[10px] text-zinc-500 truncate">
          Prompt: <span className="text-zinc-400">{data.config.prompt}</span>
        </div>
      )}

      <Handle type="source" position={Position.Right} className="w-2.5 h-2.5" />
    </div>
  );
};

const nodeTypes = {
  gmailTrigger: CustomWorkflowNode,
  webhookTrigger: CustomWorkflowNode,
  aiSummarizer: CustomWorkflowNode,
  gptAgent: CustomWorkflowNode,
  slackMessage: CustomWorkflowNode,
  crmUpdate: CustomWorkflowNode,
  googleSheets: CustomWorkflowNode,
  databaseAction: CustomWorkflowNode,
  whatsAppMessage: CustomWorkflowNode,
};

function InnerWorkflowBuilder() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const token = useStore((state) => state.token);
  const activeWorkflow = useStore((state) => state.activeWorkflow);
  const fetchWorkflows = useStore((state) => state.fetchWorkflows);
  const workflows = useStore((state) => state.workflows);
  const setActiveWorkflow = useStore((state) => state.setActiveWorkflow);
  const updateWorkflow = useStore((state) => state.updateWorkflow);
  
  const startSimulation = useStore((state) => state.startSimulation);
  const updateSimulationNode = useStore((state) => state.updateSimulationNode);
  const addSimulationLog = useStore((state) => state.addSimulationLog);
  const clearSimulation = useStore((state) => state.clearSimulation);
  const simulationLogs = useStore((state) => state.simulationLogs);
  const isSimulating = useStore((state) => state.isSimulating);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [consoleOpen, setConsoleOpen] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  // Set active workflow when workflows are fetched
  useEffect(() => {
    if (workflows.length === 0) {
      fetchWorkflows();
    } else {
      const found = workflows.find(w => w.id === id);
      if (found) {
        setActiveWorkflow(found);
      }
    }
  }, [id, workflows, fetchWorkflows, setActiveWorkflow]);

  // Load React Flow Nodes & Edges from state
  useEffect(() => {
    if (activeWorkflow && activeWorkflow.id === id) {
      setNodes(activeWorkflow.nodes.map(n => ({
        id: n.id,
        type: n.type,
        position: n.position,
        data: n.data
      })));
      setEdges(activeWorkflow.edges.map(e => ({
        id: e.id,
        source: e.source,
        target: e.target,
        animated: e.animated || false
      })));
    }
  }, [activeWorkflow, id, setNodes, setEdges]);

  // Establish WebSocket connection for real-time simulation tracing
  useEffect(() => {
    if (!id || !token) return;

    const ws = new WebSocket(`ws://localhost:5000?workflowId=${id}`);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'node_running') {
          updateSimulationNode(msg.nodeId, 'running');
        } else if (msg.type === 'node_success') {
          updateSimulationNode(msg.nodeId, 'success');
        } else if (msg.type === 'log') {
          addSimulationLog(msg.log);
        } else if (msg.type === 'workflow_success') {
          // Simulation complete
        } else if (msg.type === 'workflow_failed') {
          // Simulation error
        }
      } catch (err) {
        console.error('Error parsing WS message', err);
      }
    };

    return () => {
      ws.close();
    };
  }, [id, token]);

  const onConnect = useCallback((params: Connection) => {
    setEdges((eds) => addEdge({ ...params, animated: true }, eds));
  }, [setEdges]);

  // Save workflow back to DB
  const handleSave = async () => {
    setIsSaving(true);
    await updateWorkflow(id, {
      nodes,
      edges
    });
    setIsSaving(false);
  };

  const handleRunSimulation = async () => {
    clearSimulation();
    setConsoleOpen(true);
    // Mark all edges animated for visual simulation tracking
    setEdges(eds => eds.map(e => ({ ...e, animated: true })));
    await startSimulation(id);
  };

  // Add node manually by click/drag
  const handleAddNode = (type: string, label: string) => {
    const newId = `node_${nodes.length + 1}`;
    const newNode: Node = {
      id: newId,
      type,
      position: { x: 150 + Math.random() * 80, y: 150 + Math.random() * 80 },
      data: { label, config: {} }
    };
    setNodes((nds) => [...nds, newNode]);
  };

  // Select node details
  const onNodeClick = (_: any, node: Node) => {
    setSelectedNode(node);
  };

  // Update selected node config settings
  const handleUpdateNodeConfig = (key: string, value: string) => {
    if (!selectedNode) return;
    
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === selectedNode.id) {
          const nodeData = n.data as any;
          const updatedConfig = { ...nodeData.config, [key]: value };
          const updatedNode = {
            ...n,
            data: {
              ...n.data,
              config: updatedConfig
            }
          };
          // Sync with the selection drawer state
          setSelectedNode(updatedNode);
          return updatedNode;
        }
        return n;
      })
    );
  };

  const handleUpdateNodeLabel = (newLabel: string) => {
    if (!selectedNode) return;
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === selectedNode.id) {
          const updatedNode = { ...n, data: { ...n.data, label: newLabel } };
          setSelectedNode(updatedNode);
          return updatedNode;
        }
        return n;
      })
    );
  };

  const handleDeleteSelectedNode = () => {
    if (!selectedNode) return;
    setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id));
    setEdges((eds) => eds.filter((e) => e.source !== selectedNode.id && e.target !== selectedNode.id));
    setSelectedNode(null);
  };

  return (
    <div className="h-[calc(105vh-150px)] flex flex-col -m-6 relative">
      {/* Top action bar */}
      <div className="h-14 px-6 border-b border-zinc-900 bg-zinc-950/80 backdrop-blur flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.push('/dashboard/workflows')}
            className="p-1.5 rounded-lg border border-zinc-850 hover:bg-zinc-900 text-zinc-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-sm font-bold text-white leading-none">{activeWorkflow?.name || 'Loading...'}</h2>
            <p className="text-[10px] text-zinc-500 truncate w-48 sm:w-80 mt-1">{activeWorkflow?.description || 'No description.'}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-3.5 py-1.5 rounded-lg border border-zinc-800 hover:bg-zinc-900 text-zinc-300 text-xs font-semibold flex items-center gap-2"
          >
            {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>Save Draft</span>
          </button>
          <button
            onClick={handleRunSimulation}
            disabled={isSimulating}
            className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/10"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>{isSimulating ? 'Simulating...' : 'Run Simulation'}</span>
          </button>
        </div>
      </div>

      {/* Main Canvas + Sidebars */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* LEFT TOOLBAR */}
        <aside className="w-48 border-r border-zinc-900 bg-zinc-950/60 backdrop-blur-xl p-4 space-y-5 overflow-y-auto flex-shrink-0 z-10">
          <div>
            <h4 className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider mb-2">Triggers</h4>
            <div className="space-y-1.5">
              <button 
                onClick={() => handleAddNode('gmailTrigger', 'Gmail: New Email')}
                className="w-full p-2.5 rounded-xl border border-zinc-900 bg-zinc-950 hover:bg-zinc-900 hover:border-zinc-800 text-left text-xs text-zinc-300 font-semibold flex items-center gap-2.5 transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-cyan-400" />
                <span>Gmail Hook</span>
              </button>
              <button 
                onClick={() => handleAddNode('webhookTrigger', 'Webhook: Catch')}
                className="w-full p-2.5 rounded-xl border border-zinc-900 bg-zinc-950 hover:bg-zinc-900 hover:border-zinc-800 text-left text-xs text-zinc-300 font-semibold flex items-center gap-2.5 transition-colors"
              >
                <Zap className="w-3.5 h-3.5 text-indigo-400" />
                <span>Webhook Recv</span>
              </button>
            </div>
          </div>

          <div>
            <h4 className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider mb-2">AI Capabilities</h4>
            <div className="space-y-1.5">
              <button 
                onClick={() => handleAddNode('aiSummarizer', 'AI: Summarizer')}
                className="w-full p-2.5 rounded-xl border border-zinc-900 bg-zinc-950 hover:bg-zinc-900 hover:border-zinc-800 text-left text-xs text-zinc-300 font-semibold flex items-center gap-2.5 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>AI Summary</span>
              </button>
              <button 
                onClick={() => handleAddNode('gptAgent', 'AI Agent: Reasoning')}
                className="w-full p-2.5 rounded-xl border border-zinc-900 bg-zinc-950 hover:bg-zinc-900 hover:border-zinc-800 text-left text-xs text-zinc-300 font-semibold flex items-center gap-2.5 transition-colors"
              >
                <Cpu className="w-3.5 h-3.5 text-pink-400" />
                <span>Cognitive Agent</span>
              </button>
            </div>
          </div>

          <div>
            <h4 className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider mb-2">Actions</h4>
            <div className="space-y-1.5">
              <button 
                onClick={() => handleAddNode('slackMessage', 'Slack: Send Alert')}
                className="w-full p-2.5 rounded-xl border border-zinc-900 bg-zinc-950 hover:bg-zinc-900 hover:border-zinc-800 text-left text-xs text-zinc-300 font-semibold flex items-center gap-2.5 transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5 text-rose-400" />
                <span>Slack Alert</span>
              </button>
              <button 
                onClick={() => handleAddNode('googleSheets', 'Sheets: Append Row')}
                className="w-full p-2.5 rounded-xl border border-zinc-900 bg-zinc-950 hover:bg-zinc-900 hover:border-zinc-800 text-left text-xs text-zinc-300 font-semibold flex items-center gap-2.5 transition-colors"
              >
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                <span>Google Sheet</span>
              </button>
            </div>
          </div>
        </aside>

        {/* REACT FLOW CANVAS */}
        <div className="flex-1 h-full relative z-0">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            onNodeClick={onNodeClick}
            fitView
          >
            <Background color="#27272a" />
            <Controls className="bg-zinc-950 border border-zinc-800 text-zinc-300 !left-4 !bottom-4 fill-white" />
          </ReactFlow>

          {/* SVG Gradient definition for Glowing active visual edges */}
          <svg style={{ position: 'absolute', top: 0, left: 0, width: 0, height: 0 }}>
            <defs>
              <linearGradient id="edge-glow-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="50%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* RIGHT DRAWER SETTINGS PANEL */}
        {selectedNode && (
          <aside className="w-72 border-l border-zinc-900 bg-zinc-950/70 backdrop-blur-xl p-6 overflow-y-auto flex-shrink-0 z-10 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-900">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Node Inspector</h3>
                <button 
                  onClick={() => setSelectedNode(null)} 
                  className="p-1 rounded hover:bg-zinc-900 text-zinc-500 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Node Title edit */}
              <div>
                <label className="block text-[10px] font-semibold text-zinc-500 uppercase mb-2">Display Name</label>
                <input 
                  type="text" 
                  value={((selectedNode.data as any).label || '') as string}
                  onChange={(e) => handleUpdateNodeLabel(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-800 bg-zinc-900/50 text-white text-xs focus:border-indigo-500 focus:outline-none"
                />
              </div>

              {/* Context Specific Configurations */}
              {selectedNode.type === 'slackMessage' && (
                <>
                  <div>
                    <label className="block text-[10px] font-semibold text-zinc-500 uppercase mb-2">Channel Name</label>
                    <input 
                      type="text" 
                      placeholder="#ops-alerts"
                      value={((selectedNode.data as any).config?.channel || '') as string}
                      onChange={(e) => handleUpdateNodeConfig('channel', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-zinc-800 bg-zinc-900/50 text-white text-xs focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-zinc-500 uppercase mb-2">Message Body</label>
                    <textarea 
                      placeholder="Type alert contents..."
                      value={((selectedNode.data as any).config?.body || '') as string}
                      onChange={(e) => handleUpdateNodeConfig('body', e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 rounded-lg border border-zinc-800 bg-zinc-900/50 text-white text-xs focus:border-indigo-500 focus:outline-none resize-none"
                    />
                  </div>
                </>
              )}

              {selectedNode.type === 'gptAgent' && (
                <>
                  <div>
                    <label className="block text-[10px] font-semibold text-zinc-500 uppercase mb-2">System Directive</label>
                    <textarea 
                      placeholder="Define cognitive agent directives..."
                      value={((selectedNode.data as any).config?.prompt || '') as string}
                      onChange={(e) => handleUpdateNodeConfig('prompt', e.target.value)}
                      rows={5}
                      className="w-full px-3 py-2 rounded-lg border border-zinc-800 bg-zinc-900/50 text-white text-xs focus:border-indigo-500 focus:outline-none resize-none"
                    />
                  </div>
                </>
              )}

              {selectedNode.type === 'gmailTrigger' && (
                <div>
                  <label className="block text-[10px] font-semibold text-zinc-500 uppercase mb-2">Filter Subjects</label>
                  <input 
                    type="text" 
                    placeholder="subject:Lead"
                    value={((selectedNode.data as any).config?.filter || '') as string}
                    onChange={(e) => handleUpdateNodeConfig('filter', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-800 bg-zinc-900/50 text-white text-xs focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              )}
            </div>

            <button
              onClick={handleDeleteSelectedNode}
              className="w-full py-2 rounded-lg border border-red-500/20 hover:border-red-500/40 bg-red-500/5 text-red-400 text-xs font-bold transition-all"
            >
              Delete Node
            </button>
          </aside>
        )}
      </div>

      {/* BOTTOM CONSOLE DRAWER */}
      {consoleOpen && (
        <div className="h-44 border-t border-zinc-900 bg-zinc-950 z-10 flex flex-col flex-shrink-0">
          <div className="h-8 px-6 border-b border-zinc-900/60 bg-zinc-950 flex items-center justify-between text-zinc-500 text-[10px] font-bold uppercase tracking-wider">
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-indigo-400" />
              <span>Real-Time Execution Engine Stream</span>
            </div>
            <button onClick={() => setConsoleOpen(false)} className="hover:text-white">
              Hide Console
            </button>
          </div>

          <div className="flex-1 p-4 font-mono text-xs overflow-y-auto space-y-1.5 text-left">
            {simulationLogs.length === 0 ? (
              <p className="text-zinc-600">Simulator idle. Trigger "Run Simulation" above to watch websocket telemetry logs.</p>
            ) : (
              simulationLogs.map((log: ExecutionLog, idx: number) => {
                let badgeClass = 'text-zinc-400';
                if (log.type === 'success') badgeClass = 'text-emerald-400';
                if (log.type === 'error') badgeClass = 'text-red-400';
                
                return (
                  <p key={idx} className="flex items-start gap-4">
                    <span className="text-zinc-600 text-[10px] pt-0.5">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    <span className={badgeClass}>{log.message}</span>
                  </p>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Mini floating button to restore console if closed */}
      {!consoleOpen && (
        <button 
          onClick={() => setConsoleOpen(true)}
          className="absolute bottom-4 right-4 z-10 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-950 text-[10px] font-bold text-zinc-400 hover:text-white transition-colors"
        >
          Open Console
        </button>
      )}
    </div>
  );
}

export default function Page() {
  return (
    <ReactFlowProvider>
      <InnerWorkflowBuilder />
    </ReactFlowProvider>
  );
}
