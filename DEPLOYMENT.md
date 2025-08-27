# 🚀 AI代币寻找引擎 - 部署指南

## 📋 问题分析

### 🚨 **发现的关键问题**

1. **项目结构问题**
   - 前端代码在 `front/` 子目录中
   - Vercel默认期望前端代码在根目录
   - 缺少正确的Vercel配置

2. **package.json格式损坏**
   - JSON格式严重错误
   - 重复的依赖和scripts
   - 缺少必要的构建配置

3. **构建配置问题**
   - vite.config.ts缺少正确的base路径
   - 没有正确的输出目录配置

## 🔧 **修复方案**

### 1. **项目结构优化**
```
pipecone/
├── front/                 # 前端代码
│   ├── src/
│   ├── package.json      # 前端依赖
│   ├── vite.config.ts    # Vite配置
│   └── dist/             # 构建输出
├── api_server.py         # 后端API
├── package.json          # 根目录配置
├── vercel.json           # Vercel部署配置
└── requirements.txt      # Python依赖
```

### 2. **Vercel配置 (vercel.json)**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "front/package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "front/dist" }
    }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "/api_server.py" },
    { "src": "/(.*)", "dest": "/front/dist/$1" }
  ]
}
```

### 3. **构建命令**
```bash
# 本地构建测试
cd front
npm install
npm run build

# 检查构建输出
ls -la dist/
```

## 🌐 **Vercel部署步骤**

### **方法1: 通过Vercel CLI**
```bash
# 安装Vercel CLI
npm i -g vercel

# 登录Vercel
vercel login

# 部署项目
vercel --prod
```

### **方法2: 通过GitHub集成**
1. 将代码推送到GitHub
2. 在Vercel控制台连接GitHub仓库
3. 配置构建设置：
   - **Build Command**: `cd front && npm run build`
   - **Output Directory**: `front/dist`
   - **Install Command**: `cd front && npm install`

### **方法3: 手动上传**
1. 本地构建：`cd front && npm run build`
2. 将 `front/dist` 目录内容上传到Vercel

## ⚙️ **环境变量配置**

在Vercel控制台设置以下环境变量：

```env
# API配置
VITE_API_BASE_URL=https://your-domain.vercel.app
VITE_GEMINI_API_KEY=your_gemini_api_key

# 后端配置
CMC_API_KEY=your_coinmarketcap_api_key
PINECONE_API_KEY=your_pinecone_api_key
```

## 🔍 **故障排除**

### **404错误解决方案**

1. **检查构建输出**
   ```bash
   cd front
   npm run build
   ls -la dist/  # 确保有index.html
   ```

2. **检查Vercel配置**
   - 确保 `vercel.json` 在根目录
   - 确保路由配置正确

3. **检查package.json**
   - 确保JSON格式正确
   - 确保构建脚本正确

### **常见问题**

**Q: 页面显示404**
A: 检查构建输出目录和Vercel路由配置

**Q: API调用失败**
A: 检查环境变量和API路由配置

**Q: 构建失败**
A: 检查package.json格式和依赖版本

## 📊 **验证部署**

部署成功后，访问以下URL验证：

- **前端**: `https://your-domain.vercel.app`
- **API健康检查**: `https://your-domain.vercel.app/api/health`
- **搜索API**: `https://your-domain.vercel.app/api/search`

## 🎯 **性能优化**

1. **启用压缩**
2. **配置CDN缓存**
3. **优化图片资源**
4. **代码分割**

---

## 📝 **部署检查清单**

- [ ] package.json格式正确
- [ ] vercel.json配置完整
- [ ] 环境变量已设置
- [ ] 本地构建成功
- [ ] API路由配置正确
- [ ] 前端路由配置正确
- [ ] 依赖版本兼容

**部署完成后，404错误应该得到解决！** 🎉
