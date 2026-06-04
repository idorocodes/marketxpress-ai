// server/db/seed.js
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("❌ Error: DATABASE_URL is missing from .env");
  process.exit(1);
}

const pool = new Pool({ connectionString });

async function seed() {
  console.log("🚀 Starting COMPLETE database seeding...");
  
  try {
    // 1. Clean out all old data cleanly via Cascade
    await pool.query('TRUNCATE TABLE users CASCADE;');
    console.log("🗑️ Cleared all tables.");

    // 2. Generate secure passwords
    const salt = await bcrypt.genSalt(10);
    const defaultPassword = await bcrypt.hash("password123", salt);

    // 3. Create Buyers (Normal Users)
    console.log("👥 Creating Buyer accounts...");
    
    const buyer1 = await pool.query(`
      INSERT INTO users (name, email, password, role)
      VALUES ($1, $2, $3, 'BUYER') RETURNING id, name;
    `, ["Chidi Okafor", "chidi@student.com", defaultPassword]);

    const buyer2 = await pool.query(`
      INSERT INTO users (name, email, password, role)
      VALUES ($1, $2, $3, 'BUYER') RETURNING id, name;
    `, ["Amina Bello", "amina@student.com", defaultPassword]);

    const buyer3 = await pool.query(`
      INSERT INTO users (name, email, password, role)
      VALUES ($1, $2, $3, 'BUYER') RETURNING id, name;
    `, ["Tunde Bakare", "tunde@student.com", defaultPassword]);

    // 4. Create Vendors (Sellers)
    console.log("🏪 Creating Vendor accounts...");
    
    const vendorA = await pool.query(`
      INSERT INTO users (name, email, password, role)
      VALUES ($1, $2, $3, 'VENDOR') RETURNING id;
    `, ["Mama Ngozi Stores", "ngozi@market.com", defaultPassword]);

    const vendorB = await pool.query(`
      INSERT INTO users (name, email, password, role)
      VALUES ($1, $2, $3, 'VENDOR') RETURNING id;
    `, ["Alhaji & Sons", "alhaji@market.com", defaultPassword]);

    const vendorC = await pool.query(`
      INSERT INTO users (name, email, password, role)
      VALUES ($1, $2, $3, 'VENDOR') RETURNING id;
    `, ["Iya Titi Agro-Stall", "titi@market.com", defaultPassword]);

    const vA_id = vendorA.rows[0].id;
    const vB_id = vendorB.rows[0].id;
    const vC_id = vendorC.rows[0].id;

    // 5. Ingest Comprehensive Product Catalog with competing ranges
    console.log("📦 Ingesting product inventory for Decider Engine testing...");

    const productsQuery = `
      INSERT INTO products (name, advertised, minimum, stock, unit_type, vendor_id)
      VALUES ($1, $2, $3, $4, $5, $6);
    `;

    // --- MAMA NGOZI STORES (High volume, rock bottom minimum floors) ---
    await pool.query(productsQuery, ["RICE", 2200, 1950, 50, "MUDU", vA_id]);
    await pool.query(productsQuery, ["TOMATOES", 4000, 3500, 8, "PAINT_BUCKET", vA_id]);
    await pool.query(productsQuery, ["PEPPERS", 300, 250, 120, "CUP", vA_id]);
    await pool.query(productsQuery, ["ONIONS", 400, 320, 90, "CUP", vA_id]);
    await pool.query(productsQuery, ["PALM OIL", 1800, 1600, 20, "BOTTLE", vA_id]);
    await pool.query(productsQuery, ["EGUSI", 1200, 1000, 15, "CUP", vA_id]);

    // --- ALHAJI & SONS (Mid tier, massive quantities) ---
    await pool.query(productsQuery, ["RICE", 2400, 2100, 100, "MUDU", vB_id]);
    await pool.query(productsQuery, ["TOMATOES", 4300, 3800, 20, "PAINT_BUCKET", vB_id]);
    await pool.query(productsQuery, ["PEPPERS", 350, 280, 200, "CUP", vB_id]);
    await pool.query(productsQuery, ["ONIONS", 380, 300, 150, "CUP", vB_id]);
    await pool.query(productsQuery, ["PALM OIL", 1950, 1700, 40, "BOTTLE", vB_id]);
    await pool.query(productsQuery, ["EGUSI", 1150, 980, 35, "CUP", vB_id]);

    // --- IYA TITI AGRO-STALL (Premium retail / limited stocks) ---
    await pool.query(productsQuery, ["RICE", 2500, 2300, 12, "MUDU", vC_id]);
    await pool.query(productsQuery, ["TOMATOES", 4600, 4100, 5, "PAINT_BUCKET", vC_id]);
    await pool.query(productsQuery, ["PEPPERS", 400, 330, 40, "CUP", vC_id]);
    await pool.query(productsQuery, ["ONIONS", 450, 390, 30, "CUP", vC_id]);
    await pool.query(productsQuery, ["PALM OIL", 2100, 1850, 10, "BOTTLE", vC_id]);
    await pool.query(productsQuery, ["EGUSI", 1300, 1100, 8, "CUP", vC_id]);

    console.log("\n✅ DATABASE SUCCESSFULLY SEEDED!");
    console.log("-----------------------------------------");
    console.log("🔐 Credentials (All passwords are: password123)");
    console.log(`👤 Buyer 1: chidi@student.com`);
    console.log(`👤 Buyer 2: amina@student.com`);
    console.log(`👤 Buyer 3: tunde@student.com`);
    console.log(`🏪 Vendor 1: ngozi@market.com`);
    console.log(`🏪 Vendor 2: alhaji@market.com`);
    console.log(`🏪 Vendor 3: titi@market.com`);
    console.log("-----------------------------------------");

  } catch (error) {
    console.error("❌ Seeding transaction error occurred:", error);
  } finally {
    await pool.end();
    process.exit();
  }
}

seed();