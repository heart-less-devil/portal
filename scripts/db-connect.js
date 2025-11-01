/**
 * Interactive SQLite Database Connection Script
 * Usage: node scripts/db-connect.js
 */

const sqlite3 = require('sqlite3').verbose();
const readline = require('readline');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'db', 'certificates.db');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
    process.exit(1);
  }
  
  console.log('\n✅ Connected to SQLite database:', DB_PATH);
  console.log('\n📊 Available Commands:');
  console.log('  1. View all records');
  console.log('  2. Search by Registration Number');
  console.log('  3. View by ID');
  console.log('  4. Count total records');
  console.log('  5. Execute custom SQL query');
  console.log('  6. Exit');
  console.log('\n' + '='.repeat(60) + '\n');
  
  showMenu();
});

function showMenu() {
  rl.question('Select an option (1-6): ', (answer) => {
    switch(answer.trim()) {
      case '1':
        viewAllRecords();
        break;
      case '2':
        rl.question('Enter Registration Number: ', (regNo) => {
          searchByRegNo(regNo.trim());
        });
        break;
      case '3':
        rl.question('Enter ID: ', (id) => {
          viewById(parseInt(id.trim()));
        });
        break;
      case '4':
        countRecords();
        break;
      case '5':
        rl.question('Enter SQL query: ', (query) => {
          executeQuery(query.trim());
        });
        break;
      case '6':
        console.log('\n👋 Goodbye!');
        db.close();
        rl.close();
        process.exit(0);
        break;
      default:
        console.log('❌ Invalid option. Please try again.\n');
        showMenu();
    }
  });
}

function viewAllRecords() {
  db.all(`SELECT id, registration_no, created_at FROM certificates ORDER BY id`, [], (err, rows) => {
    if (err) {
      console.error('❌ Error:', err.message);
      showMenu();
      return;
    }
    
    if (rows.length === 0) {
      console.log('\n⚠️  No records found.\n');
    } else {
      console.log(`\n📝 Total Records: ${rows.length}\n`);
      console.log('ID | Registration No | Created At');
      console.log('-'.repeat(60));
      rows.forEach((row) => {
        console.log(`${String(row.id).padEnd(3)} | ${String(row.registration_no).padEnd(15)} | ${row.created_at}`);
      });
      console.log('');
    }
    showMenu();
  });
}

function searchByRegNo(regNo) {
  db.get(`SELECT * FROM certificates WHERE LOWER(TRIM(registration_no)) = LOWER(TRIM(?))`, [regNo], (err, row) => {
    if (err) {
      console.error('❌ Error:', err.message);
      showMenu();
      return;
    }
    
    if (row) {
      console.log('\n📄 Record Found:\n');
      console.log('ID:', row.id);
      console.log('Registration No:', row.registration_no);
      console.log('Created At:', row.created_at);
      console.log('\n📋 Data:');
      console.log(JSON.stringify(JSON.parse(row.data), null, 2));
      console.log('');
    } else {
      console.log(`\n❌ No record found with Registration No: ${regNo}\n`);
    }
    showMenu();
  });
}

function viewById(id) {
  db.get(`SELECT * FROM certificates WHERE id = ?`, [id], (err, row) => {
    if (err) {
      console.error('❌ Error:', err.message);
      showMenu();
      return;
    }
    
    if (row) {
      console.log('\n📄 Record Found:\n');
      console.log('ID:', row.id);
      console.log('Registration No:', row.registration_no);
      console.log('Created At:', row.created_at);
      console.log('\n📋 Data:');
      console.log(JSON.stringify(JSON.parse(row.data), null, 2));
      console.log('');
    } else {
      console.log(`\n❌ No record found with ID: ${id}\n`);
    }
    showMenu();
  });
}

function countRecords() {
  db.get(`SELECT COUNT(*) as count FROM certificates`, [], (err, row) => {
    if (err) {
      console.error('❌ Error:', err.message);
      showMenu();
      return;
    }
    
    console.log(`\n📊 Total Records: ${row.count}\n`);
    showMenu();
  });
}

function executeQuery(query) {
  if (!query || query.trim() === '') {
    console.log('❌ Empty query.\n');
    showMenu();
    return;
  }
  
  // Safety check - only allow SELECT queries
  if (!query.trim().toUpperCase().startsWith('SELECT')) {
    console.log('❌ Only SELECT queries are allowed for safety.\n');
    showMenu();
    return;
  }
  
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('❌ Error:', err.message);
      showMenu();
      return;
    }
    
    if (rows.length === 0) {
      console.log('\n⚠️  No results found.\n');
    } else {
      console.log(`\n📊 Results (${rows.length} rows):\n`);
      console.table(rows);
      console.log('');
    }
    showMenu();
  });
}

// Handle exit gracefully
process.on('SIGINT', () => {
  console.log('\n\n👋 Goodbye!');
  db.close();
  rl.close();
  process.exit(0);
});

