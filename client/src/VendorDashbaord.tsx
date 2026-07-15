import { useState, useEffect, useCallback } from "react";
import {
  Store,
  Plus,
  LogOut,
  Package,
  Menu,
  X,
  Edit2,
  Tag,
  Zap,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  BarChart3,
  Handshake,
  Clock,
  ShoppingBag,
  TrendingDown,
  RefreshCw,
  XCircle,
  CheckCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";

/* ─── Font injection ─── */
const FontLoader = () => {
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=JetBrains+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap";
    document.head.appendChild(link);
    return () => {
      if (document.head.contains(link)) document.head.removeChild(link);
    };
  }, []);
  return null;
};

/* ─── Types ─── */
interface InventoryItem {
  id: string;
  name: string;
  advertised: string;
  minimum: string;
  stock: number;
  unit_type: string;
  created_at: string;
}

interface DealLineItem {
  id: string;
  product_name: string;
  quantity: number;
  unit_type: string;
  negotiated_price: string;
  line_total: string;
}

type DealStatus =
  | "PENDING"
  | "PENDING_VENDOR"
  | "ACCEPTED"
  | "REJECTED"
  | "COLLECTED";
interface Deal {
  id: string;
  buyer_id: string;
  total_cost: string;
  total_savings: string;
  status: DealStatus;
  buyer_confirmed: boolean;
  vendor_confirmed: boolean;
  qr_verification_code: string;
  created_at: string;
  items: DealLineItem[];
}

type ModalMode = "ADD" | "EDIT";
type ActiveTab = "INVENTORY" | "DEALS";

/* ─── Shared styles ─── */
const inputCls =
  "w-full bg-[#0a0a0a] border border-white/[0.07] hover:border-white/[0.12] focus:border-amber-400/40 focus:ring-1 focus:ring-amber-400/[0.15] rounded-xl py-2.5 px-3.5 text-[13px] text-white/85 outline-none transition-all duration-200 placeholder-white/20 font-body";
const monoInputCls = inputCls + " font-mono text-amber-400";

/* ─── Stock chip ─── */
const StockChip = ({ stock }: { stock: number }) => {
  if (stock > 20)
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-medium bg-emerald-400/[0.08] border border-emerald-400/20 text-emerald-400">
        <CheckCircle2 className="w-2.5 h-2.5" /> Optimal
      </span>
    );
  if (stock > 5)
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-medium bg-amber-400/[0.08] border border-amber-400/20 text-amber-400">
        <TrendingUp className="w-2.5 h-2.5" /> Low Stock
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-medium bg-red-400/[0.08] border border-red-400/20 text-red-400">
      <AlertTriangle className="w-2.5 h-2.5" /> Critical
    </span>
  );
};

/* ─── Deal status badge ─── */
const DealBadge = ({ status }: { status: DealStatus }) => {
  const map: Record<
    DealStatus,
    { cls: string; icon: React.ReactNode; label: string }
  > = {
    PENDING: {
      cls: "bg-amber-400/[0.08] border-amber-400/25 text-amber-400",
      icon: <Clock className="w-2.5 h-2.5" />,
      label: "Awaiting Your Action",
    },
    PENDING_VENDOR: {
      cls: "bg-blue-400/[0.08] border-blue-400/25 text-blue-400",
      icon: <Loader2 className="w-2.5 h-2.5 animate-spin" />,
      label: "Awaiting Buyer Confirmation",
    },
    ACCEPTED: {
      cls: "bg-emerald-400/[0.08] border-emerald-400/25 text-emerald-400",
      icon: <CheckCircle className="w-2.5 h-2.5" />,
      label: "Accepted",
    },
    REJECTED: {
      cls: "bg-red-400/[0.08] border-red-400/25 text-red-400",
      icon: <XCircle className="w-2.5 h-2.5" />,
      label: "Rejected",
    },
    COLLECTED: {
      cls: "bg-blue-400/[0.08] border-blue-400/25 text-blue-400",
      icon: <CheckCircle2 className="w-2.5 h-2.5" />,
      label: "Collected",
    },
  };
  const { cls, icon, label } = map[status] ?? map.PENDING_VENDOR;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-medium border ${cls}`}
    >
      {icon} {label}
    </span>
  );
};

/* ─── Deal Card (expanded) ─── */
const DealCard = ({
  deal,
  onAccept,
  onReject,
  actioning,
}: {
  deal: Deal;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  actioning: boolean;
}) => {
  const [expanded, setExpanded] = useState(false);
  const ts = new Date(deal.created_at).toLocaleString("en-NG", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="rounded-xl border border-white/[0.06] overflow-hidden bg-[#0a0a0a] animate-slide-up deal-card">
      {/* Header row */}
      <div className="px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-amber-400/[0.08] border border-amber-400/20 flex items-center justify-center shrink-0">
            <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="min-w-0">
            <div className="text-[12px] font-mono text-white/30 uppercase tracking-widest truncate">
              Deal <span className="text-amber-400/60">{deal.id}…</span>
            </div>
            <div className="text-[10px] font-mono text-white/20 flex items-center gap-1 mt-0.5">
              <Clock className="w-2.5 h-2.5" /> {ts}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
          <DealBadge status={deal.status} />
          <div className="flex items-center gap-1 text-emerald-400 text-[11px] font-mono">
            <TrendingDown className="w-3 h-3" />
            Save ₦{parseFloat(deal.total_savings).toLocaleString()}
          </div>
          <span className="text-sm font-mono font-bold text-amber-400">
            ₦{parseFloat(deal.total_cost).toLocaleString()}
          </span>
          <button
            onClick={() => setExpanded((p) => !p)}
            className="text-white/25 hover:text-amber-400 transition-colors ml-1"
          >
            <ChevronRight
              className={`w-4 h-4 transition-transform duration-200 ${expanded ? "rotate-90" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* Expanded line items */}
      {expanded && (
        <div className="border-t border-white/[0.05] animate-slide-up">
          {/* Items table */}
          <div className="px-4 py-3 space-y-1.5">
            <span className="text-[9px] font-mono uppercase tracking-widest text-white/20">
              Line Items
            </span>
            {(deal.items ?? []).map((item, i) => (
              <div
                key={item.id ?? i}
                className="flex items-center justify-between py-1.5 border-b border-white/[0.03] last:border-0"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-white/15 w-4">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-xs text-white/70">
                    {item.product_name}
                  </span>
                  <span className="text-[10px] text-white/30 font-mono">
                    {item.quantity} {item.unit_type}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-right">
                  <span className="text-[10px] font-mono text-white/25">
                    @₦{parseFloat(item.negotiated_price).toLocaleString()}
                  </span>
                  <span className="text-xs font-mono text-white/70">
                    ₦{parseFloat(item.line_total).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>

         

          {deal.status === "PENDING_VENDOR" && (
            <div className="mx-4 mb-4 px-3 py-2.5 rounded-xl bg-blue-400/[0.04] border border-blue-400/15 flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin shrink-0" />
              <span className="text-[11px] font-mono text-blue-400/80">
                Deal accepted — waiting for buyer to confirm collection
              </span>
            </div>
          )}

          {/* Action buttons — only for pending */}
          {deal.status === "PENDING" && (
            <div className="px-4 pb-4 flex gap-2">
              <button
                disabled={actioning}
                onClick={() => onReject(deal.id)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-red-400/20 bg-red-400/[0.04] hover:bg-red-400/[0.08] text-red-400/70 hover:text-red-400 text-[12px] font-mono transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {actioning ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <XCircle className="w-3 h-3" />
                )}
                Reject Deal
              </button>
              <button
                disabled={actioning}
                onClick={() => onAccept(deal.id)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-[12px] font-mono font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
              >
                {actioning ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <CheckCircle className="w-3 h-3" />
                )}
                Confirm Deal
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* ─── Form field wrapper ─── */
const Field = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[10px] font-mono uppercase tracking-widest text-white/30">
      {label}
    </label>
    {children}
  </div>
);

const VendorDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>("INVENTORY");

  /* Inventory state */
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [invLoading, setInvLoading] = useState(true);

  /* Deals state */
  const [deals, setDeals] = useState<Deal[]>([]);
  const [dealsLoading, setDealsLoading] = useState(false);
  const [actioningDealId, setActioningDealId] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  /* Modal state */
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>("ADD");
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null,
  );
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    advertised: "",
    minimum: "",
    stock: "",
    unit_type: "MUDU",
  });

  const baseUrl =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
  const token = localStorage.getItem("user_token");

  const fetchInventory = useCallback(async () => {
    setInvLoading(true);
    try {
      const res = await fetch(`${baseUrl}/vendor/inventory`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (res.ok) {
        const result = await res.json();
        setInventory(Array.isArray(result.inventory) ? result.inventory : []);
      }
    } catch (err) {
      console.error("Inventory fetch error:", err);
      setInventory([]);
    } finally {
      setInvLoading(false);
    }
  }, [baseUrl, token]);

  const fetchDeals = useCallback(async () => {
    setDealsLoading(true);
    try {
      const res = await fetch(`${baseUrl}/vendor/deals`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (res.ok) {
        const result = await res.json();
        const raw = Array.isArray(result.deals) ? result.deals : [];
        const normalized = raw.map((d: any) => ({
          ...d,
          id: d.id ?? d.deal_id,
        }));
        setDeals(normalized);
        setLastRefreshed(new Date());
        console.log(normalized);
      }
    } catch (err) {
      console.error("Deals fetch error:", err);
      setDeals([]);
    } finally {
      setDealsLoading(false);
    }
  }, [baseUrl, token]);

  useEffect(() => {
    if (!token) return;
    if (activeTab === "INVENTORY") fetchInventory();
    if (activeTab === "DEALS") fetchDeals();
  }, [activeTab, fetchInventory, fetchDeals, token]);

  /* Auto-poll deals every 30s when on deals tab */
  useEffect(() => {
    if (activeTab !== "DEALS") return;
    const interval = setInterval(fetchDeals, 30_000);
    return () => clearInterval(interval);
  }, [activeTab, fetchDeals]);

  /* ── Deal actions ── */
  const handleDealAction = async (
    dealId: string,
    action: "confirm" | "reject",
  ) => {
    setActioningDealId(dealId);
    try {
      const endpoint =
        action === "confirm"
          ? `${baseUrl}/deals/${dealId}/vendor-confirm`
          : `${baseUrl}/deals/${dealId}/reject`;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Action failed.");

       setDeals((prev) =>
        prev.map((d) =>
          d.id === dealId
            ? {
                ...d,
                status: action === "confirm" ? "PENDING_VENDOR" : "REJECTED",
                vendor_confirmed: action === "confirm",
              }
            : d,
        ),
      );
    } catch (err) {
      console.error("Deal action error:", err);
      alert(`Failed: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setActioningDealId(null);
    }
  };

  /* ── Modal helpers ── */
  const openAddModal = () => {
    setModalMode("ADD");
    setSelectedProductId(null);
    setFormData({
      name: "",
      advertised: "",
      minimum: "",
      stock: "",
      unit_type: "MUDU",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: InventoryItem) => {
    setModalMode("EDIT");
    setSelectedProductId(item.id);
    setFormData({
      name: item.name,
      advertised: item.advertised,
      minimum: item.minimum,
      stock: item.stock.toString(),
      unit_type: item.unit_type,
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const payload = {
      name: formData.name.toUpperCase(),
      advertised: formData.advertised,
      minimum: formData.minimum,
      stock: Number(formData.stock),
      unit_type: formData.unit_type,
    };
    try {
      const url =
        modalMode === "EDIT"
          ? `${baseUrl}/vendor/update/${selectedProductId}`
          : `${baseUrl}/vendor/add`;
      const res = await fetch(url, {
        method: modalMode === "EDIT" ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setIsModalOpen(false);
        fetchInventory();
      } else {
        const e = await res.json();
        alert(`Error: ${e.message || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Submit error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user_token");
    window.location.href = "/login";
  };

  /* ── Derived stats ── */
  const totalStock = inventory.reduce((s, i) => s + i.stock, 0);
  const criticalItems = inventory.filter((i) => i.stock <= 5).length;
  const avgAdv = inventory.length
    ? inventory.reduce((s, i) => s + parseFloat(i.advertised), 0) /
      inventory.length
    : 0;
  const pendingDeals = deals.filter((d) => d.status === "PENDING");
  const pendingVendorDeals = deals.filter((d) => d.status === "PENDING_VENDOR");
  const acceptedDeals = deals.filter((d) => d.status === "ACCEPTED");
  const rejectedDeals = deals.filter((d) => d.status === "REJECTED");
  return (
    <>
      <FontLoader />
      <style>{`
        @keyframes slide-up   { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fade-in    { from { opacity:0; } to { opacity:1; } }
        @keyframes glow-pulse { 0%,100% { opacity:.4; } 50% { opacity:.9; } }
        @keyframes shimmer    { 0% { background-position:-200% 0; } 100% { background-position:200% 0; } }
        @keyframes spin       { to { transform: rotate(360deg); } }

        .animate-slide-up { animation: slide-up 0.3s cubic-bezier(.22,.68,0,1.15) both; }
        .animate-fade-in  { animation: fade-in  0.22s ease both; }
        .font-display { font-family:'Syne',sans-serif; }
        .font-body    { font-family:'DM Sans',sans-serif; }
        .font-mono    { font-family:'JetBrains Mono',monospace; }

        .gold-text { background:linear-gradient(135deg,#F59E0B,#FCD34D 50%,#F59E0B); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
        .gold-btn  { background:linear-gradient(135deg,#F59E0B,#D97706); }
        .gold-btn:hover { background:linear-gradient(135deg,#FCD34D,#F59E0B); }

        .hairline      { border: 0.5px solid rgba(255,255,255,0.07); }
        .hairline-gold { border: 0.5px solid rgba(245,158,11,0.22); }
        .sidebar-bg    { background:#080808; }
        .main-bg       { background:#0C0C0C; }
        .ambient       { background:radial-gradient(ellipse 50% 50% at 70% 0%, rgba(245,158,11,0.05) 0%, transparent 70%); }

        .status-dot  { animation: glow-pulse 2s ease-in-out infinite; }
        .shimmer-row { background:linear-gradient(90deg,rgba(255,255,255,0) 0%,rgba(255,255,255,0.02) 50%,rgba(255,255,255,0) 100%); background-size:200% 100%; animation:shimmer 1.6s infinite; }

        .scrollbar-thin::-webkit-scrollbar { width:3px; }
        .scrollbar-thin::-webkit-scrollbar-track { background:transparent; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.07); border-radius:99px; }

        .stat-card  { background:rgba(255,255,255,0.015); }
        .row-hover:hover { background:rgba(255,255,255,0.018); }
        .modal-bg   { background:rgba(0,0,0,0.78); backdrop-filter:blur(18px); }
        .modal-card { background:#090909; border:0.5px solid rgba(255,255,255,0.1); }

        .tab-active   { border-bottom: 1.5px solid #F59E0B; color: rgba(255,255,255,0.85); }
        .tab-inactive { border-bottom: 1.5px solid transparent; color: rgba(255,255,255,0.3); }

        .deal-card { transition: all 0.2s ease; }
        .deal-card:hover { border-color: rgba(245,158,11,0.12); }

        select option { background:#111; color:white; }
      `}</style>

      <div className="h-screen w-screen flex overflow-hidden main-bg text-white font-body antialiased">
        <div className="ambient absolute inset-0 pointer-events-none z-0" />

        {/* ── Mobile nav ── */}
        <div
          className="md:hidden fixed top-0 left-0 right-0 h-14 z-50 flex items-center justify-between px-4 border-b border-white/[0.05]"
          style={{
            background: "rgba(8,8,8,0.92)",
            backdropFilter: "blur(20px)",
          }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-white/40 hover:text-white/70 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-display text-base font-bold">
            Market<span className="gold-text">Xpress</span>
          </span>
          <div className="w-7 h-7 rounded-lg hairline-gold bg-amber-400/[0.07] flex items-center justify-center text-[11px] font-mono text-amber-400">
            V
          </div>
        </div>

        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ════ SIDEBAR ════ */}
        <aside
          className={`
            fixed inset-y-0 left-0 z-50 w-72 sidebar-bg flex flex-col border-r border-white/[0.05]
            transform transition-transform duration-300 ease-out
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            md:relative md:translate-x-0 md:flex
          `}
        >
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden absolute top-4 right-4 text-white/30 hover:text-white/60 transition-colors z-10"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Logo */}
          <div className="px-5 pt-5 pb-4 border-b border-white/[0.05]">
            <div className="font-display text-xl font-bold tracking-tight">
              Market<span className="gold-text">Xpress</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 status-dot" />
              <span className="text-[10px] font-mono text-white/25 uppercase tracking-widest">
                Vendor Node Active
              </span>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-5 space-y-5">
            {/* Provision button */}
            <button
              onClick={openAddModal}
              className="gold-btn w-full text-black font-display font-bold text-[13px] py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-amber-500/10"
            >
              <Plus className="w-4 h-4 stroke-[2.5px]" />
              Provision Stock Item
            </button>

            {/* Inventory pulse */}
            <div className="rounded-xl hairline overflow-hidden">
              <div className="px-4 py-2 border-b border-white/[0.05] flex items-center gap-2">
                <BarChart3 className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[10px] font-mono uppercase tracking-widest text-white/30">
                  Inventory Pulse
                </span>
              </div>
              <div className="grid grid-cols-3 divide-x divide-white/[0.05]">
                {[
                  { label: "Items", value: inventory.length },
                  { label: "Stock", value: totalStock },
                  { label: "Critical", value: criticalItems },
                ].map((s, i) => (
                  <div
                    key={i}
                    className="px-3 py-3 stat-card flex flex-col gap-0.5"
                  >
                    <span className="text-[9px] font-mono uppercase tracking-widest text-white/25">
                      {s.label}
                    </span>
                    <span
                      className={`text-base font-mono font-medium ${i === 2 && s.value > 0 ? "text-red-400" : "text-amber-400"}`}
                    >
                      {s.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Deals summary */}
            <div className="rounded-xl hairline overflow-hidden">
              <div className="px-4 py-2 border-b border-white/[0.05] flex items-center gap-2">
                <Handshake className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[10px] font-mono uppercase tracking-widest text-white/30">
                  Deal Pipeline
                </span>
              </div>
              <div className="grid grid-cols-3 divide-x divide-white/[0.05]">
                {[
                  {
                    label: "Pending",
                    value: pendingDeals.length + pendingVendorDeals.length,
                    color: "text-amber-400",
                  },
                  {
                    label: "Accepted",
                    value: acceptedDeals.length,
                    color: "text-emerald-400",
                  },
                  {
                    label: "Rejected",
                    value: rejectedDeals.length,
                    color: "text-red-400",
                  },
                ].map((s, i) => (
                  <div
                    key={i}
                    className="px-3 py-3 stat-card flex flex-col gap-0.5"
                  >
                    <span className="text-[9px] font-mono uppercase tracking-widest text-white/25">
                      {s.label}
                    </span>
                    <span
                      className={`text-base font-mono font-medium ${s.color}`}
                    >
                      {s.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Avg price */}
            <div className="rounded-xl hairline bg-white/[0.01] px-4 py-3.5">
              <span className="text-[10px] font-mono uppercase tracking-widest text-white/25">
                Avg. Advertised Price
              </span>
              <div className="text-2xl font-mono font-medium text-amber-400 mt-1">
                ₦{avgAdv.toLocaleString("en-NG", { maximumFractionDigits: 0 })}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-white/[0.05] p-4 space-y-1">
            <div className="flex items-center gap-3 px-3 py-2 rounded-xl hairline bg-white/[0.015]">
              <div className="w-7 h-7 rounded-lg bg-amber-400/10 border border-amber-400/20 flex items-center justify-center">
                <Store className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium text-white/70 truncate">
                  Vendor Node
                </div>
                <div className="text-[10px] font-mono text-white/25">
                  Active Inventory Manager
                </div>
              </div>
              <Zap className="w-3 h-3 text-amber-400/40 shrink-0" />
            </div>
            <button
              onClick={handleLogout}
              className="w-full hover:bg-red-500/[0.08] text-white/30 hover:text-red-400/70 rounded-xl py-2.5 px-3 flex items-center gap-2.5 text-xs font-mono transition-all duration-200"
            >
              <LogOut className="w-3.5 h-3.5" />
              Disconnect Node
            </button>
          </div>
        </aside>

        {/* ════ MAIN PANEL ════ */}
        <main className="flex-1 flex flex-col min-w-0 pt-14 md:pt-0 overflow-hidden relative z-10">
          {/* Top bar */}
          <div
            className="hidden md:flex items-center justify-between px-7 py-3.5 border-b border-white/[0.05] shrink-0"
            style={{
              background: "rgba(12,12,12,0.85)",
              backdropFilter: "blur(12px)",
            }}
          >
            <div>
              <h1 className="font-display text-lg font-bold tracking-tight">
                Merchant Command Center
              </h1>
              <p className="text-[11px] font-mono text-white/25 mt-0.5">
                Live inventory · routed to the Decider Engine in real-time
              </p>
            </div>
            <div className="flex items-center gap-3">
              {pendingDeals.length > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-400/[0.08] border border-amber-400/20">
                  <AlertCircle className="w-3 h-3 text-amber-400" />
                  <span className="text-[11px] font-mono text-amber-400">
                    {pendingDeals.length} deal
                    {pendingDeals.length !== 1 ? "s" : ""} awaiting action
                  </span>
                </div>
              )}
              <span className="text-[11px] font-mono text-white/25 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 status-dot" />
                {inventory.length} products mapped
              </span>
              <button
                onClick={openAddModal}
                className="gold-btn text-black font-display font-bold text-xs py-2 px-4 rounded-lg flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5px]" />
                Add Item
              </button>
            </div>
          </div>

          {/* ── Tabs ── */}
          <div
            className="flex border-b border-white/[0.05] shrink-0 px-7"
            style={{ background: "rgba(10,10,10,0.6)" }}
          >
            {(["INVENTORY", "DEALS"] as ActiveTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative py-3 px-1 mr-6 text-[12px] font-mono uppercase tracking-widest transition-all duration-200 ${
                  activeTab === tab
                    ? "tab-active"
                    : "tab-inactive hover:text-white/50"
                }`}
              >
                {tab === "INVENTORY" ? (
                  <span className="flex items-center gap-1.5">
                    <Package className="w-3 h-3" /> Inventory
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <Handshake className="w-3 h-3" /> Deals
                    {pendingDeals.length > 0 && (
                      <span className="ml-1 px-1.5 py-0.5 rounded-full text-[9px] font-mono bg-amber-400 text-black font-bold leading-none">
                        {pendingDeals.length}
                      </span>
                    )}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* ── INVENTORY TAB ── */}
          {activeTab === "INVENTORY" && (
            <div className="flex-1 overflow-y-auto scrollbar-thin px-4 md:px-7 py-6">
              <div className="max-w-5xl mx-auto">
                <div
                  className="rounded-2xl hairline overflow-hidden"
                  style={{ background: "rgba(10,10,10,0.8)" }}
                >
                  <div className="px-5 py-3.5 border-b border-white/[0.05] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Package className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-[13px] font-medium text-white/70">
                        Active Stock Array
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-white/25 uppercase tracking-widest">
                      {inventory.length} live item models
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table
                      className="w-full border-collapse text-left"
                      style={{ minWidth: "600px" }}
                    >
                      <thead>
                        <tr className="border-b border-white/[0.04]">
                          {[
                            "Item · Unit",
                            "Advertised",
                            "Floor Min",
                            "Stock Depth",
                            "",
                          ].map((h, i) => (
                            <th
                              key={i}
                              className={`py-3 px-5 text-[9px] font-mono uppercase tracking-widest text-white/25 ${i === 4 ? "text-right" : ""}`}
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.035]">
                        {invLoading &&
                          Array.from({ length: 4 }).map((_, i) => (
                            <tr key={i} className="shimmer-row">
                              {Array.from({ length: 5 }).map((_, j) => (
                                <td key={j} className="py-5 px-5">
                                  <div
                                    className="h-3 rounded-md bg-white/[0.05]"
                                    style={{
                                      width:
                                        j === 0
                                          ? "120px"
                                          : j === 4
                                            ? "60px"
                                            : "80px",
                                    }}
                                  />
                                </td>
                              ))}
                            </tr>
                          ))}

                        {!invLoading && inventory.length === 0 && (
                          <tr>
                            <td colSpan={5} className="py-20 text-center">
                              <Package className="w-8 h-8 text-white/10 mx-auto mb-3" />
                              <p className="text-xs font-mono text-white/20 uppercase tracking-widest">
                                No product models mapped
                              </p>
                              <p className="text-[11px] text-white/15 mt-1">
                                Provision your first stock item to begin routing
                              </p>
                            </td>
                          </tr>
                        )}

                        {!invLoading &&
                          inventory.map((item, idx) => (
                            <tr
                              key={item.id}
                              className="row-hover transition-colors duration-150 animate-slide-up group"
                              style={{ animationDelay: `${idx * 0.04}s` }}
                            >
                              <td className="py-4 px-5">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-7 h-7 rounded-lg bg-amber-400/[0.06] border border-amber-400/15 flex items-center justify-center shrink-0 group-hover:border-amber-400/30 transition-colors">
                                    <Tag className="w-3 h-3 text-amber-400/60" />
                                  </div>
                                  <div>
                                    <div className="text-[13px] font-display font-bold text-white/85 tracking-wide leading-tight">
                                      {item.name}
                                    </div>
                                    <div className="text-[10px] font-mono text-white/25 mt-0.5">
                                      {item.unit_type}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-5">
                                <span className="font-mono text-sm font-medium text-amber-400">
                                  ₦
                                  {parseFloat(item.advertised).toLocaleString()}
                                </span>
                              </td>
                              <td className="py-4 px-5">
                                <span className="font-mono text-sm text-white/40">
                                  ₦{parseFloat(item.minimum).toLocaleString()}
                                </span>
                              </td>
                              <td className="py-4 px-5">
                                <div className="flex items-center gap-2.5">
                                  <span className="font-mono text-sm text-white/70">
                                    {item.stock}
                                  </span>
                                  <StockChip stock={item.stock} />
                                </div>
                              </td>
                              <td className="py-4 px-5 text-right">
                                <button
                                  onClick={() => openEditModal(item)}
                                  className="inline-flex items-center gap-1.5 text-[11px] font-mono text-white/35 hover:text-amber-400 hairline hover:border-amber-400/25 bg-white/[0.02] hover:bg-amber-400/[0.04] rounded-lg py-1.5 px-3 transition-all duration-200 group/btn"
                                >
                                  <Edit2 className="w-3 h-3" />
                                  <span>Modify</span>
                                  <ChevronRight className="w-2.5 h-2.5 opacity-0 group-hover/btn:opacity-100 -translate-x-1 group-hover/btn:translate-x-0 transition-all" />
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── DEALS TAB ── */}
          {activeTab === "DEALS" && (
            <div className="flex-1 overflow-y-auto scrollbar-thin px-4 md:px-7 py-6">
              <div className="max-w-3xl mx-auto space-y-6">
                {/* Deals header row */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-display text-base font-bold text-white/80">
                      Deal Confirmation Queue
                    </h2>
                    <p className="text-[11px] font-mono text-white/25 mt-0.5">
                      {lastRefreshed
                        ? `Last synced ${lastRefreshed.toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`
                        : "Fetching..."}
                    </p>
                  </div>
                  <button
                    onClick={fetchDeals}
                    disabled={dealsLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hairline bg-white/[0.02] hover:bg-white/[0.04] text-white/35 hover:text-amber-400 text-[11px] font-mono transition-all disabled:opacity-40"
                  >
                    <RefreshCw
                      className={`w-3 h-3 ${dealsLoading ? "animate-spin" : ""}`}
                    />
                    Refresh
                  </button>
                </div>

                {/* Loading skeleton */}
                {dealsLoading && (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div
                        key={i}
                        className="rounded-xl border border-white/[0.05] h-16 shimmer-row"
                      />
                    ))}
                  </div>
                )}

                {/* Empty */}
                {!dealsLoading && deals.length === 0 && (
                  <div className="py-24 text-center">
                    <Handshake className="w-10 h-10 text-white/10 mx-auto mb-3" />
                    <p className="text-xs font-mono text-white/20 uppercase tracking-widest">
                      No deals in pipeline
                    </p>
                    <p className="text-[11px] text-white/15 mt-1">
                      Buyer optimization outputs will appear here
                    </p>
                  </div>
                )}

                {!dealsLoading && pendingDeals.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400/60">
                        Awaiting Action ({pendingDeals.length})
                      </span>
                      <div className="flex-1 h-[0.5px] bg-amber-400/10" />
                    </div>
                    {pendingDeals.map((deal) => (
                      <DealCard
                        key={deal.id}
                        deal={deal}
                        onAccept={() => handleDealAction(deal.id, "confirm")}
                        onReject={() => handleDealAction(deal.id, "reject")}
                        actioning={actioningDealId === deal.id}
                      />
                    ))}
                  </div>
                )}

                {pendingVendorDeals.map((deal) => (
                  <DealCard
                    key={deal.id}
                    deal={deal}
                    onAccept={() => handleDealAction(deal.id, "confirm")} 
                    onReject={() => handleDealAction(deal.id, "reject")} 
                    actioning={actioningDealId === deal.id}
                  />
                ))}

                {/* ── Accepted section ── */}
                {!dealsLoading && acceptedDeals.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400/50">
                        Accepted ({acceptedDeals.length})
                      </span>
                      <div className="flex-1 h-[0.5px] bg-emerald-400/10" />
                    </div>
                    {acceptedDeals.map((deal) => (
                      <DealCard
                        key={deal.id}
                        deal={deal}
                        onAccept={(id) => handleDealAction(id, "confirm")}
                        onReject={(id) => handleDealAction(id, "reject")}
                        actioning={actioningDealId === deal.id}
                      />
                    ))}
                  </div>
                )}

                {/* ── Rejected section ── */}
                {!dealsLoading && rejectedDeals.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-red-400/40">
                        Rejected ({rejectedDeals.length})
                      </span>
                      <div className="flex-1 h-[0.5px] bg-red-400/10" />
                    </div>
                    {rejectedDeals.map((deal) => (
                      <DealCard
                        key={deal.id}
                        deal={deal}
                        onAccept={(id) => handleDealAction(id, "confirm")}
                        onReject={(id) => handleDealAction(id, "reject")}
                        actioning={actioningDealId === deal.id}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ════ MODAL ════ */}
      {isModalOpen && (
        <div className="fixed inset-0 modal-bg flex items-center justify-center p-4 z-[60] animate-fade-in">
          <div className="modal-card rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-slide-up">
            <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-400/10 border border-amber-400/20 flex items-center justify-center">
                  <Store className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <div>
                  <div className="text-[13px] font-display font-bold text-white/85">
                    {modalMode === "ADD"
                      ? "Provision Stock Item"
                      : "Modify Inventory Node"}
                  </div>
                  <div className="text-[10px] font-mono text-white/25 uppercase tracking-widest">
                    {modalMode === "ADD"
                      ? "New product schema"
                      : `Editing · ${formData.name || "—"}`}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-white/25 hover:text-white/60 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="px-6 py-5 space-y-4">
              <Field label="Item Name">
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., EGUSI, RICE, TOMATOES"
                  className={inputCls}
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Advertised Price (₦)">
                  <input
                    type="number"
                    required
                    value={formData.advertised}
                    onChange={(e) =>
                      setFormData({ ...formData, advertised: e.target.value })
                    }
                    placeholder="3400"
                    className={monoInputCls}
                  />
                </Field>
                <Field label="Floor Minimum (₦)">
                  <input
                    type="number"
                    required
                    value={formData.minimum}
                    onChange={(e) =>
                      setFormData({ ...formData, minimum: e.target.value })
                    }
                    placeholder="2900"
                    className={inputCls}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Stock Depth">
                  <input
                    type="number"
                    required
                    value={formData.stock}
                    onChange={(e) =>
                      setFormData({ ...formData, stock: e.target.value })
                    }
                    placeholder="25"
                    className={inputCls}
                  />
                </Field>
                <Field label="Unit Type">
                  <select
                    value={formData.unit_type}
                    onChange={(e) =>
                      setFormData({ ...formData, unit_type: e.target.value })
                    }
                    className={inputCls + " cursor-pointer"}
                  >
                    {[
                      "MUDU",
                      "TUBER",
                      "CUP",
                      "BOTTLE",
                      "PAINT_BUCKET",
                      "PACK",
                      "KG",
                      "CONE",
                    ].map((u) => (
                      <option key={u} value={u}>
                        {u.replace("_", " ")}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              {formData.advertised && formData.minimum && (
                <div className="rounded-xl hairline-gold bg-amber-400/[0.03] px-4 py-3 flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-white/30">
                    Margin Width
                  </span>
                  <span className="text-sm font-mono font-medium text-amber-400">
                    ₦
                    {(
                      parseFloat(formData.advertised) -
                      parseFloat(formData.minimum)
                    ).toLocaleString()}{" "}
                    <span className="text-[11px] text-white/30">
                      (
                      {(
                        (1 -
                          parseFloat(formData.minimum) /
                            parseFloat(formData.advertised)) *
                        100
                      ).toFixed(1)}
                      % flex)
                    </span>
                  </span>
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 hairline bg-white/[0.02] hover:bg-white/[0.04] text-white/50 hover:text-white/70 rounded-xl py-2.5 text-[13px] font-medium transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 gold-btn text-black font-display font-bold rounded-xl py-2.5 text-[13px] transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting
                    ? "Processing..."
                    : modalMode === "ADD"
                      ? "Commit Stock"
                      : "Apply Mutation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default VendorDashboard;
