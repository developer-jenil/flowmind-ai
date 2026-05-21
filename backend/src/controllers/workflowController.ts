import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { generateWorkflowFromPrompt } from '../services/aiService';
import { runWorkflowSimulation } from '../services/executionEngine';
import { broadcastWorkflowEvent } from '../server';

const prisma = new PrismaClient();

export const getWorkflows = async (req: AuthRequest, res: Response): Promise<any> => {
  if (!req.userId) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const workflows = await prisma.workflow.findMany({
      where: { userId: req.userId },
      orderBy: { updatedAt: 'desc' }
    });
    return res.json(workflows);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const getWorkflowById = async (req: AuthRequest, res: Response): Promise<any> => {
  if (!req.userId) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const workflow = await prisma.workflow.findFirst({
      where: { id: req.params.id as string, userId: req.userId }
    });
    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }
    return res.json(workflow);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const createWorkflow = async (req: AuthRequest, res: Response): Promise<any> => {
  if (!req.userId) return res.status(401).json({ error: 'Unauthorized' });
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
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const updateWorkflow = async (req: AuthRequest, res: Response): Promise<any> => {
  if (!req.userId) return res.status(401).json({ error: 'Unauthorized' });
  const { name, description, active, nodes, edges } = req.body;

  try {
    // Verify ownership
    const existing = await prisma.workflow.findFirst({
      where: { id: req.params.id as string, userId: req.userId }
    });
    if (!existing) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    const workflow = await prisma.workflow.update({
      where: { id: req.params.id as string },
      data: {
        name: name !== undefined ? name : existing.name,
        description: description !== undefined ? description : existing.description,
        active: active !== undefined ? active : existing.active,
        nodes: nodes !== undefined ? nodes : existing.nodes,
        edges: edges !== undefined ? edges : existing.edges
      }
    });
    return res.json(workflow);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const deleteWorkflow = async (req: AuthRequest, res: Response): Promise<any> => {
  if (!req.userId) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const existing = await prisma.workflow.findFirst({
      where: { id: req.params.id as string, userId: req.userId }
    });
    if (!existing) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    await prisma.workflow.delete({ where: { id: req.params.id as string } });
    return res.json({ success: true, message: 'Workflow deleted' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const runWorkflow = async (req: AuthRequest, res: Response): Promise<any> => {
  if (!req.userId) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const workflow = await prisma.workflow.findFirst({
      where: { id: req.params.id as string, userId: req.userId }
    });
    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    // Trigger simulation in background. Websocket sends updates
    runWorkflowSimulation(workflow.id, workflow.nodes, workflow.edges, (message: any) => {
      broadcastWorkflowEvent(workflow.id, message);
    });

    return res.json({ success: true, message: 'Workflow execution simulation started.' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const generateWorkflow = async (req: AuthRequest, res: Response): Promise<any> => {
  if (!req.userId) return res.status(401).json({ error: 'Unauthorized' });
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    const generated = await generateWorkflowFromPrompt(prompt);
    
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
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};
