import React from 'react';
import { Button } from './ui/button';
import { Settings, LogIn } from 'lucide-react';

export function Header() {
  return (
    <header className="w-full px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Settings className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Report AI
            </h1>
            <p className="text-sm text-gray-500">智能寻找代币引擎</p>
          </div>
        </div>

        {/* Login Button */}
        <Button 
          className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-0"
        >
          <LogIn className="w-4 h-4 mr-2" />
          登录
        </Button>
      </div>
    </header>
  );
}