require('dotenv').config();
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');
const { upload, uploadFile, uploadWithMapping, lookupRecord, getRecordById, getAllRecords, generateCertificatePDF } = require('./routes/api');
const { authenticateAdmin } = require('./middleware/auth');
const { initDatabase } = require('./db/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Rate limiting for lookup endpoint
const lookupLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// Initialize database
initDatabase().catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/lookup', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'lookup.html'));
});

// Admin upload page - no auth required to view (has its own login form)
app.get('/admin/upload', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.post('/api/upload', authenticateAdmin, upload.single('file'), uploadFile);
app.post('/api/upload/mapping', authenticateAdmin, upload.single('file'), uploadWithMapping);
app.get('/api/record', lookupLimiter, lookupRecord);
app.get('/api/record/:id', getRecordById);
app.get('/api/records', authenticateAdmin, getAllRecords); // Debug endpoint to see uploaded records
app.get('/api/pdf', lookupLimiter, generateCertificatePDF);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({ 
    error: err.message || 'Internal server error' 
  });
});

// Export app for testing
module.exports = app;

// Only start server if not in test environment
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

