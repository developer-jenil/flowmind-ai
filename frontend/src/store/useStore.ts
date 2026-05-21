import { create } from 'zustand';

// Setup API URL
const API_URL = 'http://localhost:5000/api';

export interface WorkflowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: { label: string; [key: string]: any };
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  animated?: boolean;
}

export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface ExecutionLog {
  timestamp: string;
  nodeId: string;
  type: 'info' | 'success' | 'warn' | 'error';
  message: string;
  data?: any;
}

export interface AIAgent {
  id: string;
  name: string;
  role: string;
  model: string;
  prompt: string;
  memory: string;
}

export interface Integration {
  name: string;
  connected: boolean;
  config: string;
}

interface AppState {
  // Auth
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  logout: () => void;

  // Workflows
  workflows: any[];
  activeWorkflow: {
    id: string;
    name: string;
    description: string;
    nodes: WorkflowNode[];
    edges: WorkflowEdge[];
    active: boolean;
  } | null;
  isLoadingWorkflows: boolean;
  setActiveWorkflow: (wf: any) => void;
  fetchWorkflows: () => Promise<void>;
  createWorkflow: (name: string, description: string) => Promise<any>;
  updateWorkflow: (id: string, updates: any) => Promise<void>;
  deleteWorkflow: (id: string) => Promise<void>;
  generateWorkflowFromPrompt: (prompt: string) => Promise<any>;

  // Simulation State
  isSimulating: boolean;
  simulationNodes: Record<string, 'idle' | 'running' | 'success' | 'error'>;
  simulationLogs: ExecutionLog[];
  startSimulation: (workflowId: string) => Promise<void>;
  updateSimulationNode: (nodeId: string, status: 'idle' | 'running' | 'success' | 'error') => void;
  addSimulationLog: (log: ExecutionLog) => void;
  clearSimulation: () => void;

  // Agents
  agents: AIAgent[];
  fetchAgents: () => Promise<void>;
  createAgent: (agentData: Omit<AIAgent, 'id'>) => Promise<void>;
  deleteAgent: (id: string) => Promise<void>;
  chatWithAgent: (agentId: string, message: string, history: any[]) => Promise<string>;

  // Integrations
  integrations: Integration[];
  fetchIntegrations: () => Promise<void>;
  toggleIntegration: (name: string, connected: boolean) => Promise<void>;

  // Notifications
  notifications: any[];
  fetchNotifications: () => void;
  addNotification: (message: string) => void;
}

// Helper to get token from localStorage on initial load in browser
const getInitialToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('flowmind_token');
  }
  return null;
};

const getInitialUser = () => {
  if (typeof window !== 'undefined') {
    const user = localStorage.getItem('flowmind_user');
    return user ? JSON.parse(user) : null;
  }
  return null;
};

export const useStore = create<AppState>((set, get) => ({
  // Auth Store
  token: getInitialToken(),
  user: getInitialUser(),
  setAuth: (token, user) => {
    localStorage.setItem('flowmind_token', token);
    localStorage.setItem('flowmind_user', JSON.stringify(user));
    set({ token, user });
  },
  logout: () => {
    localStorage.removeItem('flowmind_token');
    localStorage.removeItem('flowmind_user');
    set({ token: null, user: null, workflows: [], activeWorkflow: null });
  },

  // Workflows Store
  workflows: [],
  activeWorkflow: null,
  isLoadingWorkflows: false,
  setActiveWorkflow: (wf) => {
    if (!wf) {
      set({ activeWorkflow: null });
      return;
    }
    const nodes = typeof wf.nodes === 'string' ? JSON.parse(wf.nodes) : wf.nodes;
    const edges = typeof wf.edges === 'string' ? JSON.parse(wf.edges) : wf.edges;
    set({
      activeWorkflow: {
        id: wf.id,
        name: wf.name,
        description: wf.description || '',
        nodes,
        edges,
        active: wf.active
      }
    });
  },
  fetchWorkflows: async () => {
    const { token } = get();
    if (!token) return;
    set({ isLoadingWorkflows: true });
    try {
      const res = await fetch(`${API_URL}/workflows`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) set({ workflows: data });
    } catch (err) {
      console.error('Failed to fetch workflows', err);
    } finally {
      set({ isLoadingWorkflows: false });
    }
  },
  createWorkflow: async (name, description) => {
    const { token } = get();
    if (!token) return null;
    try {
      const res = await fetch(`${API_URL}/workflows`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, description })
      });
      const data = await res.json();
      if (res.ok) {
        set(state => ({ workflows: [data, ...state.workflows] }));
        return data;
      }
    } catch (err) {
      console.error('Failed to create workflow', err);
    }
    return null;
  },
  updateWorkflow: async (id, updates) => {
    const { token, workflows, activeWorkflow } = get();
    if (!token) return;
    
    // Optimistic Update
    const updatedWorkflows = workflows.map(wf => wf.id === id ? { ...wf, ...updates } : wf);
    let updatedActive = activeWorkflow;
    if (activeWorkflow && activeWorkflow.id === id) {
      updatedActive = { ...activeWorkflow, ...updates };
    }
    set({ workflows: updatedWorkflows, activeWorkflow: updatedActive });

    try {
      // Serialize nodes and edges for backend Prisma database model
      const bodyPayload = { ...updates };
      if (updates.nodes) bodyPayload.nodes = JSON.stringify(updates.nodes);
      if (updates.edges) bodyPayload.edges = JSON.stringify(updates.edges);

      await fetch(`${API_URL}/workflows/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bodyPayload)
      });
    } catch (err) {
      console.error('Failed to save workflow state to database', err);
    }
  },
  deleteWorkflow: async (id) => {
    const { token } = get();
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/workflows/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        set(state => ({
          workflows: state.workflows.filter(wf => wf.id !== id),
          activeWorkflow: state.activeWorkflow?.id === id ? null : state.activeWorkflow
        }));
      }
    } catch (err) {
      console.error('Failed to delete workflow', err);
    }
  },
  generateWorkflowFromPrompt: async (prompt) => {
    const { token } = get();
    if (!token) return null;
    try {
      const res = await fetch(`${API_URL}/workflows/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ prompt })
      });
      const data = await res.json();
      if (res.ok) {
        set(state => ({ workflows: [data, ...state.workflows] }));
        return data;
      }
    } catch (err) {
      console.error('Error generating from prompt', err);
    }
    return null;
  },

  // Simulation Store
  isSimulating: false,
  simulationNodes: {},
  simulationLogs: [],
  startSimulation: async (workflowId) => {
    const { token } = get();
    if (!token) return;
    set({ isSimulating: true, simulationNodes: {}, simulationLogs: [] });
    try {
      await fetch(`${API_URL}/workflows/${workflowId}/run`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (err) {
      console.error('Failed to trigger simulation', err);
      set({ isSimulating: false });
    }
  },
  updateSimulationNode: (nodeId, status) => {
    set(state => ({
      simulationNodes: { ...state.simulationNodes, [nodeId]: status }
    }));
  },
  addSimulationLog: (log) => {
    set(state => ({
      simulationLogs: [...state.simulationLogs, log]
    }));
  },
  clearSimulation: () => {
    set({ isSimulating: false, simulationNodes: {}, simulationLogs: [] });
  },

  // Agents Store
  agents: [],
  fetchAgents: async () => {
    const { token } = get();
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/agents`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) set({ agents: data });
    } catch (err) {
      console.error('Failed to fetch agents', err);
    }
  },
  createAgent: async (agentData) => {
    const { token } = get();
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/agents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(agentData)
      });
      const data = await res.json();
      if (res.ok) {
        set(state => ({ agents: [data, ...state.agents] }));
      }
    } catch (err) {
      console.error('Failed to create agent', err);
    }
  },
  deleteAgent: async (id) => {
    const { token } = get();
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/agents/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        set(state => ({ agents: state.agents.filter(a => a.id !== id) }));
      }
    } catch (err) {
      console.error('Failed to delete agent', err);
    }
  },
  chatWithAgent: async (agentId, message, history) => {
    const { token } = get();
    if (!token) return 'Please login to converse with this agent.';
    try {
      const res = await fetch(`${API_URL}/agents/${agentId}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message, history })
      });
      const data = await res.json();
      if (res.ok) {
        return data.reply;
      }
      return data.error || 'Agent returned an error response.';
    } catch (err) {
      console.error('Chat failed', err);
      return 'AI Agent Connection Timeout.';
    }
  },

  // Integrations Store
  integrations: [],
  fetchIntegrations: async () => {
    const { token } = get();
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/integrations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) set({ integrations: data });
    } catch (err) {
      console.error('Failed to fetch integrations', err);
    }
  },
  toggleIntegration: async (name, connected) => {
    const { token, integrations } = get();
    if (!token) return;

    // Optimistic toggle
    set({
      integrations: integrations.map(item =>
        item.name === name ? { ...item, connected } : item
      )
    });

    try {
      await fetch(`${API_URL}/integrations/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, connected })
      });
    } catch (err) {
      console.error('Failed to toggle integration in backend', err);
    }
  },

  // Notifications Store
  notifications: [],
  fetchNotifications: () => {
    // Generate simulated active alert items
    set({
      notifications: [
        { id: 'n1', title: 'Workflow Executed', text: 'Email Summarizer & Slack completed successfully.', time: '5m ago' },
        { id: 'n2', title: 'AI Agent Decision', text: 'Support Agent resolved 12 client requests automatically.', time: '3h ago' },
        { id: 'n3', title: 'New Integration', text: 'GitHub was successfully connected to your workspace.', time: '1d ago' }
      ]
    });
  },
  addNotification: (message) => {
    set(state => ({
      notifications: [
        { id: Math.random().toString(), title: 'System Notification', text: message, time: 'Just now' },
        ...state.notifications
      ]
    }));
  }
}));
