# MarketXpress AI

**Design and Implementation of an Intelligent Budget-Aware Marketplace System for Automated Food Market Negotiation**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-14+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![Express](https://img.shields.io/badge/Express.js-4.0+-lightgrey.svg)](https://expressjs.com/)

## Overview

MarketXpress AI is a **conversational AI-powered marketplace platform** that automates food market price negotiations through a simple chat interface. Users interact with the system exactly like ChatGPT — type what they want to buy and their budget, and the **Decider Engine** handles the rest:

1. **User types:** *"I want to buy items for cooking soup with a budget of ₦6,500"*
2. **System processes:** Identifies needed ingredients, queries all vendors, optimizes pricing
3. **Notifications sent:** Both buyer and seller receive deal proposals
4. **Upon confirmation:** QR code generated for seamless market checkout

Designed for **students and low-income buyers in Nigeria** who struggle with inconsistent pricing, pressure-based bargaining, and time-consuming multi-stall shopping. Vendors benefit from reduced spoilage and better demand signals.

---

## How It Works: The Complete Flow

### Buyer Experience (ChatGPT-Style)

```
┌─────────────────────────────────────────────────────────────┐
│                    USER LOGIN                                │
│            (Redirected to Chat Interface)                   │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Chat Window (Blank/Ready)                                  │
│                                                               │
│  Type your message...                                        │
│  [I want to buy pepper, rice, and beans with ₦5,000]        │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│                    SYSTEM PROCESSES                           │
│                                                               │
│  1. NLP: Parse intent, items, budget                         │
│  2. Database: Query all vendor inventories                   │
│  3. Decider Engine: Run optimization algorithm               │
│  4. Negotiation: Generate fair deal proposals                │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│                  SYSTEM RESPONDS IN CHAT                      │
│                                                               │
│  System: "Great! I found the best deals for you 🎯           │
│                                                               │
│  📊 OPTIMIZED DEAL:                                         │
│  • Pepper 2kg from Vendor A @ ₦500/kg = ₦1,000             │
│  • Rice 2kg from Vendor B @ ₦650/kg = ₦1,300               │
│  • Beans 1kg from Vendor C @ ₦400/kg = ₦400                │
│                                                               │
│  💰 Total: ₦2,700 (Save ₦2,300!)                           │
│                                                               │
│  Ready to proceed? Just say 'Yes'!"                          │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│                   BUYER CONFIRMS                              │
│                                                               │
│  User: "Yes, let's do it"                                   │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│              NOTIFICATIONS SENT (Real-time)                  │
│                                                               │
│  📲 BUYER NOTIFICATION:                                     │
│     ✅ Deal confirmed! Vendors have been notified.          │
│     QR codes ready. Head to the market now!                 │
│     [Show QR Code]                                           │
│                                                               │
│  📲 VENDOR A NOTIFICATION:                                  │
│     New order: Pepper 2kg @ ₦500/kg (₦1,000)               │
│     Accept or Reject? [Accept] [Reject]                     │
│                                                               │
│  📲 VENDOR B NOTIFICATION:                                  │
│     New order: Rice 2kg @ ₦650/kg (₦1,300)                 │
│     Accept or Reject? [Accept] [Reject]                     │
│                                                               │
│  📲 VENDOR C NOTIFICATION:                                  │
│     New order: Beans 1kg @ ₦400/kg (₦400)                  │
│     Accept or Reject? [Accept] [Reject]                     │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│              BOTH PARTIES CONFIRM                             │
│                                                               │
│  Vendors: [Tap Accept]                                       │
│  Buyer: Chat updates → "All vendors confirmed! ✅"          │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│              QR CODES GENERATED                               │
│                                                               │
│  System: "All set! Here are your QR codes:                  │
│                                                               │
│  [Vendor A - QR Code]  Pepper @ Stall 5                     │
│  [Vendor B - QR Code]  Rice @ Stall 12                      │
│  [Vendor C - QR Code]  Beans @ Stall 8                      │
│                                                               │
│  Just scan at each vendor. No haggling needed! 😊"          │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Key Features

### 💬 For Buyers
- **ChatGPT-like Interface** — Natural language: *"I want to cook egusi soup with ₦6,500"* or *"I need 2kg pepper, 1kg rice"*
- **Instant Optimization** — Decider Engine finds best prices across ALL vendors in seconds
- **Transparent Proposals** — See exactly what was negotiated and why
- **Smart Budget Management** — Automatic quantity estimation based on dish/budget
- **One-Tap Confirmation** — Approve in chat, instant notifications
- **QR Code Checkout** — Scan at vendors, zero friction at market
- **Chat History** — Full conversation record for reference

### 🏪 For Vendors
- **Simple Setup** — Add products once with price ranges (advertised vs. minimum)
- **Smart Matching** — Only matched with buyers whose budgets work for you
- **Instant Notifications** — See orders in real-time, accept/reject in 1 tap
- **Daily Updates** — Manage inventory to reduce spoilage
- **Order Stream** — Consistent customer flow without standing at stall

### ⚡ Platform Features
- **NLP Intent Parsing** — Understands various ways to express what you want to buy
- **Decider Engine** — Constraint-based optimization across N vendors
- **Real-Time Notifications** — Push alerts via Socket.io
- **QR Code Generation** — Unique codes per transaction
- **Fair Negotiation** — Vendors never forced below minimum prices
- **Secure JWT Auth** — Protected buyer/vendor data
- **Chat Persistence** — All messages stored for audit trail

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18+, Axios, React Router, Tailwind CSS |
| **Backend** | Express.js (Node.js 14+), Socket.io |
| **NLP** | OpenAI GPT API (or Rasa for self-hosted) |
| **Optimization** | Custom constraint solver (JavaScript) |
| **Database** | MongoDB (flexible for chat, deals, products) |
| **Real-Time** | Socket.io (notifications & live chat) |
| **Authentication** | JWT (JSON Web Tokens) |
| **QR Codes** | qrcode.react (React) + qrcode (Node) |
| **Notifications** | Firebase Cloud Messaging (or custom) |
| **Deployment** | Docker, Vercel (frontend), Railway/Render (backend) |

---

## Quick Start

**Get running in 5 minutes:**

```bash
# Clone and setup
git clone https://github.com/yourusername/marketxpress-ai.git
cd marketxpress-ai

# Backend (Terminal 1)
cd backend
npm install
cp .env.example .env
# Add OPENAI_API_KEY, MONGODB_URI to .env
npm run dev

# Frontend (Terminal 2)
cd frontend
npm install
cp .env.example .env
npm start
```

✅ Backend API at `http://localhost:5000`  
✅ React app at `http://localhost:3000`  
✅ Start chatting!

---

## Installation & Setup

### Prerequisites
- Node.js 14+ and npm
- MongoDB 4.4+ (local or Atlas)
- OpenAI API key
- Git

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

**Configure `.env`:**
```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/marketxpress

# Authentication
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=7d

# AI/NLP
OPENAI_API_KEY=sk-your-openai-api-key

# Frontend
CORS_ORIGIN=http://localhost:3000
SOCKET_IO_ORIGIN=http://localhost:3000

# Notifications (Optional)
FIREBASE_PROJECT_ID=your-firebase-project
```

**Start:**
```bash
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
```

**Configure `.env`:**
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SOCKET_URL=http://localhost:5000
REACT_APP_ENV=development
```

**Start:**
```bash
npm start
```

### Docker (Optional)
```bash
docker-compose up --build
```

---

## Project Structure

```
marketxpress-ai/
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.js               # Login/Register endpoints
│   │   │   ├── chat.js               # Chat message routes
│   │   │   └── deals.js              # Deal confirmation routes
│   │   ├── models/
│   │   │   ├── User.js               # Buyer & Vendor (combined)
│   │   │   ├── ChatMessage.js        # Conversation history
│   │   │   ├── Product.js            # Vendor products
│   │   │   ├── Deal.js               # Completed deals
│   │   │   └── Notification.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── chatController.js     # Message handling
│   │   │   ├── dealController.js     # Deal logic
│   │   │   └── notificationController.js
│   │   ├── services/
│   │   │   ├── nlpService.js         # NLP intent parsing
│   │   │   ├── deciderEngine.js      # Optimization algorithm ⭐
│   │   │   ├── negotiationService.js # Fair deal generation
│   │   │   ├── notificationService.js # Push notifications
│   │   │   └── qrService.js          # QR code generation
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   └── errorHandler.js
│   │   ├── utils/
│   │   │   ├── validators.js
│   │   │   └── helpers.js
│   │   ├── socket/
│   │   │   └── socketHandler.js      # Real-time chat/notifications
│   │   └── app.js
│   ├── tests/
│   │   ├── deciderEngine.test.js
│   │   ├── nlpService.test.js
│   │   └── api.test.js
│   ├── .env.example
│   ├── package.json
│   ├── server.js
│   └── docker-compose.yml
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatWindow.jsx        # Main chat interface ⭐
│   │   │   ├── MessageBubble.jsx     # Message display
│   │   │   ├── DealProposal.jsx      # Embedded deal cards
│   │   │   ├── QRCodeDisplay.jsx     # QR modal
│   │   │   ├── NotificationCenter.jsx # Toast alerts
│   │   │   └── VendorDashboard.jsx   # Vendor setup
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── ChatPage.jsx          # Main buyer experience
│   │   │   └── VendorSetup.jsx
│   │   ├── services/
│   │   │   ├── api.js                # Axios instance
│   │   │   ├── authService.js
│   │   │   └── socketService.js      # WebSocket
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   ├── ChatContext.jsx       # Conversation state
│   │   │   └── NotificationContext.jsx
│   │   ├── App.jsx
│   │   └── index.js
│   ├── .env.example
│   ├── package.json
│   └── tailwind.config.js
│
├── README.md
└── docker-compose.yml
```

---

## The Decider Engine: How It Works

### Step 1: NLP Parsing

**User Input:**
```
"I want to cook jollof rice with ₦4,000"
```

**System Parses:**
```javascript
{
  intent: "shopping",
  dish: "jollof rice",
  budget: 4000,
  items: null // Will auto-infer
}
```

**Auto-Estimation** (based on dish):
```
Jollof Rice typically needs:
  - Rice: 3kg
  - Tomatoes: 2kg
  - Peppers: 0.5kg
  - Onions: 0.5kg
  - Oil: 1 bottle
```

---

### Step 2: Vendor Query

```javascript
// Query MongoDB for all active vendors
Vendors.find({ active: true, items: {$in: ["rice", "tomatoes", ...]} })

Returns:
[
  {
    vendorId: "A",
    name: "Mama Amina's Stall",
    products: [
      { name: "rice", advertised: 750, minimum: 700, stock: 50 },
      { name: "tomatoes", advertised: 600, minimum: 550, stock: 30 }
    ]
  },
  {
    vendorId: "B",
    name: "Uncle Segun's Corner",
    products: [
      { name: "rice", advertised: 700, minimum: 680, stock: 45 },
      { name: "tomatoes", advertised: 550, minimum: 520, stock: 25 }
    ]
  },
  // ... more vendors
]
```

---

### Step 3: Optimization Algorithm

**Constraint Satisfaction Problem:**

```
Minimize: Total Cost
Subject to:
  1. Total Cost ≤ ₦4,000 (budget constraint)
  2. Rice quantity = 3kg (from estimation)
  3. For each item:
       advertised_price × 0.8 ≤ negotiated_price ≤ advertised_price
       negotiated_price ≥ vendor_minimum_price
  4. Vendor margin ≥ ₦50 (fairness: prevent exploitation)
  5. All items in stock
```

**Enumeration & Scoring:**

```
Solution 1: All from Vendor A
  Rice 3kg @ ₦700 = ₦2,100
  Tomatoes 2kg @ ₦550 = ₦1,100
  Total: ₦3,200 ✅ (within budget)
  Vendor A margin: ₦50 per unit ✅

Solution 2: Split vendors
  Rice 3kg from B @ ₦690 = ₦2,070
  Tomatoes 2kg from A @ ₦575 = ₦1,150
  Total: ₦3,220 ✅
  Margins: B=₦10 ❌ (below threshold)

Solution 3: Another split
  Rice 3kg from B @ ₦685 = ₦2,055
  Tomatoes 2kg from B @ ₦530 = ₦1,060
  Total: ₦3,115 ✅
  Margin B: ₦55 ✅

BEST: Solution 3 (lowest cost, fair margins)
```

---

### Step 4: System Generates Chat Response

```
System: "Perfect! I found the best deal for jollof rice 🍚

📊 HERE'S WHAT I NEGOTIATED:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Uncle Segun's Corner (Stall 7):
   • Rice 3kg @ ₦685/kg = ₦2,055
   • Tomatoes 2kg @ ₦530/kg = ₦1,060

TOTAL: ₦3,115
💰 You Save: ₦885 from budget!

WHY THIS DEAL?
✅ Both items from one vendor = simpler checkout
✅ Prices 10-15% below advertised (fair negotiation)
✅ Vendor still makes ₦55/unit profit (satisfied)
✅ Total within budget

Ready? Just type 'Yes' and I'll notify Uncle Segun!"
```

---

### Step 5: Notifications & Confirmation

**User Types:** "Yes"

**System Actions:**
```javascript
// 1. Create Deal in database
deal = {
  buyerId: user123,
  vendorId: "B",
  items: [
    { name: "rice", qty: 3, negotiatedPrice: 685 },
    { name: "tomatoes", qty: 2, negotiatedPrice: 530 }
  ],
  totalPrice: 3115,
  status: "awaiting_vendor_confirmation"
}

// 2. Send real-time notification to vendor
io.to(`vendor_B`).emit('new_order', {
  orderId: deal._id,
  items: "Rice 3kg + Tomatoes 2kg",
  totalAmount: "₦3,115",
  buyerName: "Chioma O."
})

// 3. Update buyer chat
Chat: "✅ Notification sent to Uncle Segun!
Waiting for confirmation... (Usually <5 minutes)"

// 4. Vendor accepts (via notification panel)
Vendor: [Accept Button Clicked]

// 5. Generate QR Code
qrCode = generateQR({
  dealId: deal._id,
  vendorId: "B",
  amount: 3115,
  items: ["rice: 3kg", "tomatoes: 2kg"]
})

// 6. Update chat with QR
Chat: "🎉 All set! Here's your QR code:
[QR Code Image]
Show this at Uncle Segun's stall (Stall 7)
He'll prepare everything for you!"
```

---

## API Endpoints

### Authentication
```
POST   /api/auth/register       # Register (buyer or vendor)
POST   /api/auth/login          # Login → returns JWT
POST   /api/auth/logout         # Logout
```

### Chat (Real-time via Socket.io)
```
WS     /socket.io               # WebSocket for live chat
POST   /api/chat/message        # Send message (REST fallback)
GET    /api/chat/history        # Get conversation history
```

### Deals
```
POST   /api/deals/create        # Create deal (from optimization)
GET    /api/deals/pending       # Pending vendor approvals
POST   /api/deals/:id/confirm   # Confirm deal (buyer/vendor)
POST   /api/deals/:id/reject    # Reject deal
GET    /api/deals/history       # Order history
GET    /api/deals/:id/qrcode    # Get QR code
```

### Vendors (Setup & Management)
```
POST   /api/vendors/products    # Add product
PUT    /api/vendors/products/:id
DELETE /api/vendors/products/:id
GET    /api/vendors/notifications  # Get pending orders
POST   /api/vendors/notifications/:id/accept
POST   /api/vendors/notifications/:id/reject
```

---

## Chat Examples

### Example 1: Dish-Based Shopping
```
User: "I want to cook egusi soup with ₦5,000"

System: "Great! For egusi soup you'll need:
• Egusi: 1kg
• Bitter leaf: 0.5kg
• Tomatoes: 2kg
• Peppers: 0.5kg
• Onions: 0.5kg

Let me find the best prices... 🔍

✅ FOUND IT!

📍 From Mama Amina's Stall:
   • Egusi 1kg @ ₦600 = ₦600
   • Bitter leaf 0.5kg @ ₦200 = ₦100
   • Tomatoes 2kg @ ₦530 = ₦1,060
   • Peppers 0.5kg @ ₦450 = ₦225
   • Onions 0.5kg @ ₦150 = ₦75

💰 Total: ₦2,060 (Save ₦2,940!)

Proceed? (Yes/Adjust quantities/Cancel)"

User: "Yes"

System: "✅ Deal confirmed!
📲 Mama Amina notified...
✅ She accepted!

🎟️ Here's your QR code: [QR Image]
Go to Mama Amina's stall. All set!"
```

### Example 2: Item-Specific Shopping
```
User: "I need 2kg pepper, 1kg rice, 0.5kg garlic. Budget is ₦3,000"

System: "Searching across 8 vendors in your area...

🏆 BEST DEAL:

Vendor B (Best prices):
  • Pepper 2kg @ ₦450/kg = ₦900
  • Rice 1kg @ ₦600/kg = ₦600
  • Garlic 0.5kg @ ₦500/kg = ₦250

Total: ₦1,750 (Under budget by ₦1,250!)

Want to proceed? Or search again?"

User: "Looks good, let's go"

System: "✅ Confirming with Vendor B...
[Real-time socket update]
✅ Confirmed in 2 seconds!

Your QR codes ready!"
```

### Example 3: Adjust on the Fly
```
User: "Actually, make it 3kg rice instead of 1kg"

System: "Recalculating...

Updated: 2kg pepper + 3kg rice + 0.5kg garlic

New Total: ₦2,350 (still under ₦3,000!)

Vendor B can handle this. Proceed?"

User: "Yes"

System: "✅ Updated order sent to Vendor B
✅ Confirmed!

[Updated QR Code]"
```

---

## Testing

### Backend
```bash
cd backend

npm test                 # All tests
npm run test:coverage   # Coverage report
npm run test:watch     # Watch mode
```

### Frontend
```bash
cd frontend

npm test                # All tests
npm test -- --coverage # Coverage
```

### Test Coverage
- ✅ NLP intent parsing (various phrasings)
- ✅ Decider Engine optimization (edge cases)
- ✅ Chat flow (buyer ↔ system ↔ vendor)
- ✅ Deal confirmation & QR generation
- ✅ Real-time notifications (Socket.io)
- ✅ Budget constraints
- ✅ Vendor minimum price fairness

---

## Future Enhancements

- [ ] **Voice Chat** — Speak requests in Yoruba, Igbo, Pidgin
- [ ] **Mobile App** — Native Android/iOS
- [ ] **Payment Integration** — Direct Flutterwave/Paystack settlement
- [ ] **Group Buying** — Pool budgets with other buyers
- [ ] **Ratings** — Vendor trust scoring
- [ ] **ML Pricing** — Learn vendor behavior patterns
- [ ] **Analytics** — Vendor demand dashboard
- [ ] **Seasonal Pricing** — Smart negotiation by season
- [ ] **Multi-Market** — Scale across different Nigerian markets

---

## Contributing

```bash
1. Fork repo
2. Feature branch: git checkout -b feature/your-feature
3. Commit: git commit -m 'Add feature'
4. Push: git push origin feature/your-feature
5. Pull Request
```

---

## License

MIT License — [LICENSE](LICENSE)

---

## Authors

**Project Team:** [Your Names]  
**Course:** [Course Name]  
**Instructor:** [Professor Name]

---

## Contact

- 📧 Issues → GitHub Issues
- 💬 Questions → Discussions
- 🐛 Bugs → Include reproduction steps

---

**Built with ❤️ to solve real problems in Nigerian markets**
