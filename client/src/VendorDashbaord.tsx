import { useState, useEffect } from "react";
import {
  Store, Plus, LogOut, Package,
  Menu, X, Edit2, Tag, Zap,
  TrendingUp, AlertTriangle, CheckCircle2,
  ChevronRight, BarChart3
} from "lucide-react";

/* ─── Font injection ─── */
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

interface InventoryItem {
  id: string;
  name: string;
  advertised: string;
  minimum: string;
  stock: number;
  unit_type: string;
  created_at: string;
}

type ModalMode = "ADD" | "EDIT";

/* ─── Stock status chip ─── */
const StockChip = ({ stock }: { stock: number }) => {
  if (stock > 20) return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-medium bg-emerald-400/[0.08] border border-emerald-400/20 text-emerald-400">
      <CheckCircle2 className="w-2.5 h-2.5" /> Optimal
    </span>
  );
  if (stock > 5) return (
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

/* ─── Form field ─── */
const Field = ({
  label, children
}: { label: string; children: React.ReactNode }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[10px] font-mono uppercase tracking-widest text-white/30">{label}</label>
    {children}
  </div>
);

const inputCls = "w-full bg-[#0a0a0a] border border-white/[0.07] hover:border-white/[0.12] focus:border-amber-400/40 focus:ring-1 focus:ring-amber-400/[0.15] rounded-xl py-2.5 px-3.5 text-[13px] text-white/85 outline-none transition-all duration-200 placeholder-white/20 font-body";
const monoInputCls = inputCls + " font-mono text-amber-400";

/* ══════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════ */
const VendorDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>("ADD");
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "", advertised: "", minimum: "", stock: "", unit_type: "MUDU"
  });

  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("user_token");

  const fetchInventory = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${baseUrl}/vendor/inventory`, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
      });
      if (res.ok) {
        const result = await res.json();
        setInventory(Array.isArray(result.inventory) ? result.inventory : []);
      }
    } catch (err) {
      console.error("Inventory fetch error:", err);
      setInventory([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { if (token) fetchInventory(); }, [baseUrl, token]);

  const openAddModal = () => {
    setModalMode("ADD");
    setSelectedProductId(null);
    setFormData({ name: "", advertised: "", minimum: "", stock: "", unit_type: "MUDU" });
    setIsModalOpen(true);
  };

  const openEditModal = (item: InventoryItem) => {
    setModalMode("EDIT");
    setSelectedProductId(item.id);
    setFormData({ name: item.name, advertised: item.advertised, minimum: item.minimum, stock: item.stock.toString(), unit_type: item.unit_type });
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
      unit_type: formData.unit_type
    };
    try {
      const url = modalMode === "EDIT"
        ? `${baseUrl}/vendor/update/${selectedProductId}`
        : `${baseUrl}/vendor/add`;
      const res = await fetch(url, {
        method: modalMode === "EDIT" ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      if (res.ok) { setIsModalOpen(false); fetchInventory(); }
      else { const e = await res.json(); alert(`Error: ${e.message || "Unknown error"}`); }
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

  /* Derived stats */
  const totalStock = inventory.reduce((s, i) => s + i.stock, 0);
  const criticalItems = inventory.filter(i => i.stock <= 5).length;
  const avgAdv = inventory.length
    ? (inventory.reduce((s, i) => s + parseFloat(i.advertised), 0) / inventory.length)
    : 0;

  return (
    <>
      <FontLoader />
      <style>{`
        @keyframes slide-up { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fade-in  { from { opacity:0; } to { opacity:1; } }
        @keyframes glow-pulse { 0%,100% { opacity:.4; } 50% { opacity:.9; } }
        @keyframes shimmer { 0% { background-position:-200% 0; } 100% { background-position:200% 0; } }
        .animate-slide-up { animation: slide-up 0.35s cubic-bezier(.22,.68,0,1.2) both; }
        .animate-fade-in  { animation: fade-in  0.25s ease both; }
        .font-display { font-family:'Syne',sans-serif; }
        .font-body    { font-family:'DM Sans',monospace; }
        .font-mono    { font-family:'JetBrains Mono',monospace; }
        .gold-text { background:linear-gradient(135deg,#F59E0B,#FCD34D 50%,#F59E0B); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
        .gold-btn { background:linear-gradient(135deg,#F59E0B,#D97706); }
        .gold-btn:hover { background:linear-gradient(135deg,#FCD34D,#F59E0B); }
        .hairline { border: 0.5px solid rgba(255,255,255,0.07); }
        .hairline-gold { border: 0.5px solid rgba(245,158,11,0.22); }
        .sidebar-bg { background:#080808; }
        .main-bg    { background:#0C0C0C; }
        .ambient { background:radial-gradient(ellipse 50% 50% at 70% 0%, rgba(245,158,11,0.055) 0%, transparent 70%); }
        .status-dot { animation: glow-pulse 2s ease-in-out infinite; }
        .shimmer-row { background:linear-gradient(90deg,rgba(255,255,255,0) 0%,rgba(255,255,255,0.02) 50%,rgba(255,255,255,0) 100%); background-size:200% 100%; animation:shimmer 1.6s infinite; }
        .scrollbar-thin::-webkit-scrollbar { width:3px; }
        .scrollbar-thin::-webkit-scrollbar-track { background:transparent; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.07); border-radius:99px; }
        .stat-card { background:rgba(255,255,255,0.015); }
        .row-hover:hover { background:rgba(255,255,255,0.018); }
        .modal-bg { background:rgba(0,0,0,0.75); backdrop-filter:blur(16px); }
        .modal-card { background:#090909; border:0.5px solid rgba(255,255,255,0.1); }
        select option { background:#111; color:white; }
      `}</style>

      <div className="h-screen w-screen flex overflow-hidden main-bg text-white font-body antialiased">
        <div className="ambient absolute inset-0 pointer-events-none z-0" />

        {/* ── Mobile nav ── */}
        <div className="md:hidden fixed top-0 left-0 right-0 h-14 z-50 flex items-center justify-between px-4 border-b border-white/[0.05]"
          style={{ background: "rgba(8,8,8,0.92)", backdropFilter: "blur(20px)" }}>
          <button onClick={() => setSidebarOpen(true)} className="text-white/40 hover:text-white/70 transition-colors">
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-display text-base font-bold">Market<span className="gold-text">Xpress</span></span>
          <div className="w-7 h-7 rounded-lg hairline-gold bg-amber-400/[0.07] flex items-center justify-center text-[11px] font-mono text-amber-400">V</div>
        </div>

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        )}

        {/* ════════════════════
            SIDEBAR
        ════════════════════ */}
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
              <span className="text-[10px] font-mono text-white/25 uppercase tracking-widest">Vendor Node Active</span>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-5 space-y-5">

            {/* Provision button */}
            <button onClick={openAddModal}
              className="gold-btn w-full text-black font-display font-bold text-[13px] py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-amber-500/10">
              <Plus className="w-4 h-4 stroke-[2.5px]" />
              Provision Stock Item
            </button>

            {/* Inventory summary */}
            <div className="rounded-xl hairline overflow-hidden">
              <div className="px-4 py-2 border-b border-white/[0.05] flex items-center gap-2">
                <BarChart3 className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[10px] font-mono uppercase tracking-widest text-white/30">Inventory Pulse</span>
              </div>
              <div className="grid grid-cols-3 divide-x divide-white/[0.05]">
                {[
                  { label: "Items", value: inventory.length },
                  { label: "Total Stock", value: totalStock },
                  { label: "Critical", value: criticalItems },
                ].map((s, i) => (
                  <div key={i} className="px-3 py-3 stat-card flex flex-col gap-0.5">
                    <span className="text-[9px] font-mono uppercase tracking-widest text-white/25">{s.label}</span>
                    <span className={`text-base font-mono font-medium ${i === 2 && s.value > 0 ? "text-red-400" : "text-amber-400"}`}>
                      {s.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Avg price */}
            <div className="rounded-xl hairline bg-white/[0.01] px-4 py-3.5">
              <span className="text-[10px] font-mono uppercase tracking-widest text-white/25">Avg. Advertised Price</span>
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
                <div className="text-[13px] font-medium text-white/70 truncate">Vendor Node</div>
                <div className="text-[10px] font-mono text-white/25">Active Inventory Manager</div>
              </div>
              <Zap className="w-3 h-3 text-amber-400/40 shrink-0" />
            </div>
            <button onClick={handleLogout}
              className="w-full hover:bg-red-500/[0.08] text-white/30 hover:text-red-400/70 rounded-xl py-2.5 px-3 flex items-center gap-2.5 text-xs font-mono transition-all duration-200">
              <LogOut className="w-3.5 h-3.5" />
              Disconnect Node
            </button>
          </div>
        </aside>

        {/* ════════════════════
            MAIN PANEL
        ════════════════════ */}
        <main className="flex-1 flex flex-col min-w-0 pt-14 md:pt-0 overflow-hidden relative z-10">

          {/* Top bar */}
          <div className="hidden md:flex items-center justify-between px-7 py-3.5 border-b border-white/[0.05] shrink-0"
            style={{ background: "rgba(12,12,12,0.85)", backdropFilter: "blur(12px)" }}>
            <div>
              <h1 className="font-display text-lg font-bold tracking-tight">Merchant Command Center</h1>
              <p className="text-[11px] font-mono text-white/25 mt-0.5">Live inventory · routed to the Decider Engine in real-time</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-mono text-white/25 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 status-dot" />
                {inventory.length} product models mapped
              </span>
              <button onClick={openAddModal}
                className="gold-btn text-black font-display font-bold text-xs py-2 px-4 rounded-lg flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95">
                <Plus className="w-3.5 h-3.5 stroke-[2.5px]" />
                Add Item
              </button>
            </div>
          </div>

          {/* Table area */}
          <div className="flex-1 overflow-y-auto scrollbar-thin px-4 md:px-7 py-6">
            <div className="max-w-5xl mx-auto">

              {/* Table card */}
              <div className="rounded-2xl hairline overflow-hidden" style={{ background: "rgba(10,10,10,0.8)" }}>

                {/* Table header */}
                <div className="px-5 py-3.5 border-b border-white/[0.05] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-[13px] font-medium text-white/70">Active Stock Array</span>
                  </div>
                  <span className="text-[10px] font-mono text-white/25 uppercase tracking-widest">
                    {inventory.length} live item models
                  </span>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left" style={{ minWidth: "600px" }}>
                    <thead>
                      <tr className="border-b border-white/[0.04]">
                        {["Item · Unit", "Advertised", "Floor Min", "Stock Depth", ""].map((h, i) => (
                          <th key={i} className={`py-3 px-5 text-[9px] font-mono uppercase tracking-widest text-white/25 ${i === 4 ? "text-right" : ""}`}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.035]">

                      {/* Loading skeleton */}
                      {isLoading && Array.from({ length: 4 }).map((_, i) => (
                        <tr key={i} className="shimmer-row">
                          {Array.from({ length: 5 }).map((_, j) => (
                            <td key={j} className="py-5 px-5">
                              <div className="h-3 rounded-md bg-white/[0.05]" style={{ width: j === 0 ? "120px" : j === 4 ? "60px" : "80px" }} />
                            </td>
                          ))}
                        </tr>
                      ))}

                      {/* Empty state */}
                      {!isLoading && inventory.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-20 text-center">
                            <Package className="w-8 h-8 text-white/10 mx-auto mb-3" />
                            <p className="text-xs font-mono text-white/20 uppercase tracking-widest">No product models mapped</p>
                            <p className="text-[11px] text-white/15 mt-1">Provision your first stock item to begin routing</p>
                          </td>
                        </tr>
                      )}

                      {/* Data rows */}
                      {!isLoading && inventory.map((item, idx) => (
                        <tr key={item.id}
                          className="row-hover transition-colors duration-150 animate-slide-up group"
                          style={{ animationDelay: `${idx * 0.04}s` }}>

                          {/* Item name */}
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-lg bg-amber-400/[0.06] border border-amber-400/15 flex items-center justify-center shrink-0 group-hover:border-amber-400/30 transition-colors">
                                <Tag className="w-3 h-3 text-amber-400/60" />
                              </div>
                              <div>
                                <div className="text-[13px] font-display font-bold text-white/85 tracking-wide leading-tight">{item.name}</div>
                                <div className="text-[10px] font-mono text-white/25 mt-0.5">{item.unit_type}</div>
                              </div>
                            </div>
                          </td>

                          {/* Advertised */}
                          <td className="py-4 px-5">
                            <span className="font-mono text-sm font-medium text-amber-400">
                              ₦{parseFloat(item.advertised).toLocaleString()}
                            </span>
                          </td>

                          {/* Floor min */}
                          <td className="py-4 px-5">
                            <span className="font-mono text-sm text-white/40">
                              ₦{parseFloat(item.minimum).toLocaleString()}
                            </span>
                          </td>

                          {/* Stock */}
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-2.5">
                              <span className="font-mono text-sm text-white/70">{item.stock}</span>
                              <StockChip stock={item.stock} />
                            </div>
                          </td>

                          {/* Action */}
                          <td className="py-4 px-5 text-right">
                            <button onClick={() => openEditModal(item)}
                              className="inline-flex items-center gap-1.5 text-[11px] font-mono text-white/35 hover:text-amber-400 hairline hover:border-amber-400/25 bg-white/[0.02] hover:bg-amber-400/[0.04] rounded-lg py-1.5 px-3 transition-all duration-200 group/btn">
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
        </main>
      </div>

      {/* ════════════════════
          MODAL
      ════════════════════ */}
      {isModalOpen && (
        <div className="fixed inset-0 modal-bg flex items-center justify-center p-4 z-[60] animate-fade-in">
          <div className="modal-card rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-slide-up">

            {/* Modal header */}
            <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-400/10 border border-amber-400/20 flex items-center justify-center">
                  <Store className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <div>
                  <div className="text-[13px] font-display font-bold text-white/85">
                    {modalMode === "ADD" ? "Provision Stock Item" : "Modify Inventory Node"}
                  </div>
                  <div className="text-[10px] font-mono text-white/25 uppercase tracking-widest">
                    {modalMode === "ADD" ? "New product schema" : `Editing · ${formData.name || "—"}`}
                  </div>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)}
                className="text-white/25 hover:text-white/60 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal form */}
            <form onSubmit={handleFormSubmit} className="px-6 py-5 space-y-4">

              <Field label="Item Name">
                <input type="text" required value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., EGUSI, RICE, TOMATOES"
                  className={inputCls} />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Advertised Price (₦)">
                  <input type="number" required value={formData.advertised}
                    onChange={(e) => setFormData({ ...formData, advertised: e.target.value })}
                    placeholder="3400"
                    className={monoInputCls} />
                </Field>
                <Field label="Floor Minimum (₦)">
                  <input type="number" required value={formData.minimum}
                    onChange={(e) => setFormData({ ...formData, minimum: e.target.value })}
                    placeholder="2900"
                    className={inputCls} />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Stock Depth">
                  <input type="number" required value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="25"
                    className={inputCls} />
                </Field>
                <Field label="Unit Type">
                  <select value={formData.unit_type}
                    onChange={(e) => setFormData({ ...formData, unit_type: e.target.value })}
                    className={inputCls + " cursor-pointer"}>
                    {["MUDU", "TUBER", "CUP", "BOTTLE", "PAINT_BUCKET"].map(u => (
                      <option key={u} value={u}>{u.replace("_", " ")}</option>
                    ))}
                  </select>
                </Field>
              </div>

              {/* Price margin indicator */}
              {formData.advertised && formData.minimum && (
                <div className="rounded-xl hairline-gold bg-amber-400/[0.03] px-4 py-3 flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-white/30">Margin Width</span>
                  <span className="text-sm font-mono font-medium text-amber-400">
                    ₦{(parseFloat(formData.advertised) - parseFloat(formData.minimum)).toLocaleString()}
                    {" "}
                    <span className="text-[11px] text-white/30">
                      ({formData.minimum && formData.advertised
                        ? ((1 - parseFloat(formData.minimum) / parseFloat(formData.advertised)) * 100).toFixed(1)
                        : 0}% flex)
                    </span>
                  </span>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setIsModalOpen(false)}
                  className="flex-1 hairline bg-white/[0.02] hover:bg-white/[0.04] text-white/50 hover:text-white/70 rounded-xl py-2.5 text-[13px] font-medium transition-all">
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  className="flex-1 gold-btn text-black font-display font-bold rounded-xl py-2.5 text-[13px] transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed">
                  {submitting
                    ? "Processing..."
                    : modalMode === "ADD" ? "Commit Stock" : "Apply Mutation"}
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