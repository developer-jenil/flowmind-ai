"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfile = exports.login = exports.signup = void 0;
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma = new client_1.PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-flowmind-ai-2026-hackathon';
const signup = async (req, res) => {
    const { email, password, name } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }
    try {
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return res.status(400).json({ error: 'User already exists with this email' });
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name
            }
        });
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
        return res.status(201).json({
            token,
            user: { id: user.id, email: user.email, name: user.name }
        });
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
};
exports.signup = signup;
const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
        return res.json({
            token,
            user: { id: user.id, email: user.email, name: user.name }
        });
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
};
exports.login = login;
const getProfile = async (req, res) => {
    if (!req.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
            select: { id: true, email: true, name: true, createdAt: true }
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        return res.json(user);
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
};
exports.getProfile = getProfile;
