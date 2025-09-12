/**
 * API service for Stika web application
 * Handles all HTTP requests to the Django backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';

interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string>;
  [key: string]: any;
}

interface SignupData {
  fullName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  userType: 'agency' | 'client';
  agreeToTerms: boolean;
}

interface LoginData {
  email: string;
  password: string;
}

interface User {
  id: string;
  email: string;
  username: string;
  full_name: string;
  user_type: 'agency' | 'client';
  is_verified: boolean;
  last_login?: string;
  agency?: {
    id: string;
    name: string;
    slug: string;
    subdomain: string;
    is_verified: boolean;
    phone: string;
    address: string;
    city: string;
    state: string;
    current_balance: number;
    total_spend: number;
    total_campaigns: number;
    active_campaigns: number;
  };
}

class ApiService {
  private getAuthHeaders(): Record<string, string> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }

  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      
      // For login/signup/activation endpoints, don't include auth headers
      const isPublicEndpoint = endpoint.includes('/login/') || 
                              endpoint.includes('/signup/') || 
                              endpoint.includes('/activate/') ||
                              endpoint.includes('/invite-codes/validate');
      
      // Merge headers properly - explicit headers override auth headers
      const defaultHeaders = isPublicEndpoint ? 
        { 'Content-Type': 'application/json' } : 
        this.getAuthHeaders();
      const headers = options.headers ? 
        { ...defaultHeaders, ...options.headers } : 
        defaultHeaders;
      
      const config: RequestInit = {
        ...options,
        headers,
      };

      const response = await fetch(url, config);
      
      // Check if the response is actually JSON
      const contentType = response.headers.get('content-type');
      let data: any;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        // Not JSON - likely HTML error page
        const textContent = await response.text();
        data = {
          success: false,
          message: response.status === 404 
            ? 'Server endpoint not found. Please check your backend configuration.'
            : `Server returned non-JSON response (${response.status})`
        };
        console.warn('Non-JSON response received:', textContent.substring(0, 200));
      }

      // Handle 401 token validation errors - auto logout
      if (response.status === 401 && data?.code === 'token_not_valid') {
        console.log('Invalid token detected, auto-logging out user');
        this.clearAuthTokens();
        localStorage.removeItem('user');
        
        // Only redirect if we're not already on a public page
        if (typeof window !== 'undefined') {
          const currentPath = window.location.pathname;
          const publicPaths = ['/auth/login', '/auth/signup', '/auth/activate', '/'];
          
          if (!publicPaths.some(path => currentPath.startsWith(path))) {
            // Add a flag to indicate auto-logout
            const redirectUrl = `/auth/login?auto_logout=true&redirect=${encodeURIComponent(currentPath)}`;
            window.location.href = redirectUrl;
          }
        }
        
        return {
          success: false,
          message: 'Your session has expired. Please login again.',
          code: 'session_expired'
        } as ApiResponse<T>;
      }

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error: any) {
      console.error('API request failed:', error);
      
      // Provide user-friendly error messages based on error type
      if (error.name === 'TypeError' && (error.message.includes('Failed to fetch') || error.message.includes('Network request failed'))) {
        // Network connectivity issues
        if (!navigator.onLine) {
          throw new Error('No internet connection. Please check your network and try again.');
        } else {
          throw new Error('Unable to reach server. Please check if the backend service is running.');
        }
      } else if (error.name === 'SyntaxError' && error.message.includes('Unexpected token')) {
        throw new Error('Server returned invalid response. Please contact support.');
      } else if (error.name === 'AbortError' || error.message.includes('timeout')) {
        throw new Error('Request timed out. Please check your connection and try again.');
      } else if (error.message.includes('404')) {
        throw new Error('Service not found. Please contact support.');
      } else if (error.message.includes('500')) {
        throw new Error('Server error. Please try again later.');
      } else if (error.message.includes('401')) {
        throw new Error('Authentication failed. Please log in again.');
      } else if (error.message.includes('403')) {
        throw new Error('Access denied. You don\'t have permission to perform this action.');
      }
      
      throw error;
    }
  }

  // Authentication endpoints
  async signup(signupData: SignupData): Promise<ApiResponse<{ user_id: string; user_type: string; email_sent: boolean }>> {
    // Signup endpoint should not include authorization header
    return this.request('/auth/web/signup/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(signupData),
    });
  }

  async login(loginData: LoginData): Promise<ApiResponse<{ access_token: string; refresh_token: string; user: User }>> {
    // Login endpoint should not include authorization header
    return this.request('/auth/web/login/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData),
    });
  }

  async activateAccount(token: string, email: string): Promise<ApiResponse<{ user_type: string }>> {
    // Activation endpoint should not include authorization header
    return this.request('/auth/web/activate/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, email }),
    });
  }

  async resendActivation(email: string): Promise<ApiResponse> {
    // Resend activation endpoint should not include authorization header
    return this.request('/auth/web/resend-activation/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
  }

  async getUserProfile(): Promise<ApiResponse<{ user: User }>> {
    return this.request('/auth/web/profile/', {
      method: 'GET',
    });
  }

  async changePassword(passwordData: { currentPassword: string; newPassword: string }): Promise<ApiResponse> {
    return this.request('/auth/web/change-password/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        old_password: passwordData.currentPassword,
        new_password: passwordData.newPassword
      }),
    });
  }

  async logout(): Promise<void> {
    // Clear tokens from local storage
    this.clearAuthTokens();
    
    // Optional: Call backend logout endpoint if it exists
    // try {
    //   await this.request('/auth/web/logout/', { method: 'POST' });
    // } catch (error) {
    //   // Ignore logout endpoint errors - clearing tokens is sufficient
    // }
  }

  // Auth helpers
  setAuthTokens(accessToken: string, refreshToken: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
    }
  }

  clearAuthTokens(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }
  }

  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('access_token');
  }

  // Company info endpoints
  async getAgencyProfile(): Promise<ApiResponse<{ agency: any }>> {
    return this.request('/agencies/profile/', {
      method: 'GET',
    });
  }

  async updateCompanyInfo(companyData: {
    name: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    registration_number?: string;
    email?: string;
    website?: string;
    description?: string;
    agency_type?: string;
    contact_person?: string;
  }): Promise<ApiResponse<{ agency: any; is_profile_complete: boolean }>> {
    return this.request('/agencies/profile/update/', {
      method: 'PUT',
      body: JSON.stringify(companyData),
    });
  }

  async checkProfileCompletion(): Promise<ApiResponse<{ is_complete: boolean; missing_fields: string[] }>> {
    return this.request('/agencies/profile/check-completion/', {
      method: 'GET',
    });
  }

  // Campaign endpoints
  async getCampaigns(): Promise<ApiResponse<{ campaigns: any[] }>> {
    return this.request('/campaigns/', {
      method: 'GET',
    });
  }

  async createCampaign(campaignData: any): Promise<ApiResponse<{ campaign_id: string }>> {
    return this.request('/campaigns/', {
      method: 'POST',
      body: JSON.stringify(campaignData),
    });
  }

  async createCampaignWithFiles(formData: FormData): Promise<ApiResponse<{ campaign_id: string }>> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    // Don't set Content-Type for FormData - browser will set it with boundary
    
    try {
      const url = `${API_BASE_URL}/campaigns/`;
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });
      
      // Check if the response is actually JSON
      const contentType = response.headers.get('content-type');
      let data: any;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        // Not JSON - likely HTML error page
        const textContent = await response.text();
        data = {
          success: false,
          message: response.status === 404 
            ? 'Campaign creation endpoint not found. Please check your backend configuration.'
            : `Server returned non-JSON response (${response.status})`
        };
        console.warn('Non-JSON response received:', textContent.substring(0, 200));
      }
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }
      
      return data;
    } catch (error: any) {
      console.error('API file upload failed:', error);
      
      // Provide user-friendly error messages
      if (error.name === 'SyntaxError' && error.message.includes('Unexpected token')) {
        throw new Error('Server connection failed. Please check if the backend service is running.');
      } else if (error.message.includes('fetch')) {
        throw new Error('Network error. Please check your internet connection.');
      }
      
      throw error;
    }
  }

  async getCampaign(campaignId: string): Promise<ApiResponse<{ campaign: any }>> {
    return this.request(`/campaigns/${campaignId}/`, {
      method: 'GET',
    });
  }

  async updateCampaign(campaignId: string, campaignData: any): Promise<ApiResponse> {
    return this.request(`/campaigns/${campaignId}/`, {
      method: 'PUT',
      body: JSON.stringify(campaignData),
    });
  }

  async deleteCampaign(campaignId: string): Promise<ApiResponse> {
    return this.request(`/campaigns/${campaignId}/`, {
      method: 'DELETE',
    });
  }

  async launchCampaign(campaignId: string): Promise<ApiResponse> {
    return this.request(`/campaigns/${campaignId}/launch/`, {
      method: 'POST',
    });
  }

  // Agency clients
  async getAgencyClients(): Promise<ApiResponse<{ clients: any[] }>> {
    return this.request('/campaigns/clients/', {
      method: 'GET',
    });
  }

  // Dashboard endpoints
  async getDashboardData(): Promise<ApiResponse<{
    campaigns: any[];
    metrics: {
      active_campaigns: number;
      total_riders: number;
      total_budget: number;
      total_impressions: number;
    };
    user: User;
  }>> {
    return this.request('/dashboard/', {
      method: 'GET',
    });
  }

  // Client onboarding endpoints
  async getPublicAgencies(): Promise<ApiResponse<{ agencies: any[] }>> {
    // Public endpoint - no auth required
    return this.request('/agencies/public/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async submitJoinRequest(requestData: {
    agency_id: string;
    company_name: string;
    industry: string;
    expected_budget?: number;
    message?: string;
    invite_code?: string;
  }): Promise<ApiResponse<{ request_id: string; status: string }>> {
    return this.request('/agencies/join-requests/', {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
  }

  async getClientJoinStatus(): Promise<ApiResponse<{ 
    join_requests: any[];
    approved_agencies: any[];
  }>> {
    return this.request('/agencies/join-status/', {
      method: 'GET',
    });
  }

  // Agency-side endpoints for managing client requests and invite codes
  async getAgencyJoinRequests(): Promise<ApiResponse<{ join_requests: any[] }>> {
    return this.request('/agencies/join-requests/pending/', {
      method: 'GET',
    });
  }

  async respondToJoinRequest(requestId: string, action: 'approve' | 'reject', responseMessage?: string): Promise<ApiResponse> {
    return this.request(`/agencies/join-requests/${requestId}/respond/`, {
      method: 'POST',
      body: JSON.stringify({ action, response_message: responseMessage }),
    });
  }

  async createInviteCode(codeData: {
    name: string;
    max_uses?: number;
    expires_hours?: number;
  }): Promise<ApiResponse<{ invite_code: any }>> {
    return this.request('/agencies/invite-codes/create/', {
      method: 'POST',
      body: JSON.stringify(codeData),
    });
  }

  async getAgencyInviteCodes(): Promise<ApiResponse<{ invite_codes: any[] }>> {
    return this.request('/agencies/invite-codes/', {
      method: 'GET',
    });
  }

  async validateInviteCode(inviteCode: string): Promise<ApiResponse<{ 
    valid: boolean; 
    agency?: any; 
    invite_code?: any; 
  }>> {
    // Public endpoint - no auth required
    return this.request('/agencies/invite-codes/validate/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code: inviteCode }),
    });
  }

  // Wallet endpoints - wallet balance is available through agency profile
  // Use getAgencyProfile() to get current_balance instead

  // Analytics/Metrics endpoints
  async getAgencyMetrics(): Promise<ApiResponse<{ metrics: any }>> {
    return this.request('/analytics/metrics/', {
      method: 'GET',
    });
  }

  async getDashboardMetrics(): Promise<ApiResponse<{ campaigns: any[]; metrics: any; user: any }>> {
    return this.request('/dashboard/', {
      method: 'GET',
    });
  }
}

export const apiService = new ApiService();
export type { ApiResponse, SignupData, LoginData, User };