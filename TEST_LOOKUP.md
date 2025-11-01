# Test Lookup - Step by Step

## ✅ Quick Test Steps:

### 1. Server Start karein (agar nahi chal raha)
```bash
npm start
```

### 2. Browser mein kholen:
```
http://localhost:3000/lookup
```

### 3. Valid Registration Number try karein:
Database mein yeh numbers available hain:
- `27777`
- `27778`
- `27779`
- ... (27777 se 27887 tak)

**Example:** Registration number field mein `27777` enter karein aur "Lookup Certificate" button par click karein.

### 4. Expected Result:
- Certificate details dikhni chahiye
- Student Name: MANAS BATRA (example)
- Course Name: CERTIFICATE COURSE IN DATA ANALYTICS
- Other details bhi dikhni chahiye

### 5. Agar certificate dikh gaya:
- "Download PDF" button try karein
- "Print Certificate" button try karein

## ❌ Agar error aaye:

**"No record found" error:**
- Check karein ki registration number exactly match kar raha hai
- Database mein available registration numbers check karein:
  ```bash
  npm run db:view
  ```

**Server error:**
- Server logs check karein
- Database file exists check karein: `db/certificates.db`

## 💡 Tips:

1. Registration numbers case-insensitive hain (27777 = 27777)
2. Spaces automatically trim ho jati hain
3. Database mein 118 records hain (27777-27887 range)

