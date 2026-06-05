import { db } from "../../db/db.js";
import crypto from "crypto";
 
export const createDealFromOptimization = async (req, res) => {
  try {
    const buyerId = req.user.id;  
    const { line_items, total_cost, total_savings } = req.body;

    if (!line_items || line_items.length === 0) {
      return res.status(400).json({ success: false, message: "Cannot secure an empty cart matrix." });
    }

 
    const vendorId = line_items[0].vendor_id; 
    const qrToken = crypto.randomBytes(16).toString("hex");

    // Start a transaction block
    await db.query("BEGIN");

    const dealInsertQuery = `
      INSERT INTO deals (buyer_id, vendor_id, total_cost, total_savings, qr_verification_code)
      VALUES ($1, $2, $3, $4, $5) RETURNING id;
    `;
    const { rows } = await db.query(dealInsertQuery, [buyerId, vendorId, total_cost, total_savings, qrToken]);
    const dealId = rows[0].id;

    const itemInsertQuery = `
      INSERT INTO deal_items (deal_id, product_id, product_name, quantity, unit_type, negotiated_price, line_total)
      VALUES ($1, $2, $3, $4, $5, $6, $7);
    `;

    for (const item of line_items) {
      await db.query(itemInsertQuery, [
        dealId,
        item.id,
        item.product_name,
        item.quantity,
        item.unit_type,
        item.negotiated_price,
        item.line_total
      ]);
    }

    await db.query("COMMIT");
    return res.status(201).json({ success: true, dealId, message: "Deal route registered under pending review statuses." });

  } catch (error) {
    await db.query("ROLLBACK");
    console.error("Deal creation crash:", error);
    return res.status(500).json({ success: false, message: "Failed to persist optimization configuration." });
  }
};
 
export const confirmDeal = async (req, res) => {
  try {
    const dealId = req.params.id;
    const { id: userId, role } = req.user;  l 

 
    const { rows } = await db.query("SELECT * FROM deals WHERE id = $1", [dealId]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: "Deal not found." });
    
    const deal = rows[0];
    let updateField = "";

    // 1. Authorize identity bounds and assign target checkbox
    if (role === "BUYER" && deal.buyer_id === userId) {
      updateField = "buyer_confirmed = TRUE";
    } else if (role === "VENDOR" && deal.vendor_id === userId) {
      updateField = "vendor_confirmed = TRUE";
    } else {
      return res.status(403).json({ success: false, message: "Unauthorized assertion access privileges against this transaction node." });
    }

    // 2. Perform state update
    const updateQuery = `UPDATE deals SET ${updateField} WHERE id = $1 RETURNING *;`;
    const { rows: updatedRows } = await db.query(updateQuery, [dealId]);
    let updatedDeal = updatedRows[0];

    // 3. Lifecycle state shift logic: If both have toggled confirmation true, switch status to ACCEPTED
    if (updatedDeal.buyer_confirmed && updatedDeal.vendor_confirmed && updatedDeal.status === "PENDING_APPROVAL") {
      const lockQuery = `UPDATE deals SET status = 'ACCEPTED' WHERE id = $1 RETURNING *;`;
      const { rows: finalRows } = await db.query(lockQuery, [dealId]);
      updatedDeal = finalRows[0];
      
      // OPTIONAL: Emit socket notification trigger to instantly update peer client layouts here!
      // req.io.to(dealId).emit("deal_status_changed", { status: 'ACCEPTED' });
    }

    return res.status(200).json({ 
      success: true, 
      status: updatedDeal.status,
      buyer_confirmed: updatedDeal.buyer_confirmed,
      vendor_confirmed: updatedDeal.vendor_confirmed,
      message: "Handshake node state confirmation registry entry parsed successfully." 
    });

  } catch (error) {
    console.error("Deal confirmation error:", error);
    return res.status(500).json({ success: false, message: "Handshake confirmation execution failure." });
  }
};