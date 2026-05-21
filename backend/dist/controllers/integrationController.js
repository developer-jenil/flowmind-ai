"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleIntegration = exports.getIntegrations = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const DEFAULT_INTEGRATIONS = [
    { name: 'gmail', connected: false, config: '{}' },
    { name: 'slack', connected: false, config: '{}' },
    { name: 'discord', connected: false, config: '{}' },
    { name: 'notion', connected: false, config: '{}' },
    { name: 'trello', connected: false, config: '{}' },
    { name: 'github', connected: false, config: '{}' },
    { name: 'googleSheets', connected: false, config: '{}' },
    { name: 'whatsapp', connected: false, config: '{}' },
    { name: 'openai', connected: false, config: '{}' },
    { name: 'stripe', connected: false, config: '{}' }
];
const getIntegrations = async (req, res) => {
    if (!req.userId)
        return res.status(401).json({ error: 'Unauthorized' });
    try {
        const userIntegrations = await prisma.integration.findMany({
            where: { userId: req.userId }
        });
        const result = DEFAULT_INTEGRATIONS.map(defaultItem => {
            const found = userIntegrations.find(u => u.name === defaultItem.name);
            return found ? found : { name: defaultItem.name, connected: false, config: '{}' };
        });
        return res.json(result);
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
};
exports.getIntegrations = getIntegrations;
const toggleIntegration = async (req, res) => {
    if (!req.userId)
        return res.status(401).json({ error: 'Unauthorized' });
    const { name, connected, config } = req.body;
    if (!name) {
        return res.status(400).json({ error: 'Integration name is required.' });
    }
    try {
        const integration = await prisma.integration.upsert({
            where: {
                userId_name: {
                    userId: req.userId,
                    name
                }
            },
            update: {
                connected: connected !== undefined ? connected : true,
                config: config ? JSON.stringify(config) : '{}'
            },
            create: {
                name,
                connected: connected !== undefined ? connected : true,
                config: config ? JSON.stringify(config) : '{}',
                userId: req.userId
            }
        });
        return res.json(integration);
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
};
exports.toggleIntegration = toggleIntegration;
