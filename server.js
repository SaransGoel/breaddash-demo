// BreadDash Demo Server — Safe for public GitHub
// Uses demo mode: no real Firebase writes, simulated responses
require('dotenv').config();
const express    = require('express');
const bodyParser = require('body-parser');
const cors       = require('cors');
const path       = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// ── SERVE DEMO DASHBOARD ──────────────────────────────
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/dashboard', (req, res) => res.sendFile(path.join(__dirname, 'dashboard.html')));

// ── DEMO API — returns fake data ──────────────────────
const demoOrders = [
  { orderId:'ORD-DEMO1', flatNumber:'A-204', phone:'+91987654****', items:[{name:'White Bread',qty:2,price:45}], total:90, paymentMode:'cod', status:'delivered', createdAt:{seconds: Math.floor(Date.now()/1000)-3600} },
  { orderId:'ORD-DEMO2', flatNumber:'B-110', phone:'+91876543****', items:[{name:'Eggs 6pcs',qty:1,price:54},{name:'Brown Bread',qty:1,price:55}], total:109, paymentMode:'cod', status:'confirmed', createdAt:{seconds: Math.floor(Date.now()/1000)-1800} },
  { orderId:'ORD-DEMO3', flatNumber:'C-302', phone:'+91765432****', items:[{name:'Full Cream Milk',qty:2,price:62}], total:124, paymentMode:'cod', status:'out_for_delivery', createdAt:{seconds: Math.floor(Date.now()/1000)-900} },
  { orderId:'ORD-DEMO4', flatNumber:'D-508', phone:'+91654321****', items:[{name:'Pav 6pcs',qty:3,price:25}], total:75, paymentMode:'cod', status:'confirmed', createdAt:{seconds: Math.floor(Date.now()/1000)-600} },
  { orderId:'ORD-DEMO5', flatNumber:'A-405', phone:'+91543210****', items:[{name:'Multigrain Bread',qty:1,price:70}], total:70, paymentMode:'cod', status:'delivered', createdAt:{seconds: Math.floor(Date.now()/1000)-7200} },
];

const demoProducts = [
  { id:'p1', name:'White Bread (400g)',   emoji:'🍞', price:45,  unit:'loaf',   active:true },
  { id:'p2', name:'Brown Bread (400g)',   emoji:'🍫', price:55,  unit:'loaf',   active:true },
  { id:'p3', name:'Multigrain Bread',     emoji:'🥐', price:70,  unit:'loaf',   active:true },
  { id:'p4', name:'Pav (6 pcs)',          emoji:'🍔', price:25,  unit:'pack',   active:true },
  { id:'p5', name:'Bun Pack (4 pcs)',     emoji:'🫓', price:30,  unit:'pack',   active:true },
  { id:'p6', name:'Full Cream Milk (1L)', emoji:'🥛', price:62,  unit:'litre',  active:true },
  { id:'p7', name:'Toned Milk (500ml)',   emoji:'🥛', price:28,  unit:'bottle', active:true },
  { id:'p8', name:'Eggs (6 pcs)',         emoji:'🥚', price:54,  unit:'tray',   active:true },
  { id:'p9', name:'Eggs (12 pcs)',        emoji:'🥚', price:102, unit:'tray',   active:false },
];

const demoCustomers = [
  { name:'Ramesh K.', phone:'+91987654****', flatNumber:'A-204', totalOrders:12, totalSpend:1080, isFirstTime:false },
  { name:'Priya S.',  phone:'+91876543****', flatNumber:'B-110', totalOrders:8,  totalSpend:872,  isFirstTime:false },
  { name:'Arjun T.',  phone:'+91765432****', flatNumber:'C-302', totalOrders:3,  totalSpend:327,  isFirstTime:false },
  { name:'Neha R.',   phone:'+91654321****', flatNumber:'D-508', totalOrders:1,  totalSpend:75,   isFirstTime:true  },
];

app.get('/api/health', (req, res) => res.json({
  server:   { status:'ok', uptime: Math.floor(process.uptime())+'s', mode:'demo' },
  twilio:   { status:'configured' },
  groq:     { status:'configured' },
  firebase:  { status:'ok' },
  razorpay: { status:'test_mode' },
}));

app.get('/api/orders', (req, res) => res.json({ success:true, orders: demoOrders, demo:true }));
app.patch('/api/orders/:id', (req, res) => {
  const o = demoOrders.find(x => x.orderId === req.params.id);
  if(o) o.status = req.body.status;
  res.json({ success:true, demo:true });
});

app.get('/api/products', (req, res) => res.json({ success:true, products: demoProducts, demo:true }));
app.patch('/api/products/:id', (req, res) => {
  const p = demoProducts.find(x => x.id === req.params.id);
  if(p) Object.assign(p, req.body);
  res.json({ success:true, demo:true });
});
app.post('/api/products', (req, res) => {
  demoProducts.push({ id:'p'+Date.now(), ...req.body, active:true });
  res.json({ success:true, demo:true });
});

app.get('/api/customers', (req, res) => res.json({ success:true, customers: demoCustomers, demo:true }));
app.get('/api/waitlist', (req, res) => res.json({ success:true, waitlist:[], demo:true }));
app.patch('/api/waitlist/:phone', (req, res) => res.json({ success:true, demo:true }));

app.post('/api/broadcast', (req, res) => res.json({ success:true, sent: demoCustomers.length, demo:true }));

// ── WHATSAPP WEBHOOK DEMO ────────────────────────────
app.post('/webhook/whatsapp', async (req, res) => {
  const body = req.body.Body?.trim() || '';
  // Demo bot response using Groq if key provided, else static
  const GROQ_KEY = process.env.GROQ_API_KEY;
  let reply = getDemoReply(body);
  if(GROQ_KEY && GROQ_KEY !== 'demo') {
    try {
      const Groq = require('groq-sdk');
      const groq = new Groq({ apiKey: GROQ_KEY });
      const res2 = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role:'system', content:`You are Bunny, the AI assistant for GC11 DoorDash, a doorstep delivery service. This is a DEMO. Menu: White Bread ₹45, Brown Bread ₹55, Eggs ₹54, Milk ₹62, Pav ₹25. Be professional and helpful. Note this is a portfolio demo. Keep replies under 4 lines.` },
          { role:'user', content: body }
        ],
        max_tokens: 200,
        temperature: 0.6,
      });
      reply = res2.choices[0]?.message?.content || reply;
    } catch(e) { /* fall through to static reply */ }
  }
  // Twilio TwiML response
  res.type('text/xml').send(`<?xml version="1.0" encoding="UTF-8"?><Response><Message>${reply}</Message></Response>`);
});

function getDemoReply(msg) {
  const m = msg.toLowerCase();
  if(/^(hi|hello|hey|start)/.test(m)) return `Welcome to GC11 DoorDash! 👋\n\nI'm Bunny, your AI ordering assistant.\n\nType MENU to see today's products or ORDER to place an order.`;
  if(/menu|catalog|what/.test(m)) return `Today's Menu:\n\n🍞 White Bread (400g) — ₹45\n🍫 Brown Bread (400g) — ₹55\n🥚 Eggs (6 pcs) — ₹54\n🥛 Full Cream Milk (1L) — ₹62\n🍔 Pav (6 pcs) — ₹25\n\nReply with item to order!`;
  if(/order|buy|want/.test(m)) return `Great! What would you like to order?\n\nReply with the item name and quantity.\nExample: "2 White Bread"\n\nDelivery by 10:00 AM daily.`;
  if(/deal|offer|discount/.test(m)) return `Today's Offers:\n• Buy 2 White Bread → get Pav FREE!\n• First order → FREE Pav pack\n• Daily subscription → 10% off every order`;
  if(/pay|payment/.test(m)) return `We currently accept:\n• Cash on Delivery\n• UPI at door (agent carries QR code)\n\nOnline payment links coming soon!`;
  return `I'm Bunny, the GC11 DoorDash assistant!\n\nThis is a portfolio demo.\n\nTry: MENU, ORDER, or DEALS to see me in action! 🍞`;
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`\n🍞 BreadDash DEMO running on port ${PORT}\n📊 Dashboard: http://localhost:${PORT}/dashboard\n`));

// ── CHAT PAGE ─────────────────────────────────────────────
app.get('/chat', (req, res) => res.sendFile(path.join(__dirname, 'chat.html')));

// ── CHAT API — powers the web demo bot ───────────────────
app.post('/api/chat', async (req, res) => {
  const { message, history = [], context = {} } = req.body;
  const GROQ_KEY = process.env.GROQ_API_KEY;

  const systemPrompt = `You are Bunny, the professional AI ordering assistant for GC11 DoorDash, a doorstep grocery delivery service serving 11th Avenue society.

CUSTOMER CONTEXT:
- Name: ${context.customerName || 'Customer'}
- Flat/Address: ${context.flatNumber || 'Not provided yet'}
- Current cart: ${context.cart || 'empty'}
- First time ordering: ${context.isFirstTime ? 'Yes' : 'No'}

TODAY'S MENU:
${context.menu || '1. White Bread ₹45\n2. Brown Bread ₹55\n3. Eggs ₹54\n4. Milk ₹62'}

ACTIVE DEALS:
• Buy 2 White Bread → get Pav FREE
• First order → FREE Pav pack
• Daily subscription → 10% off

DELIVERY: Order before 9 AM → delivered by 10 AM daily
PAYMENT: Cash on Delivery or UPI at door. No advance payment needed.

THIS IS A PORTFOLIO DEMO — make it impressive! Show the full capabilities of the bot.

YOUR BEHAVIOUR:
- Professional, warm, concise — max 6 lines per reply
- Answer questions using the context above
- Guide customers naturally through: browse → add to cart → confirm address → place order
- If customer gives flat number, acknowledge it and save it mentally
- Create gentle urgency: "Only 8 Brown Breads left today!"
- For cart questions: reference the cart contents above
- Never make up products not in the menu
- If order is being confirmed: ask for flat number if not set, then confirm`;

  if (!GROQ_KEY || GROQ_KEY === 'demo') {
    // Static fallback
    return res.json({ reply: getStaticReply(message, context), demo: true });
  }

  try {
    const Groq = require('groq-sdk');
    const groq = new Groq({ apiKey: GROQ_KEY });
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        ...history,
        { role: 'user', content: message }
      ],
      max_tokens: 280,
      temperature: 0.6,
    });
    res.json({ reply: completion.choices[0]?.message?.content?.trim() || getStaticReply(message, context) });
  } catch(e) {
    console.error('[Chat API]', e.message);
    res.json({ reply: getStaticReply(message, context), error: e.message });
  }
});

function getStaticReply(msg, ctx) {
  const m = (msg||'').toLowerCase();
  if (/^(hi|hello|hey|start)/.test(m)) return `Welcome to GC11 DoorDash! 👋\n\nI'm Bunny, your AI assistant.\n\nBrowse the menu on the left and click + to add items, or type MENU to see everything. What would you like today?`;
  if (/menu|catalog|products/.test(m)) return `Today's Menu:\n\n🍞 White Bread (400g) — ₹45\n🍫 Brown Bread (400g) — ₹55\n🥐 Multigrain Bread — ₹70\n🍔 Pav (6 pcs) — ₹25\n🥛 Full Cream Milk (1L) — ₹62\n🥚 Eggs (6 pcs) — ₹54\n\nClick any item on the left to add to cart!`;
  if (/deal|offer|discount/.test(m)) return `Today's Offers:\n\n🎁 Buy 2 White Bread → get Pav FREE\n🎉 First order → FREE Pav pack\n📅 Subscribe daily → 10% off every order\n\nWant to grab a deal?`;
  if (/pay|payment/.test(m)) return `Payment is simple!\n\n💵 Cash at door — pay when we arrive\n📱 UPI/QR code — our agent carries one\n\nNo advance payment needed. Ready to order?`;
  if (/deliver|time|when/.test(m)) return `Delivery Schedule:\n\n⏰ Order before 9 AM → by 10 AM\n🚪 Doorstep delivery to your flat\n📍 Serving all of 11th Avenue\n\nShall I help you place an order?`;
  if (/cart/.test(m) && ctx.cart && ctx.cart !== 'empty') return `Your current cart:\n${ctx.cart}\n\nType CONFIRM to place the order, or keep adding items!`;
  return `I'm here to help! 🍞\n\nTry:\n• Type MENU to see products\n• Click items on the left to add to cart\n• Type DEALS for today's offers\n• Type CONFIRM to place your order`;
}
