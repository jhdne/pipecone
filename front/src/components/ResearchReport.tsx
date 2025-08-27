import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { TrendingUp, AlertTriangle, CheckCircle, X, BarChart3, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { apiService, TokenResult } from '../services/api';

interface ResearchReportProps {
  token: TokenResult | null;
  onClose: () => void;
}

export function ResearchReport({ token, onClose }: ResearchReportProps) {
  const [reportData, setReportData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      generateReport();
    }
  }, [token]);

  const generateReport = async () => {
    if (!token) return;

    setIsLoading(true);
    setError(null);

    try {
      const report = await apiService.generateReport(token);
      setReportData(report);
    } catch (err: any) {
      setError(err.message || '报告生成失败');
      // 使用模拟数据作为降级方案
      setReportData(getMockReportData());
    } finally {
      setIsLoading(false);
    }
  };

  const getMockReportData = () => ({
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
      "竞争激烈的Layer 2市场",
      "依赖以太坊主网的安全性",
      "监管政策的不确定性"
    ],
    technicalAnalysis: {
      support: "$0.85",
      resistance: "$1.25",
      trend: "看涨",
      rsi: 62
    }
  });

  if (!token) return null;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-sm border-2 border-gray-200/50">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            <p className="text-lg font-medium text-gray-700">AI正在生成深度研究报告...</p>
            <p className="text-sm text-gray-500">这可能需要几秒钟时间</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <AlertTriangle className="w-8 h-8 text-red-500" />
            <p className="text-lg font-medium text-red-600">报告生成失败</p>
            <p className="text-sm text-gray-500">{error}</p>
            <Button onClick={generateReport} className="mt-4">
              重新生成
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                {token.logo}
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-gray-800">
                  {token.name} ({token.symbol}) 深度研究报告
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-600">
                  AI生成的综合投资分析，包含技术指标、风险评估和投资建议
                </DialogDescription>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="rounded-full w-8 h-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          {/* 总体评分和建议 */}
          <Card className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200/50">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-indigo-600">{reportData.overallScore}</div>
                <div className="text-sm text-gray-600">综合评分</div>
              </div>
              <div className="text-center">
                <Badge className="bg-green-500 text-white border-0 text-sm px-3 py-1">
                  {reportData.recommendation}
                </Badge>
                <div className="text-sm text-gray-600 mt-1">投资建议</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-purple-600">{reportData.priceTarget}</div>
                <div className="text-sm text-gray-600">目标价格</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-blue-600">{reportData.timeframe}</div>
                <div className="text-sm text-gray-600">投资周期</div>
              </div>
            </div>
          </Card>

          {/* 关键指标 */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-indigo-500" />
              <h3 className="text-lg font-semibold text-gray-800">关键指标</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-gray-600">市值</div>
                <div className="text-lg font-semibold text-gray-800">{reportData.keyMetrics.marketCap}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">24h交易量</div>
                <div className="text-lg font-semibold text-gray-800">{reportData.keyMetrics.volume24h}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">持币地址</div>
                <div className="text-lg font-semibold text-gray-800">{reportData.keyMetrics.holders}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">TVL</div>
                <div className="text-lg font-semibold text-gray-800">{reportData.keyMetrics.tvl}</div>
              </div>
            </div>
          </Card>

          {/* 优势和风险 */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <h3 className="text-lg font-semibold text-gray-800">投资优势</h3>
              </div>
              <ul className="space-y-3">
                {reportData.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm text-gray-700">{strength}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                <h3 className="text-lg font-semibold text-gray-800">投资风险</h3>
              </div>
              <ul className="space-y-3">
                {reportData.risks.map((risk, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm text-gray-700">{risk}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          {/* 技术分析 */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-purple-500" />
              <h3 className="text-lg font-semibold text-gray-800">技术分析</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-gray-600">支撑位</div>
                <div className="text-lg font-semibold text-green-600">{reportData.technicalAnalysis.support}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">阻力位</div>
                <div className="text-lg font-semibold text-red-600">{reportData.technicalAnalysis.resistance}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">趋势</div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-lg font-semibold text-green-600">{reportData.technicalAnalysis.trend}</span>
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">RSI指标</div>
                <div className="text-lg font-semibold text-blue-600">{reportData.technicalAnalysis.rsi}</div>
              </div>
            </div>
          </Card>

          {/* 免责声明 */}
          <Card className="p-4 bg-gray-50/50 border border-gray-200/50">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-gray-600">
                <p className="font-medium mb-1">免责声明</p>
                <p>本报告由AI生成，仅供参考，不构成投资建议。加密货币投资存在重大风险，过往表现不代表未来收益。请在投资前充分了解相关风险，并根据自身情况做出投资决策。</p>
              </div>
            </div>
          </Card>
        </motion.div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}