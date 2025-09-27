// run with: npm run migrate
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
(async () => {
  try {
    const sql = fs.readFileSync(path.join(__dirname, 'schema.sql')).toString();
    await pool.query(sql);
    console.log('Migrations applied.');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
})();
