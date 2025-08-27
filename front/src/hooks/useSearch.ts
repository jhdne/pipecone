import { useState, useEffect, useCallback, useMemo } from 'react';
import { apiService, TokenResult, SearchFilters } from '../services/api';
import { useErrorHandler } from '../components/ErrorBoundary';

// 缓存管理
class SearchCache {
  private cache = new Map<string, { data: TokenResult[]; timestamp: number; ttl: number }>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5分钟

  set(key: string, data: TokenResult[], ttl: number = this.DEFAULT_TTL) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get(key: string): TokenResult[] | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  clear() {
    this.cache.clear();
  }

  private generateKey(query: string, filters?: SearchFilters): string {
    return `${query}_${JSON.stringify(filters || {})}`;
  }

  getCachedSearch(query: string, filters?: SearchFilters): TokenResult[] | null {
    return this.get(this.generateKey(query, filters));
  }

  setCachedSearch(query: string, data: TokenResult[], filters?: SearchFilters) {
    this.set(this.generateKey(query, filters), data);
  }
}

const searchCache = new SearchCache();

// 防抖Hook
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// 搜索Hook
export const useSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<TokenResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});
  const { handleError } = useErrorHandler();

  // 防抖搜索查询
  const debouncedQuery = useDebounce(query, 300);

  // 性能监控
  const trackSearchPerformance = useCallback((
    searchQuery: string, 
    resultCount: number, 
    duration: number,
    fromCache: boolean
  ) => {
    console.log('Search Performance:', {
      query: searchQuery,
      resultCount,
      duration,
      fromCache,
      timestamp: Date.now()
    });
  }, []);

  // 执行搜索
  const performSearch = useCallback(async (
    searchQuery: string, 
    searchFilters?: SearchFilters,
    skipCache: boolean = false
  ) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    const startTime = Date.now();
    setIsLoading(true);
    setHasSearched(true);

    try {
      // 检查缓存
      if (!skipCache) {
        const cachedResults = searchCache.getCachedSearch(searchQuery, searchFilters);
        if (cachedResults) {
          setResults(cachedResults);
          setIsLoading(false);
          trackSearchPerformance(searchQuery, cachedResults.length, Date.now() - startTime, true);
          return;
        }
      }

      // AI驱动的智能代币寻找
      const searchResults = await apiService.searchTokens(searchQuery, searchFilters);
      
      // 缓存结果
      searchCache.setCachedSearch(searchQuery, searchResults, searchFilters);
      
      setResults(searchResults);
      trackSearchPerformance(searchQuery, searchResults.length, Date.now() - startTime, false);
      
    } catch (error) {
      handleError(error, 'Search');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [handleError, trackSearchPerformance]);

  // 自动搜索（防抖后）
  useEffect(() => {
    if (debouncedQuery) {
      performSearch(debouncedQuery, filters);
    }
  }, [debouncedQuery, filters, performSearch]);

  // 手动搜索
  const search = useCallback((searchQuery: string, searchFilters?: SearchFilters) => {
    setQuery(searchQuery);
    setFilters(searchFilters || {});
    performSearch(searchQuery, searchFilters || {}, true); // 跳过缓存进行新搜索
  }, [performSearch]);

  // 清除搜索
  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
    setHasSearched(false);
    setIsLoading(false);
    setFilters({});
  }, []);

  // 刷新搜索
  const refreshSearch = useCallback(() => {
    if (query) {
      performSearch(query, filters, true);
    }
  }, [query, filters, performSearch]);

  // 清除缓存
  const clearCache = useCallback(() => {
    searchCache.clear();
  }, []);

  return {
    query,
    setQuery,
    results,
    isLoading,
    hasSearched,
    filters,
    setFilters,
    search,
    clearSearch,
    refreshSearch,
    clearCache
  };
};

// 搜索历史管理
export const useSearchHistory = () => {
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    const savedHistory = localStorage.getItem('search_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch {
        setHistory([]);
      }
    }
  }, []);

  const addToHistory = useCallback((query: string) => {
    if (!query.trim()) return;

    setHistory(prev => {
      const newHistory = [query, ...prev.filter(item => item !== query)].slice(0, 10);
      localStorage.setItem('search_history', JSON.stringify(newHistory));
      return newHistory;
    });
  }, []);

  const removeFromHistory = useCallback((query: string) => {
    setHistory(prev => {
      const newHistory = prev.filter(item => item !== query);
      localStorage.setItem('search_history', JSON.stringify(newHistory));
      return newHistory;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem('search_history');
  }, []);

  return {
    history,
    addToHistory,
    removeFromHistory,
    clearHistory
  };
};
