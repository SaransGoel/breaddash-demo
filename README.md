# 🍞 BreadDash — AI WhatsApp Delivery Bot

A full-stack AI-powered WhatsApp ordering bot for doorstep grocery delivery. Built for a real society delivery business in India.

**[Live Demo](https://breaddash-demo.onrender.com)** · **[Dashboard](https://breaddash-demo.onrender.com/dashboard)**

---

## What it does

Customers message a WhatsApp number. An AI bot called **Bunny** takes their order, answers questions from real database context, confirms their address, and arranges payment. Orders appear on a live dashboard for the delivery operator.

### Customer experience
1. Customer sends any WhatsApp message
2. Bot greets them, collects name + flat number (once, saved forever)
3. Bot shows categorised product menu
4. Customer picks items → cart builds up with running total
5. Customer confirms → bot confirms address → order placed
6. Order appears on BreadDash dashboard instantly

### Bot intelligence
The LLM (Groq Llama 3.3 70B) receives the customer's **full Firebase context** before every reply:
- Customer profile (name, flat, order count)
- Complete order history with statuses
- Current cart contents
- Live product menu
- Active deals

So when a customer asks *"did my order get delivered?"* or *"what's my address?"* — the bot answers from real data, not a script.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Server | Node.js + Express |
| AI Model | Groq — Llama 3.3 70B (free tier) |
| Database | Firebase Firestore |
| WhatsApp | Twilio WhatsApp API |
| Hosting | Render.com |
| Payments | Razorpay (COD + UPI) |
| Dashboard | Vanilla JS + HTML |
| CI/CD | GitHub → Render auto-deploy |

---

## Run locally (5 minutes)

```bash
git clone https://github.com/SaransGoel/breaddash-demo.git
cd breaddash-demo
npm install
cp .env.example .env   # Add Groq key for live AI (optional)
npm start
```

Open `http://localhost:3000` for the landing page.
Open `http://localhost:3000/dashboard` for the dashboard.

Dashboard login: `admin` / `breaddash123`

---

## Demo vs Production

This repo is the **public demo** — it uses in-memory fake data so no credentials are needed.

The production system additionally has:
- Real Firebase Firestore database (orders persist)
- Real Twilio WhatsApp integration (actual WhatsApp messages)
- Full customer profile persistence
- Morning broadcast reminders via cron
- UptimeRobot monitoring

---

## Project Structure

```
breaddash-demo/
├── server.js        ← Express server + demo API endpoints
├── dashboard.html   ← Full management dashboard
├── index.html       ← Portfolio landing page
├── package.json
├── .env.example
└── README.md
```

---

## Features

- **AI Conversation** — context-aware, not script-based
- **Product Catalog** — categorised by type (Bread, Dairy, Eggs)
- **Cart Management** — add items, view cart, modify before checkout
- **Customer Profiles** — name, address, order history stored
- **Order Management** — confirm, dispatch, deliver from dashboard
- **Support Queue** — customers can request human agent
- **Broadcast** — send WhatsApp messages to all customers
- **Export CSV** — download all orders
- **Zero budget trial** — runs on free tiers (₹0/month)

---

## License

MIT — feel free to use, modify, and deploy.

---

*Built by Sarans Goel*
