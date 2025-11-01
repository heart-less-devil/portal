const mongoose = require('mongoose');
const path = require('path');

// MongoDB connection string from environment or default to local
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/certificates_db';

// Certificate Schema - Flexible to store any Excel data
const certificateSchema = new mongoose.Schema({
  registration_no: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: false // We're using created_at instead
});

// Create index for case-insensitive search on registration_no
certificateSchema.index({ registration_no: 1 });

// Create model
const Certificate = mongoose.model('Certificate', certificateSchema);

// Initialize database connection
async function initDatabase() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB:', MONGODB_URI);
    console.log('✅ Database initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    throw error;
  }
}

// Insert certificate record
async function insertCertificate(registrationNo, data) {
  try {
    // Use upsert: update if exists, insert if not
    const certificate = await Certificate.findOneAndUpdate(
      { registration_no: registrationNo.trim() },
      {
        registration_no: registrationNo.trim(),
        data: data,
        created_at: new Date()
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true
      }
    );
    
    return {
      id: certificate._id.toString(),
      registrationNo: certificate.registration_no,
      data: certificate.data
    };
  } catch (error) {
    throw new Error(`Failed to insert certificate: ${error.message}`);
  }
}

// Find certificate by registration number (case-insensitive)
async function findCertificateByRegistrationNo(registrationNo) {
  try {
    const trimmedRegNo = registrationNo.trim();
    
    // Case-insensitive search using regex
    const certificate = await Certificate.findOne({
      registration_no: { $regex: new RegExp(`^${trimmedRegNo}$`, 'i') }
    });
    
    if (!certificate) {
      return null;
    }
    
    return {
      id: certificate._id.toString(),
      registration_no: certificate.registration_no,
      data: certificate.data,
      created_at: certificate.created_at
    };
  } catch (error) {
    throw new Error(`Failed to find certificate: ${error.message}`);
  }
}

// Get certificate by ID
async function getCertificateById(id) {
  try {
    const certificate = await Certificate.findById(id);
    
    if (!certificate) {
      return null;
    }
    
    return {
      id: certificate._id.toString(),
      registration_no: certificate.registration_no,
      data: certificate.data,
      created_at: certificate.created_at
    };
  } catch (error) {
    throw new Error(`Failed to get certificate: ${error.message}`);
  }
}

// Get all certificates (for admin preview)
async function getAllCertificates(limit = 100) {
  try {
    const certificates = await Certificate.find()
      .sort({ created_at: -1 })
      .limit(limit)
      .lean(); // Use lean() for better performance
    
    return certificates.map(cert => ({
      id: cert._id.toString(),
      registration_no: cert.registration_no,
      data: cert.data,
      created_at: cert.created_at
    }));
  } catch (error) {
    throw new Error(`Failed to get certificates: ${error.message}`);
  }
}

// Batch insert certificates
async function batchInsertCertificates(certificates) {
  try {
    const operations = certificates.map(cert => ({
      updateOne: {
        filter: { registration_no: cert.registrationNo.trim() },
        update: {
          $set: {
            registration_no: cert.registrationNo.trim(),
            data: cert.data,
            created_at: new Date()
          }
        },
        upsert: true
      }
    }));
    
    const result = await Certificate.bulkWrite(operations);
    
    return {
      count: result.upsertedCount + result.modifiedCount,
      inserted: result.upsertedCount,
      updated: result.modifiedCount
    };
  } catch (error) {
    throw new Error(`Failed to batch insert certificates: ${error.message}`);
  }
}

// Close database connection (for graceful shutdown)
async function closeDatabase() {
  try {
    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed');
  } catch (error) {
    console.error('❌ Error closing MongoDB connection:', error.message);
  }
}

// Export functions
module.exports = {
  initDatabase,
  insertCertificate,
  findCertificateByRegistrationNo,
  getCertificateById,
  getAllCertificates,
  batchInsertCertificates,
  closeDatabase,
  Certificate // Export model for advanced queries if needed
};
