"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const authController_1 = require("../controllers/authController");
const workflowController_1 = require("../controllers/workflowController");
const agentController_1 = require("../controllers/agentController");
const integrationController_1 = require("../controllers/integrationController");
const analyticsController_1 = require("../controllers/analyticsController");
const router = (0, express_1.Router)();
// Auth Routes
router.post('/auth/signup', authController_1.signup);
router.post('/auth/login', authController_1.login);
router.get('/auth/profile', auth_1.authenticateToken, authController_1.getProfile);
// Workflow Routes
router.get('/workflows', auth_1.authenticateToken, workflowController_1.getWorkflows);
router.get('/workflows/:id', auth_1.authenticateToken, workflowController_1.getWorkflowById);
router.post('/workflows', auth_1.authenticateToken, workflowController_1.createWorkflow);
router.put('/workflows/:id', auth_1.authenticateToken, workflowController_1.updateWorkflow);
router.delete('/workflows/:id', auth_1.authenticateToken, workflowController_1.deleteWorkflow);
router.post('/workflows/:id/run', auth_1.authenticateToken, workflowController_1.runWorkflow);
router.post('/workflows/generate', auth_1.authenticateToken, workflowController_1.generateWorkflow);
// Agent Routes
router.get('/agents', auth_1.authenticateToken, agentController_1.getAgents);
router.post('/agents', auth_1.authenticateToken, agentController_1.createAgent);
router.put('/agents/:id', auth_1.authenticateToken, agentController_1.updateAgent);
router.delete('/agents/:id', auth_1.authenticateToken, agentController_1.deleteAgent);
router.post('/agents/:id/chat', auth_1.authenticateToken, agentController_1.chatWithAgent);
// Integration Routes
router.get('/integrations', auth_1.authenticateToken, integrationController_1.getIntegrations);
router.post('/integrations/toggle', auth_1.authenticateToken, integrationController_1.toggleIntegration);
// Analytics Routes
router.get('/analytics', auth_1.authenticateToken, analyticsController_1.getAnalyticsDashboard);
exports.default = router;
