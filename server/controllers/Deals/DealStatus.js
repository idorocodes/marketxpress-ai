import db from "../../db/db.js";

const dealStatus = async (req, res) => {
  try {
    const dealId = req.params.id;

    if (!dealId || dealId === "undefined") {
      return res.status(400).json({ success: false, message: "Invalid Deal ID." });
    }

    // Query only the fields necessary for status tracking
    const { rows } = await db.query(
      "SELECT status, buyer_confirmed, vendor_confirmed FROM deals WHERE id = $1",
      [dealId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Deal not found." });
    }

    const { status, buyer_confirmed, vendor_confirmed } = rows[0];

    return res.status(200).json({
      success: true,
      data: {
        status,
        buyer_confirmed,
        vendor_confirmed,
      },
    });
  } catch (error) {
    console.error("Status polling error:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

export default dealStatus;