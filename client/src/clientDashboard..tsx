import { useState, useEffect, useRef } from "react";
import {
  MessageSquare, Plus, LogOut, Send, Sparkles,
  Wallet, Menu, X, User, ShoppingBag, TrendingDown,
  ChevronRight, Zap, Clock
} from "lucide-react";

/* ─── Google Fonts injected once ─── */
const FontLoader = () => {
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=JetBrains+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap";
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);
  return null;
};

/* ─── Tiny hook: animate a number up on mount ─── */
function useCountUp(target, active) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    let raf;
    const start = performance.now();
    const duration = 1200;
    const step = (now) => {
      const t = Math.min((now - start) / duration, 1);
      setVal(Math.round(t * t * target));
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [active, target]);
  return val;
}

/* ─── Stat badge used in sidebar ─── */
const StatBadge = ({ label, value, suffix = "" }) => {
  const [active, setActive] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setActive(true); }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  const num = useCountUp(value, active);
  return (
    <div ref={ref} className="flex flex-col gap-0.5">
      <span className="text-[10px] uppercase tracking-[0.12em] text-white/25 font-mono">{label}</span>
      <span className="text-lg font-mono font-medium text-amber-400">{num.toLocaleString()}{suffix}</span>
    </div>
  );
};

/* ─── Deal card rendered inside assistant messages ─── */
const DealCard = ({ items = [], total, vendor, saved }) => (
  <div className="mt-4 rounded-xl border border-amber-400/20 overflow-hidden">
    <div className="bg-amber-400/[0.06] border-b border-amber-400/15 px-4 py-2.5 flex items-center justify-between">
      <div className="flex items-center gap-2 text-[11px] font-mono font-medium text-amber-400 uppercase tracking-widest">
        <ShoppingBag className="w-3 h-3" />
        Decider Output · {vendor}
      </div>
      <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400">
        <TrendingDown className="w-3 h-3" />
        Save {saved}
      </div>
    </div>
    <div className="px-4 py-3 space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-white/20 w-4">{String(i + 1).padStart(2, "0")}</span>
            <span className="text-xs text-white/70">{item.name}</span>
            <span className="text-[10px] text-white/30 font-mono">{item.qty}</span>
          </div>
          <span className="text-xs font-mono text-white/80">{item.price}</span>
        </div>
      ))}
    </div>
    <div className="border-t border-white/[0.06] px-4 py-2.5 flex justify-between items-center bg-white/[0.01]">
      <span className="text-[11px] font-mono text-white/30 uppercase tracking-widest">Total</span>
      <span className="text-sm font-mono font-bold text-amber-400">{total}</span>
    </div>
  </div>
);

/* ─── Message bubble ─── */
const Bubble = ({ msg, isNew }) => {
  const isUser = msg.role === "user";
  return (
    <div
      className={`flex gap-3 max-w-3xl transition-all duration-500 ${isNew ? "animate-slide-up" : ""} ${isUser ? "ml-auto flex-row-reverse" : ""}`}
    >
      {/* Avatar */}
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 border text-[11px] font-mono ${
        isUser
          ? "bg-white/[0.04] border-white/[0.08] text-white/50"
          : "bg-amber-400/10 border-amber-400/25 text-amber-400"
      }`}>
        {isUser ? <User className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
      </div>

      {/* Content */}
      <div className={`flex flex-col gap-1 max-w-[85%] ${isUser ? "items-end" : "items-start"}`}>
        <span className={`text-[10px] font-mono uppercase tracking-widest ${isUser ? "text-white/20" : "text-amber-400/50"}`}>
          {isUser ? "You" : "Decider Engine"}
        </span>
        <div className={`rounded-2xl px-4 py-3 text-[13px] leading-relaxed border ${
          isUser
            ? "bg-white/[0.05] border-white/[0.07] text-white/85 rounded-tr-sm"
            : "bg-[#0f0f0f] border-white/[0.05] text-white/80 rounded-tl-sm"
        }`}>
          {msg.content}
          {msg.deal && <DealCard {...msg.deal} />}
        </div>
        {msg.timestamp && (
          <span className="text-[10px] font-mono text-white/15 flex items-center gap-1">
            <Clock className="w-2.5 h-2.5" />{msg.timestamp}
          </span>
        )}
      </div>
    </div>
  );
};

/* ─── Typing indicator ─── */
const TypingIndicator = () => (
  <div className="flex gap-3 max-w-3xl animate-slide-up">
    <div className="w-7 h-7 rounded-lg bg-amber-400/10 border border-amber-400/25 flex items-center justify-center shrink-0 mt-0.5">
      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
    </div>
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400/50">Decider Engine</span>
      <div className="bg-[#0f0f0f] border border-white/[0.05] rounded-2xl rounded-tl-sm px-4 py-3.5 flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1 h-1 rounded-full bg-amber-400/60"
            style={{ animation: `bounce 1.2s ${i * 0.18}s infinite` }}
          />
        ))}
      </div>
    </div>
  </div>
);

/* ─── History item ─── */
const HistoryItem = ({ chat, active }) => (
  <button className={`w-full text-left py-2 px-3 rounded-lg flex items-center gap-2.5 group transition-all duration-200 ${
    active ? "bg-amber-400/[0.08] border border-amber-400/20" : "hover:bg-white/[0.025] border border-transparent"
  }`}>
    <MessageSquare className={`w-3.5 h-3.5 shrink-0 transition-colors ${active ? "text-amber-400" : "text-white/20 group-hover:text-white/40"}`} />
    <span className={`text-xs truncate transition-colors ${active ? "text-white/80" : "text-white/40 group-hover:text-white/60"}`}>{chat.title}</span>
    {active && <ChevronRight className="w-3 h-3 text-amber-400/50 ml-auto shrink-0" />}
  </button>
);

/* ══════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════ */
const ClientDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [budget, setBudget] = useState("4500");
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeChat, setActiveChat] = useState(1);
  const feedRef = useRef(null);
  const inputRef = useRef(null);

  const [chatHistory] = useState([
    { id: 1, title: "Jollof Rice Sourcing" },
    { id: 2, title: "Egusi Soup Fixings" },
    { id: 3, title: "Party Cooking — 50 pax" },
  ]);

  const now = () => new Date().toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" });

  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "assistant",
      content: "Hello. I am the MarketXpress Decider Engine — a constraint-optimization layer over Nigerian food markets. Tell me what you want to cook and your hard budget cap. I will source, negotiate, and split across vendors automatically.",
      timestamp: "09:14 AM",
    },
  ]);

  /* Auto-scroll on new messages */
  useEffect(() => {
    feedRef.current?.scrollTo({ top: feedRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMsg = {
      id: Date.now(),
      role: "user",
      content: inputMessage,
      timestamp: now(),
      isNew: true,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setIsLoading(true);

    /* Simulate engine response */
    setTimeout(() => {
      const responseMsg = {
        id: Date.now() + 1,
        role: "assistant",
        content: `Optimization complete. Scanned 14 active vendors. Best split identified — single-vendor route minimises your logistics overhead.`,
        timestamp: now(),
        isNew: true,
        deal: {
          vendor: "Mama Amina's Stall · Stall 14",
          items: [
            { name: "Long-grain rice", qty: "3 kg", price: "₦2,055" },
            { name: "Roma tomatoes", qty: "2 kg", price: "₦1,060" },
            { name: "Tatashe peppers", qty: "0.5 kg", price: "₦225" },
            { name: "White onions", qty: "0.5 kg", price: "₦75" },
          ],
          total: "₦3,415",
          saved: "₦1,085",
        },
      };
      setMessages((prev) => [...prev, responseMsg]);
      setIsLoading(false);
    }, 2200);
  };

  const handleLogout = () => {
    localStorage.removeItem("user_token");
    window.location.href = "/login";
  };

  return (
    <>
      <FontLoader />
      <style>{`
        @keyframes slide-up { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes bounce { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-4px); } }
        @keyframes glow-pulse { 0%,100% { opacity:.4; } 50% { opacity:.8; } }
        @keyframes shimmer { 0% { background-position:-200% 0; } 100% { background-position:200% 0; } }
        .animate-slide-up { animation: slide-up 0.35s cubic-bezier(.22,.68,0,1.2) both; }
        .font-display { font-family:'Syne',sans-serif; }
        .font-body { font-family:'DM Sans',sans-serif; }
        .font-mono { font-family:'JetBrains Mono',monospace; }
        .gold-text { background:linear-gradient(135deg,#F59E0B,#FCD34D 50%,#F59E0B); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
        .hairline { border:0.5px solid rgba(255,255,255,0.07); }
        .hairline-gold { border:0.5px solid rgba(245,158,11,0.2); }
        .sidebar-bg { background:#080808; }
        .main-bg { background:#0C0C0C; }
        .input-glow:focus { box-shadow:0 0 0 1px rgba(245,158,11,0.25), 0 0 24px rgba(245,158,11,0.06); }
        .send-btn { background:linear-gradient(135deg,#F59E0B,#D97706); }
        .send-btn:hover { background:linear-gradient(135deg,#FCD34D,#F59E0B); }
        .send-btn:disabled { background:rgba(255,255,255,0.05); }
        .ambient-top { background:radial-gradient(ellipse 60% 40% at 50% 0%, rgba(245,158,11,0.06) 0%, transparent 70%); }
        .scrollbar-hide::-webkit-scrollbar { display:none; }
        .scrollbar-thin::-webkit-scrollbar { width:3px; }
        .scrollbar-thin::-webkit-scrollbar-track { background:transparent; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.08); border-radius:99px; }
        .status-dot { animation:glow-pulse 2s ease-in-out infinite; }
        .budget-shimmer { background:linear-gradient(90deg,transparent,rgba(245,158,11,0.04),transparent); background-size:200% 100%; animation:shimmer 3s infinite; }
      `}</style>

      <div className="h-screen w-screen flex overflow-hidden main-bg text-white font-body antialiased">

        {/* ── Ambient atmosphere ── */}
        <div className="ambient-top absolute inset-0 pointer-events-none z-0" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/[0.03] rounded-full blur-[120px] pointer-events-none z-0" />

        {/* ════════════════════════════════
            MOBILE NAV BAR
        ════════════════════════════════ */}
        <div className="md:hidden fixed top-0 left-0 right-0 h-14 z-50 flex items-center justify-between px-4 border-b border-white/[0.05]"
          style={{ background: "rgba(8,8,8,0.9)", backdropFilter: "blur(20px)" }}>
          <button onClick={() => setSidebarOpen(true)} className="text-white/40 hover:text-white/70 transition-colors">
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-display text-base font-bold tracking-tight">
            Market<span className="gold-text">Xpress</span>
          </span>
          <div className="w-7 h-7 rounded-lg hairline-gold bg-amber-400/[0.08] flex items-center justify-center text-[11px] font-mono text-amber-400">
            B
          </div>
        </div>

        {/* Sidebar overlay (mobile) */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        )}

        {/* ════════════════════════════════
            LEFT SIDEBAR
        ════════════════════════════════ */}
        <aside className={`
          fixed inset-y-0 left-0 z-50 w-72 sidebar-bg flex flex-col border-r border-white/[0.05]
          transform transition-transform duration-300 ease-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:relative md:translate-x-0 md:flex
        `}>

          {/* Mobile close */}
          <button onClick={() => setSidebarOpen(false)}
            className="md:hidden absolute top-4 right-4 text-white/30 hover:text-white/60 transition-colors z-10">
            <X className="w-4 h-4" />
          </button>

          {/* ── Logo ── */}
          <div className="px-5 pt-5 pb-4 border-b border-white/[0.05]">
            <div className="font-display text-xl font-bold tracking-tight">
              Market<span className="gold-text">Xpress</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 status-dot" />
              <span className="text-[10px] font-mono text-white/25 uppercase tracking-widest">Engine Online</span>
            </div>
          </div>

          {/* ── Scrollable body ── */}
          <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-4 space-y-5">

            {/* New deal button */}
            <button className="w-full hairline hover:border-amber-400/25 bg-white/[0.02] hover:bg-amber-400/[0.04] text-white/60 hover:text-amber-400 transition-all duration-200 rounded-xl py-3 px-4 flex items-center gap-2.5 text-[13px] font-medium group">
              <Plus className="w-4 h-4 text-amber-400/50 group-hover:text-amber-400 transition-colors" />
              New Deal Sourcing
            </button>

            {/* Budget input */}
            <div className="rounded-xl hairline overflow-hidden budget-shimmer">
              <div className="bg-white/[0.02] px-4 pt-3 pb-3">
                <label className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-white/30 mb-2">
                  <Wallet className="w-3 h-3 text-amber-400" />
                  Budget Cap (₦)
                </label>
                <div className="relative">
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 font-mono text-amber-400/50 text-sm">₦</span>
                  <input
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="5000"
                    className="w-full bg-transparent border-none outline-none pl-4 text-lg font-mono font-medium text-amber-400 placeholder-amber-400/20"
                  />
                </div>
                <div className="mt-2 h-[1px] bg-gradient-to-r from-amber-400/30 via-amber-400/10 to-transparent" />
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl hairline bg-white/[0.015] px-3 py-2.5">
                <StatBadge label="Vendors" value={8200} suffix="+" />
              </div>
              <div className="rounded-xl hairline bg-white/[0.015] px-3 py-2.5">
                <StatBadge label="Avg. Saved" value={847} suffix="₦" />
              </div>
            </div>

            {/* Chat history */}
            <div>
              <span className="block text-[10px] font-mono uppercase tracking-widest text-white/20 px-1 mb-2">
                Recent Calculations
              </span>
              <div className="space-y-0.5">
                {chatHistory.map((chat) => (
                  <HistoryItem key={chat.id} chat={chat} active={activeChat === chat.id}
                    onClick={() => setActiveChat(chat.id)} />
                ))}
              </div>
            </div>
          </div>

          {/* ── Footer ── */}
          <div className="border-t border-white/[0.05] p-4 space-y-1">
            <div className="flex items-center gap-3 px-3 py-2 rounded-xl hairline bg-white/[0.02]">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-500/20 to-amber-400/10 border border-amber-400/20 flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium text-white/70 truncate">Buyer Account</div>
                <div className="text-[10px] font-mono text-white/25 truncate">Active · Tier Free</div>
              </div>
              <Zap className="w-3 h-3 text-amber-400/40" />
            </div>
            <button onClick={handleLogout}
              className="w-full hover:bg-red-500/[0.08] text-white/30 hover:text-red-400/70 rounded-xl py-2.5 px-3 flex items-center gap-2.5 text-xs font-mono transition-all duration-200">
              <LogOut className="w-3.5 h-3.5" />
              Disconnect Node
            </button>
          </div>
        </aside>

        {/* ════════════════════════════════
            MAIN CHAT AREA
        ════════════════════════════════ */}
        <main className="flex-1 flex flex-col min-w-0 pt-14 md:pt-0 relative z-10">

          {/* Top bar */}
          <div className="hidden md:flex items-center justify-between px-6 py-3.5 border-b border-white/[0.05]"
            style={{ background: "rgba(12,12,12,0.8)", backdropFilter: "blur(12px)" }}>
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-white/25 uppercase tracking-widest">Active Thread</span>
              <span className="text-xs font-mono text-white/50">—</span>
              <span className="text-sm text-white/60">
                {chatHistory.find(c => c.id === activeChat)?.title ?? "New Session"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-[11px] font-mono text-white/25 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 status-dot" />
                Engine nominal · {messages.length} turns
              </div>
            </div>
          </div>

          {/* ── Message feed ── */}
          <div ref={feedRef} className="flex-1 overflow-y-auto scrollbar-thin px-4 md:px-8 py-6 space-y-5">
            <div className="max-w-3xl mx-auto space-y-5">
              {messages.map((msg) => (
                <Bubble key={msg.id} msg={msg} isNew={msg.isNew} />
              ))}
              {isLoading && <TypingIndicator />}
            </div>
          </div>

          {/* ── Input area ── */}
          <div className="px-4 md:px-8 pb-6 pt-3"
            style={{ background: "linear-gradient(to top, #0C0C0C 60%, transparent)" }}>
            <div className="max-w-3xl mx-auto">
              <form onSubmit={handleSendMessage} className="relative">
                <div className="relative hairline rounded-2xl overflow-hidden"
                  style={{ background: "rgba(15,15,15,0.9)", backdropFilter: "blur(20px)" }}>
                  <textarea
                    ref={inputRef}
                    disabled={isLoading}
                    value={inputMessage}
                    rows={1}
                    onChange={(e) => {
                      setInputMessage(e.target.value);
                      e.target.style.height = "auto";
                      e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
                    }}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendMessage(e); } }}
                    placeholder="'I want to cook pot of stew with ₦3,000...' — press Enter to send"
                    className="w-full bg-transparent border-none outline-none resize-none py-4 pl-4 pr-16 text-[13px] text-white/80 placeholder-white/20 font-body leading-relaxed input-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ minHeight: "52px", maxHeight: "120px" }}
                  />
                  <button type="submit" disabled={isLoading || !inputMessage.trim()}
                    className="send-btn absolute right-3 bottom-3 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 disabled:cursor-not-allowed hover:scale-105 active:scale-95">
                    <Send className="w-4 h-4 text-black" />
                  </button>
                </div>
              </form>
              <div className="flex items-center justify-between mt-2.5 px-1">
                <span className="text-[10px] font-mono text-white/15 flex items-center gap-1.5">
                  <Zap className="w-2.5 h-2.5 text-amber-400/30" />
                  Constraint engine · PostgreSQL · Supabase
                </span>
                <span className="text-[10px] font-mono text-white/15">⏎ send · ⇧⏎ newline</span>
              </div>
            </div>
          </div>

        </main>
      </div>
    </>
  );
};

export default ClientDashboard;