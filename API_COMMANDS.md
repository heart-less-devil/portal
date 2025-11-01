# API Testing Commands

This document contains sample curl commands and API usage examples.

## Base URL
```
http://localhost:3000
```

## Authentication
All admin endpoints require Basic Authentication. The default credentials are:
- Username: `admin`
- Password: `admin123`

## 1. Upload Certificate File (Automatic Column Detection)

```bash
curl -X POST http://localhost:3000/api/upload \
  -u admin:admin123 \
  -F "file=@path/to/certificates.xlsx"
```

**Expected Response:**
```json
{
  "success": true,
  "imported": 100,
  "message": "Successfully imported 100 certificates"
}
```

**If Column Mapping Required:**
```json
{
  "requiresMapping": true,
  "headers": ["REG NO", "NAME", "COURSE"],
  "sampleRow": { "REG NO": "REG001", "NAME": "John Doe" },
  "totalRows": 100
}
```

## 2. Upload Certificate File (With Column Mapping)

```bash
curl -X POST http://localhost:3000/api/upload/mapping \
  -u admin:admin123 \
  -F "file=@path/to/certificates.xlsx" \
  -F 'columnMapping={"registrationNo":"REG NO","studentName":"NAME","courseName":"COURSE"}'
```

**Column Mapping JSON Structure:**
```json
{
  "registrationNo": "REG NO",      // Required
  "studentName": "STUDENT NAME",
  "fatherName": "FATHERS NAME",
  "courseName": "COURSE NAME",
  "startDate": "STARTING DATE",
  "endDate": "END DATE",
  "issueDate": "ISSUE DATE",
  "grade": "GRADE"
}
```

## 3. Lookup Certificate by Registration Number

```bash
curl "http://localhost:3000/api/record?reg_no=REG123"
```

**Success Response:**
```json
{
  "success": true,
  "record": {
    "id": 1,
    "registration_no": "REG123",
    "data": {
      "studentName": "John Doe",
      "courseName": "Web Development",
      "grade": "A",
      "issueDate": "2024-01-15"
    },
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Response (Not Found):**
```json
{
  "error": "No record found for this registration number",
  "suggestion": "Please double-check the registration number and try again."
}
```

**Error Response (Missing Parameter):**
```json
{
  "error": "Registration number is required"
}
```

## 4. Get Certificate by ID

```bash
curl "http://localhost:3000/api/record/1"
```

**Response:**
```json
{
  "success": true,
  "record": {
    "id": 1,
    "registration_no": "REG123",
    "data": { ... },
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

## 5. Generate PDF Certificate

```bash
curl "http://localhost:3000/api/pdf?reg_no=REG123" \
  -o certificate.pdf
```

**Note:** This endpoint returns a PDF file. Save it using `-o` flag or redirect output.

## 6. Test Rate Limiting

Rate limit is set to 100 requests per 15 minutes per IP.

```bash
# Make multiple requests quickly
for i in {1..105}; do
  curl "http://localhost:3000/api/record?reg_no=TEST$i" &
done
wait

# After 100 requests, you should get:
# {
#   "error": "Too many requests from this IP, please try again later."
# }
```

## 7. Using with Authentication in Scripts

### PowerShell (Windows)
```powershell
$credentials = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("admin:admin123"))
Invoke-RestMethod -Uri "http://localhost:3000/api/record?reg_no=REG123" `
  -Headers @{Authorization="Basic $credentials"}
```

### Bash Script
```bash
#!/bin/bash
BASE_URL="http://localhost:3000"
AUTH="admin:admin123"

# Lookup certificate
curl -u "$AUTH" "$BASE_URL/api/record?reg_no=REG123"

# Upload file
curl -X POST -u "$AUTH" \
  -F "file=@certificates.xlsx" \
  "$BASE_URL/api/upload"
```

## 8. Error Handling Examples

### Invalid File Type
```bash
curl -X POST http://localhost:3000/api/upload \
  -u admin:admin123 \
  -F "file=@document.pdf"
```

**Response:**
```json
{
  "error": "Only Excel (.xlsx, .xls) and CSV files are allowed"
}
```

### Unauthorized Access
```bash
curl -X POST http://localhost:3000/api/upload \
  -F "file=@certificates.xlsx"
```

**Response:**
```json
{
  "error": "Authentication required",
  "message": "Please provide username and password via Basic Auth"
}
```

### Invalid Credentials
```bash
curl -X POST http://localhost:3000/api/upload \
  -u admin:wrongpassword \
  -F "file=@certificates.xlsx"
```

**Response:**
```json
{
  "error": "Invalid credentials"
}
```

## Testing Workflow

1. **Upload a test file:**
```bash
curl -X POST http://localhost:3000/api/upload \
  -u admin:admin123 \
  -F "file=@test_certificates.xlsx"
```

2. **Verify upload by looking up a record:**
```bash
curl "http://localhost:3000/api/record?reg_no=FIRST_REG_NUMBER_FROM_FILE"
```

3. **Generate PDF:**
```bash
curl "http://localhost:3000/api/pdf?reg_no=FIRST_REG_NUMBER_FROM_FILE" \
  -o test_certificate.pdf
```

## Notes

- All registration number lookups are case-insensitive
- Whitespace is automatically trimmed from registration numbers
- File uploads are limited to 10MB
- Rate limiting applies to public endpoints (`/api/record` and `/api/pdf`)
- Admin endpoints require authentication
- Database automatically creates necessary tables on first run

