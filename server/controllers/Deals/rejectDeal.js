import db  from "../../db/db.js";

const rejectDeal = async (req, res) => {
  try {
    const dealId = req.params.id;
    const { id: userId, role } = req.user;

 
    const { rows } = await db.query("SELECT * FROM deals WHERE id = $1", [dealId]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: "Deal target node not discovered." });

    const deal = rows[0];

 
    if (deal.buyer_id !== userId && deal.vendor_id !== userId) {
      return res.status(403).json({ success: false, message: "Access violation. You do not own this transaction leg." });
    } 

 
    const rejectQuery = `UPDATE deals SET status = 'REJECTED' WHERE id = $1 RETURNING *;`;
    const { rows: updatedRows } = await db.query(rejectQuery, [dealId]);
    
    return res.status(200).json({
      success: true,
      status: updatedRows[0].status,
      message: "Deal cycle terminated and status flagged as REJECTED successfully."
    });

  } catch (error) {
    console.error("Deal rejection logic failure:", error);
    return res.status(500).json({ success: false, message: "Internal system error terminating deal structure." });
  }
}

export default rejectDeal