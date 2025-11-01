# Troubleshooting Guide

## Problem: "No record found for this registration number"

### Possible Causes:

1. **Data not uploaded yet** - The Excel/CSV file hasn't been uploaded to the system
2. **Registration number column not mapped correctly** - During upload, the registration number column wasn't identified
3. **Registration number doesn't match exactly** - There might be spaces or formatting differences

### Solution Steps:

#### Step 1: Check if data was uploaded

You can check if any records were uploaded by calling the API:

```bash
# Using curl (with admin credentials)
curl -u admin:admin123 "http://localhost:3000/api/records?limit=10"
```

This will show you:
- How many records are in the database
- The registration numbers that were imported

#### Step 2: Upload the file correctly

1. Go to `http://localhost:3000/admin/upload`
2. Login with credentials:
   - Username: `admin`
   - Password: `admin123`
3. Select your Excel/CSV file
4. **Important**: If you see a "Map Columns" interface:
   - Make sure "Registration Number" field is mapped to the correct column
   - Check that the registration number values look correct in the preview
5. Click "Confirm Import"

#### Step 3: Verify registration numbers

After upload, check what registration numbers were actually imported:

```bash
curl -u admin:admin123 "http://localhost:3000/api/records?limit=100"
```

Look for the registration number you're trying to search (e.g., "16313"). Note:
- Registration numbers are stored as strings
- The search is case-insensitive
- Extra spaces are automatically trimmed

#### Step 4: Try lookup with exact registration number

Use the exact registration number from the database. For example:

```bash
curl "http://localhost:3000/api/record?reg_no=16313"
```

### Common Issues:

#### Issue: File uploaded but registration numbers not found

**Cause**: The registration number column wasn't correctly identified during upload.

**Solution**: 
1. Re-upload the file
2. When the mapping interface appears, manually select the correct column for "Registration Number"
3. Make sure you can see sample registration numbers in the preview

#### Issue: Registration number exists but search fails

**Cause**: Formatting differences (spaces, leading zeros, etc.)

**Solution**: The system automatically trims whitespace and does case-insensitive search. But check:
- No extra characters before/after the number
- If your Excel has leading zeros (e.g., "0016313"), make sure they're preserved in the mapping

### Quick Test:

1. **Upload a test file** with at least one row
2. **Check records endpoint**: `curl -u admin:admin123 "http://localhost:3000/api/records"`
3. **Copy a registration number** from the response
4. **Test lookup**: `curl "http://localhost:3000/api/record?reg_no=<copied_number>"`

### Still Not Working?

Check the server console logs when you:
1. Upload the file - look for any errors
2. Search for a record - look for database queries

The logs will show:
- How many records were imported
- Any errors during import
- Database queries being executed

