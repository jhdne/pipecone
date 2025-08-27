import React from 'react';

function TestApp() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          🚀 AI代币寻找引擎
        </h1>
        <p className="text-xl text-gray-600">
          前端测试页面 - 基础功能正常
        </p>
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
          <h2 className="text-lg font-semibold mb-4">系统状态</h2>
          <div className="space-y-2 text-left">
            <div className="flex justify-between">
              <span>React:</span>
              <span className="text-green-600">✅ 正常</span>
            </div>
            <div className="flex justify-between">
              <span>TypeScript:</span>
              <span className="text-green-600">✅ 正常</span>
            </div>
            <div className="flex justify-between">
              <span>Tailwind CSS:</span>
              <span className="text-green-600">✅ 正常</span>
            </div>
            <div className="flex justify-between">
              <span>Vite:</span>
              <span className="text-green-600">✅ 正常</span>
            </div>
          </div>
        </div>
        <button 
          className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-200"
          onClick={() => alert('前端基础功能正常！')}
        >
          测试点击
        </button>
      </div>
    </div>
  );
}

export default TestApp;
