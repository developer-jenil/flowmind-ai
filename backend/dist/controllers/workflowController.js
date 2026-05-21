"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateWorkflow = exports.runWorkflow = exports.deleteWorkflow = exports.updateWorkflow = exports.createWorkflow = exports.getWorkflowById = exports.getWorkflows = void 0;
const client_1 = require("@prisma/client");
const aiService_1 = require("../services/aiService");
const executionEngine_1 = require("../services/executionEngine");
const server_1 = require("../server");
const prisma = new client_1.PrismaClient();
const getWorkflows = async (req, res) => {
    if (!req.userId)
        return res.status(401).json({ error: 'Unauthorized' });
    try {
        const workflows = await prisma.workflow.findMany({
            where: { userId: req.userId },
            orderBy: { updatedAt: 'desc' }
        });
        return res.json(workflows);
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
};
exports.getWorkflows = getWorkflows;
const getWorkflowById = async (req, res) => {
    if (!req.userId)
        return res.status(401).json({ error: 'Unauthorized' });
    try {
        const workflow = await prisma.workflow.findFirst({
            where: { id: req.params.id, userId: req.userId }
        });
        if (!workflow) {
            return res.status(404).json({ error: 'Workflow not found' });
        }
        return res.json(workflow);
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
};
exports.getWorkflowById = getWorkflowById;
const createWorkflow = async (req, res) => {
    if (!req.userId)
        return res.status(401).json({ error: 'Unauthorized' });
    const { name, description, nodes, edges } = req.body;
    try {
        const workflow = await prisma.workflow.create({
            data: {
                name: name || 'Untitled Automation',
                description: description || 'No description provided.',
                nodes: nodes || '[]',
                edges: edges || '[]',
                userId: req.userId
            }
        });
        return res.status(201).json(workflow);
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
};
exports.createWorkflow = createWorkflow;
const updateWorkflow = async (req, res) => {
    if (!req.userId)
        return res.status(401).json({ error: 'Unauthorized' });
    const { name, description, active, nodes, edges } = req.body;
    try {
        // Verify ownership
        const existing = await prisma.workflow.findFirst({
            where: { id: req.params.id, userId: req.userId }
        });
        if (!existing) {
            return res.status(404).json({ error: 'Workflow not found' });
        }
        const workflow = await prisma.workflow.update({
            where: { id: req.params.id },
            data: {
                name: name !== undefined ? name : existing.name,
                description: description !== undefined ? description : existing.description,
                active: active !== undefined ? active : existing.active,
                nodes: nodes !== undefined ? nodes : existing.nodes,
                edges: edges !== undefined ? edges : existing.edges
            }
        });
        return res.json(workflow);
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
};
exports.updateWorkflow = updateWorkflow;
const deleteWorkflow = async (req, res) => {
    if (!req.userId)
        return res.status(401).json({ error: 'Unauthorized' });
    try {
        const existing = await prisma.workflow.findFirst({
            where: { id: req.params.id, userId: req.userId }
        });
        if (!existing) {
            return res.status(404).json({ error: 'Workflow not found' });
        }
        await prisma.workflow.delete({ where: { id: req.params.id } });
        return res.json({ success: true, message: 'Workflow deleted' });
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
};
exports.deleteWorkflow = deleteWorkflow;
const runWorkflow = async (req, res) => {
    if (!req.userId)
        return res.status(401).json({ error: 'Unauthorized' });
    try {
        const workflow = await prisma.workflow.findFirst({
            where: { id: req.params.id, userId: req.userId }
        });
        if (!workflow) {
            return res.status(404).json({ error: 'Workflow not found' });
        }
        // Trigger simulation in background. Websocket sends updates
        (0, executionEngine_1.runWorkflowSimulation)(workflow.id, workflow.nodes, workflow.edges, (message) => {
            (0, server_1.broadcastWorkflowEvent)(workflow.id, message);
        });
        return res.json({ success: true, message: 'Workflow execution simulation started.' });
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
};
exports.runWorkflow = runWorkflow;
const generateWorkflow = async (req, res) => {
    if (!req.userId)
        return res.status(401).json({ error: 'Unauthorized' });
    const { prompt } = req.body;
    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
    }
    try {
        const generated = await (0, aiService_1.generateWorkflowFromPrompt)(prompt);
        // Save generated workflow to user account immediately
        const workflow = await prisma.workflow.create({
            data: {
                name: generated.name,
                description: generated.description,
                nodes: JSON.stringify(generated.nodes),
                edges: JSON.stringify(generated.edges),
                userId: req.userId
            }
        });
        return res.status(201).json(workflow);
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
};
exports.generateWorkflow = generateWorkflow;
