import { db } from "../../db/db.js";

export const getVendorDeals = async (req, res) => {
  try {
    const vendorId = req.vendor.id; 

    const queryText = `
      SELECT 
        d.id AS deal_id,
        d.total_cost,
        d.total_savings,
        d.status,
        d.buyer_confirmed,
        d.vendor_confirmed,
        d.created_at,
        u.name AS buyer_name,
        json_agg(
          json_build_object(
            'product_name', di.product_name,
            'quantity', di.quantity,
            'unit_type', di.unit_type,
            'negotiated_price', di.negotiated_price,
            'line_total', di.line_total
          )
        ) AS items
      FROM deals d
      JOIN users u ON d.buyer_id = u.id
      JOIN deal_items di ON d.id = di.deal_id
      WHERE d.vendor_id = $1
      GROUP BY d.id, u.name
      ORDER BY d.created_at DESC;
    `;

    const { rows } = await db.query(queryText, [vendorId]);
    return res.status(200).json({ success: true, deals: rows });
  } catch (error) {
    console.error("Fetch vendor deals error:", error);
    return res.status(500).json({ success: false, message: "Error fetching market deals." });
  }
};