# Certificate Management Portal

A web portal for managing and looking up certificate records from uploaded Excel/CSV files. Features include file upload with column mapping, certificate lookup, and PDF generation.

## Features

- **File Upload**: Upload Excel (.xlsx, .xls) or CSV files with automatic column detection and mapping
- **Certificate Lookup**: Public lookup page to search certificates by registration number
- **PDF Generation**: Server-side PDF generation using Puppeteer for printable certificates
- **Admin Authentication**: Basic authentication for admin routes
- **Rate Limiting**: Protection against abuse on public endpoints
- **Flexible Schema**: Handles varying column structures with mapping UI

## Tech Stack

- **Backend**: Node.js + Express
- **Frontend**: Vanilla JavaScript with Tailwind CSS
- **Database**: MongoDB (Mongoose ODM) - Supports both local and MongoDB Atlas
- **File Parsing**: xlsx package
- **PDF Generation**: Puppeteer
- **Authentication**: Basic Auth (bcrypt)

## Prerequisites

- Node.js 18+ 
- npm or yarn
- MongoDB (local or MongoDB Atlas cloud account)
- (Optional) Docker and Docker Compose for containerized deployment

## Installation

1. Clone the repository and navigate to the project directory:
```bash
cd portal
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (or copy from `.env.example`):
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```env
PORT=3000
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_password_here
ADMIN_PASSWORD_HASH=your_bcrypt_hash_here

# MongoDB Connection
# For local MongoDB:
MONGODB_URI=mongodb://localhost:27017/certificates_db

# OR for MongoDB Atlas (Cloud):
# MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/certificates_db?retryWrites=true&w=majority
```

**Note**: To generate password hash, run:
```bash
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('your_password', 10));"
```

## Running Locally

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

The application will be available at `http://localhost:3000`

## Usage

### 1. Upload Certificates

1. Navigate to `/admin/upload`
2. Login with admin credentials (default: `admin` / `admin123`)
3. Select an Excel or CSV file
4. If column names don't match expected fields, use the mapping UI to map columns
5. Confirm import

**Expected Columns:**
- Registration Number (required)
- Student Name
- Father's Name
- Course Name
- Start Date
- End Date
- Issue Date
- Grade

### 2. Lookup Certificate

1. Navigate to `/lookup`
2. Enter a registration number
3. View the certificate
4. Use "Print Certificate" or "Download PDF" buttons

## API Endpoints

### Upload Certificate File
```bash
POST /api/upload
Authorization: Basic <base64(username:password)>
Content-Type: multipart/form-data

# With curl:
curl -X POST http://localhost:3000/api/upload \
  -u admin:admin123 \
  -F "file=@certificates.xlsx"
```

### Upload with Column Mapping
```bash
POST /api/upload/mapping
Authorization: Basic <base64(username:password)>
Content-Type: multipart/form-data

# With curl:
curl -X POST http://localhost:3000/api/upload/mapping \
  -u admin:admin123 \
  -F "file=@certificates.xlsx" \
  -F 'columnMapping={"registrationNo":"REG NO","studentName":"NAME"}'
```

### Lookup Record
```bash
GET /api/record?reg_no=<REGISTRATION_NUMBER>

# With curl:
curl "http://localhost:3000/api/record?reg_no=REG123"
```

### Get Record by ID
```bash
GET /api/record/:id

# With curl:
curl "http://localhost:3000/api/record/1"
```

### Generate PDF
```bash
GET /api/pdf?reg_no=<REGISTRATION_NUMBER>

# With curl:
curl "http://localhost:3000/api/pdf?reg_no=REG123" -o certificate.pdf
```

## Testing

Run tests with:
```bash
npm test
```

## Docker Deployment

### Build and Run with Docker Compose

```bash
docker-compose up -d
```

### Build Docker Image Manually

```bash
docker build -t certificate-portal .
docker run -p 3000:3000 \
  -e ADMIN_USERNAME=admin \
  -e ADMIN_PASSWORD=yourpassword \
  -v $(pwd)/db:/app/db \
  -v $(pwd)/backups:/app/backups \
  certificate-portal
```

## File Structure

```
portal/
├── server.js              # Main server file
├── package.json           # Dependencies
├── db/
│   └── database.js        # Database operations
├── routes/
│   └── api.js             # API route handlers
├── middleware/
│   └── auth.js            # Authentication middleware
├── utils/
│   └── pdfGenerator.js    # PDF generation utilities
├── public/                # Frontend files
│   ├── index.html         # Home page
│   ├── lookup.html        # Certificate lookup page
│   └── admin.html         # Admin upload page
├── uploads/               # Temporary upload directory
├── backups/               # Backup of uploaded files
├── tests/                 # Test files
├── Dockerfile             # Docker configuration
└── docker-compose.yml     # Docker Compose configuration
```

## Customization

### Certificate Design

Edit CSS variables in `public/lookup.html` and `utils/pdfGenerator.js`:

```css
:root {
  --primary-color: #1a472a;      /* Main border color */
  --secondary-color: #2d5016;     /* Secondary text color */
  --accent-color: #d4af37;        /* Accent/border color */
  --font-primary: 'Georgia', 'Times New Roman', serif;
}
```

### Organization Name

Update the organization name in:
- `public/lookup.html` (line with "Certificate of Completion")
- `utils/pdfGenerator.js` (same location)

## Security Notes

- Change default admin credentials in production
- Use HTTPS in production
- Consider implementing JWT tokens instead of Basic Auth for production
- Add CORS restrictions for production
- Regularly backup the SQLite database
- Rate limiting is enabled on lookup endpoints

## Troubleshooting

### PDF Generation Fails

- Ensure Puppeteer dependencies are installed
- On Linux, ensure Chromium dependencies are installed
- Check that the server has write permissions

### File Upload Fails

- Check file size (max 10MB)
- Verify file format (.xlsx, .xls, or .csv)
- Ensure `uploads/` directory exists and is writable

### Database Issues

- Ensure `db/` directory exists and is writable
- Check file permissions on `db/certificates.db`

## License

MIT

