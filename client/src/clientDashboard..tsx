import { useState, useEffect, useRef } from "react";
import {
  MessageSquare, Plus, LogOut, Send, Sparkles,
  Wallet, Menu, X, User, ShoppingBag, TrendingDown,
  ChevronRight, Zap, Clock
} from "lucide-react";

/* ─── Google Fonts ─── */
const FontLoader = () => {
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=JetBrains+Mono:wght@400;500&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap";
    document.head.appendChild(link);
    return () => { if (document.head.contains(link)) document.head.removeChild(link); };
  }, []);
  return null;
};

/* ─── Count-up hook ─── */
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

/* ─── Deal card ─── */
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
const Bubble = ({ msg }) => {
  const isUser = msg.role === "user";
  return (
    <div className={`flex gap-3 w-full bubble-enter ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 border bg-amber-400/10 border-amber-400/25 text-amber-400">
          <Sparkles className="w-3.5 h-3.5" />
        </div>
      )}

      <div className={`flex flex-col gap-1 max-w-[78%] ${isUser ? "items-end" : "items-start"}`}>
        <span className={`text-[10px] font-mono uppercase tracking-widest ${isUser ? "text-white/20" : "text-amber-400/50"}`}>
          {isUser ? "You" : "Decider Engine"}
        </span>
        <div className={`rounded-2xl px-4 py-3 text-[13px] leading-relaxed border ${
          isUser
            ? "bg-white/[0.06] border-white/[0.08] text-white/85 rounded-tr-sm"
            : "bg-[#111111] border-white/[0.06] text-white/80 rounded-tl-sm"
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

      {isUser && (
        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 border bg-white/[0.04] border-white/[0.08] text-white/50">
          <User className="w-3.5 h-3.5" />
        </div>
      )}
    </div>
  );
};

/* ─── Typing indicator ─── */
const TypingIndicator = () => (
  <div className="flex gap-3 bubble-enter">
    <div className="w-7 h-7 rounded-lg bg-amber-400/10 border border-amber-400/25 flex items-center justify-center shrink-0 mt-0.5">
      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
    </div>
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400/50">Decider Engine</span>
      <div className="bg-[#111111] border border-white/[0.06] rounded-2xl rounded-tl-sm px-4 py-3.5 flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <span key={i} className="w-1 h-1 rounded-full bg-amber-400/60"
            style={{ animation: `bounce 1.2s ${i * 0.18}s infinite` }} />
        ))}
      </div>
    </div>
  </div>
);

/* ─── Empty / centered greeting state ─── */
const EmptyState = ({ onSuggestion }) => {
  const suggestions = [
    "Cook jollof rice for 4 people, budget ₦2,500",
    "Source egusi soup ingredients under ₦3,000",
    "Party stew for 20 guests, max ₦15,000",
    "Cheapest protein sources this week in Lagos",
  ];
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 empty-enter">
      <div className="mb-6 relative">
        <div className="w-16 h-16 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center logo-pulse">
          <Sparkles className="w-7 h-7 text-amber-400" />
        </div>
        <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-[#0C0C0C] status-dot" />
      </div>

      <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-white/90 text-center mb-2">
        Market<span className="gold-text">Xpress</span> AI
      </h1>
      <p className="text-[13px] text-white/35 text-center max-w-sm leading-relaxed font-body mb-10">
        Constraint-optimized sourcing for Nigerian food markets.<br />
        Tell me what you want to cook and your hard budget cap.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-lg">
        {suggestions.map((s, i) => (
          <button
            key={i}
            onClick={() => onSuggestion(s)}
            className="suggestion-btn text-left px-4 py-3 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-amber-400/[0.05] hover:border-amber-400/25 transition-all duration-200 group"
          >
            <span className="text-[12px] text-white/45 group-hover:text-white/70 leading-relaxed transition-colors">{s}</span>
            <ChevronRight className="w-3 h-3 text-white/15 group-hover:text-amber-400/50 mt-1 transition-colors" />
          </button>
        ))}
      </div>
    </div>
  );
};

/* ─── History item ─── */
const HistoryItem = ({ chat, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full text-left py-2 px-3 rounded-lg flex items-center gap-2.5 group transition-all duration-200 ${
      active ? "bg-amber-400/[0.08] border border-amber-400/20" : "hover:bg-white/[0.025] border border-transparent"
    }`}
  >
    <MessageSquare className={`w-3.5 h-3.5 shrink-0 transition-colors ${active ? "text-amber-400" : "text-white/20 group-hover:text-white/40"}`} />
    <span className={`text-xs truncate transition-colors ${active ? "text-white/80" : "text-white/40 group-hover:text-white/60"}`}>{chat.title}</span>
    {active && <ChevronRight className="w-3 h-3 text-amber-400/50 ml-auto shrink-0" />}
  </button>
);

/* ════════════════════════════════════════
   MAIN COMPONENT
═════════════════════════════════════════ */
const ClientDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [budget, setBudget] = useState("4500");
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeChat, setActiveChat] = useState(1);
  const [hasMessages, setHasMessages] = useState(false);
  const feedRef = useRef(null);
  const inputRef = useRef(null);

  const [chatHistory] = useState([
    { id: 1, title: "Jollof Rice Sourcing" },
    { id: 2, title: "Egusi Soup Fixings" },
    { id: 3, title: "Party Cooking — 50 pax" },
  ]);

  const now = () => new Date().toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" });

  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (hasMessages && feedRef.current) {
      feedRef.current.scrollTo({ top: feedRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages, isLoading, hasMessages]);

  const sendMessage = async (text) => {
    if (!text.trim() || isLoading) return;

    const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
    const token = localStorage.getItem("user_token");

    const userMsg = { id: Date.now(), role: "user", content: text, timestamp: now() };
    setMessages((prev) => [...prev, userMsg]);
    setHasMessages(true);
    setInputMessage("");
    setIsLoading(true);

    if (inputRef.current) inputRef.current.style.height = "auto";

    try {
      const response = await fetch(`${baseUrl}/decider/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ message: text, budget: Number(budget) }),
      });
      const resData = await response.json();
      if (!response.ok) throw new Error(resData.message || "Engine calculation failed bounds checks.");

      const engineResult = resData.data;
      setMessages((prev) => [...prev, {
        id: Date.now() + 1,
        role: "assistant",
        content: engineResult.feasible
          ? "Optimization complete. Scanned database states. Best splits identified across market stalls."
          : `Boundary collision: ${engineResult.reason}`,
        timestamp: now(),
        deal: engineResult.feasible ? {
          vendor: `${engineResult.line_items[0]?.vendor_name || "Market Stall"} · ${engineResult.line_items[0]?.stall_number || "Multiple"}`,
          items: engineResult.line_items.map((item) => ({
            name: item.product_name,
            qty: `${item.quantity} ${item.unit_type}`,
            price: `₦${item.line_total.toLocaleString()}`,
          })),
          total: `₦${engineResult.total_cost.toLocaleString()}`,
          saved: `₦${engineResult.total_savings.toLocaleString()}`,
        } : null,
      }]);
    } catch (err) {
      setMessages((prev) => [...prev, {
        id: Date.now() + 2,
        role: "assistant",
        content: `System connection issue: ${err.message || "Failed to reach optimization node."}`,
        timestamp: now(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    sendMessage(inputMessage);
  };

  const handleSuggestion = (text) => {
    sendMessage(text);
  };

  const handleLogout = () => {
    localStorage.removeItem("user_token");
    window.location.href = "/login";
  };

  return (
    <>
      <FontLoader />
      <style>{`
        @keyframes slide-up   { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fade-in    { from { opacity:0; } to { opacity:1; } }
        @keyframes bounce     { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-4px); } }
        @keyframes glow-pulse { 0%,100% { opacity:.45; } 50% { opacity:.9; } }
        @keyframes shimmer    { 0% { background-position:-200% 0; } 100% { background-position:200% 0; } }
        @keyframes logo-float { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-4px); } }

        .bubble-enter    { animation: slide-up 0.3s cubic-bezier(.22,.68,0,1.15) both; }
        .empty-enter     { animation: fade-in 0.5s ease both; }
        .logo-pulse      { animation: logo-float 3s ease-in-out infinite; }

        .font-display  { font-family:'Syne',sans-serif; }
        .font-body     { font-family:'DM Sans',sans-serif; }
        .font-mono     { font-family:'JetBrains Mono',monospace; }

        .gold-text {
          background: linear-gradient(135deg,#F59E0B,#FCD34D 50%,#F59E0B);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hairline      { border: 0.5px solid rgba(255,255,255,0.07); }
        .hairline-gold { border: 0.5px solid rgba(245,158,11,0.2); }
        .sidebar-bg    { background: #080808; }
        .main-bg       { background: #0C0C0C; }

        .send-btn          { background: linear-gradient(135deg,#F59E0B,#D97706); }
        .send-btn:hover    { background: linear-gradient(135deg,#FCD34D,#F59E0B); }
        .send-btn:disabled { background: rgba(255,255,255,0.05); }

        .input-area {
          background: rgba(15,15,15,0.95);
          backdrop-filter: blur(24px);
          border: 0.5px solid rgba(255,255,255,0.08);
          transition: border-color 0.2s;
        }
        .input-area:focus-within {
          border-color: rgba(245,158,11,0.3);
          box-shadow: 0 0 0 1px rgba(245,158,11,0.12), 0 0 32px rgba(245,158,11,0.05);
        }

        .ambient-top   { background: radial-gradient(ellipse 60% 40% at 50% 0%, rgba(245,158,11,0.055) 0%, transparent 70%); }
        .status-dot    { animation: glow-pulse 2s ease-in-out infinite; }
        .budget-shimmer {
          background: linear-gradient(90deg,transparent,rgba(245,158,11,0.04),transparent);
          background-size: 200% 100%;
          animation: shimmer 3s infinite;
        }

        .scrollbar-hide::-webkit-scrollbar { display:none; }
        .scrollbar-thin::-webkit-scrollbar { width:3px; }
        .scrollbar-thin::-webkit-scrollbar-track { background:transparent; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.08); border-radius:99px; }

        .suggestion-btn { transition: all 0.18s ease; }
        .suggestion-btn:hover { transform: translateY(-1px); }

        /* Smooth textarea */
        textarea { scrollbar-width: none; }
        textarea::-webkit-scrollbar { display: none; }
      `}</style>

      <div className="h-screen w-screen flex overflow-hidden main-bg text-white font-body antialiased relative">
        {/* Ambient layers */}
        <div className="ambient-top absolute inset-0 pointer-events-none z-0" />
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-amber-500/[0.025] rounded-full blur-[140px] pointer-events-none z-0" />
        <div className="absolute bottom-0 left-1/3 w-[300px] h-[300px] bg-amber-600/[0.015] rounded-full blur-[100px] pointer-events-none z-0" />

        {/* ── Mobile top bar ── */}
        <div className="md:hidden fixed top-0 left-0 right-0 h-14 z-50 flex items-center justify-between px-4 border-b border-white/[0.05]"
          style={{ background: "rgba(8,8,8,0.92)", backdropFilter: "blur(20px)" }}>
          <button onClick={() => setSidebarOpen(true)} className="text-white/40 hover:text-white/70 transition-colors">
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-display text-base font-bold tracking-tight">
            Market<span className="gold-text">Xpress</span>
          </span>
          <div className="w-7 h-7 rounded-lg hairline-gold bg-amber-400/[0.08] flex items-center justify-center text-[11px] font-mono text-amber-400">B</div>
        </div>

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/70 z-40 md:hidden backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        )}

        {/* ════ SIDEBAR ════ */}
        <aside className={`
          fixed inset-y-0 left-0 z-50 w-72 sidebar-bg flex flex-col border-r border-white/[0.05]
          transform transition-transform duration-300 ease-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:relative md:translate-x-0 md:flex
        `}>
          <button onClick={() => setSidebarOpen(false)}
            className="md:hidden absolute top-4 right-4 text-white/30 hover:text-white/60 transition-colors z-10">
            <X className="w-4 h-4" />
          </button>

          {/* Logo */}
          <div className="px-5 pt-5 pb-4 border-b border-white/[0.05]">
            <div className="font-display text-xl font-bold tracking-tight">
              Market<span className="gold-text">Xpress</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 status-dot" />
              <span className="text-[10px] font-mono text-white/25 uppercase tracking-widest">Engine Online</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-4 space-y-5">
            {/* New deal */}
            <button
              onClick={() => { setMessages([]); setHasMessages(false); }}
              className="w-full hairline hover:border-amber-400/25 bg-white/[0.02] hover:bg-amber-400/[0.04] text-white/60 hover:text-amber-400 transition-all duration-200 rounded-xl py-3 px-4 flex items-center gap-2.5 text-[13px] font-medium group"
            >
              <Plus className="w-4 h-4 text-amber-400/50 group-hover:text-amber-400 transition-colors" />
              New Deal Sourcing
            </button>

            {/* Budget cap */}
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

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl hairline bg-white/[0.015] px-3 py-2.5">
                <StatBadge label="Vendors" value={8200} suffix="+" />
              </div>
              <div className="rounded-xl hairline bg-white/[0.015] px-3 py-2.5">
                <StatBadge label="Avg. Saved" value={847} suffix="₦" />
              </div>
            </div>

            {/* History */}
            <div>
              <span className="block text-[10px] font-mono uppercase tracking-widest text-white/20 px-1 mb-2">
                Recent Calculations
              </span>
              <div className="space-y-0.5">
                {chatHistory.map((chat) => (
                  <HistoryItem key={chat.id} chat={chat} active={activeChat === chat.id} onClick={() => setActiveChat(chat.id)} />
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
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

        {/* ════ MAIN AREA ════ */}
        <main className="flex-1 flex flex-col min-w-0 pt-14 md:pt-0 relative z-10">

          {/* Header bar — only show when there are messages */}
          {hasMessages && (
            <div className="hidden md:flex items-center justify-between px-6 py-3.5 border-b border-white/[0.05]"
              style={{ background: "rgba(12,12,12,0.85)", backdropFilter: "blur(12px)" }}>
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-white/25 uppercase tracking-widest">Active Thread</span>
                <span className="text-xs font-mono text-white/50">—</span>
                <span className="text-sm text-white/60">
                  {chatHistory.find((c) => c.id === activeChat)?.title ?? "New Session"}
                </span>
              </div>
              <div className="text-[11px] font-mono text-white/25 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 status-dot" />
                Engine nominal · {messages.length} turns
              </div>
            </div>
          )}

          {/* Feed */}
          <div
            ref={feedRef}
            className={`flex-1 overflow-y-auto scrollbar-thin relative ${
              hasMessages ? "px-4 md:px-8 py-6" : "overflow-hidden"
            }`}
          >
            {!hasMessages ? (
              /* ── Centered empty state ── */
              <EmptyState onSuggestion={handleSuggestion} />
            ) : (
              <div className="max-w-3xl mx-auto space-y-5">
                {messages.map((msg) => (
                  <Bubble key={msg.id} msg={msg} />
                ))}
                {isLoading && <TypingIndicator />}
              </div>
            )}
          </div>

          {/* ── Input bar ── */}
          <div className={`px-4 md:px-8 pb-6 transition-all duration-500 ${hasMessages ? "pt-3" : "pt-0"}`}
            style={{ background: hasMessages ? "linear-gradient(to top, #0C0C0C 65%, transparent)" : "transparent" }}>
            <div className="max-w-3xl mx-auto">
              <div className="input-area rounded-2xl overflow-hidden">
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
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(inputMessage); }
                  }}
                  placeholder={hasMessages
                    ? "Continue the negotiation…"
                    : "I want to cook jollof rice for 6 people under ₦3,000…"
                  }
                  className="w-full bg-transparent border-none outline-none resize-none py-4 pl-4 pr-16 text-[13px] text-white/80 placeholder-white/20 font-body leading-relaxed transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ minHeight: "52px", maxHeight: "120px" }}
                />
                <div className="flex items-center justify-between px-4 pb-3">
                  <span className="text-[10px] font-mono text-white/15 flex items-center gap-1.5">
                    <Zap className="w-2.5 h-2.5 text-amber-400/30" />
                    Constraint engine · MarketXpressAi
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-white/12">⏎ send · ⇧⏎ newline</span>
                    <button
                      onClick={handleSendMessage}
                      disabled={isLoading || !inputMessage.trim()}
                      className="send-btn w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 disabled:cursor-not-allowed hover:scale-105 active:scale-95 ml-1"
                    >
                      <Send className="w-3.5 h-3.5 text-black" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default ClientDashboard;