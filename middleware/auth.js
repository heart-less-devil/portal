const bcrypt = require('bcryptjs');

// Simple in-memory auth (for production, use proper session/JWT)
// In production, store hashed password in database
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || 
  bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'admin123', 10);

// Basic authentication middleware
function authenticateAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return res.status(401).json({ 
      error: 'Authentication required',
      message: 'Please provide username and password via Basic Auth'
    });
  }
  
  const credentials = Buffer.from(authHeader.split(' ')[1], 'base64')
    .toString('utf-8')
    .split(':');
  
  const [username, password] = credentials;
  
  // Check username (can be configured via env)
  if (username !== (process.env.ADMIN_USERNAME || 'admin')) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  // Check password
  if (!bcrypt.compareSync(password, ADMIN_PASSWORD_HASH)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  next();
}

module.exports = {
  authenticateAdmin
};

