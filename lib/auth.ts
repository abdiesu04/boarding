import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Hash password
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

// Compare password with hash
export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// Get consistent JWT secret
function getJwtSecret(): string {
  // Use a consistent secret for both token generation and verification
  // If no environment variable is set, use a fixed fallback (not recommended for production)
  const secret = process.env.JWT_SECRET || 'clientonboarding-secure-jwt-secret-key-2024';
  
  // Log the first few characters of the secret for debugging
  // Don't log the entire secret for security reasons
  const secretPreview = secret.substring(0, 5) + '...' + secret.substring(secret.length - 3);
  console.log(`[Auth] Using JWT_SECRET: ${secretPreview}`);
  
  return secret;
}

// Generate JWT token
export function generateToken(user: { id: string; email: string; role: string }): string {
  const secret = getJwtSecret();
  
  console.log(`[Auth] Generating token for user: ${user.email} with role: ${user.role}`);
  
  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    secret,
    { expiresIn: '7d' }
  );
  
  console.log(`[Auth] Token generated: ${token.substring(0, 20)}...`);
  return token;
}

// Verify JWT token
export function verifyToken(token: string): any {
  // Use the same secret as token generation
  const secret = getJwtSecret();
  
  try {
    console.log(`[Auth] Verifying token: ${token ? token.substring(0, 20) + '...' : 'missing'}`);
    const decoded = jwt.verify(token, secret);
    console.log(`[Auth] Token verified successfully:`, decoded);
    return decoded;
  } catch (error) {
    console.error(`[Auth] Token verification failed:`, error);
    // Log the specific error for debugging
    if (error instanceof jwt.JsonWebTokenError) {
      console.error(`[Auth] JWT Error: ${error.message}`);
    } else if (error instanceof jwt.TokenExpiredError) {
      console.error(`[Auth] Token expired at: ${error.expiredAt}`);
    } else if (error instanceof jwt.NotBeforeError) {
      console.error(`[Auth] Token not active yet`);
    } else {
      console.error(`[Auth] Unknown token error:`, error);
    }
    return null;
  }
}

// Create a type for the token payload
export interface TokenPayload {
  id: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}
