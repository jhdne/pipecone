import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // 发送错误到监控服务
    this.logErrorToService(error, errorInfo);
  }

  private logErrorToService(error: Error, errorInfo: ErrorInfo) {
    // 这里可以集成错误监控服务如 Sentry
    console.error('Error caught by boundary:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString()
    });

    // 可以发送到后端API
    try {
      fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          userAgent: navigator.userAgent,
          url: window.location.href,
          timestamp: new Date().toISOString()
        })
      }).catch(() => {
        // 静默处理错误报告失败
      });
    } catch {
      // 静默处理
    }
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-6">
          <Card className="max-w-lg w-full p-8 text-center space-y-6 shadow-xl">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">
                出现了一些问题
              </h2>
              <p className="text-gray-600">
                应用遇到了意外错误，我们已经记录了这个问题。
              </p>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="bg-gray-100 p-4 rounded-lg text-left">
                <p className="text-sm font-mono text-red-600 mb-2">
                  {this.state.error.message}
                </p>
                <details className="text-xs text-gray-600">
                  <summary className="cursor-pointer mb-2">查看详细信息</summary>
                  <pre className="whitespace-pre-wrap">
                    {this.state.error.stack}
                  </pre>
                </details>
              </div>
            )}

            <div className="flex gap-3 justify-center">
              <Button
                onClick={this.handleRetry}
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                重试
              </Button>
              <Button
                variant="outline"
                onClick={this.handleGoHome}
                className="flex items-center gap-2"
              >
                <Home className="w-4 h-4" />
                返回首页
              </Button>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// 网络错误处理Hook
export const useErrorHandler = () => {
  const handleError = (error: any, context?: string) => {
    console.error(`Error in ${context || 'unknown context'}:`, error);
    
    // 可以在这里添加toast通知
    // toast.error(getErrorMessage(error));
  };

  const getErrorMessage = (error: any): string => {
    if (error?.status === 429) {
      return '请求过于频繁，请稍后再试';
    }
    if (error?.status === 500) {
      return '服务器错误，请稍后再试';
    }
    if (error?.status === 404) {
      return '请求的资源不存在';
    }
    if (error?.message) {
      return error.message;
    }
    return '发生了未知错误';
  };

  return { handleError, getErrorMessage };
};
