/**
 * Authentication request payload for login.
 * Supports email or phone number as identifier.
 */
export interface LoginRequest {
  identifier: string; // Email or phone number
  password: string;
}

/**
 * Authentication response returned from Django REST Framework endpoint.
 */
export interface LoginResponse {
  token?: string;
  refresh?: string;
  user?: User;
}

/**
 * User entity representation.
 */
export interface User {
  id: string | number;
  email?: string;
  phoneNumber?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
}
