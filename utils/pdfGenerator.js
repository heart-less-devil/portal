const puppeteer = require('puppeteer');
const path = require('path');

async function generatePDF(record) {
  let browser;
  
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Create HTML content for certificate
    const htmlContent = generateCertificateHTML(record);
    
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    // Generate PDF with A4 size
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
      }
    });
    
    await browser.close();
    
    return pdfBuffer;
    
  } catch (error) {
    if (browser) {
      await browser.close();
    }
    throw error;
  }
}

function generateCertificateHTML(record) {
  const data = record.data;
  
  // Extract common fields (handle both mapped and original data)
  const studentName = data.studentName || data['STUDENT NAME'] || data['Student Name'] || '';
  const registrationNo = record.registration_no || data.registrationNo || '';
  const fatherName = data.fatherName || data['FATHERS NAME'] || data['Father\'s Name'] || '';
  const courseName = data.courseName || data['COURSE NAME'] || data['Course Name'] || '';
  const startDate = data.startDate || data['STARTING DATE'] || data['Start Date'] || '';
  const endDate = data.endDate || data['END DATE'] || data['End Date'] || '';
  const issueDate = data.issueDate || data['ISSUE DATE'] || data['Issue Date'] || '';
  const grade = data.grade || data['GRADE'] || data['Grade'] || '';
  
  // Get all other fields from original data
  const originalData = data._original || data;
  const additionalFields = Object.keys(originalData)
    .filter(key => !['studentName', 'registrationNo', 'fatherName', 'courseName', 
                     'startDate', 'endDate', 'issueDate', 'grade',
                     'STUDENT NAME', 'REGISTRATION NO', 'FATHERS NAME', 'COURSE NAME',
                     'STARTING DATE', 'END DATE', 'ISSUE DATE', 'GRADE',
                     'Student Name', 'Registration No', 'Father\'s Name', 'Course Name',
                     'Start Date', 'End Date', 'Issue Date', 'Grade', '_original']
                   .includes(key));
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Certificate - ${registrationNo}</title>
  <style>
    :root {
      --primary-color: #1a472a;
      --secondary-color: #2d5016;
      --accent-color: #d4af37;
      --text-color: #333;
      --border-color: #ddd;
      --font-primary: 'Georgia', 'Times New Roman', serif;
      --font-secondary: 'Arial', sans-serif;
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: var(--font-primary);
      color: var(--text-color);
      background: #f5f5f5;
      padding: 20px;
    }
    
    .certificate-container {
      max-width: 210mm;
      margin: 0 auto;
      background: 
        linear-gradient(135deg, #fefefe 0%, #faf8f3 50%, #fefefe 100%),
        radial-gradient(circle at 50% 50%, rgba(212, 175, 55, 0.05) 0%, transparent 70%);
      padding: 60px;
      border: 20px double var(--primary-color);
      border-radius: 15px;
      box-shadow: 
        0 0 0 8px rgba(212, 175, 55, 0.3),
        0 0 0 16px rgba(26, 71, 42, 0.1),
        0 20px 60px rgba(0,0,0,0.15),
        inset 0 0 50px rgba(212, 175, 55, 0.05);
      position: relative;
      overflow: hidden;
    }
    
    .certificate-container::before {
      content: '';
      position: absolute;
      top: 20px;
      left: 20px;
      right: 20px;
      bottom: 20px;
      border: 2px solid rgba(212, 175, 55, 0.4);
      border-radius: 10px;
      pointer-events: none;
    }
    
    .certificate-header {
      text-align: center;
      margin-bottom: 50px;
      padding: 40px 0;
      border-bottom: 6px double var(--accent-color);
      border-top: 3px solid rgba(212, 175, 55, 0.3);
      position: relative;
      background: linear-gradient(to bottom, transparent, rgba(212, 175, 55, 0.05), transparent);
    }
    
    .organization-name {
      font-size: 42px;
      font-weight: 800;
      background: linear-gradient(135deg, #1a472a 0%, #2d5016 50%, #1a472a 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 20px;
      text-transform: uppercase;
      letter-spacing: 5px;
      position: relative;
      padding: 20px 0;
    }
    
    .certificate-title {
      font-size: 28px;
      color: var(--secondary-color);
      font-style: italic;
      font-weight: 500;
      margin-top: 15px;
      letter-spacing: 2px;
    }
    
    .certificate-body {
      margin: 40px 0;
      line-height: 2;
      font-size: 16px;
    }
    
    .certificate-text {
      text-align: center;
      margin: 20px 0;
      font-size: 18px;
    }
    
    .student-name {
      font-size: 38px;
      font-weight: 800;
      background: linear-gradient(135deg, #1a472a 0%, #2d5016 50%, #1a472a 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      text-transform: uppercase;
      margin: 35px 0;
      border-bottom: 4px double var(--accent-color);
      border-top: 4px double var(--accent-color);
      display: inline-block;
      padding: 18px 50px;
      border-radius: 8px;
      box-shadow: 0 6px 20px rgba(212, 175, 55, 0.3);
      letter-spacing: 3px;
      position: relative;
      background-color: rgba(255, 255, 255, 0.9);
    }
    
    .certificate-details {
      margin: 30px 0;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }
    
    .detail-item {
      padding: 22px;
      background: linear-gradient(135deg, #ffffff 0%, #faf8f3 100%);
      border-left: 6px solid var(--accent-color);
      border-right: 2px solid rgba(212, 175, 55, 0.2);
      border-top: 2px solid rgba(212, 175, 55, 0.2);
      border-bottom: 2px solid rgba(212, 175, 55, 0.2);
      border-radius: 10px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
      position: relative;
    }
    
    .detail-label {
      font-weight: 700;
      color: var(--secondary-color);
      margin-bottom: 10px;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 2px;
      border-bottom: 1px solid rgba(212, 175, 55, 0.3);
      padding-bottom: 5px;
      display: inline-block;
      width: 100%;
    }
    
    .detail-value {
      font-size: 18px;
      color: var(--text-color);
      font-weight: 600;
      line-height: 1.6;
    }
    
    .certificate-footer {
      margin-top: 60px;
      padding-top: 40px;
      border-top: 4px double rgba(212, 175, 55, 0.4);
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      position: relative;
    }
    
    .signature-block {
      text-align: center;
      width: 220px;
      padding: 15px;
      background: rgba(255, 255, 255, 0.5);
      border-radius: 8px;
      border: 2px solid rgba(212, 175, 55, 0.2);
    }
    
    .signature-line {
      border-top: 3px solid var(--text-color);
      margin: 70px 0 12px 0;
      width: 100%;
      position: relative;
    }
    
    .signature-line::before,
    .signature-line::after {
      content: '';
      position: absolute;
      top: -3px;
      width: 15px;
      height: 3px;
      background: var(--text-color);
      border-radius: 2px;
    }
    
    .signature-line::before {
      left: 0;
    }
    
    .signature-line::after {
      right: 0;
    }
    
    .signature-label {
      font-size: 15px;
      color: var(--secondary-color);
      text-transform: uppercase;
      font-weight: 600;
      letter-spacing: 1.5px;
    }
    
    .logo-img {
      width: 200px;
      height: auto;
      max-height: 180px;
      object-fit: contain;
      margin: 0 auto 30px;
      display: block;
      filter: drop-shadow(0 4px 15px rgba(26, 71, 42, 0.2));
    }
    
    @media print {
      body {
        background: white;
        padding: 0;
      }
      
      .certificate-container {
        box-shadow: none;
        border: 8px solid var(--primary-color);
      }
    }
  </style>
</head>
<body>
  <div class="certificate-container">
    <div class="certificate-header">
      ${getLogoPath() ? `<img src="${getLogoPath()}" alt="ICS Group Logo" class="logo-img" />` : '<div class="logo-placeholder" style="width: 160px; height: 160px; border: 6px double var(--primary-color); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--primary-color); font-size: 16px; font-weight: 700; text-align: center; margin: 0 auto 30px;">LOGO</div>'}
      <div class="organization-name">Certificate of Completion</div>
      <div class="certificate-title">This is to certify that</div>
    </div>
    
    <div class="certificate-body">
      <div class="certificate-text" style="text-align: center; margin: 40px 0; font-size: 20px; line-height: 2;">
        <div class="student-name">${escapeHtml(studentName)}</div>
        <p style="margin-top: 40px; color: #555; font-size: 21px; letter-spacing: 1px;">
          has successfully completed the course
        </p>
        ${courseName ? `<p style="font-weight: 700; font-size: 24px; margin: 25px 0; color: var(--secondary-color); padding: 20px 30px; background: linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(212, 175, 55, 0.08) 100%); border: 3px double rgba(212, 175, 55, 0.4); border-radius: 12px; display: inline-block; box-shadow: 0 4px 15px rgba(212, 175, 55, 0.2);">${escapeHtml(courseName)}</p>` : ''}
      </div>
      
      <div class="certificate-details">
        ${registrationNo ? `
        <div class="detail-item">
          <div class="detail-label">Registration Number</div>
          <div class="detail-value">${escapeHtml(registrationNo)}</div>
        </div>
        ` : ''}
        
        ${fatherName ? `
        <div class="detail-item">
          <div class="detail-label">Father's Name</div>
          <div class="detail-value">${escapeHtml(fatherName)}</div>
        </div>
        ` : ''}
        
        ${startDate ? `
        <div class="detail-item">
          <div class="detail-label">Start Date</div>
          <div class="detail-value">${escapeHtml(formatDate(startDate))}</div>
        </div>
        ` : ''}
        
        ${endDate ? `
        <div class="detail-item">
          <div class="detail-label">End Date</div>
          <div class="detail-value">${escapeHtml(formatDate(endDate))}</div>
        </div>
        ` : ''}
        
        ${issueDate ? `
        <div class="detail-item">
          <div class="detail-label">Issue Date</div>
          <div class="detail-value">${escapeHtml(formatDate(issueDate))}</div>
        </div>
        ` : ''}
        
        ${grade ? `
        <div class="detail-item" style="grid-column: 1 / -1; background: linear-gradient(135deg, rgba(212, 175, 55, 0.2) 0%, rgba(212, 175, 55, 0.1) 100%); border: 4px double var(--accent-color); padding: 30px;">
          <div class="detail-label" style="font-size: 16px; margin-bottom: 15px;">Grade</div>
          <div class="detail-value" style="font-size: 48px; font-weight: 800; color: var(--accent-color); text-shadow: 3px 3px 6px rgba(0,0,0,0.15); letter-spacing: 5px; text-align: center;">${escapeHtml(grade)}</div>
        </div>
        ` : ''}
      </div>
      
      ${additionalFields.length > 0 ? `
      <div style="margin-top: 40px; padding: 30px; background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%); border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.08); border: 2px solid rgba(212, 175, 55, 0.3);">
        <h3 style="color: var(--secondary-color); margin-bottom: 20px; font-size: 20px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; border-bottom: 3px double var(--accent-color); padding-bottom: 12px; text-align: center;">Additional Information</h3>
        <div class="certificate-details">
          ${additionalFields.map(field => `
            <div class="detail-item">
              <div class="detail-label">${escapeHtml(formatFieldName(field))}</div>
              <div class="detail-value">${escapeHtml(String(originalData[field] || ''))}</div>
            </div>
          `).join('')}
        </div>
      </div>
      ` : ''}
    </div>
    
    <div class="certificate-footer">
      <div class="signature-block">
        <div class="signature-line"></div>
        <div class="signature-label">Authorized Signature</div>
      </div>
      
      <div class="signature-block">
        <div class="signature-line"></div>
        <div class="signature-label">Date: ${escapeHtml(formatDate(issueDate || new Date().toISOString()))}</div>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

function escapeHtml(text) {
  if (!text) return '';
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return String(text).replace(/[&<>"']/g, m => map[m]);
}

function formatDate(dateString) {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString; // Return as-is if not a valid date
    }
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  } catch (e) {
    return dateString;
  }
}

function formatFieldName(fieldName) {
  return fieldName
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}

function getLogoPath() {
  const path = require('path');
  const fs = require('fs');
  
  // Try different possible logo locations
  const possiblePaths = [
    path.join(__dirname, '..', 'public', 'logo', 'logo.png'),
    path.join(__dirname, '..', 'logo', 'Screenshot 2025-11-01 162502.png'),
    path.join(__dirname, '..', 'logo', 'logo.png')
  ];
  
  for (const logoPath of possiblePaths) {
    if (fs.existsSync(logoPath)) {
      // Convert to file:// URL for Puppeteer
      return `file://${logoPath.replace(/\\/g, '/')}`;
    }
  }
  
  // Fallback to placeholder if logo not found
  return null;
}

module.exports = {
  generatePDF,
  generateCertificateHTML
};

