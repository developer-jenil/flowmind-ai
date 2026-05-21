# FlowMind AI — Advanced AI Workflow Automation Platform

FlowMind AI is a visual AI-powered automation platform that combines the capabilities of **Zapier**, **Notion AI**, **n8n**, **Slack automation**, and **ChatGPT** into a single glassmorphic dark-theme ecosystem. It lets users create complex logical triggers, deploy specialized AI Agent personas, chat with cognitive models, toggle third-party app connections, and visualize execution runs in real time via WebSockets.

---

## 🚀 Key Features

* 🎨 **Interactive Flow Canvas**: Drag-and-drop `@xyflow/react` editor to connect triggers (Gmail, Webhooks), cognitive agents, actions (Slack, Google Sheets).
* 🤖 **Autonomous AI Agent Workers**: Configure custom agent prompts, memory tiers, and models (`gpt-4o`, `claude-3`), and converse via a live side panel chat interface.
* ⚡ **AI Prompt to Workflow Generator**: Input natural language prompt (e.g. *"When a lead email arrives, summarize with AI and notify Slack"*) to auto-generate node coordinates and connections.
* 📊 **Real-Time Analytics Dashboard**: Monitor runs status with custom Recharts graphs, heatmaps, and audit logs.
* 🔌 **Connected Integrations**: Encrypted credentials toggle panel for Slack, Discord, Google Sheets, Gmail, and Stripe.
* 🛰️ **WebSocket Execution Trace**: Live console stream logging node-by-node execution state changes (`running`, `success`, `error`).

---

## 🛠️ Tech Stack & Architecture

### Frontend (`/frontend`)
* **Framework**: Next.js 15 (App Router)
* **Styling**: Tailwind CSS v4, custom glassmorphism components
* **State Management**: Zustand
* **Visual Graph Canvas**: `@xyflow/react` (React Flow)
* **Animations**: Framer Motion
* **Analytics Plots**: Recharts
* **Icons**: Lucide React

### Backend (`/backend`)
* **Server Runtime**: Node.js, Express, TypeScript
* **Database**: SQLite (configured with Prisma ORM for zero-config local run)
* **Real-time Communication**: WebSockets (`ws` library)
* **API Security**: JSON Web Tokens (JWT) + BCrypt password hashing
* **AI Orchestration**: Built-in OpenAI client with smart rule-based keyword fallbacks

---

## 🔧 Installation & Getting Started

Follow these steps to run both the frontend and backend servers locally on your machine.

### Prerequisites
* **Node.js** (v18 or higher recommended)
* **npm** (comes bundled with Node)

---

### Step 1: Run the Backend Server

1. Open a terminal and navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install all dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables by creating a `.env` file in `/backend`:
   ```env
   DATABASE_URL="file:./dev.db"
   JWT_SECRET="super-secret-jwt-hash-2026"
   PORT=5000
   # OPTIONAL: Add OpenAI API key if you want to use live LLM parsing
   # OPENAI_API_KEY="your-openai-api-key"
   ```
4. Run Prisma database migrations to initialize the SQLite database:
   ```bash
   npx prisma migrate dev --name init
   ```
5. Start the development server (runs HTTP on port `5000` and binds WebSockets):
   ```bash
   npm run dev
   ```

---

### Step 2: Run the Frontend Client

1. Open a new terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install all dependencies:
   ```bash
   npm install
   ```
3. Start the Next.js development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:3000`.

---

## 💡 Hackathon Evaluation Guide

To help judges evaluate the project instantly without requiring credentials or configuration:
1. **Instant Login**: Click the **"Instant Hackathon Login"** button on the Login/Signup screen. This logs you in with a pre-configured demo account immediately.
2. **AI Generation**: In the Automations panel, try entering a prompt like: *"Send email summaries to Slack when received in Gmail"* to watch the AI build nodes live.
3. **Run Simulation**: Open any visual workflow, click **"Run Simulation"**, and watch the real-time execution signal flow through nodes while logs stream into the console.
