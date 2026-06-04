/**
 * MarketXpress AI — Decider Engine
 * ─────────────────────────────────────────────────────────────────────────────
 * Constraint-satisfaction optimizer mapped directly to real architecture schemas.
 */

"use strict";

// ─── Architecture Parameter Constants ────────────────────────────────────────

const MIN_VENDOR_MARGIN   = 50;      // ₦ minimum profit per line item (fairness floor)
const NEGOTIATION_FLOOR   = 0.80;    // negotiated price ≥ advertised × 0.80
const MAX_CANDIDATES      = 12;      // max vendor candidates per item (complexity cap)
const MAX_COMBINATIONS    = 500_000; // hard abort if cartesian product exceeds this

// ─── Utility Helpers ──────────────────────────────────────────────────────────

/** Normalise product name for matching */
const norm = (s) => s.toUpperCase().trim().replace(/\s+/g, " ");

/**
 * Compute negotiated pricing bounds
 * Strategy: offer floor (advertised * 0.8), but never drop below vendor minimum floor constraint.
 */
function computeNegotiatedPrice(advertised, minimum) {
  const floor = Math.ceil(advertised * NEGOTIATION_FLOOR);
  const offered = Math.max(floor, minimum);
  return Math.min(offered, advertised);
}

/**
 * Cartesian product of candidate arrays with early cost pruning optimization
 */
function cartesianPruned(arrays, budget) {
  let result = [[]];
  let combinations = 0;

  for (const pool of arrays) {
    const next = [];
    for (const existing of result) {
      const runningCost = existing.reduce((s, c) => s + c.line_total, 0);
      for (const candidate of pool) {
        // Prune path immediately if running bundle exceeds buyer capacity threshold
        if (runningCost + candidate.line_total > budget) continue;
        next.push([...existing, candidate]);
        if (++combinations > MAX_COMBINATIONS) {
          return next;
        }
      }
    }
    result = next;
    if (result.length === 0) break;
  }
  return result;
}

// ─── Core Solver Logic ───────────────────────────────────────────────────────

export function runDecider({ required_items, vendor_products, budget }) {
  const t0 = Date.now();

  if (!required_items?.length)
    return _infeasible([], 0, "No food items requested");

  if (!vendor_products?.length)
    return _infeasible(required_items.map(i => i.name), 0, "No active matching merchant stock observed");

  const candidatesByItem = [];
  const uncovered = [];

  for (const req of required_items) {
    const needle = norm(req.name);

    // Target tracking against exact architecture keys: vp.name, vp.stock
    const matching = vendor_products.filter(vp =>
      norm(vp.name) === needle &&
      Number(vp.stock) >= Number(req.quantity)
    );

    if (matching.length === 0) {
      uncovered.push(req.name);
      continue;
    }

    const candidates = matching
      .map(vp => {
        // Parse raw string numerals delivered by backend database layer safely
        const advertisedNum = parseFloat(vp.advertised);
        const minimumNum = parseFloat(vp.minimum);

        const neg = computeNegotiatedPrice(advertisedNum, minimumNum);
        const total = parseFloat((neg * req.quantity).toFixed(2));
        const margin = parseFloat(((neg - minimumNum) * req.quantity).toFixed(2));

        return {
          id: vp.id,
          product_name: norm(vp.name),
          vendor_id: vp.vendor_id,
          vendor_name: vp.vendor_name ?? "Market Merchant",
          stall_number: vp.stall_number ?? "Open Row",
          quantity: req.quantity,
          unit_type: vp.unit_type,
          negotiated_price: neg,
          line_total: total,
          vendor_margin: margin,
          advertised: advertisedNum,
          minimum: minimumNum,
        };
      })
      // Fairness filter pass
      .filter(c => c.vendor_margin >= MIN_VENDOR_MARGIN)
      // Cheapest execution sequences sort first
      .sort((a, b) => a.line_total - b.line_total)
      .slice(0, MAX_CANDIDATES);

    if (candidates.length === 0) {
      uncovered.push(req.name);
      continue;
    }

    candidatesByItem.push(candidates);
  }

  if (uncovered.length > 0) {
    return _infeasible(uncovered, Date.now() - t0, `No matching vendors satisfy budget limits for: ${uncovered.join(", ")}`);
  }

  const allCombinations = cartesianPruned(candidatesByItem, budget);

  if (allCombinations.length === 0) {
    return _infeasible(required_items.map(i => i.name), Date.now() - t0, "Negotiated target cost optimization options exceed your budget capacity");
  }

  let best = null;
  let bestScore = Infinity;

  for (const combo of allCombinations) {
    const totalCost = combo.reduce((s, c) => s + c.line_total, 0);
    const vendorCount = new Set(combo.map(c => c.vendor_id)).size;
    const totalMargin = combo.reduce((s, c) => s + c.vendor_margin, 0);

    // Multi-objective optimization weight matrix score
    const score = totalCost + (vendorCount * 200) - (totalMargin * 0.01);

    if (score < bestScore) {
      bestScore = score;
      best = { combo, totalCost, vendorCount, totalMargin };
    }
  }

  const originalAdvertisedTotal = best.combo.reduce(
    (s, c) => s + (c.advertised * c.quantity), 0
  );

  return {
    feasible: true,
    line_items: best.combo,
    total_cost: parseFloat(best.totalCost.toFixed(2)),
    total_savings: parseFloat((originalAdvertisedTotal - best.totalCost).toFixed(2)),
    budget_remaining: parseFloat((budget - best.totalCost).toFixed(2)),
    uncovered_items: [],
    meta: {
      combinations_evaluated: allCombinations.length,
      vendors_used: best.vendorCount,
      solve_ms: Date.now() - t0,
    },
  };
}

function _infeasible(uncovered, ms, reason) {
  return {
    feasible: false,
    line_items: [],
    total_cost: 0,
    total_savings: 0,
    budget_remaining: 0,
    uncovered_items: uncovered,
    reason,
    meta: { combinations_evaluated: 0, vendors_used: 0, solve_ms: ms },
  };
}

// ─── Express Integration Endpoint Controller Handler ──────────────────────────

export const executeOptimizationQuery = async (req, res) => {
  try {
    const { required_items, budget } = req.body;

    if (!Array.isArray(required_items) || required_items.length === 0) {
      return res.status(400).json({ success: false, message: "Target required_items array parameter must not be empty." });
    }
    if (!budget || typeof budget !== "number" || budget <= 0) {
      return res.status(400).json({ success: false, message: "A numerical positive budget limit must be defined." });
    }

    // Access direct pooling layer (Adapts to database query engines seamlessly)
    const db = req.app.get("db_pool") || req.app.get("supabase");
    const targetNames = required_items.map(i => norm(i.name));

    // Dynamic extraction pipeline matches database schemas cleanly
    const { data: databaseProductRecords, error: dbError } = await db
      .from("products")
      .select(`
        id,
        vendor_id,
        name,
        advertised,
        minimum,
        stock,
        unit_type,
        vendors ( name, stall_number )
      `)
      .in("name", targetNames)
      .gt("stock", 0);

    if (dbError) {
      console.error("Critical internal matrix routing failure:", dbError);
      return res.status(500).json({ success: false, message: "Failed to load live structural inventory balances across nodes." });
    }

    // Map rows directly to current structural model configuration parameters
    const standardizedInventory = (databaseProductRecords || []).map(row => ({
      id: row.id,
      vendor_id: row.vendor_id,
      vendor_name: row.vendors?.name ?? "Market Stand Merchant",
      stall_number: row.vendors?.stall_number ?? "Central Row",
      name: row.name,
      advertised: row.advertised,
      minimum: row.minimum,
      stock: row.stock,
      unit_type: row.unit_type
    }));

    // Pass items directly through local resolution cluster algorithm
    const optimizationResult = runDecider({ 
      required_items, 
      vendor_products: standardizedInventory, 
      budget 
    });

    return res.status(200).json({
      success: optimizationResult.feasible,
      data: optimizationResult
    });

  } catch (err) {
    console.error("Critical decider runtime engine crash:", err);
    return res.status(500).json({ success: false, message: "Internal constraint optimizer routing drop." });
  }
};