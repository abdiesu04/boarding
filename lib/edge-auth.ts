export interface TokenPayload {
  id: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

// Get consistent JWT secret
function getJwtSecret(): string {
  // Use a consistent secret for both token generation and verification
  // If no environment variable is set, use a fixed fallback (not recommended for production)
  const secret = process.env.JWT_SECRET || 'clientonboarding-secure-jwt-secret-key-2024';
  
  // Log the first few characters of the secret for debugging
  // Don't log the entire secret for security reasons
  const secretPreview = secret.substring(0, 5) + '...' + secret.substring(secret.length - 3);
  console.log(`[EdgeAuth] Using JWT_SECRET: ${secretPreview}`);
  
  return secret;
}

// Simple base64 decode function that works in Edge runtime
function base64Decode(str: string): string {
  // Replace non-url compatible chars with base64 standard chars
  const input = str.replace(/-/g, '+').replace(/_/g, '/');
  
  // Edge runtime has btoa/atob
  return decodeURIComponent(
    atob(input)
      .split('')
      .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );
}

// Custom JWT verification function that works in Edge runtime
// This is a simplified version that only checks expiration and format
export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    console.log(`[EdgeAuth] Verifying token: ${token ? token.substring(0, 20) + '...' : 'missing'}`);
    
    // Split the token into parts
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('[EdgeAuth] JWT Error: Token does not have three parts');
      return null;
    }
    
    // Decode the payload
    try {
      const payload = JSON.parse(base64Decode(parts[1]));
      console.log('[EdgeAuth] Token payload:', payload);
      
      // Check if token is expired
      if (payload.exp) {
        const now = Math.floor(Date.now() / 1000);
        if (now > payload.exp) {
          console.error(`[EdgeAuth] JWT Error: Token expired at ${new Date(payload.exp * 1000).toISOString()}`);
          return null;
        }
      }
      
      // For now, we'll just check the format and expiration
      // In a production app, you should verify the signature as well
      
      console.log(`[EdgeAuth] Token verified successfully (format and expiration only)`);
      return payload as TokenPayload;
    } catch (e) {
      console.error('[EdgeAuth] JWT Error: Could not decode payload', e);
      return null;
    }
  } catch (error) {
    console.error(`[EdgeAuth] Token verification failed:`, error);
    return null;
  }
}
