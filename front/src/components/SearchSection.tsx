import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Search, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface SearchSectionProps {
  onSearch: (query: string) => void;
}

export function SearchSection({ onSearch }: SearchSectionProps) {
  const [searchValue, setSearchValue] = useState('');

  const tags = [
    '好的叙事背景', '实力团队', '技术创新', '启动和分配公平',
    '真实产品或用例', '清晰的路线图', '代币通缩', '开发者活跃'
  ];

  const handleSearch = () => {
    if (searchValue.trim()) {
      onSearch(searchValue);
    }
  };

  const handleTagClick = (tag: string) => {
    setSearchValue(tag);
    onSearch(tag);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-6">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        {/* 主标题 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-8 h-8 text-purple-500" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent leading-tight">
            AI驱动的智能代币寻找引擎
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            输入您的代币要求，让AI为您寻找最相关的代币
          </p>
        </motion.div>

        {/* 搜索框 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative max-w-2xl mx-auto"
        >
          <div className="relative group">
            <Input
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="输入您的代币要求..."
              className="w-full h-16 pl-6 pr-32 text-lg bg-white/80 backdrop-blur-sm border-2 border-gray-200/50 rounded-2xl shadow-lg hover:shadow-xl focus:shadow-xl transition-all duration-300 focus:border-purple-300"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button
              onClick={handleSearch}
              className="absolute right-2 top-2 h-12 px-6 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border-0"
            >
              <Search className="w-5 h-5 mr-2" />
              寻找
            </Button>
          </div>
        </motion.div>

        {/* 标签按钮 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-wrap items-center justify-center gap-4"
        >
          {tags.map((tag, index) => (
            <motion.div
              key={tag}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
            >
              <Button
                variant="outline"
                onClick={() => handleTagClick(tag)}
                className="px-6 py-3 bg-white/60 backdrop-blur-sm border-2 border-gray-200/50 hover:border-purple-300 hover:bg-purple-50/80 text-gray-700 hover:text-purple-700 rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
              >
                {tag}
              </Button>
            </motion.div>
          ))}
        </motion.div>

        {/* 底部装饰区域 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="mt-16"
        >
          <div className="flex items-center justify-center space-x-16">
            {/* 左侧文字 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 1.4 }}
              className="text-center"
            >
              <p className="text-lg font-medium text-gray-600 mb-2">自主寻找优质代币</p>
              <div className="w-16 h-0.5 bg-gradient-to-r from-indigo-400 to-purple-400 mx-auto"></div>
            </motion.div>

            {/* 中央搜索图标 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 1.3 }}
              className="opacity-30"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <Search className="w-10 h-10 text-white" />
              </div>
            </motion.div>

            {/* 右侧文字 */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 1.4 }}
              className="text-center"
            >
              <p className="text-lg font-medium text-gray-600 mb-2">全市场代币覆盖</p>
              <div className="w-16 h-0.5 bg-gradient-to-r from-purple-400 to-indigo-400 mx-auto"></div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}