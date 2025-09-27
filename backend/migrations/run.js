const fs = require('fs');
const path = require('path');
const db = require('../src/db');
require('dotenv').config();

async function runMigrations() {
  try {
    // List all .sql files in migrations folder
    const migrationsDir = __dirname;
    const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql'));

    for (const file of files) {
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      console.log(`Running migration: ${file}`);
      await db.query(sql);
    }

    console.log('✅ All migrations applied');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

runMigrations();
