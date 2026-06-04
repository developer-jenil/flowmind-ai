import express from 'express';
import http from 'http';
import WebSocket from 'ws';
import cors from 'cors';
import dotenv from 'dotenv';
import url from 'url';
import apiRouter from './routes/api';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ noServer: true });

app.use(cors({
  origin: '*', // For development, allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Main API Route
app.use('/api', apiRouter);

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

// Map to track active WS clients grouped by workflow ID
const workflowClients = new Map<string, Set<WebSocket>>();

wss.on('connection', (ws: WebSocket, req: http.IncomingMessage) => {
  const parsedUrl = url.parse(req.url || '', true);
  const workflowId = parsedUrl.query.workflowId as string;

  if (workflowId) {
    if (!workflowClients.has(workflowId)) {
      workflowClients.set(workflowId, new Set());
    }
    workflowClients.get(workflowId)!.add(ws);
    console.log(`WebSocket client subscribed to workflow logs: ${workflowId}`);
  }

  ws.on('close', () => {
    if (workflowId && workflowClients.has(workflowId)) {
      workflowClients.get(workflowId)!.delete(ws);
      if (workflowClients.get(workflowId)!.size === 0) {
        workflowClients.delete(workflowId);
      }
      console.log(`WebSocket client disconnected from workflow logs: ${workflowId}`);
    }
  });

  // Keep connection alive with ping/pong
  ws.on('message', (message) => {
    if (message.toString() === 'ping') {
      ws.send('pong');
    }
  });
});

// Handle WebSocket upgrade
server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});

// Broadcast event to all WS clients watching a specific workflow
export const broadcastWorkflowEvent = (workflowId: string, message: any) => {
  const clients = workflowClients.get(workflowId);
  if (clients) {
    const payload = JSON.stringify(message);
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    });
  }
};

const prisma = new PrismaClient();

async function seedDemoUser() {
  try {
    await prisma.user.upsert({
      where: { email: 'hackathon-judge@flowmind.ai' },
      update: {},
      create: {
        id: 'demo-user-id',
        email: 'hackathon-judge@flowmind.ai',
        password: 'demo-password-not-used',
        name: 'Judge Reviewer'
      }
    });
    console.log('Demo user seeded successfully or already exists.');
  } catch (err) {
    console.error('Failed to seed demo user:', err);
  }
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, async () => {
  await seedDemoUser();
  console.log(`FlowMind AI Backend running on http://localhost:${PORT}`);
  console.log(`WebSocket Server mounted at ws://localhost:${PORT}`);
});
