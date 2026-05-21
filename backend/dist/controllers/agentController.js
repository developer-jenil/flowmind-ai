"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatWithAgent = exports.deleteAgent = exports.updateAgent = exports.createAgent = exports.getAgents = void 0;
const client_1 = require("@prisma/client");
const aiService_1 = require("../services/aiService");
const prisma = new client_1.PrismaClient();
const getAgents = async (req, res) => {
    if (!req.userId)
        return res.status(401).json({ error: 'Unauthorized' });
    try {
        const agents = await prisma.aIAgent.findMany({
            where: { userId: req.userId },
            orderBy: { createdAt: 'desc' }
        });
        return res.json(agents);
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
};
exports.getAgents = getAgents;
const createAgent = async (req, res) => {
    if (!req.userId)
        return res.status(401).json({ error: 'Unauthorized' });
    const { name, role, model, prompt, memory } = req.body;
    if (!name || !role || !model || !prompt) {
        return res.status(400).json({ error: 'Missing required agent fields.' });
    }
    try {
        const agent = await prisma.aIAgent.create({
            data: {
                name,
                role,
                model,
                prompt,
                memory: memory || 'short-term',
                userId: req.userId
            }
        });
        return res.status(201).json(agent);
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
};
exports.createAgent = createAgent;
const updateAgent = async (req, res) => {
    if (!req.userId)
        return res.status(401).json({ error: 'Unauthorized' });
    const { name, role, model, prompt, memory } = req.body;
    try {
        const existing = await prisma.aIAgent.findFirst({
            where: { id: req.params.id, userId: req.userId }
        });
        if (!existing) {
            return res.status(404).json({ error: 'Agent not found' });
        }
        const agent = await prisma.aIAgent.update({
            where: { id: req.params.id },
            data: {
                name: name || existing.name,
                role: role || existing.role,
                model: model || existing.model,
                prompt: prompt || existing.prompt,
                memory: memory || existing.memory
            }
        });
        return res.json(agent);
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
};
exports.updateAgent = updateAgent;
const deleteAgent = async (req, res) => {
    if (!req.userId)
        return res.status(401).json({ error: 'Unauthorized' });
    try {
        const existing = await prisma.aIAgent.findFirst({
            where: { id: req.params.id, userId: req.userId }
        });
        if (!existing) {
            return res.status(404).json({ error: 'Agent not found' });
        }
        await prisma.aIAgent.delete({ where: { id: req.params.id } });
        return res.json({ success: true, message: 'Agent deleted' });
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
};
exports.deleteAgent = deleteAgent;
const chatWithAgent = async (req, res) => {
    if (!req.userId)
        return res.status(401).json({ error: 'Unauthorized' });
    const { message, history } = req.body;
    if (!message) {
        return res.status(400).json({ error: 'Message payload is required.' });
    }
    try {
        const agent = await prisma.aIAgent.findFirst({
            where: { id: req.params.id, userId: req.userId }
        });
        if (!agent) {
            return res.status(404).json({ error: 'Agent not found' });
        }
        const reply = await (0, aiService_1.getAgentResponse)(agent.prompt, message, history || []);
        return res.json({ reply });
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
};
exports.chatWithAgent = chatWithAgent;
