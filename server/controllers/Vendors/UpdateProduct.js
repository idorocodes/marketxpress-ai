import { db } from "../../db/db.js";

export const updateProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const { advertised, minimum, stock } = req.body;
    const vendorId = req.vendor.id;

    if (Number(minimum) > Number(advertised)) {
      return res.status(400).json({ message: "Minimum price cannot be higher than advertised price" });
    }

    const updateQuery = `
      UPDATE products 
      SET advertised = $1, minimum = $2, stock = $3
      WHERE id = $4 AND vendor_id = $5
      RETURNING *;
    `;

    const { rows } = await db.query(updateQuery, [advertised, minimum, stock, productId, vendorId]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Product not found or unauthorized" });
    }

    res.status(200).json({ message: "Inventory updated successfully", product: rows[0] });
  } catch (error) {
    console.error("Update inventory error:", error);
    res.status(500).json({ message: "Server error while updating inventory" });
  }
};