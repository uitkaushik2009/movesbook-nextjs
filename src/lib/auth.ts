import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// JWT Secret (use environment variable or fallback)
const getJwtSecret = (): string => {
  return process.env.JWT_SECRET || 'movesbook-nextjs-jwt-secret-key-2024';
};

// Hash password using bcrypt for new users
export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, 12);
};

// Hash password using SHA1 (for compatibility with old movesbook.net)
export const hashPasswordSHA1 = (password: string): string => {
  return crypto.createHash('sha1').update(password).digest('hex');
};

// Verify password - supports both SHA1 (old) and bcrypt (new)
export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  // Check if it's a SHA1 hash (40 characters hex)
  if (hashedPassword.length === 40 && /^[a-f0-9]+$/i.test(hashedPassword)) {
    const sha1Hash = hashPasswordSHA1(password);
    return sha1Hash === hashedPassword;
  }
  
  // Otherwise, verify as bcrypt
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    return false;
  }
};

// Generate JWT token
export const generateToken = (userId: string, email: string, username: string, userType: string): string => {
  const payload = { 
    userId, 
    email, 
    username, 
    userType,
    iat: Math.floor(Date.now() / 1000)
  };
  
  const secret = getJwtSecret();
  
  return jwt.sign(payload, secret, {
    algorithm: 'HS256',
    expiresIn: '7d'
  });
};

// Verify JWT token
export const verifyToken = (token: string): any => {
  const secret = getJwtSecret();
  
  try {
    return jwt.verify(token, secret, {
      algorithms: ['HS256']
    });
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
};

// Alternative: Export as default object
export default {
  hashPassword,
  hashPasswordSHA1,
  verifyPassword,
  generateToken,
  verifyToken
};