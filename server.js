// BreadDash Demo Server — Safe for public GitHub
require('dotenv').config();
const express    = require('express');
const bodyParser = require('body-parser');
const cors       = require('cors');
const path       = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// ── PAGES ─────────────────────────────────────────────────
app.get('/',          (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/chat',      (req, res) => res.sendFile(path.join(__dirname, 'chat.html')));
app.get('/dashboard', (req, res) => res.sendFile(path.join(__dirname, 'dashboard.html')));

// ── DEMO DATA ─────────────────────────────────────────────
const demoOrders = [
  { orderId:'ORD-DEMO1', flatNumber:'A-204', phone:'+91987654****', items:[{name:'White Bread',qty:2,price:45}], total:90,  paymentMode:'cod', status:'delivered',       createdAt:{seconds: Math.floor(Date.now()/1000)-3600} },
  { orderId:'ORD-DEMO2', flatNumber:'B-110', phone:'+91876543****', items:[{name:'Eggs 6pcs',qty:1,price:54},{name:'Brown Bread',qty:1,price:55}], total:109, paymentMode:'cod', status:'confirmed', createdAt:{seconds: Math.floor(Date.now()/1000)-1800} },
  { orderId:'ORD-DEMO3', flatNumber:'C-302', phone:'+91765432****', items:[{name:'Full Cream Milk',qty:2,price:62}], total:124, paymentMode:'cod', status:'out_for_delivery', createdAt:{seconds: Math.floor(Date.now()/1000)-900} },
  { orderId:'ORD-DEMO4', flatNumber:'D-508', phone:'+91654321****', items:[{name:'Pav 6pcs',qty:3,price:25}], total:75,  paymentMode:'cod', status:'confirmed',       createdAt:{seconds: Math.floor(Date.now()/1000)-600} },
  { orderId:'ORD-DEMO5', flatNumber:'A-405', phone:'+91543210****', items:[{name:'Multigrain Bread',qty:1,price:70}], total:70, paymentMode:'cod', status:'delivered', createdAt:{seconds: Math.floor(Date.now()/1000)-7200} },
];

const demoProducts = [
  { id:'p1', name:'White Bread (400g)',   emoji:'🍞', price:45,  unit:'loaf',   active:true  },
  { id:'p2', name:'Brown Bread (400g)',   emoji:'🍫', price:55,  unit:'loaf',   active:true  },
  { id:'p3', name:'Multigrain Bread',     emoji:'🥐', price:70,  unit:'loaf',   active:true  },
  { id:'p4', name:'Pav (6 pcs)',          emoji:'🍔', price:25,  unit:'pack',   active:true  },
  { id:'p5', name:'Bun Pack (4 pcs)',     emoji:'🫓', price:30,  unit:'pack',   active:true  },
  { id:'p6', name:'Full Cream Milk (1L)', emoji:'🥛', price:62,  unit:'litre',  active:true  },
  { id:'p7', name:'Toned Milk (500ml)',   emoji:'🥛', price:28,  unit:'bottle', active:true  },
  { id:'p8', name:'Eggs (6 pcs)',         emoji:'🥚', price:54,  unit:'tray',   active:true  },
  { id:'p9', name:'Eggs (12 pcs)',        emoji:'🥚', price:102, unit:'tray',   active:false },
];

const demoCustomers = [
  { name:'Ramesh K.', phone:'+91987654****', flatNumber:'A-204', totalOrders:12, totalSpend:1080, isFirstTime:false },
  { name:'Priya S.',  phone:'+91876543****', flatNumber:'B-110', totalOrders:8,  totalSpend:872,  isFirstTime:false },
  { name:'Arjun T.',  phone:'+91765432****', flatNumber:'C-302', totalOrders:3,  totalSpend:327,  isFirstTime:false },
  { name:'Neha R.',   phone:'+91654321****', flatNumber:'D-508', totalOrders:1,  totalSpend:75,   isFirstTime:true  },
];

// ── HEALTH ────────────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({
  server:   { status:'ok', uptime: Math.floor(process.uptime())+'s', mode:'demo' },
  twilio:   { status:'configured' },
  groq:     { status: process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'demo' ? 'configured' : 'demo_mode' },
  firebase: { status:'ok' },
  razorpay: { status:'test_mode' },
}));

// ── ORDERS API ────────────────────────────────────────────
app.get('/api/orders', (req, res) => res.json({ success:true, orders: demoOrders }));

// Add this new POST route:
app.post('/api/orders', (req, res) => {
  const newOrder = {
    orderId: req.body.orderId,
    flatNumber: req.body.flatNumber,
    phone: '+91999999****', // Mock phone for demo
    items: req.body.items,
    total: req.body.total,
    paymentMode: 'cod',
    status: 'confirmed',
    createdAt: { seconds: Math.floor(Date.now() / 1000) }
  };
  demoOrders.unshift(newOrder); // Add to the beginning of the array
  res.json({ success: true, order: newOrder });
});

app.patch('/api/orders/:id', (req, res) => { // ... existing code
  
// ── PRODUCTS API ──────────────────────────────────────────
app.get('/api/products', (req, res) => res.json({ success:true, products: demoProducts }));
app.patch('/api/products/:id', (req, res) => {
  const p = demoProducts.find(x => x.id === req.params.id);
  if (p) Object.assign(p, req.body);
  res.json({ success:true });
});
app.post('/api/products', (req, res) => {
  demoProducts.push({ id:'p'+Date.now(), ...req.body, active:true });
  res.json({ success:true });
});

// ── CUSTOMERS API ─────────────────────────────────────────
app.get('/api/customers', (req, res) => res.json({ success:true, customers: demoCustomers }));

// ── WAITLIST API ──────────────────────────────────────────
app.get('/api/waitlist',        (req, res) => res.json({ success:true, waitlist:[] }));
app.patch('/api/waitlist/:id',  (req, res) => res.json({ success:true }));

// ── BROADCAST API ─────────────────────────────────────────
app.post('/api/broadcast', (req, res) => res.json({ success:true, sent: demoCustomers.length, demo:true }));

// ── CHAT API (powers the /chat demo page) ─────────────────
app.post('/api/chat', async (req, res) => {
  const { message = '', history = [], context = {} } = req.body;
  const GROQ_KEY = process.env.GROQ_API_KEY;

  // Use Groq AI if key is set, else use smart static fallback
  if (GROQ_KEY && GROQ_KEY !== 'demo') {
    try {
      const Groq = require('groq-sdk');
      const groq = new Groq({ apiKey: GROQ_KEY });
      const completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role:'system', content:`You are Bunny, the professional AI assistant for GC11 DoorDash, a doorstep grocery delivery service.

CUSTOMER: ${context.customerName||'Customer'} | Flat: ${context.flatNumber||'Not set'} | Cart: ${context.cart||'empty'}

TODAY'S MENU:
${context.menu||'White Bread ₹45, Brown Bread ₹55, Eggs ₹54, Milk ₹62, Pav ₹25'}

DEALS: Buy 2 White Bread → Pav FREE | First order → Free Pav | Subscribe → 10% off
DELIVERY: Order before 9 AM → delivered by 10 AM
PAYMENT: Cash on Delivery or UPI at door

This is a PORTFOLIO DEMO — be impressive! Be professional, warm, concise. Max 5 lines.
Guide customer: browse → add to cart → confirm → order placed.` },
          ...history,
          { role:'user', content: message }
        ],
        max_tokens: 250,
        temperature: 0.6,
      });
      return res.json({ reply: completion.choices[0]?.message?.content?.trim() });
    } catch(e) {
      console.error('[Groq]', e.message);
    }
  }

  // Static fallback
  res.json({ reply: staticReply(message, context) });
});

function staticReply(msg, ctx) {
  const m = (msg||'').toLowerCase();
  if (/^(hi|hello|hey|start|namaste)/.test(m))
    return `Welcome to GC11 DoorDash! 👋\n\nI'm Bunny, your AI ordering assistant.\n\nBrowse the menu on the left and click + to add items, or type MENU to get started!`;
  if (/menu|catalog|what|products|items/.test(m))
    return `Today's Menu:\n\n🍞 White Bread (400g) — ₹45\n🍫 Brown Bread (400g) — ₹55\n🥐 Multigrain Bread — ₹70\n🍔 Pav (6 pcs) — ₹25\n🥛 Full Cream Milk (1L) — ₹62\n🥚 Eggs (6 pcs) — ₹54\n\nClick any item on the left to add to cart!`;
  if (/deal|offer|discount|free/.test(m))
    return `Today's Offers:\n\n🎁 Buy 2 White Bread → get Pav FREE!\n🎉 First order → FREE Pav pack\n📅 Daily subscription → 10% off every order\n\nWant to grab a deal?`;
  if (/deliver|time|when|how long/.test(m))
    return `Delivery Details:\n\n⏰ Order before 9:00 AM → Delivered by 10:00 AM\n🚪 Doorstep delivery to your flat\n📍 Serving 11th Avenue society\n\nReady to order?`;
  if (/pay|payment|upi|cash/.test(m))
    return `Payment Options:\n\n💵 Cash on Delivery — pay at your door\n📱 UPI — our agent carries a QR code\n\nNo advance payment needed! Ready to place an order?`;
  if (/cart|bag/.test(m))
    return ctx.cart && ctx.cart !== 'empty'
      ? `Your cart:\n${ctx.cart}\n\nType CONFIRM to place the order!`
      : `Your cart is empty.\n\nBrowse the menu on the left or type MENU to see products.`;
  if (/confirm|checkout|place|yes/.test(m))
    return `Please provide your flat number to confirm the order!\n\nExample: "A-204" or "Tower B, Flat 102"`;
  if (/reset|restart/.test(m))
    return `Starting fresh! 🔄\n\nWelcome to GC11 DoorDash! Type MENU to browse or click items on the left.`;
  if (/human|agent|support/.test(m))
    return `I've added you to our support queue! 🙋\n\nA team member will contact you shortly.\nRef: WL-${Date.now().toString(36).toUpperCase()}`;
  if (/address|my flat|where/.test(m))
    return ctx.flatNumber && ctx.flatNumber !== 'Not set'
      ? `Your delivery address is: ${ctx.flatNumber} 📍\n\nIs this correct for your next order?`
      : `I don't have your flat number yet. Please share it when placing an order!`;
  return `I'm here to help! 🍞\n\n• Type MENU to see products\n• Click items on the left to add to cart\n• Type DEALS for today's offers\n• Type CONFIRM to place your order`;
}

// ── START ─────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🍞 BreadDash DEMO running on port ${PORT}`);
  console.log(`   Landing:   http://localhost:${PORT}`);
  console.log(`   Chat:      http://localhost:${PORT}/chat`);
  console.log(`   Dashboard: http://localhost:${PORT}/dashboard\n`);
});
