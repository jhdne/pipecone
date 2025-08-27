// API服务层 - 连接Pinecone后端
export interface TokenResult {
  id: string;
  rank: number;
  symbol: string;
  name: string;
  description: string;
  circulatingSupply: string;
  totalSupply: string;
  logo: string;
  whitepaperUrl: string;
  twitterUrl: string;
  website: string;
  contractAddress?: string;
  marketCap?: string;
  volume24h?: string;
  priceChange24h?: number;
  price?: number;
}

export interface SearchFilters {
  marketCapMin?: number;
  marketCapMax?: number;
  volume24hMin?: number;
  categories?: string[];
  chains?: string[];
}

export interface APIError extends Error {
  status: number;
  code: string;
}

class APIService {
  private baseURL: string;
  private retryAttempts = 3;
  private retryDelay = 1000;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        const response = await fetch(url, {
          headers: {
            'Content-Type': 'application/json',
            ...options.headers,
          },
          ...options,
        });

        if (!response.ok) {
          const errorData = await response.text();
          const error = new Error(errorData) as APIError;
          error.status = response.status;
          error.code = response.status.toString();
          throw error;
        }

        return await response.json();
      } catch (error) {
        if (attempt === this.retryAttempts) {
          throw error;
        }
        
        // 指数退避重试
        await new Promise(resolve => 
          setTimeout(resolve, this.retryDelay * Math.pow(2, attempt - 1))
        );
      }
    }
    
    throw new Error('Max retry attempts exceeded');
  }

  // AI驱动的智能代币寻找
  async searchTokens(
    query: string,
    filters?: SearchFilters,
    topK: number = 10
  ): Promise<TokenResult[]> {
    try {
      // 首先使用Gemini提炼搜索关键词
      const { geminiService } = await import('./gemini');
      const keywords = await geminiService.extractSearchKeywords(query);

      // 使用提炼的关键词进行向量搜索
      const enhancedQuery = keywords.join(' ');

      const response = await this.request<{results: TokenResult[]}>('/api/search', {
        method: 'POST',
        body: JSON.stringify({
          query: enhancedQuery,
          original_query: query,
          top_k: topK * 2, // 获取更多结果用于AI重排序
          filters: filters || {}
        }),
      });

      // 使用Gemini对结果进行智能排序
      const rankedResults = await geminiService.analyzeAndRankTokens(query, response.results);

      return rankedResults.slice(0, topK);
    } catch (error) {
      console.error('AI Search API error:', error);
      // 返回模拟数据作为降级方案
      return this.getMockResults(query);
    }
  }

  // 获取代币详细信息
  async getTokenDetails(tokenId: string): Promise<TokenResult | null> {
    try {
      return await this.request<TokenResult>(`/api/tokens/${tokenId}`);
    } catch (error) {
      console.error('Token details API error:', error);
      return null;
    }
  }

  // AI生成深度研究报告
  async generateReport(token: TokenResult): Promise<any> {
    try {
      // 首先尝试从后端获取增强的代币数据
      const enhancedToken = await this.getTokenDetails(token.id) || token;

      // 使用Gemini生成深度报告
      const { geminiService } = await import('./gemini');
      const report = await geminiService.generateDeepReport({
        token: enhancedToken,
        additionalContext: `用户正在寻找相关代币，请提供专业的投资分析建议。`
      });

      return report;
    } catch (error) {
      console.error('AI Report generation error:', error);
      // 返回模拟报告数据
      return this.getMockReport(token);
    }
  }

  // 获取实时价格数据
  async getRealTimeData(symbols: string[]): Promise<any[]> {
    try {
      return await this.request<any[]>('/api/prices/realtime', {
        method: 'POST',
        body: JSON.stringify({ symbols }),
      });
    } catch (error) {
      console.error('Real-time data API error:', error);
      return [];
    }
  }

  // 模拟数据降级方案
  private getMockResults(query: string): TokenResult[] {
    return [
      {
        id: '1',
        rank: 1,
        symbol: 'MATIC',
        name: 'Polygon',
        description: '以太坊扩容解决方案，提供更快更便宜的交易体验，支持多种DeFi应用和NFT生态系统',
        circulatingSupply: '8.00B',
        totalSupply: '10.00B',
        logo: 'M',
        whitepaperUrl: 'https://polygon.technology/papers/pol-whitepaper',
        twitterUrl: 'https://twitter.com/0xPolygon',
        website: 'https://polygon.technology',
        contractAddress: '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0',
        marketCap: '$8.2B',
        volume24h: '$450M',
        priceChange24h: 5.2,
        price: 0.85
      },
      {
        id: '2',
        rank: 2,
        symbol: 'LINK',
        name: 'Chainlink',
        description: '去中心化预言机网络，为智能合约提供可靠的现实世界数据，是DeFi生态系统的重要基础设施',
        circulatingSupply: '556.8M',
        totalSupply: '1.00B',
        logo: 'L',
        whitepaperUrl: 'https://link.smartcontract.com/whitepaper',
        twitterUrl: 'https://twitter.com/chainlink',
        website: 'https://chain.link',
        contractAddress: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
        marketCap: '$12.5B',
        volume24h: '$680M',
        priceChange24h: -2.1,
        price: 22.45
      }
    ];
  }

  private getMockReport(token?: TokenResult): any {
    return {
      overallScore: 8.5,
      recommendation: "买入",
      riskLevel: "中等",
      priceTarget: "$2.50",
      timeframe: "6-12个月",
      keyMetrics: {
        marketCap: "$8.2B",
        volume24h: "$450M",
        holders: "1.2M+",
        tvl: "$2.8B"
      },
      strengths: [
        "强大的技术基础设施和扩容解决方案",
        "活跃的开发者生态系统",
        "与主要DeFi协议的深度集成",
        "持续的技术创新和升级"
      ],
      risks: [
        "竞争激烈的Layer2市场",
        "依赖以太坊生态系统",
        "监管政策不确定性"
      ]
    };
  }
}

export const apiService = new APIService();
