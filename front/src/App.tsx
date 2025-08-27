import React, { useState } from 'react';
import { Header } from './components/Header';
import { SearchSection } from './components/SearchSection';
import { SearchResults } from './components/SearchResults';
import { ResearchReport } from './components/ResearchReport';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AuthModal } from './components/AuthModal';
import { AuthContext, useAuthProvider } from './hooks/useAuth';
import { useSearch } from './hooks/useSearch';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './components/ui/button';
import { User, LogOut, Heart, History } from 'lucide-react';

interface TokenResult {
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
}

function AppContent() {
  const { user, isAuthenticated, logout } = useAuthProvider();
  const { results, isLoading, hasSearched, search } = useSearch();
  const [selectedToken, setSelectedToken] = useState(null);
  const [showReport, setShowReport] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleSearch = (query: string) => {
    search(query);
  };

  const handleGenerateReport = (token: any) => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    setSelectedToken(token);
    setShowReport(true);
  };

  const handleAuthRequired = () => {
    setShowAuthModal(true);
  };

  const handleNewSearch = () => {
    // 这个功能由useSearch hook处理
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-indigo-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-400/20 to-purple-600/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-indigo-300/10 to-purple-300/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10">
        {/* 顶部导航栏 */}
        <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  AI 代币寻找引擎
                </h1>
              </div>

              <div className="flex items-center space-x-3">
                {isAuthenticated ? (
                  <>
                    <Button variant="ghost" size="sm" className="flex items-center gap-2">
                      <History className="w-4 h-4" />
                      历史记录
                    </Button>
                    <Button variant="ghost" size="sm" className="flex items-center gap-2">
                      <Heart className="w-4 h-4" />
                      收藏
                    </Button>
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {user?.username?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <span className="text-sm text-gray-700">{user?.username}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={logout}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <LogOut className="w-4 h-4" />
                      </Button>
                    </div>
                  </>
                ) : (
                  <Button
                    onClick={() => setShowAuthModal(true)}
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                  >
                    <User className="w-4 h-4 mr-2" />
                    登录/注册
                  </Button>
                )}
              </div>
            </div>
          </div>
        </nav>

        <Header />

        <AnimatePresence mode="wait">
          {!hasSearched ? (
            <motion.div
              key="search"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <SearchSection onSearch={handleSearch} />
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <SearchResults
                results={results}
                isLoading={isLoading}
                onGenerateReport={handleGenerateReport}
                onAuthRequired={handleAuthRequired}
                onNewSearch={handleNewSearch}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {showReport && selectedToken && (
          <ResearchReport
            token={selectedToken}
            onClose={() => setShowReport(false)}
          />
        )}
      </div>

      {/* 认证模态框 */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
}

export default function App() {
  const authProvider = useAuthProvider();

  return (
    <ErrorBoundary>
      <AuthContext.Provider value={authProvider}>
        <AppContent />
      </AuthContext.Provider>
    </ErrorBoundary>
  );
}
