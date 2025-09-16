/**
 * Utility functions for JWT token handling
 */

// Simple JWT decoder (without verification - only for extracting payload)
export const decodeJWT = (token: string) => {
  try {
    // JWT format: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format');
    }

    // Decode the payload (second part)
    const payload = parts[1];
    // Add padding if needed for proper base64 decoding
    const paddedPayload = payload + '='.repeat((4 - payload.length % 4) % 4);
    const decodedPayload = atob(paddedPayload.replace(/-/g, '+').replace(/_/g, '/'));
    
    return JSON.parse(decodedPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

// Check if JWT token is expired
export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = decodeJWT(token);
    if (!decoded || !decoded.exp) {
      return true;
    }
    
    // exp is in seconds, Date.now() is in milliseconds
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true;
  }
};

// Extract user info from JWT
export const getUserFromToken = (token: string) => {
  try {
    const decoded = decodeJWT(token);
    if (!decoded) {
      return null;
    }

    return {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      firstName: decoded.firstName,
      lastName: decoded.lastName,
      exp: decoded.exp,
      iat: decoded.iat
    };
  } catch (error) {
    console.error('Error extracting user from token:', error);
    return null;
  }
};

// Get backend API base URL
export const getBackendURL = () => {
  // Prefer the same env var used across the app, with sensible fallbacks
  return (
    process.env.NEXT_PUBLIC_SERVER_NAME ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    'http://localhost:4000'
  );
};

// Clear authentication data
export const clearAuthData = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('jwt');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    localStorage.removeItem('firstName');
    localStorage.removeItem('lastName');
    localStorage.removeItem('registeredUser');
    localStorage.removeItem('expiryDate');
  }
};

// Check if user should be redirected to login
export const shouldRedirectToLogin = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const token = localStorage.getItem('jwt');
  if (!token) return true;
  
  const expired = isTokenExpired(token);
  if (expired) {
    clearAuthData();
    return true;
  }
  
  const userInfo = getUserFromToken(token);
  if (!userInfo || !userInfo.id || !userInfo.role) {
    clearAuthData();
    return true;
  }
  
  return false;
};

// Validate authentication response
export const validateAuthResponse = (data: any) => {
  if (!data || !data.token) {
    throw new Error('No token received from server');
  }

  const userInfo = getUserFromToken(data.token);
  if (!userInfo) {
    throw new Error('Invalid token received');
  }

  if (!userInfo.role || !userInfo.id) {
    throw new Error('Incomplete user information in token');
  }

  return {
    token: data.token,
    userInfo,
    message: data.message,
    notifications: data.Notifications || 0
  };
};