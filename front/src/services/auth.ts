// 用户认证服务
export interface User {
  id: string;
  email: string;
  username: string;
  avatar?: string;
  createdAt: string;
  subscription?: 'free' | 'pro' | 'enterprise';
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

class AuthService {
  private baseURL: string;
  private tokenKey = 'auth_token';
  private refreshTokenKey = 'refresh_token';
  private userKey = 'user_data';

  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
  }

  // 获取存储的token
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  // 获取存储的用户信息
  getCurrentUser(): User | null {
    const userData = localStorage.getItem(this.userKey);
    if (userData) {
      try {
        return JSON.parse(userData);
      } catch {
        return null;
      }
    }
    return null;
  }

  // 检查是否已登录
  isAuthenticated(): boolean {
    return !!this.getToken() && !!this.getCurrentUser();
  }

  // 设置认证信息
  private setAuthData(authResponse: AuthResponse) {
    localStorage.setItem(this.tokenKey, authResponse.token);
    localStorage.setItem(this.refreshTokenKey, authResponse.refreshToken);
    localStorage.setItem(this.userKey, JSON.stringify(authResponse.user));
  }

  // 清除认证信息
  private clearAuthData() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem(this.userKey);
  }

  // 带认证的请求
  private async authenticatedRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken();
    
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });

    if (response.status === 401) {
      // Token过期，尝试刷新
      const refreshed = await this.refreshToken();
      if (refreshed) {
        // 重试请求
        return this.authenticatedRequest(endpoint, options);
      } else {
        // 刷新失败，清除认证信息
        this.clearAuthData();
        throw new Error('Authentication expired');
      }
    }

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(errorData || 'Request failed');
    }

    return response.json();
  }

  // 用户注册
  async register(data: RegisterData): Promise<AuthResponse> {
    if (data.password !== data.confirmPassword) {
      throw new Error('密码确认不匹配');
    }

    try {
      const response = await fetch(`${this.baseURL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          username: data.username,
          password: data.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || '注册失败');
      }

      const authResponse: AuthResponse = await response.json();
      this.setAuthData(authResponse);
      return authResponse;
    } catch (error) {
      // 模拟注册成功（开发环境）
      if (process.env.NODE_ENV === 'development') {
        const mockResponse: AuthResponse = {
          user: {
            id: Date.now().toString(),
            email: data.email,
            username: data.username,
            createdAt: new Date().toISOString(),
            subscription: 'free'
          },
          token: 'mock_token_' + Date.now(),
          refreshToken: 'mock_refresh_token_' + Date.now()
        };
        this.setAuthData(mockResponse);
        return mockResponse;
      }
      throw error;
    }
  }

  // 用户登录
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseURL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || '登录失败');
      }

      const authResponse: AuthResponse = await response.json();
      this.setAuthData(authResponse);
      return authResponse;
    } catch (error) {
      // 模拟登录成功（开发环境）
      if (process.env.NODE_ENV === 'development') {
        const mockResponse: AuthResponse = {
          user: {
            id: '1',
            email: credentials.email,
            username: credentials.email.split('@')[0],
            createdAt: new Date().toISOString(),
            subscription: 'free'
          },
          token: 'mock_token_' + Date.now(),
          refreshToken: 'mock_refresh_token_' + Date.now()
        };
        this.setAuthData(mockResponse);
        return mockResponse;
      }
      throw error;
    }
  }

  // 用户登出
  async logout(): Promise<void> {
    try {
      await this.authenticatedRequest('/api/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearAuthData();
    }
  }

  // 刷新token
  async refreshToken(): Promise<boolean> {
    const refreshToken = localStorage.getItem(this.refreshTokenKey);
    if (!refreshToken) return false;

    try {
      const response = await fetch(`${this.baseURL}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) return false;

      const authResponse: AuthResponse = await response.json();
      this.setAuthData(authResponse);
      return true;
    } catch {
      return false;
    }
  }

  // 更新用户信息
  async updateProfile(updates: Partial<User>): Promise<User> {
    const updatedUser = await this.authenticatedRequest<User>('/api/user/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });

    localStorage.setItem(this.userKey, JSON.stringify(updatedUser));
    return updatedUser;
  }

  // 修改密码
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await this.authenticatedRequest('/api/user/password', {
      method: 'PUT',
      body: JSON.stringify({
        currentPassword,
        newPassword,
      }),
    });
  }
}

export const authService = new AuthService();
