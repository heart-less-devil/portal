const multer = require('multer');
const path = require('path');
const fs = require('fs');
const XLSX = require('xlsx');
const {
  insertCertificate,
  findCertificateByRegistrationNo,
  getCertificateById,
  batchInsertCertificates,
  getAllCertificates
} = require('../db/database');
const { generatePDF } = require('../utils/pdfGenerator');

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  fileFilter: (req, file, cb) => {
    const allowedTypes = /\.(xlsx|xls|csv)$/i;
    const extname = allowedTypes.test(path.extname(file.originalname));
    const mimetype = file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                     file.mimetype === 'application/vnd.ms-excel' ||
                     file.mimetype === 'text/csv' ||
                     file.mimetype === 'application/csv';

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel (.xlsx, .xls) and CSV files are allowed'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Parse Excel/CSV file
function parseFile(filePath, fileExtension) {
  let workbook;
  
  if (fileExtension === '.csv') {
    // Read CSV as text and convert to workbook
    const csvContent = fs.readFileSync(filePath, 'utf-8');
    workbook = XLSX.read(csvContent, { type: 'string' });
  } else {
    workbook = XLSX.readFile(filePath);
  }
  
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  
  // Convert to JSON with header row
  const data = XLSX.utils.sheet_to_json(worksheet, { 
    defval: '',
    raw: false // Get formatted values
  });
  
  return {
    headers: Object.keys(data[0] || {}),
    rows: data,
    sheetName
  };
}

// Find registration number column (case-insensitive)
function findRegistrationColumn(headers) {
  const regPatterns = [
    /registration.?no/i,
    /reg.?no/i,
    /registration/i,
    /reg.?number/i
  ];
  
  for (let i = 0; i < headers.length; i++) {
    for (const pattern of regPatterns) {
      if (pattern.test(headers[i])) {
        return headers[i];
      }
    }
  }
  
  return null;
}

// Upload file handler
async function uploadFile(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    
    // Parse the file
    const { headers, rows } = parseFile(filePath, fileExtension);
    
    // Find registration number column
    const regColumn = findRegistrationColumn(headers);
    
    if (!regColumn && rows.length > 0) {
      // Return headers and first row for column mapping
      return res.json({
        requiresMapping: true,
        headers,
        sampleRow: rows[0] || {},
        totalRows: rows.length
      });
    }
    
    // Process and insert rows
    const certificates = [];
    const errors = [];
    
    rows.forEach((row, index) => {
      const registrationNo = row[regColumn] || row[headers[0]] || `ROW_${index}`;
      
      if (!registrationNo || registrationNo.trim() === '') {
        errors.push({ row: index + 2, error: 'Missing registration number' });
        return;
      }
      
      certificates.push({
        registrationNo: String(registrationNo).trim(),
        data: row
      });
    });
    
    // Batch insert
    if (certificates.length > 0) {
      await batchInsertCertificates(certificates);
    }
    
    // Save original file to backups folder
    const backupsDir = path.join(__dirname, '..', 'backups');
    if (!fs.existsSync(backupsDir)) {
      fs.mkdirSync(backupsDir, { recursive: true });
    }
    
    const backupPath = path.join(
      backupsDir,
      `${Date.now()}_${req.file.originalname}`
    );
    fs.copyFileSync(filePath, backupPath);
    
    // Clean up temp file
    fs.unlinkSync(filePath);
    
    res.json({
      success: true,
      imported: certificates.length,
      errors: errors.length > 0 ? errors : undefined,
      message: `Successfully imported ${certificates.length} certificates`
    });
    
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to process file' 
    });
  }
}

// Upload with column mapping
async function uploadWithMapping(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { columnMapping } = req.body;
    
    if (!columnMapping || !columnMapping.registrationNo) {
      return res.status(400).json({ 
        error: 'Registration number column mapping is required' 
      });
    }

    const filePath = req.file.path;
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    
    // Parse the file
    const { headers, rows } = parseFile(filePath, fileExtension);
    
    // Process rows with mapping
    const certificates = [];
    const errors = [];
    
    rows.forEach((row, index) => {
      const registrationNo = row[columnMapping.registrationNo];
      
      if (!registrationNo || registrationNo.trim() === '') {
        errors.push({ row: index + 2, error: 'Missing registration number' });
        return;
      }
      
      // Map all columns according to mapping
      const mappedData = {};
      Object.keys(columnMapping).forEach(targetField => {
        const sourceColumn = columnMapping[targetField];
        if (sourceColumn && row[sourceColumn] !== undefined) {
          mappedData[targetField] = row[sourceColumn];
        }
      });
      
      // Also keep original row data for flexibility
      mappedData._original = row;
      
      certificates.push({
        registrationNo: String(registrationNo).trim(),
        data: mappedData
      });
    });
    
    // Batch insert
    if (certificates.length > 0) {
      await batchInsertCertificates(certificates);
    }
    
    // Save original file to backups folder
    const backupsDir = path.join(__dirname, '..', 'backups');
    if (!fs.existsSync(backupsDir)) {
      fs.mkdirSync(backupsDir, { recursive: true });
    }
    
    const backupPath = path.join(
      backupsDir,
      `${Date.now()}_${req.file.originalname}`
    );
    fs.copyFileSync(filePath, backupPath);
    
    // Clean up temp file
    fs.unlinkSync(filePath);
    
    res.json({
      success: true,
      imported: certificates.length,
      errors: errors.length > 0 ? errors : undefined,
      message: `Successfully imported ${certificates.length} certificates`
    });
    
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to process file' 
    });
  }
}

// Lookup record by registration number
async function lookupRecord(req, res, next) {
  try {
    const { reg_no } = req.query;
    
    if (!reg_no || !reg_no.trim()) {
      return res.status(400).json({ 
        error: 'Registration number is required' 
      });
    }
    
    const record = await findCertificateByRegistrationNo(reg_no.trim());
    
    if (!record) {
      return res.status(404).json({ 
        error: 'No record found for this registration number',
        suggestion: 'Please double-check the registration number and try again.'
      });
    }
    
    res.json({ success: true, record });
    
  } catch (error) {
    console.error('Lookup error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to lookup record' 
    });
  }
}

// Get record by ID
async function getRecordById(req, res, next) {
  try {
    const { id } = req.params;
    
    const record = await getCertificateById(id);
    
    if (!record) {
      return res.status(404).json({ 
        error: 'Record not found' 
      });
    }
    
    res.json({ success: true, record });
    
  } catch (error) {
    console.error('Get record error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to get record' 
    });
  }
}

// Get all records (for debugging/admin)
async function getAllRecords(req, res, next) {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const records = await getAllCertificates(limit);
    
    res.json({
      success: true,
      count: records.length,
      records: records.map(r => ({
        id: r.id,
        registration_no: r.registration_no,
        created_at: r.created_at
      }))
    });
  } catch (error) {
    console.error('Get all records error:', error);
    res.status(500).json({
      error: error.message || 'Failed to get records'
    });
  }
}

// Generate PDF for certificate
async function generateCertificatePDF(req, res, next) {
  try {
    const { reg_no } = req.query;
    
    if (!reg_no || !reg_no.trim()) {
      return res.status(400).json({ 
        error: 'Registration number is required' 
      });
    }
    
    const record = await findCertificateByRegistrationNo(reg_no.trim());
    
    if (!record) {
      return res.status(404).json({ 
        error: 'No record found for this registration number' 
      });
    }
    
    const pdfBuffer = await generatePDF(record);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition', 
      `attachment; filename="certificate_${record.registration_no}.pdf"`
    );
    res.send(pdfBuffer);
    
  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to generate PDF' 
    });
  }
}

module.exports = {
  upload,
  uploadFile,
  uploadWithMapping,
  lookupRecord,
  getRecordById,
  getAllRecords,
  generateCertificatePDF
};

