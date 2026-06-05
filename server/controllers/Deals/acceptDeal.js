import db from "../../db/db.js";

const acceptDeal = async (req, res) => {
  try {
    const dealId = req.params.id;
    const { id: userId, role } = req.user;

    if (!dealId || dealId === "undefined") {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Deal ID." });
    }

    const { rows } = await db.query("SELECT * FROM deals WHERE id = $1", [
      dealId,
    ]);
    if (rows.length === 0)
      return res
        .status(404)
        .json({ success: false, message: "Deal not found." });

    const deal = rows[0];

    // 1. Authorization
    let updateField = "";
    if (role === "BUYER" && deal.buyer_id === userId) {
      updateField = "buyer_confirmed = TRUE";
    } else if (role === "VENDOR" && deal.vendor_id === userId) {
      updateField = "vendor_confirmed = TRUE";
    } else {
      return res.status(403).json({ success: false, message: "Unauthorized." });
    }

    await db.query("BEGIN");

    const updateQuery = `
      UPDATE deals 
      SET ${updateField}, 
          status = CASE WHEN status = 'PENDING' THEN 'PENDING_VENDOR' ELSE status END
      WHERE id = $1 
      RETURNING *;
    `;
    const { rows: updatedRows } = await db.query(updateQuery, [dealId]);
    let updatedDeal = updatedRows[0];

    // 3. If both confirmed, complete the handshake and deduct stock
    if (updatedDeal.buyer_confirmed && updatedDeal.vendor_confirmed) {
      const itemRows = await db.query(
        "SELECT product_id, quantity FROM deal_items WHERE deal_id = $1",
        [dealId],
      );

      for (const item of itemRows.rows) {
        console.log(
          `[Stock Allocation] Reducing Product: ${item.product_id} by Quantity: ${item.quantity}`,
        );

     
        const productUpdate = await db.query(
          "UPDATE products SET stock = stock - $1 WHERE id = $2 AND stock >= $1 RETURNING stock",
          [item.quantity, item.product_id],
        );
 
        if (productUpdate.rows.length === 0) {
          throw new Error(
            `Insufficient stock for product ID: ${item.product_id}`,
          );
        } 
      }

      const finalRes = await db.query(
        "UPDATE deals SET status = 'ACCEPTED' WHERE id = $1 RETURNING *;",
        [dealId],
      );
      updatedDeal = finalRes.rows[0];
    }

    await db.query("COMMIT");

    return res.status(200).json({
      success: true,
      status: updatedDeal.status,
      buyer_confirmed: updatedDeal.buyer_confirmed,
      vendor_confirmed: updatedDeal.vendor_confirmed,
    });
  } catch (error) {
    await db.query("ROLLBACK");
    console.error("Deal confirmation error:", error);
    return res
      .status(500)
      .json({
        success: false,
        message: error.message || "Confirmation failed.",
      });
  }
};

export default acceptDeal;
