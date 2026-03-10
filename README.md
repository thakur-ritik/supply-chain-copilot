# ⚡ SupplyChainAI — Operations Copilot

An AI-powered supply chain assistant that analyzes shipment order data and answers operational questions in natural language — powered by **Groq + Llama 3**.

![Dashboard Preview](https://via.placeholder.com/900x500/070e17/00E5CC?text=SupplyChain+AI+Copilot)

---

## 🚀 Features

| Feature | Description |
|---|---|
| 📊 **Dashboard** | KPI cards + 5 chart types (bar, area, pie, radar, horizontal bar) |
| 🔍 **Analytics** | Deep warehouse & product performance breakdown |
| 📋 **Orders Table** | Full order records with delay badges and priority tags |
| 🤖 **AI Copilot** | Natural language Q&A powered by Groq + Llama 3 70B |
| 📤 **CSV Upload** | Drag-and-drop any compatible CSV — full re-analysis instantly |
| ⚙ **Settings** | Enter your Groq API key in-app (saved to localStorage) |

---

## 🗂️ Project Structure

```
supply-chain-copilot/
├── frontend/               # React + Vite SPA
│   ├── src/
│   │   ├── App.jsx         # Root component + navigation
│   │   ├── components/
│   │   │   ├── UI.jsx      # Shared design system (StatCard, ChartCard, Badge)
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Analytics.jsx
│   │   │   ├── Orders.jsx
│   │   │   └── Copilot.jsx # Chat interface
│   │   └── utils/
│   │       ├── data.js     # CSV parser, analytics engine, system prompt builder
│   │       └── api.js      # Backend API calls
│   └── vite.config.js      # Dev proxy → backend
├── backend/                # Express.js API proxy
│   ├── server.js           # Groq proxy endpoint
│   └── .env.example        # Environment variables template
├── netlify.toml            # Netlify deploy config
└── README.md
```

---

## ⚙️ Local Development

### Prerequisites
- Node.js 18+
- A free Groq API key: [console.groq.com/keys](https://console.groq.com/keys)

### 1 — Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/supply-chain-copilot.git
cd supply-chain-copilot
npm run install:all
```

### 2 — Configure Backend

```bash
cd backend
cp .env.example .env
# Edit .env and paste your Groq key:
# GROQ_API_KEY=gsk_your_key_here
```

### 3 — Run Both Servers

```bash
# From the root folder:
npm run dev
```

- Frontend: http://localhost:5173
- Backend:  http://localhost:3001

---

## 🌐 Deploy to GitHub + Netlify

### Step 1 — Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/supply-chain-copilot.git
git push -u origin main
```

### Step 2 — Deploy Backend (Render — free tier)

1. Go to [render.com](https://render.com) → **New Web Service**
2. Connect your GitHub repo
3. Set:
   - **Root directory:** `backend`
   - **Build command:** `npm install`
   - **Start command:** `npm start`
4. Add environment variable: `GROQ_API_KEY=gsk_your_key_here`
5. Copy the deployed URL e.g. `https://supply-chain-api.onrender.com`

### Step 3 — Deploy Frontend (Netlify)

1. Go to [netlify.com](https://netlify.com) → **Add new site** → Import from GitHub
2. Settings are auto-detected from `netlify.toml`:
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/dist`
3. In `netlify.toml`, replace the proxy URL:
   ```toml
   to = "https://supply-chain-api.onrender.com/api/:splat"
   ```
4. Deploy!

---

## 📄 CSV Format

Your CSV must include these columns:

```
Order_ID, Product, Warehouse, Order_Date, Ship_Date, Delivery_Date, Category, Quantity, Priority
```

Dates should be in `YYYY-MM-DD` format.

---

## 🧠 AI Architecture

```
User Question
     │
     ▼
Frontend (Copilot.jsx)
  - Builds system prompt from current dataset stats
  - Sends to /api/chat
     │
     ▼
Backend (server.js)
  - Injects Groq API key
  - Calls Groq → Llama 3 70B
     │
     ▼
Groq Cloud (llama3-70b-8192)
     │
     ▼
AI Reply → rendered in chat UI
```

The system prompt contains a full statistical summary of the loaded dataset so the model can answer accurately without needing to process raw CSV.

---

## ⚠️ Known Limitations

1. **No persistent memory** — each question sends the full dataset summary as a fresh system prompt. The AI has no memory between sessions.
2. **Token limit on large datasets** — the system prompt scales with dataset size. Very large CSVs (10k+ orders) may truncate the context. A production system would use vector embeddings + RAG for semantic search over raw order records.
3. **Backend required for Groq** — Groq does not support browser-side API calls (CORS restriction), so a backend proxy is required even for simple use cases.

---

## 🛠️ Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18, Vite, Recharts |
| Backend | Node.js, Express, groq-sdk |
| AI Model | Groq · Llama 3 70B (`llama3-70b-8192`) |
| Deploy | Netlify (frontend) + Render (backend) |

---

## 📝 License

MIT
