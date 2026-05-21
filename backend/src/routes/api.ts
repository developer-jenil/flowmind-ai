import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { signup, login, getProfile } from '../controllers/authController';
import {
  getWorkflows,
  getWorkflowById,
  createWorkflow,
  updateWorkflow,
  deleteWorkflow,
  runWorkflow,
  generateWorkflow
} from '../controllers/workflowController';
import {
  getAgents,
  createAgent,
  updateAgent,
  deleteAgent,
  chatWithAgent
} from '../controllers/agentController';
import { getIntegrations, toggleIntegration } from '../controllers/integrationController';
import { getAnalyticsDashboard } from '../controllers/analyticsController';

const router = Router();

// Auth Routes
router.post('/auth/signup', signup);
router.post('/auth/login', login);
router.get('/auth/profile', authenticateToken, getProfile);

// Workflow Routes
router.get('/workflows', authenticateToken, getWorkflows);
router.get('/workflows/:id', authenticateToken, getWorkflowById);
router.post('/workflows', authenticateToken, createWorkflow);
router.put('/workflows/:id', authenticateToken, updateWorkflow);
router.delete('/workflows/:id', authenticateToken, deleteWorkflow);
router.post('/workflows/:id/run', authenticateToken, runWorkflow);
router.post('/workflows/generate', authenticateToken, generateWorkflow);

// Agent Routes
router.get('/agents', authenticateToken, getAgents);
router.post('/agents', authenticateToken, createAgent);
router.put('/agents/:id', authenticateToken, updateAgent);
router.delete('/agents/:id', authenticateToken, deleteAgent);
router.post('/agents/:id/chat', authenticateToken, chatWithAgent);

// Integration Routes
router.get('/integrations', authenticateToken, getIntegrations);
router.post('/integrations/toggle', authenticateToken, toggleIntegration);

// Analytics Routes
router.get('/analytics', authenticateToken, getAnalyticsDashboard);

export default router;
