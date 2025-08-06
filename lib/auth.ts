import { jwtDecode } from 'jwt-decode';
import { CustomerDetailsForm } from '@/app/sign-up/types/customer';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  companyName?: string;
  phone?: string;
  countryOfResidence: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postcode: string;
  state?: string;
  isVerified: boolean;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
  // GoCardless fields
  goCardlessCustomerId?: string;
  goCardlessBankAccountId?: string;
  goCardlessMandateId?: string;
  mandateStatus?: string;
  // OpenPhone fields
  openPhoneContactId?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  customer: User; // Backend returns 'customer' not 'user'
  tokens: AuthTokens;
}

export interface ApiError {
  error: string;
  code: string;
  details?: unknown;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

export interface VerifyResetTokenResponse {
  success: boolean;
  message: string;
  customer: {
    email: string;
    firstName: string;
    lastName: string;
  };
}

class AuthService {
  private static instance: AuthService;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private user: User | null = null;
  private refreshPromise: Promise<AuthTokens> | null = null;
  private requestTimestamps: Map<string, number[]> = new Map();

  private constructor() {
    this.loadTokensFromStorage();
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  private getApiBaseUrl(): string {
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  }

  private isRateLimited(endpoint: string): boolean {
    const now = Date.now();
    const windowMs = 60000; // 1 minute window
    const maxRequests = 5; // Max 5 requests per minute per endpoint
    
    if (!this.requestTimestamps.has(endpoint)) {
      this.requestTimestamps.set(endpoint, []);
    }
    
    const timestamps = this.requestTimestamps.get(endpoint)!;
    
    // Remove timestamps older than the window
    const recentTimestamps = timestamps.filter(timestamp => now - timestamp < windowMs);
    this.requestTimestamps.set(endpoint, recentTimestamps);
    
    // Check if we've exceeded the limit
    if (recentTimestamps.length >= maxRequests) {
      return true;
    }
    
    // Add current timestamp
    recentTimestamps.push(now);
    return false;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    retryCount = 0
  ): Promise<T> {
    // Check rate limiting
    if (this.isRateLimited(endpoint)) {
      throw {
        error: 'Too many requests. Please wait a moment and try again.',
        code: 'RATE_LIMIT_EXCEEDED',
      } as ApiError;
    }

    const url = `${this.getApiBaseUrl()}${endpoint}`;
    
    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.accessToken) {
      defaultHeaders['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout for registration
      

      
      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      const data = await response.json();

      if (!response.ok) {
        const error: ApiError = {
          error: data.error || 'An error occurred',
          code: data.code || 'UNKNOWN_ERROR',
          details: data.details,
        };

        // Handle token expiration
        if (response.status === 401 && data.code === 'TOKEN_EXPIRED') {
          await this.handleTokenExpiration();
          // Retry the request once
          const retryResponse = await fetch(url, config);
          const retryData = await retryResponse.json();
          
          if (!retryResponse.ok) {
            throw error;
          }
          
          return retryData;
        }

        throw error;
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        // Handle timeout
        if (error.name === 'AbortError') {
          throw {
            error: 'Registration is taking longer than expected. Please wait a moment and try again.',
            code: 'TIMEOUT_ERROR',
          } as ApiError;
        }
        
        // Check if it's a network error and retry up to 2 times
        if ((error.message.includes('fetch') || error.message.includes('network') || error.message.includes('Failed to fetch')) && retryCount < 2) {
          console.log(`Network error, retrying... (attempt ${retryCount + 1})`);
          await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))); // Exponential backoff
          return this.makeRequest(endpoint, options, retryCount + 1);
        }
        
        // Check if it's a network error
        if (error.message.includes('fetch') || error.message.includes('network') || error.message.includes('Failed to fetch')) {
          throw {
            error: 'Network error. Please check your internet connection and try again.',
            code: 'NETWORK_ERROR',
          } as ApiError;
        }
        throw {
          error: error.message,
          code: 'NETWORK_ERROR',
        } as ApiError;
      }
      throw error;
    }
  }

  private async handleTokenExpiration(): Promise<void> {
    if (!this.refreshToken) {
      this.logout();
      throw { error: 'No refresh token available', code: 'NO_REFRESH_TOKEN' } as ApiError;
    }

    // Prevent multiple refresh requests
    if (this.refreshPromise) {
      await this.refreshPromise;
      return;
    }

    this.refreshPromise = this.refreshAccessToken();
    
    try {
      const tokens = await this.refreshPromise;
      this.setTokens(tokens);
      this.user = await this.getCurrentUser(); // Update user data after refresh
    } catch (error) {
      // If refresh fails, logout the user
      this.logout();
      throw error;
    } finally {
      this.refreshPromise = null;
    }
  }

  private loadTokensFromStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      const storedTokens = localStorage.getItem('auth_tokens');
      if (storedTokens) {
        const tokens: AuthTokens = JSON.parse(storedTokens);
        this.accessToken = tokens.accessToken;
        this.refreshToken = tokens.refreshToken;
      }

      const storedUser = localStorage.getItem('auth_user');
      if (storedUser) {
        this.user = JSON.parse(storedUser);
      }
    } catch (error) {
      console.error('Error loading tokens from storage:', error);
      this.clearTokens();
    }
  }

  private saveTokensToStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      if (this.accessToken && this.refreshToken) {
        const tokens: AuthTokens = {
          accessToken: this.accessToken,
          refreshToken: this.refreshToken,
          expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes
        };
        localStorage.setItem('auth_tokens', JSON.stringify(tokens));
      }

      if (this.user) {
        localStorage.setItem('auth_user', JSON.stringify(this.user));
      }
    } catch (error) {
      console.error('Error saving tokens to storage:', error);
    }
  }

  private clearTokens(): void {
    this.accessToken = null;
    this.refreshToken = null;
    this.user = null;

    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_tokens');
      localStorage.removeItem('auth_user');
    }
  }

  private setTokens(tokens: AuthTokens): void {
    this.accessToken = tokens.accessToken;
    this.refreshToken = tokens.refreshToken;
    this.saveTokensToStorage();
  }

  private isTokenExpired(token: string): boolean {
    try {
      const decoded = jwtDecode(token) as { exp: number };
      // Add 30 seconds buffer to prevent edge cases
      return (decoded.exp * 1000) < (Date.now() - 30000);
    } catch {
      return true;
    }
  }

  async signIn(email: string, password: string): Promise<AuthResponse> {
    const response = await this.makeRequest<AuthResponse>('/api/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    this.setTokens(response.tokens);
    this.user = response.customer; // Backend returns 'customer' not 'user'
    this.saveTokensToStorage();

    return response;
  }

  async signUp(email: string, password: string, name: string): Promise<AuthResponse> {
    const response = await this.makeRequest<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });

    this.setTokens(response.tokens);
    this.user = response.customer; // Backend returns 'customer' not 'user'
    this.saveTokensToStorage();

    return response;
  }

  async signUpCustomer(customerData: CustomerDetailsForm): Promise<AuthResponse> {
    // Transform nested address data to flat structure expected by backend
    const transformedData = {
      ...customerData,
      addressLine1: customerData.address?.line1 || '',
      addressLine2: customerData.address?.line2 || '',
      city: customerData.address?.city || '',
      postcode: customerData.address?.postcode || '',
      state: customerData.address?.state || '',
    };

    // Remove nested address object if it exists
    if ('address' in transformedData) {
      delete (transformedData as Record<string, unknown>).address;
    }

    const response = await this.makeRequest<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(transformedData),
    });

    this.setTokens(response.tokens);
    this.user = response.customer; // Backend returns 'customer' not 'user'
    this.saveTokensToStorage();

    return response;
  }

  async forgotPassword(email: string): Promise<ForgotPasswordResponse> {
    const response = await this.makeRequest<ForgotPasswordResponse>('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });

    return response;
  }

  async resetPassword(token: string, newPassword: string): Promise<ResetPasswordResponse> {
    const response = await this.makeRequest<ResetPasswordResponse>('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });

    return response;
  }

  async verifyResetToken(token: string): Promise<VerifyResetTokenResponse> {
    const response = await this.makeRequest<VerifyResetTokenResponse>('/api/auth/verify-reset-token', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });

    return response;
  }

  async refreshAccessToken(): Promise<AuthTokens> {
    if (!this.refreshToken) {
      throw { error: 'No refresh token available', code: 'NO_REFRESH_TOKEN' } as ApiError;
    }

    const response = await fetch(`${this.getApiBaseUrl()}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken: this.refreshToken }),
    });

    const data = await response.json();

    if (!response.ok) {
      this.logout();
      throw {
        error: data.error || 'Failed to refresh token',
        code: data.code || 'REFRESH_FAILED',
      } as ApiError;
    }

    return data.tokens;
  }

  async logout(): Promise<void> {
    if (this.refreshToken) {
      try {
        await this.makeRequest('/api/auth/logout', {
          method: 'POST',
          body: JSON.stringify({ refreshToken: this.refreshToken }),
        });
      } catch (error) {
        console.error('Error during logout:', error);
      }
    }

    this.clearTokens();
  }

  async logoutFromAllDevices(): Promise<void> {
    try {
      await this.makeRequest('/api/auth/logout-all', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Error during logout from all devices:', error);
    }

    this.clearTokens();
  }

  async getCurrentUser(): Promise<User | null> {
    if (!this.accessToken || this.isTokenExpired(this.accessToken)) {
      return null;
    }

    try {
      const response = await this.makeRequest<{ success: boolean; customer: User }>('/api/auth/profile');
      this.user = response.customer; // Backend returns 'customer' not 'user'
      this.saveTokensToStorage();
      return response.customer;
    } catch (error) {
      console.error('Error fetching current user:', error);
      return null;
    }
  }

  async updateProfile(profileData: Partial<User>): Promise<User> {
    // Format the data for the backend API
    const formattedData: Record<string, string | undefined> = {};
    
    // Basic profile fields
    if (profileData.firstName !== undefined) formattedData.firstName = profileData.firstName;
    if (profileData.lastName !== undefined) formattedData.lastName = profileData.lastName;
    if (profileData.companyName !== undefined) formattedData.companyName = profileData.companyName;
    if (profileData.email !== undefined) formattedData.email = profileData.email;
    if (profileData.phone !== undefined) formattedData.phone = profileData.phone;
    
    // Address fields - nest them under address object
    const addressFields: Record<string, string | undefined> = {};
    if (profileData.addressLine1 !== undefined) addressFields.line1 = profileData.addressLine1;
    if (profileData.addressLine2 !== undefined) addressFields.line2 = profileData.addressLine2;
    if (profileData.city !== undefined) addressFields.city = profileData.city;
    if (profileData.postcode !== undefined) addressFields.postcode = profileData.postcode;
    if (profileData.state !== undefined) addressFields.state = profileData.state;
    
    // Only add address object if there are address fields
    if (Object.keys(addressFields).length > 0) {
      (formattedData as Record<string, unknown>).address = addressFields;
    }

    const response = await this.makeRequest<{ success: boolean; customer: User }>('/api/customers/profile', {
      method: 'PUT',
      body: JSON.stringify(formattedData),
    });

    this.user = response.customer; // Backend returns 'customer' not 'user'
    this.saveTokensToStorage();

    return response.customer;
  }

  // Check if phone number is unique (for frontend validation)
  async checkPhoneUniqueness(phone: string): Promise<boolean> {
    try {
      const response = await this.makeRequest<{ isUnique: boolean }>('/api/auth/check-phone', {
        method: 'POST',
        body: JSON.stringify({ phone }),
      });
      return response.isUnique;
    } catch (error) {
      console.error('Error checking phone uniqueness:', error);
      return false; // Assume not unique if there's an error
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await this.makeRequest('/api/customers/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    // Password changed successfully, user needs to log in again
    this.logout();
  }

  isAuthenticated(): boolean {
    return !!this.accessToken && !this.isTokenExpired(this.accessToken);
  }

  getUser(): User | null {
    return this.user;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }
}

export const authService = AuthService.getInstance(); 