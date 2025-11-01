/**
 * Simple script to view database contents
 * Usage: node scripts/view-db.js
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'db', 'certificates.db');

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
    process.exit(1);
  }
  
  console.log('✅ Connected to database:', DB_PATH);
  console.log('\n📊 Database Contents:\n');
  console.log('=' .repeat(60));
  
  // Check for specific ID or registration number first
  const args = process.argv.slice(2);
  const idArg = args.find(arg => arg.startsWith('--id='));
  const regArg = args.find(arg => arg.startsWith('--reg='));
  
  if (idArg) {
    const id = idArg.split('=')[1];
    db.get(`SELECT * FROM certificates WHERE id = ?`, [id], (err, row) => {
      if (err) {
        console.error('❌ Error:', err.message);
        db.close();
        return;
      }
      if (row) {
        console.log('\n📄 Full Record Details:\n');
        console.log('ID:', row.id);
        console.log('Registration No:', row.registration_no);
        console.log('Created At:', row.created_at);
        console.log('\n📋 Data:');
        console.log(JSON.stringify(JSON.parse(row.data), null, 2));
      } else {
        console.log(`\n❌ No record found with ID: ${id}`);
      }
      db.close();
    });
    return;
  }
  
  if (regArg) {
    const regNo = regArg.split('=')[1];
    db.get(`SELECT * FROM certificates WHERE LOWER(TRIM(registration_no)) = LOWER(TRIM(?))`, [regNo], (err, row) => {
      if (err) {
        console.error('❌ Error:', err.message);
        db.close();
        return;
      }
      if (row) {
        console.log('\n📄 Full Record Details:\n');
        console.log('ID:', row.id);
        console.log('Registration No:', row.registration_no);
        console.log('Created At:', row.created_at);
        console.log('\n📋 Data:');
        console.log(JSON.stringify(JSON.parse(row.data), null, 2));
      } else {
        console.log(`\n❌ No record found with Registration No: ${regNo}`);
        console.log('\n💡 Available registration numbers start from 27777');
      }
      db.close();
    });
    return;
  }
  
  // If no specific query, show all records
  db.all(`SELECT id, registration_no, created_at FROM certificates ORDER BY id`, [], (err, rows) => {
    if (err) {
      console.error('❌ Error querying database:', err.message);
      db.close();
      return;
    }
    
    if (rows.length === 0) {
      console.log('⚠️  No records found in database.');
      console.log('💡 Upload a file first via /admin/upload');
    } else {
      console.log(`\n📝 Total Records: ${rows.length}\n`);
      console.log('ID | Registration No | Created At');
      console.log('-'.repeat(60));
      
      rows.forEach((row) => {
        console.log(`${String(row.id).padEnd(3)} | ${String(row.registration_no).padEnd(15)} | ${row.created_at}`);
      });
      
      console.log('\n' + '='.repeat(60));
      console.log('\n💡 To view full data for a specific record:');
      console.log(`   node scripts/view-db.js --id=1`);
      console.log(`\n💡 To search by registration number:`);
      console.log(`   node scripts/view-db.js --reg=27777`);
    }
    
    db.close();
  });
});

