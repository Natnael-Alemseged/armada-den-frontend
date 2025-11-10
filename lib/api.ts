import {
  AuthResponse,
  User,
  GmailConnectionResponse,
  GmailStatusResponse,
  ReadEmailsResponse,
  SendEmailRequest,
  SendEmailResponse,
  WebSearchRequest,
  WebSearchResponse,
  SearchHistoryResponse,
  SearchConnectionResponse,
  SearchStatusResponse,
  APIError,
} from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002/api';

class ArmadaDenAPI {
  private accessToken: string | null = null;

  setAccessToken(token: string) {
    this.accessToken = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', token);
    }
  }

  getAccessToken(): string | null {
    if (!this.accessToken && typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('access_token');
    }
    return this.accessToken;
  }

  clearAccessToken() {
    this.accessToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };

    // Add Content-Type for JSON requests
    if (options.body && typeof options.body === 'string') {
      headers['Content-Type'] = 'application/json';
    }

    const token = this.getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const error: APIError = await response.json().catch(() => ({
          detail: 'An error occurred',
        }));
        throw new Error(error.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred');
    }
  }

  // Auth methods
  async register(email: string, password: string): Promise<User> {
    return this.request<User>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
        is_active: true,
        is_superuser: false,
        is_verified: false,
      }),
    });
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const response = await fetch(`${API_BASE_URL}/auth/jwt/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    if (!response.ok) {
      const error: APIError = await response.json().catch(() => ({
        detail: 'Login failed',
      }));
      throw new Error(error.detail);
    }

    const data: AuthResponse = await response.json();
    this.setAccessToken(data.access_token);
    return data;
  }

  async getCurrentUser(): Promise<User> {
    return this.request<User>('/users/me');
  }

  async logout() {
    this.clearAccessToken();
  }

  // Gmail methods
  async connectGmail(redirectUrl: string): Promise<GmailConnectionResponse> {
    return this.request<GmailConnectionResponse>('/gmail/connect', {
      method: 'POST',
      body: JSON.stringify({ redirect_url: redirectUrl }),
    });
  }

  async handleGmailCallback(code: string, state: string): Promise<{ status: string; message: string }> {
    return this.request(`/gmail/callback?code=${code}&state=${state}`);
  }

  async getGmailStatus(): Promise<GmailStatusResponse> {
    return this.request<GmailStatusResponse>('/gmail/status');
  }

  async readEmails(maxResults: number = 10, query: string = ''): Promise<ReadEmailsResponse> {
    return this.request<ReadEmailsResponse>('/gmail/read', {
      method: 'POST',
      body: JSON.stringify({ max_results: maxResults, query }),
    });
  }

  async sendEmail(emailData: SendEmailRequest): Promise<SendEmailResponse> {
    return this.request<SendEmailResponse>('/gmail/send', {
      method: 'POST',
      body: JSON.stringify(emailData),
    });
  }

  async createDraft(emailData: SendEmailRequest): Promise<SendEmailResponse> {
    return this.request<SendEmailResponse>('/gmail/draft', {
      method: 'POST',
      body: JSON.stringify(emailData),
    });
  }

  async getGmailTools(): Promise<{ status: string; tools: Array<{ name: string; description: string }>; count: number }> {
    return this.request('/gmail/tools');
  }

  // Search methods
  async connectSearch(redirectUrl: string): Promise<SearchConnectionResponse> {
    return this.request<SearchConnectionResponse>('/search/connect', {
      method: 'POST',
      body: JSON.stringify({ redirect_url: redirectUrl }),
    });
  }

  async handleSearchCallback(code: string, state: string): Promise<{ status: string; message: string }> {
    return this.request(`/search/callback?code=${code}&state=${state}`);
  }

  async getSearchStatus(): Promise<SearchStatusResponse> {
    return this.request<SearchStatusResponse>('/search/status');
  }

  async performSearch(searchData: WebSearchRequest): Promise<WebSearchResponse> {
    return this.request<WebSearchResponse>('/search/query', {
      method: 'POST',
      body: JSON.stringify({
        query: searchData.query,
        num_results: searchData.num_results || 10,
        engine: searchData.engine || 'SERPAPI',
        save_to_db: searchData.save_to_db !== false,
      }),
    });
  }

  async getSearchHistory(page: number = 1, pageSize: number = 20): Promise<SearchHistoryResponse> {
    return this.request<SearchHistoryResponse>(`/search/history?page=${page}&page_size=${pageSize}`);
  }

  async getSearchDetails(searchId: string): Promise<{
    id: string;
    query: string;
    engine: string;
    created_at: string;
    raw_results: Record<string, unknown>;
    summary: string | null;
  }> {
    return this.request(`/search/history/${searchId}`);
  }

  async getSearchTools(): Promise<{ status: string; tools: Array<{ name: string; description: string }>; count: number }> {
    return this.request('/search/tools');
  }
}

export const api = new ArmadaDenAPI();