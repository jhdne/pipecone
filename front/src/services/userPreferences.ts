// 用户偏好设置服务
import { authService } from './auth';
import { TokenResult } from './api';

export interface FavoriteToken {
  id: string;
  symbol: string;
  name: string;
  logo: string;
  addedAt: string;
  notes?: string;
}

export interface SearchHistoryItem {
  id: string;
  query: string;
  timestamp: string;
  resultCount: number;
}

export interface ReportFolder {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  reports: SavedReport[];
}

export interface SavedReport {
  id: string;
  tokenId: string;
  tokenSymbol: string;
  tokenName: string;
  reportData: any;
  createdAt: string;
  folderId?: string;
  title?: string;
  notes?: string;
}

class UserPreferencesService {
  private baseURL: string;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
  }

  private async authenticatedRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = authService.getToken();
    
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Request failed: ${response.statusText}`);
    }

    return response.json();
  }

  // 收藏管理
  async getFavorites(): Promise<FavoriteToken[]> {
    try {
      return await this.authenticatedRequest<FavoriteToken[]>('/api/user/favorites');
    } catch (error) {
      // 降级到本地存储
      const localFavorites = localStorage.getItem('user_favorites');
      return localFavorites ? JSON.parse(localFavorites) : [];
    }
  }

  async addToFavorites(token: TokenResult, notes?: string): Promise<void> {
    const favorite: FavoriteToken = {
      id: token.id,
      symbol: token.symbol,
      name: token.name,
      logo: token.logo,
      addedAt: new Date().toISOString(),
      notes
    };

    try {
      await this.authenticatedRequest('/api/user/favorites', {
        method: 'POST',
        body: JSON.stringify(favorite),
      });
    } catch (error) {
      // 降级到本地存储
      const favorites = await this.getFavorites();
      const updatedFavorites = [favorite, ...favorites.filter(f => f.id !== token.id)];
      localStorage.setItem('user_favorites', JSON.stringify(updatedFavorites));
    }
  }

  async removeFromFavorites(tokenId: string): Promise<void> {
    try {
      await this.authenticatedRequest(`/api/user/favorites/${tokenId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      // 降级到本地存储
      const favorites = await this.getFavorites();
      const updatedFavorites = favorites.filter(f => f.id !== tokenId);
      localStorage.setItem('user_favorites', JSON.stringify(updatedFavorites));
    }
  }

  async isFavorite(tokenId: string): Promise<boolean> {
    const favorites = await this.getFavorites();
    return favorites.some(f => f.id === tokenId);
  }

  // 搜索历史管理
  async getSearchHistory(): Promise<SearchHistoryItem[]> {
    try {
      return await this.authenticatedRequest<SearchHistoryItem[]>('/api/user/search-history');
    } catch (error) {
      // 降级到本地存储
      const localHistory = localStorage.getItem('search_history');
      return localHistory ? JSON.parse(localHistory) : [];
    }
  }

  async addToSearchHistory(query: string, resultCount: number): Promise<void> {
    const historyItem: SearchHistoryItem = {
      id: Date.now().toString(),
      query,
      timestamp: new Date().toISOString(),
      resultCount
    };

    try {
      await this.authenticatedRequest('/api/user/search-history', {
        method: 'POST',
        body: JSON.stringify(historyItem),
      });
    } catch (error) {
      // 降级到本地存储
      const history = await this.getSearchHistory();
      const updatedHistory = [historyItem, ...history.filter(h => h.query !== query)].slice(0, 20);
      localStorage.setItem('search_history', JSON.stringify(updatedHistory));
    }
  }

  async clearSearchHistory(): Promise<void> {
    try {
      await this.authenticatedRequest('/api/user/search-history', {
        method: 'DELETE',
      });
    } catch (error) {
      // 降级到本地存储
      localStorage.removeItem('search_history');
    }
  }

  // 报告夹管理
  async getReportFolders(): Promise<ReportFolder[]> {
    try {
      return await this.authenticatedRequest<ReportFolder[]>('/api/user/report-folders');
    } catch (error) {
      // 降级到本地存储
      const localFolders = localStorage.getItem('report_folders');
      return localFolders ? JSON.parse(localFolders) : [
        {
          id: 'default',
          name: '默认文件夹',
          description: '默认保存位置',
          createdAt: new Date().toISOString(),
          reports: []
        }
      ];
    }
  }

  async createReportFolder(name: string, description?: string): Promise<ReportFolder> {
    const folder: ReportFolder = {
      id: Date.now().toString(),
      name,
      description,
      createdAt: new Date().toISOString(),
      reports: []
    };

    try {
      return await this.authenticatedRequest<ReportFolder>('/api/user/report-folders', {
        method: 'POST',
        body: JSON.stringify(folder),
      });
    } catch (error) {
      // 降级到本地存储
      const folders = await this.getReportFolders();
      const updatedFolders = [...folders, folder];
      localStorage.setItem('report_folders', JSON.stringify(updatedFolders));
      return folder;
    }
  }

  async deleteReportFolder(folderId: string): Promise<void> {
    if (folderId === 'default') {
      throw new Error('无法删除默认文件夹');
    }

    try {
      await this.authenticatedRequest(`/api/user/report-folders/${folderId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      // 降级到本地存储
      const folders = await this.getReportFolders();
      const updatedFolders = folders.filter(f => f.id !== folderId);
      localStorage.setItem('report_folders', JSON.stringify(updatedFolders));
    }
  }

  async saveReport(
    tokenId: string,
    tokenSymbol: string,
    tokenName: string,
    reportData: any,
    folderId: string = 'default',
    title?: string,
    notes?: string
  ): Promise<SavedReport> {
    const report: SavedReport = {
      id: Date.now().toString(),
      tokenId,
      tokenSymbol,
      tokenName,
      reportData,
      createdAt: new Date().toISOString(),
      folderId,
      title: title || `${tokenSymbol} 研究报告`,
      notes
    };

    try {
      return await this.authenticatedRequest<SavedReport>('/api/user/reports', {
        method: 'POST',
        body: JSON.stringify(report),
      });
    } catch (error) {
      // 降级到本地存储
      const folders = await this.getReportFolders();
      const updatedFolders = folders.map(folder => {
        if (folder.id === folderId) {
          return {
            ...folder,
            reports: [report, ...folder.reports]
          };
        }
        return folder;
      });
      localStorage.setItem('report_folders', JSON.stringify(updatedFolders));
      return report;
    }
  }

  async deleteReport(reportId: string): Promise<void> {
    try {
      await this.authenticatedRequest(`/api/user/reports/${reportId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      // 降级到本地存储
      const folders = await this.getReportFolders();
      const updatedFolders = folders.map(folder => ({
        ...folder,
        reports: folder.reports.filter(r => r.id !== reportId)
      }));
      localStorage.setItem('report_folders', JSON.stringify(updatedFolders));
    }
  }

  async getSavedReports(folderId?: string): Promise<SavedReport[]> {
    const folders = await this.getReportFolders();
    if (folderId) {
      const folder = folders.find(f => f.id === folderId);
      return folder ? folder.reports : [];
    }
    
    // 返回所有报告
    return folders.flatMap(folder => folder.reports);
  }
}

export const userPreferencesService = new UserPreferencesService();
