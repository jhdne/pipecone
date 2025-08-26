# GitHub Actions 权限配置指南

## 🔍 当前问题

GitHub Actions 工作流在尝试推送文件时遇到权限错误：

```
remote: Permission to jhdne/pipecone.git denied to github-actions[bot].
fatal: unable to access 'https://github.com/jhdne/pipecone/': The requested URL returned error: 403
```

## 🔧 解决方案

### 方法1: 配置 Repository 权限（推荐）

1. **进入仓库设置**：
   - 打开 GitHub 仓库：`https://github.com/jhdne/pipecone`
   - 点击 **Settings** 标签

2. **配置 Actions 权限**：
   - 在左侧菜单中找到 **Actions** → **General**
   - 在 **Workflow permissions** 部分：
     - 选择 **Read and write permissions**
     - 勾选 **Allow GitHub Actions to create and approve pull requests**
   - 点击 **Save** 保存设置

### 方法2: 修改 Workflow 文件

在 `.github/workflows/` 目录下的工作流文件中添加权限配置：

```yaml
name: Full Sync

on:
  workflow_dispatch:
  schedule:
    - cron: '0 0 * * *'

permissions:
  contents: write  # 允许写入仓库内容
  actions: read    # 允许读取 actions

jobs:
  full_sync:
    runs-on: ubuntu-latest
    
    steps:
    # ... 其他步骤 ...
```

### 方法3: 使用 Personal Access Token（备选）

如果上述方法不起作用，可以创建 Personal Access Token：

1. **创建 PAT**：
   - 访问 GitHub Settings → Developer settings → Personal access tokens
   - 创建新的 token，授予 `repo` 权限

2. **添加到 Repository Secrets**：
   - 在仓库 Settings → Secrets and variables → Actions
   - 添加名为 `GITHUB_TOKEN` 的 secret，值为创建的 PAT

3. **修改 checkout action**：
   ```yaml
   - uses: actions/checkout@v4
     with:
       token: ${{ secrets.GITHUB_TOKEN }}
   ```

## 🎯 推荐操作

**建议使用方法1**，这是最简单且安全的方式：

1. 进入仓库 Settings → Actions → General
2. 选择 "Read and write permissions"
3. 保存设置
4. 重新运行工作流

## 📋 验证修复

配置权限后，重新运行 GitHub Actions 工作流，应该能看到：

```
✅ 成功将 100 个 UCID 保存到快照文件: ucids_snapshot.json
[main abc1234] Create initial ucids_snapshot.json via GitHub Actions
 1 file changed, 1 insertion(+)
 create mode 100644 ucids_snapshot.json
✅ 文件成功推送到仓库
```

## 🚀 完整流程预期

修复权限问题后，完整的工作流应该能够：

1. ✅ 获取 CoinMarketCap 数据
2. ✅ 处理和清洗数据
3. ✅ 分批调用 Pinecone API 进行向量化（每批96条）
4. ✅ 将向量数据存储到 Pinecone 数据库
5. ✅ 生成并推送 ucids_snapshot.json 文件
6. ✅ 完成整个数据同步流程

配置好权限后，项目就能完全正常运行了！
