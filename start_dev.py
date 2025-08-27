#!/usr/bin/env python3
"""
开发环境启动脚本
"""

import subprocess
import sys
import os
import time
import threading
from pathlib import Path

def run_frontend():
    """启动前端开发服务器"""
    print("🚀 启动前端开发服务器...")
    try:
        # 检查是否安装了依赖
        if not Path("node_modules").exists():
            print("📦 安装前端依赖...")
            subprocess.run(["npm", "install"], check=True)
        
        # 启动前端
        subprocess.run(["npm", "run", "dev"], check=True)
    except subprocess.CalledProcessError as e:
        print(f"❌ 前端启动失败: {e}")
    except KeyboardInterrupt:
        print("\n🛑 前端服务器已停止")

def run_backend():
    """启动后端API服务器"""
    print("🚀 启动后端API服务器...")
    try:
        # 检查Python依赖
        try:
            import flask
            import flask_cors
        except ImportError:
            print("📦 安装后端依赖...")
            subprocess.run([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"], check=True)
        
        # 启动后端
        subprocess.run([sys.executable, "api_server.py"], check=True)
    except subprocess.CalledProcessError as e:
        print(f"❌ 后端启动失败: {e}")
    except KeyboardInterrupt:
        print("\n🛑 后端服务器已停止")

def main():
    """主函数"""
    print("🎯 AI代币寻找引擎 - 开发环境启动")
    print("=" * 50)
    
    # 检查环境
    if not Path("package.json").exists():
        print("❌ 未找到package.json，请确保在项目根目录运行")
        return
    
    if not Path("api_server.py").exists():
        print("❌ 未找到api_server.py，请确保后端文件存在")
        return
    
    print("选择启动模式:")
    print("1. 仅前端 (端口3000)")
    print("2. 仅后端 (端口8000)")
    print("3. 前后端同时启动")
    print("4. 构建前端")
    
    choice = input("\n请选择 (1-4): ").strip()
    
    if choice == "1":
        run_frontend()
    elif choice == "2":
        run_backend()
    elif choice == "3":
        print("🚀 同时启动前后端服务...")
        
        # 创建线程分别启动前后端
        backend_thread = threading.Thread(target=run_backend)
        frontend_thread = threading.Thread(target=run_frontend)
        
        backend_thread.daemon = True
        frontend_thread.daemon = True
        
        backend_thread.start()
        time.sleep(2)  # 等待后端启动
        frontend_thread.start()
        
        try:
            # 等待线程结束
            backend_thread.join()
            frontend_thread.join()
        except KeyboardInterrupt:
            print("\n🛑 所有服务已停止")
    elif choice == "4":
        print("🔨 构建前端...")
        try:
            subprocess.run(["npm", "run", "build"], check=True)
            print("✅ 构建完成！输出目录: dist/")
        except subprocess.CalledProcessError as e:
            print(f"❌ 构建失败: {e}")
    else:
        print("❌ 无效选择")

if __name__ == "__main__":
    main()
