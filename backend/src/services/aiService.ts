import { OpenAI } from 'openai';

let openai: OpenAI | null = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export interface GeneratedNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: { label: string; [key: string]: any };
}

export interface GeneratedEdge {
  id: string;
  source: string;
  target: string;
  animated?: boolean;
}

export interface GeneratedWorkflow {
  name: string;
  description: string;
  nodes: GeneratedNode[];
  edges: GeneratedEdge[];
}

export const generateWorkflowFromPrompt = async (prompt: string): Promise<GeneratedWorkflow> => {
  const normalized = prompt.toLowerCase();
  
  if (openai) {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: `You are the AI workflow architect for FlowMind AI. Given a user request, you generate a visual workflow.
Your output must be a JSON object with:
{
  "name": "Creative name of the workflow",
  "description": "Short explanation of what it does",
  "nodes": [
    { "id": "1", "type": "gmailTrigger", "position": { "x": 100, "y": 150 }, "data": { "label": "Gmail Trigger", "details": "When lead email arrives" } }
  ],
  "edges": [
    { "id": "e1-2", "source": "1", "target": "2", "animated": true }
  ]
}

Available node types:
- 'gmailTrigger': Triggers on email.
- 'webhookTrigger': Webhook receiver.
- 'slackMessage': Sends a message to Slack.
- 'aiSummarizer': Summarizes text using AI.
- 'gptAgent': Processes input with custom prompt.
- 'crmUpdate': Updates customer database.
- 'databaseAction': Query or write to DB.
- 'googleSheets': Add rows to spreadsheet.
- 'whatsAppMessage': Send Whatsapp.
- 'delayNode': Wait before continuing.

Lay out nodes left-to-right (incrementing X coordinates by ~250px, keep Y stable around ~150-250px) sequentially.`
          },
          { role: 'user', content: prompt }
        ]
      });

      const data = JSON.parse(response.choices[0].message.content || '{}');
      if (data.nodes && data.edges) {
        return data as GeneratedWorkflow;
      }
    } catch (err) {
      console.error('Error generating workflow with OpenAI:', err);
    }
  }

  // Smart keyword-based fallback generator
  console.log('Generating workflow using intelligent rules fallback');
  const nodes: GeneratedNode[] = [];
  const edges: GeneratedEdge[] = [];
  let step = 0;

  const addNode = (type: string, label: string, extraData: any = {}) => {
    const id = `node-${step + 1}`;
    nodes.push({
      id,
      type,
      position: { x: 50 + step * 260, y: 200 + (step % 2) * 40 },
      data: { label, ...extraData }
    });
    if (step > 0) {
      edges.push({
        id: `edge-${step}-${step + 1}`,
        source: `node-${step}`,
        target: id,
        animated: true
      });
    }
    step++;
  };

  // Rule matchings
  if (normalized.includes('email') || normalized.includes('mail') || normalized.includes('gmail')) {
    addNode('gmailTrigger', 'Gmail: New Email Received', { config: { filter: 'subject:Lead' } });
  } else if (normalized.includes('webhook') || normalized.includes('api') || normalized.includes('catch')) {
    addNode('webhookTrigger', 'Webhook: Catch Hook', { config: { path: '/v1/webhook-receiver' } });
  } else {
    addNode('webhookTrigger', 'Custom Trigger', { config: { trigger: 'manual' } });
  }

  if (normalized.includes('summarize') || normalized.includes('summary') || normalized.includes('shorten')) {
    addNode('aiSummarizer', 'AI: Summarize Input', { config: { length: 'short', model: 'gpt-4o' } });
  } else if (normalized.includes('agent') || normalized.includes('gpt') || normalized.includes('reason')) {
    addNode('gptAgent', 'AI Agent: Core Reasoning', { config: { prompt: 'Analyze sentiment of input' } });
  } else {
    addNode('aiSummarizer', 'AI: Extract Action Items', { config: { prompt: 'Extract task list' } });
  }

  if (normalized.includes('slack')) {
    addNode('slackMessage', 'Slack: Post Alert', { config: { channel: '#operations', mention: '@channel' } });
  }
  if (normalized.includes('crm') || normalized.includes('salesforce') || normalized.includes('hubspot')) {
    addNode('crmUpdate', 'HubSpot: Upsert Contact', { config: { properties: 'email,name' } });
  }
  if (normalized.includes('sheet') || normalized.includes('google sheets') || normalized.includes('excel')) {
    addNode('googleSheets', 'Sheets: Append Row', { config: { spreadsheet: 'Lead Log' } });
  }
  if (normalized.includes('db') || normalized.includes('database') || normalized.includes('postgres') || normalized.includes('sql')) {
    addNode('databaseAction', 'Database: Write Record', { config: { table: 'customers' } });
  }
  if (normalized.includes('whatsapp') || normalized.includes('phone') || normalized.includes('sms')) {
    addNode('whatsAppMessage', 'WhatsApp: Send Notification', { config: { template: 'alert_notification' } });
  }

  // Ensure there are at least 3 nodes for nice visually engaging flow in dashboard demo
  if (nodes.length === 1) {
    addNode('aiSummarizer', 'AI: Analyze Sentiment');
    addNode('slackMessage', 'Slack: Send Summary Report');
  } else if (nodes.length === 2) {
    addNode('googleSheets', 'Google Sheets: Log Execution');
  }

  return {
    name: prompt.substring(0, 40) + (prompt.length > 40 ? '...' : '') + ' Workflow',
    description: `AI-Generated workflow based on prompt: "${prompt}"`,
    nodes,
    edges
  };
};

export const getAgentResponse = async (
  agentPrompt: string,
  message: string,
  history: { role: string; content: string }[]
): Promise<string> => {
  if (openai) {
    try {
      const messages: any[] = [
        { role: 'system', content: `You are an automated agent helper on FlowMind AI platform. Your configured system directive is: "${agentPrompt}". Guide the user, help them debug nodes, or propose improvements.` },
        ...history,
        { role: 'user', content: message }
      ];

      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages
      });

      return response.choices[0].message.content || 'I processed your request but returned empty.';
    } catch (err) {
      console.error('Error in agent response:', err);
    }
  }

  // Fallback intelligent agent chatbot responder
  const query = message.toLowerCase();
  if (query.includes('hello') || query.includes('hi')) {
    return `Hello! I am your FlowMind Assistant. I see my current agent instructions are to act as a: "${agentPrompt.substring(0, 60)}...". How can I help you automate today?`;
  }
  if (query.includes('debug') || query.includes('error') || query.includes('fail')) {
    return "Let's check the execution logs! If a node fails, make sure your inputs match what that node expects (e.g. Gmail Node outputting plain text and Slack Node expecting JSON). You can run a simulation and trace the signal path.";
  }
  if (query.includes('pricing') || query.includes('cost')) {
    return "FlowMind AI pricing ranges from the Starter Free Tier (1,000 runs/mo) to the Pro Tier ($29/mo, 50,000 runs/mo, advanced agents) and Enterprise custom plans.";
  }
  return `I have analyzed your request based on my agent parameters (${agentPrompt.substring(0, 30)}...). Here is my suggestion: Try connecting a Trigger Node (like Webhook) to an AI Node, and pipe the output to Slack. This will automate your manual process easily! Let me know if you want me to generate this workflow.`;
};
