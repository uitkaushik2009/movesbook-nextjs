/**
 * Get authentication token from localStorage
 * Checks both regular user token and admin token
 * @returns token string or null if not found
 */
export function getAuthToken(): string | null {
  return localStorage.getItem('token') || localStorage.getItem('adminToken');
}

/**
 * Check if user is authenticated (has valid token)
 * @returns true if token exists
 */
export function isAuthenticated(): boolean {
  return !!getAuthToken();
}

/**
 * Get user info from localStorage
 * Checks both regular user and admin user
 * @returns user object or null
 */
export function getUserInfo(): any | null {
  const userStr = localStorage.getItem('user') || localStorage.getItem('adminUser');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

/**
 * Create Authorization header with Bearer token
 * @returns headers object ready for fetch
 */
export function getAuthHeaders(): HeadersInit {
  const token = getAuthToken();
  if (!token) {
    return {};
  }
  
  return {
    'Authorization': `Bearer ${token}`
  };
}

/**
 * Create full headers including Content-Type and Authorization
 * @returns headers object ready for fetch
 */
export function getJsonAuthHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    ...getAuthHeaders()
  };
}

