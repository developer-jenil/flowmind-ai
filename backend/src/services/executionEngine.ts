import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Injected websocket sender
export type WsBroadcastFn = (message: any) => void;

interface ExecutionNode {
  id: string;
  type: string;
  data: { label: string; [key: string]: any };
}

interface ExecutionEdge {
  source: string;
  target: string;
}

export const runWorkflowSimulation = async (
  workflowId: string,
  nodesJson: string,
  edgesJson: string,
  broadcast: WsBroadcastFn
) => {
  const nodes: ExecutionNode[] = JSON.parse(nodesJson);
  const edges: ExecutionEdge[] = JSON.parse(edgesJson);

  if (nodes.length === 0) {
    broadcast({ type: 'error', workflowId, message: 'Workflow has no nodes.' });
    return;
  }

  // Create database execution record
  const execution = await prisma.execution.create({
    data: {
      workflowId,
      status: 'RUNNING',
      logs: JSON.stringify([{ time: new Date().toISOString(), type: 'info', message: 'Workflow execution initialized.' }]),
    }
  });

  const executionId = execution.id;
  broadcast({ type: 'workflow_started', workflowId, executionId });

  // Map nodes by ID
  const nodeMap = new Map<string, ExecutionNode>();
  nodes.forEach(node => nodeMap.set(node.id, node));

  // Determine starting nodes (nodes with no incoming edges)
  const incomingCount = new Map<string, number>();
  nodes.forEach(node => incomingCount.set(node.id, 0));
  edges.forEach(edge => {
    incomingCount.set(edge.target, (incomingCount.get(edge.target) || 0) + 1);
  });

  let queue: string[] = [];
  incomingCount.forEach((count, id) => {
    if (count === 0) {
      queue.push(id);
    }
  });

  // If there's a loop or no clear starting node, start with the first node
  if (queue.length === 0 && nodes.length > 0) {
    queue.push(nodes[0].id);
  }

  const logs: any[] = [];
  const addLog = (nodeId: string, type: 'info' | 'success' | 'warn' | 'error', message: string, data?: any) => {
    const logItem = {
      timestamp: new Date().toISOString(),
      nodeId,
      type,
      message,
      data
    };
    logs.push(logItem);
    broadcast({ type: 'log', workflowId, executionId, log: logItem });
  };

  const startTime = Date.now();
  const visited = new Set<string>();

  try {
    while (queue.length > 0) {
      const currentId = queue.shift()!;
      if (visited.has(currentId)) continue;
      visited.add(currentId);

      const node = nodeMap.get(currentId);
      if (!node) continue;

      // Broadcast running state
      broadcast({ type: 'node_running', workflowId, nodeId: currentId });
      addLog(currentId, 'info', `Executing node: ${node.data.label} [Type: ${node.type}]`);

      // Simulate network / processing delay (1000ms per node)
      await new Date(Date.now() + 1000); // Wait 1 second
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Execute specific simulated logic for node types
      let outputData: any = {};
      switch (node.type) {
        case 'gmailTrigger':
          outputData = { subject: 'Urgent: Feedback on design proposal', sender: 'john.doe@stripe.com', body: 'Please review the new Framer mockup' };
          addLog(currentId, 'success', 'Successfully polled Gmail inbox.', outputData);
          break;

        case 'webhookTrigger':
          outputData = { event: 'user_signup', payload: { name: 'Sarah Miller', email: 'sarah@stripe.com', plan: 'enterprise' } };
          addLog(currentId, 'success', 'Webhook trigger received payload.', outputData);
          break;

        case 'aiSummarizer':
          outputData = { summary: 'Stripe user Sarah Miller registered for the enterprise plan. Action required.' };
          addLog(currentId, 'success', 'AI model successfully summarized content.', outputData);
          break;

        case 'gptAgent':
          outputData = { decision: 'approve', confidence: 0.98, reasoning: 'User fits standard ideal customer profile parameters.' };
          addLog(currentId, 'success', 'AI Agent completed cognitive reasoning step.', outputData);
          break;

        case 'slackMessage':
          outputData = { status: 'sent', channel: '#ops-alerts', messageId: 'msg_875429810' };
          addLog(currentId, 'success', 'Slack message pushed to webhook endpoint.', outputData);
          break;

        case 'crmUpdate':
          outputData = { recordId: 'contact_87632', status: 'created', score: 95 };
          addLog(currentId, 'success', 'Hubspot CRM profile updated with new telemetry.', outputData);
          break;

        case 'googleSheets':
          outputData = { rowAdded: 142, spreadsheetId: 'sheet_flowmind_logs' };
          addLog(currentId, 'success', 'Row written to target spreadsheet.', outputData);
          break;

        case 'databaseAction':
          outputData = { rowsAffected: 1, query: 'INSERT INTO users ...' };
          addLog(currentId, 'success', 'PostgreSQL database write executed.', outputData);
          break;

        case 'whatsAppMessage':
          outputData = { recipient: '+1 (555) 019-2834', status: 'delivered' };
          addLog(currentId, 'success', 'WhatsApp template notification dispatched.', outputData);
          break;

        default:
          outputData = { status: 'completed' };
          addLog(currentId, 'success', 'Custom execution block complete.', outputData);
      }

      // Broadcast node success state
      broadcast({ type: 'node_success', workflowId, nodeId: currentId, output: outputData });

      // Find next nodes in connection sequence
      edges
        .filter(edge => edge.source === currentId)
        .forEach(edge => {
          if (!visited.has(edge.target)) {
            queue.push(edge.target);
          }
        });
    }

    const duration = Date.now() - startTime;
    // Save success state to database
    await prisma.execution.update({
      where: { id: executionId },
      data: {
        status: 'SUCCESS',
        logs: JSON.stringify(logs),
        duration
      }
    });

    broadcast({ type: 'workflow_success', workflowId, executionId, duration });

  } catch (err: any) {
    console.error('Error executing workflow simulation:', err);
    const duration = Date.now() - startTime;

    addLog('system', 'error', `Execution failed: ${err.message}`);

    await prisma.execution.update({
      where: { id: executionId },
      data: {
        status: 'FAILED',
        logs: JSON.stringify(logs),
        duration
      }
    });

    broadcast({ type: 'workflow_failed', workflowId, executionId, message: err.message });
  }
};
