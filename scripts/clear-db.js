/**
 * Script to clear all records from database (Use with caution!)
 * Usage: node scripts/clear-db.js
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'db', 'certificates.db');

console.log('⚠️  WARNING: This will delete ALL records from the database!');
console.log('Press Ctrl+C to cancel, or wait 3 seconds to continue...\n');

setTimeout(() => {
  const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
      console.error('❌ Error opening database:', err.message);
      process.exit(1);
    }
    
    db.run(`DELETE FROM certificates`, (err) => {
      if (err) {
        console.error('❌ Error clearing database:', err.message);
      } else {
        console.log('✅ All records deleted successfully');
      }
      db.close();
    });
  });
}, 3000);

