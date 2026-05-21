"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.broadcastWorkflowEvent = void 0;
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const ws_1 = __importDefault(require("ws"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const url_1 = __importDefault(require("url"));
const api_1 = __importDefault(require("./routes/api"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const wss = new ws_1.default.Server({ noServer: true });
app.use((0, cors_1.default)({
    origin: '*', // For development, allow all origins
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express_1.default.json());
// Main API Route
app.use('/api', api_1.default);
// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', time: new Date() });
});
// Map to track active WS clients grouped by workflow ID
const workflowClients = new Map();
wss.on('connection', (ws, req) => {
    const parsedUrl = url_1.default.parse(req.url || '', true);
    const workflowId = parsedUrl.query.workflowId;
    if (workflowId) {
        if (!workflowClients.has(workflowId)) {
            workflowClients.set(workflowId, new Set());
        }
        workflowClients.get(workflowId).add(ws);
        console.log(`WebSocket client subscribed to workflow logs: ${workflowId}`);
    }
    ws.on('close', () => {
        if (workflowId && workflowClients.has(workflowId)) {
            workflowClients.get(workflowId).delete(ws);
            if (workflowClients.get(workflowId).size === 0) {
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
const broadcastWorkflowEvent = (workflowId, message) => {
    const clients = workflowClients.get(workflowId);
    if (clients) {
        const payload = JSON.stringify(message);
        clients.forEach((client) => {
            if (client.readyState === ws_1.default.OPEN) {
                client.send(payload);
            }
        });
    }
};
exports.broadcastWorkflowEvent = broadcastWorkflowEvent;
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`FlowMind AI Backend running on http://localhost:${PORT}`);
    console.log(`WebSocket Server mounted at ws://localhost:${PORT}`);
});
