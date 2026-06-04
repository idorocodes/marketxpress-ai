 
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
 
neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL;

if (!connectionString || connectionString.trim() === "") {
  throw new Error("❌ CRITICAL: DATABASE_URL is missing inside db.js!");
}

 
const pool = new Pool({ connectionString });

 
export const db = {
  query: (text, params) => pool.query(text, params),
};