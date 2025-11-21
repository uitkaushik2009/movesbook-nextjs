import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

// Load private key for JWT signing (lazy loaded)
let PRIVATE_KEY: string | null = null;

const getPrivateKey = (): string => {
  if (PRIVATE_KEY) return PRIVATE_KEY;
  
  try {
    const privateKeyPath = path.join(process.cwd(), 'private.pem');
    PRIVATE_KEY = fs.readFileSync(privateKeyPath, 'utf8');
    return PRIVATE_KEY;
  } catch (error) {
    console.warn('Private key not found, using fallback secret');
    PRIVATE_KEY = process.env.JWT_SECRET || 'your-fallback-secret-change-in-production';
    return PRIVATE_KEY;
  }
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

// Generate JWT token with RSA private key
export const generateToken = (userId: string, email: string, username: string, userType: string): string => {
  const payload = { 
    userId, 
    email, 
    username, 
    userType,
    iat: Math.floor(Date.now() / 1000)
  };
  
  const key = getPrivateKey();
  
  try {
    return jwt.sign(payload, key, {
      algorithm: 'RS256',
      expiresIn: '7d'
    });
  } catch (error) {
    // Fallback to HS256 if RSA fails
    return jwt.sign(payload, key, { expiresIn: '7d' });
  }
};

// Verify JWT token
export const verifyToken = (token: string): any => {
  const key = getPrivateKey();
  
  try {
    return jwt.verify(token, key, {
      algorithms: ['RS256', 'HS256']
    });
  } catch (error) {
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