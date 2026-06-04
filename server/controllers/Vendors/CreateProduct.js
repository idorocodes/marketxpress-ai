import { db } from "../../db/db.js";

export const addProduct = async (req, res) => {
  try {
    const { name, advertised, minimum, stock, unit_type } = req.body;
    const vendorId = req.vendor.id;  

    // Validation
    if (!name || !advertised || !minimum || !stock || !unit_type) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (Number(minimum) > Number(advertised)) {
      return res.status(400).json({ message: "Minimum price cannot be higher than advertised price" });
    }

    const insertQuery = `
      INSERT INTO products (name, advertised, minimum, stock, unit_type, vendor_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;

    const { rows } = await db.query(insertQuery, [
      name.toUpperCase(),  
      advertised,
      minimum,
      stock,
      unit_type.toUpperCase(),
      vendorId
    ]);

    res.status(201).json({ message: "Product added successfully", product: rows[0] });
  } catch (error) {
    console.error("Add product error:", error);
    res.status(500).json({ message: "Server error while adding product" });
  }
};


export const getVendorInventory = async (req, res) => {
  try {
    const vendorId = req.vendor.id;

    const selectQuery = `
      SELECT id, name, advertised, minimum, stock, unit_type, created_at 
      FROM products 
      WHERE vendor_id = $1
      ORDER BY created_at DESC;
    `;

    const { rows } = await db.query(selectQuery, [vendorId]);
    res.status(200).json({ inventory: rows });
  } catch (error) {
    console.error("Fetch inventory error:", error);
    res.status(500).json({ message: "Server error while fetching inventory" });
  }
};