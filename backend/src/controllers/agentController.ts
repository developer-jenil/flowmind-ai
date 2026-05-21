import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { getAgentResponse } from '../services/aiService';

const prisma = new PrismaClient();

export const getAgents = async (req: AuthRequest, res: Response): Promise<any> => {
  if (!req.userId) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const agents = await prisma.aIAgent.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' }
    });
    return res.json(agents);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const createAgent = async (req: AuthRequest, res: Response): Promise<any> => {
  if (!req.userId) return res.status(401).json({ error: 'Unauthorized' });
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
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const updateAgent = async (req: AuthRequest, res: Response): Promise<any> => {
  if (!req.userId) return res.status(401).json({ error: 'Unauthorized' });
  const { name, role, model, prompt, memory } = req.body;

  try {
    const existing = await prisma.aIAgent.findFirst({
      where: { id: req.params.id as string, userId: req.userId }
    });
    if (!existing) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    const agent = await prisma.aIAgent.update({
      where: { id: req.params.id as string },
      data: {
        name: name || existing.name,
        role: role || existing.role,
        model: model || existing.model,
        prompt: prompt || existing.prompt,
        memory: memory || existing.memory
      }
    });
    return res.json(agent);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const deleteAgent = async (req: AuthRequest, res: Response): Promise<any> => {
  if (!req.userId) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const existing = await prisma.aIAgent.findFirst({
      where: { id: req.params.id as string, userId: req.userId }
    });
    if (!existing) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    await prisma.aIAgent.delete({ where: { id: req.params.id as string } });
    return res.json({ success: true, message: 'Agent deleted' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const chatWithAgent = async (req: AuthRequest, res: Response): Promise<any> => {
  if (!req.userId) return res.status(401).json({ error: 'Unauthorized' });
  const { message, history } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message payload is required.' });
  }

  try {
    const agent = await prisma.aIAgent.findFirst({
      where: { id: req.params.id as string, userId: req.userId }
    });
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    const reply = await getAgentResponse(agent.prompt, message, history || []);
    return res.json({ reply });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};
