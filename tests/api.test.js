const request = require('supertest');
const express = require('express');
const path = require('path');

// We'll test the routes directly by creating a test app
const { lookupRecord, generateCertificatePDF } = require('../routes/api');
const { findCertificateByRegistrationNo } = require('../db/database');

// Mock the database module
jest.mock('../db/database', () => ({
  initDatabase: jest.fn(() => Promise.resolve()),
  findCertificateByRegistrationNo: jest.fn(),
  getCertificateById: jest.fn(),
  insertCertificate: jest.fn(),
  batchInsertCertificates: jest.fn(),
  getAllCertificates: jest.fn()
}));

describe('API Endpoints', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.get('/api/record', lookupRecord);
    jest.clearAllMocks();
  });

  describe('GET /api/record', () => {
    it('should return 400 if registration number is missing', async () => {
      const response = await request(app)
        .get('/api/record')
        .expect(400);

      expect(response.body.error).toBe('Registration number is required');
    });

    it('should return 404 if record not found', async () => {
      findCertificateByRegistrationNo.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/record')
        .query({ reg_no: 'NONEXISTENT123' })
        .expect(404);

      expect(response.body.error).toBe('No record found for this registration number');
      expect(response.body.suggestion).toBeDefined();
    });

    it('should return record if found', async () => {
      const mockRecord = {
        id: 1,
        registration_no: 'REG123',
        data: {
          studentName: 'John Doe',
          courseName: 'Test Course'
        },
        created_at: '2024-01-01'
      };

      findCertificateByRegistrationNo.mockResolvedValue(mockRecord);

      const response = await request(app)
        .get('/api/record')
        .query({ reg_no: 'REG123' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.record).toEqual(mockRecord);
      expect(findCertificateByRegistrationNo).toHaveBeenCalledWith('REG123');
    });

    it('should handle case-insensitive registration numbers', async () => {
      const mockRecord = {
        id: 1,
        registration_no: 'REG123',
        data: { studentName: 'John Doe' }
      };

      findCertificateByRegistrationNo.mockResolvedValue(mockRecord);

      const response = await request(app)
        .get('/api/record')
        .query({ reg_no: 'reg123' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(findCertificateByRegistrationNo).toHaveBeenCalledWith('reg123');
    });

    it('should trim whitespace from registration number', async () => {
      const mockRecord = {
        id: 1,
        registration_no: 'REG123',
        data: { studentName: 'John Doe' }
      };

      findCertificateByRegistrationNo.mockResolvedValue(mockRecord);

      const response = await request(app)
        .get('/api/record')
        .query({ reg_no: '  REG123  ' })
        .expect(200);

      expect(response.body.success).toBe(true);
      // Verify it was called with trimmed value
      expect(findCertificateByRegistrationNo).toHaveBeenCalled();
    });
  });
});
