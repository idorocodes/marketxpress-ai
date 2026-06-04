import React, { useState } from "react";
import { 
  ShoppingBag, 
  Cpu, 
  Trash2, 
  Plus, 
  DollarSign, 
  CheckCircle, 
  AlertCircle, 
  Store,
  Sparkles,
  ArrowRight
} from "lucide-react";

interface RequiredItem {
  name: string;
  quantity: number;
}

interface OptimizedLineItem {
  id: string;
  product_name: string;
  vendor_name: string;
  stall_number: string;
  quantity: number;
  unit_type: string;
  negotiated_price: number;
  line_total: number;
  advertised: number;
}

interface EngineResult {
  feasible: boolean;
  line_items: OptimizedLineItem[];
  total_cost: number;
  total_savings: number;
  budget_remaining: number;
  reason?: string;
  meta: {
    combinations_evaluated: number;
    vendors_used: number;
    solve_ms: number;
  };
}

const MarketplaceOptimizer = () => {
  const [budget, setBudget] = useState<string>("");
  const [items, setItems] = useState<RequiredItem[]>([{ name: "RICE", quantity: 1 }]);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<EngineResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("user_token");

  const handleAddItem = () => {
    setItems([...items, { name: "RICE", quantity: 1 }]);
  };

  const handleRemoveItem = (index: number) => {
    const updated = [...items];
    updated.splice(index, 1);
    setItems(updated);
  };

  const handleItemChange = (index: number, field: keyof RequiredItem, value: any) => {
    const updated = [...items];
    if (field === "name") updated[index].name = value.toUpperCase();
    if (field === "quantity") updated[index].quantity = Math.max(1, parseInt(value) || 1);
    setItems(updated);
  };

  const triggerOptimization = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`${baseUrl}/decider/run`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          required_items: items,
          budget: Number(budget)
        })
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.message || "Failed to process constraints vector configuration matrix.");
      }

      setResult(resData.data);
    } catch (err: any) {
      setError(err.message || "Network handshake dropped running AI optimizer computation loop.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-black text-white p-4 md:p-8 relative overflow-x-hidden selection:bg-amber-500/30">
      <div className="absolute top-[-30%] left-[-10%] w-[700px] h-[700px] bg-amber-500/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-30%] right-[-10%] w-[700px] h-[700px] bg-yellow-600/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        
        {/* LEFT COLUMN: CRITERIA ENTRANCE FORM */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/20 bg-amber-500/5 text-xs font-mono font-semibold text-amber-400">
              <Cpu className="w-3.5 h-3.5 animate-spin duration-3000" />
              Constraint Engine Mode Activated
            </div>
            <h1 className="text-3xl font-bold tracking-tight">MarketXpress AI</h1>
            <p className="text-sm text-white/40">Provide item requirements and financial budget bounds to evaluate multi-vendor matrix solutions.</p>
          </div>

          <form onSubmit={triggerOptimization} className="bg-zinc-950/50 border border-white/[0.06] backdrop-blur-xl rounded-2xl p-6 space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-white/40 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-amber-400" /> Max Budget Cap (₦)
              </label>
              <input 
                type="number" required value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="e.g., 15000"
                className="w-full bg-black border border-white/10 rounded-xl py-3 px-4 text-sm font-mono text-amber-400 font-bold focus:outline-none focus:border-amber-400/40"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-white/[0.04] pb-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-white/40 flex items-center gap-1.5">
                  <ShoppingBag className="w-3.5 h-3.5 text-amber-400" /> Target Shopping Needs
                </label>
                <button 
                  type="button" onClick={handleAddItem}
                  className="text-xs font-bold text-amber-400 hover:text-amber-300 inline-flex items-center gap-1 bg-amber-400/5 border border-amber-400/10 px-2 py-1 rounded-lg transition-colors"
                >
                  <Plus className="w-3 h-3 stroke-[3px]" /> Append Item
                </button>
              </div>

              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                {items.map((item, index) => (
                  <div key={index} className="flex items-center gap-3 bg-black/60 p-3 rounded-xl border border-white/[0.04] animate-fadeIn">
                    <div className="flex-1">
                      <select
                        value={item.name}
                        onChange={(e) => handleItemChange(index, "name", e.target.value)}
                        className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-400/40"
                      >
                        <option value="RICE">RICE</option>
                        <option value="BEANS">BEANS</option>
                        <option value="YAM">YAM</option>
                        <option value="EGUSI">EGUSI</option>
                        <option value="PALM OIL">PALM OIL</option>
                        <option value="ONIONS">ONIONS</option>
                        <option value="PEPPERS">PEPPERS</option>
                        <option value="TOMATOES">TOMATOES</option>
                      </select>
                    </div>
                    <div className="w-24">
                      <input 
                        type="number" required min="1" value={item.quantity}
                        onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                        className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2 text-center text-xs font-mono font-bold focus:outline-none"
                      />
                    </div>
                    {items.length > 1 && (
                      <button 
                        type="button" onClick={() => handleRemoveItem(index)}
                        className="text-white/30 hover:text-red-400 p-1.5 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-amber-400 to-amber-500 text-black font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:from-amber-300 hover:to-amber-400 transition-all font-body text-sm shadow-lg shadow-amber-500/5 disabled:opacity-40 cursor-pointer"
            >
              {loading ? "Evaluating Combinations Matrix..." : "Execute Constraint Search"}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          {error && (
            <div className="bg-red-500/5 border border-red-500/20 text-red-400 p-4 rounded-xl text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: AI RESULT ENGINE RENDERING DISPLAY */}
        <div className="lg:col-span-7">
          {!result && !loading && (
            <div className="h-full border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center p-8 text-center text-white/20 min-h-[400px]">
              <Cpu className="w-10 h-10 mb-3 stroke-[1.5]" />
              <div className="text-sm font-medium font-display text-white/40">Await Solver Core Sequence</div>
              <p className="text-xs max-w-xs mt-1">Configure criteria thresholds and spin up verification to inspect multi-vendor distribution parameters.</p>
            </div>
          )}

          {loading && (
            <div className="h-full bg-zinc-950/20 border border-white/[0.06] rounded-2xl flex flex-col items-center justify-center p-8 min-h-[400px]">
              <div className="relative w-12 h-12 flex items-center justify-center mb-4">
                <div className="absolute inset-0 border-2 border-amber-400/20 rounded-full animate-ping" />
                <div className="w-3 h-3 bg-amber-400 rounded-full" />
              </div>
              <div className="text-xs font-mono uppercase tracking-widest text-amber-400 animate-pulse">Running Decision Pipeline...</div>
            </div>
          )}

          {result && (
            <div className="space-y-6 animate-fadeIn">
              {/* STATUS BAR CLUSTER CONTAINER */}
              <div className={`p-5 rounded-2xl border flex items-center justify-between gap-4 ${
                result.feasible 
                  ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400" 
                  : "bg-red-500/5 border-red-500/20 text-red-400"
              }`}>
                <div className="flex items-center gap-3">
                  {result.feasible ? <CheckCircle className="w-6 h-6 shrink-0" /> : <AlertCircle className="w-6 h-6 shrink-0" />}
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wide font-display">
                      {result.feasible ? "Optimization Feasible Solution Found" : "System Infeasible State Boundary"}
                    </h3>
                    <p className="text-xs text-white/50 mt-0.5">
                      {result.feasible 
                        ? `Evaluated ${result.meta.combinations_evaluated.toLocaleString()} paths in ${result.meta.solve_ms}ms`
                        : result.reason}
                    </p>
                  </div>
                </div>
              </div>

              {result.feasible && (
                <>
                  {/* TRANSACTION METRIC FLASH CARDS */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
                      <div className="text-[10px] uppercase font-bold text-white/30 tracking-wider">Optimized Cost</div>
                      <div className="text-xl font-bold font-mono text-amber-400 mt-1">₦{result.total_cost.toLocaleString()}</div>
                    </div>
                    <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
                      <div className="text-[10px] uppercase font-bold text-white/30 tracking-wider">Calculated Savings</div>
                      <div className="text-xl font-bold font-mono text-emerald-400 mt-1">₦{result.total_savings.toLocaleString()}</div>
                    </div>
                    <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
                      <div className="text-[10px] uppercase font-bold text-white/30 tracking-wider">Unused Surplus</div>
                      <div className="text-xl font-bold font-mono text-white/70 mt-1">₦{result.budget_remaining.toLocaleString()}</div>
                    </div>
                  </div>

                  {/* LINE ARRAYS SPLIT ALLOCATION LIST */}
                  <div className="bg-zinc-950/40 border border-white/[0.06] rounded-2xl overflow-hidden">
                    <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
                      <span className="text-xs font-semibold text-white/60">Distributed Multi-Vendor Checkout Map</span>
                      <span className="text-xs font-mono text-white/40">{result.meta.vendors_used} distinct stalls leveraged</span>
                    </div>
                    <div className="divide-y divide-white/[0.04]">
                      {result.line_items.map((line) => (
                        <div key={line.id} className="p-4 flex items-center justify-between hover:bg-white/[0.01] transition-colors">
                          <div className="space-y-1">
                            <div className="text-sm font-bold tracking-wide flex items-center gap-2">
                              {line.product_name} 
                              <span className="text-[10px] px-1.5 py-0.2 bg-white/5 border border-white/10 rounded font-mono font-normal text-white/40">
                                {line.quantity} × {line.unit_type}
                              </span>
                            </div>
                            <div className="text-xs text-white/40 flex items-center gap-1.5">
                              <Store className="w-3.5 h-3.5 text-amber-400/70" />
                              <span className="text-white/70 font-medium">{line.vendor_name}</span> — <span className="font-mono text-[11px]">{line.stall_number}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold font-mono text-amber-400">₦{line.line_total.toLocaleString()}</div>
                            <div className="text-[10px] font-mono text-white/30 line-through">₦{(line.advertised * line.quantity).toLocaleString()}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default MarketplaceOptimizer;