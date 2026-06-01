import { useState, useEffect, useRef } from "react";

const STATS = [
  { value: "₦2.4B+", label: "Transactions Processed" },
  { value: "50,000+", label: "Active Buyers" },
  { value: "8,200+", label: "Verified Vendors" },
  { value: "94%", label: "Budget Hit Rate" },
];

const STEPS = [
  {
    num: "01",
    title: "Tell us what you need",
    desc: "Type naturally — 'I want to cook jollof rice with ₦4,000' or list exact items. Our AI understands both.",
    icon: "💬",
  },
  {
    num: "02",
    title: "We negotiate for you",
    desc: "The Decider Engine scans every vendor in real-time, runs constraint optimization, and locks in the best price — in seconds.",
    icon: "⚡",
  },
  {
    num: "03",
    title: "Confirm with one tap",
    desc: "Review the deal breakdown. Approve it. Vendors are instantly notified. No phone calls, no haggling.",
    icon: "✅",
  },
  {
    num: "04",
    title: "Scan & collect",
    desc: "Get a unique QR code per vendor. Walk to the stall, scan, and collect. Done.",
    icon: "📲",
  },
];

const FEATURES = [
  {
    icon: "🧠",
    title: "Decider Engine",
    desc: "Constraint-satisfaction optimization across N vendors simultaneously. Finds the mathematically optimal split that fits your budget while ensuring vendors stay profitable.",
    tag: "Core Algorithm",
  },
  {
    icon: "🔔",
    title: "Real-Time Notifications",
    desc: "Socket.io powered instant alerts. The moment you confirm, vendors receive deal proposals. Acceptance flows back in under 5 seconds.",
    tag: "Infrastructure",
  },
  {
    icon: "🔐",
    title: "Fair Negotiation",
    desc: "Vendors are never forced below their minimum price. Every deal maintains a ₦50+ profit margin. Built to sustain the ecosystem, not exploit it.",
    tag: "Ethics by Design",
  },
  {
    icon: "📊",
    title: "Transparent Deals",
    desc: "See exactly what was negotiated, why each vendor was selected, and how much you saved — before you confirm anything.",
    tag: "Transparency",
  },
  {
    icon: "🗣️",
    title: "Natural Language Input",
    desc: "Speak in Yoruba, Igbo, Pidgin, or English. Describe a dish or list exact items. The NLP layer handles it all.",
    tag: "Accessibility",
  },
  {
    icon: "📱",
    title: "QR Checkout",
    desc: "Unique QR codes generated per vendor per transaction. Walk the market with your phone. No cash disputes, no confusion.",
    tag: "Frictionless UX",
  },
];

const CHAT_DEMO = [
  { role: "user", msg: "I want to cook egusi soup with ₦5,000" },
  { role: "system", msg: "Scanning 12 vendors near you for egusi soup ingredients..." },
  {
    role: "deal",
    msg: null,
    deal: {
      vendor: "Mama Amina's Stall",
      items: [
        { name: "Egusi", qty: "1kg", price: "₦600" },
        { name: "Tomatoes", qty: "2kg", price: "₦1,060" },
        { name: "Bitter leaf", qty: "0.5kg", price: "₦100" },
        { name: "Peppers", qty: "0.5kg", price: "₦225" },
        { name: "Onions", qty: "0.5kg", price: "₦75" },
      ],
      total: "₦2,060",
      saved: "₦2,940",
    },
  },
  { role: "user", msg: "Yes, let's go!" },
  { role: "system", msg: "✅ Mama Amina confirmed in 3 seconds. Your QR code is ready. Head to Stall 14." },
];

const PRICING = [
  {
    name: "Buyer",
    price: "Free",
    sub: "Always",
    highlight: false,
    perks: [
      "Unlimited deal negotiations",
      "Full chat history",
      "QR code checkout",
      "Real-time notifications",
      "Multi-vendor optimization",
    ],
  },
  {
    name: "Vendor Basic",
    price: "₦0",
    sub: "/ month",
    highlight: false,
    perks: [
      "Up to 20 product listings",
      "Order notifications",
      "Accept / reject deals",
      "Daily demand insights",
      "Manual inventory updates",
    ],
  },
  {
    name: "Vendor Pro",
    price: "₦4,999",
    sub: "/ month",
    highlight: true,
    perks: [
      "Unlimited product listings",
      "Priority matching algorithm",
      "Auto-inventory sync",
      "Analytics dashboard",
      "Early access to Group Buying",
    ],
  },
];

function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, inView];
}

function AnimatedNumber({ target, suffix = "" }) {
  const [val, setVal] = useState(0);
  const [ref, inView] = useInView(0.3);
  const num = parseFloat(target.replace(/[^0-9.]/g, ""));
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = num / 60;
    const interval = setInterval(() => {
      start += step;
      if (start >= num) { setVal(num); clearInterval(interval); }
      else setVal(start);
    }, 16);
    return () => clearInterval(interval);
  }, [inView, num]);
  const display = num > 999 ? (val / 1000).toFixed(1) + "K" : Math.round(val);
  return <span ref={ref}>{target.startsWith("₦") ? "₦" : ""}{num > 999 ? (val / 1000).toFixed(1) + "K" : Math.round(val)}{suffix}{target.endsWith("%") ? "%" : target.endsWith("+") ? "+" : ""}</span>;
}

export default function App() {
  const [scrolled, setScrolled] = useState(false);
  const [chatStep, setChatStep] = useState(0);
  const [chatVisible, setChatVisible] = useState(false);
  const chatRef = useRef(null);
  const [chatInView, setChatInView] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setChatInView(true); }, { threshold: 0.2 });
    if (chatRef.current) obs.observe(chatRef.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!chatInView) return;
    const timer = setInterval(() => {
      setChatStep(s => {
        if (s >= CHAT_DEMO.length - 1) { clearInterval(timer); return s; }
        return s + 1;
      });
    }, 900);
    return () => clearInterval(timer);
  }, [chatInView]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans overflow-x-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; }
        body { background: #0A0A0A; }
        .font-display { font-family: 'Syne', sans-serif; }
        .font-body { font-family: 'DM Sans', sans-serif; }
        .hero-glow { background: radial-gradient(ellipse 80% 60% at 50% 0%, rgba(234,179,8,0.12) 0%, transparent 70%); }
        .gold-gradient { background: linear-gradient(135deg, #F59E0B, #FCD34D, #F59E0B); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .card-border { border: 1px solid rgba(255,255,255,0.07); }
        .card-hover { transition: border-color 0.3s, transform 0.3s; }
        .card-hover:hover { border-color: rgba(245,158,11,0.3); transform: translateY(-3px); }
        .chat-bubble-user { background: #1C1C1C; border: 1px solid rgba(255,255,255,0.08); }
        .chat-bubble-system { background: rgba(245,158,11,0.1); border: 1px solid rgba(245,158,11,0.2); }
        .deal-card { background: #111; border: 1px solid rgba(245,158,11,0.25); }
        .nav-blur { backdrop-filter: blur(16px); background: rgba(10,10,10,0.8); border-bottom: 1px solid rgba(255,255,255,0.05); }
        .highlight-plan { border: 1px solid rgba(245,158,11,0.5) !important; background: linear-gradient(180deg, rgba(245,158,11,0.05) 0%, transparent 100%); }
        .step-line::after { content: ''; position: absolute; right: 0; top: 50%; width: 1px; height: 60%; background: linear-gradient(180deg, transparent, rgba(245,158,11,0.3), transparent); transform: translateY(-50%); }
        @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse-gold { 0%,100% { box-shadow: 0 0 0 0 rgba(245,158,11,0.4); } 50% { box-shadow: 0 0 0 8px rgba(245,158,11,0); } }
        .animate-fadeup { animation: fadeUp 0.7s ease both; }
        .dot-pulse { animation: pulse-gold 2s infinite; }
        .tag-pill { font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase; background: rgba(245,158,11,0.1); color: #F59E0B; border: 1px solid rgba(245,158,11,0.2); border-radius: 99px; padding: 3px 10px; }
        .noise { position: fixed; inset: 0; pointer-events: none; opacity: 0.025; background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E"); z-index: 999; }
        .grid-bg { background-image: linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px); background-size: 60px 60px; }
      `}</style>

      {/* Noise overlay */}
      <div className="noise" />

      {/* Nav */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "nav-blur" : ""}`}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="font-display font-bold text-xl tracking-tight">
            Market<span className="gold-gradient">Xpress</span>
          </div>
         
          <div className="flex items-center gap-3">
            <button className="font-body text-sm text-white/50 cursor-pointer hover:text-white px-4 py-2 transition-colors">Sign in</button>
            <button className="font-body text-sm bg-amber-400 cursor-pointer text-black font-medium px-5 py-2 rounded-full hover:bg-amber-300 transition-all duration-200">
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24 pb-16 grid-bg">
        <div className="hero-glow absolute inset-0 pointer-events-none" />
        <div className="relative z-10 max-w-4xl mx-auto animate-fadeup">
          

          <h1 className="font-display text-5xl md:text-7xl font-extrabold leading-[0.95] tracking-tight mb-6">
            Stop Haggling.<br />
            <span className="gold-gradient">Start Buying.</span>
          </h1>

          <p className="font-body text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
            MarketXpress AI negotiates food market prices for you in real-time — across every vendor simultaneously — so you get the best deal without spending your afternoon at a stall.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="font-body bg-amber-400 cursor-pointer text-black font-medium text-base px-8 py-4 rounded-full hover:bg-amber-300 transition-all duration-200 hover:scale-105">
              Try It Free →
            </button>
            <button className="font-body border cursor-pointer border-white/10 text-white/70 text-base px-8 py-4 rounded-full hover:border-white/25 hover:text-white transition-all duration-200">
              See How It Works
            </button>
          </div>

          <p className="font-body text-xs text-white/25 mt-6">No credit card required · Works in any Nigerian market · Free for buyers</p>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <div className="w-px h-8 bg-gradient-to-b from-transparent to-amber-400/40" />
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-white/5 py-14">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map(s => (
            <div key={s.label} className="text-center">
              <div className="font-display text-3xl md:text-4xl font-bold gold-gradient mb-1">{s.value}</div>
              <div className="font-body text-sm text-white/40">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Chat Demo */}
      <section className="py-24 px-6" ref={chatRef}>
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <div className="tag-pill mb-5 inline-block">Live Demo</div>
            <h2 className="font-display text-4xl md:text-5xl font-bold leading-tight mb-5">
              Just type what<br />you want to cook.
            </h2>
            <p className="font-body text-white/50 text-lg leading-relaxed mb-6">
              No forms. No filters. No browsing. Tell us the dish and your budget — our engine does the rest in seconds.
            </p>
            <p className="font-body text-white/30 text-sm">Supports English, Yoruba, Igbo, and Pidgin</p>
          </div>

          {/* Chat UI */}
          <div className="bg-[#111] rounded-3xl border border-white/8 p-5 space-y-3 min-h-[380px]">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/5">
              <div className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="font-body text-xs text-white/30 tracking-wide">MarketXpress · Active</span>
            </div>
            {CHAT_DEMO.slice(0, chatStep + 1).map((c, i) => (
              <div key={i} className={`flex ${c.role === "user" ? "justify-end" : "justify-start"}`}>
                {c.role === "deal" ? (
                  <div className="deal-card rounded-2xl p-4 w-full">
                    <div className="font-body text-xs text-amber-400 mb-3 font-medium">📊 Best Deal Found</div>
                    <div className="font-body text-xs text-white/60 mb-2">{c.deal.vendor}</div>
                    <div className="space-y-1 mb-3">
                      {c.deal.items.map((it, j) => (
                        <div key={j} className="flex justify-between font-body text-xs text-white/70">
                          <span>{it.name} · {it.qty}</span>
                          <span className="text-white/90">{it.price}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-white/10 pt-2 flex justify-between">
                      <span className="font-body text-xs text-white/40">Total</span>
                      <span className="font-display text-sm font-bold text-amber-400">{c.deal.total}</span>
                    </div>
                    <div className="font-body text-xs text-green-400/70 mt-1 text-right">You save {c.deal.saved}</div>
                  </div>
                ) : (
                  <div className={`max-w-[85%] px-4 py-3 rounded-2xl font-body text-sm ${c.role === "user" ? "chat-bubble-user text-white/90 rounded-br-sm" : "chat-bubble-system text-amber-100/80 rounded-bl-sm"}`}>
                    {c.msg}
                  </div>
                )}
              </div>
            ))}
            {chatStep < CHAT_DEMO.length - 1 && (
              <div className="flex justify-start">
                <div className="chat-bubble-system px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1 items-center">
                  {[0,1,2].map(i => <span key={i} className="w-1.5 h-1.5 rounded-full bg-amber-400/60 animate-bounce" style={{animationDelay:`${i*0.15}s`}} />)}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="tag-pill mb-5 inline-block">Process</div>
            <h2 className="font-display text-4xl md:text-5xl font-bold">Four steps. Zero friction.</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {STEPS.map((s, i) => (
              <div key={i} className="relative bg-[#111] rounded-2xl p-6 card-border card-hover">
                <div className="font-display text-5xl font-extrabold text-white/5 absolute top-4 right-5 select-none">{s.num}</div>
                <div className="text-3xl mb-4">{s.icon}</div>
                <h3 className="font-display text-lg font-bold mb-2">{s.title}</h3>
                <p className="font-body text-sm text-white/45 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="tag-pill mb-5 inline-block">Platform</div>
            <h2 className="font-display text-4xl md:text-5xl font-bold">Built for the real world.<br /><span className="text-white/30">Not a demo.</span></h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <div key={i} className="bg-[#111] rounded-2xl p-6 card-border card-hover">
                <div className="tag-pill mb-4 inline-block">{f.tag}</div>
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-display text-lg font-bold mb-2">{f.title}</h3>
                <p className="font-body text-sm text-white/45 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vendor CTA Banner */}
      <section className="py-16 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="rounded-3xl overflow-hidden relative border border-amber-400/15 bg-[#111]">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-400/5 via-transparent to-transparent pointer-events-none" />
            <div className="relative p-10 md:p-14 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
              <div className="max-w-xl">
                <div className="tag-pill mb-4 inline-block">For Vendors</div>
                <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">Sell more. Waste less. Zero effort.</h2>
                <p className="font-body text-white/50 text-base leading-relaxed">
                  Stop watching produce spoil at end of day. MarketXpress routes verified buyers with matched budgets directly to your stall — before stock becomes waste.
                </p>
              </div>
              <div className="flex flex-col gap-3 shrink-0">
                <button className="font-body bg-amber-400 cursor-pointer text-black font-medium px-7 py-3.5 rounded-full hover:bg-amber-300 transition-all hover:scale-105 whitespace-nowrap">
                  Register as Vendor →
                </button>
                <p className="font-body text-xs text-white/25 text-center">Free tier available · No hardware needed</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="tag-pill mb-5 inline-block">Pricing</div>
            <h2 className="font-display text-4xl md:text-5xl font-bold">Simple. Honest. Fair.</h2>
            <p className="font-body text-white/40 mt-4 text-lg">Buyers always pay nothing. Vendors choose their level.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {PRICING.map((p, i) => (
              <div key={i} className={`rounded-2xl p-7 flex flex-col ${p.highlight ? "highlight-plan" : "bg-[#111] card-border"}`}>
                {p.highlight && (
                  <div className="text-center mb-4">
                    <span className="font-body text-xs bg-amber-400 text-black px-4 py-1 rounded-full font-medium">Most Popular</span>
                  </div>
                )}
                <div className="font-body text-sm text-white/40 mb-1">{p.name}</div>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="font-display text-4xl font-extrabold">{p.price}</span>
                  <span className="font-body text-sm text-white/30">{p.sub}</span>
                </div>
                <div className="flex-1 mt-6 space-y-3">
                  {p.perks.map((k, j) => (
                    <div key={j} className="flex items-start gap-3 font-body text-sm text-white/60">
                      <span className="text-amber-400 mt-0.5 shrink-0">✓</span>
                      {k}
                    </div>
                  ))}
                </div>
                <button className={`mt-8  cursor-pointer w-full py-3 rounded-full font-body font-medium text-sm transition-all ${p.highlight ? "bg-amber-400 text-black hover:bg-amber-300" : "border border-white/10 text-white/60 hover:border-white/25 hover:text-white"}`}>
                  {p.price === "Free" || p.price === "₦0" ? "Get Started Free" : "Start Free Trial"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-28 px-6 border-t border-white/5 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-display text-5xl md:text-6xl font-extrabold leading-tight mb-6">
            Your ₦5,000 should<br />buy more than ₦5,000.
          </h2>
          <p className="font-body text-white/40 text-lg mb-10">
            Start buying smarter today. Join 50,000+ Nigerians who never overpay at the market again.
          </p>
          <button className="font-body cursor-pointer bg-amber-400 text-black font-medium text-lg px-10 py-5 rounded-full hover:bg-amber-300 transition-all hover:scale-105">
            Start Negotiating for Free →
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-10 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="font-display font-bold text-lg">
            Market<span className="gold-gradient">Xpress</span> <span className="text-white/20 font-body font-normal text-sm">AI</span>
          </div>
          <p className="font-body text-xs text-white/25">Built for Nigerian markets. © 2025 MarketXpress AI. MIT License.</p>
          <div className="flex gap-6">
            {["GitHub", "Twitter", "Privacy"].map(l => (
              <a key={l} href="#" className="font-body text-xs text-white/30 hover:text-white/60 transition-colors">{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
