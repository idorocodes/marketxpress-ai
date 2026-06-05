import { db } from "../../db/db.js"; // Ensure the path is correct

const dealQr = async (req, res) => {
  try {
    const dealId = req.params.id;

    if (!dealId) {
      return res.status(400).json({ success: false, message: "Deal ID is required." });
    }

    // Retrieve the QR verification code for the specific deal
    const { rows } = await db.query(
      "SELECT qr_verification_code, status FROM deals WHERE id = $1",
      [dealId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Deal not found." });
    }

    // Return the code to the frontend so it can be rendered as a QR
    return res.status(200).json({
      success: true,
      qr_code: rows[0].qr_verification_code,
      status: rows[0].status
    });

  } catch (error) {
    console.error("QR Fetch error:", error);
    return res.status(500).json({ success: false, message: "Server error retrieving verification token." });
  }
};

export default dealQr;