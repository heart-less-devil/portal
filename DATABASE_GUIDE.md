# SQLite Database Guide

## Database Location

The SQLite database is stored at:
```
db/certificates.db
```

## Quick Commands

### View All Records
```bash
npm run db:view
```

### View Specific Record by ID
```bash
node scripts/view-db.js --id=1
```

### Search by Registration Number
```bash
node scripts/view-db.js --reg=16313
```

### Clear All Records (⚠️ Use with caution!)
```bash
npm run db:clear
```

## Using SQLite Command Line

If you have SQLite installed, you can connect directly:

### Windows (if SQLite is installed)
```bash
sqlite3 db/certificates.db
```

### Linux/Mac
```bash
sqlite3 db/certificates.db
```

### Common SQLite Commands

Once connected:
```sql
-- View all records
SELECT id, registration_no, created_at FROM certificates;

-- View full record
SELECT * FROM certificates WHERE registration_no = '16313';

-- Count total records
SELECT COUNT(*) FROM certificates;

-- View table schema
.schema certificates

-- Exit
.quit
```

## Database Schema

```sql
CREATE TABLE certificates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  registration_no TEXT UNIQUE NOT NULL,
  data TEXT NOT NULL,  -- JSON string containing all fields
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_registration_no ON certificates(registration_no);
```

## Using SQLite Browser (GUI Tool)

For a visual interface, download **DB Browser for SQLite**:
- Download: https://sqlitebrowser.org/
- Open: File → Open Database → Select `db/certificates.db`

## Viewing via API

You can also view records via the API endpoint:

```bash
# Get all records (requires admin auth)
curl -u admin:admin123 "http://localhost:3000/api/records?limit=100"
```

## Example Queries

### Find all registration numbers
```sql
SELECT registration_no FROM certificates ORDER BY registration_no;
```

### Search case-insensitive
```sql
SELECT * FROM certificates 
WHERE LOWER(TRIM(registration_no)) = LOWER(TRIM('16313'));
```

### View data for a specific registration number
```sql
SELECT id, registration_no, data, created_at 
FROM certificates 
WHERE registration_no LIKE '%16313%';
```

## Troubleshooting

### Database locked error
- Close any other connections to the database
- Restart the server

### Database file not found
- Make sure the `db/` directory exists
- The database will be created automatically on first run

### View database size
```bash
# Windows PowerShell
(Get-Item db/certificates.db).Length

# Linux/Mac
ls -lh db/certificates.db
```

## Backup Database

```bash
# Copy the database file
cp db/certificates.db db/certificates.db.backup

# Or using SQLite
sqlite3 db/certificates.db ".backup db/certificates.db.backup"
```

