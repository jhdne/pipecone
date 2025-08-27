// Gemini AI 服务
import { TokenResult } from './api';

export interface GeminiResponse {
  content: string;
  tokens: number;
}

export interface TokenAnalysisRequest {
  userQuery: string;
  tokenData: TokenResult[];
}

export interface ReportGenerationRequest {
  token: TokenResult;
  marketData?: any;
  additionalContext?: string;
}

class GeminiService {
  private apiKey: string;
  private baseURL = 'https://generativelanguage.googleapis.com/v1beta';

  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
  }

  private async makeRequest(endpoint: string, payload: any): Promise<GeminiResponse> {
    if (!this.apiKey) {
      throw new Error('Gemini API key not configured');
    }

    try {
      const response = await fetch(`${this.baseURL}/${endpoint}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        return {
          content: data.candidates[0].content.parts[0].text,
          tokens: data.usageMetadata?.totalTokenCount || 0
        };
      }

      throw new Error('Invalid response format from Gemini API');
    } catch (error) {
      console.error('Gemini API request failed:', error);
      throw error;
    }
  }

  // AI提炼用户需求，生成搜索关键词
  async extractSearchKeywords(userQuery: string): Promise<string[]> {
    const prompt = `
作为一个专业的加密货币分析师，请分析用户的代币寻找需求，提炼出关键的搜索词汇。

用户需求：${userQuery}

请从以下维度分析并提取关键词：
1. 技术特性（如：DeFi、NFT、Layer2、跨链等）
2. 应用场景（如：支付、游戏、元宇宙、存储等）
3. 市场特征（如：低市值、高增长、稳定等）
4. 生态系统（如：以太坊、BSC、Polygon等）
5. 项目属性（如：新项目、成熟项目、创新技术等）

请只返回最相关的5-8个关键词，用逗号分隔，不要解释。

示例格式：DeFi,低市值,以太坊,流动性挖矿,创新
`;

    try {
      const response = await this.makeRequest('models/gemini-pro:generateContent', {
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 100,
        }
      });

      const keywords = response.content
        .trim()
        .split(',')
        .map(keyword => keyword.trim())
        .filter(keyword => keyword.length > 0);

      return keywords;
    } catch (error) {
      console.error('Failed to extract keywords:', error);
      // 降级方案：简单的关键词提取
      return this.fallbackKeywordExtraction(userQuery);
    }
  }

  // 智能代币匹配和推荐
  async analyzeAndRankTokens(userQuery: string, tokens: TokenResult[]): Promise<TokenResult[]> {
    if (tokens.length === 0) return [];

    const tokenSummaries = tokens.map(token => ({
      id: token.id,
      symbol: token.symbol,
      name: token.name,
      description: token.description?.substring(0, 200) || '',
      category: token.category || '',
      tags: token.tags || []
    }));

    const prompt = `
作为专业的加密货币分析师，请根据用户需求对以下代币进行智能匹配和排序。

用户需求：${userQuery}

代币列表：
${tokenSummaries.map((token, index) => 
  `${index + 1}. ${token.symbol} (${token.name}): ${token.description}`
).join('\n')}

请按照与用户需求的匹配度对代币进行排序，考虑以下因素：
1. 功能匹配度
2. 应用场景相关性
3. 技术特征符合度
4. 市场定位契合度
5. 发展潜力

请只返回排序后的代币ID列表，用逗号分隔，从最匹配到最不匹配。

示例格式：2,5,1,3,4
`;

    try {
      const response = await this.makeRequest('models/gemini-pro:generateContent', {
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 100,
        }
      });

      const rankedIds = response.content
        .trim()
        .split(',')
        .map(id => id.trim())
        .filter(id => id.length > 0);

      // 根据AI排序重新排列代币
      const rankedTokens: TokenResult[] = [];
      const tokenMap = new Map(tokens.map(token => [token.id, token]));

      rankedIds.forEach(id => {
        const token = tokenMap.get(id);
        if (token) {
          rankedTokens.push(token);
          tokenMap.delete(id);
        }
      });

      // 添加未排序的代币到末尾
      rankedTokens.push(...Array.from(tokenMap.values()));

      return rankedTokens;
    } catch (error) {
      console.error('Failed to analyze tokens:', error);
      return tokens; // 降级方案：返回原始顺序
    }
  }

  // 生成深度研究报告
  async generateDeepReport(request: ReportGenerationRequest): Promise<any> {
    const { token } = request;
    
    const enhancedPrompt = `
作为顶级加密货币研究分析师，请为以下代币生成一份专业的深度研究报告。

代币信息：
- 名称：${token.name} (${token.symbol})
- 描述：${token.description || '暂无描述'}
- 合约地址：${token.contractAddress || '暂无'}
- 官网：${token.website || '暂无'}
- 白皮书：${token.whitepaperUrl || '暂无'}
- Twitter：${token.twitterUrl || '暂无'}
- 流通供应量：${token.circulatingSupply || '暂无'}
- 总供应量：${token.totalSupply || '暂无'}
- 市值：${token.marketCap || '暂无'}
- 24h交易量：${token.volume24h || '暂无'}
- 24h涨跌幅：${token.priceChange24h || '暂无'}%

请按照以下固定模板生成报告，如果没有搜索到相关信息，相关模板可省略：

## 项目概述
[项目大概情况、产品和业务、创始人和团队背景]

## 技术分析
[项目使用的技术、有没有创新、技术优势和潜在风险]

## 代币经济分析
[代币功能、启动和分配是否公平、代币价值捕获水平等]

## 社区分析
[社区规模、质量、项目宣传方式、增长潜力等]

## 生态分析
[项目所属生态介绍及其发展潜力]

## 风险分析
[技术风险、市场风险、监管风险、竞争风险等]

## 投资价值分析
[综合评分(1-10分)、投资建议(买入/持有/观望/卖出)、目标价位、投资时间框架]

## 总结
[项目整体评价和关键要点总结]

请确保分析客观、数据准确、建议合理。如果某个方面缺乏信息，可以省略该部分或简要说明信息不足。
`;

    try {
      const response = await this.makeRequest('models/gemini-pro:generateContent', {
        contents: [{
          parts: [{ text: enhancedPrompt }]
        }],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 2048,
        }
      });

      // 解析报告内容
      const reportContent = response.content;
      
      return {
        tokenId: token.id,
        tokenSymbol: token.symbol,
        tokenName: token.name,
        generatedAt: new Date().toISOString(),
        content: reportContent,
        tokensUsed: response.tokens,
        sections: this.parseReportSections(reportContent)
      };
    } catch (error) {
      console.error('Failed to generate report:', error);
      // 降级方案：返回基础报告模板
      return this.generateFallbackReport(token);
    }
  }

  // 解析报告章节
  private parseReportSections(content: string): Record<string, string> {
    const sections: Record<string, string> = {};
    const sectionRegex = /## (.+?)\n([\s\S]*?)(?=\n## |$)/g;
    let match;

    while ((match = sectionRegex.exec(content)) !== null) {
      const title = match[1].trim();
      const content = match[2].trim();
      sections[title] = content;
    }

    return sections;
  }

  // 降级方案：关键词提取
  private fallbackKeywordExtraction(userQuery: string): string[] {
    const commonKeywords = [
      'DeFi', 'NFT', 'GameFi', 'Layer2', '跨链', '稳定币',
      '低市值', '高增长', '创新', '生态', '挖矿', '质押'
    ];

    const query = userQuery.toLowerCase();
    return commonKeywords.filter(keyword => 
      query.includes(keyword.toLowerCase()) || 
      query.includes(keyword)
    ).slice(0, 5);
  }

  // 降级方案：基础报告
  private generateFallbackReport(token: TokenResult): any {
    return {
      tokenId: token.id,
      tokenSymbol: token.symbol,
      tokenName: token.name,
      generatedAt: new Date().toISOString(),
      content: `# ${token.name} (${token.symbol}) 基础分析报告\n\n## 项目概述\n${token.description || '暂无详细描述'}\n\n## 基本信息\n- 合约地址：${token.contractAddress || '暂无'}\n- 官网：${token.website || '暂无'}\n- 流通供应量：${token.circulatingSupply || '暂无'}\n\n*注：详细分析报告生成失败，这是基础信息展示。*`,
      tokensUsed: 0,
      sections: {
        '项目概述': token.description || '暂无详细描述',
        '基本信息': `合约地址：${token.contractAddress || '暂无'}\n官网：${token.website || '暂无'}`
      }
    };
  }
}

export const geminiService = new GeminiService();
