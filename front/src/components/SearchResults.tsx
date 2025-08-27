import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { ResearchReport } from './ResearchReport';
import { Search, ArrowLeft, ExternalLink, TrendingUp, DollarSign, ChevronDown, ChevronUp, FileText, Twitter, BarChart3, Heart } from 'lucide-react';
import { motion } from 'motion/react';
import { TokenResult } from '../services/api';

interface SearchResultsProps {
  results: TokenResult[];
  isLoading?: boolean;
  onGenerateReport?: (token: TokenResult) => void;
  onAuthRequired?: () => void;
  onNewSearch?: () => void;
  query?: string;
}

export function SearchResults({
  results,
  isLoading = false,
  onGenerateReport,
  onAuthRequired,
  onNewSearch,
  query = ''
}: SearchResultsProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [selectedToken, setSelectedToken] = useState<TokenResult | null>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const tags = ['高增长潜力', 'DeFi生态', '低市值宝石', '稳定收益'];

  const toggleRowExpansion = (tokenId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(tokenId)) {
      newExpanded.delete(tokenId);
    } else {
      newExpanded.add(tokenId);
    }
    setExpandedRows(newExpanded);
  };

  const handleResearchClick = (token: TokenResult) => {
    setSelectedToken(token);
    setIsReportOpen(true);
  };

  const truncateText = (text: string, maxLength: number = 40) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="min-h-screen px-6 pt-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* 搜索区域 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          {/* 标题 */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
              AI驱动的智能代币推荐
            </h1>
            <p className="text-lg text-gray-600">
              输入您的投资需求，让AI为您匹配最相关的代币
            </p>
          </div>

          {/* 搜索框 */}
          <div className="relative max-w-3xl mx-auto">
            <div className="relative group">
              <Input
                value={query}
                readOnly
                className="w-full h-14 pl-6 pr-32 text-lg bg-white/80 backdrop-blur-sm border-2 border-gray-200/50 rounded-2xl shadow-lg"
              />
              <Button
                onClick={onNewSearch}
                className="absolute right-2 top-2 h-10 px-5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border-0"
              >
                <Search className="w-4 h-4 mr-2" />
                搜索
              </Button>
            </div>
          </div>

          {/* 标签按钮 */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {tags.map((tag) => (
              <Button
                key={tag}
                variant="outline"
                size="sm"
                className={`px-4 py-2 bg-white/60 backdrop-blur-sm border-2 rounded-xl shadow-sm transition-all duration-300 ${
                  tag === query 
                    ? 'border-purple-300 bg-purple-50/80 text-purple-700' 
                    : 'border-gray-200/50 hover:border-purple-300 hover:bg-purple-50/80 text-gray-700 hover:text-purple-700'
                }`}
              >
                {tag}
              </Button>
            ))}
          </div>
        </motion.div>

        {/* 搜索结果 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="bg-white/80 backdrop-blur-sm border-2 border-gray-200/50 shadow-xl rounded-3xl overflow-hidden">
            {/* 结果头部 */}
            <div className="px-8 py-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-200/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">为您推荐 {results.length} 个代币</h2>
                    <p className="text-sm text-gray-600">基于"{query}"的智能匹配结果</p>
                  </div>
                </div>
                <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 px-3 py-1 rounded-full">
                  高匹配度
                </Badge>
              </div>
            </div>

            {/* 代币结果表格 */}
            <div>
              {results.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center space-y-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full animate-spin flex items-center justify-center mx-auto">
                      <Search className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-gray-500">正在智能分析匹配...</p>
                  </div>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50/50 border-b border-gray-200/50 hover:bg-gray-50/50">
                        <TableHead className="w-16 text-center font-medium text-gray-600">序号</TableHead>
                        <TableHead className="w-32 text-center font-medium text-gray-600">代币</TableHead>
                        <TableHead className="w-32 text-center font-medium text-gray-600">名称</TableHead>
                        <TableHead className="text-center font-medium text-gray-600">描述</TableHead>
                        <TableHead className="w-24 text-center font-medium text-gray-600">流通量</TableHead>
                        <TableHead className="w-24 text-center font-medium text-gray-600">总量</TableHead>
                        <TableHead className="w-20 text-center font-medium text-gray-600">官网</TableHead>
                        <TableHead className="w-20 text-center font-medium text-gray-600">白皮书</TableHead>
                        <TableHead className="w-20 text-center font-medium text-gray-600">推特</TableHead>
                        <TableHead className="w-24 text-center font-medium text-gray-600">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {results.map((token, index) => {
                        const isExpanded = expandedRows.has(token.id);
                        const shouldTruncate = token.description.length > 40;
                        
                        return (
                          <motion.tr
                            key={token.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                            className="border-b border-gray-200/30 hover:bg-gray-50/30 transition-all duration-200"
                          >
                            <TableCell className="text-center">
                              <Badge variant="outline" className="w-8 h-8 rounded-full p-0 flex items-center justify-center border-gray-300 font-medium">
                                #{token.rank}
                              </Badge>
                            </TableCell>
                            
                            <TableCell className="text-center">
                              <div className="flex items-center justify-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                                  {token.logo}
                                </div>
                                <span className="font-semibold text-gray-800">{token.symbol}</span>
                              </div>
                            </TableCell>

                            <TableCell className="text-center font-medium text-gray-700">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  className="text-gray-400 hover:text-red-500 transition-colors duration-200"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // TODO: 实现收藏功能
                                  }}
                                  title="收藏代币"
                                >
                                  <Heart className="w-4 h-4" />
                                </button>
                                <span>{token.name}</span>
                              </div>
                            </TableCell>

                            <TableCell className="text-center">
                              <div className="flex items-center justify-center gap-2">
                                <span className="text-sm text-gray-600 flex-1 text-center">
                                  {isExpanded || !shouldTruncate 
                                    ? token.description 
                                    : truncateText(token.description)
                                  }
                                </span>
                                {shouldTruncate && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => toggleRowExpansion(token.id)}
                                    className="ml-2 h-6 w-6 p-0 rounded-full hover:bg-purple-100 flex-shrink-0"
                                  >
                                    {isExpanded ? (
                                      <ChevronUp className="w-4 h-4 text-purple-600" />
                                    ) : (
                                      <ChevronDown className="w-4 h-4 text-purple-600" />
                                    )}
                                  </Button>
                                )}
                              </div>
                            </TableCell>

                            <TableCell className="text-center">
                              <div className="flex items-center justify-center gap-1">
                                <DollarSign className="w-4 h-4 text-gray-400" />
                                <span className="font-medium text-gray-700">{token.circulatingSupply}</span>
                              </div>
                            </TableCell>

                            <TableCell className="text-center">
                              <div className="flex items-center justify-center gap-1">
                                <DollarSign className="w-4 h-4 text-gray-400" />
                                <span className="font-medium text-gray-700">{token.totalSupply}</span>
                              </div>
                            </TableCell>

                            <TableCell className="text-center">
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-8 h-8 p-0 rounded-full border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-all duration-300"
                                onClick={() => window.open(token.website, '_blank')}
                              >
                                <ExternalLink className="w-4 h-4 text-gray-600 hover:text-blue-600" />
                              </Button>
                            </TableCell>

                            <TableCell className="text-center">
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-8 h-8 p-0 rounded-full border-gray-300 hover:border-green-400 hover:bg-green-50 transition-all duration-300"
                                onClick={() => window.open(token.whitepaperUrl, '_blank')}
                              >
                                <FileText className="w-4 h-4 text-gray-600 hover:text-green-600" />
                              </Button>
                            </TableCell>

                            <TableCell className="text-center">
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-8 h-8 p-0 rounded-full border-gray-300 hover:border-sky-400 hover:bg-sky-50 transition-all duration-300"
                                onClick={() => window.open(token.twitterUrl, '_blank')}
                              >
                                <Twitter className="w-4 h-4 text-gray-600 hover:text-sky-600" />
                              </Button>
                            </TableCell>

                            <TableCell className="text-center">
                              <Button
                                size="sm"
                                onClick={() => handleResearchClick(token)}
                                className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white border-0 rounded-lg px-3 py-1.5 shadow-sm hover:shadow-md transition-all duration-300"
                              >
                                <BarChart3 className="w-4 h-4 mr-1" />
                                深度研究
                              </Button>
                            </TableCell>
                          </motion.tr>
                        );
                      })}
                    </TableBody>
                  </Table>
                </motion.div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* 返回按钮 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center"
        >
          <Button
            onClick={onNewSearch}
            variant="outline"
            className="px-6 py-3 bg-white/60 backdrop-blur-sm border-2 border-gray-200/50 hover:border-purple-300 hover:bg-purple-50/80 text-gray-700 hover:text-purple-700 rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回搜索
          </Button>
        </motion.div>
      </div>

      {/* 研究报告弹窗 */}
      <ResearchReport 
        token={selectedToken}
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
      />
    </div>
  );
}